/**
 * Atlas Gastronomic — Deterministic Recipe Validation Engine
 * 
 * Implements deterministic validation rules:
 * - Errors: Structural and relational violations preventing valid draft persistence.
 * - Warnings: Editorial reminders (e.g., unreferenced ingredients, timing discrepancies).
 * 
 * Fully compatible with Recipe Core V1 and extends with Phase 002-D Recipe Core V2 MVP rules:
 * - DAG cycle & dangling reference checks for depends_on
 * - Uniqueness and stability for step_id
 * - Non-blocking semantic timing comparisons (when justified)
 * - Safe ingredient allocation checks (only when units are compatible)
 * - Thermal constraint measurement point and range validation
 * - 4-category typed risk taxonomy validation
 */

import { Recipe, RecipeValidationResult, ValidationIssue, StepRiskType, ThermalMeasurementPoint, ThermalConstraintType } from './types.js';

const VALID_RISK_TYPES: StepRiskType[] = ['culinary_quality', 'irreversible_risk', 'food_safety', 'haccp_ccp'];
const VALID_MEASUREMENT_POINTS: ThermalMeasurementPoint[] = ['equipment', 'surface', 'product_core'];
const VALID_CONSTRAINT_TYPES: ThermalConstraintType[] = ['technological_target', 'quality_threshold', 'food_safety_threshold'];

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
  const declaredIngredientRefs = new Set<string>();
  const ingredientMap = new Map<string, (typeof ingredients)[0]>();

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
        declaredIngredientRefs.add(refId);
        ingredientMap.set(refId, ing);
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
    const referencedIngredientSet = new Set<string>();
    const seenStepIds = new Set<string>();

    // Step identifiers mapping for DAG validation
    // Map each step's identifiable handles to its index
    const stepIdentifierToIndex = new Map<string, number>();

    steps.forEach((step, index) => {
      // Step numbers must start at 1 and be sequentially ordered
      const expectedStepNumber = index + 1;
      if (step.step_number !== expectedStepNumber) {
        errors.push({
          code: 'ERR_STEP_ORDER_INVALID',
          field: `steps[${index}].step_number`,
          message: `Numerotarea pasului #${index + 1} este invalidă (găsit: ${step.step_number}, așteptat: ${expectedStepNumber}).`,
          severity: 'error',
        });
      }

      // Step ID uniqueness (V2)
      if (step.step_id !== undefined && step.step_id !== null) {
        const trimmedStepId = step.step_id.trim();
        if (trimmedStepId.length === 0) {
          errors.push({
            code: 'ERR_STEP_ID_EMPTY',
            field: `steps[${index}].step_id`,
            message: `Identificatorul pasului #${step.step_number || index + 1} nu poate fi vid dacă este declarat.`,
            severity: 'error',
          });
        } else if (seenStepIds.has(trimmedStepId)) {
          errors.push({
            code: 'ERR_STEP_ID_DUPLICATE',
            field: `steps[${index}].step_id`,
            message: `Identificatorul de pas "${trimmedStepId}" este duplicat.`,
            severity: 'error',
          });
        } else {
          seenStepIds.add(trimmedStepId);
          stepIdentifierToIndex.set(trimmedStepId, index);
        }
      }

      if (step.id) {
        stepIdentifierToIndex.set(step.id, index);
      }
      stepIdentifierToIndex.set(String(step.step_number || index + 1), index);
      stepIdentifierToIndex.set(`step_${step.step_number || index + 1}`, index);

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

      // Duration checks
      if (step.duration_minutes !== null && step.duration_minutes !== undefined && step.duration_minutes < 0) {
        errors.push({
          code: 'ERR_STEP_DURATION_NEGATIVE',
          field: `steps[${index}].duration_minutes`,
          message: `Durata pasului #${step.step_number || index + 1} nu poate fi negativă.`,
          severity: 'error',
        });
      }

      // V2 Temporal semantics checks
      if (step.active_minutes !== null && step.active_minutes !== undefined && step.active_minutes < 0) {
        errors.push({
          code: 'ERR_STEP_DURATION_NEGATIVE',
          field: `steps[${index}].active_minutes`,
          message: `Timpul activ al pasului #${step.step_number || index + 1} nu poate fi negativ.`,
          severity: 'error',
        });
      }
      if (step.passive_minutes !== null && step.passive_minutes !== undefined && step.passive_minutes < 0) {
        errors.push({
          code: 'ERR_STEP_DURATION_NEGATIVE',
          field: `steps[${index}].passive_minutes`,
          message: `Timpul pasiv al pasului #${step.step_number || index + 1} nu poate fi negativ.`,
          severity: 'error',
        });
      }

      // Timing comparison: only when active, passive, AND duration are all defined numbers
      if (
        typeof step.duration_minutes === 'number' &&
        typeof step.active_minutes === 'number' &&
        typeof step.passive_minutes === 'number'
      ) {
        if (step.active_minutes + step.passive_minutes > step.duration_minutes) {
          warnings.push({
            code: 'WARN_STEP_TIMING_DISCREPANCY',
            field: `steps[${index}].duration_minutes`,
            message: `Pasul #${step.step_number || index + 1}: suma timpului activ (${step.active_minutes} min) și pasiv (${step.passive_minutes} min) depășește durata totală a pasului (${step.duration_minutes} min).`,
            severity: 'warning',
          });
        }
      }

      // V2 Step Ingredient Allocations
      if (step.allocations && Array.isArray(step.allocations)) {
        step.allocations.forEach((alloc, allocIdx) => {
          if (!declaredIngredientRefs.has(alloc.ingredient_id)) {
            errors.push({
              code: 'ERR_STEP_INVALID_INGREDIENT_REF',
              field: `steps[${index}].allocations[${allocIdx}].ingredient_id`,
              message: `Pasul #${step.step_number || index + 1} alocă ingredientul („${alloc.ingredient_id}”) care nu este declarat în rețetă.`,
              severity: 'error',
            });
          } else {
            referencedIngredientSet.add(alloc.ingredient_id);
          }

          if (typeof alloc.quantity_used_in_step === 'number' && alloc.quantity_used_in_step < 0) {
            errors.push({
              code: 'ERR_ALLOCATION_QUANTITY_NEGATIVE',
              field: `steps[${index}].allocations[${allocIdx}].quantity_used_in_step`,
              message: `Cantitatea alocată la pasul #${step.step_number || index + 1} pentru „${alloc.ingredient_id}” nu poate fi negativă.`,
              severity: 'error',
            });
          }
        });
      }

      // V2 Thermal Constraints
      if (step.thermal_constraints && Array.isArray(step.thermal_constraints)) {
        step.thermal_constraints.forEach((tc, tcIdx) => {
          if (!VALID_MEASUREMENT_POINTS.includes(tc.measurement_point)) {
            errors.push({
              code: 'ERR_INVALID_MEASUREMENT_POINT',
              field: `steps[${index}].thermal_constraints[${tcIdx}].measurement_point`,
              message: `Punct de măsurare termică invalid: "${tc.measurement_point}". Valori permise: equipment, surface, product_core.`,
              severity: 'error',
            });
          }

          if (!VALID_CONSTRAINT_TYPES.includes(tc.constraint_type)) {
            errors.push({
              code: 'ERR_INVALID_CONSTRAINT_TYPE',
              field: `steps[${index}].thermal_constraints[${tcIdx}].constraint_type`,
              message: `Tip de constrângere termică invalid: "${tc.constraint_type}". Valori permise: technological_target, quality_threshold, food_safety_threshold.`,
              severity: 'error',
            });
          }

          if (typeof tc.min_c === 'number' && typeof tc.max_c === 'number' && tc.min_c > tc.max_c) {
            errors.push({
              code: 'ERR_THERMAL_RANGE_INVALID',
              field: `steps[${index}].thermal_constraints[${tcIdx}]`,
              message: `Interval termic invalid la pasul #${step.step_number || index + 1}: temperatura minimă (${tc.min_c}°C) depășește maxima (${tc.max_c}°C).`,
              severity: 'error',
            });
          }
        });
      }

      // V2 Risks Taxonomy
      if (step.risks && Array.isArray(step.risks)) {
        step.risks.forEach((risk, rIdx) => {
          if (!VALID_RISK_TYPES.includes(risk.warning_type)) {
            errors.push({
              code: 'ERR_INVALID_RISK_TYPE',
              field: `steps[${index}].risks[${rIdx}].warning_type`,
              message: `Tip de risc culinar necunoscut: "${risk.warning_type}". Valori permise: culinary_quality, irreversible_risk, food_safety, haccp_ccp.`,
              severity: 'error',
            });
          }

          if (!risk.message || risk.message.trim().length === 0) {
            errors.push({
              code: 'ERR_RISK_MESSAGE_REQUIRED',
              field: `steps[${index}].risks[${rIdx}].message`,
              message: `Mesajul de risc la pasul #${step.step_number || index + 1} este obligatoriu.`,
              severity: 'error',
            });
          }
        });
      }
    });

    // 4. DAG & Dependency Validation (V2)
    // Build adjacency list for cycle detection: nodeIndex -> targetIndices it depends on
    const graph = new Map<number, number[]>();
    for (let i = 0; i < steps.length; i++) {
      graph.set(i, []);
    }

    steps.forEach((step, index) => {
      // If depends_on is explicitly specified as an array
      if (step.depends_on !== undefined && step.depends_on !== null) {
        if (Array.isArray(step.depends_on)) {
          if (step.depends_on.length === 0) {
            // Independent parallel root (T=0): does NOT depend on previous step
          } else {
            step.depends_on.forEach((dep) => {
              if (typeof dep === 'string') {
                const targetIndex = stepIdentifierToIndex.get(dep.trim());
                if (targetIndex === undefined) {
                  errors.push({
                    code: 'ERR_DANGLING_STEP_REFERENCE',
                    field: `steps[${index}].depends_on`,
                    message: `Pasul #${step.step_number || index + 1} depinde de pasul inexistent "${dep}".`,
                    severity: 'error',
                  });
                } else if (targetIndex === index) {
                  errors.push({
                    code: 'ERR_SELF_DEPENDENCY',
                    field: `steps[${index}].depends_on`,
                    message: `Pasul #${step.step_number || index + 1} nu poate depinde de el însuși.`,
                    severity: 'error',
                  });
                } else {
                  graph.get(index)!.push(targetIndex);
                }
              }
            });
          }
        }
      } else {
        // Implicit sequential dependency: absent (undefined) or null means step implicitly follows previous step (index - 1)
        if (index > 0) {
          graph.get(index)!.push(index - 1);
        }
      }
    });

    // Cycle detection via DFS
    const visited = new Uint8Array(steps.length); // 0 = unvisited, 1 = visiting (in stack), 2 = visited
    let hasCycle = false;

    function detectCycle(u: number): boolean {
      visited[u] = 1;
      const neighbors = graph.get(u) || [];
      for (const v of neighbors) {
        if (visited[v] === 1) {
          return true; // back-edge = cycle
        }
        if (visited[v] === 0) {
          if (detectCycle(v)) return true;
        }
      }
      visited[u] = 2;
      return false;
    }

    for (let i = 0; i < steps.length; i++) {
      if (visited[i] === 0) {
        if (detectCycle(i)) {
          hasCycle = true;
          break;
        }
      }
    }

    if (hasCycle) {
      errors.push({
        code: 'ERR_CYCLIC_DEPENDENCY',
        field: 'steps.depends_on',
        message: 'A fost detectată o dependență circulară între pașii rețetei (ciclul blochează ordinea de execuție).',
        severity: 'error',
      });
    }

    // 5. Aggregate Ingredient Allocation Comparisons (Condition 3: safe comparison)
    // "Alocările de ingrediente se compară numai când unitățile sunt compatibile și conversiile sunt definite.
    // În caz contrar, rezultatul este „nedeterminabil”, nu eroare."
    ingredients.forEach((ing) => {
      const ingId = ing.ingredient_id || ing.id;
      if (!ingId) return;

      if (typeof ing.quantity === 'number' && ing.quantity > 0 && ing.unit) {
        const declaredUnit = ing.unit.trim().toLowerCase();
        let totalAllocated = 0;
        let isDeterminate = true;
        let hasAllocations = false;

        steps.forEach((step) => {
          if (step.allocations && Array.isArray(step.allocations)) {
            step.allocations.forEach((alloc) => {
              if (alloc.ingredient_id === ingId && typeof alloc.quantity_used_in_step === 'number') {
                hasAllocations = true;
                const allocUnit = (alloc.unit || '').trim().toLowerCase();
                if (allocUnit !== declaredUnit) {
                  // Units differ without built-in conversion -> indeterminate!
                  isDeterminate = false;
                } else {
                  totalAllocated += alloc.quantity_used_in_step;
                }
              }
            });
          }
        });

        if (hasAllocations && isDeterminate) {
          // Compare with float tolerance
          if (totalAllocated > ing.quantity + 0.0001) {
            warnings.push({
              code: 'WARN_INGREDIENT_ALLOCATION_EXCEEDED',
              field: `ingredients`,
              message: `Ingredientul „${ing.name || ingId}”: suma cantităților alocate pe pași (${totalAllocated} ${ing.unit}) depășește cantitatea din inventar (${ing.quantity} ${ing.unit}). Verificați pierderile sau rezervele de atelier.`,
              severity: 'warning',
            });
          }
        }
      }
    });

    // 6. Warning: Declared ingredients never referenced in any step
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

  // 7. Recipe Timing & Lead Time Validation (V2)
  if (recipe.timing?.lead_time_hours !== undefined && recipe.timing?.lead_time_hours !== null) {
    if (recipe.timing.lead_time_hours < 0) {
      errors.push({
        code: 'ERR_LEAD_TIME_NEGATIVE',
        field: 'timing.lead_time_hours',
        message: 'Timpul de maturare/așteptare (lead_time_hours) nu poate fi negativ.',
        severity: 'error',
      });
    }
  }

  // 8. Yield and Timing Warnings (Non-blocking editorial recommendations)
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
