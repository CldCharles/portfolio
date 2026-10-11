import data from './program.json';

// Static 26-week programme, copied as is from the learning tracker spec. Never edited by the interface.
export type SessionType = 'lecon' | 'projet' | 'revision' | 'bilan' | 'repos';
export interface Resource { label: string; url?: string }
export interface Session {
  id: string;
  /** Local calendar date (YYYY-MM-DD), compared with the browser's date, never UTC. */
  date: string;
  weekday: 'Lun' | 'Mar' | 'Mer' | 'Jeu' | 'Ven' | 'Sam';
  type: SessionType;
  objective: string;
  exercise?: string;
  resources: Resource[];
  durationMin: number;
}
export interface Week { week: number; phase: number; title: string; start: string; end: string; sessions: Session[] }
export interface Phase { id: number; title: string; weeks: [number, number]; goal: string; aiRule: string }
export interface Milestone { id: string; phase: number; title: string }
export interface LibraryItem { title: string; url?: string; phases: number[]; note: string }
export interface Program {
  version: number; title: string; start: string; end: string;
  rhythm: { minutesPerDay: number; days: string[]; restDay: string };
  sessionTemplate: { minutes: number; step: string }[];
  phases: Phase[]; milestones: Milestone[]; library: LibraryItem[]; weeks: Week[];
}

export const program = data as Program;
