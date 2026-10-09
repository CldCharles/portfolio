import type Database from 'better-sqlite3';

export function migrateDatabase(db: Database.Database) {
  // Off during migrations: rebuilding cv_items must not cascade to translations.
  // This pragma is ignored inside a transaction, hence before it.
  db.pragma('foreign_keys = OFF');
  db.pragma('journal_mode = WAL');
  db.transaction(() => {
    const version = db.pragma('user_version', { simple: true }) as number;
    if (version > 3) throw new Error('Unsupported database version');
    if (version === 0) {
      db.exec(`
        CREATE TABLE cv_items (
          id TEXT PRIMARY KEY,
          kind TEXT NOT NULL CHECK(kind IN ('profile','skill','project','experience','education','language')),
          common TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 0,
          revision INTEGER NOT NULL DEFAULT 1
        );
        CREATE TABLE cv_translations (
          item_id TEXT NOT NULL REFERENCES cv_items(id) ON DELETE CASCADE,
          locale TEXT NOT NULL CHECK(locale IN ('fr','en','ko')),
          title TEXT NOT NULL, subtitle TEXT NOT NULL, description TEXT NOT NULL,
          source_revision INTEGER NOT NULL,
          PRIMARY KEY (item_id, locale)
        );
      `);
    }
    if (version < 2) {
      db.exec(`
        CREATE TABLE admin_account (id INTEGER PRIMARY KEY CHECK(id=1), username TEXT NOT NULL, password_hash TEXT NOT NULL);
        CREATE TABLE admin_sessions (token_hash TEXT PRIMARY KEY, csrf_token TEXT NOT NULL, expires_at INTEGER NOT NULL);
        CREATE TABLE admin_login_attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
        CREATE TABLE admin_draft (id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, published_revision INTEGER NOT NULL, document TEXT NOT NULL);
      `);
    }
    if (version >= 1 && version < 3) {
      // SQLite cannot alter a CHECK constraint: rebuild the table to allow 'language'.
      db.exec(`
        CREATE TABLE cv_items_next (
          id TEXT PRIMARY KEY,
          kind TEXT NOT NULL CHECK(kind IN ('profile','skill','project','experience','education','language')),
          common TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 0,
          revision INTEGER NOT NULL DEFAULT 1
        );
        INSERT INTO cv_items_next (id, kind, common, position, revision) SELECT id, kind, common, position, revision FROM cv_items;
        DROP TABLE cv_items;
        ALTER TABLE cv_items_next RENAME TO cv_items;
      `);
    }
    if ((db.pragma('foreign_key_check') as unknown[]).length) throw new Error('Foreign key check failed after migration');
    db.pragma('user_version = 3');
  })();
  db.pragma('foreign_keys = ON');
}
