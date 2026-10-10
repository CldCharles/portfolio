import type { Check } from './checks';
import { toMarkdown } from './markdown';
import type { Scoping } from './model';

type Translate = (key: string, named?: Record<string, unknown>, plural?: number) => string;

export const PROMPT_TASK_COUNT = 6;

/**
 * Prompt the visitor pastes into the AI assistant of their choice: analyst instructions,
 * the points the workshop already flagged, then the note itself. Nothing is sent from the site.
 */
export function buildAiPrompt(scoping: Scoping, checks: Check[], t: Translate, locale: string): string {
  const tasks = Array.from({ length: PROMPT_TASK_COUNT }, (_, index) => `${index + 1}. ${t(`scoping.ai.prompt.tasks.${index}`)}`);
  const warnings = checks.filter(check => check.level === 'warning').map(check => `- ${t(`scoping.checks.${check.key}`, check.params ?? {}, check.plural ?? 1)}`);
  return [
    t('scoping.ai.prompt.role'),
    '',
    ...tasks,
    '',
    t('scoping.ai.prompt.rules'),
    ...(warnings.length ? ['', t('scoping.ai.prompt.flagged'), ...warnings] : []),
    '',
    `--- ${t('scoping.note.eyebrow')} ---`,
    '',
    toMarkdown(scoping, t, locale).trim(),
    '',
  ].join('\n');
}
