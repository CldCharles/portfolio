import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Name of the systemd credential holding the Anthropic API key (see deploy/portfolio.service). */
export const API_KEY_CREDENTIAL = 'anthropic-api-key';

/**
 * Reads the Anthropic API key, or returns null when none is configured (the feature is then off).
 *
 * - Production: only from the systemd credential. systemd copies the root-only file into a private
 *   directory for this service (CREDENTIALS_DIRECTORY), so the key is never in an environment file,
 *   in the repository or in the process environment.
 * - Development: ANTHROPIC_API_KEY, for local testing.
 *
 * The key is never logged nor returned by any route.
 */
export function readAnthropicApiKey(env: NodeJS.ProcessEnv = process.env): string | null {
  const key = env.NODE_ENV === 'production' ? readCredential(env.CREDENTIALS_DIRECTORY) : env.ANTHROPIC_API_KEY;
  return key?.trim() || null;
}

function readCredential(directory: string | undefined): string | null {
  if (!directory) return null;
  try { return readFileSync(join(directory, API_KEY_CREDENTIAL), 'utf8'); }
  catch { return null; }
}
