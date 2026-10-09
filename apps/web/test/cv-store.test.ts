import test from 'node:test';
import assert from 'node:assert/strict';
import { createPinia, setActivePinia } from 'pinia';
import { useCvStore } from '../src/features/cv/stores/cv.ts';

function deferred() {
  let resolve!: (value: Response) => void;
  return { promise: new Promise<Response>(done => { resolve = done; }), resolve: (value: Response) => resolve(value) };
}

test('latest language wins even when an old response arrives last', async context => {
  setActivePinia(createPinia());
  const french = deferred();
  const korean = deferred();
  const signals: AbortSignal[] = [];
  context.mock.method(globalThis, 'fetch', (url: string, options: RequestInit) => {
    signals.push(options.signal as AbortSignal);
    return url.endsWith('fr') ? french.promise : korean.promise;
  });
  const store = useCvStore();
  const first = store.load('fr');
  const second = store.load('ko');
  assert.equal(signals[0]!.aborted, true);
  korean.resolve(Response.json({ locale: 'ko' }));
  await second;
  french.resolve(Response.json({ locale: 'fr' }));
  await first;
  assert.equal(store.cv?.locale, 'ko');
  assert.equal(store.loading, false);
  assert.equal(store.failed, false);
});

test('failed requests expose retry state and a successful retry clears it', async context => {
  setActivePinia(createPinia());
  const mock = context.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 503 }));
  const store = useCvStore();
  await store.load('en');
  assert.equal(store.failed, true);
  assert.equal(store.loading, false);
  assert.equal(store.cv, null);
  mock.mock.mockImplementation(async () => Response.json({ locale: 'en' }));
  await store.load('en');
  assert.equal(store.failed, false);
  assert.equal(store.cv?.locale, 'en');
});

test('SSR bootstrap skips only the first load; returning from admin fetches the latest publication', async context => {
  setActivePinia(createPinia());
  const store = useCvStore();
  const initial = { locale: 'fr', profile: { name: 'Before', githubUrl: null, text: { title: 'Role', subtitle: '', description: '', locale: 'fr', fallback: false } }, entries: [] } as const;
  store.hydrate({ ...initial, entries: [] });
  assert.equal(store.consumeHydration('fr'), true);
  const fetch = context.mock.method(globalThis, 'fetch', async () => Response.json({ ...initial, profile: { ...initial.profile, name: 'After publication' } }));
  assert.equal(store.consumeHydration('fr'), false);
  await store.load('fr');
  assert.equal(fetch.mock.callCount(), 1);
  assert.equal(store.cv?.profile.name, 'After publication');
});

test('switching language keeps the current CV visible until the new one arrives', async context => {
  setActivePinia(createPinia());
  const korean = deferred();
  context.mock.method(globalThis, 'fetch', () => korean.promise);
  const store = useCvStore();
  const french = { locale: 'fr', profile: { name: 'Name', githubUrl: null, text: { title: 'Role', subtitle: '', description: '', locale: 'fr', fallback: false } }, entries: [] } as const;
  store.hydrate({ ...french, entries: [] });
  const pending = store.load('ko');
  assert.equal(store.loading, true);
  assert.equal(store.cv?.locale, 'fr');
  korean.resolve(Response.json({ ...french, locale: 'ko' }));
  await pending;
  assert.equal(store.loading, false);
  assert.equal(store.cv?.locale, 'ko');
});
