// Scoping workshop data. It only lives in the visitor's browser: nothing is sent to the server.
export const priorities = ['must', 'should', 'could', 'wont'] as const;
export type Priority = typeof priorities[number];
export const openItemKinds = ['question', 'risk', 'assumption'] as const;
export type OpenItemKind = typeof openItemKinds[number];

export interface Persona { id: string; name: string; needs: string }
export interface Goal { id: string; goal: string; indicator: string; target: string }
export interface Story { id: string; personaId: string; want: string; benefit: string; priority: Priority }
export interface OpenItem { id: string; kind: OpenItemKind; text: string }
export interface Scoping {
  title: string;
  situation: string;
  cost: string;
  personas: Persona[];
  goals: Goal[];
  inScope: string;
  outOfScope: string;
  constraints: string;
  stories: Story[];
  openItems: OpenItem[];
}

export const MAX_ITEMS = 30;
export const MAX_TEXT = 2000;
export const STORAGE_KEY = 'portfolio.scoping';

let counter = 0;
export const newId = () => `${Date.now().toString(36)}-${(counter++).toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function emptyScoping(): Scoping {
  return { title: '', situation: '', cost: '', personas: [], goals: [], inScope: '', outOfScope: '', constraints: '', stories: [], openItems: [] };
}

/** Non-empty lines of a multi-line field, used for scope lists. */
export const lines = (value: string) => value.split('\n').map(line => line.trim()).filter(Boolean);

const text = (value: unknown) => typeof value === 'string' ? value.slice(0, MAX_TEXT) : '';
const id = (value: unknown) => typeof value === 'string' && /^[\w-]{1,64}$/.test(value) ? value : newId();
const list = <T>(value: unknown, map: (item: Record<string, unknown>) => T): T[] =>
  Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null).slice(0, MAX_ITEMS).map(map) : [];

/** Rebuilds a scoping from untrusted stored JSON: unknown keys are dropped, sizes are capped. */
export function parseScoping(value: unknown): Scoping | null {
  if (typeof value !== 'object' || value === null) return null;
  const data = value as Record<string, unknown>;
  const personas = list(data.personas, item => ({ id: id(item.id), name: text(item.name), needs: text(item.needs) }));
  const known = new Set(personas.map(persona => persona.id));
  return {
    title: text(data.title),
    situation: text(data.situation),
    cost: text(data.cost),
    personas,
    goals: list(data.goals, item => ({ id: id(item.id), goal: text(item.goal), indicator: text(item.indicator), target: text(item.target) })),
    inScope: text(data.inScope),
    outOfScope: text(data.outOfScope),
    constraints: text(data.constraints),
    stories: list(data.stories, item => ({
      id: id(item.id),
      personaId: typeof item.personaId === 'string' && known.has(item.personaId) ? item.personaId : '',
      want: text(item.want),
      benefit: text(item.benefit),
      priority: priorities.includes(item.priority as Priority) ? item.priority as Priority : 'should',
    })),
    openItems: list(data.openItems, item => ({ id: id(item.id), kind: openItemKinds.includes(item.kind as OpenItemKind) ? item.kind as OpenItemKind : 'question', text: text(item.text) })),
  };
}

export function isEmpty(scoping: Scoping) {
  return !scoping.title.trim() && !scoping.situation.trim() && !scoping.cost.trim() && !scoping.personas.length && !scoping.goals.length
    && !scoping.inScope.trim() && !scoping.outOfScope.trim() && !scoping.constraints.trim() && !scoping.stories.length && !scoping.openItems.length;
}
