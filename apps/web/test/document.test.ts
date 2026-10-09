import test from 'node:test';
import assert from 'node:assert/strict';
import { discoveryFile, htmlDocument, pageMetadata } from '../src/server/document';
import type { PublicSiteConfig } from '@portfolio/contracts';
const site: PublicSiteConfig = { editorName: 'Public Name', publicOrigin: 'https://example.com', contactEmail: null, hostName: null, hostCountry: null, hostLogRetention: null };

test('discovery only indexes published public pages, with language alternates and no fabricated local domain', () => {
  const sitemap = discoveryFile('/sitemap.xml', site)!;
  assert.equal(sitemap.type, 'application/xml');
  assert.equal((sitemap.body.match(/<url>/g) ?? []).length, 9);
  assert.match(sitemap.body, /\/cadrage\?lang=ko/);
  assert.doesNotMatch(sitemap.body, /admin|localhost|127\.0\.0\.1/);
  assert.match(sitemap.body, /hreflang="ko"/);
  assert.match(discoveryFile('/robots.txt', site)!.body, /Disallow: \/admin/);
  assert.match(discoveryFile('/llms.txt', site)!.body, /CV — 한국어/);
  assert.equal(discoveryFile('/sitemap.xml', { ...site, publicOrigin: null })!.status, 503);
});
test('HTML metadata and JSON bootstrap cannot break out through untrusted public text', () => {
  const attack = '</script><script>alert("x")</script>';
  const document = htmlDocument('<html lang="fr"><head><title>Portfolio</title></head><body><div id="app"></div></body></html>', '/privacy', { locale: 'ko', cv: null, site: { ...site, editorName: attack } }, '<main>Safe</main>', attack, attack);
  assert.doesNotMatch(document, /<script>alert/);
  assert.match(document, /<html lang="ko"/);
  assert.match(document, /\\u003c\/script/);
  assert.match(pageMetadata('/admin/login', 'fr', site, null, 'Admin', 'Admin'), /noindex, nofollow/);
  assert.doesNotMatch(pageMetadata('/', 'fr', { ...site, publicOrigin: null }, null, 'CV', 'CV'), /rel="canonical"/);
});

test('public dollar sequences stay literal when assembling metadata', () => {
  const literal = "Role $& $` $' $$";
  const html = htmlDocument('<html lang="fr"><head><title>Portfolio</title></head><body><div id="app"></div></body></html>', '/', { locale: 'fr', cv: null, site }, '<main>CV</main>', literal, literal);
  assert.equal((html.match(/<title>/g) ?? []).length, 1);
  assert.match(html, /Role \$&amp; \$` \$&#39; \$\$/);
  assert.equal((html.match(/<\/head>/g) ?? []).length, 1);
});
