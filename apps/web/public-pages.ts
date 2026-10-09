import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import type { Locale, PublicBootstrap } from '@portfolio/contracts';

export function publicPages(): Plugin {
  return {
    name: 'portfolio-public-pages',
    configureServer(server) {
      const target = process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:3000';
      server.middlewares.use(async (request, response, next) => {
        if (!request.url || request.method !== 'GET' || request.headers.accept?.includes('text/x-vite-ping')) return next();
        const url = new URL(request.url, 'http://localhost');
        const pages = ['/', '/privacy', '/cadrage', '/admin', '/admin/login'];
        if (![...pages, '/robots.txt', '/sitemap.xml', '/llms.txt'].includes(url.pathname)) return next();
        const language = url.searchParams.get('lang') ?? 'fr';
        if (!['fr', 'en', 'ko'].includes(language)) { response.statusCode = 400; response.end('INVALID_LOCALE'); return; }
        try {
          const siteResponse = await fetch(`${target}/api/site`);
          if (!siteResponse.ok) throw new Error('Public configuration unavailable');
          const site = await siteResponse.json();
          const renderer = await server.ssrLoadModule('/src/entry-server.ts');
          const discovery = renderer.discoveryFile(url.pathname, site);
          if (discovery) {
            response.statusCode = discovery.status;
            response.setHeader('Content-Type', `${discovery.type}; charset=utf-8`);
            response.end(discovery.body); return;
          }
          const cvResponse = url.pathname === '/' ? await fetch(`${target}/api/cv?lang=${language}`) : null;
          if (cvResponse && !cvResponse.ok) { response.statusCode = cvResponse.status; response.end('CV_NOT_FOUND'); return; }
          const bootstrap: PublicBootstrap = { locale: language as Locale, site, cv: cvResponse ? await cvResponse.json() : null };
          let template = await readFile(resolve(server.config.root, 'index.html'), 'utf8');
          template = await server.transformIndexHtml(request.url, template);
          const result = await renderer.renderPage(template, url.pathname, bootstrap);
          const links = ['<link rel="stylesheet" href="/src/styles/main.css?direct">'];
          for (const module of result.modules as string[]) {
            const relative = module.startsWith(server.config.root) ? module.slice(server.config.root.length + 1) : module;
            if (!relative.startsWith('src/') || !relative.endsWith('.vue')) continue;
            const source = await readFile(resolve(server.config.root, relative), 'utf8');
            if (source.includes('<style')) links.push(`<link rel="stylesheet" href="/${relative}?vue&type=style&index=0&lang.css">`);
          }
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.setHeader('Cache-Control', 'no-cache');
          if (url.pathname.startsWith('/admin')) response.setHeader('X-Robots-Tag', 'noindex, nofollow');
          response.end(result.html.replace('</head>', `${links.join('\n')}</head>`));
        } catch (error) {
          server.ssrFixStacktrace(error as Error);
          server.config.logger.error(error instanceof Error ? error.message : 'Public rendering failed');
          response.statusCode = 503;
          response.end('Public page unavailable. Start the API with npm run dev.');
        }
      });
    },
  };
}
