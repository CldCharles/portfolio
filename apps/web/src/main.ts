import { createApp, createSSRApp } from 'vue';
import { router } from '@/app/router';
import { pinia } from '@/app/pinia';
import '@/styles/main.css';
import App from './App.vue';
import { i18n, setLocale, supportedLocales } from './i18n';

import { readBootstrap, siteConfigKey, emptySiteConfig } from '@/features/legal/config';
import { useCvStore } from '@/features/cv/stores/cv';
document.documentElement.classList.add('js-enabled');
const bootstrap = readBootstrap();
if (bootstrap?.cv) useCvStore(pinia).hydrate(bootstrap.cv);
const app = (bootstrap && document.getElementById('app')?.childElementCount ? createSSRApp : createApp)(App);
app.provide(siteConfigKey, bootstrap?.site ?? emptySiteConfig);
app.use(pinia).use(i18n).use(router!);
await router!.isReady();
app.mount('#app');

// Keep server/client HTML identical first, then restore an implicit browser preference.
if (!new URL(window.location.href).searchParams.has('lang')) {
  try {
    const preferred = localStorage.getItem('portfolio.locale');
    if (supportedLocales.includes(preferred as typeof supportedLocales[number]) && preferred !== i18n.global.locale.value) setLocale(preferred as typeof supportedLocales[number]);
  } catch { /* Optional browser preference. */ }
}
