import { test } from 'node:test';
import assert from 'node:assert';
import { initDatabase } from '../src/server/db.js';
import { RecipeRepository, AuthenticatedActor } from '../src/server/repository.js';
import { COMPLETE_CATALOGUE } from '../src/shared/sample-data.js';

test('Phase 009 Editorial Lifecycle & Human Approval Governance', async (t) => {
  const db = initDatabase(':memory:', COMPLETE_CATALOGUE);
  const repo = new RecipeRepository(db);

  const humanEditor: AuthenticatedActor = {
    actor_id: 'usr_editor_01',
    actor_role: 'editor',
    is_human: true,
    display_name: 'Elena Popescu (Redactor)',
  };

  const humanReviewer: AuthenticatedActor = {
    actor_id: 'usr_reviewer_01',
    actor_role: 'reviewer',
    is_human: true,
    display_name: 'Dan Georgescu (Recenzent)',
  };

  const humanApprover: AuthenticatedActor = {
    actor_id: 'usr_approver_01',
    actor_role: 'approver',
    is_human: true,
    display_name: 'Mihai Voinea (Redactor-Șef Aprobator)',
  };

  const automatedAgent: AuthenticatedActor = {
    actor_id: 'agent_antigravity',
    actor_role: 'approver', // Attempted role escalation
    is_human: false,
    display_name: 'Atlas Autonomous Agent',
  };

  await t.test('1. All 12 canonical recipes are seeded in SQLite with draft status and unverified rights', () => {
    const allProfiles = repo.getAllEditorialProfiles();
    const recipeKeys = Object.keys(allProfiles);
    
    assert.strictEqual(recipeKeys.length, 12, 'All 12 seeded profiles must exist in SQLite');
    for (const key of recipeKeys) {
      const p = allProfiles[key];
      assert.strictEqual(p.editorial_status, 'draft', `Recipe ${key} must initialize in draft status`);
      assert.strictEqual(p.image_rights_status, 'unverified', `Recipe ${key} must initialize with unverified rights`);
      assert.strictEqual(p.approved_by, null, `Recipe ${key} must not be pre-approved`);
      assert.strictEqual(p.approved_at, null, `Recipe ${key} must not have pre-approval timestamp`);
      assert.strictEqual(p.profile_version, 1, `Recipe ${key} version must start at 1`);
    }
  });

  await t.test('2. Editor can update presentation fields and move status to in_review', () => {
    const recipeId = 'rec_tagliatelle_ragu_001';
    const res = repo.saveEditorial(
      recipeId,
      {
        editorial_subtitle: 'Subtitlu revizuit de redactor pentru ediția de toamnă.',
        editorial_status: 'in_review',
        terroir: 'Bazinul Padului și Parmigiano-Reggiano selecționat 30 luni.',
      },
      humanEditor,
      'Pregătire profil pentru revizuire colegială'
    );

    assert.strictEqual(res.editorial.editorial_status, 'in_review');
    assert.strictEqual(res.editorial.editorial_subtitle, 'Subtitlu revizuit de redactor pentru ediția de toamnă.');
    assert.strictEqual(res.editorial.profile_version, 2, 'Material edit increments profile version');
    assert.strictEqual(res.auditRecord.from_status, 'draft');
    assert.strictEqual(res.auditRecord.to_status, 'in_review');
    assert.strictEqual(res.auditRecord.actor_id, humanEditor.actor_id);
  });

  await t.test('3. Reviewer can reject to needs_revision', () => {
    const recipeId = 'rec_tagliatelle_ragu_001';
    const res = repo.saveEditorial(
      recipeId,
      {
        editorial_status: 'needs_revision',
      },
      humanReviewer,
      'Clarificări necesare cu privire la atestarea istorică din 1982'
    );

    assert.strictEqual(res.editorial.editorial_status, 'needs_revision');
    assert.strictEqual(res.auditRecord.from_status, 'in_review');
    assert.strictEqual(res.auditRecord.to_status, 'needs_revision');
  });

  await t.test('4. Automated agent CANNOT approve (Anti-Impersonation Governance Rule)', () => {
    const recipeId = 'rec_tagliatelle_ragu_001';
    assert.throws(
      () => {
        repo.saveEditorial(
          recipeId,
          {
            editorial_status: 'approved',
            image_rights_status: 'verified',
          },
          automatedAgent,
          'Agent approval attempt'
        );
      },
      (err: any) => {
        assert.ok(err.message.includes('FORBIDDEN'));
        assert.ok(err.message.includes('Automated agents cannot approve'));
        return true;
      }
    );
  });

  await t.test('5. Human approver cannot approve without verified image rights (Legal Rights Invariant)', () => {
    const recipeId = 'rec_tagliatelle_ragu_001';
    assert.throws(
      () => {
        repo.saveEditorial(
          recipeId,
          {
            editorial_status: 'approved',
            image_rights_status: 'unverified', // Unverified rights must block approval
          },
          humanApprover,
          'Aprobare fără drepturi verificate'
        );
      },
      (err: any) => {
        assert.ok(err.message.includes('VALIDATION_ERROR'));
        assert.ok(err.message.includes('image_rights_status = verified'));
        return true;
      }
    );
  });

  await t.test('6. Verified human approver successfully approves profile with verified rights', () => {
    const recipeId = 'rec_tagliatelle_ragu_001';
    const res = repo.saveEditorial(
      recipeId,
      {
        editorial_status: 'approved',
        image_rights_status: 'verified',
        image_attribution: 'Foto: Accademia Italiana della Cucina (CC-BY-SA-4.0)',
      },
      humanApprover,
      'Aprobare editorială finală confirmată de redactorul-șef'
    );

    assert.strictEqual(res.editorial.editorial_status, 'approved');
    assert.strictEqual(res.editorial.approved_by, humanApprover.actor_id);
    assert.ok(res.editorial.approved_at !== null, 'Approval timestamp must be recorded');
    assert.strictEqual(res.auditRecord.to_status, 'approved');
    assert.strictEqual(res.auditRecord.actor_id, humanApprover.actor_id);
  });

  await t.test('7. Automatic Approval Invalidation on Material Edits', () => {
    const recipeId = 'rec_tagliatelle_ragu_001';
    // Modify a presentation field (chef_quote) while attempting to keep 'approved'
    const res = repo.saveEditorial(
      recipeId,
      {
        chef_quote: '„Citat modificat ulterior fără o nouă recenzare.”',
        editorial_status: 'approved',
      },
      humanEditor,
      'Modificare neautorizată post-aprobare'
    );

    // SYSTEM MUST FAIL-SAFE: Automatically invalidate approval and drop back to in_review!
    assert.strictEqual(res.editorial.editorial_status, 'in_review', 'Must drop to in_review automatically');
    assert.strictEqual(res.editorial.approved_by, null, 'Previous approved_by must be cleared');
    assert.strictEqual(res.editorial.approved_at, null, 'Previous approved_at must be cleared');
    assert.ok(res.editorial.profile_version > 2, 'Profile version must increment on material invalidation');
    assert.ok(res.auditRecord.rationale.includes('Aprobare invalidată automat'), 'Audit log must record invalidation');
  });
});
