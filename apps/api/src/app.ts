import express from 'express';
import type { CvRepository } from './cv/repository.js';
import { localeSchema } from './cv/schema.js';

export function createApp(repository: CvRepository) {
  const app = express();
  app.disable('x-powered-by');
  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
  app.get('/api/cv', (request, response) => {
    const locale = localeSchema.safeParse(request.query.lang ?? 'fr');
    if (!locale.success) { response.status(400).json({ error: 'INVALID_LOCALE' }); return; }
    const cv = repository.read(locale.data);
    if (!cv) { response.status(404).json({ error: 'CV_NOT_FOUND' }); return; }
    response.set('Cache-Control', 'no-cache').json(cv);
  });
  app.use((_error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    response.status(500).json({ error: 'INTERNAL_ERROR' });
  });
  return app;
}
