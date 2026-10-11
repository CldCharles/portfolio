import test from 'node:test';
import assert from 'node:assert/strict';
import type { LearningProgress, LearningStatus } from '@portfolio/contracts';
import { program } from '../src/features/learning/program.ts';
import { getAllResources, getCompletion, getFocusWeek, getHours, getNextTodo, getOverdue, getPhaseCompletion, getStreak, getUpcomingTodos, getWeekCompletion, isWorkSession, localDate } from '../src/features/learning/lib/progress.ts';

const sessions = program.weeks.flatMap(week => week.sessions);
const work = sessions.filter(isWorkSession);
function progress(entries: Record<string, LearningStatus>): LearningProgress {
  return { sessions: Object.fromEntries(Object.entries(entries).map(([id, status]) => [id, { status, doneAt: null, understood: '', unclear: '', link: null }])) };
}
const allDone = (until = '9999-12-31', except: string[] = []) => progress(Object.fromEntries(work.filter(session => session.date <= until && !except.includes(session.id)).map(session => [session.id, 'done' as const])));

test('the programme has 26 weeks of six Monday-to-Saturday sessions, with unique ids', () => {
  assert.equal(program.weeks.length, 26);
  assert.deepEqual(program.weeks.map(week => week.week), Array.from({ length: 26 }, (_, index) => index + 1));
  assert.equal(new Set(sessions.map(session => session.id)).size, 156);
  assert.equal(work.length, 153);
  const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  let previous: Date | null = null;
  for (const week of program.weeks) {
    assert.equal(week.sessions.length, 6, `week ${week.week}`);
    assert.equal(week.start, week.sessions[0]!.date);
    assert.equal(week.end, week.sessions[5]!.date);
    week.sessions.forEach((session, index) => {
      const date = new Date(`${session.date}T00:00:00Z`);
      assert.equal(session.id, `w${String(week.week).padStart(2, '0')}-d${index + 1}`);
      assert.equal(session.weekday, weekdays[index]);
      assert.equal(date.getUTCDay(), index + 1, `${session.id} is not a ${session.weekday}`);
      // Consecutive days, skipping exactly one Sunday between weeks.
      if (previous) assert.equal((date.getTime() - previous.getTime()) / 86_400_000, index === 0 ? 2 : 1, session.id);
      previous = date;
      assert.equal(session.durationMin, session.type === 'repos' ? 0 : 60);
    });
  }
  assert.equal(sessions[0]!.date, program.start);
  assert.equal(sessions.at(-1)!.date, program.end);
  for (const phase of program.phases) for (let week = phase.weeks[0]; week <= phase.weeks[1]; week += 1) assert.equal(program.weeks[week - 1]!.phase, phase.id);
});

test('dates are local calendar dates', () => {
  assert.equal(localDate(new Date(2026, 9, 12, 0, 30)), '2026-10-12');
  assert.equal(localDate(new Date(2026, 9, 12, 23, 59)), '2026-10-12');
});

test('self-paced: the next lesson is the first still to do in programme order, whatever the date', () => {
  assert.equal(getNextTodo(program, progress({}))?.id, 'w01-d1');
  assert.equal(getNextTodo(program, progress({ 'w01-d1': 'done' }))?.id, 'w01-d2');
  assert.equal(getNextTodo(program, progress({ 'w01-d1': 'done', 'w01-d2': 'skipped' }))?.id, 'w01-d3', 'skipped counts as decided');
  // A lesson done out of order is left out; an earlier one still to do comes first.
  assert.equal(getNextTodo(program, progress({ 'w01-d1': 'done', 'w01-d3': 'done' }))?.id, 'w01-d2');
  assert.deepEqual(getUpcomingTodos(program, progress({ 'w01-d1': 'done', 'w01-d3': 'done' }), 'w01-d2', 3).map(session => session.id), ['w01-d4', 'w01-d5', 'w01-d6']);
  assert.ok(getUpcomingTodos(program, progress({}), 'w11-d3', 5).every(session => session.type !== 'repos'), 'rest days are not lessons');
  assert.equal(getNextTodo(program, allDone()), null);
  assert.equal(getFocusWeek(program, progress({})).week, 1);
  assert.equal(getFocusWeek(program, allDone('2026-10-24')).week, 3);
  assert.equal(getFocusWeek(program, allDone()).week, 26);
});

test('completion counts done work sessions only', () => {
  assert.deepEqual(getCompletion(program, allDone()), { done: 153, total: 153, percent: 100 });
  assert.deepEqual(getCompletion(program, progress({ 'w01-d1': 'done', 'w01-d2': 'skipped' })), { done: 1, total: 153, percent: 1 });
  assert.equal(getHours(program, allDone()), 153);
  assert.deepEqual(getPhaseCompletion(program, allDone('2026-11-07'), 1), { done: 24, total: 24, percent: 100 });
  assert.deepEqual(getWeekCompletion(program.weeks[10]!, allDone()), { done: 4, total: 4, percent: 100 });
});

test('overdue sessions skip rest days, done and skipped sessions, oldest first', () => {
  const overdue = getOverdue(program, progress({ 'w11-d1': 'done', 'w11-d2': 'skipped' }), '2026-12-28');
  assert.equal(overdue[0]!.id, 'w01-d1');
  assert.ok(overdue.every((session, index) => index === 0 || overdue[index - 1]!.date < session.date));
  const ids = overdue.map(session => session.id);
  for (const id of ['w11-d1', 'w11-d2', 'w11-d4', 'w11-d5']) assert.ok(!ids.includes(id), id);
  assert.ok(ids.includes('w11-d3') && ids.includes('w11-d6'));
  assert.ok(!ids.includes('w12-d1'), 'today is not overdue');
  assert.deepEqual(getOverdue(program, progress({}), '2026-10-12'), []);
});

test('the streak counts consecutive days with a lesson done, whatever the lessons planned dates', () => {
  const doneOn = (...days: string[]): LearningProgress => ({ sessions: Object.fromEntries(days.map((day, index) => [work[index]!.id, { status: 'done' as const, doneAt: new Date(`${day}T20:00:00`).toISOString(), understood: '', unclear: '', link: null }])) });
  assert.equal(getStreak(progress({}), '2026-10-12'), 0);
  assert.equal(getStreak(doneOn('2026-10-11'), '2026-10-11'), 1, 'a lesson done before the planned start counts');
  assert.equal(getStreak(doneOn('2026-10-10', '2026-10-11', '2026-10-11'), '2026-10-11'), 2, 'several lessons on one day count once');
  assert.equal(getStreak(doneOn('2026-10-10', '2026-10-11'), '2026-10-12'), 2, 'nothing yet today');
  assert.equal(getStreak(doneOn('2026-10-09', '2026-10-11'), '2026-10-11'), 1, 'a gap breaks it');
  assert.equal(getStreak(doneOn('2026-10-10'), '2026-10-12'), 0, 'nothing yesterday or today');
  const skipped = doneOn('2026-10-11');
  skipped.sessions[work[0]!.id]!.status = 'skipped';
  assert.equal(getStreak(skipped, '2026-10-11'), 0, 'a skipped lesson is not done');
});

test('the resource library merges the reading list and session resources by URL', () => {
  const resources = getAllResources(program);
  const urls = resources.flatMap(resource => resource.url ? [resource.url] : []);
  assert.equal(new Set(urls).size, urls.length);
  const tutorial = resources.filter(resource => resource.url === 'https://react.dev/learn/tutorial-tic-tac-toe');
  assert.equal(tutorial.length, 1);
  assert.equal(resources.find(resource => resource.url === 'https://javascript.info')?.note, program.library[0]!.note);
  assert.deepEqual(resources.find(resource => resource.url === 'https://vite.dev/guide/')?.phases, [1, 3]);
  assert.equal(resources.filter(resource => resource.title === 'Tes notes').length, 1);
  assert.ok(resources.some(resource => !resource.url && resource.title.startsWith('Designing Data-Intensive')));
});
