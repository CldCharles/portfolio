import type { CvEntry, EntryKind } from '@portfolio/contracts';

export type SectionTitleKey = 'cv.experience' | 'cv.projects' | 'cv.skills' | 'cv.education';
export interface CvSectionGroup { id: string; kind: EntryKind; title: string; entries: CvEntry[] }

// Reading order shared by the public CV and the admin preview.
const sectionOrder: { id: string; kind: EntryKind; titleKey: SectionTitleKey }[] = [
  { id: 'experience', kind: 'experience', titleKey: 'cv.experience' },
  { id: 'projects', kind: 'project', titleKey: 'cv.projects' },
  { id: 'skills', kind: 'skill', titleKey: 'cv.skills' },
  { id: 'education', kind: 'education', titleKey: 'cv.education' },
];

/** Groups entries by kind in reading order and drops empty sections. */
export function groupSections(entries: CvEntry[], title: (key: SectionTitleKey) => string): CvSectionGroup[] {
  return sectionOrder
    .map(({ id, kind, titleKey }) => ({ id, kind, title: title(titleKey), entries: entries.filter(entry => entry.kind === kind) }))
    .filter(section => section.entries.length > 0);
}
