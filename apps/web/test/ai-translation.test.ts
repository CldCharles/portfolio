import test from 'node:test';
import assert from 'node:assert/strict';
import type { DraftDocument, DraftItem } from '@portfolio/contracts';
import { missingTranslations } from '../src/features/admin/translation';

const item = (id: string, title: string, translations: Partial<DraftItem['translations']> = {}): DraftItem => ({
  id, kind: 'project', name: '', githubUrl: null, countryCode: null, url: null, tags: [], startDate: null, endDate: null,
  translations: { fr: { text: { title, subtitle: '', description: '' }, reviewedSource: null }, en: null, ko: null, ...translations },
});

test('bulk AI translation only targets missing translations of sections with a French title', () => {
  const unreviewed = { text: { title: 'Manual draft', subtitle: '', description: '' }, reviewedSource: null };
  const document: DraftDocument = { items: [item('a', 'Projet A'), item('b', 'Projet B', { en: unreviewed }), item('c', '   ')] };
  assert.deepEqual(missingTranslations(document), [
    { itemId: 'a', target: 'en' }, { itemId: 'a', target: 'ko' }, { itemId: 'b', target: 'ko' },
  ]);
});
