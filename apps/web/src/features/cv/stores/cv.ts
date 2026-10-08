import { shallowRef } from 'vue';
import { defineStore } from 'pinia';
import { fetchCv } from '../api';
import type { Locale, PublicCv } from '@portfolio/contracts';

export const useCvStore = defineStore('cv', () => {
  const cv = shallowRef<PublicCv | null>(null);
  const loading = shallowRef(false);
  const failed = shallowRef(false);
  let hydratedLocale: Locale | undefined;
  function hydrate(snapshot: PublicCv) { cv.value = snapshot; hydratedLocale = snapshot.locale; }
  function consumeHydration(locale: Locale) {
    const matches = hydratedLocale === locale;
    hydratedLocale = undefined;
    return matches;
  }
  let controller: AbortController | undefined;
  async function load(locale: Locale) {
    controller?.abort();
    const request = new AbortController();
    controller = request;
    cv.value = null;
    loading.value = true;
    failed.value = false;
    try {
      const data = await fetchCv(locale, request.signal);
      if (!request.signal.aborted) cv.value = data;
    } catch {
      if (!request.signal.aborted) failed.value = true;
    } finally {
      if (!request.signal.aborted) loading.value = false;
    }
  }
  function cancel() { controller?.abort(); }
  return { cv, loading, failed, load, cancel, hydrate, consumeHydration };
});
