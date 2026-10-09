import { computed, ref, shallowRef } from 'vue';
import { defineStore } from 'pinia';
import type { AdminDraft, DraftDocument, EntryKind, Locale, PublicCv } from '@portfolio/contracts';
import { adminRequest, AdminApiError } from '../auth/api';
import { useAuthStore } from '../auth/store';

export const useEditorStore = defineStore('editor', () => {
  const document = ref<DraftDocument | null>(null);
  const revision = shallowRef(0);
  const publishedRevision = shallowRef(0);
  const savedDocument = shallowRef('');
  const busy = shallowRef(false);
  const error = shallowRef('');
  const notice = shallowRef('');
  const preview = shallowRef<PublicCv | null>(null);
  const previewRevision = shallowRef(0);
  const dirty = computed(() => !!document.value && JSON.stringify(document.value) !== savedDocument.value);
  const auth = useAuthStore();
  function receive(value: AdminDraft) {
    document.value = value.document; savedDocument.value = JSON.stringify(value.document);
    revision.value = value.revision; publishedRevision.value = value.publishedRevision;
    preview.value = null; previewRevision.value = 0;
  }
  async function run(action: () => Promise<void>) {
    if (busy.value) return;
    busy.value = true; error.value = ''; notice.value = '';
    try { await action(); }
    catch (reason) {
      error.value = reason instanceof AdminApiError ? reason.code : 'UNKNOWN';
      if (reason instanceof AdminApiError && (reason.status === 401 || reason.code === 'CSRF_REJECTED')) auth.expire();
    } finally { busy.value = false; }
  }
  async function load() { await run(async () => { receive(await adminRequest<AdminDraft>('/draft')); }); }
  async function save() {
    await run(async () => {
      receive(await adminRequest<AdminDraft>('/draft', 'PUT', { revision: revision.value, document: document.value }, auth.session?.csrfToken));
      notice.value = 'saved';
    });
  }
  async function showPreview(locale: Locale) {
    if (dirty.value) return;
    await run(async () => { preview.value = await adminRequest<PublicCv>(`/preview?lang=${locale}&revision=${revision.value}`); previewRevision.value = revision.value; });
  }
  async function publish() {
    if (dirty.value || previewRevision.value !== revision.value) return;
    await run(async () => {
      receive(await adminRequest<AdminDraft>('/publish', 'POST', { revision: revision.value }, auth.session?.csrfToken));
      notice.value = 'published';
    });
  }
  function addEntry(kind: EntryKind) {
    document.value?.items.push({ id: `entry-${crypto.randomUUID()}`, kind, name: '', githubUrl: null, countryCode: null, url: null, tags: [], startDate: null, endDate: null,
      translations: { fr: { text: { title: '', subtitle: '', description: '' }, reviewedSource: null }, en: null, ko: null },
    });
  }
  function clear() { document.value = null; savedDocument.value = ''; revision.value = 0; preview.value = null; error.value = ''; notice.value = ''; }
  return { document, revision, publishedRevision, busy, error, notice, preview, previewRevision, dirty, load, save, showPreview, publish, addEntry, clear };
});
