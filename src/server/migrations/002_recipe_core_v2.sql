-- ATLAS GASTRONOMIC — RECIPE CORE V2 MVP MIGRATION
-- Migration: 002_recipe_core_v2.sql
-- Non-destructive additive migration from Recipe Core V1 to V2 MVP

-- 1. Recipes: Additive optional columns
ALTER TABLE recipes ADD COLUMN lead_time_hours REAL;
ALTER TABLE recipes ADD COLUMN claims_json TEXT DEFAULT NULL;
ALTER TABLE recipes ADD COLUMN review_json TEXT DEFAULT NULL;
ALTER TABLE recipes ADD COLUMN nutrition_json TEXT DEFAULT NULL;

-- 2. Recipe Steps: Additive operational and thermal columns
ALTER TABLE recipe_steps ADD COLUMN step_id TEXT;
ALTER TABLE recipe_steps ADD COLUMN depends_on_json TEXT DEFAULT NULL;
ALTER TABLE recipe_steps ADD COLUMN active_minutes REAL;
ALTER TABLE recipe_steps ADD COLUMN passive_minutes REAL;
ALTER TABLE recipe_steps ADD COLUMN thermal_constraints_json TEXT DEFAULT NULL;
ALTER TABLE recipe_steps ADD COLUMN risks_json TEXT DEFAULT NULL;

-- 3. Step Ingredient References: Additive allocation columns
ALTER TABLE step_ingredient_refs ADD COLUMN quantity_used_in_step REAL;
ALTER TABLE step_ingredient_refs ADD COLUMN unit TEXT;
ALTER TABLE step_ingredient_refs ADD COLUMN component TEXT;
ALTER TABLE step_ingredient_refs ADD COLUMN notes TEXT;

-- 4. Controlled backfill for existing steps without step_id
UPDATE recipe_steps
SET step_id = (
  SELECT r.recipe_id FROM recipes r WHERE r.id = recipe_steps.recipe_id
) || '_step_' || recipe_steps.step_number
WHERE step_id IS NULL OR step_id = '';

-- 5. Enforce unique index for (recipe_id, step_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipe_steps_unique_step_id ON recipe_steps(recipe_id, step_id);
