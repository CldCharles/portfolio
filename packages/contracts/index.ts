/** Type-only contract: no runtime code or private/admin data. */
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
