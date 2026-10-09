import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { openDatabase } from '../src/database.js';
import { createApp } from '../src/app.js';
import { generateCvPdf, pdfDate, pdfDuration } from '../src/cv/pdf.js';

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

test('Korean-style periods use YYYY.MM and inclusive durations only when months are known', () => {
  assert.equal(pdfDate('2021-03'), '2021.03');
  assert.equal(pdfDate('2016'), '2016');
  assert.deepEqual(pdfDuration('2021-03', '2024-12'), { years: 3, months: 10 });
  assert.deepEqual(pdfDuration('2019-04', '2019-07'), { years: 0, months: 4 });
  assert.equal(pdfDuration('2016', '2021'), null);
  assert.equal(pdfDuration('2021-03', null), null);
});

test('the PDF header links the public contact email only when one is configured', async () => {
  const { db, repository } = openDatabase(':memory:');
  try {
    const cv = repository.read('ko')!;
    const withEmail = (await generateCvPdf(cv, { contactEmail: 'contact@example.com' })).toString('latin1');
    assert.match(withEmail, /\/URI \(mailto:contact@example\.com\)/);
    const withoutEmail = (await generateCvPdf(cv)).toString('latin1');
    assert.doesNotMatch(withoutEmail, /mailto:/);
  } finally { db.close(); }
});

/** Text-show operators per page, read from uncompressed page streams. */
function textOperatorsPerPage(pdf: Buffer): number[] {
  const source = pdf.toString('latin1');
  return [...source.matchAll(/\/Type \/Page\n[\s\S]*?\/Contents (\d+) 0 R/g)].map(([, id]) => {
    const stream = source.match(new RegExp(`\\n${id} 0 obj\\n<<\\n/Length \\d+\\n>>\\nstream\\n([\\s\\S]*?)\\nendstream`))![1]!;
    return stream.match(/\bTJ\b/g)?.length ?? 0;
  });
}

test('pagination never leaves a page with only a title, a table header or a fragment of a row', async () => {
  const { db, repository } = openDatabase(':memory:');
  try {
    const base = repository.read('ko')!;
    // Footer: two text operators. Title + table header + footer alone would be five.
    const assertNoNearlyEmptyPage = (pdf: Buffer, context: string) => textOperatorsPerPage(pdf)
      .forEach((count, page) => assert.ok(count > 5, `${context}: page ${page + 1} has only ${count} text operators`));
    const longSkill = structuredClone(base);
    longSkill.profile.text.description = '긴 설명과 프랑스어 악센트 é è à ç. '.repeat(100);
    longSkill.entries[0]!.text.description = '한글 문장이 여러 페이지에 걸쳐 표시됩니다. '.repeat(100);
    assertNoNearlyEmptyPage(await generateCvPdf(longSkill, { compress: false }), 'long skill');
    // A very long experience row starting at varying heights must not scatter its cells.
    const experience = (id: string, description: string) => ({ id, kind: 'experience' as const, url: null, tags: [], startDate: '2020-01', endDate: '2020-02',
      text: { locale: 'ko' as const, fallback: false, title: '개발자', subtitle: `회사 ${id}`, description } });
    for (let count = 0; count <= 12; count += 2) {
      const cv = structuredClone(base);
      cv.entries.push(...Array.from({ length: count }, (_, index) => experience(`short-${index}`, '짧은 설명입니다.')),
        experience('long', '긴 경력 설명이 여러 페이지에 이어집니다. '.repeat(160)),
        experience('bullets', Array.from({ length: 40 }, (_, index) => `• 목록 항목 ${index}: 여러 줄로 이어질 수 있는 성과 설명입니다.`).join('\n')));
      assertNoNearlyEmptyPage(await generateCvPdf(cv, { compress: false }), `${count} short rows`);
    }
  } finally { db.close(); }
});
