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
    const admin = await renderPage(template, '/admin', { ...fixture('fr'), cv: null });
    assert.match(admin.html, /noindex, nofollow/);
    assert.match(admin.html, /<div id="app"><\/div>/);
    assert.doesNotMatch(admin.html, /scrypt|csrfToken|password_hash/);
  } finally { await server.close(); }
});
