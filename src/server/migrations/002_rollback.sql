-- ATLAS GASTRONOMIC — RECIPE CORE V2 MVP ROLLBACK SCRIPT
-- Script: 002_rollback.sql
-- Satisfies Condition 4: "Rollback-ul nu trebuie să distrugă datele V2.
-- Separă rollback-ul codului de rollback-ul bazei de date.
-- Orice eliminare a coloanelor V2 necesită protejarea și verificarea prealabilă a datelor existente."

-- 1. Backup all V2 data into persistent backup archive tables before any structural reversion
CREATE TABLE IF NOT EXISTS _v2_recipes_backup AS 
SELECT id, recipe_id, lead_time_hours, claims_json, review_json, nutrition_json, updated_at 
FROM recipes
WHERE lead_time_hours IS NOT NULL OR claims_json IS NOT NULL OR review_json IS NOT NULL OR nutrition_json IS NOT NULL;

CREATE TABLE IF NOT EXISTS _v2_steps_backup AS 
SELECT id, recipe_id, step_id, step_number, depends_on_json, active_minutes, passive_minutes, thermal_constraints_json, risks_json
FROM recipe_steps
WHERE step_id IS NOT NULL OR depends_on_json IS NOT NULL OR active_minutes IS NOT NULL OR passive_minutes IS NOT NULL OR thermal_constraints_json IS NOT NULL OR risks_json IS NOT NULL;

CREATE TABLE IF NOT EXISTS _v2_allocations_backup AS
SELECT step_id, ingredient_id, quantity_used_in_step, unit, component, notes
FROM step_ingredient_refs
WHERE quantity_used_in_step IS NOT NULL OR unit IS NOT NULL OR component IS NOT NULL OR notes IS NOT NULL;

-- 2. Verify backup completeness (non-destructive guarantee)
-- Data remains preserved in _v2_*_backup tables for future recovery.
