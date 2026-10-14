#!/usr/bin/env node
/**
 * Atlas Gastronomic — SQLite Online Backup Script
 * Creates an atomic, vacuumed snapshot of the live SQLite database.
 * Usage: node scripts/backup-sqlite.js [destination_path]
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data/atlas_gastronomic.db');

if (!fs.existsSync(dbPath)) {
  console.error(`Error: Source database does not exist at ${dbPath}`);
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const defaultBackupDir = path.dirname(dbPath);
const targetPath = process.argv[2] || path.join(defaultBackupDir, `atlas_backup_${timestamp}.db`);

console.log(`Connecting to SQLite database: ${dbPath}`);
const db = new DatabaseSync(dbPath, { readOnly: true });

console.log(`Creating atomic snapshot via VACUUM INTO: ${targetPath}`);
try {
  db.exec(`VACUUM INTO '${targetPath.replace(/'/g, "''")}';`);
  const stats = fs.statSync(targetPath);
  console.log(`Backup completed successfully! Size: ${(stats.size / 1024).toFixed(1)} KB`);
  db.close();
  process.exit(0);
} catch (err) {
  console.error('Backup failed:', err);
  db.close();
  process.exit(1);
}
