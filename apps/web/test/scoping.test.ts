import test from 'node:test';
import assert from 'node:assert/strict';
import { createPinia, setActivePinia } from 'pinia';
import { createPortfolioI18n } from '../src/i18n/index.ts';
import { runChecks } from '../src/features/scoping/checks.ts';
import { exampleScoping } from '../src/features/scoping/example.ts';
import { storySentence, toMarkdown } from '../src/features/scoping/markdown.ts';
import { emptyScoping, MAX_ITEMS, MAX_TEXT, parseScoping, STORAGE_KEY } from '../src/features/scoping/model.ts';
import { useScopingStore } from '../src/features/scoping/store.ts';

const warnings = (scoping: ReturnType<typeof emptyScoping>) => runChecks(scoping).filter(check => check.level === 'warning').map(check => check.key);

test('the filled-in example passes every check in all three languages', () => {
  for (const locale of ['fr', 'en', 'ko'] as const) {
    const example = exampleScoping(locale);
    assert.deepEqual(warnings(example), [], locale);
    assert.deepEqual(runChecks(example).map(check => check.key), ['mustBalanced', 'personasCovered']);
  }
});

test('checks flag what an analyst would question', () => {
  const scoping = exampleScoping('fr');
  scoping.situation = 'Nous voulons une appli de réservation.';
  scoping.cost = '';
  scoping.goals.push({ id: 'g', goal: 'Améliorer l’expérience', indicator: '', target: '' }, { id: 'h', goal: 'Satisfaction', indicator: 'Note', target: 'haute' });
  scoping.outOfScope = '  \n ';
  for (const story of scoping.stories) story.priority = 'must';
  scoping.personas.push({ id: 'orphan', name: 'Comptable', needs: '' });
  scoping.stories[0]!.benefit = '';
  const keys = warnings(scoping);
  for (const key of ['solutionInProblem', 'noCost', 'goalWithoutIndicator', 'goalWithoutNumber', 'noOutOfScope', 'tooManyMust', 'storyWithoutBenefit', 'personaWithoutStory']) assert.ok(keys.includes(key), key);
  assert.deepEqual(runChecks(emptyScoping()), []);
});

test('stored data is rebuilt defensively', () => {
  assert.equal(parseScoping(null), null);
  assert.equal(parseScoping('text'), null);
  const parsed = parseScoping({
    title: 'x'.repeat(MAX_TEXT + 50), extra: '<script>',
    personas: [{ id: 'p1', name: 'Patient', needs: 1 }, 'invalid'],
    stories: [{ id: 'bad id!', personaId: 'unknown', want: 'Book', benefit: null, priority: 'urgent' }, { personaId: 'p1', want: 'Pay', priority: 'wont' }],
    goals: Array.from({ length: MAX_ITEMS + 5 }, () => ({ goal: 'G' })),
    openItems: [{ kind: 'gossip', text: 'Q' }],
  })!;
  assert.equal(parsed.title.length, MAX_TEXT);
  assert.equal('extra' in parsed, false);
  assert.deepEqual(parsed.personas, [{ id: 'p1', name: 'Patient', needs: '' }]);
  assert.equal(parsed.stories[0]!.personaId, '');
  assert.equal(parsed.stories[0]!.priority, 'should');
  assert.match(parsed.stories[0]!.id, /^[\w-]+$/);
  assert.notEqual(parsed.stories[0]!.id, 'bad id!');
  assert.equal(parsed.stories[1]!.personaId, 'p1');
  assert.equal(parsed.goals.length, MAX_ITEMS);
  assert.equal(parsed.openItems[0]!.kind, 'question');
});

test('the Markdown export reads like a note and escapes table separators', () => {
  const i18n = createPortfolioI18n('fr');
  const t = i18n.global.t as (key: string, params?: Record<string, unknown>) => string;
  const scoping = exampleScoping('fr');
  scoping.goals[0]!.indicator = 'Appels | jour';
  const markdown = toMarkdown(scoping, t, 'fr');
  assert.match(markdown, /^# Prise de rendez-vous en ligne pour un cabinet dentaire\n/);
  assert.match(markdown, /\| Désengorger le téléphone \| Appels \\\| jour \| −50 % \|/);
  assert.match(markdown, /### Indispensable\n\n- En tant que Patient, je veux réserver en ligne parmi les créneaux libres afin de ne plus avoir à appeler\./);
  // « afin de » is elided before a vowel.
  assert.match(markdown, /afin d’éviter les doubles réservations\./);
  assert.match(markdown, /- \*\*Hypothèse\*\* — Les patients acceptent/);
  const story = { id: 's', personaId: '', want: 'book', benefit: '', priority: 'must' as const };
  const en = createPortfolioI18n('en').global.t as typeof t;
  assert.equal(storySentence(story, 'user', en, 'en'), 'As a user, I want to book.');
  assert.equal(storySentence(story, 'engineer', en, 'en'), 'As an engineer, I want to book.');
  assert.equal(storySentence({ ...story, want: 'réserver', benefit: 'éviter les appels' }, 'utilisateur', t, 'fr'), 'En tant qu’utilisateur, je veux réserver afin d’éviter les appels.');
});

test('blank entries never reach the Markdown export', () => {
  const t = createPortfolioI18n('fr').global.t as (key: string, params?: Record<string, unknown>) => string;
  const scoping = emptyScoping();
  scoping.personas.push({ id: 'p', name: '', needs: '' });
  scoping.goals.push({ id: 'g', goal: '', indicator: '', target: '' });
  const markdown = toMarkdown(scoping, t, 'fr');
  assert.doesNotMatch(markdown, /\*\*\*\*|\|\s+\|/);
  assert.match(markdown, /_Non renseigné\._/);
});

test('check messages agree in number', () => {
  const t = createPortfolioI18n('fr').global.t as (key: string, named: Record<string, unknown>, plural: number) => string;
  const scoping = exampleScoping('fr');
  scoping.personas = scoping.personas.slice(0, 1);
  scoping.stories = scoping.stories.filter(story => story.personaId === scoping.personas[0]!.id);
  scoping.stories.forEach((story, index) => { story.priority = index === 0 ? 'must' : 'could'; });
  const messages = runChecks(scoping).map(check => t(`scoping.checks.${check.key}`, check.params ?? {}, check.plural ?? 1));
  assert.ok(messages.includes('1 indispensable sur 5 user stories : la version 1 reste réaliste.'), messages.join('\n'));
  assert.ok(messages.includes('Le profil a au moins une user story.'), messages.join('\n'));
});

test('the workshop restores and saves only in the browser, and clears storage when emptied', async () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
  const globals = globalThis as Record<string, unknown>;
  const flush = () => new Promise(resolve => setTimeout(resolve));
  values.set(STORAGE_KEY, JSON.stringify({ title: 'Saved project' }));
  globals.window = globalThis;
  globals.localStorage = storage;
  try {
    setActivePinia(createPinia());
    const store = useScopingStore();
    store.restore();
    assert.equal(store.scoping.title, 'Saved project');
    assert.equal(store.hasContent, true);
    store.loadExample('ko');
    assert.equal(store.view, 'note');
    await flush();
    assert.match(values.get(STORAGE_KEY)!, /치과 온라인 예약/);
    store.reset();
    await flush();
    assert.equal(values.has(STORAGE_KEY), false);
    assert.equal(store.view, 'intro');
  } finally {
    delete globals.window;
    delete globals.localStorage;
  }
});
