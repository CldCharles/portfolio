import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { openDatabase } from '../src/database.js';
import { createApp } from '../src/app.js';
import { generateCvPdf } from '../src/cv/pdf.js';

test('PDF download supports each locale, validates queries and never exposes the private draft', async () => {
  const { db, repository, admin } = openDatabase(':memory:');
  const server = createApp(repository, admin, { origin: 'http://127.0.0.1:5173', secureCookies: false }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address(); assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}/api/cv/pdf`;
  try {
    const before = await fetch(`${base}?lang=fr`); const beforePdf = Buffer.from(await before.arrayBuffer());
    const draft = admin.draft();
    draft.document.items[0]!.name = 'PRIVATE DRAFT'; admin.save(draft.revision, draft.document);
    for (const locale of ['fr','en','ko']) {
      const response = await fetch(`${base}?lang=${locale}`);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type')!, /^application\/pdf/);
      assert.match(response.headers.get('content-disposition')!, new RegExp(`attachment; filename="cv-${locale}.pdf"`));
      assert.equal(response.headers.get('cache-control'), 'no-store');
      const buffer = Buffer.from(await response.arrayBuffer());
      assert.equal(buffer.subarray(0, 5).toString(), '%PDF-');
      assert.ok(buffer.length > 1000);
      assert.equal(buffer.toString('latin1').match(/\/Type \/Page\b/g)?.length, 1, 'The seed CV fits on one page; footers must not create blank pages');
      if (locale === 'fr') assert.deepEqual(buffer, beforePdf);
    }
    for (const query of ['lang=kr','lang=de','lang=fr&lang=en','lang=']) assert.equal((await fetch(`${base}?${query}`)).status, 400);
    assert.equal((await fetch(base)).status, 200);
    repository.setTranslation('profile', 'fr', { title: 'Nouveau titre', subtitle: '', description: 'Source publiée modifiée' }, 1);
    const updated = Buffer.from(await (await fetch(`${base}?lang=fr`)).arrayBuffer());
    assert.notDeepEqual(updated, beforePdf);
    db.prepare("DELETE FROM cv_items WHERE kind = 'profile'").run();
    assert.equal((await fetch(base)).status, 404);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); db.close();
  }
});
test('long Korean descriptions produce multiple complete PDF pages', async () => {
  const { db, repository } = openDatabase(':memory:');
  try {
    const cv = repository.read('ko')!;
    cv.profile.text.description = '긴 설명과 프랑스어 악센트 é è à ç. '.repeat(100);
    cv.entries[0]!.text.description = '한글 문장이 여러 페이지에 걸쳐 표시됩니다. '.repeat(100);
    const pdf = await generateCvPdf(cv);
    const pages = pdf.toString('latin1').match(/\/Type \/Page\b/g) ?? [];
    assert.ok(pages.length >= 3);
    assert.match(pdf.toString('latin1'), /\/ToUnicode/);
    assert.match(pdf.subarray(-100).toString(), /%%EOF/);
  } finally { db.close(); }
});
