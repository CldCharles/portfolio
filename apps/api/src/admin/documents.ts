import type Database from 'better-sqlite3';
import type { CvText, DraftDocument, DraftItem, Locale, PublicCv } from '@portfolio/contracts';
import type { CvRepository } from '../cv/repository.js';
import { documentSchema } from './schema.js';

export function sameText(a: CvText | null, b: CvText): boolean {
  return !!a && a.title === b.title && a.subtitle === b.subtitle && a.description === b.description;
}
export function readPublishedDocument(db: Database.Database, repository: CvRepository): DraftDocument {
  const cv = repository.read('fr');
  if (!cv) throw new Error('Missing profile');
  const common: Omit<DraftItem, 'translations'>[] = [
    { id: 'profile', kind: 'profile', name: cv.profile.name, githubUrl: cv.profile.githubUrl, countryCode: cv.profile.countryCode, url: null, tags: [], startDate: null, endDate: null },
    ...cv.entries.map(({ text: _text, ...item }) => ({ ...item, name: '', githubUrl: null, countryCode: null })),
  ];
  return { items: common.map(item => {
    const rows = db.prepare('SELECT locale,title,subtitle,description,source_revision FROM cv_translations WHERE item_id=?').all(item.id) as (CvText & { locale: Locale; source_revision: number })[];
    const source = rows.find(row => row.locale === 'fr')!;
    const sourceText = { title: source.title, subtitle: source.subtitle, description: source.description };
    const translations: DraftItem['translations'] = { fr: { text: sourceText, reviewedSource: sourceText }, en: null, ko: null };
    for (const row of rows) {
      translations[row.locale] = { text: { title: row.title, subtitle: row.subtitle, description: row.description }, reviewedSource: row.source_revision === source.source_revision ? sourceText : null };
    }
    return { ...item, translations };
  }) };
}
export function previewDocument(document: DraftDocument, locale: Locale): PublicCv {
  const localize = (item: DraftItem) => {
    const candidate = item.translations[locale];
    const current = locale === 'fr' || !!candidate && sameText(candidate.reviewedSource, item.translations.fr.text);
    const text = current && candidate ? candidate.text : item.translations.fr.text;
    return { ...text, locale: current ? locale : 'fr' as const, fallback: !current };
  };
  const profile = document.items.find(item => item.kind === 'profile')!;
  return { locale, profile: { name: profile.name.trim(), githubUrl: profile.githubUrl, countryCode: profile.countryCode ?? null, text: localize(profile) },
    entries: document.items.filter(item => item.kind !== 'profile').map(item => ({ id: item.id, kind: item.kind as Exclude<DraftItem['kind'], 'profile'>, url: item.url, tags: item.tags, startDate: item.startDate, endDate: item.endDate, text: localize(item) })),
  };
}
/** Caller wraps publication and draft revision in one transaction. */
export function publishDocument(db: Database.Database, repository: CvRepository, input: DraftDocument) {
  const document = documentSchema.parse(input);
  const keptIds = new Set(document.items.map(item => item.id));
  const oldIds = db.prepare('SELECT id FROM cv_items').all() as { id: string }[];
  for (const { id } of oldIds) if (!keptIds.has(id)) db.prepare('DELETE FROM cv_items WHERE id=?').run(id);
  document.items.forEach((item, position) => {
    if (item.kind === 'profile') repository.saveProfile({ name: item.name, githubUrl: item.githubUrl, countryCode: item.countryCode }, item.translations.fr.text);
    else repository.saveEntry({ id: item.id, kind: item.kind, url: item.url, tags: item.tags, startDate: item.startDate, endDate: item.endDate, position }, item.translations.fr.text);
    const revision = repository.translationStatus(item.id).revision;
    db.prepare("DELETE FROM cv_translations WHERE item_id=? AND locale != 'fr'").run(item.id);
    for (const locale of ['en', 'ko'] as const) {
      const translation = item.translations[locale];
      if (!translation) continue;
      repository.setTranslation(item.id, locale, translation.text, revision);
      if (!sameText(translation.reviewedSource, item.translations.fr.text)) {
        db.prepare('UPDATE cv_translations SET source_revision=0 WHERE item_id=? AND locale=?').run(item.id, locale);
      }
    }
  });
}
