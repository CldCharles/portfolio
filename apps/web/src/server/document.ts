import type { Locale, PublicBootstrap, PublicCv, PublicSiteConfig } from '@portfolio/contracts';

export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
export const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
export function pageMetadata(path: string, locale: Locale, site: PublicSiteConfig, cv: PublicCv | null, title: string, description: string) {
  const canonical = site.publicOrigin ? `${site.publicOrigin}${path}?lang=${locale}` : null;
  const tags = [`<meta name="description" content="${escapeHtml(description)}">`, `<meta property="og:title" content="${escapeHtml(title)}">`, `<meta property="og:description" content="${escapeHtml(description)}">`, '<meta property="og:type" content="website">', `<meta property="og:locale" content="${{ fr: 'fr_FR', en: 'en_US', ko: 'ko_KR' }[locale]}">`];
  if (path.startsWith('/admin')) tags.push('<meta name="robots" content="noindex, nofollow">');
  if (canonical && !path.startsWith('/admin')) {
    tags.push(`<link rel="canonical" href="${escapeHtml(canonical)}">`, `<meta property="og:url" content="${escapeHtml(canonical)}">`);
    for (const language of ['fr', 'en', 'ko']) tags.push(`<link rel="alternate" hreflang="${language}" href="${escapeHtml(`${site.publicOrigin}${path}?lang=${language}`)}">`);
  }
  if (path === '/' && cv) {
    const person = { '@type': 'Person', name: cv.profile.name, jobTitle: cv.profile.text.title, description: cv.profile.text.description, ...(cv.profile.githubUrl ? { sameAs: [cv.profile.githubUrl] } : {}),
      ...(cv.profile.countryCode ? { address: { '@type': 'PostalAddress', addressCountry: cv.profile.countryCode } } : {}),
      ...(cv.entries.some(entry => entry.kind === 'language') ? { knowsLanguage: cv.entries.filter(entry => entry.kind === 'language').map(entry => entry.text.title) } : {}) };
    tags.push(`<script type="application/ld+json">${scriptJson({ '@context': 'https://schema.org', '@type': 'ProfilePage', inLanguage: locale, ...(canonical ? { url: canonical } : {}), mainEntity: person })}</script>`);
  }
  return tags.join('\n');
}
export function htmlDocument(template: string, path: string, bootstrap: PublicBootstrap, html: string, title: string, description: string) {
  return template.replace(/<html lang="[^"]*"/, `<html lang="${bootstrap.locale}"`)
    .replace(/<title>[^<]*<\/title>/, () => `<title>${escapeHtml(title)}</title>`)
    .replace(/\s*<meta name="description"[^>]*>/, '')
    .replace('</head>', () => `${pageMetadata(path, bootstrap.locale, bootstrap.site, bootstrap.cv, title, description)}\n</head>`)
    .replace('<div id="app"></div>', () => `<div id="app">${html}</div>\n<script id="portfolio-bootstrap" type="application/json">${scriptJson(bootstrap)}</script>`);
}
export function discoveryFile(path: string, site: PublicSiteConfig) {
  if (path === '/robots.txt') return { status: 200, type: 'text/plain', body: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n${site.publicOrigin ? `Sitemap: ${site.publicOrigin}/sitemap.xml\n` : ''}` };
  if (path === '/sitemap.xml') {
    if (!site.publicOrigin) return { status: 503, type: 'text/plain', body: 'Domaine public à configurer avec SITE_URL avant mise en ligne.\n' };
    const urls = ['/', '/cadrage', '/privacy'].flatMap(page => (['fr', 'en', 'ko'] as const).map(locale => `<url><loc>${escapeHtml(`${site.publicOrigin}${page}?lang=${locale}`)}</loc>${(['fr', 'en', 'ko'] as const).map(language => `<xhtml:link rel="alternate" hreflang="${language}" href="${escapeHtml(`${site.publicOrigin}${page}?lang=${language}`)}"/>`).join('')}</url>`));
    return { status: 200, type: 'application/xml', body: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>` };
  }
  if (path === '/llms.txt') {
    const origin = site.publicOrigin ?? '';
    return { status: 200, type: 'text/plain', body: `# ${site.editorName}\n\n> Personal CV portfolio for recruiters. No products or services are sold.\n\nPublic professional background, experience, projects, skills and education in French, English and Korean. Pages and PDFs reflect the published CV only. This discovery file does not guarantee indexing or citation.\n\n## Public pages\n\n- [CV — Français](${origin}/?lang=fr)\n- [CV — English](${origin}/?lang=en)\n- [CV — 한국어](${origin}/?lang=ko)\n- [Scoping workshop — free requirements tool](${origin}/cadrage?lang=en)\n- [Privacy](${origin}/privacy?lang=en)\n\n## Optional\n\n- [PDF — Français](${origin}/api/cv/pdf?lang=fr)\n- [PDF — English](${origin}/api/cv/pdf?lang=en)\n- [PDF — 한국어](${origin}/api/cv/pdf?lang=ko)\n\nThe administration area is private and is not a source for the public CV.\n` };
  }
  return null;
}
