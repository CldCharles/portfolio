import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createPinia } from 'pinia';
import type { PublicBootstrap } from '@portfolio/contracts';
import App from './App.vue';
import { createPortfolioRouter } from './app/router';
import { createPortfolioI18n } from './i18n';
import { useCvStore } from './features/cv/stores/cv';
import { siteConfigKey } from './features/legal/config';
import { htmlDocument } from './server/document';
export { discoveryFile } from './server/document';

export async function renderPage(template: string, path: string, bootstrap: PublicBootstrap) {
  const pinia = createPinia();
  const i18n = createPortfolioI18n(bootstrap.locale);
  const router = createPortfolioRouter(pinia, true);
  const app = createSSRApp(App).use(pinia).use(i18n).use(router);
  app.provide(siteConfigKey, bootstrap.site);
  useCvStore(pinia).cv = bootstrap.cv;
  const page = path === '/privacy' ? 'legal' : path === '/cadrage' ? 'scoping' : null;
  const title = page ? i18n.global.t(`${page}.title`) : `${bootstrap.cv?.profile.name ?? bootstrap.site.editorName} — ${bootstrap.cv?.profile.text.title ?? 'Portfolio'}`;
  const description = page ? i18n.global.t(`${page}.description`) : bootstrap.cv?.profile.text.description ?? i18n.global.t('app.description');
  let html = '';
  const context: { modules?: Set<string> } = {};
  if (!path.startsWith('/admin')) {
    await router.push(`${path}?lang=${bootstrap.locale}`);
    await router.isReady();
    html = await renderToString(app, context);
  }
  return { html: htmlDocument(template, path, bootstrap, html, title, description), modules: [...(context.modules ?? [])] };
}
