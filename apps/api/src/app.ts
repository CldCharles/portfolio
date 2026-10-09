import express from 'express';
import helmet from 'helmet';
import { publicSiteConfig } from './public-config.js';
import { ZodError } from 'zod';
import { AdminError, type AdminService } from './admin/service.js';
import { adminRoutes, adminOptionsFromEnv, type AdminOptions } from './admin/routes.js';
import type { CvRepository } from './cv/repository.js';
import { localeSchema } from './cv/schema.js';
import { findPortrait, generateCvPdf, pdfFilename } from './cv/pdf.js';
import type { Locale } from '@portfolio/contracts';

export function createApp(repository: CvRepository, admin?: AdminService, options?: AdminOptions) {
  const app = express();
  const pdfCache = new Map<Locale, { snapshot: string; pdf: Promise<Buffer> }>();
  app.disable('x-powered-by');
  app.use(helmet({ strictTransportSecurity: process.env.NODE_ENV === 'production' ? undefined : false }));
  app.use(express.json({ limit: '1mb' }));
  if (admin) app.use('/api/admin', adminRoutes(admin, options ?? adminOptionsFromEnv()));
  app.get('/api/site', (_request, response) => response.set('Cache-Control', 'no-cache').json(publicSiteConfig(repository)));
  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
  app.get('/api/cv/pdf', async (request, response) => {
    const locale = localeSchema.safeParse(request.query.lang ?? 'fr');
    if (!locale.success) { response.status(400).json({ error: 'INVALID_LOCALE' }); return; }
    const cv = repository.read(locale.data);
    if (!cv) { response.status(404).json({ error: 'CV_NOT_FOUND' }); return; }
    const { contactEmail } = publicSiteConfig(repository);
    const snapshot = JSON.stringify({ cv, contactEmail, portrait: findPortrait()?.version ?? null });
    let cached = pdfCache.get(locale.data);
    if (!cached || cached.snapshot !== snapshot) {
      const pdf = generateCvPdf(cv, { contactEmail });
      cached = { snapshot, pdf };
      pdfCache.set(locale.data, cached);
      void pdf.catch(() => { if (pdfCache.get(locale.data)?.pdf === pdf) pdfCache.delete(locale.data); });
    }
    const pdf = await cached.pdf;
    response.set('Cache-Control', 'no-store').attachment(pdfFilename(locale.data)).type('application/pdf').send(pdf);
  });
  app.get('/api/cv', (request, response) => {
    const locale = localeSchema.safeParse(request.query.lang ?? 'fr');
    if (!locale.success) { response.status(400).json({ error: 'INVALID_LOCALE' }); return; }
    const cv = repository.read(locale.data);
    if (!cv) { response.status(404).json({ error: 'CV_NOT_FOUND' }); return; }
    response.set('Cache-Control', 'no-cache').json(cv);
  });
  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof AdminError) {
      if (error.status === 429) response.set('Retry-After', '900');
      response.status(error.status).json({ error: error.code }); return;
    }
    if (error instanceof ZodError) { response.status(400).json({ error: 'INVALID_INPUT', fields: error.issues.map(issue => issue.path.join('.')) }); return; }
    if (error && typeof error === 'object' && 'type' in error) {
      if (error.type === 'entity.too.large') { response.status(413).json({ error: 'PAYLOAD_TOO_LARGE' }); return; }
      if (error.type === 'entity.parse.failed') { response.status(400).json({ error: 'INVALID_JSON' }); return; }
    }
    response.status(500).json({ error: 'INTERNAL_ERROR' });
  });
  return app;
}
