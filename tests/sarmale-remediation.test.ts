import { test } from 'node:test';
import assert from 'node:assert';
import { SARMALE_RECIPE } from '../src/shared/additional-recipes.js';
import { validateRecipe } from '../src/shared/validation.js';
import { initDatabase } from '../src/server/db.js';
import { RecipeRepository } from '../src/server/repository.js';

test('Phase 005-B: Sarmale Recipe Remediation & Accompaniment Semantics Verification', async (t) => {
  await t.test('1. Deterministic Recipe Validation: 0 errors and 0 warnings', () => {
    const result = validateRecipe(SARMALE_RECIPE);
    assert.strictEqual(result.isValid, true, 'Sarmale recipe must be valid');
    assert.strictEqual(result.errors.length, 0, `Expected 0 errors, got: ${JSON.stringify(result.errors)}`);
    assert.strictEqual(result.warnings.length, 0, `Expected 0 warnings, got: ${JSON.stringify(result.warnings)}`);
  });

  await t.test('2. FIND-005A-01: Missing cooking liquid declared and allocated', () => {
    const liquidIng = SARMALE_RECIPE.ingredients.find((i) => i.ingredient_id === 'lichid-fierbere-sarmale');
    assert.ok(liquidIng, 'Cooking liquid must be declared in ingredients');
    assert.strictEqual(liquidIng.quantity, 550, 'Reference volume must be exactly 550 ml');
    assert.strictEqual(liquidIng.unit, 'ml');
    assert.strictEqual(liquidIng.optional, false);
    assert.strictEqual(liquidIng.group, 'Sos & Lichid');

    // Associated with cooking step (step 6)
    const cookingStep = SARMALE_RECIPE.steps.find((s) => s.step_id === 'step_sm_fierbere_lenta_06');
    assert.ok(cookingStep, 'Cooking step must exist');
    assert.ok(cookingStep.ingredient_refs.includes('lichid-fierbere-sarmale'), 'Cooking step must reference liquid');
    
    const liquidAlloc = cookingStep.allocations?.find((a) => a.ingredient_id === 'lichid-fierbere-sarmale');
    assert.ok(liquidAlloc, 'Liquid must be allocated in cooking step');
    assert.strictEqual(liquidAlloc.quantity_used_in_step, 550);
    assert.strictEqual(liquidAlloc.unit, 'ml');
  });

  await t.test('3. FIND-005A-02: Tomato paste explicit allocations (30g filling + 40g liquid = 70g total)', () => {
    const pasteIng = SARMALE_RECIPE.ingredients.find((i) => i.ingredient_id === 'pasta-tomate');
    assert.ok(pasteIng, 'Tomato paste must be declared');
    assert.strictEqual(pasteIng.quantity, 70, 'Total tomato paste must be 70 g');
    assert.strictEqual(pasteIng.unit, 'g');

    // Step 3 (filling) allocation: 30g
    const fillingStep = SARMALE_RECIPE.steps.find((s) => s.step_id === 'step_sm_omogenizare_umplutura_03');
    assert.ok(fillingStep, 'Filling step must exist');
    const fillingAlloc = fillingStep.allocations?.find((a) => a.ingredient_id === 'pasta-tomate');
    assert.ok(fillingAlloc, 'Tomato paste must be allocated in filling step');
    assert.strictEqual(fillingAlloc.quantity_used_in_step, 30);
    assert.ok(fillingStep.instruction.includes('30 g de pastă de tomate'), 'Instruction must state 30 g without ambiguity');

    // Step 6 (cooking liquid) allocation: 40g
    const cookingStep = SARMALE_RECIPE.steps.find((s) => s.step_id === 'step_sm_fierbere_lenta_06');
    assert.ok(cookingStep, 'Cooking step must exist');
    const cookingAlloc = cookingStep.allocations?.find((a) => a.ingredient_id === 'pasta-tomate');
    assert.ok(cookingAlloc, 'Tomato paste must be allocated in cooking step');
    assert.strictEqual(cookingAlloc.quantity_used_in_step, 40);
    assert.ok(cookingStep.instruction.includes('40 g pastă de tomate'), 'Instruction must state 40 g without ambiguous "restul"');

    // Total allocated equals declared
    const totalAllocated = (fillingAlloc.quantity_used_in_step || 0) + (cookingAlloc.quantity_used_in_step || 0);
    assert.strictEqual(totalAllocated, pasteIng.quantity, 'Sum of allocations must match declared total exactly');
  });

  await t.test('4. FIND-005A-03: Sauerkraut leaf preparation step & DAG topology', () => {
    const prepStep = SARMALE_RECIPE.steps.find((s) => s.step_id === 'step_sm_pregatire_varza_02');
    assert.ok(prepStep, 'Sauerkraut leaf preparation step must exist');
    assert.strictEqual(prepStep.step_number, 2);
    assert.deepStrictEqual(prepStep.depends_on, [], 'Leaf prep can start at T=0 in parallel with onion/rice sauté');
    assert.ok(prepStep.instruction.includes('Desprindeți cu grijă foile'), 'Instruction covers leaf separation');
    assert.ok(prepStep.instruction.includes('nervurile groase'), 'Instruction covers rib removal/trimming');
    assert.ok(prepStep.instruction.includes('sare și aciditate'), 'Instruction covers salinity/acidity check');
    assert.ok(prepStep.instruction.includes('desărat în apă călduță'), 'Instruction covers desalting/soaking');

    // Step 4 (rolling) must converge on leaf prep (step 2) AND filling (step 3)
    const rollingStep = SARMALE_RECIPE.steps.find((s) => s.step_id === 'step_sm_invelire_sarmale_04');
    assert.ok(rollingStep);
    assert.deepStrictEqual(rollingStep.depends_on, ['step_sm_pregatire_varza_02', 'step_sm_omogenizare_umplutura_03']);
  });

  await t.test('5. FIND-005A-04: Accompaniment Semantics', () => {
    // Mămăligă, smântână, ardei iute must NOT be in ingredients list
    const declaredIds = SARMALE_RECIPE.ingredients.map((i) => i.ingredient_id);
    assert.ok(!declaredIds.includes('mamaliga'), 'Mămăligă is a side dish, not an ingredient of sarmale');
    assert.ok(!declaredIds.includes('smantana'), 'Smântână is a table condiment, not an ingredient of sarmale');
    assert.ok(!declaredIds.includes('ardei-iute'), 'Ardei iute is a fresh garnish, not an ingredient of sarmale');

    // Must be documented in editorial_notes
    assert.ok(
      SARMALE_RECIPE.editorial_notes.some((n) => n.includes('Semantică acompaniamente')),
      'Editorial notes must explicitly explain accompaniment semantics'
    );
  });

  await t.test('6. Recipe Scaling calculation verification', () => {
    const baseServings = SARMALE_RECIPE.yield.quantity; // 8
    assert.strictEqual(baseServings, 8);

    // Scale to 4 servings (factor 0.5)
    const scaleFactorHalf = 4 / baseServings;
    const liquidIng = SARMALE_RECIPE.ingredients.find((i) => i.ingredient_id === 'lichid-fierbere-sarmale')!;
    const pasteIng = SARMALE_RECIPE.ingredients.find((i) => i.ingredient_id === 'pasta-tomate')!;

    const scaledLiquidHalf = (liquidIng.quantity ?? 0) * scaleFactorHalf;
    const scaledPasteHalf = (pasteIng.quantity ?? 0) * scaleFactorHalf;

    assert.strictEqual(scaledLiquidHalf, 275, 'Liquid scales to 275 ml for 4 servings');
    assert.strictEqual(scaledPasteHalf, 35, 'Tomato paste scales to 35 g for 4 servings');

    // Scale to 16 servings (factor 2.0)
    const scaleFactorDouble = 16 / baseServings;
    const scaledLiquidDouble = (liquidIng.quantity ?? 0) * scaleFactorDouble;
    const scaledPasteDouble = (pasteIng.quantity ?? 0) * scaleFactorDouble;

    assert.strictEqual(scaledLiquidDouble, 1100, 'Liquid scales to 1100 ml for 16 servings');
    assert.strictEqual(scaledPasteDouble, 140, 'Tomato paste scales to 140 g for 16 servings');
  });

  await t.test('7. Database persistence roundtrip', () => {
    const db = initDatabase(':memory:');
    const repo = new RecipeRepository(db);

    const saved = repo.saveRecipe(SARMALE_RECIPE);
    assert.strictEqual(saved.id, 'rec_sarmale_traditionale_012');
    assert.strictEqual(saved.ingredients.length, 10);
    assert.strictEqual(saved.steps.length, 7);

    const fetched = repo.getRecipeById('rec_sarmale_traditionale_012');
    assert.ok(fetched);
    assert.strictEqual(fetched.id, 'rec_sarmale_traditionale_012');
    assert.strictEqual(fetched.title, 'Sarmale Tradiționale în Foi de Varză Murată');
    assert.strictEqual(fetched.ingredients.length, 10);
    assert.strictEqual(fetched.steps.length, 7);

    // Verify step 2 and step 6 in fetched recipe
    const step2 = fetched.steps.find((s) => s.step_id === 'step_sm_pregatire_varza_02');
    assert.ok(step2);
    assert.strictEqual(step2.duration_minutes, 20);

    const step6 = fetched.steps.find((s) => s.step_id === 'step_sm_fierbere_lenta_06');
    assert.ok(step6);
    assert.ok(step6.ingredient_refs.includes('lichid-fierbere-sarmale'));
  });
});
