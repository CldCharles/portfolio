<script setup lang="ts">
import { onMounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { isAdminDemo } from '@/features/demo/adminDemo';
const { t } = useI18n({ useScope: 'global' });
// Read after mounting: the server render knows nothing about this browser tab.
const demo = shallowRef(false);
onMounted(() => { demo.value = isAdminDemo(); });
</script>
<template>
  <!-- RouterLink sets aria-current="page" on the exact active route. -->
  <p v-if="demo" role="status" class="demo-banner">{{ t('admin.demoBanner') }}</p>
  <nav class="admin-nav" :aria-label="t('admin.privateArea')">
    <RouterLink to="/admin">{{ t('learning.cvEditor') }}</RouterLink>
    <RouterLink to="/admin/apprentissage">{{ t('learning.nav') }}</RouterLink>
  </nav>
</template>
<style scoped>
.demo-banner { margin-block-start: 1rem; padding: .75rem 1rem; border-radius: .4rem; background: var(--portfolio-accent-soft); color: var(--portfolio-accent-strong); font-size: .9rem; }
.admin-nav { display: flex; flex-wrap: wrap; gap: .3rem; margin-block-start: 1rem; }
a { display: inline-flex; align-items: center; min-block-size: 2.75rem; padding: .4rem .9rem; border-radius: .35rem; font-size: .9rem; font-weight: 600; color: var(--muted-foreground); }
a:hover { background: var(--muted); color: var(--foreground); }
a[aria-current='page'] { background: var(--portfolio-accent-soft); color: var(--portfolio-accent); }
</style>
