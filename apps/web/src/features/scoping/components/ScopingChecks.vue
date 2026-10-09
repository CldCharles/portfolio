<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Check } from '../checks';
defineProps<{ checks: Check[] }>();
const { t } = useI18n({ useScope: 'global' });
</script>

<template>
  <section class="checks" aria-labelledby="checks-title">
    <h2 id="checks-title">{{ t('scoping.checks.title') }}</h2>
    <ul v-if="checks.length">
      <li v-for="check in checks" :key="`${check.key}-${check.id ?? ''}`">
        <span class="badge" :class="check.level">{{ t(check.level === 'ok' ? 'scoping.checks.levelOk' : 'scoping.checks.levelWarning') }}</span>
        <span>{{ t(`scoping.checks.${check.key}`, check.params ?? {}, check.plural ?? 1) }}</span>
      </li>
    </ul>
    <p v-else class="none">{{ t('scoping.checks.none') }}</p>
  </section>
</template>

<style scoped>
.checks { border: 1px solid var(--border); border-radius: .9rem; padding: 1.25rem; background: var(--card); box-shadow: var(--portfolio-shadow); }
h2 { margin: 0; font-size: .9rem; font-weight: 600; }
ul { list-style: none; margin: .75rem 0 0; padding: 0; display: flex; flex-direction: column; gap: .65rem; }
li { display: flex; gap: .6rem; align-items: flex-start; font-size: .85rem; line-height: 1.5; }
.badge { flex: none; padding: .1rem .5rem; border-radius: 999px; font-size: .7rem; font-weight: 600; white-space: nowrap; }
.badge.ok { background: #dcefe4; color: #1d5c3b; }
.badge.warning { background: #fbe8cf; color: #7a4405; }
.none { margin: .75rem 0 0; font-size: .85rem; line-height: 1.5; color: var(--portfolio-ink-mute); }
</style>
