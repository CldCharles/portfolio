import test from 'node:test';
import assert from 'node:assert/strict';
import type { DraftDocument } from '@portfolio/contracts';
import { applyChoices, chooseTarget, createChoices, ImportError, MAX_FILE_BYTES, parseLinkedIn, readCsv } from '../src/features/linkedin/import.ts';
import { documentSchema } from '../../api/src/admin/schema.ts';
function draft(): DraftDocument {
  return { items: [{ id: 'profile', kind: 'profile', name: 'Test', githubUrl: 'https://github.com/example', url: null, tags: [], startDate: null, endDate: null,
    translations: { fr: { text: { title: 'Ingénieur', subtitle: '', description: 'Présentation' }, reviewedSource: null },
      en: { text: { title: 'Engineer', subtitle: '', description: 'About' }, reviewedSource: { title: 'Ingénieur', subtitle: '', description: 'Présentation' } }, ko: null } }] };
}
function rejects(code: string, action: () => unknown) { assert.throws(action, error => error instanceof ImportError && error.code === code); }
test('CSV handles BOM, CRLF, multiline, escaped quotes and trailing empty fields', () => {
  assert.deepEqual(readCsv('\uFEFFTitle,Description,Other\r\nEngineer,"Line 1,\nLine ""2""",\r\n'), [['Title','Description','Other'], ['Engineer','Line 1,\nLine "2"','']]);
  rejects('invalidCsv', () => readCsv('Name\n"unfinished'));
  rejects('invalidCsv', () => readCsv('Name\n"closed"extra'));
  rejects('tooLarge', () => readCsv('é'.repeat(MAX_FILE_BYTES)));
  rejects('tooMany', () => readCsv('Name\n' + 'Skill\n'.repeat(101)));
  rejects('tooMany', () => readCsv('Name\n' + ','.repeat(101)));
});
test('only mapped CV fields are extracted; private profile fields are ignored', () => {
  const rows = parseLinkedIn('First Name,Last Name,Headline,Summary,Address,Birth Date\nClaude,Test,Engineer,About,private address,2000-01-01', 'profile');
  assert.deepEqual(rows, [{ kind: 'profile', name: 'Claude Test', text: { title: 'Engineer', subtitle: '', description: 'About' }, dates: [] }]);
  rejects('headers', () => parseLinkedIn('First Name,Last Name\nSomeone,Else', 'experience'));
  rejects('headers', () => parseLinkedIn('Name,Name\na,b', 'skill'));
  rejects('headers', () => parseLinkedIn('First Name,Last Name,Headline\na,b,c\nd,e,f', 'profile'));
  rejects('invalidCsv', () => parseLinkedIn('Name\na,b', 'skill'));
  rejects('empty', () => parseLinkedIn('Name\n" "', 'skill'));
});
test('all supported categories map text and display dates without inventing days', () => {
  const row = parseLinkedIn('Company Name,Title,Description,Started On,Finished On\nACME,Engineer,Build,2020,Mar 2024', 'experience')[0]!;
  assert.equal(row.text.subtitle, 'ACME'); assert.deepEqual(row.dates, [{kind:'start',value:'2020'},{kind:'end',value:'Mar 2024'}]);
  assert.deepEqual(parseLinkedIn('Company Name,Title,Finished On\nACME,Engineer,Mar 2024', 'experience')[0]!.dates, [{kind:'end',value:'Mar 2024'}]);
  const education = parseLinkedIn('School Name,Degree Name,Notes,Activities\nSchool,Degree,Notes,Activities', 'education')[0]!;
  assert.equal(education.text.description, 'Notes\n\nActivities');
  assert.equal(parseLinkedIn('Name\nVue.js', 'skill')[0]!.text.title, 'Vue.js');
});
test('selection is explicit and import is atomic, does not mutate the original or publish', () => {
  const document = draft(); const original = JSON.stringify(document);
  const rows = parseLinkedIn('Name\nVue.js\nReact', 'skill');
  const choices = createChoices(rows, document, 'fr');
  assert.equal(choices.some(choice => choice.selected), false);
  rejects('selection', () => applyChoices(document, choices, 'fr'));
  choices[0]!.selected = true;
  const result = applyChoices(document, choices, 'fr');
  assert.equal(result.items.length, 2); assert.equal(result.items[1]!.translations.fr.text.title, 'Vue.js');
  assert.equal(JSON.stringify(document), original); assert.equal(documentSchema.safeParse(result).success, true);
  const repeat = createChoices(rows, result, 'fr');
  assert.equal(repeat[0]!.target, result.items[1]!.id);
  repeat[0]!.selected = true;
  assert.equal(applyChoices(result, repeat, 'fr').items.length, 2);
  choices[1]!.selected = true; choices[1]!.french.title = '';
  rejects('french', () => applyChoices(document, choices, 'fr'));
  assert.equal(JSON.stringify(document), original);
});
test('non-French imports require a French version and remain unapproved; other fields survive', () => {
  const document = draft();
  const rows = parseLinkedIn('First Name,Last Name,Headline,Summary\nClaude,Test,Software Engineer,New summary', 'profile');
  const choices = createChoices(rows, document, 'en'); choices[0]!.selected = true;
  const result = applyChoices(document, choices, 'en');
  assert.deepEqual(result.items[0]!.translations.fr, document.items[0]!.translations.fr);
  assert.equal(result.items[0]!.translations.en!.reviewedSource, null);
  assert.equal(result.items[0]!.githubUrl, document.items[0]!.githubUrl);
  const skills = createChoices(parseLinkedIn('Name\n리액트', 'skill'), document, 'ko'); skills[0]!.selected = true;
  rejects('french', () => applyChoices(document, skills, 'ko'));
  skills[0]!.french.title = 'React';
  assert.equal(applyChoices(document, skills, 'ko').items[1]!.translations.ko!.text.title, '리액트');
});
test('ambiguous matches and duplicate targets need explicit resolution', () => {
  const document = draft();
  const rows = parseLinkedIn('Name\nVue.js\nVue.js', 'skill');
  const choices = createChoices(rows, document, 'fr'); choices.forEach(choice => choice.selected = true);
  rejects('duplicate', () => applyChoices(document, choices, 'fr'));
  choices[1]!.selected = false; const withSkill = applyChoices(document, choices, 'fr');
  withSkill.items.push({ ...JSON.parse(JSON.stringify(withSkill.items[1]!)), id: 'other-skill' });
  const ambiguous = createChoices(rows, withSkill, 'fr');
  assert.equal(ambiguous[0]!.target, ''); ambiguous[0]!.selected = true;
  rejects('target', () => applyChoices(withSkill, ambiguous, 'fr'));
  chooseTarget(ambiguous[0]!, 'other-skill', withSkill, 'fr');
  assert.equal(applyChoices(withSkill, ambiguous, 'fr').items.length, 3);
  ambiguous[1]!.selected = true; chooseTarget(ambiguous[1]!, 'other-skill', withSkill, 'fr');
  rejects('duplicate', () => applyChoices(withSkill, ambiguous, 'fr'));
  chooseTarget(ambiguous[1]!, 'profile', withSkill, 'fr');
  rejects('target', () => applyChoices(withSkill, ambiguous, 'fr'));
});


test('education accepts an empty degree without rejecting other rows', () => {
  const rows = parseLinkedIn('School Name,Degree Name,Notes\nSchool A,,Coursework\nSchool B,Master,Research', 'education');
  assert.deepEqual(rows[0]!.text, { title: 'School A', subtitle: '', description: 'Coursework' });
  const choices = createChoices(rows, draft(), 'fr'); choices.forEach(choice => choice.selected = true);
  const result = applyChoices(draft(), choices, 'fr');
  assert.equal(result.items.length, 3);
  assert.equal(documentSchema.safeParse(result).success, true);
});
