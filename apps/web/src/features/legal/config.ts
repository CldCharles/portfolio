import { inject, type InjectionKey } from 'vue';
import type { PublicBootstrap, PublicSiteConfig } from '@portfolio/contracts';

export const siteConfigKey: InjectionKey<PublicSiteConfig> = Symbol('public-site');
export const emptySiteConfig: PublicSiteConfig = { editorName: 'Claude Charles Valentin', contactEmail: null, hostName: null, hostCountry: null, hostLogRetention: null, publicOrigin: null };
export function readBootstrap(): PublicBootstrap | null {
  if (typeof document === 'undefined') return null;
  const text = document.getElementById('portfolio-bootstrap')?.textContent;
  return text ? JSON.parse(text) as PublicBootstrap : null;
}
export function useSiteConfig() { return inject(siteConfigKey, emptySiteConfig); }
