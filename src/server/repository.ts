import { DatabaseSync } from 'node:sqlite';
import { Recipe, RecipeIngredient, RecipeStep, StepIngredientAllocation } from '../shared/types.js';
import { insertRecipeIntoDb } from './db.js';

export interface RecipeListItem {
  id: string;
  recipe_id: string;
  version: string;
  title: string;
  summary: string;
  culinary_tradition: string | null;
  region: string | null;
  category: string;
  status: string;
  yield_quantity: number;
  yield_unit: string;
  total_minutes: number | null;
  lead_time_hours?: number | null;
  difficulty: string | null;
  ingredients_count: number;
  steps_count: number;
  created_at: string;
  updated_at: string;
}

export class RecipeRepository {
  constructor(private db: DatabaseSync) {}

  getAllRecipes(): RecipeListItem[] {
    const stmt = this.db.prepare(`
      SELECT 
        r.id, r.recipe_id, r.version, r.title, r.summary,
        r.culinary_tradition, r.region, r.category, r.status,
        r.yield_quantity, r.yield_unit, r.total_minutes, r.lead_time_hours, r.difficulty,
        r.created_at, r.updated_at,
        (SELECT COUNT(*) FROM recipe_ingredients i WHERE i.recipe_id = r.id) as ingredients_count,
        (SELECT COUNT(*) FROM recipe_steps s WHERE s.recipe_id = r.id) as steps_count
      FROM recipes r
      ORDER BY r.updated_at DESC
    `);

    return stmt.all() as unknown as RecipeListItem[];
  }

  getRecipeById(id: string): Recipe | null {
    const recipeRow = this.db.prepare(`
      SELECT * FROM recipes WHERE id = ? OR recipe_id = ?
    `).get(id, id) as any;

    if (!recipeRow) {
      return null;
    }

    // Get ingredients
    const ingRows = this.db.prepare(`
      SELECT * FROM recipe_ingredients 
      WHERE recipe_id = ? 
      ORDER BY sequence_order ASC
    `).all(recipeRow.id) as any[];

    const ingredients: RecipeIngredient[] = ingRows.map((r) => ({
      id: r.id,
      ingredient_id: r.ingredient_id,
      name: r.name,
      quantity: r.quantity,
      unit: r.unit,
      preparation: r.preparation,
      group: r.group_name,
      optional: Boolean(r.optional),
      notes: r.notes,
      sequence_order: r.sequence_order,
    }));

    // Get steps
    const stepRows = this.db.prepare(`
      SELECT * FROM recipe_steps 
      WHERE recipe_id = ? 
      ORDER BY step_number ASC
    `).all(recipeRow.id) as any[];

    const steps: RecipeStep[] = stepRows.map((s) => {
      const refRows = this.db.prepare(`
        SELECT ingredient_id, quantity_used_in_step, unit, component, notes
        FROM step_ingredient_refs 
        WHERE step_id = ?
      `).all(s.id) as {
        ingredient_id: string;
        quantity_used_in_step: number | null;
        unit: string | null;
        component: string | null;
        notes: string | null;
      }[];

      const ingredient_refs = refRows.map((ref) => ref.ingredient_id);

      // Condition 2: Distinguish between absent and empty list.
      // If any allocation details are present, populate allocations; otherwise leave undefined (never force to []).
      const hasAllocations = refRows.some(
        (r) => r.quantity_used_in_step !== null || r.component !== null || r.notes !== null
      );

      const allocations: StepIngredientAllocation[] | undefined = hasAllocations
        ? refRows.map((r) => ({
            ingredient_id: r.ingredient_id,
            quantity_used_in_step: r.quantity_used_in_step,
            unit: r.unit,
            component: r.component,
            notes: r.notes,
          }))
        : undefined;

      // Condition 2: depends_on_json: NULL maps to undefined (implicit sequential). '[]' maps to [].
      let depends_on: string[] | null | undefined = undefined;
      if (s.depends_on_json !== null && s.depends_on_json !== undefined) {
        try {
          depends_on = JSON.parse(s.depends_on_json);
        } catch {
          depends_on = undefined;
        }
      }

      // Thermal constraints: NULL maps to undefined.
      let thermal_constraints = undefined;
      if (s.thermal_constraints_json !== null && s.thermal_constraints_json !== undefined) {
        try {
          thermal_constraints = JSON.parse(s.thermal_constraints_json);
        } catch {
          thermal_constraints = undefined;
        }
      }

      // Risks: NULL maps to undefined.
      let risks = undefined;
      if (s.risks_json !== null && s.risks_json !== undefined) {
        try {
          risks = JSON.parse(s.risks_json);
        } catch {
          risks = undefined;
        }
      }

      return {
        id: s.id,
        step_id: s.step_id || undefined,
        step_number: s.step_number,
        instruction: s.instruction,
        duration_minutes: s.duration_minutes,
        active_minutes: typeof s.active_minutes === 'number' ? s.active_minutes : undefined,
        passive_minutes: typeof s.passive_minutes === 'number' ? s.passive_minutes : undefined,
        depends_on,
        temperature_c: s.temperature_c,
        heat_level: s.heat_level,
        success_cue: s.success_cue,
        ingredient_refs,
        allocations,
        thermal_constraints,
        risks,
      };
    });

    const safeJsonParse = (str: string | null | undefined) => {
      if (!str) return undefined;
      try {
        return JSON.parse(str);
      } catch {
        return undefined;
      }
    };

    return {
      id: recipeRow.id,
      recipe_id: recipeRow.recipe_id,
      version: recipeRow.version,
      title: recipeRow.title,
      summary: recipeRow.summary,
      culinary_tradition: recipeRow.culinary_tradition,
      region: recipeRow.region,
      category: recipeRow.category,
      status: recipeRow.status,
      yield: {
        quantity: recipeRow.yield_quantity,
        unit: recipeRow.yield_unit,
        approx_final_weight_g: recipeRow.yield_approx_final_weight_g,
      },
      timing: {
        active_minutes: recipeRow.active_minutes,
        total_minutes: recipeRow.total_minutes,
        lead_time_hours: typeof recipeRow.lead_time_hours === 'number' ? recipeRow.lead_time_hours : undefined,
      },
      difficulty: recipeRow.difficulty,
      equipment: safeJsonParse(recipeRow.equipment_json) || [],
      allergens: safeJsonParse(recipeRow.allergens_json) || [],
      sources: safeJsonParse(recipeRow.sources_json) || [],
      editorial_notes: safeJsonParse(recipeRow.editorial_notes_json) || [],
      claims: safeJsonParse(recipeRow.claims_json),
      review: safeJsonParse(recipeRow.review_json),
      nutrition_estimate: safeJsonParse(recipeRow.nutrition_json),
      ingredients,
      steps,
      created_at: recipeRow.created_at,
      updated_at: recipeRow.updated_at,
    };
  }

  saveRecipe(recipe: Recipe): Recipe {
    const existing = this.getRecipeById(recipe.id);

    if (existing) {
      // Atomic Update
      this.db.exec('BEGIN TRANSACTION;');
      try {
        const updateRecipe = this.db.prepare(`
          UPDATE recipes SET
            recipe_id = ?,
            version = ?,
            title = ?,
            summary = ?,
            culinary_tradition = ?,
            region = ?,
            category = ?,
            status = ?,
            yield_quantity = ?,
            yield_unit = ?,
            yield_approx_final_weight_g = ?,
            active_minutes = ?,
            total_minutes = ?,
            lead_time_hours = ?,
            difficulty = ?,
            equipment_json = ?,
            allergens_json = ?,
            sources_json = ?,
            editorial_notes_json = ?,
            claims_json = ?,
            review_json = ?,
            nutrition_json = ?,
            updated_at = ?
          WHERE id = ?
        `);

        const now = new Date().toISOString();
        updateRecipe.run(
          recipe.recipe_id,
          recipe.version || '1.0.0',
          recipe.title,
          recipe.summary || '',
          recipe.culinary_tradition || null,
          recipe.region || null,
          recipe.category || 'General',
          recipe.status || 'draft',
          recipe.yield?.quantity ?? 4,
          recipe.yield?.unit ?? 'porții',
          recipe.yield?.approx_final_weight_g ?? null,
          recipe.timing?.active_minutes ?? null,
          recipe.timing?.total_minutes ?? null,
          recipe.timing?.lead_time_hours ?? null,
          recipe.difficulty || null,
          JSON.stringify(recipe.equipment || []),
          JSON.stringify(recipe.allergens || []),
          JSON.stringify(recipe.sources || []),
          JSON.stringify(recipe.editorial_notes || []),
          recipe.claims !== undefined && recipe.claims !== null ? JSON.stringify(recipe.claims) : null,
          recipe.review !== undefined && recipe.review !== null ? JSON.stringify(recipe.review) : null,
          recipe.nutrition_estimate !== undefined && recipe.nutrition_estimate !== null ? JSON.stringify(recipe.nutrition_estimate) : null,
          now,
          recipe.id
        );

        // Delete old children
        this.db.prepare('DELETE FROM recipe_ingredients WHERE recipe_id = ?').run(recipe.id);
        this.db.prepare('DELETE FROM recipe_steps WHERE recipe_id = ?').run(recipe.id);

        // Insert new ingredients
        const insertIng = this.db.prepare(`
          INSERT INTO recipe_ingredients (
            id, recipe_id, ingredient_id, name, quantity, unit, preparation,
            group_name, optional, notes, sequence_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        (recipe.ingredients || []).forEach((ing, idx) => {
          insertIng.run(
            ing.id || `ing_${recipe.id}_${idx + 1}`,
            recipe.id,
            ing.ingredient_id || `ing_${idx + 1}`,
            ing.name,
            ing.quantity ?? null,
            ing.unit ?? null,
            ing.preparation ?? null,
            ing.group ?? null,
            ing.optional ? 1 : 0,
            ing.notes ?? null,
            ing.sequence_order || idx + 1
          );
        });

        // Insert new steps with persistent, stable step_id
        const insertStep = this.db.prepare(`
          INSERT INTO recipe_steps (
            id, recipe_id, step_id, step_number, instruction, duration_minutes,
            active_minutes, passive_minutes, depends_on_json, temperature_c,
            heat_level, success_cue, thermal_constraints_json, risks_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertRef = this.db.prepare(`
          INSERT OR REPLACE INTO step_ingredient_refs (
            step_id, ingredient_id, quantity_used_in_step, unit, component, notes
          ) VALUES (?, ?, ?, ?, ?, ?)
        `);

        (recipe.steps || []).forEach((step, idx) => {
          const stepPk = step.id?.startsWith(`${recipe.id}_`) ? step.id : `${recipe.id}_${step.id || idx + 1}`;
          // Preserve existing step_id, or assign stable default
          const stableStepId = step.step_id && step.step_id.trim().length > 0 
            ? step.step_id.trim() 
            : `${recipe.recipe_id || recipe.id}_step_${step.step_number || idx + 1}`;

          insertStep.run(
            stepPk,
            recipe.id,
            stableStepId,
            step.step_number || idx + 1,
            step.instruction,
            step.duration_minutes ?? null,
            step.active_minutes ?? null,
            step.passive_minutes ?? null,
            step.depends_on !== undefined && step.depends_on !== null ? JSON.stringify(step.depends_on) : null,
            step.temperature_c ?? null,
            step.heat_level ?? null,
            step.success_cue ?? null,
            step.thermal_constraints !== undefined && step.thermal_constraints !== null ? JSON.stringify(step.thermal_constraints) : null,
            step.risks !== undefined && step.risks !== null ? JSON.stringify(step.risks) : null
          );

          // Build allocations lookup
          const allocationMap = new Map<string, { quantity_used_in_step: number | null; unit: string | null; component: string | null; notes: string | null }>();
          if (step.allocations && Array.isArray(step.allocations)) {
            step.allocations.forEach((a) => {
              allocationMap.set(a.ingredient_id, {
                quantity_used_in_step: a.quantity_used_in_step ?? null,
                unit: a.unit ?? null,
                component: a.component ?? null,
                notes: a.notes ?? null,
              });
            });
          }

          const allRefs = new Set([...(step.ingredient_refs || []), ...Array.from(allocationMap.keys())]);
          for (const ref of allRefs) {
            const alloc = allocationMap.get(ref);
            insertRef.run(
              stepPk,
              ref,
              alloc?.quantity_used_in_step ?? null,
              alloc?.unit ?? null,
              alloc?.component ?? null,
              alloc?.notes ?? null
            );
          }
        });

        this.db.exec('COMMIT;');
      } catch (err) {
        this.db.exec('ROLLBACK;');
        throw err;
      }
    } else {
      // New Recipe Insert
      insertRecipeIntoDb(this.db, recipe);
    }

    return this.getRecipeById(recipe.id)!;
  }

  deleteRecipe(id: string): boolean {
    const res = this.db.prepare('DELETE FROM recipes WHERE id = ?').run(id);
    return res.changes > 0;
  }
}
