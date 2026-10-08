<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSiteConfig } from './config';
const { t, locale } = useI18n();
const site = useSiteConfig();
</script>
<template>
  <footer class="site-footer">
    <span>{{ site.editorName }}</span>
    <nav :aria-label="t('legal.title')">
      <a :href="`/privacy?lang=${locale}`">{{ t('legal.privacy') }}</a>
      <a v-if="site.contactEmail" :href="`mailto:${site.contactEmail}`">{{ t('legal.contact') }}</a>
      <a v-else :href="`/privacy?lang=${locale}#contact`">{{ t('legal.contact') }} — {{ t('legal.incomplete') }}</a>
    </nav>
  </footer>
</template>
<style scoped>
.site-footer { max-inline-size: 832px; margin-inline: auto; border-block-start: 1px solid var(--border); padding-block: 1.4rem 2rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .8rem 2rem; color: var(--muted-foreground); font-size: .85rem; }
nav { display: flex; flex-wrap: wrap; gap: .5rem 1.4rem; }
a { display: inline-flex; align-items: center; min-block-size: 2.75rem; text-decoration: underline; text-underline-offset: .25rem; }
@media(max-width: 960px) { .site-footer { margin-inline: clamp(1.25rem, 5vw, 4rem); } }
</style>
