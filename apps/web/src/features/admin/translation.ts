import { shallowRef } from 'vue';
import { defineStore } from 'pinia';
import type { AiTranslationRequest, AiTranslationResponse, AiTranslationStatus, DraftDocument, TranslationTarget } from '@portfolio/contracts';
import { adminRequest, AdminApiError } from '../auth/api';
import { useAuthStore } from '../auth/store';
import { useEditorStore } from './store';

export const translationTargets: TranslationTarget[] = ['en', 'ko'];

/** Sections whose translation into `target` does not exist yet and whose French title is filled in. */
export function missingTranslations(document: DraftDocument) {
  return document.items.flatMap(item => translationTargets
    .filter(target => item.translations[target] === null && item.translations.fr.text.title.trim())
    .map(target => ({ itemId: item.id, target })));
}

/**
 * AI translation in the editor. Claude is only called through our API (the key stays on the server).
 * A proposal lands in the draft as an unreviewed translation: it is never public until approved,
 * saved and published, like a translation typed by hand.
 */
export const useTranslationStore = defineStore('aiTranslation', () => {
  const auth = useAuthStore();
  const editor = useEditorStore();
  const status = shallowRef<AiTranslationStatus>({ available: false, remainingToday: 0 });
  const busy = shallowRef(false);

  async function refreshStatus() {
    try { status.value = await adminRequest<AiTranslationStatus>('/translation'); }
    catch { status.value = { available: false, remainingToday: 0 }; }
  }

  /** Asks for a translation of the section's current French text and stores it as a draft. */
  async function propose(itemId: string, target: TranslationTarget) {
    const source = findItem(itemId)?.translations.fr.text;
    if (!source) return;
    const request: AiTranslationRequest = { source: { ...source }, target };
    try {
      const { text } = await adminRequest<AiTranslationResponse>('/translation', 'POST', request, auth.session?.csrfToken);
      // Looked up again by id: the section may have moved, or the editor may show another one meanwhile.
      const item = findItem(itemId);
      if (item) item.translations[target] = { text, reviewedSource: null };
    } catch (error) {
      if (error instanceof AdminApiError && (error.status === 401 || error.code === 'CSRF_REJECTED')) auth.expire();
      throw error;
    }
  }

  /** Runs one or more proposals one after the other, so a failure stops the batch early. */
  async function run(jobs: { itemId: string; target: TranslationTarget }[], onProgress?: (done: number) => void) {
    if (busy.value) return;
    busy.value = true;
    try {
      for (const [index, job] of jobs.entries()) {
        await propose(job.itemId, job.target);
        onProgress?.(index + 1);
      }
    } finally {
      busy.value = false;
      void refreshStatus();
    }
  }

  function findItem(itemId: string) { return editor.document?.items.find(item => item.id === itemId); }

  return { status, busy, refreshStatus, run };
});

/** Error code from a failed request, for the admin.errors messages. */
export const errorCode = (error: unknown) => error instanceof AdminApiError ? error.code : 'UNKNOWN';
