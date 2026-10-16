import { test } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { initDatabase } from '../src/server/db.js';
import { RecipeRepository } from '../src/server/repository.js';
import { createExpressApp } from '../src/server/app.js';
import { COMPLETE_CATALOGUE } from '../src/shared/sample-data.js';

test('Phase 009 Express Editorial API Contract & Security Tests', async (t) => {
  const db = initDatabase(':memory:', COMPLETE_CATALOGUE);
  const repo = new RecipeRepository(db);
  const app = createExpressApp(repo);

  let server: http.Server;
  let baseUrl: string;

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const port = (server.address() as AddressInfo).port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  t.after(() => {
    server.close();
  });

  const recipeId = 'rec_tagliatelle_ragu_001';

  await t.test('1. GET /api/editorial returns all seeded editorial profiles', async () => {
    const res = await fetch(`${baseUrl}/api/editorial`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(typeof data === 'object');
    assert.ok(data[recipeId], 'Tagliatelle profile must exist in editorial catalog');
    assert.strictEqual(data[recipeId].editorial_status, 'draft');
  });

  await t.test('2. GET /api/recipes/:id includes attached editorial profile', async () => {
    const res = await fetch(`${baseUrl}/api/recipes/${recipeId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.recipe);
    assert.ok(data.recipe.editorial, 'Recipe detail must include editorial profile');
    assert.strictEqual(data.recipe.editorial.recipe_id, recipeId);
    assert.strictEqual(data.recipe.editorial.image_url, '/images/tagliatelle-ragu.jpg');
  });

  await t.test('3. GET /api/recipes/:id/editorial returns specific profile', async () => {
    const res = await fetch(`${baseUrl}/api/recipes/${recipeId}/editorial`);
    assert.strictEqual(res.status, 200);
    const editorial = await res.json();
    assert.strictEqual(editorial.recipe_id, recipeId);
    assert.strictEqual(editorial.editorial_status, 'draft');
  });

  await t.test('4. PUT /api/recipes/:id/editorial updates profile and appends audit row', async () => {
    const res = await fetch(`${baseUrl}/api/recipes/${recipeId}/editorial`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-atlas-actor-name': 'Test Editor',
      },
      body: JSON.stringify({
        editorial: {
          editorial_subtitle: 'Subtitlu actualizat via API dedicat',
          editorial_status: 'in_review',
        },
        rationale: 'Actualizare editorială prin endpoint dedicat',
      }),
    });

    assert.strictEqual(res.status, 200);
    const result = await res.json();
    assert.ok(result.editorial);
    assert.strictEqual(result.editorial.editorial_subtitle, 'Subtitlu actualizat via API dedicat');
    assert.strictEqual(result.editorial.editorial_status, 'in_review');
    assert.ok(result.auditRecord);
    assert.strictEqual(result.auditRecord.to_status, 'in_review');
  });

  await t.test('5. PUT /api/recipes/:id synchronizes recipe core and editorial in single atomic call', async () => {
    const recipeBefore = repo.getRecipeById(recipeId)!;
    const res = await fetch(`${baseUrl}/api/recipes/${recipeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-atlas-actor-name': 'Full Editor',
      },
      body: JSON.stringify({
        ...recipeBefore,
        summary: 'Rezumat actualizat sincronizat',
        editorial: {
          editorial_subtitle: 'Subtitlu actualizat sincronizat',
          terroir: 'Terroir actualizat sincronizat',
        },
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.recipe.summary, 'Rezumat actualizat sincronizat');
    assert.strictEqual(data.recipe.editorial.editorial_subtitle, 'Subtitlu actualizat sincronizat');
    assert.strictEqual(data.recipe.editorial.terroir, 'Terroir actualizat sincronizat');
  });

  await t.test('6. Anti-impersonation: automated agent rejected on approval request (fails closed 403)', async () => {
    const res = await fetch(`${baseUrl}/api/recipes/${recipeId}/editorial`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-atlas-agent-client': 'true',
        'x-atlas-actor-name': 'Autonomous Bot',
      },
      body: JSON.stringify({
        editorial: {
          editorial_status: 'approved',
          image_rights_status: 'verified',
        },
        rationale: 'Bot attempt to approve',
      }),
    });

    assert.strictEqual(res.status, 403);
    const err = await res.json();
    assert.ok(err.error.includes('FORBIDDEN'));
  });

  await t.test('7. GET /api/recipes/:id/editorial/audit returns immutable audit history', async () => {
    const res = await fetch(`${baseUrl}/api/recipes/${recipeId}/editorial/audit`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.recipe_id, recipeId);
    assert.ok(data.count > 0, 'Audit history must contain records from earlier updates');
    assert.ok(Array.isArray(data.audit_history));
    const firstLog = data.audit_history[0];
    assert.ok(firstLog.id);
    assert.ok(firstLog.from_status);
    assert.ok(firstLog.to_status);
    assert.ok(firstLog.created_at);
  });
});
