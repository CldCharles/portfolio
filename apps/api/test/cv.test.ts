import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { openDatabase } from '../src/database.js';
import { createApp } from '../src/app.js';

const source = { title: 'Software Engineer', subtitle: 'A new heading', description: 'Updated source' };

test('publishes all three languages without invented career records', () => {
  const { db, repository } = openDatabase(':memory:');
  try {
    for (const locale of ['fr', 'en', 'ko'] as const) {
      const cv = repository.read(locale)!;
      assert.equal(cv.profile.name, 'Claude Charles Valentin');
      assert.equal(cv.profile.text.locale, locale);
      assert.equal(cv.profile.text.fallback, false);
      assert.equal(cv.entries.length, 3);
      assert.ok(cv.entries.every(entry => entry.text.locale === locale));
      assert.ok(cv.entries.every(entry => entry.kind !== 'experience' && entry.kind !== 'education'));
    }
  } finally { db.close(); }
});

test('source edits preserve translations, mark them stale and fall back until revalidated', () => {
  const { db, repository } = openDatabase(':memory:');
  try {
    const oldEnglish = repository.read('en')!.profile.text;
    repository.setTranslation('profile', 'fr', source, 1);
    assert.equal(repository.translationStatus('profile').revision, 2);
    assert.deepEqual(repository.translationStatus('profile').languages.map(item => item.status), ['current', 'needs_review', 'needs_review']);
    assert.equal(repository.read('en')!.profile.text.locale, 'fr');
    assert.equal(repository.read('en')!.profile.text.fallback, true);
    assert.equal(repository.read('en')!.profile.text.title, source.title);
    assert.throws(() => repository.setTranslation('profile', 'en', source, 1), /Source changed/);
    const { title, subtitle, description } = oldEnglish;
    repository.setTranslation('profile', 'en', { title, subtitle, description }, 2);
    assert.equal(repository.read('en')!.profile.text.locale, 'en');
    assert.equal(repository.read('ko')!.profile.text.locale, 'fr');
    // Re-saving an unchanged source does not invalidate approved translations.
    repository.setTranslation('profile', 'fr', source, 2);
    assert.equal(repository.translationStatus('profile').revision, 2);
  } finally { db.close(); }
});

test('new entries fall back and invalid common fields cannot partially overwrite content', () => {
  const { db, repository } = openDatabase(':memory:');
  try {
    const entry = { id: 'sample', kind: 'experience', url: null, tags: [], startDate: '2024-01-01', endDate: null, position: 5 };
    repository.saveEntry(entry, source);
    assert.equal(repository.read('ko')!.entries.find(item => item.id === 'sample')!.text.fallback, true);
    assert.deepEqual(repository.translationStatus('sample').languages.map(item => item.status), ['current', 'missing', 'missing']);
    assert.throws(() => repository.saveEntry({ ...entry, url: 'javascript:alert(1)' }, source));
    assert.throws(() => repository.saveEntry({ ...entry, startDate: '2024-02-31' }, source));
    assert.throws(() => repository.saveEntry({ ...entry, endDate: '2023-01-01' }, source));
    assert.throws(() => repository.saveEntry({ ...entry, id: 'profile' }, source));
    assert.throws(() => repository.saveEntry({ ...entry, tags: ['Changed'] }, { ...source, title: '' }));
    assert.deepEqual(repository.read('fr')!.entries.find(item => item.id === 'sample')!.tags, []);
    repository.setTranslation('sample', 'en', source, 1);
    repository.saveEntry({ ...entry, startDate: '2024-02-01' }, source);
    assert.equal(repository.read('en')!.entries.find(item => item.id === 'sample')!.text.locale, 'en');
  } finally { db.close(); }
});

test('edits survive restart and seeding never replaces them', () => {
  const directory = mkdtempSync(join(tmpdir(), 'portfolio-test-'));
  const path = join(directory, 'cv.sqlite');
  try {
    const first = openDatabase(path);
    first.repository.setTranslation('profile', 'fr', source, 1);
    first.db.close();
    const second = openDatabase(path);
    try {
      assert.equal(second.repository.read('fr')!.profile.text.description, source.description);
      assert.equal(second.repository.translationStatus('profile').revision, 2);
      assert.equal(second.repository.read('fr')!.entries.length, 3);
    } finally { second.db.close(); }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('public HTTP endpoint validates locale and exposes no revision or write endpoint', async () => {
  const { db, repository } = openDatabase(':memory:');
  const server = createApp(repository).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    for (const locale of ['fr', 'en', 'ko']) {
      const response = await fetch(`${base}/api/cv?lang=${locale}`);
      assert.equal(response.status, 200);
      const cv = await response.json();
      assert.equal(cv.locale, locale);
      assert.equal(cv.profile.text.locale, locale);
      assert.equal(cv.profile.revision, undefined);
    }
    assert.equal((await (await fetch(`${base}/api/cv`)).json()).locale, 'fr');
    for (const query of ['lang=kr', 'lang=de', 'lang=fr&lang=en', 'lang[foo]=en']) {
      // Express treats brackets as a literal unknown key; absence of lang uses French.
      const response = await fetch(`${base}/api/cv?${query}`);
      assert.equal(response.status, query.includes('[') ? 200 : 400);
    }
    assert.equal((await fetch(`${base}/api/cv`, { method: 'POST' })).status, 404);
    assert.equal((await fetch(`${base}/api/health`)).status, 200);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    db.close();
  }
});


test('partial dates retain precision and compare overlapping ranges correctly', () => {
  const { db, repository } = openDatabase(':memory:');
  try {
    const entry = { id: 'partial-dates', kind: 'experience', url: null, tags: [], startDate: '2020', endDate: '2024-03', position: 5 };
    repository.saveEntry(entry, source);
    assert.equal(repository.read('fr')!.entries.find(item => item.id === entry.id)!.startDate, '2020');
    assert.equal(repository.read('ko')!.entries.find(item => item.id === entry.id)!.endDate, '2024-03');
    repository.saveEntry({ ...entry, startDate: '2024-12-31', endDate: '2024' }, source);
    repository.saveEntry({ ...entry, startDate: null, endDate: '2024-03' }, source);
    for (const bad of ['0000', '2024-00', '2024-13', '2024-02-30', 'Mar 2024']) {
      assert.throws(() => repository.saveEntry({ ...entry, startDate: bad }, source));
    }
    assert.throws(() => repository.saveEntry({ ...entry, startDate: '2025', endDate: '2024' }, source));
    assert.throws(() => repository.saveEntry({ ...entry, startDate: '2024-04', endDate: '2024-03' }, source));
  } finally { db.close(); }
});

test('profile country and language entries are stored and validated', () => {
  const { db, repository } = openDatabase(':memory:');
  try {
    const profile = { name: 'Claude Charles Valentin', githubUrl: null };
    const text = { title: 'Software Engineer', subtitle: '', description: '' };
    assert.equal(repository.read('fr')!.profile.countryCode, null);
    repository.saveProfile({ ...profile, countryCode: 'KR' }, text);
    assert.equal(repository.read('ko')!.profile.countryCode, 'KR');
    for (const countryCode of ['kr', 'QQ', 'ZZ', 'KOR']) assert.throws(() => repository.saveProfile({ ...profile, countryCode }, text));
    repository.saveEntry({ id: 'korean', kind: 'language', url: null, tags: [], startDate: null, endDate: null, position: 20 }, { title: 'Coréen', subtitle: 'Niveau 6', description: '' });
    assert.equal(repository.read('fr')!.entries.find(entry => entry.id === 'korean')?.kind, 'language');
  } finally { db.close(); }
});
