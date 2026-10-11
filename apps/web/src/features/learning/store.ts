import { ref, shallowRef } from 'vue';
import { defineStore } from 'pinia';
import type { LearningProgress, LearningSessionInput, LearningSessionProgress } from '@portfolio/contracts';
import { adminRequest, AdminApiError } from '../auth/api';
import { useAuthStore } from '../auth/store';
import { localDate } from './lib/progress';

const blank: LearningSessionProgress = { status: 'todo', doneAt: null, understood: '', unclear: '', link: null };

// Progress lives in the admin database (private): the page is only reachable with an admin session.
export const useLearningStore = defineStore('learning', () => {
  const progress = ref<LearningProgress | null>(null);
  const loading = shallowRef(false);
  const saving = ref(new Set<string>());
  /** Loading error only; each session card shows its own save errors. */
  const error = shallowRef('');
  /** Browser-local date, refreshed when the page comes back to the foreground (a tab left open overnight). */
  const today = shallowRef(localDate());
  const auth = useAuthStore();

  function errorCode(reason: unknown) {
    if (reason instanceof AdminApiError && (reason.status === 401 || reason.code === 'CSRF_REJECTED')) auth.expire();
    return reason instanceof AdminApiError ? reason.code : 'UNKNOWN';
  }
  async function load() {
    if (loading.value) return;
    loading.value = true; error.value = '';
    try { progress.value = await adminRequest<LearningProgress>('/learning'); }
    catch (reason) { error.value = errorCode(reason); }
    finally { loading.value = false; }
  }
  const entry = (id: string) => progress.value?.sessions[id] ?? blank;
  /** Saves one session; resolves to null once the server has accepted it, otherwise to an error code. */
  async function save(id: string, change: Partial<LearningSessionInput>): Promise<string | null> {
    if (!progress.value || saving.value.has(id)) return 'BUSY';
    const current = entry(id);
    const input: LearningSessionInput = { status: current.status, understood: current.understood, unclear: current.unclear, link: current.link, ...change };
    saving.value.add(id);
    try {
      const saved = await adminRequest<LearningSessionProgress>(`/learning/${id}`, 'PUT', input, auth.session?.csrfToken);
      progress.value.sessions[id] = saved;
      return null;
    } catch (reason) { return errorCode(reason); }
    finally { saving.value.delete(id); }
  }
  function refreshToday() { today.value = localDate(); }
  function clear() { progress.value = null; error.value = ''; }
  return { progress, loading, saving, error, today, load, entry, save, refreshToday, clear };
});
