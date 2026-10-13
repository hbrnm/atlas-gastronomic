import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED_RECIPES } from '../shared/sample-data.js';
import { Recipe } from '../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getDatabasePath(): string {
  if (process.env.NODE_ENV === 'test' || process.env.DATABASE_URL === ':memory:') {
    return ':memory:';
  }
  const dataDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'atlas_gastronomic.db');
}

export function initDatabase(dbPath?: string): DatabaseSync {
  const targetPath = dbPath || getDatabasePath();
  if (targetPath !== ':memory:') {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  const db = new DatabaseSync(targetPath);

  // Enable foreign keys and WAL mode for reliability
  db.exec('PRAGMA foreign_keys = ON;');
  if (targetPath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
  }

  // Schema creation
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

  // Seed default canonical recipes if empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM recipes').get() as { count: number };
  if (countRow.count === 0) {
    seedDatabase(db);
  }

  return db;
}

function seedDatabase(db: DatabaseSync) {
  for (const recipe of SEED_RECIPES) {
    insertRecipeIntoDb(db, recipe);
  }
}

export function insertRecipeIntoDb(db: DatabaseSync, recipe: Recipe) {
  // Use a transaction
  db.exec('BEGIN TRANSACTION;');
  try {
    const insertRecipe = db.prepare(`
      INSERT INTO recipes (
        id, recipe_id, version, title, summary, culinary_tradition, region,
        category, status, yield_quantity, yield_unit, yield_approx_final_weight_g,
        active_minutes, total_minutes, difficulty, equipment_json, allergens_json,
        sources_json, editorial_notes_json, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
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
      recipe.created_at || new Date().toISOString(),
      recipe.updated_at || new Date().toISOString()
    );

    const insertIng = db.prepare(`
      INSERT INTO recipe_ingredients (
        id, recipe_id, ingredient_id, name, quantity, unit, preparation,
        group_name, optional, notes, sequence_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let idx = 0; idx < recipe.ingredients.length; idx++) {
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
        id, recipe_id, step_number, instruction, duration_minutes,
        temperature_c, heat_level, success_cue
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertRef = db.prepare(`
      INSERT OR IGNORE INTO step_ingredient_refs (step_id, ingredient_id)
      VALUES (?, ?)
    `);

    for (let idx = 0; idx < recipe.steps.length; idx++) {
      const step = recipe.steps[idx];
      const stepPk = step.id?.startsWith(`${recipe.id}_`) ? step.id : `${recipe.id}_${step.id || idx + 1}`;
      insertStep.run(
        stepPk,
        recipe.id,
        step.step_number || idx + 1,
        step.instruction,
        step.duration_minutes ?? null,
        step.temperature_c ?? null,
        step.heat_level ?? null,
        step.success_cue ?? null
      );

      for (const ref of step.ingredient_refs || []) {
        insertRef.run(stepPk, ref);
      }
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}
