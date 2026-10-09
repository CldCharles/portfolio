import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import type { PublicBootstrap, Locale } from '@portfolio/contracts';

test('SSR serves public text, links and privacy in all languages, isolates concurrent requests and never renders admin data', async () => {
  const server = await createServer({ root: fileURLToPath(new URL('../', import.meta.url)), server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' });
  try {
    const { renderPage } = await server.ssrLoadModule('/src/entry-server.ts');
    const template = '<html lang="fr"><head><title>Portfolio</title></head><body><div id="app"></div></body></html>';
    const fixture = (locale: Locale): PublicBootstrap => ({ locale, site: { editorName: `Name ${locale}`, contactEmail: null, hostName: null, hostCountry: null, hostLogRetention: null, publicOrigin: 'https://example.com' }, cv: { locale, profile: { name: `Name ${locale}`, githubUrl: null, text: { locale, fallback: false, title: `Role ${locale}`, subtitle: '', description: `Published ${locale}` } }, entries: [] } });
    const results = await Promise.all((['fr', 'en', 'ko'] as const).map(async locale => ({ locale, page: await renderPage(template, '/', fixture(locale)) })));
    for (const { locale, page } of results) {
      assert.match(page.html, new RegExp(`<html lang="${locale}"`));
      assert.match(page.html, new RegExp(`Published ${locale}`));
      assert.match(page.html, /application\/ld\+json/);
      assert.match(page.html, /href="\/\?lang=ko"/);
      for (const other of ['fr', 'en', 'ko'].filter(value => value !== locale)) assert.doesNotMatch(page.html, new RegExp(`Name ${other}`));
      const privacy = await renderPage(template, '/privacy', { ...fixture(locale), cv: null });
      assert.match(privacy.html, /portfolio_session/);
      assert.match(privacy.html, /scrypt/);
    }
    const populated = fixture('fr');
    populated.cv!.entries = [
      { id: 'sopra-2021-2024', kind: 'experience', startDate: '2021-03', endDate: null, url: null, tags: [], text: { locale: 'fr', fallback: false, title: 'Engineer', subtitle: 'Company', description: 'Public experience' } },
      { id: 'portfolio', kind: 'project', startDate: null, endDate: null, url: 'https://example.com/project', tags: [], text: { locale: 'fr', fallback: false, title: 'Portfolio', subtitle: '', description: 'Public project' } },
      { id: 'other-project', kind: 'project', startDate: null, endDate: null, url: null, tags: [], text: { locale: 'fr', fallback: false, title: 'Other project', subtitle: '', description: 'No illustration' } },
      { id: 'vue', kind: 'skill', startDate: null, endDate: null, url: null, tags: [], text: { locale: 'en', fallback: true, title: 'Vue', subtitle: '', description: 'Visible skill description\nSecond line' } },
    ];
    const populatedPage = await renderPage(template, '/', populated);
    const skills = populatedPage.html.match(/<section[^>]*id="skills"[\s\S]*?<\/section>/)![0];
    assert.match(skills, /Visible skill description/);
    assert.match(skills, /Second line/);
    assert.match(skills, /fallback-note/);
    assert.match(skills, /lang="en"/);
    assert.doesNotMatch(skills, /<details|<summary/);
    assert.doesNotMatch(populatedPage.html, /portfolio-preview/);
    assert.match(populatedPage.html, /datetime="2021-03"/);
    assert.equal((populatedPage.html.match(/<h1\b/g) ?? []).length, 1);
    // The presentation associations must not leak to a different entry kind.
    populated.cv!.entries = populated.cv!.entries.map(entry => ({ ...entry, kind: 'education' }));
    const educationPage = await renderPage(template, '/', populated);
    assert.doesNotMatch(educationPage.html, /class="project-preview"|featured-entry/);
    const admin = await renderPage(template, '/admin', { ...fixture('fr'), cv: null });
    assert.match(admin.html, /noindex, nofollow/);
    assert.match(admin.html, /<div id="app"><\/div>/);
    assert.doesNotMatch(admin.html, /scrypt|csrfToken|password_hash/);
  } finally { await server.close(); }
});
