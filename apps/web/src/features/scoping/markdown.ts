import { lines, priorities, type Scoping, type Story } from './model';

type Translate = (key: string, params?: Record<string, unknown>) => string;

/** One user story as a sentence; French elides « afin de » before a vowel (« afin d’éviter »). */
export function storySentence(story: Story, who: string, t: Translate, locale: string, clean = (value: string) => value.trim()) {
  // « En tant qu’utilisateur », « As an engineer »: the article depends on the first sound of the name.
  const vowel = locale === 'fr' ? frenchVowel.test(who) : locale === 'en' && /^([aeio]|u(?!ni|s|r))/i.test(who);
  const params = { as: t(vowel ? 'scoping.note.asVowel' : 'scoping.note.as'), who, want: clean(story.want), benefit: clean(story.benefit) };
  if (!params.benefit) return t('scoping.note.storyShort', params);
  return t(locale === 'fr' && frenchVowel.test(params.benefit) ? 'scoping.note.storyElided' : 'scoping.note.story', params);
}
const frenchVowel = /^[aeiouyhàâéèêëîïôöùûüœæ]/i;

// Markdown cells and list items: keep one line and escape table separators.
const cell = (value: string) => value.replace(/\s*\n\s*/g, ' ').replace(/\|/g, '\\|').trim();

/** Plain Markdown version of the note, to paste into a ticket, a wiki or an email. */
export function toMarkdown(scoping: Scoping, t: Translate, locale: string): string {
  const out: string[] = [`# ${cell(scoping.title) || t('scoping.note.untitled')}`, ''];
  const section = (title: string) => out.push(`## ${title}`, '');
  const personaName = (id: string) => cell(scoping.personas.find(persona => persona.id === id)?.name ?? '') || t('scoping.note.someone');

  section(t('scoping.steps.problem'));
  if (scoping.situation.trim()) out.push(scoping.situation.trim(), '');
  if (scoping.cost.trim()) out.push(`**${t('scoping.fields.cost')}** ${scoping.cost.trim()}`, '');

  const empty = t('scoping.note.empty');
  const list = (items: string[]) => items.length ? items.map(item => `- ${item}`) : [`_${empty}_`];
  if (!scoping.situation.trim() && !scoping.cost.trim()) out.push(`_${empty}_`, '');

  section(t('scoping.steps.users'));
  const personas = scoping.personas.filter(persona => persona.name.trim() || persona.needs.trim());
  out.push(...list(personas.map(persona => `**${cell(persona.name) || t('scoping.note.someone')}**${persona.needs.trim() ? ` — ${cell(persona.needs)}` : ''}`)), '');

  section(t('scoping.steps.goals'));
  const goals = scoping.goals.filter(goal => goal.goal.trim() || goal.indicator.trim() || goal.target.trim());
  if (goals.length) {
    out.push(`| ${t('scoping.fields.goal')} | ${t('scoping.fields.indicator')} | ${t('scoping.fields.target')} |`, '| --- | --- | --- |');
    for (const goal of goals) out.push(`| ${cell(goal.goal)} | ${cell(goal.indicator)} | ${cell(goal.target)} |`);
  } else out.push(`_${empty}_`);
  out.push('');

  section(t('scoping.steps.scope'));
  out.push(`**${t('scoping.fields.inScope')}**`, '', ...list(lines(scoping.inScope)), '');
  out.push(`**${t('scoping.fields.outOfScope')}**`, '', ...list(lines(scoping.outOfScope)), '');
  if (scoping.constraints.trim()) out.push(`**${t('scoping.fields.constraints')}** ${cell(scoping.constraints)}`, '');

  section(t('scoping.steps.features'));
  if (!scoping.stories.some(story => story.want.trim())) out.push(`_${empty}_`, '');
  for (const priority of priorities) {
    const stories = scoping.stories.filter(story => story.priority === priority && story.want.trim());
    if (!stories.length) continue;
    out.push(`### ${t(`scoping.priority.${priority}`)}`, '');
    for (const story of stories) out.push(`- ${storySentence(story, personaName(story.personaId), t, locale, cell)}`);
    out.push('');
  }

  section(t('scoping.steps.risks'));
  out.push(...list(scoping.openItems.filter(item => item.text.trim()).map(item => `**${t(`scoping.kind.${item.kind}`)}** — ${cell(item.text)}`)));
  return `${out.join('\n').trim()}\n`;
}
