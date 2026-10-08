import { createHash, randomBytes } from 'node:crypto';
import type Database from 'better-sqlite3';
import type { AdminDraft, Locale } from '@portfolio/contracts';
import type { CvRepository } from '../cv/repository.js';
import { documentSchema } from './schema.js';
import { previewDocument, publishDocument, readPublishedDocument } from './documents.js';
import { hashPassword, verifyPassword } from './password.js';

export class AdminError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}
const digest = (token: string) => createHash('sha256').update(token).digest('hex');
const sessionDuration = 8 * 60 * 60 * 1000;
export function createAdminService(db: Database.Database, repository: CvRepository, now = Date.now) {
  function account() { return db.prepare('SELECT username,password_hash FROM admin_account WHERE id=1').get() as { username: string; password_hash: string } | undefined; }
  async function configure(username: string, password: string, replace = false) {
    if (!/^[a-zA-Z0-9._-]{3,80}$/.test(username)) throw new Error('Identifiant : 3 à 80 lettres, chiffres, points, tirets ou underscores.');
    if (account() && !replace) throw new Error('Un compte existe déjà. Utiliser --reset pour remplacer ses identifiants et révoquer les sessions.');
    const hash = await hashPassword(password);
    db.transaction(() => {
      db.prepare('INSERT INTO admin_account (id,username,password_hash) VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET username=excluded.username,password_hash=excluded.password_hash').run(username, hash);
      db.exec('DELETE FROM admin_sessions; DELETE FROM admin_login_attempts;');
    })();
  }
  function purgeExpired() {
    db.transaction(() => {
      db.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').run(now());
      db.prepare('DELETE FROM admin_login_attempts WHERE expires_at <= ?').run(now());
    })();
  }
  async function login(username: string, password: string, ip: string) {
    const current = account();
    if (!current) throw new AdminError(503, 'ADMIN_NOT_CONFIGURED');
    db.transaction(() => {
      db.prepare('DELETE FROM admin_login_attempts WHERE expires_at <= ?').run(now());
      for (const key of ['global', `ip:${ip}`]) {
        const record = db.prepare('SELECT count FROM admin_login_attempts WHERE key=?').get(key) as { count: number } | undefined;
        if ((record?.count ?? 0) >= (key === 'global' ? 20 : 5)) throw new AdminError(429, 'RATE_LIMITED');
      }
      for (const key of ['global', `ip:${ip}`]) db.prepare('INSERT INTO admin_login_attempts (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(key, now() + 15 * 60 * 1000);
    })();
    const valid = await verifyPassword(password, current.password_hash);
    // A CLI credential reset during scrypt must not create a session with old credentials.
    if (!valid || username !== current.username || account()?.password_hash !== current.password_hash) throw new AdminError(401, 'INVALID_CREDENTIALS');
    const token = randomBytes(32).toString('hex');
    const csrfToken = randomBytes(32).toString('hex');
    db.transaction(() => {
      db.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').run(now());
      db.prepare('DELETE FROM admin_login_attempts WHERE key=?').run(`ip:${ip}`);
      db.prepare('INSERT INTO admin_sessions VALUES (?,?,?)').run(digest(token), csrfToken, now() + sessionDuration);
      db.exec('DELETE FROM admin_sessions WHERE token_hash NOT IN (SELECT token_hash FROM admin_sessions ORDER BY expires_at DESC LIMIT 10)');
    })();
    return { token, csrfToken, username: current.username, maxAge: sessionDuration };
  }
  function session(token: string | undefined) {
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
    db.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').run(now());
    const row = db.prepare('SELECT csrf_token FROM admin_sessions WHERE token_hash=?').get(digest(token)) as { csrf_token: string } | undefined;
    const current = account();
    return row && current ? { csrfToken: row.csrf_token, username: current.username } : null;
  }
  function logout(token: string) { db.prepare('DELETE FROM admin_sessions WHERE token_hash=?').run(digest(token)); }
  function draft(): AdminDraft {
    const row = db.prepare('SELECT revision,published_revision,document FROM admin_draft WHERE id=1').get() as { revision: number; published_revision: number; document: string } | undefined;
    if (row) return { revision: row.revision, publishedRevision: row.published_revision, document: documentSchema.parse(JSON.parse(row.document)) };
    const document = readPublishedDocument(db, repository);
    db.prepare('INSERT INTO admin_draft VALUES (1,1,1,?)').run(JSON.stringify(document));
    return { revision: 1, publishedRevision: 1, document };
  }
  function checkRevision(revision: number) { if (draft().revision !== revision) throw new AdminError(409, 'DRAFT_CONFLICT'); }
  function save(revision: number, input: unknown) {
    const document = documentSchema.parse(input);
    return db.transaction(() => {
      checkRevision(revision);
      db.prepare('UPDATE admin_draft SET revision=revision+1,document=? WHERE id=1').run(JSON.stringify(document));
      return draft();
    })();
  }
  function publish(revision: number) {
    return db.transaction(() => {
      checkRevision(revision);
      publishDocument(db, repository, draft().document);
      db.exec('UPDATE admin_draft SET revision=revision+1,published_revision=revision+1 WHERE id=1');
      return draft();
    })();
  }
  function preview(locale: Locale, revision: number) {
    checkRevision(revision);
    return previewDocument(draft().document, locale);
  }
  return { purgeExpired, configure, configured: () => !!account(), login, session, logout, draft, save, publish, preview };
}
export type AdminService = ReturnType<typeof createAdminService>;
