import { watch } from 'vue';
import { createI18n } from 'vue-i18n';
import fr from './locales/fr';
import en from './locales/en';

export const supportedLocales = ['fr', 'en'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const i18n = createI18n<[typeof fr], SupportedLocale, false>({
  legacy: false,
  globalInjection: false,
  locale: 'fr',
  fallbackLocale: 'fr',
  messages: { fr, en },
});

export function setLocale(locale: SupportedLocale): void {
  i18n.global.locale.value = locale;
}

watch(i18n.global.locale, (locale) => {
  document.documentElement.lang = locale;
  document.title = i18n.global.t('app.title');
}, { immediate: true });
