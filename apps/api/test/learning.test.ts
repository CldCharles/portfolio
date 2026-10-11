import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { openDatabase } from '../src/database.js';
import { createApp } from '../src/app.js';
import { createLearningService } from '../src/learning/service.js';

const origin = 'http://127.0.0.1:5173';
const mutateHeaders = { Origin: origin, 'X-Portfolio-Request': '1', 'Content-Type': 'application/json' };
const blank = { status: 'todo', understood: '', unclear: '', link: null };

test('learning progress keeps the first completion date, validates input and drops blank sessions', () => {
  const { db } = openDatabase(':memory:');
  try {
    let clock = Date.parse('2026-10-12T10:00:00Z');
    const learning = createLearningService(db, () => clock);
    assert.deepEqual(learning.list(), { sessions: {} });
    const done = learning.save('w01-d1', { ...blank, status: 'done' });
    assert.equal(done.doneAt, '2026-10-12T10:00:00.000Z');
    clock += 86_400_000;
    assert.equal(learning.save('w01-d1', { ...blank, status: 'done', understood: 'Les conversions', link: ' https://github.com/me/repo ' }).doneAt, done.doneAt);
    assert.deepEqual(learning.list().sessions['w01-d1'], { status: 'done', doneAt: done.doneAt, understood: 'Les conversions', unclear: '', link: 'https://github.com/me/repo' });
    assert.equal(learning.save('w01-d1', { ...blank, status: 'skipped' }).doneAt, null);
    assert.equal(learning.save('w01-d2', { ...blank, unclear: 'Les boucles' }).status, 'todo');
    learning.save('w01-d1', { ...blank, link: '' });
    assert.deepEqual(Object.keys(learning.list().sessions), ['w01-d2']);
    for (const id of ['w00-d1', 'w27-d1', 'w01-d7', 'w1-d1', 'x']) assert.throws(() => learning.save(id, blank), id);
    for (const input of [{ ...blank, status: 'late' }, { ...blank, link: 'javascript:alert(1)' }, { ...blank, understood: 'x'.repeat(5001) }, { ...blank, extra: 1 }, null]) assert.throws(() => learning.save('w01-d1', input));
  } finally { db.close(); }
});

test('learning progress is only reachable through an authenticated admin session with CSRF', async () => {
  const { db, repository, admin } = openDatabase(':memory:');
  await admin.configure('tester', 'disposable-test-password');
  const server = createApp(repository, admin, { origin, secureCookies: false }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}/api/admin`;
  try {
    assert.equal((await fetch(`${base}/learning`)).status, 401);
    assert.equal((await fetch(`${base}/learning/w01-d1`, { method: 'PUT', headers: mutateHeaders, body: JSON.stringify(blank) })).status, 401);
    const login = await fetch(`${base}/login`, { method: 'POST', headers: mutateHeaders, body: JSON.stringify({ username: 'tester', password: 'disposable-test-password' }) });
    const cookie = login.headers.get('set-cookie')!.split(';')[0]!;
    const headers = { ...mutateHeaders, Cookie: cookie, 'X-CSRF-Token': (await login.json()).csrfToken };
    const body = JSON.stringify({ ...blank, status: 'done' });
    assert.equal((await fetch(`${base}/learning/w01-d1`, { method: 'PUT', headers: { ...headers, 'X-CSRF-Token': 'wrong' }, body })).status, 403);
    assert.equal((await fetch(`${base}/learning/w99-d1`, { method: 'PUT', headers, body })).status, 400);
    const saved = await fetch(`${base}/learning/w01-d1`, { method: 'PUT', headers, body });
    assert.equal(saved.status, 200);
    assert.equal((await saved.json()).status, 'done');
    const list = await fetch(`${base}/learning`, { headers: { Cookie: cookie } });
    assert.equal(list.headers.get('cache-control'), 'no-store');
    assert.equal((await list.json()).sessions['w01-d1'].status, 'done');
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); db.close();
  }
});
