/**
 * Atlas Gastronomic — Recipe Core V1 Domain Types
 * Based on Standards Pack v1.0.0 (standards/v1.0.0/schemas/recipe.schema.json)
 */

export type RecipeStatus =
  | 'idea'
  | 'researching'
  | 'draft'
  | 'technical_review'
  | 'editorial_review'
  | 'needs_revision'
  | 'human_approved'
  | 'published'
  | 'archived';

export type DifficultyLevel = 'easy' | 'moderate' | 'advanced' | null;

export interface RecipeYield {
  quantity: number;
  unit: string;
  approx_final_weight_g?: number | null;
}

export interface RecipeTiming {
  active_minutes: number | null;
  total_minutes: number | null;
}

export interface RecipeIngredient {
  id: string;
  ingredient_id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  preparation: string | null;
  group: string | null;
  optional: boolean;
  notes: string | null;
  sequence_order: number;
}

export interface RecipeStep {
  id: string;
  step_number: number;
  instruction: string;
  duration_minutes: number | null;
  temperature_c: number | null;
  heat_level: string | null;
  success_cue: string | null;
  ingredient_refs: string[]; // references ingredient_id of ingredients in the recipe
}

export interface Recipe {
  id: string;
  recipe_id: string;
  version: string;
  title: string;
  alternate_names?: string[];
  summary: string;
  culinary_tradition: string | null;
  region: string | null;
  category: string;
  status: RecipeStatus;
  yield: RecipeYield;
  timing: RecipeTiming;
  difficulty: DifficultyLevel;
  equipment?: string[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  allergens?: string[];
  sources?: string[];
  editorial_notes?: string[];
  created_at: string;
  updated_at: string;
}

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  code: string;
  field: string;
  message: string;
  severity: ValidationSeverity;
}

export interface RecipeValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}
