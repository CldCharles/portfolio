import type { Locale, PublicCv, PublicSiteConfig } from '@portfolio/contracts';
import { pageMetadata } from '@/server/document';

export function updateMetadata(path: string, locale: Locale, site: PublicSiteConfig, cv: PublicCv | null, title: string, description: string) {
  document.title = title;
  const selectors = 'meta[name="description"], meta[name="robots"], meta[property^="og:"], link[rel="canonical"], link[rel="alternate"][hreflang], script[type="application/ld+json"]';
  document.head.querySelectorAll(selectors).forEach(element => element.remove());
  const template = document.createElement('template');
  // All text and URLs are escaped by pageMetadata; JSON never becomes executable script.
  template.innerHTML = pageMetadata(path, locale, site, cv, title, description);
  document.head.append(template.content);
}
