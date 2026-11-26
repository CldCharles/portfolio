import type Database from 'better-sqlite3';
import type { AiTranslationStatus, CvText, TranslationTarget } from '@portfolio/contracts';
import { AdminError } from '../admin/service.js';
import { textSchema } from '../cv/schema.js';
import { TranslatorError, type Translator } from './claude-translator.js';

/** Paid API calls allowed per day (UTC): enough for the whole CV in two languages, twice. */
export const DAILY_LIMIT = 100;

/**
 * Rules around the AI translator, independent of the AI provider:
 * the feature is off without an API key, every call counts against a daily quota,
 * and Claude's answer is validated like any text typed in the editor.
 */
export function createTranslationService(db: Database.Database, translator: Translator | null, now = Date.now) {
  const today = () => new Date(now()).toISOString().slice(0, 10);
  const usedToday = () => (db.prepare('SELECT count FROM ai_translation_usage WHERE day = ?').get(today()) as { count: number } | undefined)?.count ?? 0;

  function status(): AiTranslationStatus {
    return { available: translator !== null, remainingToday: Math.max(0, DAILY_LIMIT - usedToday()) };
  }

  // Counted before the call, failures included: the quota caps spending, not successes.
  function reserveCall() {
    db.transaction(() => {
      db.prepare('DELETE FROM ai_translation_usage WHERE day < ?').run(today());
      if (usedToday() >= DAILY_LIMIT) throw new AdminError(429, 'TRANSLATION_QUOTA');
      db.prepare('INSERT INTO ai_translation_usage (day, count) VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET count = count + 1').run(today());
    })();
  }

  async function translate(source: CvText, target: TranslationTarget): Promise<CvText> {
    if (!translator) throw new AdminError(503, 'TRANSLATION_UNAVAILABLE');
    reserveCall();
    let text: CvText;
    try {
      text = await translator.translate(source, target);
    } catch (error) {
      // Logs the cause only (HTTP status, stop reason), never the CV text or the key.
      console.error(`Traduction IA impossible : ${error instanceof TranslatorError ? error.reason : 'erreur inconnue'}`);
      throw new AdminError(502, 'TRANSLATION_FAILED');
    }
    // The answer goes through the same validation as the editor (lengths, empty title).
    const checked = textSchema.safeParse(text);
    if (!checked.success) throw new AdminError(502, 'TRANSLATION_FAILED');
    return checked.data;
  }

  return { status, translate };
}
export type TranslationService = ReturnType<typeof createTranslationService>;
