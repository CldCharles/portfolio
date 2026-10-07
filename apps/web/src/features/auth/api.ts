export class AdminApiError extends Error {
  constructor(public code: string, public status: number) { super(code); }
}
export async function adminRequest<T>(path: string, method = 'GET', body?: unknown, csrfToken?: string): Promise<T> {
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
