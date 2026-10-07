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
