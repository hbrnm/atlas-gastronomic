import test from 'node:test';
import assert from 'node:assert';
import { validateRecipe } from '../src/shared/validation.js';
import { Recipe } from '../src/shared/types.js';

test('validateRecipe: detects missing title', () => {
  const result = validateRecipe({
    title: '',
    ingredients: [{ id: '1', ingredient_id: 'sare', name: 'Sare', quantity: 5, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null }],
    steps: [{ id: '1', step_number: 1, instruction: 'Adaugă sarea în oală.', duration_minutes: 5, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: ['sare'] }],
  });

  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.some((e) => e.code === 'ERR_TITLE_REQUIRED'));
});

test('validateRecipe: detects missing ingredients', () => {
  const result = validateRecipe({
    title: 'Ciorbă Rădăuțeană',
    ingredients: [],
    steps: [{ id: '1', step_number: 1, instruction: 'Fierbe carnea în apă.', duration_minutes: 30, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: [] }],
  });

  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.some((e) => e.code === 'ERR_INGREDIENTS_EMPTY'));
});

test('validateRecipe: detects missing quantities for mandatory ingredients', () => {
  const result = validateRecipe({
    title: 'Mămăligă',
    ingredients: [
      { id: '1', ingredient_id: 'malai', name: 'Mălai', quantity: null, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null },
    ],
    steps: [{ id: '1', step_number: 1, instruction: 'Fierbe mălaiul în ceaun.', duration_minutes: 20, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: ['malai'] }],
  });

  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.some((e) => e.code === 'ERR_INGREDIENT_QUANTITY_REQUIRED'));
});

test('validateRecipe: allows null quantity for optional ingredients', () => {
  const result = validateRecipe({
    title: 'Mămăligă',
    ingredients: [
      { id: '1', ingredient_id: 'malai', name: 'Mălai', quantity: 300, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null },
      { id: '2', ingredient_id: 'unt', name: 'Unt', quantity: null, unit: null, optional: true, sequence_order: 2, notes: null, preparation: null, group: null },
    ],
    steps: [{ id: '1', step_number: 1, instruction: 'Fierbe mălaiul și adaugă untul.', duration_minutes: 20, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: ['malai', 'unt'] }],
  });

  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.errors.length, 0);
});

test('validateRecipe: detects empty steps', () => {
  const result = validateRecipe({
    title: 'Tocăniță',
    ingredients: [{ id: '1', ingredient_id: 'ceapa', name: 'Ceapă', quantity: 100, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null }],
    steps: [],
  });

  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.some((e) => e.code === 'ERR_STEPS_EMPTY'));
});

test('validateRecipe: detects invalid step ordering', () => {
  const result = validateRecipe({
    title: 'Friptură',
    ingredients: [{ id: '1', ingredient_id: 'carne', name: 'Carne', quantity: 500, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null }],
    steps: [
      { id: '1', step_number: 2, instruction: 'Coace carnea la cuptor.', duration_minutes: 40, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: ['carne'] },
    ],
  });

  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.some((e) => e.code === 'ERR_STEP_ORDER_INVALID'));
});

test('validateRecipe: detects invalid ingredient references in steps', () => {
  const result = validateRecipe({
    title: 'Salată Orientală',
    ingredients: [{ id: '1', ingredient_id: 'cartof', name: 'Cartofi', quantity: 400, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null }],
    steps: [
      { id: '1', step_number: 1, instruction: 'Fierbe cartofii și adaugă măslinele.', duration_minutes: 25, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: ['cartof', 'masline_inexistente'] },
    ],
  });

  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.some((e) => e.code === 'ERR_STEP_INVALID_INGREDIENT_REF'));
});

test('validateRecipe: warns on declared ingredients never referenced in steps', () => {
  const result = validateRecipe({
    title: 'Ciorbă de fasole',
    ingredients: [
      { id: '1', ingredient_id: 'fasole', name: 'Fasole', quantity: 300, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null },
      { id: '2', ingredient_id: 'leustean', name: 'Leuștean', quantity: 10, unit: 'g', optional: false, sequence_order: 2, notes: null, preparation: null, group: null },
    ],
    steps: [
      { id: '1', step_number: 1, instruction: 'Fierbe fasolea în apă rece.', duration_minutes: 60, temperature_c: null, heat_level: null, success_cue: null, ingredient_refs: ['fasole'] },
    ],
  });

  // Valid because warnings do not block validity
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.errors.length, 0);
  assert.ok(result.warnings.some((w) => w.code === 'WARN_INGREDIENT_NOT_REFERENCED'));
});
