import test from 'node:test';
import assert from 'node:assert/strict';
import { createPinia, setActivePinia } from 'pinia';
import type { DraftDocument, DraftItem } from '@portfolio/contracts';
import { useEditorStore } from '../src/features/admin/store.ts';
import { missingTranslations, useTranslationStore } from '../src/features/admin/translation.ts';

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

test('a proposal lands in the draft as unreviewed, unless the section changed during the request', async context => {
  setActivePinia(createPinia());
  const editor = useEditorStore();
  const ai = useTranslationStore();
  editor.document = { items: [item('a', 'Projet A')] };
  const proposal = { text: { title: 'Project A', subtitle: '', description: '' } };
  // Each POST /translation waits for respond(), so the test can edit the draft mid-request.
  let respond = () => {};
  context.mock.method(globalThis, 'fetch', async (_url: string, init?: RequestInit) => {
    if (init?.method !== 'POST') return Response.json({ available: true, remainingToday: 100 });
    await new Promise<void>(resolve => { respond = resolve; });
    return Response.json(proposal);
  });

  const first = ai.run([{ itemId: 'a', target: 'en' }]);
  assert.equal(ai.busy, true);
  respond();
  await first;
  assert.deepEqual(editor.document.items[0]!.translations.en, { text: proposal.text, reviewedSource: null });

  const second = ai.run([{ itemId: 'a', target: 'ko' }]);
  editor.document.items[0]!.translations.ko = { text: { title: 'Saisie manuelle', subtitle: '', description: '' }, reviewedSource: null };
  respond();
  await assert.rejects(second, { code: 'TRANSLATION_STALE' });
  assert.equal(editor.document.items[0]!.translations.ko!.text.title, 'Saisie manuelle');
  assert.equal(ai.busy, false);
});
