import { lines, type Scoping } from './model';

// Coherence checks an analyst would run when reviewing a scoping note.
// Each check returns an i18n key under scoping.checks plus its parameters.
export interface Check { level: 'ok' | 'warning'; key: string; params?: Record<string, string | number>; plural?: number; step: number; id?: string }

// Words that describe a solution rather than a problem, in the three site languages.
const solutionWords = /\b(appli(cation)?s?|apps?|site (web|internet)|websites?|logiciels?|software|plateformes?|platforms?|outils?|tools?|dashboards?|chatbots?)\b|앱|어플|애플리케이션|웹사이트|플랫폼|챗봇/iu;
const hasNumber = /\d/;

export function runChecks(scoping: Scoping): Check[] {
  const checks: Check[] = [];
  if (solutionWords.test(scoping.situation)) checks.push({ level: 'warning', key: 'solutionInProblem', step: 1 });
  if (scoping.situation.trim() && !scoping.cost.trim()) checks.push({ level: 'warning', key: 'noCost', step: 1 });

  for (const goal of scoping.goals.filter(goal => goal.goal.trim())) {
    if (!goal.indicator.trim() || !goal.target.trim()) checks.push({ level: 'warning', key: 'goalWithoutIndicator', params: { goal: goal.goal.trim() }, step: 3, id: goal.id });
    else if (!hasNumber.test(goal.target)) checks.push({ level: 'warning', key: 'goalWithoutNumber', params: { goal: goal.goal.trim() }, step: 3, id: goal.id });
  }

  if (scoping.inScope.trim() && !lines(scoping.outOfScope).length) checks.push({ level: 'warning', key: 'noOutOfScope', step: 4 });

  const stories = scoping.stories.filter(story => story.want.trim());
  const must = stories.filter(story => story.priority === 'must').length;
  if (stories.length >= 4) {
    if (must > stories.length / 2) checks.push({ level: 'warning', key: 'tooManyMust', params: { must, total: stories.length }, step: 5 });
    else if (must) checks.push({ level: 'ok', key: 'mustBalanced', params: { must, total: stories.length }, plural: must, step: 5 });
  }
  if (stories.length && !must) checks.push({ level: 'warning', key: 'noMust', step: 5 });
  if (stories.some(story => !story.benefit.trim())) checks.push({ level: 'warning', key: 'storyWithoutBenefit', step: 5 });

  const personas = scoping.personas.filter(persona => persona.name.trim());
  const orphan = personas.filter(persona => !stories.some(story => story.personaId === persona.id));
  if (stories.length) {
    for (const persona of orphan) checks.push({ level: 'warning', key: 'personaWithoutStory', params: { persona: persona.name.trim() }, step: 5, id: persona.id });
    if (personas.length && !orphan.length) checks.push({ level: 'ok', key: 'personasCovered', params: { count: personas.length }, plural: personas.length, step: 5 });
  }
  return checks;
}
