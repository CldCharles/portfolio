import test from 'node:test';
import assert from 'node:assert/strict';
import type { LearningProgress, LearningStatus } from '@portfolio/contracts';
import { program } from '../src/features/learning/program.ts';
import { getAllResources, getCompletion, getCurrentWeek, getHours, getNextSession, getOverdue, getPhaseCompletion, getStreak, getTodaySession, getWeekCompletion, isWorkSession, localDate } from '../src/features/learning/lib/progress.ts';

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

test('the session of the day follows the local calendar date', () => {
  assert.equal(localDate(new Date(2026, 9, 12, 0, 30)), '2026-10-12');
  assert.equal(localDate(new Date(2026, 9, 12, 23, 59)), '2026-10-12');
  assert.equal(getTodaySession(program, '2026-10-12')?.id, 'w01-d1');
  assert.equal(getTodaySession(program, '2026-10-17')?.type, 'projet');
  assert.equal(getTodaySession(program, '2026-10-18'), null, 'Sunday');
  assert.equal(getNextSession(program, '2026-10-18')?.id, 'w02-d1');
  assert.equal(getTodaySession(program, '2026-10-11'), null, 'before the start');
  assert.equal(getNextSession(program, '2026-10-11')?.id, 'w01-d1');
  assert.equal(getTodaySession(program, '2027-04-11'), null, 'after the end');
  assert.equal(getNextSession(program, '2027-04-10'), null);
  assert.equal(getNextSession(program, '2026-12-23')?.id, 'w11-d6', 'rest days are not sessions to do');
  assert.equal(getCurrentWeek(program, '2026-10-01').week, 1);
  assert.equal(getCurrentWeek(program, '2026-10-18').week, 2);
  assert.equal(getCurrentWeek(program, '2027-05-01').week, 26);
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

test('the streak ignores Sundays and rest days, and breaks on a gap or a skipped session', () => {
  assert.equal(getStreak(program, progress({}), '2026-10-01'), 0);
  assert.equal(getStreak(program, allDone('2026-10-14'), '2026-10-14'), 3);
  assert.equal(getStreak(program, allDone('2026-10-13'), '2026-10-14'), 2, 'today still to do');
  assert.equal(getStreak(program, allDone('2026-10-24'), '2026-10-25'), 12, 'Sunday in the middle');
  assert.equal(getStreak(program, allDone('2026-10-24'), '2026-10-26'), 12, 'Monday not yet done');
  assert.equal(getStreak(program, allDone('2026-10-24', ['w02-d3']), '2026-10-24'), 3, 'gap');
  const skipped = allDone('2026-10-24');
  skipped.sessions['w02-d3']!.status = 'skipped';
  assert.equal(getStreak(program, skipped, '2026-10-24'), 3, 'skipped');
  const skippedToday = allDone('2026-10-23');
  skippedToday.sessions['w02-d6'] = { ...skippedToday.sessions['w02-d5']!, status: 'skipped' };
  assert.equal(getStreak(program, skippedToday, '2026-10-24'), 0);
  // Christmas week: 24 and 25 December are rest days; 1 January too.
  const christmas = allDone('2027-01-02');
  assert.equal(getStreak(program, christmas, '2026-12-26'), 64);
  assert.equal(getStreak(program, christmas, '2027-01-02'), 69);
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
