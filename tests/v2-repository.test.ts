import test from 'node:test';
import assert from 'node:assert';
import { DatabaseSync } from 'node:sqlite';
import { initDatabase, createV2RollbackBackup, applyV2Migration } from '../src/server/db.js';
import { RecipeRepository } from '../src/server/repository.js';
import { Recipe } from '../src/shared/types.js';

test('V2 Repository: Controlled step_id backfill on legacy V1 table', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');

  // Simulate V1 schema without V2 columns
  db.exec(`
    CREATE TABLE recipes (
      id TEXT PRIMARY KEY,
      recipe_id TEXT UNIQUE NOT NULL,
      version TEXT NOT NULL DEFAULT '1.0.0',
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      culinary_tradition TEXT,
      region TEXT,
      category TEXT NOT NULL DEFAULT 'General',
      status TEXT NOT NULL DEFAULT 'draft',
      yield_quantity REAL NOT NULL DEFAULT 4,
      yield_unit TEXT NOT NULL DEFAULT 'porții',
      yield_approx_final_weight_g REAL,
      active_minutes INTEGER,
      total_minutes INTEGER,
      difficulty TEXT,
      equipment_json TEXT DEFAULT '[]',
      allergens_json TEXT DEFAULT '[]',
      sources_json TEXT DEFAULT '[]',
      editorial_notes_json TEXT DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE recipe_ingredients (
      id TEXT PRIMARY KEY,
      recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      ingredient_id TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity REAL,
      unit TEXT,
      preparation TEXT,
      group_name TEXT,
      optional INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      sequence_order INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE recipe_steps (
      id TEXT PRIMARY KEY,
      recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      step_number INTEGER NOT NULL,
      instruction TEXT NOT NULL,
      duration_minutes REAL,
      temperature_c REAL,
      heat_level TEXT,
      success_cue TEXT
    );

    CREATE TABLE step_ingredient_refs (
      step_id TEXT NOT NULL REFERENCES recipe_steps(id) ON DELETE CASCADE,
      ingredient_id TEXT NOT NULL,
      PRIMARY KEY (step_id, ingredient_id)
    );
  `);

  // Insert pure V1 recipe
  db.prepare(`
    INSERT INTO recipes (id, recipe_id, title, summary, created_at, updated_at)
    VALUES ('rec_v1', 'ciorba-radauteana', 'Ciorbă Rădăuțeană', 'Ciorbă tradițională', '2026-10-14T00:00:00Z', '2026-10-14T00:00:00Z')
  `).run();

  db.prepare(`
    INSERT INTO recipe_steps (id, recipe_id, step_number, instruction)
    VALUES 
      ('s1', 'rec_v1', 1, 'Fierbe puiul.'),
      ('s2', 'rec_v1', 2, 'Adaugă smântâna și usturoiul.')
  `).run();

  // Run V2 Migration
  applyV2Migration(db);

  // Assert step_id was backfilled stably and correctly
  const steps = db.prepare('SELECT id, step_id, step_number FROM recipe_steps ORDER BY step_number ASC').all() as any[];
  assert.strictEqual(steps.length, 2);
  assert.strictEqual(steps[0].step_id, 'ciorba-radauteana_step_1');
  assert.strictEqual(steps[1].step_id, 'ciorba-radauteana_step_2');

  // Verify unique index was created
  const indexes = db.prepare("PRAGMA index_list('recipe_steps')").all() as any[];
  assert.ok(indexes.some((idx) => idx.name === 'idx_recipe_steps_unique_step_id' && idx.unique === 1));
});

test('V2 Repository: step_id stability across reordering', () => {
  const db = initDatabase(':memory:');
  const repo = new RecipeRepository(db);

  const testRecipe: Recipe = {
    id: 'rec_stabilitate_001',
    recipe_id: 'test-stabilitate',
    version: '2.0.0',
    title: 'Test Stabilitate Step ID',
    summary: 'Test',
    culinary_tradition: null,
    region: null,
    category: 'Test',
    status: 'draft',
    yield: { quantity: 2, unit: 'porții' },
    timing: { active_minutes: 10, total_minutes: 20 },
    difficulty: 'easy',
    ingredients: [
      { id: 'ing1', ingredient_id: 'ulei', name: 'Ulei', quantity: 10, unit: 'ml', optional: false, sequence_order: 1, notes: null, preparation: null, group: null },
    ],
    steps: [
      {
        id: 'step_first',
        step_id: 'step_marinare_carne',
        step_number: 1,
        instruction: 'Marinează carnea.',
        duration_minutes: 10,
        temperature_c: null,
        heat_level: null,
        success_cue: null,
        ingredient_refs: ['ulei'],
        depends_on: [],
      },
      {
        id: 'step_second',
        step_id: 'step_gatire_carne',
        step_number: 2,
        instruction: 'Gătește carnea marinată.',
        duration_minutes: 10,
        temperature_c: null,
        heat_level: null,
        success_cue: null,
        ingredient_refs: ['ulei'],
        depends_on: ['step_marinare_carne'],
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  repo.saveRecipe(testRecipe);

  const fetched = repo.getRecipeById('rec_stabilitate_001')!;
  assert.strictEqual(fetched.steps[0].step_id, 'step_marinare_carne');
  assert.strictEqual(fetched.steps[1].step_id, 'step_gatire_carne');

  // Now reorder steps: invert step_numbers but KEEP step_id
  fetched.steps[0].step_number = 2;
  fetched.steps[1].step_number = 1;

  repo.saveRecipe(fetched);

  const reordered = repo.getRecipeById('rec_stabilitate_001')!;
  // Step with step_number 1 is now step_gatire_carne
  const s1 = reordered.steps.find((s) => s.step_number === 1)!;
  const s2 = reordered.steps.find((s) => s.step_number === 2)!;

  assert.strictEqual(s1.step_id, 'step_gatire_carne');
  assert.strictEqual(s2.step_id, 'step_marinare_carne');
  // Dependency reference to step_marinare_carne remains valid and untouched
  assert.deepStrictEqual(s1.depends_on, ['step_marinare_carne']);
});

test('V2 Repository: Distinguishes between absent field, null, and empty array', () => {
  const db = initDatabase(':memory:');
  const repo = new RecipeRepository(db);

  // Pure V1-like recipe (fields omitted / undefined)
  const v1Recipe: Recipe = {
    id: 'rec_pure_v1',
    recipe_id: 'pure-v1-check',
    version: '1.0.0',
    title: 'Pure V1 Recipe',
    summary: 'Testing absence distinction',
    culinary_tradition: null,
    region: null,
    category: 'Test',
    status: 'draft',
    yield: { quantity: 4, unit: 'porții' },
    timing: { active_minutes: 15, total_minutes: 30 },
    difficulty: 'easy',
    ingredients: [
      { id: 'ing1', ingredient_id: 'sare', name: 'Sare', quantity: 5, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null },
    ],
    steps: [
      {
        id: 's1',
        step_number: 1,
        instruction: 'Adaugă sarea.',
        duration_minutes: 5,
        temperature_c: null,
        heat_level: null,
        success_cue: null,
        ingredient_refs: ['sare'],
        // Note: depends_on, allocations, thermal_constraints, risks are all omitted (undefined)
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  repo.saveRecipe(v1Recipe);
  const fetched = repo.getRecipeById('rec_pure_v1')!;

  // Must NOT be converted to empty arrays []!
  assert.strictEqual(fetched.steps[0].depends_on, undefined);
  assert.strictEqual(fetched.steps[0].allocations, undefined);
  assert.strictEqual(fetched.steps[0].thermal_constraints, undefined);
  assert.strictEqual(fetched.steps[0].risks, undefined);
  assert.strictEqual(fetched.claims, undefined);
  assert.strictEqual(fetched.timing.lead_time_hours, undefined);

  // Now create a V2 recipe with explicit empty array [] for parallel root step
  const v2Recipe: Recipe = {
    ...v1Recipe,
    id: 'rec_explicit_v2',
    recipe_id: 'explicit-v2-check',
    steps: [
      {
        ...v1Recipe.steps[0],
        id: 's1_v2',
        step_id: 'root_step',
        depends_on: [], // Explicit empty array = parallel root!
        allocations: [{ ingredient_id: 'sare', quantity_used_in_step: 3, unit: 'g' }],
        thermal_constraints: [{ measurement_point: 'equipment', target_c: 180, constraint_type: 'technological_target' }],
        risks: [{ warning_type: 'culinary_quality', message: 'Atenție la ardere' }],
      },
    ],
    timing: {
      ...v1Recipe.timing,
      lead_time_hours: 12,
    },
    claims: [{ claim_id: 'c1', type: 'origin', statement: 'Tradiție testată', confidence: 'documented' }],
  };

  repo.saveRecipe(v2Recipe);
  const fetchedV2 = repo.getRecipeById('rec_explicit_v2')!;

  assert.deepStrictEqual(fetchedV2.steps[0].depends_on, []);
  assert.strictEqual(fetchedV2.steps[0].allocations?.length, 1);
  assert.strictEqual(fetchedV2.steps[0].allocations?.[0].quantity_used_in_step, 3);
  assert.strictEqual(fetchedV2.steps[0].thermal_constraints?.length, 1);
  assert.strictEqual(fetchedV2.steps[0].risks?.length, 1);
  assert.strictEqual(fetchedV2.timing.lead_time_hours, 12);
  assert.strictEqual(fetchedV2.claims?.length, 1);
});

test('V2 Repository: Rollback backup preserves V2 data safely', () => {
  const db = initDatabase(':memory:');
  const repo = new RecipeRepository(db);

  const v2Recipe: Recipe = {
    id: 'rec_for_backup',
    recipe_id: 'recipe-backup-test',
    version: '2.0.0',
    title: 'Backup Test Recipe',
    summary: 'Testing rollback backup',
    culinary_tradition: null,
    region: null,
    category: 'Test',
    status: 'draft',
    yield: { quantity: 1, unit: 'porție' },
    timing: { active_minutes: 5, total_minutes: 10, lead_time_hours: 24 },
    difficulty: 'easy',
    ingredients: [
      { id: 'ing1', ingredient_id: 'unt', name: 'Unt', quantity: 20, unit: 'g', optional: false, sequence_order: 1, notes: null, preparation: null, group: null },
    ],
    steps: [
      {
        id: 'step_bk',
        step_id: 'step_bk_1',
        step_number: 1,
        instruction: 'Topire unt.',
        duration_minutes: 5,
        temperature_c: null,
        heat_level: null,
        success_cue: null,
        ingredient_refs: ['unt'],
        depends_on: [],
        risks: [{ warning_type: 'irreversible_risk', message: 'Unt ars' }],
        allocations: [{ ingredient_id: 'unt', quantity_used_in_step: 20, unit: 'g' }],
      },
    ],
    claims: [{ claim_id: 'clm1', type: 'technique', statement: 'Beurre noisette', confidence: 'widely_attested' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  repo.saveRecipe(v2Recipe);

  // Execute rollback backup
  createV2RollbackBackup(db);

  // Assert backup tables were created and populated
  const recipeBackup = db.prepare('SELECT * FROM _v2_recipes_backup WHERE id = ?').get('rec_for_backup') as any;
  assert.ok(recipeBackup);
  assert.strictEqual(recipeBackup.lead_time_hours, 24);
  assert.ok(recipeBackup.claims_json.includes('Beurre noisette'));

  const stepBackup = db.prepare('SELECT * FROM _v2_steps_backup WHERE step_id = ?').get('step_bk_1') as any;
  assert.ok(stepBackup);
  assert.ok(stepBackup.risks_json.includes('Unt ars'));

  const allocBackup = db.prepare('SELECT * FROM _v2_allocations_backup WHERE ingredient_id = ?').get('unt') as any;
  assert.ok(allocBackup);
  assert.strictEqual(allocBackup.quantity_used_in_step, 20);
});
