import test from 'node:test';
import assert from 'node:assert';
import { initDatabase } from '../src/server/db.js';
import { RecipeRepository } from '../src/server/repository.js';
import { createExpressApp } from '../src/server/app.js';
import { Server } from 'node:http';
import { AddressInfo } from 'node:net';

test('Express API (V2): Full V2 payload lifecycle and backward compatibility', async (t) => {
  const db = initDatabase(':memory:');
  const repo = new RecipeRepository(db);
  const app = createExpressApp(repo);

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });

  t.after(() => {
    server.close();
  });

  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  // 1. POST /api/recipes with complete V2 fields
  const v2Payload = {
    title: 'Boeuf Bourguignon V2 Test',
    category: 'Preparate din Carne',
    summary: 'Test pentru concurrență și maturare.',
    yield: { quantity: 6, unit: 'porții' },
    timing: { active_minutes: 60, total_minutes: 240, lead_time_hours: 24 },
    difficulty: 'advanced',
    ingredients: [
      { ingredient_id: 'carne', name: 'Carne de vită', quantity: 1200, unit: 'g', optional: false, sequence_order: 1 },
      { ingredient_id: 'ciuperci', name: 'Ciuperci champignon', quantity: 300, unit: 'g', optional: false, sequence_order: 2 },
      { ingredient_id: 'unt', name: 'Unt', quantity: 60, unit: 'g', optional: false, sequence_order: 3 },
    ],
    steps: [
      {
        step_id: 'step_braisage',
        step_number: 1,
        instruction: 'Braisează carnea la cuptor.',
        duration_minutes: 150,
        active_minutes: 20,
        passive_minutes: 130,
        temperature_c: 160,
        heat_level: 'mediu',
        ingredient_refs: ['carne'],
        depends_on: [], // Parallel root!
        thermal_constraints: [
          { measurement_point: 'equipment', target_c: 160, constraint_type: 'technological_target' },
          { measurement_point: 'product_core', target_c: 90, constraint_type: 'quality_threshold' },
        ],
        risks: [
          { warning_type: 'irreversible_risk', message: 'Evaporare excesivă dacă capacul nu este etanș.' },
        ],
      },
      {
        step_id: 'step_ciuperci',
        step_number: 2,
        instruction: 'Sotează ciupercile în unt.',
        duration_minutes: 15,
        active_minutes: 15,
        passive_minutes: 0,
        ingredient_refs: ['ciuperci', 'unt'],
        depends_on: [], // Independent parallel track!
        allocations: [
          { ingredient_id: 'unt', quantity_used_in_step: 30, unit: 'g' },
          { ingredient_id: 'ciuperci', quantity_used_in_step: 300, unit: 'g' },
        ],
      },
      {
        step_id: 'step_asamblare',
        step_number: 3,
        instruction: 'Încorporează ciupercile în sosul de carne braisat.',
        duration_minutes: 10,
        active_minutes: 10,
        passive_minutes: 0,
        ingredient_refs: ['ciuperci'],
        depends_on: ['step_braisage', 'step_ciuperci'], // Convergence!
      },
    ],
    claims: [
      { claim_id: 'clm_escoffier', type: 'attribution', statement: 'Escoffier Le Guide Culinaire 1921', confidence: 'documented' },
    ],
  };

  const createRes = await fetch(`${baseUrl}/api/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(v2Payload),
  });

  assert.strictEqual(createRes.status, 201);
  const createData = await createRes.json();
  assert.ok(createData.recipe.id);
  assert.strictEqual(createData.recipe.timing.lead_time_hours, 24);
  assert.strictEqual(createData.recipe.steps.length, 3);
  assert.strictEqual(createData.recipe.steps[0].step_id, 'step_braisage');
  assert.deepStrictEqual(createData.recipe.steps[0].depends_on, []);
  assert.strictEqual(createData.recipe.steps[0].thermal_constraints?.length, 2);
  assert.strictEqual(createData.recipe.steps[0].risks?.length, 1);
  assert.strictEqual(createData.recipe.steps[1].allocations?.length, 2);
  assert.deepStrictEqual(createData.recipe.steps[2].depends_on, ['step_braisage', 'step_ciuperci']);
  assert.strictEqual(createData.recipe.claims?.length, 1);
  assert.strictEqual(createData.validation.isValid, true);

  // 2. GET /api/recipes/:id
  const getRes = await fetch(`${baseUrl}/api/recipes/${createData.recipe.id}`);
  assert.strictEqual(getRes.status, 200);
  const getData = await getRes.json();
  assert.strictEqual(getData.recipe.id, createData.recipe.id);
  assert.strictEqual(getData.recipe.steps[0].step_id, 'step_braisage');

  // 3. POST /api/recipes/validate detects cyclic dependencies
  const cyclePayload = {
    ...v2Payload,
    steps: [
      { ...v2Payload.steps[0], depends_on: ['step_asamblare'] },
      { ...v2Payload.steps[1], depends_on: ['step_braisage'] },
      { ...v2Payload.steps[2], depends_on: ['step_ciuperci'] },
    ],
  };

  const validateRes = await fetch(`${baseUrl}/api/recipes/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cyclePayload),
  });

  const valData = await validateRes.json();
  assert.strictEqual(valData.isValid, false);
  assert.ok(valData.errors.some((e: any) => e.code === 'ERR_CYCLIC_DEPENDENCY'));

  // 4. Backward Compatibility: Pure V1 POST without V2 fields
  const pureV1Payload = {
    title: 'Mămăligă Tradițională V1',
    category: 'Garnituri',
    summary: 'Rețetă simplă V1',
    yield: { quantity: 4, unit: 'porții' },
    timing: { active_minutes: 20, total_minutes: 25 },
    ingredients: [
      { ingredient_id: 'malai', name: 'Mălai', quantity: 400, unit: 'g', optional: false, sequence_order: 1 },
      { ingredient_id: 'apa', name: 'Apă', quantity: 1200, unit: 'ml', optional: false, sequence_order: 2 },
    ],
    steps: [
      { step_number: 1, instruction: 'Fierbe apa cu sare.', ingredient_refs: ['apa'] },
      { step_number: 2, instruction: 'Toarnă mălaiul în ploaie.', ingredient_refs: ['malai'] },
    ],
  };

  const v1Res = await fetch(`${baseUrl}/api/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pureV1Payload),
  });

  assert.strictEqual(v1Res.status, 201);
  const v1Data = await v1Res.json();
  assert.strictEqual(v1Data.validation.isValid, true);
  // Omitted V2 fields must be undefined, NOT empty arrays
  assert.strictEqual(v1Data.recipe.steps[0].depends_on, undefined);
  assert.strictEqual(v1Data.recipe.steps[0].allocations, undefined);
  assert.strictEqual(v1Data.recipe.steps[0].thermal_constraints, undefined);
  assert.strictEqual(v1Data.recipe.steps[0].risks, undefined);
  assert.strictEqual(v1Data.recipe.claims, undefined);
  assert.strictEqual(v1Data.recipe.timing.lead_time_hours, undefined);
});
