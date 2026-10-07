import type { Locale, PublicCv } from '@portfolio/contracts';

export async function fetchCv(locale: Locale, signal: AbortSignal): Promise<PublicCv> {
  const response = await fetch(`/api/cv?lang=${locale}`, { signal });
  if (!response.ok) throw new Error('Unable to load CV');
  return response.json() as Promise<PublicCv>;
}
