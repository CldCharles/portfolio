<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { LockKeyhole } from '@lucide/vue';
// Header shortcut to the administration login; the label hides on narrow screens.
const { t } = useI18n({ useScope: 'global' });
</script>

<template>
  <a href="/admin/login" class="admin-link" :aria-label="t('nav.admin')">
    <LockKeyhole :size="15" aria-hidden="true" /><span class="label">{{ t('nav.admin') }}</span>
  </a>
</template>

<style scoped>
.admin-link { display: inline-flex; align-items: center; justify-content: center; gap: .4rem; min-block-size: 2.75rem; min-inline-size: 2.75rem; padding-inline: .6rem; border-radius: .3rem; color: var(--portfolio-ink-mute); font-size: .85rem; text-decoration: none; }
.admin-link:hover { background: var(--portfolio-accent-soft); color: var(--portfolio-accent); }
@media (max-width: 600px) { .label { display: none; } }
@media print { .admin-link { display: none; } }
</style>
