import test from 'node:test';
import assert from 'node:assert/strict';
import { createPinia, setActivePinia } from 'pinia';
import type { Locale, PublicCv } from '@portfolio/contracts';
import { useAuthStore } from '../src/features/auth/store.ts';
import { useEditorStore } from '../src/features/admin/store.ts';
import { enterAdminDemo, isAdminDemo } from '../src/features/demo/adminDemo.ts';

// Minimal in-memory Web Storage, as in a browser tab.
class MemoryStorage {
  private items = new Map<string, string>();
  getItem(key: string) { return this.items.get(key) ?? null; }
  setItem(key: string, value: string) { this.items.set(key, value); }
  removeItem(key: string) { this.items.delete(key); }
}

const text = (title: string, fallback = false) => ({ title, subtitle: '', description: '', locale: 'fr' as const, fallback });
function publicCv(locale: Locale): PublicCv {
  return {
    locale,
    profile: { name: 'Claude', githubUrl: null, countryCode: 'KR', text: text(`Ingénieur (${locale})`) },
    entries: [
      { id: 'sopra', kind: 'experience', url: null, tags: ['Vue.js'], startDate: '2021-03', endDate: '2024-12', text: text(`Sopra (${locale})`) },
      // Not translated into Korean: the public CV falls back to French.
      { id: 'spotter', kind: 'project', url: null, tags: [], startDate: null, endDate: null, text: text(locale === 'ko' ? 'Spotter (fr)' : `Spotter (${locale})`, locale === 'ko') },
    ],
  };
}

test('the demo editor works on a copy of the public CV and never calls the admin API', async context => {
  Object.assign(globalThis, { sessionStorage: new MemoryStorage() });
  setActivePinia(createPinia());
  const fetchMock = context.mock.method(globalThis, 'fetch', async (url: string) => {
    const locale = new URL(url, 'http://localhost').searchParams.get('lang') as Locale;
    return Response.json(publicCv(locale));
  });

  enterAdminDemo();
  const auth = useAuthStore();
  assert.equal((await auth.check()).authenticated, true);

  const editor = useEditorStore();
  await editor.load();
  const spotter = editor.document!.items.find(item => item.id === 'spotter')!;
  assert.equal(spotter.translations.en?.text.title, 'Spotter (en)');
  assert.equal(spotter.translations.ko, null, 'a French fallback is not a translation');

  editor.document!.items[1]!.translations.fr.text.title = 'Sopra Steria (modifié)';
  await editor.save();
  await editor.showPreview('en');
  assert.equal(editor.error, '');
  // The French text changed: its English translation is no longer reviewed, the preview falls back.
  assert.equal(editor.preview!.entries[0]!.text.title, 'Sopra Steria (modifié)');
  await editor.publish();
  assert.equal(editor.notice, 'published');

  const calledUrls = fetchMock.mock.calls.map(call => String(call.arguments[0]));
  assert.ok(calledUrls.every(url => url.startsWith('/api/cv?lang=')), `admin API called: ${calledUrls.join(', ')}`);

  await auth.logout();
  assert.equal(isAdminDemo(), false);
  assert.equal(auth.session?.authenticated, false);
});
