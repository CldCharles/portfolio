<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { program } from '../program';
import { getOverdue } from '../lib/progress';
import { useLearningStore } from '../store';
import SessionCard from './SessionCard.vue';

const { t } = useI18n({ useScope: 'global' });
const store = useLearningStore();
const sessions = computed(() => getOverdue(program, store.progress ?? { sessions: {} }, store.today));
</script>

<template>
  <section class="overdue" aria-labelledby="overdue-heading">
    <h2 id="overdue-heading" tabindex="-1">{{ t('learning.overdue.heading') }}</h2>
    <p class="muted">{{ t('learning.overdue.intro') }}</p>
    <p v-if="!sessions.length" class="notice">{{ t('learning.overdue.empty') }}</p>
    <div v-else class="sessions"><SessionCard v-for="session in sessions" :key="session.id" :session="session" /></div>
  </section>
</template>

<style scoped>
.overdue { display: grid; gap: 1rem; }
h2 { margin: 0; font-size: 1.5rem; }
.muted { margin: 0; }
.sessions { display: grid; gap: .8rem; }
</style>
