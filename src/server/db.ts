import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED_RECIPES, COMPLETE_CATALOGUE } from '../shared/sample-data.js';
import { Recipe } from '../shared/types.js';
import { CANONICAL_EDITORIAL_SEEDS } from './editorial-seeds.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getDatabasePath(): string {
  if (process.env.NODE_ENV === 'test' || process.env.DATABASE_URL === ':memory:') {
    return ':memory:';
  }
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }
  const dataDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'atlas_gastronomic.db');
}

export function hasColumn(db: DatabaseSync, table: string, column: string): boolean {
  try {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    return cols.some((c) => c.name.toLowerCase() === column.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Non-destructive additive migration from Recipe Core V1 to V2 MVP.
 * Satisfies PO Conditions:
 * 1. Persistent, stable step_id with controlled backfill and (recipe_id, step_id) unique index.
 * 2. Explicit representation of absence (NULL in DB maps to undefined, never forced to []).
 * 4. Safe migration with backup capabilities.
 */
export function applyV2Migration(db: DatabaseSync): void {
  db.exec('BEGIN TRANSACTION;');
  try {
    // 1. Recipes table additive columns
    if (!hasColumn(db, 'recipes', 'lead_time_hours')) {
      db.exec('ALTER TABLE recipes ADD COLUMN lead_time_hours REAL;');
    }
    if (!hasColumn(db, 'recipes', 'claims_json')) {
      db.exec('ALTER TABLE recipes ADD COLUMN claims_json TEXT DEFAULT NULL;');
    }
    if (!hasColumn(db, 'recipes', 'review_json')) {
      db.exec('ALTER TABLE recipes ADD COLUMN review_json TEXT DEFAULT NULL;');
    }
    if (!hasColumn(db, 'recipes', 'nutrition_json')) {
      db.exec('ALTER TABLE recipes ADD COLUMN nutrition_json TEXT DEFAULT NULL;');
    }

    // 2. Recipe steps additive columns
    if (!hasColumn(db, 'recipe_steps', 'step_id')) {
      db.exec('ALTER TABLE recipe_steps ADD COLUMN step_id TEXT;');
    }
    if (!hasColumn(db, 'recipe_steps', 'depends_on_json')) {
      db.exec('ALTER TABLE recipe_steps ADD COLUMN depends_on_json TEXT DEFAULT NULL;');
    }
    if (!hasColumn(db, 'recipe_steps', 'active_minutes')) {
      db.exec('ALTER TABLE recipe_steps ADD COLUMN active_minutes REAL;');
    }
    if (!hasColumn(db, 'recipe_steps', 'passive_minutes')) {
      db.exec('ALTER TABLE recipe_steps ADD COLUMN passive_minutes REAL;');
    }
    if (!hasColumn(db, 'recipe_steps', 'thermal_constraints_json')) {
      db.exec('ALTER TABLE recipe_steps ADD COLUMN thermal_constraints_json TEXT DEFAULT NULL;');
    }
    if (!hasColumn(db, 'recipe_steps', 'risks_json')) {
      db.exec('ALTER TABLE recipe_steps ADD COLUMN risks_json TEXT DEFAULT NULL;');
    }

    // 3. Step ingredient refs additive columns
    if (!hasColumn(db, 'step_ingredient_refs', 'quantity_used_in_step')) {
      db.exec('ALTER TABLE step_ingredient_refs ADD COLUMN quantity_used_in_step REAL;');
    }
    if (!hasColumn(db, 'step_ingredient_refs', 'unit')) {
      db.exec('ALTER TABLE step_ingredient_refs ADD COLUMN unit TEXT;');
    }
    if (!hasColumn(db, 'step_ingredient_refs', 'component')) {
      db.exec('ALTER TABLE step_ingredient_refs ADD COLUMN component TEXT;');
    }
    if (!hasColumn(db, 'step_ingredient_refs', 'notes')) {
      db.exec('ALTER TABLE step_ingredient_refs ADD COLUMN notes TEXT;');
    }

    // 4. Controlled backfill for step_id on existing rows
    const unbackfilledSteps = db.prepare(`
      SELECT s.id, s.recipe_id, s.step_number, r.recipe_id as r_slug
      FROM recipe_steps s
      JOIN recipes r ON r.id = s.recipe_id
      WHERE s.step_id IS NULL OR s.step_id = ''
    `).all() as { id: string; recipe_id: string; step_number: number; r_slug: string }[];

    if (unbackfilledSteps.length > 0) {
      const updateStepIdStmt = db.prepare('UPDATE recipe_steps SET step_id = ? WHERE id = ?');
      const usedIdsPerRecipe = new Map<string, Set<string>>();

      const assigned = db.prepare(`
        SELECT recipe_id, step_id FROM recipe_steps WHERE step_id IS NOT NULL AND step_id != ''
      `).all() as { recipe_id: string; step_id: string }[];
      assigned.forEach((row) => {
        if (!usedIdsPerRecipe.has(row.recipe_id)) usedIdsPerRecipe.set(row.recipe_id, new Set());
        usedIdsPerRecipe.get(row.recipe_id)!.add(row.step_id);
      });

      unbackfilledSteps.forEach((s) => {
        if (!usedIdsPerRecipe.has(s.recipe_id)) usedIdsPerRecipe.set(s.recipe_id, new Set());
        const set = usedIdsPerRecipe.get(s.recipe_id)!;
        const baseId = `${s.r_slug || s.recipe_id}_step_${s.step_number}`;
        let candidate = baseId;
        let suffix = 1;
        while (set.has(candidate)) {
          candidate = `${baseId}_${suffix++}`;
        }
        set.add(candidate);
        updateStepIdStmt.run(candidate, s.id);
      });
    }

    // 5. Unique index for (recipe_id, step_id)
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_recipe_steps_unique_step_id ON recipe_steps(recipe_id, step_id);');

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

/**
 * Creates backup archive tables for V2 data before rollback.
 * Satisfies PO Condition 4.
 */
export function createV2RollbackBackup(db: DatabaseSync): void {
  db.exec('BEGIN TRANSACTION;');
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS _v2_recipes_backup AS 
      SELECT id, recipe_id, lead_time_hours, claims_json, review_json, nutrition_json, updated_at 
      FROM recipes
      WHERE lead_time_hours IS NOT NULL OR claims_json IS NOT NULL OR review_json IS NOT NULL OR nutrition_json IS NOT NULL;

      CREATE TABLE IF NOT EXISTS _v2_steps_backup AS 
      SELECT id, recipe_id, step_id, step_number, depends_on_json, active_minutes, passive_minutes, thermal_constraints_json, risks_json
      FROM recipe_steps
      WHERE step_id IS NOT NULL OR depends_on_json IS NOT NULL OR active_minutes IS NOT NULL OR passive_minutes IS NOT NULL OR thermal_constraints_json IS NOT NULL OR risks_json IS NOT NULL;

      CREATE TABLE IF NOT EXISTS _v2_allocations_backup AS
      SELECT step_id, ingredient_id, quantity_used_in_step, unit, component, notes
      FROM step_ingredient_refs
      WHERE quantity_used_in_step IS NOT NULL OR unit IS NOT NULL OR component IS NOT NULL OR notes IS NOT NULL;
    `);
    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

/**
 * Phase 009: Editorial Presentation, Provenance & Immutable Audit Trail Migration.
 * Creates recipe_editorial and recipe_editorial_audit tables with database triggers.
 */
export function applyEditorialMigration(db: DatabaseSync): void {
  db.exec('BEGIN TRANSACTION;');
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS recipe_editorial (
        recipe_id TEXT PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
        profile_version INTEGER NOT NULL DEFAULT 1,
        editorial_status TEXT NOT NULL DEFAULT 'draft' CHECK (editorial_status IN ('draft', 'in_review', 'needs_revision', 'approved')),
        editorial_subtitle TEXT,
        heritage TEXT,
        region_context TEXT,
        terroir TEXT,
        chef_quote TEXT,
        chef_tip TEXT,
        pairing_suggestion TEXT,
        historical_sources_json TEXT DEFAULT '[]',
        claim_confidence TEXT DEFAULT 'uncertain' CHECK (claim_confidence IN ('documented', 'widely_attested', 'editorial_interpretation', 'uncertain')),
        image_url TEXT,
        image_alt TEXT,
        image_caption TEXT,
        image_source_url TEXT,
        image_author TEXT,
        image_license TEXT CHECK (image_license IS NULL OR image_license IN (
          'CC0-1.0', 'CC-BY-4.0', 'CC-BY-SA-4.0', 'Public-Domain-Mark', 
          'Unsplash-License', 'Proprietary-Atlas', 'Custom-Documented'
        )),
        image_license_notes TEXT,
        image_attribution TEXT,
        image_rights_status TEXT NOT NULL DEFAULT 'unverified' CHECK (image_rights_status IN ('unverified', 'verification_pending', 'verified', 'restricted')),
        approved_by TEXT,
        approved_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS recipe_editorial_audit (
        id TEXT PRIMARY KEY,
        recipe_id TEXT NOT NULL,
        recipe_slug TEXT NOT NULL,
        recipe_title TEXT NOT NULL,
        profile_version INTEGER NOT NULL,
        from_status TEXT,
        to_status TEXT NOT NULL CHECK (to_status IN ('draft', 'in_review', 'needs_revision', 'approved')),
        actor_id TEXT NOT NULL,
        actor_role TEXT NOT NULL CHECK (actor_role IN ('editor', 'reviewer', 'approver', 'system')),
        changed_fields_json TEXT NOT NULL DEFAULT '[]',
        rationale TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_recipe_editorial_status ON recipe_editorial(editorial_status);
      CREATE INDEX IF NOT EXISTS idx_recipe_editorial_audit_recipe ON recipe_editorial_audit(recipe_id, created_at DESC);

      CREATE TRIGGER IF NOT EXISTS prevent_editorial_audit_update
      BEFORE UPDATE ON recipe_editorial_audit
      BEGIN
        SELECT RAISE(ABORT, 'Audit trail records are immutable and cannot be updated.');
      END;

      CREATE TRIGGER IF NOT EXISTS prevent_editorial_audit_delete
      BEFORE DELETE ON recipe_editorial_audit
      BEGIN
        SELECT RAISE(ABORT, 'Audit trail records are permanent and cannot be deleted.');
      END;
    `);
    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

export function seedEditorialProfiles(db: DatabaseSync): void {
  const insertStmt = db.prepare(`
    INSERT INTO recipe_editorial (
      recipe_id, profile_version, editorial_status, editorial_subtitle, heritage,
      region_context, terroir, chef_quote, chef_tip, pairing_suggestion,
      historical_sources_json, claim_confidence, image_url, image_alt, image_caption,
      image_source_url, image_author, image_license, image_license_notes, image_attribution,
      image_rights_status, approved_by, approved_at, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
    ON CONFLICT(recipe_id) DO NOTHING;
  `);

  const checkRecipeStmt = db.prepare('SELECT id FROM recipes WHERE id = ?');

  for (const s of CANONICAL_EDITORIAL_SEEDS) {
    const exists = checkRecipeStmt.get(s.recipe_id);
    if (!exists) continue;

    insertStmt.run(
      s.recipe_id,
      s.profile_version || 1,
      s.editorial_status || 'draft',
      s.editorial_subtitle || null,
      s.heritage || null,
      s.region_context || null,
      s.terroir || null,
      s.chef_quote || null,
      s.chef_tip || null,
      s.pairing_suggestion || null,
      JSON.stringify(s.historical_sources || []),
      s.claim_confidence || 'documented',
      s.image_url || null,
      s.image_alt || null,
      s.image_caption || null,
      s.image_source_url || null,
      s.image_author || null,
      s.image_license || null,
      s.image_license_notes || null,
      s.image_attribution || null,
      s.image_rights_status || 'unverified',
      s.approved_by || null,
      s.approved_at || null,
      s.created_at || new Date().toISOString(),
      s.updated_at || new Date().toISOString()
    );
  }
}

export function initDatabase(dbPath?: string, seedRecipes?: Recipe[]): DatabaseSync {
  const targetPath = dbPath || getDatabasePath();
  if (targetPath !== ':memory:') {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Create physical file backup snapshot before migration if file exists
    if (fs.existsSync(targetPath)) {
      const backupPath = `${targetPath}.v1.bak`;
      try {
        if (!fs.existsSync(backupPath)) {
          fs.copyFileSync(targetPath, backupPath);
        }
      } catch {}
    }
  }

  const db = new DatabaseSync(targetPath);

  // Enable foreign keys and WAL mode for reliability
  db.exec('PRAGMA foreign_keys = ON;');
  if (targetPath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
  }

  // Schema creation: Base tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
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

    CREATE TABLE IF NOT EXISTS recipe_ingredients (
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

    CREATE TABLE IF NOT EXISTS recipe_steps (
      id TEXT PRIMARY KEY,
      recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      step_number INTEGER NOT NULL,
      instruction TEXT NOT NULL,
      duration_minutes REAL,
      temperature_c REAL,
      heat_level TEXT,
      success_cue TEXT
    );

    CREATE TABLE IF NOT EXISTS step_ingredient_refs (
      step_id TEXT NOT NULL REFERENCES recipe_steps(id) ON DELETE CASCADE,
      ingredient_id TEXT NOT NULL,
      PRIMARY KEY (step_id, ingredient_id)
    );

    CREATE INDEX IF NOT EXISTS idx_recipes_updated_at ON recipes(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ingredients_recipe ON recipe_ingredients(recipe_id);
    CREATE INDEX IF NOT EXISTS idx_steps_recipe ON recipe_steps(recipe_id);
  `);

  // Run additive V2 migration (idempotent)
  applyV2Migration(db);

  // Run additive Phase 009 Editorial migration (idempotent)
  applyEditorialMigration(db);

  // Seeding strategy:
  // Isolate test fixtures where appropriate (PO Mandate Phase 003 Milestone 003-A)
  const isBrowserTestFixture = targetPath && targetPath.includes('browser_test');
  const isInMemory = targetPath === ':memory:';

  if (seedRecipes) {
    const countRow = db.prepare('SELECT COUNT(*) as count FROM recipes').get() as { count: number };
    if (countRow.count === 0) {
      for (const recipe of seedRecipes) {
        insertRecipeIntoDb(db, recipe);
      }
    }
  } else if (isBrowserTestFixture || isInMemory) {
    // Isolated fixture for legacy V1 browser test and unit tests
    const countRow = db.prepare('SELECT COUNT(*) as count FROM recipes').get() as { count: number };
    if (countRow.count === 0) {
      seedDatabase(db);
    }
  } else {
    // Product database (atlas_gastronomic.db):
    // Purge test / scratch recipes from the product catalogue
    purgeTestRecipes(db);

    const countRow = db.prepare('SELECT COUNT(*) as count FROM recipes').get() as { count: number };
    if (countRow.count === 0) {
      for (const recipe of COMPLETE_CATALOGUE) {
        insertRecipeIntoDb(db, recipe);
      }
    } else {
      // Synchronize all 12 canonical recipes into the product database
      syncCanonicalRecipes(db);
    }
  }

  // Seed editorial profiles for any canonical recipes present in the database
  seedEditorialProfiles(db);

  return db;
}

export function purgeTestRecipes(db: DatabaseSync): void {
  const canonicalIds = new Set(COMPLETE_CATALOGUE.map((r) => r.id));
  const canonicalRecipeIds = new Set(COMPLETE_CATALOGUE.map((r) => r.recipe_id));

  const rows = db.prepare('SELECT id, recipe_id, title FROM recipes').all() as { id: string; recipe_id: string; title: string }[];
  const deleteStmt = db.prepare('DELETE FROM recipes WHERE id = ?');

  for (const r of rows) {
    const isCanonical = canonicalIds.has(r.id) || canonicalRecipeIds.has(r.recipe_id);
    const isLegacySeed = r.id === 'rec_supa_legume_001' || r.id === 'rec_mamaliga_002';
    const isScratchTest = r.id.startsWith('rec_mv') || r.title.toLowerCase().includes('persisten');
    if (!isCanonical || isLegacySeed || isScratchTest) {
      deleteStmt.run(r.id);
    }
  }
}

export function syncCanonicalRecipes(db: DatabaseSync): void {
  for (const recipe of COMPLETE_CATALOGUE) {
    const exists = db.prepare('SELECT id FROM recipes WHERE id = ? OR recipe_id = ?').get(recipe.id, recipe.recipe_id);
    if (!exists) {
      insertRecipeIntoDb(db, recipe);
    }
  }
}

function seedDatabase(db: DatabaseSync) {
  for (const recipe of SEED_RECIPES) {
    insertRecipeIntoDb(db, recipe);
  }
}

export function insertRecipeIntoDb(db: DatabaseSync, recipe: Recipe) {
  db.exec('BEGIN TRANSACTION;');
  try {
    const insertRecipe = db.prepare(`
      INSERT INTO recipes (
        id, recipe_id, version, title, summary, culinary_tradition, region,
        category, status, yield_quantity, yield_unit, yield_approx_final_weight_g,
        active_minutes, total_minutes, difficulty, equipment_json, allergens_json,
        sources_json, editorial_notes_json, lead_time_hours, claims_json,
        review_json, nutrition_json, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    insertRecipe.run(
      recipe.id,
      recipe.recipe_id,
      recipe.version || '1.0.0',
      recipe.title,
      recipe.summary || '',
      recipe.culinary_tradition || null,
      recipe.region || null,
      recipe.category || 'General',
      recipe.status || 'draft',
      recipe.yield?.quantity ?? 4,
      recipe.yield?.unit ?? 'porții',
      recipe.yield?.approx_final_weight_g ?? null,
      recipe.timing?.active_minutes ?? null,
      recipe.timing?.total_minutes ?? null,
      recipe.difficulty || null,
      JSON.stringify(recipe.equipment || []),
      JSON.stringify(recipe.allergens || []),
      JSON.stringify(recipe.sources || []),
      JSON.stringify(recipe.editorial_notes || []),
      recipe.timing?.lead_time_hours ?? null,
      recipe.claims !== undefined && recipe.claims !== null ? JSON.stringify(recipe.claims) : null,
      recipe.review !== undefined && recipe.review !== null ? JSON.stringify(recipe.review) : null,
      recipe.nutrition_estimate !== undefined && recipe.nutrition_estimate !== null ? JSON.stringify(recipe.nutrition_estimate) : null,
      recipe.created_at || new Date().toISOString(),
      recipe.updated_at || new Date().toISOString()
    );

    const insertIng = db.prepare(`
      INSERT INTO recipe_ingredients (
        id, recipe_id, ingredient_id, name, quantity, unit, preparation,
        group_name, optional, notes, sequence_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let idx = 0; idx < (recipe.ingredients || []).length; idx++) {
      const ing = recipe.ingredients[idx];
      const ingPk = ing.id?.startsWith(`${recipe.id}_`) ? ing.id : `${recipe.id}_${ing.id || idx + 1}`;
      insertIng.run(
        ingPk,
        recipe.id,
        ing.ingredient_id,
        ing.name,
        ing.quantity ?? null,
        ing.unit ?? null,
        ing.preparation ?? null,
        ing.group ?? null,
        ing.optional ? 1 : 0,
        ing.notes ?? null,
        ing.sequence_order || idx + 1
      );
    }

    const insertStep = db.prepare(`
      INSERT INTO recipe_steps (
        id, recipe_id, step_id, step_number, instruction, duration_minutes,
        active_minutes, passive_minutes, depends_on_json, temperature_c,
        heat_level, success_cue, thermal_constraints_json, risks_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertRef = db.prepare(`
      INSERT OR REPLACE INTO step_ingredient_refs (
        step_id, ingredient_id, quantity_used_in_step, unit, component, notes
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (let idx = 0; idx < (recipe.steps || []).length; idx++) {
      const step = recipe.steps[idx];
      const stepPk = step.id?.startsWith(`${recipe.id}_`) ? step.id : `${recipe.id}_${step.id || idx + 1}`;
      // Stable persistent step_id
      const stableStepId = step.step_id && step.step_id.trim().length > 0 
        ? step.step_id.trim() 
        : `${recipe.recipe_id || recipe.id}_step_${step.step_number || idx + 1}`;

      insertStep.run(
        stepPk,
        recipe.id,
        stableStepId,
        step.step_number || idx + 1,
        step.instruction,
        step.duration_minutes ?? null,
        step.active_minutes ?? null,
        step.passive_minutes ?? null,
        step.depends_on !== undefined && step.depends_on !== null ? JSON.stringify(step.depends_on) : null,
        step.temperature_c ?? null,
        step.heat_level ?? null,
        step.success_cue ?? null,
        step.thermal_constraints !== undefined && step.thermal_constraints !== null ? JSON.stringify(step.thermal_constraints) : null,
        step.risks !== undefined && step.risks !== null ? JSON.stringify(step.risks) : null
      );

      // Map ingredient references and allocations
      const allocationMap = new Map<string, { quantity_used_in_step: number | null; unit: string | null; component: string | null; notes: string | null }>();
      if (step.allocations && Array.isArray(step.allocations)) {
        step.allocations.forEach((a) => {
          allocationMap.set(a.ingredient_id, {
            quantity_used_in_step: a.quantity_used_in_step ?? null,
            unit: a.unit ?? null,
            component: a.component ?? null,
            notes: a.notes ?? null,
          });
        });
      }

      const allRefs = new Set([...(step.ingredient_refs || []), ...Array.from(allocationMap.keys())]);
      for (const ref of allRefs) {
        const alloc = allocationMap.get(ref);
        insertRef.run(
          stepPk,
          ref,
          alloc?.quantity_used_in_step ?? null,
          alloc?.unit ?? null,
          alloc?.component ?? null,
          alloc?.notes ?? null
        );
      }
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

/**
 * Safely creates an atomic, vacuumed online backup snapshot of the live SQLite database.
 * Completely safe to run even while WAL mode is active and concurrent operations are executing.
 */
export function createDatabaseBackup(db: DatabaseSync, destinationPath?: string): string {
  const targetPath = destinationPath || path.resolve(getDatabasePath(), `../atlas_backup_${Date.now()}.db`);
  const safePath = targetPath.replace(/'/g, "''");
  db.exec(`VACUUM INTO '${safePath}';`);
  return targetPath;
}
