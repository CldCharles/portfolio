/** Shared type-only contracts. No runtime code, database models or credentials. */
export type Locale = 'fr' | 'en' | 'ko';
export type EntryKind = 'skill' | 'project' | 'experience' | 'education';
export interface CvText { title: string; subtitle: string; description: string }
export interface LocalizedText extends CvText { locale: Locale; fallback: boolean }
export interface CvEntry {
  id: string; kind: EntryKind; url: string | null; tags: string[];
  startDate: string | null; endDate: string | null; text: LocalizedText;
}
export interface PublicCv {
  locale: Locale;
  profile: { name: string; githubUrl: string | null; text: LocalizedText };
  entries: CvEntry[];
}

export interface DraftTranslation { text: CvText; reviewedSource: CvText | null }
export interface DraftItem {
  id: string;
  kind: EntryKind | 'profile';
  name: string;
  githubUrl: string | null;
  url: string | null;
  tags: string[];
  startDate: string | null;
  endDate: string | null;
  translations: { fr: DraftTranslation; en: DraftTranslation | null; ko: DraftTranslation | null };
}
export interface DraftDocument { items: DraftItem[] }
export interface AdminDraft { revision: number; publishedRevision: number; document: DraftDocument }
export interface AdminSession { authenticated: boolean; configured: boolean; csrfToken?: string; username?: string }
