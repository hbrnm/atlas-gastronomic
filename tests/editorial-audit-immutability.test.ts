import { test } from 'node:test';
import assert from 'node:assert';
import { initDatabase } from '../src/server/db.js';
import { RecipeRepository, AuthenticatedActor } from '../src/server/repository.js';
import { COMPLETE_CATALOGUE } from '../src/shared/sample-data.js';

test('Phase 009 Editorial Audit Trail Immutability & Preservation', async (t) => {
  const db = initDatabase(':memory:', COMPLETE_CATALOGUE);
  const repo = new RecipeRepository(db);

  const actor: AuthenticatedActor = {
    actor_id: 'usr_audit_tester',
    actor_role: 'editor',
    is_human: true,
    display_name: 'Audit Tester',
  };

  const recipeId = 'rec_tagliatelle_ragu_001';

  // 1. Generate an audit log entry
  const { auditRecord } = repo.saveEditorial(
    recipeId,
    {
      editorial_subtitle: 'Subtitlu pentru testare audit immutabilitate',
      editorial_status: 'in_review',
    },
    actor,
    'Creare intrare de test pentru audit'
  );

  const auditId = auditRecord.id;

  await t.test('1. Direct UPDATE on recipe_editorial_audit is aborted by SQLite trigger', () => {
    assert.throws(
      () => {
        db.prepare('UPDATE recipe_editorial_audit SET rationale = ? WHERE id = ?').run(
          'Falsificare jurnal de audit',
          auditId
        );
      },
      (err: any) => {
        assert.ok(
          err.message.includes('immutable') || err.message.includes('cannot be updated'),
          `Expected trigger abort, got: ${err.message}`
        );
        return true;
      }
    );

    // Verify row was not modified
    const row = db.prepare('SELECT rationale FROM recipe_editorial_audit WHERE id = ?').get(auditId) as any;
    assert.strictEqual(row.rationale, 'Creare intrare de test pentru audit');
  });

  await t.test('2. Direct DELETE on recipe_editorial_audit is aborted by SQLite trigger', () => {
    assert.throws(
      () => {
        db.prepare('DELETE FROM recipe_editorial_audit WHERE id = ?').run(auditId);
      },
      (err: any) => {
        assert.ok(
          err.message.includes('permanent') || err.message.includes('cannot be deleted'),
          `Expected trigger abort, got: ${err.message}`
        );
        return true;
      }
    );

    // Verify row still exists
    const row = db.prepare('SELECT id FROM recipe_editorial_audit WHERE id = ?').get(auditId);
    assert.ok(row, 'Audit row must remain intact after delete attempt');
  });

  await t.test('3. Deleting recipe preserves audit history (No cascade delete on audit trail)', () => {
    // Verify recipe exists
    assert.ok(repo.getRecipeById(recipeId));

    // Delete the recipe
    const deleted = repo.deleteRecipe(recipeId);
    assert.strictEqual(deleted, true);

    // Recipe is gone
    assert.strictEqual(repo.getRecipeById(recipeId), null);

    // But audit entry MUST STILL EXIST!
    const preservedAudit = db.prepare('SELECT * FROM recipe_editorial_audit WHERE id = ?').get(auditId) as any;
    assert.ok(preservedAudit, 'Audit record must survive recipe deletion');
    assert.strictEqual(preservedAudit.recipe_id, recipeId);
    assert.ok(preservedAudit.recipe_title, 'Preserved title must exist');
    assert.ok(preservedAudit.recipe_slug, 'Preserved slug must exist');
  });
});
