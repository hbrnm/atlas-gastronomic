import test from 'node:test';
import assert from 'node:assert';
import { createExpressApp } from '../src/server/app.js';
import { RecipeRepository } from '../src/server/repository.js';
import { initDatabase } from '../src/server/db.js';
import { SEED_RECIPES, COMPLETE_CATALOGUE } from '../src/shared/sample-data.js';
import { Server } from 'node:http';

test('Shared Access Key Authentication: Public Read + Protected Editorial Writes', async (t) => {
  const editorialKey = 'atlas_top_secret_editorial_2026';
  process.env.ATLAS_EDITORIAL_KEY = editorialKey;
  delete process.env.ATLAS_ACCESS_KEY;
  t.after(() => {
    delete process.env.ATLAS_EDITORIAL_KEY;
  });

  const db = initDatabase(':memory:', SEED_RECIPES);
  const repo = new RecipeRepository(db);
  const app = createExpressApp(repo);

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  t.after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  const address = server.address() as any;
  const baseUrl = `http://localhost:${address.port}`;

  // 0. GET /api/health — Health check endpoint must always return 200 without authentication
  const healthRes = await fetch(`${baseUrl}/api/health`);
  assert.strictEqual(healthRes.status, 200, 'Health check must return 200');
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'ok');
  assert.strictEqual(healthData.service, 'Atlas Gastronomic — Recipe Core V1');
  assert.ok(healthData.timestamp, 'Health check must include ISO timestamp');

  // 1. GET /api/recipes — Readers can browse recipes without any access key
  const getRes = await fetch(`${baseUrl}/api/recipes`);
  assert.strictEqual(getRes.status, 200, 'Public read access must be allowed when ATLAS_ACCESS_KEY is not set');
  const recipes = await getRes.json();
  assert.ok(Array.isArray(recipes) && recipes.length > 0);

  // 2. Auth status check (no secrets leaked)
  const statusWithoutKey = await fetch(`${baseUrl}/api/auth/status`).then((r) => r.json());
  assert.strictEqual(statusWithoutKey.privateAccessRequired, false);
  assert.strictEqual(statusWithoutKey.editorialAuthRequired, true);
  assert.strictEqual(statusWithoutKey.readAuthenticated, true);
  assert.strictEqual(statusWithoutKey.writeAuthenticated, false);
  assert.strictEqual((statusWithoutKey as any).secret, undefined);
  assert.strictEqual((statusWithoutKey as any).key, undefined);

  const statusWithKey = await fetch(`${baseUrl}/api/auth/status`, {
    headers: { 'x-atlas-editorial-key': editorialKey },
  }).then((r) => r.json());
  assert.strictEqual(statusWithKey.writeAuthenticated, true);

  // 3. Write attempt without key -> 401 Unauthorized
  const unauthorizedPost = await fetch(`${baseUrl}/api/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Rețetă Neautorizată',
    }),
  });
  assert.strictEqual(unauthorizedPost.status, 401, 'POST without editorial key must return 401');
  const unauthBody = await unauthorizedPost.json();
  assert.strictEqual(unauthBody.code, 'EDITORIAL_AUTH_REQUIRED');

  // 4. Write attempt with wrong key -> 401 Unauthorized
  const wrongKeyPost = await fetch(`${baseUrl}/api/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-atlas-editorial-key': 'wrong-key',
    },
    body: JSON.stringify({
      title: 'Rețetă Gresita',
    }),
  });
  assert.strictEqual(wrongKeyPost.status, 401, 'POST with invalid key must return 401');

  // 5. Authorized write with valid editorial key -> 201 Created
  const authorizedPost = await fetch(`${baseUrl}/api/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-atlas-editorial-key': editorialKey,
    },
    body: JSON.stringify({
      title: 'Rețetă Autorizată Redacțional',
      category: 'Desert',
      ingredients: [
        {
          id: 'ing_aut_1',
          ingredient_id: 'ciocolata',
          name: 'Ciocolată Neagră 70%',
          quantity: 200,
          unit: 'g',
          preparation: null,
          group: null,
          optional: false,
          notes: null,
          sequence_order: 1,
        },
      ],
      steps: [
        {
          id: 'step_aut_1',
          step_id: 'step_aut_1',
          step_number: 1,
          instruction: 'Topiți ciocolata la bain-marie la foc scăzut.',
          duration_minutes: 5,
        },
      ],
    }),
  });
  assert.strictEqual(authorizedPost.status, 201, 'POST with valid key must succeed');
  const created = await authorizedPost.json();
  assert.strictEqual(created.recipe.title, 'Rețetă Autorizată Redacțional');

  // 6. Authorized delete with valid key
  const authorizedDelete = await fetch(`${baseUrl}/api/recipes/${created.recipe.id}`, {
    method: 'DELETE',
    headers: { 'x-atlas-editorial-key': editorialKey },
  });
  assert.strictEqual(authorizedDelete.status, 200, 'DELETE with valid key must succeed');
});

test('Shared Access Key Authentication: Private App Mode protects reading routes', async (t) => {
  const privateAccessKey = 'secret_family_guest_2026';
  const editorialKey = 'atlas_admin_2026';
  process.env.ATLAS_ACCESS_KEY = privateAccessKey;
  process.env.ATLAS_EDITORIAL_KEY = editorialKey;
  t.after(() => {
    delete process.env.ATLAS_ACCESS_KEY;
    delete process.env.ATLAS_EDITORIAL_KEY;
  });

  const db = initDatabase(':memory:', COMPLETE_CATALOGUE);
  const repo = new RecipeRepository(db);
  const app = createExpressApp(repo);

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  t.after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  const address = server.address() as any;
  const baseUrl = `http://localhost:${address.port}`;

  // 0. Health check must respond 200 without authentication even in strict private mode
  const healthCheck = await fetch(`${baseUrl}/api/health`);
  assert.strictEqual(healthCheck.status, 200, 'Health check must be open without credentials');
  const healthJson = await healthCheck.json();
  assert.strictEqual(healthJson.status, 'ok');

  // 1. Unauthenticated GET /api/recipes -> 401
  const unauthGet = await fetch(`${baseUrl}/api/recipes`);
  assert.strictEqual(unauthGet.status, 401, 'GET /api/recipes without access key must return 401 in private mode');
  const unauthBody = await unauthGet.json();
  assert.strictEqual(unauthBody.code, 'APP_AUTH_REQUIRED');

  // 2. Authenticated GET with x-atlas-access-key header -> 200
  const authGet = await fetch(`${baseUrl}/api/recipes`, {
    headers: { 'x-atlas-access-key': privateAccessKey },
  });
  assert.strictEqual(authGet.status, 200, 'GET /api/recipes with valid access key must return 200');
  const recipes = await authGet.json();
  assert.ok(Array.isArray(recipes) && recipes.length >= 12);
  const sampleId = recipes[0].id;

  // 3. Unauthenticated GET /api/recipes/:id -> 401
  const unauthGetOne = await fetch(`${baseUrl}/api/recipes/${sampleId}`);
  assert.strictEqual(unauthGetOne.status, 401, 'GET /api/recipes/:id without access key must return 401 in private mode');

  // 4. Authenticated GET with Bearer token -> 200
  const authBearerGet = await fetch(`${baseUrl}/api/recipes/${sampleId}`, {
    headers: { Authorization: `Bearer ${privateAccessKey}` },
  });
  assert.strictEqual(authBearerGet.status, 200, 'GET with Bearer access key must return 200');
  const sampleRecipe = await authBearerGet.json();
  assert.ok(sampleRecipe && sampleRecipe.recipe && sampleRecipe.recipe.id === sampleId);

  // 5. Read key cannot perform editorial operations
  const readKeyPost = await fetch(`${baseUrl}/api/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-atlas-editorial-key': privateAccessKey,
    },
    body: JSON.stringify({ title: 'Tentativă Neautorizată' }),
  });
  assert.strictEqual(readKeyPost.status, 401, 'Read access key must not permit editorial writes');

  // 6. Verify endpoint validates access keys
  const verifyValid = await fetch(`${baseUrl}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: privateAccessKey }),
  }).then((r) => r.json());
  assert.strictEqual(verifyValid.valid, true);
  assert.strictEqual(verifyValid.canRead, true);
  assert.strictEqual(verifyValid.canWrite, false);

  const verifyEditorial = await fetch(`${baseUrl}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: editorialKey }),
  }).then((r) => r.json());
  assert.strictEqual(verifyEditorial.valid, true);
  assert.strictEqual(verifyEditorial.canRead, true);
  assert.strictEqual(verifyEditorial.canWrite, true);
});

test('Shared Access Key Authentication: Fail-closed in Production when credentials missing', async (t) => {
  const origNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  process.env.ATLAS_REQUIRE_AUTH = 'true';
  delete process.env.ATLAS_EDITORIAL_KEY;
  delete process.env.ATLAS_EDITORIAL_PASSKEY;
  delete process.env.ATLAS_ACCESS_KEY;

  t.after(() => {
    process.env.NODE_ENV = origNodeEnv;
    delete process.env.ATLAS_REQUIRE_AUTH;
  });

  const db = initDatabase(':memory:', SEED_RECIPES);
  const repo = new RecipeRepository(db);
  const app = createExpressApp(repo);

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  t.after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  const address = server.address() as any;
  const baseUrl = `http://localhost:${address.port}`;

  // Write attempt when credentials are missing in production must return 403 CREDENTIALS_MISSING_SERVER (fail-closed)
  const failClosedPost = await fetch(`${baseUrl}/api/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Rețetă Blocată' }),
  });
  const resBody = await failClosedPost.json();
  assert.strictEqual(resBody.code, 'CREDENTIALS_MISSING_SERVER');
});

test('Shared Access Key Authentication: Rate limiting enforces max 5 attempts per 15 minutes and returns 429 with Retry-After', async (t) => {
  const accessKey = 'access_rate_limit_test_key';
  const editorialKey = 'editorial_rate_limit_test_key';
  process.env.ATLAS_ACCESS_KEY = accessKey;
  process.env.ATLAS_EDITORIAL_KEY = editorialKey;
  t.after(() => {
    delete process.env.ATLAS_ACCESS_KEY;
    delete process.env.ATLAS_EDITORIAL_KEY;
  });

  const db = initDatabase(':memory:', SEED_RECIPES);
  const repo = new RecipeRepository(db);
  const app = createExpressApp(repo);

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  t.after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  const address = server.address() as any;
  const baseUrl = `http://localhost:${address.port}`;

  const clientIpA = '203.0.113.10';
  const clientIpB = '203.0.113.20';

  // Attempts 1 through 5 from Client IP A should be processed (returns 401 for wrong key)
  for (let i = 1; i <= 5; i++) {
    const res = await fetch(`${baseUrl}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': clientIpA,
      },
      body: JSON.stringify({ key: `wrong-attempt-${i}` }),
    });
    assert.strictEqual(res.status, 401, `Attempt ${i} should reach verification and return 401`);
    const body = await res.json();
    assert.strictEqual(body.valid, false);
  }

  // Attempt 6 from Client IP A must be blocked with HTTP 429 Too Many Requests
  const blockedRes = await fetch(`${baseUrl}/api/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': clientIpA,
    },
    body: JSON.stringify({ key: 'wrong-attempt-6' }),
  });
  assert.strictEqual(blockedRes.status, 429, 'Attempt 6 must be blocked with HTTP 429');
  
  const retryAfter = blockedRes.headers.get('Retry-After');
  assert.ok(retryAfter, 'Retry-After header must be present');
  const retrySec = parseInt(retryAfter, 10);
  assert.ok(retrySec > 0 && retrySec <= 900, 'Retry-After must be within 15 minutes (900s)');

  const blockedBody = await blockedRes.json();
  assert.strictEqual(blockedBody.valid, false);
  assert.strictEqual(blockedBody.code, 'AUTH_RATE_LIMIT_EXCEEDED');

  // Verify IP Isolation: Client IP B has its own independent 5-attempt budget
  const otherIpRes = await fetch(`${baseUrl}/api/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': clientIpB,
    },
    body: JSON.stringify({ key: editorialKey }),
  });
  assert.strictEqual(otherIpRes.status, 200, 'Client IP B should not be blocked by Client IP A rate limit');
  const otherBody = await otherIpRes.json();
  assert.strictEqual(otherBody.valid, true);
  assert.strictEqual(otherBody.canWrite, true);
});
