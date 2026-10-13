import test from 'node:test';
import assert from 'node:assert';
import { initDatabase } from '../src/server/db.js';
import { RecipeRepository } from '../src/server/repository.js';
import { createExpressApp } from '../src/server/app.js';
import { AddressInfo } from 'node:net';

test('Express API: /api/health returns ok status', async (t) => {
  const db = initDatabase(':memory:');
  const repo = new RecipeRepository(db);
  const app = createExpressApp(repo);

  const server = app.listen(0);
  t.after(() => server.close());

  const port = (server.address() as AddressInfo).port;
  const res = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.strictEqual(res.status, 200);

  const json = await res.json();
  assert.strictEqual(json.status, 'ok');
  assert.strictEqual(json.service, 'Atlas Gastronomic — Recipe Core V1');
});

test('Express API: /api/recipes returns seed recipes', async (t) => {
  const db = initDatabase(':memory:');
  const repo = new RecipeRepository(db);
  const app = createExpressApp(repo);

  const server = app.listen(0);
  t.after(() => server.close());

  const port = (server.address() as AddressInfo).port;
  const res = await fetch(`http://127.0.0.1:${port}/api/recipes`);
  assert.strictEqual(res.status, 200);

  const list = await res.json();
  assert.ok(Array.isArray(list));
  assert.ok(list.length >= 2);
});

test('Express API: POST /api/recipes/validate detects validation issues', async (t) => {
  const db = initDatabase(':memory:');
  const repo = new RecipeRepository(db);
  const app = createExpressApp(repo);

  const server = app.listen(0);
  t.after(() => server.close());

  const port = (server.address() as AddressInfo).port;
  const res = await fetch(`http://127.0.0.1:${port}/api/recipes/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '' }),
  });

  assert.strictEqual(res.status, 200);
  const validation = await res.json();
  assert.strictEqual(validation.isValid, false);
  assert.ok(validation.errors.length > 0);
});

test('Express API: full lifecycle POST -> GET -> PUT -> DELETE', async (t) => {
  const db = initDatabase(':memory:');
  const repo = new RecipeRepository(db);
  const app = createExpressApp(repo);

  const server = app.listen(0);
  t.after(() => server.close());

  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  // 1. POST Create
  const createRes = await fetch(`${baseUrl}/api/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Papanași moldovenești',
      summary: 'Papanași fierți cu brânză dulce de vaci și pesmet rumenit',
      culinary_tradition: 'Românească',
      region: 'Moldova',
      category: 'Deserturi',
      status: 'draft',
      ingredients: [
        {
          ingredient_id: 'branza-dulce',
          name: 'Brânză de vaci proaspătă',
          quantity: 400,
          unit: 'g',
          sequence_order: 1,
        },
        {
          ingredient_id: 'gris',
          name: 'Griș fin de grâu',
          quantity: 100,
          unit: 'g',
          sequence_order: 2,
        },
      ],
      steps: [
        {
          step_number: 1,
          instruction: 'Amestecă brânza de vaci bine scursă cu grișul și ouăle.',
          duration_minutes: 10,
          ingredient_refs: ['branza-dulce', 'gris'],
        },
      ],
    }),
  });

  assert.strictEqual(createRes.status, 201);
  const createPayload = await createRes.json();
  const created = createPayload.recipe;
  assert.ok(created.id);
  assert.strictEqual(created.title, 'Papanași moldovenești');

  // 2. GET by ID
  const getRes = await fetch(`${baseUrl}/api/recipes/${created.id}`);
  assert.strictEqual(getRes.status, 200);
  const fetched = await getRes.json();
  assert.strictEqual(fetched.recipe.id, created.id);
  assert.strictEqual(fetched.validation.isValid, true);

  // 3. PUT Update
  const updateRes = await fetch(`${baseUrl}/api/recipes/${created.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...fetched.recipe,
      title: 'Papanași moldovenești cu smântână și dulceață',
      status: 'technical_review',
    }),
  });
  assert.strictEqual(updateRes.status, 200);
  const updatePayload = await updateRes.json();
  const updated = updatePayload.recipe;
  assert.strictEqual(updated.title, 'Papanași moldovenești cu smântână și dulceață');
  assert.strictEqual(updated.status, 'technical_review');

  // 4. DELETE
  const deleteRes = await fetch(`${baseUrl}/api/recipes/${created.id}`, {
    method: 'DELETE',
  });
  assert.strictEqual(deleteRes.status, 200);

  // 5. Verify 404
  const verifyRes = await fetch(`${baseUrl}/api/recipes/${created.id}`);
  assert.strictEqual(verifyRes.status, 404);
});
