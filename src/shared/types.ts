/**
 * Atlas Gastronomic — Recipe Core Domain Types
 * Based on Standards Pack v1.0.0 and Phase 002-D Recipe Core V2 MVP extensions.
 * V2 extensions are strictly additive and backward-compatible with V1.
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
  lead_time_hours?: number | null; // V2: Process pauses, curing, overnight resting
  passive_minutes?: number | null; // V2: Inactive cooking, simmering, cooling
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
  notes?: string | null;
  sequence_order: number;
}

// V2: Taxonomia de Riscuri Culinare (ADR-0016 - 4 categorii tipizate)
export type StepRiskType =
  | 'culinary_quality'
  | 'irreversible_risk'
  | 'food_safety'
  | 'haccp_ccp';

export interface StepRisk {
  warning_type: StepRiskType;
  message: string;
  mitigation?: string | null;
}

// V2: Constrângeri Termice cu Trei Puncte de Măsurare (ADR-0015)
export type ThermalMeasurementPoint = 'equipment' | 'surface' | 'product_core';
export type ThermalConstraintType = 'technological_target' | 'quality_threshold' | 'food_safety_threshold';

export interface StepThermalConstraint {
  measurement_point: ThermalMeasurementPoint;
  target_c?: number | null;
  min_c?: number | null;
  max_c?: number | null;
  constraint_type: ThermalConstraintType;
  notes?: string | null;
}

// V2: Alocarea Cantitativă per Pas (ADR-0012)
export interface StepIngredientAllocation {
  ingredient_id: string;
  quantity_used_in_step: number | null; // null = alocare cantitativă nespecificată
  unit: string | null;
  component?: string | null;            // ex: 'yolk' | 'white' (fracționare fizică)
  notes?: string | null;
}

export interface RecipeStep {
  id: string;
  step_id?: string;                     // V2: ID stabil persistent de domeniu
  step_number: number;                  // Ordine editorială narativă de afișare (1..N)
  instruction: string;
  duration_minutes: number | null;
  active_minutes?: number | null;       // V2: Timp de lucru activ
  passive_minutes?: number | null;      // V2: Timp pasiv (fierbere, răcire, macerare)
  depends_on?: string[] | null;         // V2: absent/null = secvențial implicit; [] = T=0; [id] = explicit
  temperature_c: number | null;         // Păstrat pentru compatibilitate directă V1
  heat_level: string | null;
  success_cue: string | null;
  ingredient_refs: string[];            // Păstrat pentru compatibilitate directă V1
  allocations?: StepIngredientAllocation[]; // V2: Alocări detaliate cu cantități
  thermal_constraints?: StepThermalConstraint[]; // V2: Constrângeri termice pe 3 puncte
  risks?: StepRisk[];                   // V2: Taxonomie de riscuri culinare
}

// V2: Aliniere Câmpuri Canonice din Schema V1 omise din interfețe (OD-03)
export type ClaimConfidence = 'documented' | 'widely_attested' | 'editorial_interpretation' | 'uncertain';

export interface RecipeClaim {
  claim_id: string;
  type: string;
  statement: string;
  confidence: ClaimConfidence;
  sources?: string[];
}

export interface RecipeReview {
  reviewer?: string;
  status?: string;
  notes?: string[];
  reviewed_at?: string;
}

export interface NutritionEstimate {
  calories_kcal?: number | null;
  protein_g?: number | null;
  fat_g?: number | null;
  carbs_g?: number | null;
  notes?: string | null;
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
  claims?: RecipeClaim[];               // V2 / OD-03
  review?: RecipeReview;                // V2 / OD-03
  nutrition_estimate?: NutritionEstimate; // V2 / OD-03
  editorial?: import('./editorial-types.js').RecipeEditorialProfile | null;
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
