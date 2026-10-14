import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { initDatabase } from '../src/server/db.js';
import { RecipeRepository } from '../src/server/repository.js';
import { SEED_RECIPES } from '../src/shared/sample-data.js';
import { Recipe } from '../src/shared/types.js';

test('SQLite Backup and Restore Verification: VACUUM INTO, Integrity, and Schema Restoration', async (t) => {
  const sandboxDir = path.resolve(process.cwd(), 'data/test_backup_sandbox');
  if (fs.existsSync(sandboxDir)) {
    fs.rmSync(sandboxDir, { recursive: true, force: true });
  }
  fs.mkdirSync(sandboxDir, { recursive: true });

  const sourceDbPath = path.join(sandboxDir, 'source_test.db');
  const backupDbPath = path.join(sandboxDir, 'backup_snapshot.db');
  const restoredDbPath = path.join(sandboxDir, 'restored_test.db');

  let sourceDb: DatabaseSync | null = null;
  let backupDb: DatabaseSync | null = null;
  let restoredDb: DatabaseSync | null = null;
  let appDb: DatabaseSync | null = null;

  t.after(() => {
    // Ensure all connections are closed before attempting to delete files on Windows
    try { sourceDb?.close(); } catch {}
    try { backupDb?.close(); } catch {}
    try { restoredDb?.close(); } catch {}
    try { appDb?.close(); } catch {}

    if (fs.existsSync(sandboxDir)) {
      try {
        fs.rmSync(sandboxDir, { recursive: true, force: true });
      } catch (err) {
        console.warn('Warning: Could not remove test sandbox directory:', err);
      }
    }
  });

  // Step 1 & 2: Create disposable SQLite source database and insert representative records
  console.log(`[Backup Test] 1. Initializing source database at: ${sourceDbPath}`);
  sourceDb = initDatabase(sourceDbPath, SEED_RECIPES);
  const sourceRepo = new RecipeRepository(sourceDb);

  // Insert an additional representative dynamic recipe with relations
  const testRecipeId = 'rec_test_culinary_backup_999';
  const customRecipe: Recipe = {
    id: testRecipeId,
    recipe_id: 'mamaliga-cu-branza-burduf',
    version: '1.0.0',
    title: 'Mămăligă Tradițională cu Brânză de Burduf',
    summary: 'Preparat tradițional carpatic simplu și robust.',
    category: 'Fel Principal',
    culinary_tradition: 'Românească',
    region: 'Transilvania',
    status: 'published',
    yield: {
      quantity: 4,
      unit: 'porții',
    },
    timing: {
      active_minutes: 10,
      total_minutes: 35,
    },
    difficulty: 'easy',
    equipment: ['Ceaun de fontă', 'Făcăleț'],
    ingredients: [
      {
        id: 'ing_malai_01',
        ingredient_id: 'malai',
        name: 'Mălai grisat',
        quantity: 300,
        unit: 'g',
        preparation: null,
        group: 'Bază',
        optional: false,
        notes: 'Făină de porumb de calitate superioară',
        sequence_order: 1,
      },
      {
        id: 'ing_branza_02',
        ingredient_id: 'branza_burduf',
        name: 'Brânză de burduf',
        quantity: 200,
        unit: 'g',
        preparation: 'fărâmițată',
        group: 'Finisare',
        optional: false,
        notes: 'Maturată în coajă de brad',
        sequence_order: 2,
      },
    ],
    steps: [
      {
        id: 'step_mamaliga_01',
        step_id: 'step_mamaliga_01',
        step_number: 1,
        instruction: 'Puneți apa la fiert cu o linguriță de sare într-un ceaun de fontă.',
        duration_minutes: 5,
      },
      {
        id: 'step_mamaliga_02',
        step_id: 'step_mamaliga_02',
        step_number: 2,
        instruction: 'Turnați mălaiul în ploaie amestecând energic cu un făcăleț pentru a evita cocoloașele.',
        duration_minutes: 20,
      },
    ],
  };
  sourceRepo.saveRecipe(customRecipe);

  const initialRecipes = sourceRepo.getAllRecipes();
  assert.ok(initialRecipes.length >= 3, 'Source database must contain initial seed recipes plus new record');
  const expectedTitles = initialRecipes.map((r) => r.title).sort();

  // Close source connection so WAL is flushed
  sourceDb.close();
  sourceDb = null;

  // Step 3: Generate backup using scripts/backup-sqlite.js via child process
  console.log(`[Backup Test] 2. Executing scripts/backup-sqlite.js targeting: ${backupDbPath}`);
  const backupScriptPath = path.resolve(process.cwd(), 'scripts/backup-sqlite.js');
  
  const stdout = execFileSync(process.execPath, [backupScriptPath, backupDbPath], {
    env: {
      ...process.env,
      DATABASE_PATH: sourceDbPath,
    },
    encoding: 'utf-8',
  });
  console.log(`[Backup Test] Script stdout:\n${stdout.trim()}`);

  assert.ok(fs.existsSync(backupDbPath), 'Backup database file must exist on disk');
  const backupStats = fs.statSync(backupDbPath);
  assert.ok(backupStats.size > 0, `Backup file must be non-empty (size: ${backupStats.size} bytes)`);

  // Step 4: Verify backup integrity directly
  console.log('[Backup Test] 3. Verifying backup integrity via SQLite PRAGMA');
  backupDb = new DatabaseSync(backupDbPath, { readOnly: true });
  const backupIntegrity = backupDb.prepare('PRAGMA integrity_check;').all() as Array<{ integrity_check: string }>;
  assert.strictEqual(backupIntegrity[0]?.integrity_check, 'ok', 'Backup database integrity check must return "ok"');
  
  const backupFkCheck = backupDb.prepare('PRAGMA foreign_key_check;').all();
  assert.strictEqual(backupFkCheck.length, 0, 'Backup database must have zero foreign key violations');
  backupDb.close();
  backupDb = null;

  // Step 5: Restore the backup into a separate database file
  console.log(`[Backup Test] 4. Restoring backup to separate database file: ${restoredDbPath}`);
  fs.copyFileSync(backupDbPath, restoredDbPath);
  assert.ok(fs.existsSync(restoredDbPath), 'Restored database file must exist');

  // Step 6: Run SQLite integrity checks on restored database
  console.log('[Backup Test] 5. Running PRAGMA integrity checks on restored database');
  restoredDb = new DatabaseSync(restoredDbPath);
  const restoredIntegrity = restoredDb.prepare('PRAGMA integrity_check;').all() as Array<{ integrity_check: string }>;
  assert.strictEqual(restoredIntegrity[0]?.integrity_check, 'ok', 'Restored database integrity check must return "ok"');

  const restoredQuickCheck = restoredDb.prepare('PRAGMA quick_check;').all() as Array<{ quick_check: string }>;
  assert.strictEqual(restoredQuickCheck[0]?.quick_check, 'ok', 'Restored database quick check must return "ok"');

  const restoredFkCheck = restoredDb.prepare('PRAGMA foreign_key_check;').all();
  assert.strictEqual(restoredFkCheck.length, 0, 'Restored database must have zero foreign key violations');

  // Step 7: Read and compare expected records
  console.log('[Backup Test] 6. Verifying record contents and relational fidelity');
  const restoredRepo = new RecipeRepository(restoredDb);
  const restoredRecipes = restoredRepo.getAllRecipes();
  assert.strictEqual(restoredRecipes.length, initialRecipes.length, 'Restored recipe count must equal source recipe count');

  const restoredTitles = restoredRecipes.map((r) => r.title).sort();
  assert.deepStrictEqual(restoredTitles, expectedTitles, 'Restored recipe titles must match source titles exactly');

  // Deep-check the custom recipe with relations
  const restoredCustom = restoredRepo.getRecipeById(testRecipeId);
  assert.ok(restoredCustom, 'Custom recipe must be present in restored database');
  assert.strictEqual(restoredCustom.title, customRecipe.title);
  assert.strictEqual(restoredCustom.ingredients.length, 2, 'Must restore all 2 ingredients');
  assert.strictEqual(restoredCustom.steps.length, 2, 'Must restore all 2 steps');
  assert.strictEqual(restoredCustom.ingredients[0].name, 'Mălai grisat');
  assert.strictEqual(restoredCustom.steps[1].instruction, customRecipe.steps[1].instruction);

  restoredDb.close();
  restoredDb = null;

  // Step 8: Verify that the restored database can be opened seamlessly by the application layer
  console.log('[Backup Test] 7. Verifying application database layer initialization against restored file');
  appDb = initDatabase(restoredDbPath, []);
  const appRepo = new RecipeRepository(appDb);
  const verifiedList = appRepo.getAllRecipes();
  assert.strictEqual(verifiedList.length, initialRecipes.length, 'Application repo must load all restored recipes without error');
  appDb.close();
  appDb = null;

  console.log('✓ SQLite Backup and Restore isolated verification completed with 100% fidelity.');
});
