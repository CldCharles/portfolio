import type { PublicSiteConfig } from '@portfolio/contracts';
import type { CvRepository } from './cv/repository.js';

export function publicSiteConfig(repository: CvRepository, env: NodeJS.ProcessEnv = process.env): PublicSiteConfig {
  // Adresse explicitement autorisée par le propriétaire pour le contact public.
  const contactEmail = (env.PUBLIC_CONTACT_EMAIL ?? 'claudecharles94@gmail.com').trim() || null;
  if (contactEmail && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(contactEmail)) throw new Error('PUBLIC_CONTACT_EMAIL doit être une adresse email valide.');
  const raw = env.SITE_URL ?? (env.NODE_ENV === 'production' ? env.PUBLIC_ORIGIN : undefined);
  let publicOrigin: string | null = null;
  if (raw) {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.origin !== raw || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('SITE_URL doit être une origine publique HTTPS exacte.');
    publicOrigin = url.origin;
  }
  return {
    editorName: repository.read('fr')?.profile.name ?? 'Claude Charles Valentin', contactEmail, publicOrigin,
    hostName: env.PUBLIC_HOST_NAME?.trim() || null, hostCountry: env.PUBLIC_HOST_COUNTRY?.trim() || null,
    hostLogRetention: env.PUBLIC_HOST_LOG_RETENTION?.trim() || null,
  };
}
