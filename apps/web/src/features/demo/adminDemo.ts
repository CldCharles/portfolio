import type { AdminDraft, AdminSession, LearningProgress, LearningSessionInput, Locale, PublicCv } from '@portfolio/contracts';
import { AdminApiError } from '../auth/errors';
import { draftFromPublicCv, previewDraft } from './draftFromPublicCv';

// Demo of the admin area for visitors, without an account. Every admin request is answered here,
// in the browser: the editor works on a copy of the public CV kept in this tab (sessionStorage).
// Nothing is ever sent to the admin API, so a visitor cannot change the real site.

const FLAG = 'portfolio.admin-demo';
const STATE = 'portfolio.admin-demo-state';

interface DemoState {
  draft: AdminDraft;
  learning: LearningProgress;
}

const session: AdminSession = { configured: true, authenticated: true, username: 'Invité', csrfToken: 'demo' };

function storage(): Storage | null {
  try { return typeof sessionStorage === 'undefined' ? null : sessionStorage; } catch { return null; }
}

export function isAdminDemo(): boolean {
  return storage()?.getItem(FLAG) === '1';
}

export function enterAdminDemo() {
  storage()?.setItem(FLAG, '1');
}

export function leaveAdminDemo() {
  storage()?.removeItem(FLAG);
  storage()?.removeItem(STATE);
}

async function readState(): Promise<DemoState> {
  const saved = storage()?.getItem(STATE);
  if (saved) return JSON.parse(saved) as DemoState;
  const cvs = await Promise.all((['fr', 'en', 'ko'] as const).map(async locale => {
    const response = await fetch(`/api/cv?lang=${locale}`);
    if (!response.ok) throw new AdminApiError('UNKNOWN', response.status);
    return [locale, await response.json() as PublicCv] as const;
  }));
  const state: DemoState = {
    draft: { revision: 1, publishedRevision: 1, document: draftFromPublicCv(Object.fromEntries(cvs) as Record<Locale, PublicCv>) },
    learning: { sessions: {} },
  };
  writeState(state);
  return state;
}

function writeState(state: DemoState) {
  storage()?.setItem(STATE, JSON.stringify(state));
}

function checkRevision(state: DemoState, revision: unknown) {
  if (revision !== state.draft.revision) throw new AdminApiError('DRAFT_CONFLICT', 409);
}

/** Answers an admin request as the server would, for the demo. */
export async function demoAdminRequest<T>(path: string, method: string, body?: unknown): Promise<T> {
  // Through JSON both ways, like a real request over the network: the editor can change what it
  // received without touching the demo state (and Vue's reactive objects become plain data).
  return overTheNetwork(await answer(path, method, overTheNetwork(body))) as T;
}

const overTheNetwork = (value: unknown) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));

async function answer(path: string, method: string, body?: unknown): Promise<unknown> {
  const [route, query = ''] = path.split('?');
  const input = (body ?? {}) as Record<string, unknown>;

  if (route === '/session' || route === '/login') return session;
  if (route === '/logout') { leaveAdminDemo(); return { configured: true, authenticated: false }; }
  // AI translation calls a paid API: it stays reserved to the owner.
  if (route === '/translation' && method === 'GET') return { available: false, remainingToday: 0 };

  const state = await readState();
  if (route === '/draft' && method === 'GET') return state.draft;
  if (route === '/draft' && method === 'PUT') {
    checkRevision(state, input.revision);
    state.draft = { ...state.draft, revision: state.draft.revision + 1, document: input.document as AdminDraft['document'] };
    writeState(state);
    return state.draft;
  }
  if (route === '/preview') {
    const params = new URLSearchParams(query);
    checkRevision(state, Number(params.get('revision')));
    return previewDraft(state.draft.document, (params.get('lang') ?? 'fr') as Locale);
  }
  if (route === '/publish') {
    // "Published" in this tab only: the public site does not change.
    checkRevision(state, input.revision);
    state.draft = { ...state.draft, revision: state.draft.revision + 1, publishedRevision: state.draft.revision + 1 };
    writeState(state);
    return state.draft;
  }
  if (route === '/learning' && method === 'GET') return state.learning;
  if (route?.startsWith('/learning/') && method === 'PUT') {
    // Same rules as the server (apps/api/src/learning/service.ts): the first completion date is
    // kept, and a session back to "to do" with no notes is removed.
    const id = route.slice('/learning/'.length);
    const change = input as unknown as LearningSessionInput;
    const previous = state.learning.sessions[id];
    const doneAt = change.status === 'done' ? (previous?.status === 'done' && previous.doneAt) || new Date().toISOString() : null;
    const saved = { ...change, doneAt };
    if (change.status === 'todo' && !change.understood.trim() && !change.unclear.trim() && !change.link) delete state.learning.sessions[id];
    else state.learning.sessions[id] = saved;
    writeState(state);
    return saved;
  }
  throw new AdminApiError('NOT_FOUND', 404);
}
