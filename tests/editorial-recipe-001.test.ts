import test from 'node:test';
import assert from 'node:assert';
import { Recipe } from '../src/shared/types.js';
import { validateRecipe } from '../src/shared/validation.js';
import { initDatabase } from '../src/server/db.js';
import { RecipeRepository } from '../src/server/repository.js';

import { TAGLIATELLE_RECIPE } from '../src/shared/sample-data.js';

test('Editorial Validation Case 001: Tagliatelle al Ragù alla Bolognese', () => {
  // 1. Run deterministic structural validation
  const validation = validateRecipe(TAGLIATELLE_RECIPE);

  assert.strictEqual(validation.isValid, true, 'Recipe must pass validation with 0 errors');
  assert.strictEqual(validation.errors.length, 0, 'Must have zero structural errors');
  assert.strictEqual(validation.warnings.length, 0, 'Must have zero warnings (all ingredients referenced)');

  // 2. Relational persistence test
  const db = initDatabase(':memory:');
  const repo = new RecipeRepository(db);

  const saved = repo.saveRecipe(TAGLIATELLE_RECIPE);
  assert.strictEqual(saved.id, 'rec_tagliatelle_ragu_001');
  assert.strictEqual(saved.title, 'Tagliatelle al Ragù alla Bolognese');
  assert.strictEqual(saved.ingredients.length, 18);
  assert.strictEqual(saved.steps.length, 8);
  assert.strictEqual(saved.yield.quantity, 6);
  assert.strictEqual(saved.timing.total_minutes, 212);

  // 3. Relational fetch and tree integrity
  const fetched = repo.getRecipeById('rec_tagliatelle_ragu_001');
  assert.ok(fetched);
  assert.strictEqual(fetched.recipe_id, 'tagliatelle-al-ragu-bolognese');
  assert.strictEqual(fetched.ingredients.length, 18);
  assert.strictEqual(fetched.steps.length, 8);

  // Check specific authentic details
  const beef = fetched.ingredients.find((i) => i.ingredient_id === 'carne-vita');
  assert.ok(beef);
  assert.strictEqual(beef.quantity, 400);
  assert.strictEqual(beef.unit, 'g');

  const pancetta = fetched.ingredients.find((i) => i.ingredient_id === 'pancetta');
  assert.ok(pancetta);
  assert.strictEqual(pancetta.quantity, 150);

  const step1 = fetched.steps.find((s) => s.step_number === 1);
  assert.ok(step1);
  assert.ok(step1.ingredient_refs.includes('pancetta'));
  assert.ok(step1.ingredient_refs.includes('ceapa'));

  const step7 = fetched.steps.find((s) => s.step_number === 7);
  assert.ok(step7);
  assert.ok(step7.instruction.includes('7 mm'));

  // 4. Quality Gate 001 Targeted Reconciliation assertions
  // Mass balance
  assert.strictEqual(saved.yield.approx_final_weight_g, 1650);
  assert.strictEqual(saved.yield.quantity, 6);

  // Status must remain editorial_review
  assert.strictEqual(saved.status, 'editorial_review');

  // Exact timeline reconciliation
  assert.strictEqual(saved.timing.total_minutes, 212, 'Total elapsed time must reflect exact sum of linear steps');
  assert.strictEqual(saved.timing.active_minutes, 60, 'Active hands-on time must be 60 min');

  // Actual ragù simmering duration must be exactly 180 minutes (60 + 120)
  const step4 = fetched.steps.find((s) => s.step_number === 4);
  assert.ok(step4);
  assert.strictEqual(step4.duration_minutes, 60, 'Phase 1 simmer must be 60 min');
  assert.strictEqual(step4.temperature_c, null, 'Simmering temperature must not claim false precision');

  const step5 = fetched.steps.find((s) => s.step_number === 5);
  assert.ok(step5);
  assert.strictEqual(step5.duration_minutes, 120, 'Phase 2 simmer must be 120 min');
  assert.strictEqual(step5.temperature_c, null, 'Simmering temperature must not claim false precision');

  const totalSimmerMinutes = step4.duration_minutes + step5.duration_minutes;
  assert.strictEqual(totalSimmerMinutes, 180, 'Total simmering time must be canonical 3 hours (180 minutes)');

  // Parallel operations (Steps 6 & 7) take 40 + 25 = 65 min, fitting inside 120 min of Step 5
  const step6 = fetched.steps.find((s) => s.step_number === 6);
  assert.ok(step6);
  assert.strictEqual(step6.duration_minutes, 40);

  const parallelTime = step6.duration_minutes + step7.duration_minutes;
  assert.strictEqual(parallelTime, 65, 'Parallel dough prep and cutting takes 65 min');

  // Linear elapsed sum: step 1 (12) + step 2 (10) + step 3 (5) + step 4 (60) + step 5 (120) + step 8 (5) = 212 min
  const linearElapsedSum = 12 + 10 + 5 + step4.duration_minutes + step5.duration_minutes + 5;
  assert.strictEqual(linearElapsedSum, saved.timing.total_minutes, 'Linear elapsed time must equal total_minutes');

  // Optional milk
  const milk = fetched.ingredients.find((i) => i.ingredient_id === 'lapte-integral');
  assert.ok(milk);
  assert.strictEqual(Boolean(milk.optional), true, 'Milk must be optional per AIC 2023 notarial deposit');

  // Sources attribution
  assert.ok(saved.sources.some((s) => s.includes('20 aprile 2023')), 'Must cite AIC 2023 notarial deposit');
  assert.ok(saved.sources.some((s) => s.includes('16 aprile 1972')), 'Must cite CCIAA 1972 tagliatella deposit');
  assert.ok(saved.sources.some((s) => s.includes('Pellegrino Artusi')), 'Must cite Pellegrino Artusi 1891');

  // 5. Recipe Core V2 MVP Validations
  // Claims
  assert.ok(fetched.claims && fetched.claims.length === 3, 'Must persist exactly 3 canonical historical claims');
  assert.ok(fetched.claims.some((c) => c.claim_id === 'clm_ragu_aic_2023'));
  assert.ok(fetched.claims.some((c) => c.claim_id === 'clm_tagliatella_1972'));

  // Precedence DAG and Parallel Tracks
  assert.strictEqual(step1.step_id, 'step_ragu_01');
  assert.deepStrictEqual(step1.depends_on, [], 'Step 1 is parallel track 1 root');

  assert.strictEqual(step6.step_id, 'step_pasta_06');
  assert.deepStrictEqual(step6.depends_on, [], 'Step 6 is parallel track 2 root');

  const step8 = fetched.steps.find((s) => s.step_number === 8);
  assert.ok(step8);
  assert.strictEqual(step8.step_id, 'step_serv_08');
  assert.deepStrictEqual(step8.depends_on, ['step_ragu_05', 'step_pasta_07'], 'Step 8 represents exact convergence of sauce and pasta tracks');

  // Thermal Constraints
  assert.ok(step4.thermal_constraints && step4.thermal_constraints.length === 1);
  assert.strictEqual(step4.thermal_constraints[0].target_c, 90);

  // Risk Taxonomy
  assert.ok(step8.risks && step8.risks.length === 1);
  assert.strictEqual(step8.risks[0].warning_type, 'irreversible_risk');
});
