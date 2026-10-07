import { Router } from 'express';
import { parseCookie } from 'cookie';
import { z } from 'zod';
import type { AdminService } from './service.js';
import { AdminError } from './service.js';
import { revisionSchema, saveDraftSchema } from './schema.js';
import { localeSchema } from '../cv/schema.js';

export interface AdminOptions { origin: string; secureCookies: boolean }
export function adminOptionsFromEnv(env: NodeJS.ProcessEnv = process.env): AdminOptions {
  const production = env.NODE_ENV === 'production';
  const raw = env.PUBLIC_ORIGIN ?? (production ? '' : 'http://127.0.0.1:5173');
  const url = new URL(raw);
  if (raw !== url.origin || !['http:', 'https:'].includes(url.protocol) || (production && url.protocol !== 'https:')) throw new Error('PUBLIC_ORIGIN doit être une origine exacte, HTTPS en production.');
  return { origin: url.origin, secureCookies: production || url.protocol === 'https:' };
}
export function adminRoutes(admin: AdminService, options: AdminOptions) {
  const router = Router();
  const cookieName = 'portfolio_session';
  const cookieOptions = { httpOnly: true, sameSite: 'strict' as const, secure: options.secureCookies, path: '/api/admin' };
  router.use((request, response, next) => {
    response.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD'].includes(request.method)) {
      if (request.get('origin') !== options.origin || request.get('x-portfolio-request') !== '1') throw new AdminError(403, 'ORIGIN_REJECTED');
      if (!request.is('application/json')) throw new AdminError(415, 'JSON_REQUIRED');
    }
    next();
  });
  router.get('/session', (request, response) => {
    const session = admin.session(parseCookie(request.headers.cookie ?? '')[cookieName]);
    response.json(session ? { authenticated: true, configured: true, ...session } : { authenticated: false, configured: admin.configured() });
  });
  router.post('/login', async (request, response) => {
    const input = z.object({ username: z.string().min(1).max(80), password: z.string().min(1).max(256) }).strict().parse(request.body);
    const result = await admin.login(input.username, input.password, request.ip ?? 'unknown');
    const oldToken = parseCookie(request.headers.cookie ?? '')[cookieName];
    if (oldToken) admin.logout(oldToken);
    response.cookie(cookieName, result.token, { ...cookieOptions, maxAge: result.maxAge });
    response.json({ authenticated: true, configured: true, csrfToken: result.csrfToken, username: result.username });
  });
  router.use((request, _response, next) => {
    const token = parseCookie(request.headers.cookie ?? '')[cookieName];
    const session = admin.session(token);
    if (!session) throw new AdminError(401, 'AUTH_REQUIRED');
    if (!['GET', 'HEAD'].includes(request.method) && request.get('x-csrf-token') !== session.csrfToken) throw new AdminError(403, 'CSRF_REJECTED');
    next();
  });
  router.post('/logout', (request, response) => {
    admin.logout(parseCookie(request.headers.cookie ?? '')[cookieName]!);
    response.clearCookie(cookieName, cookieOptions).status(204).end();
  });
  router.get('/draft', (_request, response) => response.json(admin.draft()));
  router.put('/draft', (request, response) => {
    const input = saveDraftSchema.parse(request.body);
    response.json(admin.save(input.revision, input.document));
  });
  router.get('/preview', (request, response) => {
    const input = z.object({ lang: localeSchema, revision: z.coerce.number().int().min(1) }).strict().parse(request.query);
    response.json(admin.preview(input.lang, input.revision));
  });
  router.post('/publish', (request, response) => {
    const { revision } = revisionSchema.parse(request.body);
    response.json(admin.publish(revision));
  });
  return router;
}
