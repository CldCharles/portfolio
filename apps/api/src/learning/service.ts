import type Database from 'better-sqlite3';
import { z } from 'zod';
import type { LearningProgress, LearningSessionProgress } from '@portfolio/contracts';
import { webUrl } from '../cv/schema.js';

// Ids of the static programme (26 weeks × 6 sessions), kept in the web app.
export const sessionIdSchema = z.string().regex(/^w(?:0[1-9]|1\d|2[0-6])-d[1-6]$/);
const notes = z.string().max(5000);
export const learningInputSchema = z.object({
  status: z.enum(['todo', 'done', 'skipped']),
  understood: notes, unclear: notes,
  link: z.string().trim().max(500).transform(value => value || null).pipe(webUrl.nullable()).nullable(),
}).strict();
interface Row { session_id: string; status: LearningSessionProgress['status']; done_at: string | null; understood: string; unclear: string; link: string | null }
const toProgress = (row: Row): LearningSessionProgress => ({ status: row.status, doneAt: row.done_at, understood: row.understood, unclear: row.unclear, link: row.link });

export function createLearningService(db: Database.Database, now = Date.now) {
  function read(id: string) { return db.prepare('SELECT * FROM learning_progress WHERE session_id=?').get(id) as Row | undefined; }
  function list(): LearningProgress {
    const rows = db.prepare('SELECT * FROM learning_progress ORDER BY session_id').all() as Row[];
    return { sessions: Object.fromEntries(rows.map(row => [row.session_id, toProgress(row)])) };
  }
  function save(id: string, input: unknown): LearningSessionProgress {
    const sessionId = sessionIdSchema.parse(id);
    const value = learningInputSchema.parse(input);
    return db.transaction(() => {
      const previous = read(sessionId);
      // Keep the first completion date when notes are edited afterwards.
      const doneAt = value.status === 'done' ? previous?.status === 'done' && previous.done_at ? previous.done_at : new Date(now()).toISOString() : null;
      const progress = { ...value, doneAt };
      if (value.status === 'todo' && !value.understood.trim() && !value.unclear.trim() && !value.link) {
        db.prepare('DELETE FROM learning_progress WHERE session_id=?').run(sessionId);
      } else {
        db.prepare(`INSERT INTO learning_progress (session_id,status,done_at,understood,unclear,link,updated_at) VALUES (?,?,?,?,?,?,?)
          ON CONFLICT(session_id) DO UPDATE SET status=excluded.status,done_at=excluded.done_at,understood=excluded.understood,unclear=excluded.unclear,link=excluded.link,updated_at=excluded.updated_at`)
          .run(sessionId, value.status, doneAt, value.understood, value.unclear, value.link, now());
      }
      return progress;
    })();
  }
  return { list, save };
}
export type LearningService = ReturnType<typeof createLearningService>;
