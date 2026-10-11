import type { LearningProgress, LearningStatus } from '@portfolio/contracts';
import type { Program, Session, Week } from '../program';

// Pure progress rules. `today` is always passed in (YYYY-MM-DD, browser time zone): nothing here reads the clock.

/** Calendar date in the browser's time zone. toISOString() would switch day at 9:00 in Seoul. */
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export const isWorkSession = (session: Session) => session.type !== 'repos';
export const statusOf = (progress: LearningProgress, id: string): LearningStatus => progress.sessions[id]?.status ?? 'todo';
const allSessions = (program: Program) => program.weeks.flatMap(week => week.sessions);
const workSessions = (program: Program) => allSessions(program).filter(isWorkSession);

function completion(sessions: Session[], progress: LearningProgress) {
  const work = sessions.filter(isWorkSession);
  const done = work.filter(session => statusOf(progress, session.id) === 'done').length;
  return { done, total: work.length, percent: work.length ? Math.round((done / work.length) * 100) : 0 };
}

/**
 * Self-paced: lessons can be done in any order, whatever their planned date. The next lesson
 * is the first work session still to do in programme order (skipped ones count as decided).
 */
export function getNextTodo(program: Program, progress: LearningProgress) {
  return workSessions(program).find(session => statusOf(progress, session.id) === 'todo') ?? null;
}
/** The `count` lessons still to do after `afterId`, in programme order. */
export function getUpcomingTodos(program: Program, progress: LearningProgress, afterId: string, count: number) {
  const sessions = workSessions(program);
  const start = sessions.findIndex(session => session.id === afterId) + 1;
  return sessions.slice(start).filter(session => statusOf(progress, session.id) === 'todo').slice(0, count);
}
/** Week of the next lesson to do; the last week once everything is done. */
export function getFocusWeek(program: Program, progress: LearningProgress): Week {
  const next = getNextTodo(program, progress);
  return (next && getWeekOf(program, next.id)) ?? program.weeks.at(-1)!;
}
export function getCompletion(program: Program, progress: LearningProgress) {
  return completion(allSessions(program), progress);
}
export function getPhaseCompletion(program: Program, progress: LearningProgress, phaseId: number) {
  return completion(program.weeks.filter(week => week.phase === phaseId).flatMap(week => week.sessions), progress);
}
export function getWeekCompletion(week: Week, progress: LearningProgress) {
  return completion(week.sessions, progress);
}
export function getOverdue(program: Program, progress: LearningProgress, today: string) {
  return workSessions(program).filter(session => session.date < today && statusOf(progress, session.id) === 'todo');
}
/**
 * Consecutive days with at least one lesson done (by completion date, in the browser's time
 * zone), back from today, or from yesterday while nothing is done yet today. Self-paced:
 * the planned dates do not matter, and Sunday is a day like any other.
 */
export function getStreak(progress: LearningProgress, today: string) {
  const days = new Set(Object.values(progress.sessions).flatMap(entry => entry.status === 'done' && entry.doneAt ? [localDate(new Date(entry.doneAt))] : []));
  const day = new Date(`${today}T12:00:00`);
  if (!days.has(today)) day.setDate(day.getDate() - 1);
  let streak = 0;
  while (days.has(localDate(day))) { streak += 1; day.setDate(day.getDate() - 1); }
  return streak;
}
export function getHours(program: Program, progress: LearningProgress) {
  const minutes = allSessions(program).filter(session => statusOf(progress, session.id) === 'done').reduce((total, session) => total + session.durationMin, 0);
  return minutes / 60;
}
export function getWeekOf(program: Program, sessionId: string) {
  return program.weeks.find(week => week.sessions.some(session => session.id === sessionId)) ?? null;
}

export interface LibraryEntry { title: string; url?: string; note?: string; phases: number[] }
/** Library first, then every session resource, deduplicated by URL (by label for resources without URL). */
export function getAllResources(program: Program): LibraryEntry[] {
  const entries = new Map<string, LibraryEntry>();
  function add(entry: LibraryEntry) {
    const key = entry.url ?? `label:${entry.title}`;
    const existing = entries.get(key);
    if (!existing) { entries.set(key, { ...entry, phases: [...entry.phases] }); return; }
    for (const phase of entry.phases) if (!existing.phases.includes(phase)) existing.phases.push(phase);
  }
  for (const item of program.library) add({ title: item.title, url: item.url, note: item.note, phases: item.phases });
  for (const week of program.weeks) for (const session of week.sessions) for (const resource of session.resources) add({ title: resource.label, url: resource.url, phases: [week.phase] });
  for (const entry of entries.values()) entry.phases.sort((a, b) => a - b);
  return [...entries.values()];
}
