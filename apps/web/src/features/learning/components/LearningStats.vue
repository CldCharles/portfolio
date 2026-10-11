<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { program } from '../program';
import { getCompletion, getCurrentWeek, getHours, getOverdue, getPhaseCompletion, getStreak } from '../lib/progress';
import { useLearningStore } from '../store';

defineEmits<{ overdue: [] }>();
const { t } = useI18n({ useScope: 'global' });
const store = useLearningStore();
const progress = computed(() => store.progress ?? { sessions: {} });
const total = computed(() => getCompletion(program, progress.value));
const phase = computed(() => program.phases.find(item => item.id === getCurrentWeek(program, store.today).phase)!);
const phaseCompletion = computed(() => getPhaseCompletion(program, progress.value, phase.value.id));
const streak = computed(() => getStreak(program, progress.value, store.today));
const overdue = computed(() => getOverdue(program, progress.value, store.today).length);
const hours = computed(() => getHours(program, progress.value));
</script>

<template>
  <section class="stats" :aria-label="t('learning.stats.label')">
    <div class="stat main">
      <span class="label">{{ t('learning.stats.progress') }}</span>
      <strong>{{ total.percent }} %</strong>
      <progress :value="total.done" :max="total.total" :aria-label="t('learning.stats.progress')" />
      <span class="detail">{{ t('learning.stats.sessions', { done: total.done, total: total.total }) }}</span>
    </div>
    <div class="stat">
      <span class="label">{{ t('learning.stats.phase') }}</span>
      <strong class="phase">{{ t('learning.phase', { n: phase.id, title: phase.title }) }}</strong>
      <progress :value="phaseCompletion.done" :max="phaseCompletion.total" :aria-label="t('learning.stats.phase')" />
      <span class="detail">{{ phaseCompletion.percent }} % · {{ t('learning.stats.sessions', { done: phaseCompletion.done, total: phaseCompletion.total }) }}</span>
    </div>
    <div class="stat"><span class="label">{{ t('learning.stats.streak') }}</span><strong>{{ t('learning.stats.streakValue', streak) }}</strong></div>
    <div class="stat" :class="{ late: overdue }">
      <span class="label">{{ t('learning.stats.overdue') }}</span>
      <button v-if="overdue" type="button" class="overdue" @click="$emit('overdue')">{{ t('learning.stats.overdueValue', overdue) }} →</button>
      <strong v-else>{{ t('learning.stats.overdueValue', 0) }}</strong>
    </div>
    <div class="stat"><span class="label">{{ t('learning.stats.hours') }}</span><strong>{{ t('learning.stats.hoursValue', { n: hours }) }}</strong></div>
  </section>
</template>

<style scoped>
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr)); gap: .8rem; }
.stat { display: grid; align-content: start; gap: .35rem; padding: 1rem; border: 1px solid var(--border); border-radius: .4rem; background: var(--card); min-inline-size: 0; }
.main, .stat:nth-child(2) { grid-column: span 2; }
.label { font-size: .75rem; font-weight: 600; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: .06em; }
strong { font-size: 1.35rem; font-weight: 600; line-height: 1.25; }
.phase { font-size: 1.05rem; }
.detail { font-size: .8rem; color: var(--muted-foreground); }
progress { inline-size: 100%; block-size: .5rem; appearance: none; border: 0; border-radius: 1rem; background: var(--muted); overflow: hidden; }
progress::-webkit-progress-bar { background: var(--muted); }
progress::-webkit-progress-value { background: var(--portfolio-accent); border-radius: 1rem; }
progress::-moz-progress-bar { background: var(--portfolio-accent); border-radius: 1rem; }
.late { border-color: #b04b3c; }
.overdue { justify-self: start; min-block-size: 2.75rem; padding: 0; border: 0; background: none; color: #922f22; font: inherit; font-size: 1.15rem; font-weight: 600; text-decoration: underline; text-underline-offset: .25rem; cursor: pointer; }
@media (max-width: 560px) { .main, .stat:nth-child(2) { grid-column: 1 / -1; } .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
