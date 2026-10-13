import test from 'node:test';
import assert from 'node:assert';
import { initDatabase } from '../src/server/db.js';
import { RecipeRepository } from '../src/server/repository.js';
import { Recipe } from '../src/shared/types.js';

test('RecipeRepository: initializes in-memory database and loads seeds', () => {
  const db = initDatabase(':memory:');
  const repo = new RecipeRepository(db);

  const recipes = repo.getAllRecipes();
  assert.ok(recipes.length >= 2, 'Expected at least 2 seeded recipes');

  const supa = recipes.find((r) => r.recipe_id === 'supa-simpla-de-legume');
  assert.ok(supa, 'Expected "supa-simpla-de-legume" seed to exist');
  assert.strictEqual(supa.title, 'Supă simplă de legume de grădină');
  assert.ok(supa.ingredients_count > 0);
  assert.ok(supa.steps_count > 0);
});

test('RecipeRepository: getRecipeById returns complete relational tree', () => {
  const db = initDatabase(':memory:');
  const repo = new RecipeRepository(db);

  const recipe = repo.getRecipeById('rec_supa_legume_001');
  assert.ok(recipe, 'Recipe should be found');
  assert.strictEqual(recipe.recipe_id, 'supa-simpla-de-legume');
  assert.strictEqual(recipe.title, 'Supă simplă de legume de grădină');
  assert.strictEqual(recipe.ingredients.length, 6);
  assert.strictEqual(recipe.steps.length, 4);

  // Check ingredient details
  const morcov = recipe.ingredients.find((i) => i.ingredient_id === 'morcov');
  assert.ok(morcov);
  assert.strictEqual(morcov.name, 'Morcov proaspăt');
  assert.strictEqual(morcov.quantity, 200);
  assert.strictEqual(morcov.unit, 'g');

  // Check step details and ingredient references
  const step1 = recipe.steps.find((s) => s.step_number === 1);
  assert.ok(step1);
  assert.ok(step1.ingredient_refs.includes('morcov'));
  assert.ok(step1.ingredient_refs.includes('ceapa'));
});

test('RecipeRepository: saves new recipe and updates it atomically', () => {
  const db = initDatabase(':memory:');
  const repo = new RecipeRepository(db);

  const newRecipe: Recipe = {
    id: 'rec_test_new_01',
    recipe_id: 'test-recipe-new',
    version: '1.0.0',
    title: 'Test Sarmale Tradiționale',
    summary: 'Sarmale în foi de varză murată',
    culinary_tradition: 'Românească',
    region: 'Moldova',
    category: 'Fel Principal',
    status: 'draft',
    yield: { quantity: 6, unit: 'porții' },
    timing: { active_minutes: 45, total_minutes: 180 },
    difficulty: 'mediu',
    equipment: ['Oală de lut'],
    allergens: [],
    sources: [],
    editorial_notes: [],
    ingredients: [
      {
        id: 'ing_1',
        ingredient_id: 'carne-porc',
        name: 'Carne tocată de porc',
        quantity: 500,
        unit: 'g',
        optional: false,
        sequence_order: 1,
        notes: null,
        preparation: null,
        group: null,
      },
      {
        id: 'ing_2',
        ingredient_id: 'orez',
        name: 'Orez cu bob rotund',
        quantity: 100,
        unit: 'g',
        optional: false,
        sequence_order: 2,
        notes: null,
        preparation: null,
        group: null,
      },
    ],
    steps: [
      {
        id: 'step_1',
        step_number: 1,
        instruction: 'Amestecă carnea cu orezul și condimentele.',
        duration_minutes: 15,
        temperature_c: null,
        heat_level: null,
        success_cue: 'Compoziție omogenă',
        ingredient_refs: ['carne-porc', 'orez'],
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 1. Insert
  const saved = repo.saveRecipe(newRecipe);
  assert.strictEqual(saved.id, 'rec_test_new_01');
  assert.strictEqual(saved.title, 'Test Sarmale Tradiționale');
  assert.strictEqual(saved.ingredients.length, 2);
  assert.strictEqual(saved.steps.length, 1);
  assert.deepStrictEqual(saved.steps[0].ingredient_refs, ['carne-porc', 'orez']);

  // 2. Update with modified content and new step
  const updatedRecipe: Recipe = {
    ...saved,
    title: 'Test Sarmale Tradiționale Modificate',
    status: 'technical_review',
    steps: [
      ...saved.steps,
      {
        id: 'step_2',
        step_number: 2,
        instruction: 'Fierbe la foc mic în oala de lut.',
        duration_minutes: 120,
        temperature_c: 95,
        heat_level: 'scăzut',
        success_cue: 'Varza este fragedă',
        ingredient_refs: [],
      },
    ],
  };

  const updated = repo.saveRecipe(updatedRecipe);
  assert.strictEqual(updated.title, 'Test Sarmale Tradiționale Modificate');
  assert.strictEqual(updated.status, 'technical_review');
  assert.strictEqual(updated.steps.length, 2);

  // Verify in database
  const fetched = repo.getRecipeById('rec_test_new_01');
  assert.ok(fetched);
  assert.strictEqual(fetched.title, 'Test Sarmale Tradiționale Modificate');
  assert.strictEqual(fetched.steps.length, 2);
});

test('RecipeRepository: deletes recipe with cascade deletion of children', () => {
  const db = initDatabase(':memory:');
  const repo = new RecipeRepository(db);

  const initialCount = repo.getAllRecipes().length;
  const deleted = repo.deleteRecipe('rec_supa_legume_001');
  assert.strictEqual(deleted, true);

  const afterCount = repo.getAllRecipes().length;
  assert.strictEqual(afterCount, initialCount - 1);

  const notFound = repo.getRecipeById('rec_supa_legume_001');
  assert.strictEqual(notFound, null);

  // Check that children are cleaned up
  const ingCount = db.prepare('SELECT COUNT(*) as count FROM recipe_ingredients WHERE recipe_id = ?').get('rec_supa_legume_001') as { count: number };
  assert.strictEqual(ingCount.count, 0);

  const stepCount = db.prepare('SELECT COUNT(*) as count FROM recipe_steps WHERE recipe_id = ?').get('rec_supa_legume_001') as { count: number };
  assert.strictEqual(stepCount.count, 0);
});
