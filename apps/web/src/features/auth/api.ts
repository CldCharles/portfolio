import { demoAdminRequest, isAdminDemo } from '../demo/adminDemo';
import { AdminApiError } from './errors';

export { AdminApiError };
export async function adminRequest<T>(path: string, method = 'GET', body?: unknown, csrfToken?: string): Promise<T> {
  // Demo for visitors: answered in the browser, never sent to the admin API.
  if (isAdminDemo()) return demoAdminRequest<T>(path, method, body);
  const response = await fetch(`/api/admin${path}`, {
    method, credentials: 'same-origin', cache: 'no-store',
    headers: { ...(method !== 'GET' ? { 'Content-Type': 'application/json', 'X-Portfolio-Request': '1' } : {}), ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new AdminApiError(typeof data.error === 'string' ? data.error : 'UNKNOWN', response.status);
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}
