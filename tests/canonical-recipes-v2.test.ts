import test from 'node:test';
import assert from 'node:assert';
import { validateRecipe } from '../src/shared/validation.js';
import { initDatabase } from '../src/server/db.js';
import { RecipeRepository } from '../src/server/repository.js';
import {
  TAGLIATELLE_RECIPE,
  RISOTTO_RECIPE,
  BOEUF_RECIPE,
  SOUFFLE_RECIPE,
  CANONICAL_RECIPES,
} from '../src/shared/sample-data.js';

test('Canonical Recipes: all 4 recipes pass deterministic validation with 0 errors', () => {
  assert.strictEqual(CANONICAL_RECIPES.length, 4, 'Expected exactly 4 canonical recipes');

  for (const recipe of CANONICAL_RECIPES) {
    const result = validateRecipe(recipe);
    assert.strictEqual(
      result.isValid,
      true,
      `Recipe "${recipe.title}" (${recipe.id}) must be valid. Errors: ${JSON.stringify(result.errors)}`
    );
    assert.strictEqual(result.errors.length, 0, `Recipe "${recipe.title}" must have 0 errors`);
    assert.strictEqual(result.warnings.length, 0, `Recipe "${recipe.title}" must have 0 warnings`);
  }
});

test('Canonical Recipe 001: Tagliatelle al Ragù alla Bolognese V2 domain representation', () => {
  assert.strictEqual(TAGLIATELLE_RECIPE.id, 'rec_tagliatelle_ragu_001');
  assert.strictEqual(TAGLIATELLE_RECIPE.recipe_id, 'tagliatelle-al-ragu-bolognese');
  assert.strictEqual(TAGLIATELLE_RECIPE.ingredients.length, 18);
  assert.strictEqual(TAGLIATELLE_RECIPE.steps.length, 8);
  assert.strictEqual(TAGLIATELLE_RECIPE.timing.total_minutes, 212);
  assert.strictEqual(TAGLIATELLE_RECIPE.timing.active_minutes, 60);

  // Check parallel tracks and convergence
  const step6 = TAGLIATELLE_RECIPE.steps.find((s) => s.step_id === 'step_pasta_06');
  assert.ok(step6);
  assert.deepStrictEqual(step6.depends_on, [], 'Pasta track starts as independent root T=0');

  const step8 = TAGLIATELLE_RECIPE.steps.find((s) => s.step_id === 'step_serv_08');
  assert.ok(step8);
  assert.deepStrictEqual(
    step8.depends_on,
    ['step_ragu_05', 'step_pasta_07'],
    'Convergence of ragù and fresh tagliatelle tracks'
  );

  // Check claims
  assert.ok(TAGLIATELLE_RECIPE.claims && TAGLIATELLE_RECIPE.claims.length >= 3);
  assert.ok(TAGLIATELLE_RECIPE.claims.some((c) => c.claim_id === 'clm_ragu_aic_2023'));
  assert.ok(TAGLIATELLE_RECIPE.claims.some((c) => c.claim_id === 'clm_tagliatella_1972'));
});

test('Canonical Recipe 002: Risotto alla Milanese Tradizionale V2 domain representation', () => {
  assert.strictEqual(RISOTTO_RECIPE.id, 'rec_risotto_milanese_002');
  assert.strictEqual(RISOTTO_RECIPE.recipe_id, 'risotto-alla-milanese');
  assert.strictEqual(RISOTTO_RECIPE.status, 'editorial_review');
  assert.strictEqual(RISOTTO_RECIPE.yield.quantity, 4);
  assert.strictEqual(RISOTTO_RECIPE.yield.approx_final_weight_g, 1145);

  // Timing reconciliation: 32 active + 8 passive = 40 total
  assert.strictEqual(RISOTTO_RECIPE.timing.active_minutes, 32);
  assert.strictEqual(RISOTTO_RECIPE.timing.passive_minutes, 8);
  assert.strictEqual(RISOTTO_RECIPE.timing.total_minutes, 40);

  // Structural ingredients
  assert.strictEqual(RISOTTO_RECIPE.ingredients.length, 10);
  const midollo = RISOTTO_RECIPE.ingredients.find((i) => i.ingredient_id === 'midollo-di-bue');
  assert.ok(midollo);
  assert.strictEqual(midollo.optional, false, 'Măduva de vită este obligatorie per De.Co. Milano 2007');

  // Butter functional fractionation: unt-soffritto (25g) and unt-mantecatura (40g)
  const untSoffritto = RISOTTO_RECIPE.ingredients.find((i) => i.ingredient_id === 'unt-soffritto');
  const untMantecatura = RISOTTO_RECIPE.ingredients.find((i) => i.ingredient_id === 'unt-mantecatura');
  assert.ok(untSoffritto && untMantecatura);
  assert.strictEqual(untSoffritto.quantity, 25);
  assert.strictEqual(untMantecatura.quantity, 40);

  // Thermal constraint & risk on step 7 (mantecatura fuori dal fuoco)
  const step7 = RISOTTO_RECIPE.steps.find((s) => s.step_id === 'step_rm_mantecatura_07');
  assert.ok(step7);
  assert.ok(step7.thermal_constraints && step7.thermal_constraints.length > 0);
  assert.strictEqual(step7.thermal_constraints[0].measurement_point, 'product_core');
  assert.strictEqual(step7.thermal_constraints[0].max_c, 75);
  assert.strictEqual(step7.thermal_constraints[0].constraint_type, 'quality_threshold');

  assert.ok(step7.risks && step7.risks.length > 0);
  assert.strictEqual(step7.risks[0].warning_type, 'irreversible_risk');

  // DAG & step order
  assert.strictEqual(RISOTTO_RECIPE.steps.length, 8);
  const step1 = RISOTTO_RECIPE.steps.find((s) => s.step_id === 'step_rm_prep_infuzare_01');
  assert.ok(step1);
  assert.deepStrictEqual(step1.depends_on, [], 'Infuzarea și prep încep la T=0');

  // Persistence in repository
  const db = initDatabase(':memory:');
  const repo = new RecipeRepository(db);
  const saved = repo.saveRecipe(RISOTTO_RECIPE);
  assert.strictEqual(saved.id, 'rec_risotto_milanese_002');
  assert.strictEqual(saved.title, 'Risotto alla Milanese Tradizionale');

  const fetched = repo.getRecipeById('rec_risotto_milanese_002');
  assert.ok(fetched);
  assert.strictEqual(fetched.ingredients.length, 10);
  assert.strictEqual(fetched.steps.length, 8);
  assert.strictEqual(fetched.steps[6].step_id, 'step_rm_mantecatura_07');
});

test('Canonical Recipe 003: Boeuf Bourguignon Tradițional V2 domain representation', () => {
  assert.strictEqual(BOEUF_RECIPE.id, 'rec_boeuf_bourguignon_003');
  assert.strictEqual(BOEUF_RECIPE.recipe_id, 'boeuf-bourguignon');
  assert.strictEqual(BOEUF_RECIPE.status, 'editorial_review');
  assert.strictEqual(BOEUF_RECIPE.yield.quantity, 6);
  assert.strictEqual(BOEUF_RECIPE.yield.approx_final_weight_g, 2300);

  // Timing: 90 active, 150 passive, 240 total, 24h lead_time
  assert.strictEqual(BOEUF_RECIPE.timing.active_minutes, 90);
  assert.strictEqual(BOEUF_RECIPE.timing.passive_minutes, 150);
  assert.strictEqual(BOEUF_RECIPE.timing.total_minutes, 240);
  assert.strictEqual(BOEUF_RECIPE.timing.lead_time_hours, 24);

  assert.strictEqual(BOEUF_RECIPE.ingredients.length, 17);
  assert.strictEqual(BOEUF_RECIPE.steps.length, 7);

  // Parallel tracks in DAG:
  // Track 1: Braisage (steps 1 -> 2 -> 3 -> 4)
  const step4 = BOEUF_RECIPE.steps.find((s) => s.step_id === 'step_bb_braisage_04');
  assert.ok(step4);
  assert.strictEqual(step4.duration_minutes, 150);
  assert.strictEqual(step4.passive_minutes, 150);
  assert.deepStrictEqual(step4.depends_on, ['step_bb_singer_03']);

  // Track 2: Garniture Bourguignonne (step 5 independent root -> step 6)
  const step5 = BOEUF_RECIPE.steps.find((s) => s.step_id === 'step_bb_grelots_05');
  assert.ok(step5);
  assert.deepStrictEqual(step5.depends_on, [], 'Garnitura de cepe începe autonom la T=0');

  const step6 = BOEUF_RECIPE.steps.find((s) => s.step_id === 'step_bb_champignons_06');
  assert.ok(step6);
  assert.deepStrictEqual(step6.depends_on, ['step_bb_grelots_05']);

  // Convergence at step 7 (sauce finish & assembly)
  const step7 = BOEUF_RECIPE.steps.find((s) => s.step_id === 'step_bb_sauce_finish_07');
  assert.ok(step7);
  assert.deepStrictEqual(
    step7.depends_on,
    ['step_bb_braisage_04', 'step_bb_champignons_06'],
    'Reunirea cărnii fierte lent cu sosul filtrat și garniturile gătite separat'
  );

  // Exact ingredient allocations test: unt-garnituri (20g + 25g + 15g = 60g)
  const untGarnituri = BOEUF_RECIPE.ingredients.find((i) => i.ingredient_id === 'unt-garnituri');
  assert.ok(untGarnituri);
  assert.strictEqual(untGarnituri.quantity, 60);

  // Persistence in repository
  const db = initDatabase(':memory:');
  const repo = new RecipeRepository(db);
  const saved = repo.saveRecipe(BOEUF_RECIPE);
  assert.strictEqual(saved.id, 'rec_boeuf_bourguignon_003');
  assert.strictEqual(saved.timing.lead_time_hours, 24);

  const fetched = repo.getRecipeById('rec_boeuf_bourguignon_003');
  assert.ok(fetched);
  assert.strictEqual(fetched.timing.lead_time_hours, 24);
  assert.strictEqual(fetched.steps.length, 7);
});

test('Canonical Recipe 004: Soufflé Chaud au Fromage V2 domain representation', () => {
  assert.strictEqual(SOUFFLE_RECIPE.id, 'rec_souffle_fromage_004');
  assert.strictEqual(SOUFFLE_RECIPE.recipe_id, 'souffle-au-fromage');
  assert.strictEqual(SOUFFLE_RECIPE.status, 'editorial_review');
  assert.strictEqual(SOUFFLE_RECIPE.yield.quantity, 4);
  assert.strictEqual(SOUFFLE_RECIPE.yield.approx_final_weight_g, 670);

  // Timing: 30 active, 25 passive, 55 total
  assert.strictEqual(SOUFFLE_RECIPE.timing.active_minutes, 30);
  assert.strictEqual(SOUFFLE_RECIPE.timing.passive_minutes, 25);
  assert.strictEqual(SOUFFLE_RECIPE.timing.total_minutes, 55);

  assert.strictEqual(SOUFFLE_RECIPE.ingredients.length, 11);
  assert.strictEqual(SOUFFLE_RECIPE.steps.length, 8);

  // Step 3: béchamel cooling below 55°C before egg yolks (culinary quality & irreversible risk, quality_threshold)
  const step3 = SOUFFLE_RECIPE.steps.find((s) => s.step_id === 'step_sf_racire_03');
  assert.ok(step3);
  assert.ok(step3.thermal_constraints && step3.thermal_constraints.length > 0);
  assert.strictEqual(step3.thermal_constraints[0].measurement_point, 'product_core');
  assert.strictEqual(step3.thermal_constraints[0].max_c, 55);
  assert.strictEqual(step3.thermal_constraints[0].constraint_type, 'quality_threshold');

  assert.ok(step3.risks && step3.risks.length >= 2);
  assert.ok(step3.risks.some((r) => r.warning_type === 'irreversible_risk'));
  assert.ok(step3.risks.some((r) => r.warning_type === 'culinary_quality'));
  assert.ok(!step3.risks.some((r) => r.warning_type === 'haccp_ccp'), 'Must not use haccp_ccp without formal HACCP validation');

  // Step 4: egg separation avoiding lipids in egg whites (culinary quality only, no food_safety)
  const step4 = SOUFFLE_RECIPE.steps.find((s) => s.step_id === 'step_sf_galbenus_fromage_04');
  assert.ok(step4);
  assert.ok(step4.risks && step4.risks.length > 0);
  assert.ok(step4.risks.every((r) => r.warning_type === 'culinary_quality'), 'Fat contamination must be classified strictly as culinary_quality');
  assert.ok(!step4.risks.some((r) => r.warning_type === 'food_safety'), 'Must not label fat contamination as food_safety');

  // Baking step 7: 190°C static radiant heat, irreversible risk
  const step7 = SOUFFLE_RECIPE.steps.find((s) => s.step_id === 'step_sf_coacere_07');
  assert.ok(step7);
  assert.strictEqual(step7.duration_minutes, 20);
  assert.strictEqual(step7.passive_minutes, 20);
  assert.ok(step7.thermal_constraints && step7.thermal_constraints.length > 0);
  assert.strictEqual(step7.thermal_constraints[0].target_c, 190);

  // Persistence in repository
  const db = initDatabase(':memory:');
  const repo = new RecipeRepository(db);
  const saved = repo.saveRecipe(SOUFFLE_RECIPE);
  assert.strictEqual(saved.id, 'rec_souffle_fromage_004');

  const fetched = repo.getRecipeById('rec_souffle_fromage_004');
  assert.ok(fetched);
  assert.strictEqual(fetched.ingredients.length, 11);
  assert.strictEqual(fetched.steps.length, 8);
});
