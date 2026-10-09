/**
 * Parses TRUST_PROXY for Express `trust proxy`. Unset or empty: no proxy is trusted,
 * so rate limits use the socket address. A number trusts that many hops; any other
 * value (e.g. "loopback", "10.0.0.1") is passed to Express as an address list.
 */
export function trustProxySetting(value: string | undefined): number | string | false {
  const raw = value?.trim();
  if (!raw) return false;
  if (/^\d+$/.test(raw)) {
    const hops = Number(raw);
    if (hops < 1 || hops > 10) throw new Error('TRUST_PROXY doit être un nombre de proxys entre 1 et 10, ou une liste d’adresses.');
    return hops;
  }
  if (['true', 'false'].includes(raw.toLowerCase())) throw new Error('TRUST_PROXY : indiquer un nombre de proxys ou leurs adresses, pas true/false.');
  return raw;
}
