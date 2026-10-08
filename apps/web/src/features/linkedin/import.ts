import type { CvText, DraftDocument, DraftItem, Locale } from '@portfolio/contracts';

export type ImportKind = 'profile' | 'experience' | 'education' | 'skill';
export interface ImportRow {
  kind: ImportKind; text: CvText; name?: string;
  dates: { kind: 'start' | 'end'; value: string }[];
}
export interface ImportChoice {
  row: ImportRow; selected: boolean; target: string; french: CvText; frenchBaseline: CvText;
}
export class ImportError extends Error {
  constructor(public code: string) { super(code); }
}
export const MAX_FILE_BYTES = 512 * 1024;

// Bounded RFC 4180-style CSV reader: quoted commas, newlines and escaped quotes.
export function readCsv(input: string): string[][] {
  if (new TextEncoder().encode(input).length > MAX_FILE_BYTES) throw new ImportError('tooLarge');
  const source = input.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [], field = '', quoted = false, closed = false;
  const finishField = () => { row.push(field); field = ''; closed = false; };
  const finishRow = () => {
    finishField();
    if (row.some(value => value.trim())) rows.push(row);
    if (rows.length > 101 || row.length > 100) throw new ImportError('tooMany');
    row = [];
  };
  for (let index = 0; index < source.length; index++) {
    const char = source[index]!;
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') { field += '"'; index++; }
        else { quoted = false; closed = true; }
      } else field += char;
    } else if (char === ',') { finishField(); }
    else if (char === '\n' || char === '\r') {
      finishRow(); if (char === '\r' && source[index + 1] === '\n') index++;
    } else if (char === '"' && !field && !closed) quoted = true;
    else {
      if (closed || char === '"') throw new ImportError('invalidCsv');
      field += char;
    }
    if (row.length > 100) throw new ImportError('tooMany');
  }
  if (quoted) throw new ImportError('invalidCsv');
  if (field || row.length || closed) finishRow();
  return rows;
}

const requiredHeaders: Record<ImportKind, string[]> = {
  profile: ['first name', 'last name', 'headline'],
  experience: ['company name', 'title'],
  education: ['school name', 'degree name'],
  skill: ['name'],
};
export function parseLinkedIn(input: string, kind: ImportKind): ImportRow[] {
  const [header, ...rows] = readCsv(input);
  if (!header || !rows.length) throw new ImportError('empty');
  const keys = header.map(value => value.trim().toLowerCase());
  if (new Set(keys).size !== keys.length || !requiredHeaders[kind].every(key => keys.includes(key))) throw new ImportError('headers');
  if (kind === 'profile' && rows.length !== 1) throw new ImportError('headers');
  return rows.map(values => {
    if (values.length !== keys.length) throw new ImportError('invalidCsv');
    const get = (key: string) => values[keys.indexOf(key)]?.trim() ?? '';
    const text: CvText = kind === 'profile' ? { title: get('headline'), subtitle: '', description: get('summary') }
      : kind === 'experience' ? { title: get('title'), subtitle: get('company name'), description: get('description') }
      : kind === 'education' ? { title: get('degree name') || get('school name'), subtitle: get('degree name') ? get('school name') : '', description: [get('notes'), get('activities')].filter(Boolean).join('\n\n') }
      : { title: get('name'), subtitle: '', description: '' };
    if (!validText(text)) throw new ImportError('text');
    const name = kind === 'profile' ? [get('first name'), get('last name')].filter(Boolean).join(' ') : undefined;
    if (name !== undefined && (!name || name.length > 200)) throw new ImportError('text');
    // Export date precision varies. Preserve dates in the draft; do not invent days.
    const dates: ImportRow['dates'] = [];
    const start = get('started on') || get('start date');
    const end = get('finished on') || get('end date');
    if (start) dates.push({ kind: 'start', value: start });
    if (end) dates.push({ kind: 'end', value: end });
    return { kind, text, ...(name === undefined ? {} : { name }), dates };
  });
}
function validText(text: CvText): boolean {
  return !!text.title.trim() && text.title.length <= 200 && text.subtitle.length <= 300 && text.description.length <= 5000;
}
const normalize = (value: string) => value.trim().toLocaleLowerCase();
function matches(item: DraftItem, row: ImportRow, locale: Locale): boolean {
  const text = item.translations[locale]?.text;
  return item.kind === row.kind && !!text && normalize(text.title) === normalize(row.text.title) && normalize(text.subtitle) === normalize(row.text.subtitle);
}
export function createChoices(rows: ImportRow[], document: DraftDocument, locale: Locale): ImportChoice[] {
  return rows.map(row => {
    const candidates = document.items.filter(item => row.kind === 'profile' ? item.kind === 'profile' : matches(item, row, locale));
    const target = candidates.length === 1 ? candidates[0]!.id : candidates.length ? '' : 'new';
    const existing = document.items.find(item => item.id === target);
    const french = { ...(locale === 'fr' ? row.text : existing?.translations.fr.text ?? { title: '', subtitle: '', description: '' }) };
    return { row, selected: false, target, french, frenchBaseline: { ...french } };
  });
}
export function chooseTarget(choice: ImportChoice, target: string, document: DraftDocument, locale: Locale): void {
  choice.target = target;
  const nextText = locale === 'fr' ? choice.row.text : document.items.find(item => item.id === target)?.translations.fr.text ?? { title: '', subtitle: '', description: '' };
  // Preserve each field edited by the owner; refresh only untouched fields.
  for (const field of ['title', 'subtitle', 'description'] as const) {
    if (choice.french[field] === choice.frenchBaseline[field]) {
      choice.french[field] = nextText[field];
      choice.frenchBaseline[field] = nextText[field];
    }
  }
}
// Work on a copy, then replace the local draft in one step. Saving and publishing
// still go through the existing authenticated, CSRF-protected revision checks.
export function applyChoices(document: DraftDocument, choices: ImportChoice[], locale: Locale): DraftDocument {
  const selected = choices.filter(choice => choice.selected);
  if (!selected.length) throw new ImportError('selection');
  const copy: DraftDocument = JSON.parse(JSON.stringify(document));
  const used = new Set<string>();
  for (const choice of selected) {
    if (!validText(choice.french) || !validText(choice.row.text)) throw new ImportError('french');
    let item = copy.items.find(item => item.id === choice.target);
    if (choice.target !== 'new' && (!item || item.kind !== choice.row.kind)) throw new ImportError('target');
    const key = item?.id ?? `new:${choice.row.kind}:${normalize(choice.french.title)}:${normalize(choice.french.subtitle)}`;
    if (used.has(key)) throw new ImportError('duplicate');
    used.add(key);
    if (!item) {
      if (choice.row.kind === 'profile') throw new ImportError('target');
      item = { id: `entry-${crypto.randomUUID()}`, kind: choice.row.kind, name: '', githubUrl: null, url: null, tags: [], startDate: null, endDate: null,
        translations: { fr: { text: choice.french, reviewedSource: null }, en: null, ko: null } };
      copy.items.push(item);
    }
    if (choice.row.name !== undefined) item.name = choice.row.name;
    item.translations.fr = { text: { ...choice.french }, reviewedSource: null };
    if (locale !== 'fr') item.translations[locale] = { text: { ...choice.row.text }, reviewedSource: null };
  }
  if (copy.items.length > 100) throw new ImportError('tooMany');
  return copy;
}
