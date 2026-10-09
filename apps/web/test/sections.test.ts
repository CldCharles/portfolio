import test from 'node:test';
import assert from 'node:assert/strict';
import type { CvEntry, EntryKind } from '@portfolio/contracts';
import { groupSections } from '../src/features/cv/lib/sections.ts';

const entry = (id: string, kind: EntryKind): CvEntry => ({ id, kind, url: null, tags: [], startDate: null, endDate: null, text: { locale: 'fr', fallback: false, title: id, subtitle: '', description: '' } });

test('sections follow the reading order, keep entry order and skip empty kinds', () => {
  const sections = groupSections([entry('vue', 'skill'), entry('korean', 'language'), entry('job-b', 'experience'), entry('school', 'education'), entry('job-a', 'experience')], key => `T:${key}`);
  assert.deepEqual(sections.map(section => [section.id, section.title, section.entries.map(value => value.id)]), [
    ['experience', 'T:cv.experience', ['job-b', 'job-a']],
    ['skills', 'T:cv.skills', ['vue']],
    ['languages', 'T:cv.languages', ['korean']],
    ['education', 'T:cv.education', ['school']],
  ]);
  assert.deepEqual(groupSections([], key => key), []);
});
