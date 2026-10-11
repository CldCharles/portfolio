<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { program } from '../program';
import { daysUntil, getCompletion, getHours, getNextSession, getTodaySession, getWeekOf } from '../lib/progress';
import { useLearningStore } from '../store';
import SessionCard from './SessionCard.vue';

const { t } = useI18n({ useScope: 'global' });
const store = useLearningStore();
const session = computed(() => getTodaySession(program, store.today));
const next = computed(() => getNextSession(program, store.today));
const week = computed(() => session.value ? getWeekOf(program, session.value.id) : null);
const beforeStart = computed(() => store.today < program.start);
const finished = computed(() => store.today > program.end);
const summary = computed(() => ({ ...getCompletion(program, store.progress ?? { sessions: {} }), hours: getHours(program, store.progress ?? { sessions: {} }) }));
</script>

<template>
  <section class="today" aria-labelledby="today-heading">
    <h2 id="today-heading" tabindex="-1">{{ t('learning.today.heading') }}</h2>
    <template v-if="finished">
      <p class="lead">{{ t('learning.today.finished') }}</p>
      <p>{{ t('learning.today.finishedSummary', summary) }}</p>
    </template>
    <template v-else-if="session && session.type !== 'repos'">
      <p v-if="week" class="muted">{{ t('learning.week.of', { n: week.week }) }} · {{ week.title }} · {{ t('learning.phase', { n: week.phase, title: program.phases[week.phase - 1]!.title }) }}</p>
      <SessionCard :session="session" />
      <details class="template">
        <summary>{{ t('learning.today.template') }}</summary>
        <ol><li v-for="step in program.sessionTemplate" :key="step.step"><strong>{{ t('learning.today.minutes', { n: step.minutes }) }}</strong> {{ step.step }}</li></ol>
      </details>
    </template>
    <template v-else>
      <p class="lead">{{ beforeStart ? t('learning.today.countdown', daysUntil(store.today, program.start)) : t('learning.today.rest') }}</p>
      <template v-if="next">
        <h3 class="next">{{ t('learning.today.next') }}</h3>
        <SessionCard :session="next" heading="h3" />
      </template>
    </template>
  </section>
</template>

<style scoped>
.today { display: grid; gap: 1rem; }
h2 { margin: 0; font-size: 1.5rem; }
.lead { margin: 0; font-family: var(--font-serif); font-size: 1.4rem; }
.muted { margin: 0; font-size: .85rem; }
.next { margin: .5rem 0 0; font-size: 1rem; }
.template summary { display: flex; align-items: center; min-block-size: 2.75rem; cursor: pointer; font-size: .9rem; font-weight: 600; }
.template ol { display: grid; gap: .4rem; margin: 0; padding-inline-start: 1.2rem; line-height: 1.5; }
</style>
