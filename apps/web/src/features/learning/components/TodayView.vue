<script setup lang="ts">
import { computed, nextTick, shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowRight } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { program } from '../program';
import { getCompletion, getHours, getNextTodo, getUpcomingTodos, getWeekOf } from '../lib/progress';
import { formatDay } from '../lib/format';
import { useLearningStore } from '../store';
import SessionCard from './SessionCard.vue';

// Self-paced: the next lesson is the first one still to do, whatever today's date.
const emit = defineEmits<{ select: [week: number] }>();
const { t } = useI18n({ useScope: 'global' });
const store = useLearningStore();
const progress = computed(() => store.progress ?? { sessions: {} });
const session = computed(() => getNextTodo(program, progress.value));
const week = computed(() => session.value ? getWeekOf(program, session.value.id) : null);
const upcoming = computed(() => session.value ? getUpcomingTodos(program, progress.value, session.value.id, 3).map(item => ({ session: item, week: getWeekOf(program, item.id)!.week })) : []);
// After « Fait » or « Sauter », the card is replaced by the next lesson: announce it and
// move focus to the heading instead of losing it with the removed button.
const announcement = shallowRef('');
watch(() => session.value?.id, async (id, previous) => {
  if (!previous || id === previous) return;
  announcement.value = t(id ? 'learning.today.moved' : 'learning.today.finished');
  await nextTick();
  document.getElementById('today-heading')?.focus();
});
const summary = computed(() => ({ ...getCompletion(program, progress.value), hours: getHours(program, progress.value) }));
</script>

<template>
  <section class="today" aria-labelledby="today-heading">
    <h2 id="today-heading" tabindex="-1">{{ t('learning.today.heading') }}</h2>
    <p class="sr-only" role="status">{{ announcement }}</p>
    <template v-if="!session">
      <p class="lead">{{ t('learning.today.finished') }}</p>
      <p>{{ t('learning.today.finishedSummary', summary) }}</p>
    </template>
    <template v-else>
      <p class="muted">{{ t('learning.today.freePace') }}</p>
      <p v-if="week" class="muted">{{ t('learning.week.of', { n: week.week }) }} · {{ week.title }} · {{ t('learning.phase', { n: week.phase, title: program.phases[week.phase - 1]!.title }) }}</p>
      <!-- Keyed by id: once marked done, the card is replaced by the next lesson with fresh notes. -->
      <SessionCard :key="session.id" :session="session" />
      <details class="template">
        <summary>{{ t('learning.today.template') }}</summary>
        <ol><li v-for="step in program.sessionTemplate" :key="step.step"><strong>{{ t('learning.today.minutes', { n: step.minutes }) }}</strong> {{ step.step }}</li></ol>
      </details>
      <section v-if="upcoming.length" class="upcoming" aria-labelledby="upcoming-heading">
        <h3 id="upcoming-heading">{{ t('learning.today.then') }}</h3>
        <ul>
          <li v-for="item in upcoming" :key="item.session.id">
            <span class="item"><span class="muted">{{ t('learning.week.label', { n: item.week }) }} · {{ formatDay(item.session.date) }} · {{ t(`learning.session.types.${item.session.type}`) }}</span>{{ item.session.objective }}</span>
            <Button type="button" variant="ghost" class="admin-button" :aria-label="t('learning.today.openWeek', { n: item.week })" @click="emit('select', item.week)"><ArrowRight :size="16" aria-hidden="true" /></Button>
          </li>
        </ul>
        <Button type="button" variant="outline" class="admin-button pick" @click="emit('select', week?.week ?? 1)">{{ t('learning.today.pickAny') }}</Button>
      </section>
    </template>
  </section>
</template>

<style scoped>
.today { display: grid; gap: 1rem; }
h2 { margin: 0; font-size: 1.5rem; }
.lead { margin: 0; font-family: var(--font-serif); font-size: 1.4rem; }
.muted { margin: 0; font-size: .85rem; }
.template summary { display: flex; align-items: center; min-block-size: 2.75rem; cursor: pointer; font-size: .9rem; font-weight: 600; }
.template ol { display: grid; gap: .4rem; margin: 0; padding-inline-start: 1.2rem; line-height: 1.5; }
.upcoming { display: grid; gap: .5rem; }
.upcoming h3 { margin: .5rem 0 0; font-size: 1rem; }
.upcoming ul { display: grid; margin: 0; padding: 0; list-style: none; border-block-start: 1px solid var(--border); }
.upcoming li { display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding-block: .5rem; border-block-end: 1px solid var(--border); }
.item { display: grid; gap: .15rem; min-inline-size: 0; line-height: 1.45; overflow-wrap: anywhere; }
.item .muted { font-size: .78rem; }
.pick { justify-self: start; }
.sr-only { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
