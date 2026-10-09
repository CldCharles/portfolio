<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { LockKeyhole } from '@lucide/vue';
import { useRoute } from 'vue-router';
import MascotPeek from '@/features/mascot/MascotPeek.vue';
import { useSiteConfig } from './config';
const { t, locale } = useI18n();
const site = useSiteConfig();
const route = useRoute();
</script>
<template>
  <footer class="site-footer" :class="{ 'with-mascot': route.path === '/' }">
    <MascotPeek v-if="route.path === '/'" />
    <span class="identity">{{ site.editorName }}<a :href="`/cadrage?lang=${locale}`">{{ t('scoping.nav') }}</a></span>
    <nav :aria-label="t('legal.title')">
      <a :href="`/privacy?lang=${locale}`">{{ t('legal.privacy') }}</a>
      <a v-if="site.contactEmail" :href="`mailto:${site.contactEmail}`">{{ t('legal.contact') }}</a>
      <a v-else :href="`/privacy?lang=${locale}#contact`">{{ t('legal.contact') }} — {{ t('legal.incomplete') }}</a>
      <a href="/admin/login" class="admin-link"><LockKeyhole :size="14" aria-hidden="true" />{{ t('nav.admin') }}</a>
    </nav>
  </footer>
</template>
<style scoped>
.site-footer { position: relative; max-inline-size: 832px; margin-inline: auto; border-block-start: 1px solid var(--border); padding-block: 1.4rem 2rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .8rem 2rem; color: var(--muted-foreground); font-size: .85rem; }
.identity { display: inline-flex; flex-wrap: wrap; align-items: center; gap: .25rem 1.4rem; }
/* Room for the mascot peeking above the line, so it never covers the last CV entry. */
@media screen { .with-mascot { margin-block-start: 6.5rem; } }
nav { display: flex; flex-wrap: wrap; gap: .5rem 1.4rem; }
a { display: inline-flex; align-items: center; min-block-size: 2.75rem; text-decoration: underline; text-underline-offset: .25rem; }
.admin-link { gap: .4rem; text-decoration: none; }
.admin-link:hover { color: var(--portfolio-accent); }
@media(max-width: 960px) { .site-footer { margin-inline: clamp(1.25rem, 5vw, 4rem); } }
</style>
