<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ChevronLeft, ChevronRight } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { program } from '../program';
import { getWeekCompletion } from '../lib/progress';
import { formatShort } from '../lib/format';
import { useLearningStore } from '../store';
import SessionCard from './SessionCard.vue';

const props = defineProps<{ week: number }>();
const emit = defineEmits<{ select: [week: number] }>();
const { t } = useI18n({ useScope: 'global' });
const store = useLearningStore();
const current = computed(() => program.weeks[props.week - 1]!);
const phase = computed(() => program.phases[current.value.phase - 1]!);
const milestone = computed(() => program.milestones.find(item => item.phase === phase.value.id));
const completion = computed(() => getWeekCompletion(current.value, store.progress ?? { sessions: {} }));
</script>

<template>
  <section class="week" aria-labelledby="week-heading">
    <div class="week-nav">
      <Button type="button" variant="outline" class="admin-button" :disabled="week <= 1" @click="emit('select', week - 1)"><ChevronLeft :size="16" aria-hidden="true" />{{ t('learning.week.previous') }}</Button>
      <Button type="button" variant="outline" class="admin-button" :disabled="week >= program.weeks.length" @click="emit('select', week + 1)">{{ t('learning.week.next') }}<ChevronRight :size="16" aria-hidden="true" /></Button>
    </div>
    <header>
      <p class="admin-eyebrow">{{ t('learning.phase', { n: phase.id, title: phase.title }) }}</p>
      <h2 id="week-heading" tabindex="-1">{{ t('learning.week.label', { n: current.week }) }} · {{ current.title }}</h2>
      <p class="muted">{{ formatShort(current.start) }} → {{ formatShort(current.end) }} · {{ completion.percent }} % · {{ t('learning.stats.sessions', { done: completion.done, total: completion.total }) }}</p>
    </header>
    <dl class="phase-info">
      <div><dt>{{ t('learning.week.goal') }}</dt><dd>{{ phase.goal }}</dd></div>
      <div><dt>{{ t('learning.week.aiRule') }}</dt><dd>{{ phase.aiRule }}</dd></div>
      <div v-if="milestone"><dt>{{ t('learning.week.milestone') }}</dt><dd>{{ milestone.title }}</dd></div>
    </dl>
    <div class="sessions"><SessionCard v-for="session in current.sessions" :key="session.id" :session="session" /></div>
  </section>
</template>

<style scoped>
.week { display: grid; gap: 1.2rem; }
.week-nav { display: flex; justify-content: space-between; gap: .5rem; flex-wrap: wrap; }
header { display: grid; gap: .3rem; }
h2 { margin: 0; font-size: 1.5rem; line-height: 1.3; }
header p { margin: 0; }
.phase-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: .8rem; margin: 0; padding: 1rem; background: var(--muted); border-radius: .4rem; }
dt { font-size: .75rem; font-weight: 600; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: .06em; }
dd { margin: .25rem 0 0; line-height: 1.5; }
.sessions { display: grid; gap: .8rem; }
</style>
