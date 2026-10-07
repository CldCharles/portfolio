import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { createCvRepository } from './cv/repository.js';
import { migrateDatabase } from './migrations.js';
import { createAdminService } from './admin/service.js';
import { seedCv } from './cv/seed.js';

export function openDatabase(path = process.env.DATABASE_PATH ?? fileURLToPath(new URL('../data/portfolio.sqlite', import.meta.url))) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  try {
    migrateDatabase(db);
    const repository = createCvRepository(db);
    db.transaction(() => seedCv(repository))();
    return { db, repository, admin: createAdminService(db, repository) };
  } catch (error) {
    db.close();
    throw error;
  }
}
