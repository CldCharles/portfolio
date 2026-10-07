import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { openDatabase } from '../src/database.js';
import { createApp } from '../src/app.js';
import { createAdminService } from '../src/admin/service.js';
import { adminOptionsFromEnv } from '../src/admin/routes.js';
import { migrateDatabase } from '../src/migrations.js';

const password = 'disposable-test-password';
const origin = 'http://127.0.0.1:5173';
const options = { origin, secureCookies: false };
const mutateHeaders = { Origin: origin, 'X-Portfolio-Request': '1', 'Content-Type': 'application/json' };

test('draft edits stay private, publication matches preview, stale translations survive and conflicts cannot overwrite', () => {
  const { db, repository, admin } = openDatabase(':memory:');
  try {
    const published = repository.read('en');
    const initial = admin.draft();
    const document = structuredClone(initial.document);
    document.items[0]!.name = 'New public name';
    document.items[0]!.translations.fr.text.title = 'Nouveau titre';
    document.items = document.items.filter(item => item.id !== 'react');
    document.items.push({ id: 'new-project', kind: 'project', name: '', githubUrl: null, url: 'https://example.com', tags: [' Vue '], startDate: '2026-01-01', endDate: null, translations: { fr: { text: { title: 'Projet test', subtitle: '', description: 'Test' }, reviewedSource: null }, en: null, ko: null } });
    const saved = admin.save(initial.revision, document);
    assert.deepEqual(repository.read('en'), published);
    assert.equal(admin.preview('en', saved.revision).profile.text.locale, 'fr');
    assert.throws(() => admin.save(initial.revision, initial.document), { code: 'DRAFT_CONFLICT' });
    assert.throws(() => admin.publish(initial.revision), { code: 'DRAFT_CONFLICT' });
    assert.throws(() => admin.preview('fr', initial.revision), { code: 'DRAFT_CONFLICT' });
    const previews = ['fr', 'en', 'ko'].map(lang => admin.preview(lang as 'fr' | 'en' | 'ko', saved.revision));
    const result = admin.publish(saved.revision);
    assert.equal(result.revision, result.publishedRevision);
    for (const preview of previews) assert.deepEqual(repository.read(preview.locale), preview);
    assert.equal(repository.translationStatus('profile').languages.find(item => item.locale === 'en')?.status, 'needs_review');
    assert.ok(admin.draft().document.items[0]!.translations.en?.text.title);
    const approved = structuredClone(result.document);
    approved.items[0]!.translations.en!.reviewedSource = { ...approved.items[0]!.translations.fr.text };
    const validated = admin.save(result.revision, approved);
    admin.publish(validated.revision);
    assert.equal(repository.read('en')!.profile.text.locale, 'en');
    assert.equal(repository.read('ko')!.profile.text.locale, 'fr');
    const current = admin.draft();
    const invalid = structuredClone(current.document);
    invalid.items[1]!.url = 'javascript:alert(1)';
    assert.throws(() => admin.save(current.revision, invalid));
    assert.deepEqual(admin.draft(), current);
    assert.throws(() => admin.save(current.revision, { items: [] }));
    assert.throws(() => admin.save(current.revision, { items: [current.document.items[0], current.document.items[0]] }));
  } finally { db.close(); }
});

test('draft, account and valid sessions survive restart; logout revokes the token', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'portfolio-admin-'));
  const path = join(dir, 'test.sqlite');
  try {
    const first = openDatabase(path);
    await first.admin.configure('tester', password);
    const session = await first.admin.login('tester', password, 'test-ip');
    const draft = first.admin.draft();
    draft.document.items[0]!.name = 'Private draft';
    const saved = first.admin.save(draft.revision, draft.document);
    const stored = first.db.prepare('SELECT password_hash FROM admin_account').get() as { password_hash: string };
    assert.ok(!stored.password_hash.includes(password));
    assert.notEqual((first.db.prepare('SELECT token_hash FROM admin_sessions').get() as { token_hash: string }).token_hash, session.token);
    first.db.close();
    const second = openDatabase(path);
    try {
      assert.equal(second.admin.session(session.token)?.username, 'tester');
      assert.deepEqual(second.admin.draft(), saved);
      assert.equal(second.repository.read('fr')!.profile.name, 'Claude Charles Valentin');
      second.admin.logout(session.token);
      assert.equal(second.admin.session(session.token), null);
      await assert.rejects(second.admin.configure('tester', password), /existe déjà/);
    } finally { second.db.close(); }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('sessions expire and password reset revokes sessions; login throttling survives a new service instance', async () => {
  const { db, repository } = openDatabase(':memory:');
  let time = 1000;
  const admin = createAdminService(db, repository, () => time);
  try {
    await admin.configure('tester', password);
    const first = await admin.login('tester', password, 'one');
    time += 8 * 60 * 60 * 1000;
    assert.equal(admin.session(first.token), null);
    const second = await admin.login('tester', password, 'one');
    await admin.configure('tester', 'another-test-password', true);
    assert.equal(admin.session(second.token), null);
    for (let attempt = 0; attempt < 5; attempt++) await assert.rejects(admin.login('tester', 'invalid-password', 'blocked'), { code: 'INVALID_CREDENTIALS' });
    const restarted = createAdminService(db, repository, () => time);
    await assert.rejects(restarted.login('tester', 'another-test-password', 'blocked'), { code: 'RATE_LIMITED' });
    time += 15 * 60 * 1000;
    assert.ok((await restarted.login('tester', 'another-test-password', 'blocked')).token);
  } finally { db.close(); }
});

test('HTTP admin rejects anonymous access and forged requests, uses HttpOnly sessions and serves private previews', async () => {
  const { db, repository, admin } = openDatabase(':memory:');
  await admin.configure('tester', password);
  const server = createApp(repository, admin, options).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}/api/admin`;
  try {
    for (const path of ['/draft', '/preview?lang=fr&revision=1']) assert.equal((await fetch(base + path)).status, 401);
    const status = await fetch(base + '/session');
    assert.equal(status.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await status.json(), { authenticated: false, configured: true });
    const body = JSON.stringify({ username: 'tester', password });
    assert.equal((await fetch(base + '/login', { method: 'POST', headers: { ...mutateHeaders, Origin: 'https://attacker.example' }, body })).status, 403);
    const login = await fetch(base + '/login', { method: 'POST', headers: mutateHeaders, body });
    assert.equal(login.status, 200);
    const setCookie = login.headers.get('set-cookie')!;
    assert.match(setCookie, /HttpOnly/); assert.match(setCookie, /SameSite=Strict/); assert.match(setCookie, /Path=\/api\/admin/);
    const cookie = setCookie.split(';')[0]!;
    const session = await login.json();
    assert.equal(session.token, undefined);
    const headers = { ...mutateHeaders, Cookie: cookie, 'X-CSRF-Token': session.csrfToken };
    const draft = await (await fetch(base + '/draft', { headers: { Cookie: cookie } })).json();
    assert.equal((await fetch(base + '/publish', { method: 'POST', headers: { ...headers, 'X-CSRF-Token': 'wrong' }, body: JSON.stringify({ revision: draft.revision }) })).status, 403);
    assert.equal((await fetch(base + '/publish', { method: 'POST', headers, body: '{malformed' })).status, 400);
    draft.document.items[0].name = 'Changed in draft';
    const saved = await fetch(base + '/draft', { method: 'PUT', headers, body: JSON.stringify({ revision: draft.revision, document: draft.document }) });
    assert.equal(saved.status, 200);
    const version = await saved.json();
    assert.equal(repository.read('fr')!.profile.name, 'Claude Charles Valentin');
    const preview = await fetch(base + `/preview?lang=fr&revision=${version.revision}`, { headers: { Cookie: cookie } });
    assert.equal(preview.headers.get('cache-control'), 'no-store');
    assert.equal((await preview.json()).profile.name, 'Changed in draft');
    assert.equal((await fetch(base + '/publish', { method: 'POST', headers, body: JSON.stringify({ revision: version.revision }) })).status, 200);
    assert.equal(repository.read('fr')!.profile.name, 'Changed in draft');
    assert.equal((await fetch(base + '/logout', { method: 'POST', headers, body: '{}' })).status, 204);
    assert.equal((await fetch(base + '/draft', { headers: { Cookie: cookie } })).status, 401);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); db.close();
  }
});

test('migration preserves existing v1 content and rejects future versions', () => {
  const db = new Database(':memory:');
  try {
    db.exec("CREATE TABLE cv_items(id TEXT PRIMARY KEY,kind TEXT,common TEXT,position INTEGER,revision INTEGER); CREATE TABLE cv_translations(item_id TEXT,locale TEXT,title TEXT,subtitle TEXT,description TEXT,source_revision INTEGER); INSERT INTO cv_items VALUES ('profile','profile','{}',0,7); PRAGMA user_version=1;");
    migrateDatabase(db);
    assert.equal(db.pragma('user_version', { simple: true }), 2);
    assert.equal((db.prepare('SELECT revision FROM cv_items').get() as { revision: number }).revision, 7);
    migrateDatabase(db);
    db.pragma('user_version=3');
    assert.throws(() => migrateDatabase(db), /Unsupported/);
  } finally { db.close(); }
});

test('production requires an exact HTTPS public origin and secure cookies', () => {
  assert.throws(() => adminOptionsFromEnv({ NODE_ENV: 'production' }));
  assert.throws(() => adminOptionsFromEnv({ NODE_ENV: 'production', PUBLIC_ORIGIN: 'http://example.com' }));
  assert.throws(() => adminOptionsFromEnv({ NODE_ENV: 'production', PUBLIC_ORIGIN: 'https://example.com/' }));
  assert.deepEqual(adminOptionsFromEnv({ NODE_ENV: 'production', PUBLIC_ORIGIN: 'https://example.com' }), { origin: 'https://example.com', secureCookies: true });
});
