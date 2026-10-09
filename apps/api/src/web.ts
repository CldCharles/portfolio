import express, { type Express } from 'express';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Locale, PublicBootstrap, PublicSiteConfig } from '@portfolio/contracts';
import type { CvRepository } from './cv/repository.js';
import { publicSiteConfig } from './public-config.js';
interface Renderer {
  renderPage(template: string, path: string, bootstrap: PublicBootstrap): Promise<{ html: string }>;
  discoveryFile(path: string, site: PublicSiteConfig): { status: number; type: string; body: string } | null;
}
export async function installBuiltWeb(app: Express, repository: CvRepository) {
  const directory = fileURLToPath(new URL('../../web/dist/', import.meta.url));
  const moduleUrl = new URL('../../web/dist/server/entry-server.js', import.meta.url).href;
  const renderer = await import(moduleUrl) as Renderer;
  const template = await readFile(`${directory}index.html`, 'utf8');
  const manifest = JSON.parse(await readFile(`${directory}.vite/manifest.json`, 'utf8')) as Record<string, { css?: string[]; imports?: string[] }>;
  function styles(path: string) {
    const found = new Set<string>(), visited = new Set<string>();
    function visit(key: string) {
      if (visited.has(key)) return;
      visited.add(key);
      for (const css of manifest[key]?.css ?? []) found.add(css);
      for (const child of manifest[key]?.imports ?? []) visit(child);
    }
    visit('src/main.ts');
    visit({ '/privacy': 'src/pages/PrivacyPage.vue', '/cadrage': 'src/pages/ScopingPage.vue' }[path] ?? 'src/pages/CvPage.vue');
    return [...found].map(css => `<link rel="stylesheet" href="/${css}">`).join('\n');
  }
  app.use('/assets', express.static(`${directory}assets`, { immutable: true, maxAge: '1y', index: false }));
  app.get(['/robots.txt', '/sitemap.xml', '/llms.txt'], (request, response) => {
    const file = renderer.discoveryFile(request.path, publicSiteConfig(repository))!;
    response.status(file.status).type(file.type).send(file.body);
  });
  app.get(['/', '/privacy', '/cadrage', '/admin', '/admin/login'], async (request, response) => {
    const value = request.query.lang ?? 'fr';
    if (typeof value !== 'string' || !['fr', 'en', 'ko'].includes(value)) { response.status(400).send('INVALID_LOCALE'); return; }
    const locale = value as Locale;
    const cv = request.path === '/' ? repository.read(locale) : null;
    if (request.path === '/' && !cv) { response.status(404).send('CV_NOT_FOUND'); return; }
    if (request.path.startsWith('/admin')) response.set('X-Robots-Tag', 'noindex, nofollow');
    try {
      const page = await renderer.renderPage(template.replace('</head>', `${styles(request.path)}</head>`), request.path, { locale, cv, site: publicSiteConfig(repository) });
      response.set('Cache-Control', 'no-cache').type('html').send(page.html);
    } catch { response.status(500).send('PAGE_RENDER_FAILED'); }
  });
  app.use((_request, response) => response.status(404).send('NOT_FOUND'));
}
