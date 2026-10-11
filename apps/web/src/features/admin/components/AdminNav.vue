<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n({ useScope: 'global' });
</script>
<template>
  <!-- RouterLink sets aria-current="page" on the exact active route. -->
  <nav class="admin-nav" :aria-label="t('admin.privateArea')">
    <RouterLink to="/admin">{{ t('learning.cvEditor') }}</RouterLink>
    <RouterLink to="/admin/apprentissage">{{ t('learning.nav') }}</RouterLink>
  </nav>
</template>
<style scoped>
.admin-nav { display: flex; flex-wrap: wrap; gap: .3rem; margin-block-start: 1rem; }
a { display: inline-flex; align-items: center; min-block-size: 2.75rem; padding: .4rem .9rem; border-radius: .35rem; font-size: .9rem; font-weight: 600; color: var(--muted-foreground); }
a:hover { background: var(--muted); color: var(--foreground); }
a[aria-current='page'] { background: var(--portfolio-accent-soft); color: var(--portfolio-accent); }
</style>
