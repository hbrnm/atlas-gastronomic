import test from 'node:test';
import assert from 'node:assert';
import { validateRecipe } from '../src/shared/validation.js';
import { Recipe } from '../src/shared/types.js';

test('V2 Validation: detects duplicate step_id', () => {
  const result = validateRecipe({
    title: 'Test Recipe',
    ingredients: [{ id: '1', ingredient_id: 'ing1', name: 'Unt', quantity: 10, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null }],
    steps: [
      { id: '1', step_id: 'step_unique', step_number: 1, instruction: 'Pasul unu.', duration_minutes: 5, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: ['ing1'] },
      { id: '2', step_id: 'step_unique', step_number: 2, instruction: 'Pasul doi.', duration_minutes: 5, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: [] },
    ],
  });

  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.some((e) => e.code === 'ERR_STEP_ID_DUPLICATE'));
});

test('V2 Validation: detects empty step_id if provided', () => {
  const result = validateRecipe({
    title: 'Test Recipe',
    ingredients: [{ id: '1', ingredient_id: 'ing1', name: 'Unt', quantity: 10, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null }],
    steps: [
      { id: '1', step_id: '   ', step_number: 1, instruction: 'Pasul unu.', duration_minutes: 5, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: ['ing1'] },
    ],
  });

  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.some((e) => e.code === 'ERR_STEP_ID_EMPTY'));
});

test('V2 Validation: accepts valid depends_on and detects dangling reference', () => {
  const valid = validateRecipe({
    title: 'Test Recipe',
    ingredients: [{ id: '1', ingredient_id: 'ing1', name: 'Unt', quantity: 10, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null }],
    steps: [
      { id: '1', step_id: 'step_a', step_number: 1, instruction: 'Pasul unu.', duration_minutes: 5, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: ['ing1'], depends_on: [] },
      { id: '2', step_id: 'step_b', step_number: 2, instruction: 'Pasul doi.', duration_minutes: 5, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: [], depends_on: ['step_a'] },
    ],
  });
  assert.strictEqual(valid.isValid, true);

  const dangling = validateRecipe({
    title: 'Test Recipe',
    ingredients: [{ id: '1', ingredient_id: 'ing1', name: 'Unt', quantity: 10, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null }],
    steps: [
      { id: '1', step_id: 'step_a', step_number: 1, instruction: 'Pasul unu.', duration_minutes: 5, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: ['ing1'], depends_on: ['non_existent_step'] },
    ],
  });
  assert.strictEqual(dangling.isValid, false);
  assert.ok(dangling.errors.some((e) => e.code === 'ERR_DANGLING_STEP_REFERENCE'));
});

test('V2 Validation: detects self-dependency and cyclic dependency', () => {
  const selfDep = validateRecipe({
    title: 'Test Recipe',
    ingredients: [{ id: '1', ingredient_id: 'ing1', name: 'Unt', quantity: 10, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null }],
    steps: [
      { id: '1', step_id: 'step_a', step_number: 1, instruction: 'Pasul unu.', duration_minutes: 5, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: ['ing1'], depends_on: ['step_a'] },
    ],
  });
  assert.strictEqual(selfDep.isValid, false);
  assert.ok(selfDep.errors.some((e) => e.code === 'ERR_SELF_DEPENDENCY'));

  const cyclic = validateRecipe({
    title: 'Test Recipe',
    ingredients: [{ id: '1', ingredient_id: 'ing1', name: 'Unt', quantity: 10, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null }],
    steps: [
      { id: '1', step_id: 'step_1', step_number: 1, instruction: 'Pasul unu.', duration_minutes: 5, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: ['ing1'], depends_on: ['step_2'] },
      { id: '2', step_id: 'step_2', step_number: 2, instruction: 'Pasul doi.', duration_minutes: 5, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: [], depends_on: ['step_1'] },
    ],
  });
  assert.strictEqual(cyclic.isValid, false);
  assert.ok(cyclic.errors.some((e) => e.code === 'ERR_CYCLIC_DEPENDENCY'));
});

test('V2 Validation: detects mixed dependency cycle (explicit + implicit sequential) and allows parallel root break via depends_on: []', () => {
  // Scenario 1: Mixed dependency cycle
  // Step 1 explicitly depends on Step 3 ('step_3')
  // Step 2 has depends_on: undefined (implicitly depends on Step 1)
  // Step 3 has depends_on: null (implicitly depends on Step 2)
  // This creates a cycle: step_1 -> step_3 -> step_2 -> step_1!
  const mixedCycle = validateRecipe({
    title: 'Mixed Cycle Recipe',
    ingredients: [{ id: '1', ingredient_id: 'ing1', name: 'Unt', quantity: 10, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null }],
    steps: [
      { id: '1', step_id: 'step_1', step_number: 1, instruction: 'Pasul 1 depinde explicit de pasul 3.', duration_minutes: 5, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: ['ing1'], depends_on: ['step_3'] },
      { id: '2', step_id: 'step_2', step_number: 2, instruction: 'Pasul 2 depinde implicit de pasul 1.', duration_minutes: 5, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: [] },
      { id: '3', step_id: 'step_3', step_number: 3, instruction: 'Pasul 3 depinde implicit de pasul 2.', duration_minutes: 5, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: [], depends_on: null },
    ],
  });
  assert.strictEqual(mixedCycle.isValid, false);
  assert.ok(mixedCycle.errors.some((e) => e.code === 'ERR_CYCLIC_DEPENDENCY'));

  // Scenario 2: Parallel root break with depends_on: []
  // Exactly the same as Scenario 1, but Step 2 declares depends_on: [] (independent parallel root at T=0).
  // Step 2 no longer implicitly depends on Step 1, breaking the cycle!
  // Graph: step_1 -> step_3 -> step_2 (step_2 has no dependencies).
  const brokenCycle = validateRecipe({
    title: 'Parallel Root Break Recipe',
    ingredients: [{ id: '1', ingredient_id: 'ing1', name: 'Unt', quantity: 10, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null }],
    steps: [
      { id: '1', step_id: 'step_1', step_number: 1, instruction: 'Pasul 1 depinde explicit de pasul 3.', duration_minutes: 5, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: ['ing1'], depends_on: ['step_3'] },
      { id: '2', step_id: 'step_2', step_number: 2, instruction: 'Pasul 2 este ramură independentă T=0.', duration_minutes: 5, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: [], depends_on: [] },
      { id: '3', step_id: 'step_3', step_number: 3, instruction: 'Pasul 3 depinde de pasul 2.', duration_minutes: 5, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: [], depends_on: ['step_2'] },
    ],
  });
  assert.strictEqual(brokenCycle.isValid, true);
  assert.ok(!brokenCycle.errors.some((e) => e.code === 'ERR_CYCLIC_DEPENDENCY'));
});

test('V2 Validation: checks step timing and non-blocking warnings', () => {
  const result = validateRecipe({
    title: 'Test Recipe',
    ingredients: [{ id: '1', ingredient_id: 'ing1', name: 'Unt', quantity: 10, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null }],
    steps: [
      {
        id: '1',
        step_number: 1,
        instruction: 'Gătește la foc mic.',
        duration_minutes: 20,
        active_minutes: 15,
        passive_minutes: 10, // 15 + 10 = 25 > 20
        temperature_c: null,
        heat_level: null,
        success_cue: null,
        ingredient_refs: ['ing1'],
      },
    ],
  });

  assert.strictEqual(result.isValid, true); // Non-blocking warning!
  assert.ok(result.warnings.some((w) => w.code === 'WARN_STEP_TIMING_DISCREPANCY'));
});

test('V2 Validation: checks safe ingredient allocations and indeterminate cases', () => {
  // Case A: Compatible units exceeding inventory
  const exceeded = validateRecipe({
    title: 'Test Recipe',
    ingredients: [
      { id: '1', ingredient_id: 'unt', name: 'Unt', quantity: 50, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null },
    ],
    steps: [
      {
        id: '1',
        step_number: 1,
        instruction: 'Topește prima parte de unt.',
        duration_minutes: 5,
        temperature_c: null,
        heat_level: null,
        success_cue: null,
        ingredient_refs: ['unt'],
        allocations: [{ ingredient_id: 'unt', quantity_used_in_step: 30, unit: 'g' }],
      },
      {
        id: '2',
        step_number: 2,
        instruction: 'Adaugă a doua parte de unt.',
        duration_minutes: 5,
        temperature_c: null,
        heat_level: null,
        success_cue: null,
        ingredient_refs: ['unt'],
        allocations: [{ ingredient_id: 'unt', quantity_used_in_step: 35, unit: 'g' }], // 30 + 35 = 65 > 50
      },
    ],
  });
  assert.strictEqual(exceeded.isValid, true);
  assert.ok(exceeded.warnings.some((w) => w.code === 'WARN_INGREDIENT_ALLOCATION_EXCEEDED'));

  // Case B: Incompatible/indeterminate units (e.g. g vs linguri) -> DO NOT warn erroneously
  const indeterminate = validateRecipe({
    title: 'Test Recipe',
    ingredients: [
      { id: '1', ingredient_id: 'unt', name: 'Unt', quantity: 50, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null },
    ],
    steps: [
      {
        id: '1',
        step_number: 1,
        instruction: 'Topește o lingură de unt.',
        duration_minutes: 5,
        temperature_c: null,
        heat_level: null,
        success_cue: null,
        ingredient_refs: ['unt'],
        allocations: [{ ingredient_id: 'unt', quantity_used_in_step: 100, unit: 'linguri' }],
      },
    ],
  });
  assert.strictEqual(indeterminate.isValid, true);
  assert.ok(!indeterminate.warnings.some((w) => w.code === 'WARN_INGREDIENT_ALLOCATION_EXCEEDED'));
});

test('V2 Validation: validates thermal constraints', () => {
  const invalid = validateRecipe({
    title: 'Test Recipe',
    ingredients: [{ id: '1', ingredient_id: 'ing1', name: 'Unt', quantity: 10, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null }],
    steps: [
      {
        id: '1',
        step_number: 1,
        instruction: 'Încălzește amestecul.',
        duration_minutes: 5,
        temperature_c: null,
        heat_level: null,
        success_cue: null,
        ingredient_refs: ['ing1'],
        thermal_constraints: [
          {
            measurement_point: 'product_core',
            constraint_type: 'technological_target',
            min_c: 80,
            max_c: 60, // min > max
          },
        ],
      },
    ],
  });

  assert.strictEqual(invalid.isValid, false);
  assert.ok(invalid.errors.some((e) => e.code === 'ERR_THERMAL_RANGE_INVALID'));
});

test('V2 Validation: validates 4-category typed risk taxonomy', () => {
  const valid = validateRecipe({
    title: 'Test Recipe',
    ingredients: [{ id: '1', ingredient_id: 'ing1', name: 'Unt', quantity: 10, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null }],
    steps: [
      {
        id: '1',
        step_number: 1,
        instruction: 'Emulsionează sosul la foc mediu.',
        duration_minutes: 5,
        temperature_c: null,
        heat_level: null,
        success_cue: null,
        ingredient_refs: ['ing1'],
        risks: [
          { warning_type: 'culinary_quality', message: 'Separare emulsie dacă se bate insuficient.' },
          { warning_type: 'irreversible_risk', message: 'Tăiere ireversibilă la depășirea temperaturii.' },
          { warning_type: 'food_safety', message: 'Consumul de ouă insuficient tratate termic.' },
          { warning_type: 'haccp_ccp', message: 'Punct critic de control: menținere la peste 63°C.' },
        ],
      },
    ],
  });
  assert.strictEqual(valid.isValid, true);

  const invalidType = validateRecipe({
    title: 'Test Recipe',
    ingredients: [{ id: '1', ingredient_id: 'ing1', name: 'Unt', quantity: 10, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null }],
    steps: [
      {
        id: '1',
        step_number: 1,
        instruction: 'Pas.',
        duration_minutes: 5,
        temperature_c: null,
        heat_level: null,
        success_cue: null,
        ingredient_refs: ['ing1'],
        risks: [
          // @ts-expect-error Testing invalid runtime enum
          { warning_type: 'unknown_risk_type', message: 'Risc' },
        ],
      },
    ],
  });
  assert.strictEqual(invalidType.isValid, false);
  assert.ok(invalidType.errors.some((e) => e.code === 'ERR_INVALID_RISK_TYPE'));
});
