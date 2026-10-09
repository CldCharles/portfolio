<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowLeft, Copy, Printer, RotateCcw } from '@lucide/vue';
import { lines, priorities } from '../model';
import { storySentence, toMarkdown } from '../markdown';
import { useScopingStore } from '../store';
import ScopingChecks from './ScopingChecks.vue';
import ChibiMascot from '@/features/mascot/ChibiMascot.vue';
import { mascotPose } from '../mascot';
const { t, locale } = useI18n({ useScope: 'global' });
const store = useScopingStore();
const scoping = computed(() => store.scoping);
const status = ref('');
const today = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'long' }).format(new Date()));
const personaName = (id: string) => scoping.value.personas.find(persona => persona.id === id)?.name.trim() || t('scoping.note.someone');
const stories = computed(() => priorities.map(priority => ({
  priority,
  items: scoping.value.stories.filter(story => story.priority === priority && story.want.trim())
    .map(story => ({ id: story.id, text: storySentence(story, personaName(story.personaId), t, locale.value) })),
})).filter(group => group.items.length));
const personas = computed(() => scoping.value.personas.filter(persona => persona.name.trim() || persona.needs.trim()));
const goals = computed(() => scoping.value.goals.filter(goal => goal.goal.trim() || goal.indicator.trim() || goal.target.trim()));
const openItems = computed(() => scoping.value.openItems.filter(item => item.text.trim()));

async function copy() {
  try {
    await navigator.clipboard.writeText(toMarkdown(scoping.value, t, locale.value));
    status.value = t('scoping.actions.copied');
  } catch { status.value = t('scoping.actions.copyFailed'); }
}
const print = () => window.print();
function reset() { if (window.confirm(t('scoping.actions.resetConfirm'))) store.reset(); }
</script>

<template>
  <div class="note-view">
    <div class="toolbar">
      <div>
        <button type="button" class="back" @click="store.open('steps', 1)"><ArrowLeft :size="14" aria-hidden="true" />{{ t('scoping.actions.edit') }}</button>
        <h1 class="serif" tabindex="-1">{{ t('scoping.note.ready') }}</h1>
      </div>
      <div class="tools">
        <button type="button" class="btn btn-outline" @click="copy"><Copy :size="16" aria-hidden="true" />{{ t('scoping.actions.copy') }}</button>
        <button type="button" class="btn btn-primary" @click="print"><Printer :size="16" aria-hidden="true" />{{ t('scoping.actions.print') }}</button>
      </div>
      <p class="status" role="status">{{ status }}</p>
    </div>

    <div class="layout">
      <article class="note" :aria-label="t('scoping.note.eyebrow')">
        <header>
          <div>
            <p class="eyebrow">{{ t('scoping.note.eyebrow') }}</p>
            <h2 class="serif title">{{ scoping.title.trim() || t('scoping.note.untitled') }}</h2>
          </div>
          <dl class="meta">
            <dt>{{ t('scoping.note.date') }}</dt><dd>{{ today }}</dd>
            <dt>{{ t('scoping.note.status') }}</dt><dd>{{ t('scoping.note.statusValue') }}</dd>
          </dl>
        </header>

        <section>
          <h3>1 · {{ t('scoping.steps.problem') }}</h3>
          <p v-if="scoping.situation.trim()" class="prose">{{ scoping.situation }}</p>
          <p v-if="scoping.cost.trim()" class="prose"><strong>{{ t('scoping.fields.cost') }}</strong> {{ scoping.cost }}</p>
          <p v-if="!scoping.situation.trim() && !scoping.cost.trim()" class="empty">{{ t('scoping.note.empty') }}</p>
        </section>

        <section>
          <h3>2 · {{ t('scoping.steps.users') }}</h3>
          <div v-if="personas.length" class="personas">
            <div v-for="persona in personas" :key="persona.id" class="persona">
              <p class="persona-name">{{ persona.name.trim() || t('scoping.note.someone') }}</p>
              <p>{{ persona.needs }}</p>
            </div>
          </div>
          <p v-else class="empty">{{ t('scoping.note.empty') }}</p>
        </section>

        <section>
          <h3>3 · {{ t('scoping.steps.goals') }}</h3>
          <div v-if="goals.length" class="table-box">
            <table>
              <thead><tr><th scope="col">{{ t('scoping.fields.goal') }}</th><th scope="col">{{ t('scoping.fields.indicator') }}</th><th scope="col">{{ t('scoping.fields.target') }}</th></tr></thead>
              <tbody>
                <tr v-for="goal in goals" :key="goal.id"><td>{{ goal.goal }}</td><td class="muted">{{ goal.indicator }}</td><td class="target">{{ goal.target }}</td></tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty">{{ t('scoping.note.empty') }}</p>
        </section>

        <section class="scope">
          <div>
            <h3>4 · {{ t('scoping.fields.inScope') }}</h3>
            <ul v-if="lines(scoping.inScope).length"><li v-for="(line, index) in lines(scoping.inScope)" :key="index">{{ line }}</li></ul>
            <p v-else class="empty">{{ t('scoping.note.empty') }}</p>
          </div>
          <div>
            <h3 class="out">{{ t('scoping.fields.outOfScope') }}</h3>
            <ul v-if="lines(scoping.outOfScope).length" class="muted"><li v-for="(line, index) in lines(scoping.outOfScope)" :key="index">{{ line }}</li></ul>
            <p v-else class="empty">{{ t('scoping.note.empty') }}</p>
          </div>
          <p v-if="scoping.constraints.trim()" class="constraints"><strong>{{ t('scoping.fields.constraints') }}</strong> {{ scoping.constraints }}</p>
        </section>

        <section>
          <h3>5 · {{ t('scoping.steps.features') }}</h3>
          <ol v-if="stories.length" class="stories">
            <template v-for="group in stories" :key="group.priority">
              <li v-for="story in group.items" :key="story.id">
                <span class="priority" :class="group.priority">{{ t(`scoping.priorityShort.${group.priority}`) }}</span>
                <span>{{ story.text }}</span>
              </li>
            </template>
          </ol>
          <p v-else class="empty">{{ t('scoping.note.empty') }}</p>
        </section>

        <section>
          <h3>6 · {{ t('scoping.steps.risks') }}</h3>
          <ul v-if="openItems.length" class="open-items">
            <li v-for="item in openItems" :key="item.id"><span class="kind">{{ t(`scoping.kind.${item.kind}`) }}</span><span>{{ item.text }}</span></li>
          </ul>
          <p v-else class="empty">{{ t('scoping.note.empty') }}</p>
        </section>

        <footer>{{ t('scoping.note.footer') }}</footer>
      </article>

      <aside class="aside">
        <div class="checks-with-mascot">
          <ChibiMascot :pose="mascotPose(store.checks)" class="mascot" />
          <ScopingChecks :checks="store.checks" />
        </div>
        <button type="button" class="btn btn-outline reset" @click="reset"><RotateCcw :size="16" aria-hidden="true" />{{ t('scoping.actions.reset') }}</button>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.toolbar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 1rem; }
.back { display: inline-flex; align-items: center; gap: .35rem; min-block-size: 2.75rem; padding: 0; border: 0; background: none; color: var(--portfolio-ink-mute); font: inherit; font-size: .85rem; cursor: pointer; text-decoration: underline; text-underline-offset: .25rem; }
h1 { margin: 0; font-size: clamp(1.6rem, 4vw, 2.1rem); line-height: 1.15; }
h1:focus { outline: none; }
.tools { display: flex; flex-wrap: wrap; gap: .5rem; }
.status { flex-basis: 100%; margin: 0; min-block-size: 1.25rem; font-size: .85rem; color: var(--portfolio-accent); text-align: end; }
.layout { margin-block-start: 1rem; display: flex; flex-wrap: wrap; gap: 2rem; align-items: flex-start; }
.note { flex: 999 1 36rem; min-inline-size: 0; box-sizing: border-box; background: var(--card); border: 1px solid var(--border); border-radius: .5rem; box-shadow: 0 24px 48px -28px rgb(28 42 48 / 30%); padding: clamp(1.5rem, 6vw, 4rem) clamp(1.25rem, 6vw, 4.5rem); }
.note > header { border-block-end: 2px solid var(--foreground); padding-block-end: 1.25rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 1rem; }
.title { margin: .5rem 0 0; font-size: clamp(1.6rem, 4vw, 2.1rem); line-height: 1.15; overflow-wrap: anywhere; }
.meta { margin: 0; display: grid; grid-template-columns: auto auto; gap: .15rem .75rem; font-size: .78rem; color: var(--portfolio-ink-mute); }
.meta dd { margin: 0; color: var(--foreground); }
section { margin-block-start: 1.75rem; }
h3 { margin: 0; font-size: .8rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--portfolio-accent); }
h3.out { color: var(--portfolio-ink-mute); }
p { overflow-wrap: anywhere; }
.prose { margin: .6rem 0 0; font-size: .95rem; line-height: 1.65; white-space: pre-line; }
.empty { margin: .6rem 0 0; font-size: .9rem; font-style: italic; color: var(--portfolio-ink-mute); }
.personas { margin-block-start: .75rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: .75rem; }
.persona { background: var(--scoping-sunken); border-radius: .6rem; padding: .9rem; }
.persona p { margin: 0; font-size: .85rem; line-height: 1.5; color: var(--muted-foreground); }
.persona .persona-name { font-size: .9rem; font-weight: 600; color: var(--foreground); margin-block-end: .3rem; }
.table-box { margin-block-start: .75rem; overflow-x: auto; }
table { inline-size: 100%; border-collapse: collapse; font-size: .9rem; }
th { padding: .5rem .75rem .5rem 0; border-block-end: 1px solid var(--input); text-align: start; font-size: .75rem; font-weight: 600; color: var(--portfolio-ink-mute); }
td { padding: .6rem .75rem .6rem 0; border-block-end: 1px solid var(--border); vertical-align: top; }
.target { font-weight: 600; white-space: nowrap; }
.scope { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
.scope ul { margin: .6rem 0 0; padding-inline-start: 1.1rem; font-size: .9rem; line-height: 1.7; }
.constraints { grid-column: 1 / -1; margin: 0; font-size: .85rem; line-height: 1.6; background: var(--scoping-sunken); border-radius: .6rem; padding: .75rem .9rem; white-space: pre-line; }
.stories { list-style: none; margin: .6rem 0 0; padding: 0; }
.stories li { display: flex; gap: .9rem; align-items: baseline; padding-block: .55rem; border-block-end: 1px solid var(--border); font-size: .9rem; line-height: 1.5; }
.stories li > span:last-child { min-inline-size: 0; overflow-wrap: anywhere; }
.priority { flex: none; inline-size: 3.5rem; font-size: .7rem; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--portfolio-accent); }
.priority.should { color: #3a6c7b; } .priority.could, .priority.wont { color: var(--portfolio-ink-mute); }
.open-items { list-style: none; margin: .6rem 0 0; padding: 0; display: flex; flex-direction: column; gap: .5rem; }
.open-items li { display: flex; gap: .6rem; font-size: .9rem; line-height: 1.55; }
.open-items li > span:last-child { min-inline-size: 0; overflow-wrap: anywhere; }
.kind { flex: none; font-weight: 600; color: #7a4405; }
.note > footer { margin-block-start: 2.5rem; padding-block-start: .9rem; border-block-start: 1px solid var(--border); font-size: .72rem; color: var(--portfolio-ink-mute); }
.aside { flex: 1 1 17rem; min-inline-size: 0; display: flex; flex-direction: column; gap: 1rem; }
.reset { align-self: flex-start; }
.checks-with-mascot { position: relative; margin-block-start: 4.5rem; }
/* The mascot peeks from behind the panel: only its head and shoulders show. */
.checks-with-mascot > :last-child { position: relative; }
.mascot { position: absolute; inset-block-end: calc(100% - 1.4rem); inset-inline-end: .75rem; inline-size: 76px; }
@media (max-width: 560px) { .scope { grid-template-columns: minmax(0, 1fr); } .status { text-align: start; } }
@media print {
  .toolbar, .aside { display: none; }
  .layout { margin: 0; display: block; }
  .note { border: 0; box-shadow: none; padding: 0; font-size: 11pt; }
  section { break-inside: avoid; }
  .stories li, tr { break-inside: avoid; }
}
</style>
