import test from 'node:test';
import assert from 'node:assert/strict';
import { createPinia, setActivePinia } from 'pinia';
import type { AdminDraft } from '@portfolio/contracts';
import { useAuthStore } from '../src/features/auth/store.ts';
import { useEditorStore } from '../src/features/admin/store.ts';
const draft: AdminDraft = { revision: 1, publishedRevision: 1, document: { items: [{ id: 'profile', kind: 'profile', name: 'Test', githubUrl: null, url: null, tags: [], startDate: null, endDate: null, translations: { fr: { text: { title: 'Engineer', subtitle: '', description: '' }, reviewedSource: null }, en: null, ko: null } }] } };

test('draft conflicts preserve local edits and do not publish', async context => {
  setActivePinia(createPinia());
  const mock = context.mock.method(globalThis, 'fetch', async () => Response.json(draft));
  const editor = useEditorStore();
  await editor.load();
  editor.document!.items[0]!.name = 'My unsaved edit';
  assert.equal(editor.dirty, true);
  mock.mock.mockImplementation(async () => Response.json({ error: 'DRAFT_CONFLICT' }, { status: 409 }));
  await editor.save();
  assert.equal(editor.error, 'DRAFT_CONFLICT');
  assert.equal(editor.document!.items[0]!.name, 'My unsaved edit');
  assert.equal(editor.dirty, true);
  const requests = mock.mock.callCount();
  await editor.publish();
  assert.equal(mock.mock.callCount(), requests);
});

test('expired sessions preserve edits for reconnection', async context => {
  setActivePinia(createPinia());
  const mock = context.mock.method(globalThis, 'fetch', async () => Response.json(draft));
  const editor = useEditorStore();
  const auth = useAuthStore();
  auth.session = { authenticated: true, configured: true, csrfToken: 'example' };
  await editor.load();
  editor.document!.items[0]!.name = 'Keep this';
  mock.mock.mockImplementation(async () => Response.json({ error: 'AUTH_REQUIRED' }, { status: 401 }));
  await editor.save();
  assert.equal(auth.session?.authenticated, false);
  assert.equal(editor.document!.items[0]!.name, 'Keep this');
  assert.equal(editor.dirty, true);
});

test('publication requires a saved preview and sends the revision and CSRF token', async context => {
  setActivePinia(createPinia());
  const calls: { url: string; options: RequestInit }[] = [];
  context.mock.method(globalThis, 'fetch', async (url: string, options: RequestInit) => {
    calls.push({ url, options });
    if (url.includes('/preview')) return Response.json({ locale: 'fr', profile: {}, entries: [] });
    return Response.json(draft);
  });
  const auth = useAuthStore(); auth.session = { authenticated: true, configured: true, csrfToken: 'csrf-example' };
  const editor = useEditorStore();
  await editor.load();
  await editor.publish();
  assert.equal(calls.length, 1);
  await editor.showPreview('fr');
  await editor.publish();
  assert.equal(calls.at(-1)!.url, '/api/admin/publish');
  assert.equal((calls.at(-1)!.options.headers as Record<string, string>)['X-CSRF-Token'], 'csrf-example');
  assert.deepEqual(JSON.parse(calls.at(-1)!.options.body as string), { revision: 1 });
});
