/**
 * Atlas Gastronomic — Deterministic Recipe Validation Engine
 * 
 * Implements deterministic validation rules:
 * - Errors: Structural and relational violations preventing valid draft persistence.
 * - Warnings: Editorial reminders (e.g., unreferenced ingredients, missing cues).
 * 
 * Note: Automated validation verifies structural and referential integrity;
 * it does NOT guarantee culinary or sensory correctness.
 */

import { Recipe, RecipeValidationResult, ValidationIssue } from './types.js';

export function validateRecipe(recipe: Partial<Recipe>): RecipeValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // 1. Title Validation
  if (!recipe.title || recipe.title.trim().length === 0) {
    errors.push({
      code: 'ERR_TITLE_REQUIRED',
      field: 'title',
      message: 'Titlul rețetei este obligatoriu.',
      severity: 'error',
    });
  } else if (recipe.title.trim().length < 3) {
    errors.push({
      code: 'ERR_TITLE_TOO_SHORT',
      field: 'title',
      message: 'Titlul rețetei trebuie să aibă cel puțin 3 caractere.',
      severity: 'error',
    });
  }

  // 2. Ingredients Validation
  const ingredients = recipe.ingredients || [];
  if (ingredients.length === 0) {
    errors.push({
      code: 'ERR_INGREDIENTS_EMPTY',
      field: 'ingredients',
      message: 'Rețeta trebuie să conțină cel puțin un ingredient.',
      severity: 'error',
    });
  } else {
    const ingredientIds = new Set<string>();

    ingredients.forEach((ing, index) => {
      const idxLabel = index + 1;

      // Ingredient name
      if (!ing.name || ing.name.trim().length === 0) {
        errors.push({
          code: 'ERR_INGREDIENT_NAME_REQUIRED',
          field: `ingredients[${index}].name`,
          message: `Ingredientul #${idxLabel} nu are denumire specificată.`,
          severity: 'error',
        });
      }

      // Identifier uniqueness
      const refId = ing.ingredient_id || ing.id;
      if (refId) {
        if (ingredientIds.has(refId)) {
          errors.push({
            code: 'ERR_INGREDIENT_ID_DUPLICATE',
            field: `ingredients[${index}].ingredient_id`,
            message: `Identificatorul de ingredient "${refId}" este duplicat.`,
            severity: 'error',
          });
        }
        ingredientIds.add(refId);
      }

      // Quantity & Unit checks
      if (!ing.optional && (ing.quantity === null || ing.quantity === undefined)) {
        errors.push({
          code: 'ERR_INGREDIENT_QUANTITY_REQUIRED',
          field: `ingredients[${index}].quantity`,
          message: `Ingredientul #${idxLabel} („${ing.name || 'nespecificat'}”) este marcat ca obligatoriu, dar nu are cantitate numerică.`,
          severity: 'error',
        });
      } else if (ing.quantity !== null && ing.quantity !== undefined && ing.quantity <= 0) {
        errors.push({
          code: 'ERR_INGREDIENT_QUANTITY_POSITIVE',
          field: `ingredients[${index}].quantity`,
          message: `Cantitatea pentru ingredientul #${idxLabel} trebuie să fie un număr pozitiv strict mai mare decât zero.`,
          severity: 'error',
        });
      }

      if (ing.quantity !== null && ing.quantity !== undefined && (!ing.unit || ing.unit.trim().length === 0)) {
        errors.push({
          code: 'ERR_INGREDIENT_UNIT_REQUIRED',
          field: `ingredients[${index}].unit`,
          message: `Ingredientul #${idxLabel} („${ing.name || 'nespecificat'}”) are cantitate numerică, dar lipsește unitatea de măsură.`,
          severity: 'error',
        });
      }
    });
  }

  // 3. Steps Validation
  const steps = recipe.steps || [];
  if (steps.length === 0) {
    errors.push({
      code: 'ERR_STEPS_EMPTY',
      field: 'steps',
      message: 'Rețeta trebuie să conțină cel puțin un pas procedural de preparare.',
      severity: 'error',
    });
  } else {
    const declaredIngredientRefs = new Set(
      ingredients.map((ing) => ing.ingredient_id || ing.id).filter(Boolean)
    );
    const referencedIngredientSet = new Set<string>();

    // Step numbers must start at 1 and be sequentially ordered
    steps.forEach((step, index) => {
      const expectedStepNumber = index + 1;
      if (step.step_number !== expectedStepNumber) {
        errors.push({
          code: 'ERR_STEP_ORDER_INVALID',
          field: `steps[${index}].step_number`,
          message: `Numerotarea pasului #${index + 1} este invalidă (găsit: ${step.step_number}, așteptat: ${expectedStepNumber}).`,
          severity: 'error',
        });
      }

      // Instruction text
      if (!step.instruction || step.instruction.trim().length === 0) {
        errors.push({
          code: 'ERR_STEP_INSTRUCTION_EMPTY',
          field: `steps[${index}].instruction`,
          message: `Pasul #${step.step_number || index + 1} nu conține instrucțiuni de preparare.`,
          severity: 'error',
        });
      } else if (step.instruction.trim().length < 5) {
        errors.push({
          code: 'ERR_STEP_INSTRUCTION_TOO_SHORT',
          field: `steps[${index}].instruction`,
          message: `Instrucțiunea pasului #${step.step_number || index + 1} este prea succintă (minim 5 caractere).`,
          severity: 'error',
        });
      }

      // Check ingredient associations
      const refs = step.ingredient_refs || [];
      refs.forEach((ref) => {
        if (!declaredIngredientRefs.has(ref)) {
          errors.push({
            code: 'ERR_STEP_INVALID_INGREDIENT_REF',
            field: `steps[${index}].ingredient_refs`,
            message: `Pasul #${step.step_number || index + 1} referă un ingredient („${ref}”) care nu este declarat în lista de ingrediente a acestei rețete.`,
            severity: 'error',
          });
        } else {
          referencedIngredientSet.add(ref);
        }
      });

      // Optional duration checks
      if (step.duration_minutes !== null && step.duration_minutes !== undefined && step.duration_minutes < 0) {
        errors.push({
          code: 'ERR_STEP_DURATION_NEGATIVE',
          field: `steps[${index}].duration_minutes`,
          message: `Durata pasului #${step.step_number || index + 1} nu poate fi negativă.`,
          severity: 'error',
        });
      }
    });

    // 4. Warning: Declared ingredients never referenced in any step
    ingredients.forEach((ing) => {
      const refId = ing.ingredient_id || ing.id;
      if (refId && !referencedIngredientSet.has(refId)) {
        warnings.push({
          code: 'WARN_INGREDIENT_NOT_REFERENCED',
          field: `ingredients`,
          message: `Ingredientul „${ing.name || refId}” este declarat în rețetă, dar nu este menționat în niciun pas de preparare (posibil garnitură, servire opțională sau pas omis).`,
          severity: 'warning',
        });
      }
    });
  }

  // 5. Yield and Timing Warnings (Non-blocking editorial recommendations)
  if (!recipe.yield || !recipe.yield.quantity || recipe.yield.quantity <= 0) {
    warnings.push({
      code: 'WARN_YIELD_UNSPECIFIED',
      field: 'yield.quantity',
      message: 'Numărul de porții nu este specificat sau este 0.',
      severity: 'warning',
    });
  }

  if (!recipe.summary || recipe.summary.trim().length === 0) {
    warnings.push({
      code: 'WARN_SUMMARY_EMPTY',
      field: 'summary',
      message: 'Recomandat: adăugați o scurtă descriere editorială sau context gastronomic.',
      severity: 'warning',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
