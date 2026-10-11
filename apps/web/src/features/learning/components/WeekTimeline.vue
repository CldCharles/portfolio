<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { program } from '../program';
import { getFocusWeek, getWeekCompletion } from '../lib/progress';
import { useLearningStore } from '../store';

defineProps<{ selected: number | null }>();
defineEmits<{ select: [week: number] }>();
const { t } = useI18n({ useScope: 'global' });
const store = useLearningStore();
const current = computed(() => getFocusWeek(program, store.progress ?? { sessions: {} }).week);
const phases = computed(() => program.phases.map(phase => ({
  ...phase,
  weeks: program.weeks.filter(week => week.phase === phase.id).map(week => ({ ...week, percent: getWeekCompletion(week, store.progress ?? { sessions: {} }).percent })),
})));
// Five steps so the fill stays readable; the percentage is also in the accessible name and the visible label.
const level = (percent: number) => percent === 0 ? 0 : percent < 34 ? 1 : percent < 67 ? 2 : percent < 100 ? 3 : 4;
</script>

<template>
  <nav class="timeline" :aria-label="t('learning.week.timeline')">
    <div v-for="phase in phases" :key="phase.id" class="phase">
      <span class="phase-title">{{ t('learning.phase', { n: phase.id, title: phase.title }) }}</span>
      <ol>
        <li v-for="week in phase.weeks" :key="week.week">
          <button type="button" :class="[`level-${level(week.percent)}`, { current: week.week === current }]" :aria-current="week.week === selected ? 'true' : undefined" :aria-label="t('learning.week.timelineItem', { n: week.week, title: week.title, percent: week.percent })" :title="week.title" @click="$emit('select', week.week)">
            <span class="number">{{ week.week }}</span><span class="percent">{{ week.percent }}%</span>
          </button>
        </li>
      </ol>
    </div>
  </nav>
</template>

<style scoped>
.timeline { display: flex; flex-wrap: wrap; gap: 1rem 1.4rem; }
.phase { display: grid; gap: .4rem; }
.phase-title { font-size: .72rem; font-weight: 600; color: var(--muted-foreground); }
ol { display: flex; flex-wrap: wrap; gap: .3rem; margin: 0; padding: 0; list-style: none; }
button { display: grid; place-items: center; inline-size: 2.75rem; block-size: 3rem; padding: 0; border: 1px solid var(--border); border-radius: .35rem; background: var(--card); color: var(--foreground); font: inherit; cursor: pointer; line-height: 1.1; }
.number { font-size: .9rem; font-weight: 600; }
.percent { font-size: .62rem; }
.level-1 { background: #eef4f5; }
.level-2 { background: var(--portfolio-accent-soft-hover); }
.level-3 { background: var(--portfolio-accent-line); }
.level-4 { background: var(--portfolio-accent); border-color: var(--portfolio-accent); color: #fff; }
.current { outline: 2px dashed var(--portfolio-accent); outline-offset: 2px; }
button[aria-current] { box-shadow: 0 0 0 3px var(--foreground); }
button:focus-visible { outline: 2px solid var(--portfolio-accent); outline-offset: 3px; }
</style>
