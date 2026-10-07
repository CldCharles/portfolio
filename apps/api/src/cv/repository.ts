import Database from 'better-sqlite3';
import type { CvText, EntryKind, Locale, LocalizedText, PublicCv } from '@portfolio/contracts';
import { entrySchema, localeSchema, profileSchema, textSchema } from './schema.js';

type ItemRow = { id: string; kind: EntryKind | 'profile'; common: string; position: number; revision: number };
type TranslationRow = { locale: Locale; title: string; subtitle: string; description: string; source_revision: number };

export function createCvRepository(db: Database.Database) {
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  // Versioned migrations run transactionally; never replace existing content on startup.
  db.transaction(() => {
    const version = db.pragma('user_version', { simple: true }) as number;
    if (version > 1) throw new Error('Unsupported database version');
    if (version === 0) {
      db.exec(`
        CREATE TABLE cv_items (
          id TEXT PRIMARY KEY,
          kind TEXT NOT NULL CHECK(kind IN ('profile','skill','project','experience','education')),
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
        PRAGMA user_version = 1;
      `);
    }
  })();

  function row(id: string) {
    return db.prepare('SELECT * FROM cv_items WHERE id = ?').get(id) as ItemRow | undefined;
  }
  function setTranslation(id: string, locale: Locale, input: CvText, expectedRevision: number) {
    localeSchema.parse(locale);
    const text = textSchema.parse(input);
    db.transaction(() => {
      const item = row(id);
      if (!item) throw new Error('Unknown CV item');
      if (item.revision !== expectedRevision) throw new Error('Source changed; reload before saving');
      const previous = db.prepare('SELECT * FROM cv_translations WHERE item_id = ? AND locale = ?').get(id, locale) as TranslationRow | undefined;
      const changed = !previous || previous.title !== text.title || previous.subtitle !== text.subtitle || previous.description !== text.description;
      const revision = locale === 'fr' && previous && changed ? item.revision + 1 : item.revision;
      if (revision !== item.revision) db.prepare('UPDATE cv_items SET revision = ? WHERE id = ?').run(revision, id);
      db.prepare(`INSERT INTO cv_translations (item_id, locale, title, subtitle, description, source_revision)
        VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(item_id, locale) DO UPDATE SET
        title=excluded.title, subtitle=excluded.subtitle, description=excluded.description, source_revision=excluded.source_revision`)
        .run(id, locale, text.title, text.subtitle, text.description, revision);
    })();
  }
  function localize(item: ItemRow, locale: Locale): LocalizedText {
    const translations = db.prepare('SELECT * FROM cv_translations WHERE item_id = ?').all(item.id) as TranslationRow[];
    const selected = translations.find(text => text.locale === locale && text.source_revision === item.revision)
      ?? translations.find(text => text.locale === 'fr');
    if (!selected) throw new Error(`Missing French source for ${item.id}`);
    return { title: selected.title, subtitle: selected.subtitle, description: selected.description, locale: selected.locale, fallback: selected.locale !== locale };
  }
  function saveProfile(common: unknown, source: CvText) {
    const data = profileSchema.parse(common);
    const text = textSchema.parse(source);
    db.transaction(() => {
      db.prepare(`INSERT INTO cv_items (id,kind,common) VALUES ('profile','profile',?)
        ON CONFLICT(id) DO UPDATE SET common=excluded.common`).run(JSON.stringify(data));
      setTranslation('profile', 'fr', text, row('profile')!.revision);
    })();
  }
  function saveEntry(common: unknown, source: CvText) {
    const { id, kind, position, ...data } = entrySchema.parse(common);
    const text = textSchema.parse(source);
    if (id === 'profile') throw new Error('Reserved item id');
    db.transaction(() => {
      db.prepare(`INSERT INTO cv_items (id,kind,common,position) VALUES (?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,common=excluded.common,position=excluded.position`)
        .run(id, kind, JSON.stringify(data), position);
      setTranslation(id, 'fr', text, row(id)!.revision);
    })();
  }
  function read(locale: Locale): PublicCv | null {
    localeSchema.parse(locale);
    const profile = row('profile');
    if (!profile) return null;
    const items = db.prepare("SELECT * FROM cv_items WHERE kind != 'profile' ORDER BY position, id").all() as ItemRow[];
    return {
      locale,
      profile: { ...profileSchema.parse(JSON.parse(profile.common)), text: localize(profile, locale) },
      entries: items.map(item => {
        const { position: _position, ...common } = entrySchema.parse({ ...JSON.parse(item.common), id: item.id, kind: item.kind, position: item.position });
        return { ...common, text: localize(item, locale) };
      }),
    };
  }
  function translationStatus(id: string) {
    const item = row(id);
    if (!item) throw new Error('Unknown CV item');
    const translations = db.prepare('SELECT * FROM cv_translations WHERE item_id = ?').all(id) as TranslationRow[];
    return { revision: item.revision, languages: localeSchema.options.map(locale => {
      const text = translations.find(value => value.locale === locale);
      return { locale, status: !text ? 'missing' : text.source_revision === item.revision ? 'current' : 'needs_review' };
    }) };
  }
  return { read, saveProfile, saveEntry, setTranslation, translationStatus };
}
export type CvRepository = ReturnType<typeof createCvRepository>;
