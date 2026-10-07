import { watch } from 'vue';
import { createI18n } from 'vue-i18n';
import type { Locale } from '@portfolio/contracts';
import fr from './locales/fr';
import en from './locales/en';
import ko from './locales/ko';

export const supportedLocales = ['fr', 'en', 'ko'] as const;
export type SupportedLocale = Locale;
export const localeLabels: Record<Locale, string> = { fr: 'Français', en: 'English', ko: '한국어' };
const isLocale = (value: unknown): value is Locale => supportedLocales.includes(value as Locale);
function initialLocale(): Locale {
  const query = new URL(window.location.href).searchParams.get('lang');
  if (isLocale(query)) return query;
  try {
    const stored = localStorage.getItem('portfolio.locale');
    if (isLocale(stored)) return stored;
  } catch { /* Storage can be disabled; URL and in-memory locale still work. */ }
  return 'fr';
}
export const i18n = createI18n<[typeof fr], Locale, false>({
  legacy: false, globalInjection: false, locale: initialLocale(), fallbackLocale: 'fr', messages: { fr, en, ko },
});
export function setLocale(locale: Locale): void {
  i18n.global.locale.value = locale;
  const url = new URL(window.location.href);
  url.searchParams.set('lang', locale);
  window.history.replaceState(null, '', url);
  try { localStorage.setItem('portfolio.locale', locale); } catch { /* Optional preference. */ }
}
watch(i18n.global.locale, locale => {
  document.documentElement.lang = locale;
  document.title = i18n.global.t('app.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', i18n.global.t('app.description'));
}, { immediate: true });
