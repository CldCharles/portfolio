<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from '@/features/cv/components/LanguageSwitcher.vue';
import { useSiteConfig } from '@/features/legal/config';
const { t, locale } = useI18n();
const site = useSiteConfig();
const sections = ['overview', 'cv', 'admin', 'storage', 'external', 'rights'] as const;
</script>
<template>
  <div class="privacy-shell">
    <a href="#privacy-main" class="skip-link">{{ t('nav.skip') }}</a>
    <header><a :href="`/?lang=${locale}`">← {{ t('legal.back') }}</a><LanguageSwitcher /></header>
    <main id="privacy-main" tabindex="-1">
      <h1>{{ t('legal.title') }}</h1>
      <p class="intro">{{ t('legal.intro', { name: site.editorName }) }}</p>
      <p class="date">{{ t('legal.updated') }}</p>
      <section v-for="section in sections" :key="section" :aria-labelledby="`${section}-heading`">
        <h2 :id="`${section}-heading`">{{ t(`legal.${section}Title`) }}</h2>
        <p>{{ t(`legal.${section}`) }}</p>
      </section>
      <section id="contact" aria-labelledby="hosting-heading">
        <h2 id="hosting-heading">{{ t('legal.hostingTitle') }}</h2>
        <dl>
          <dt>{{ t('legal.host') }}</dt><dd>{{ site.hostName ?? t('legal.incomplete') }}</dd>
          <dt>{{ t('legal.country') }}</dt><dd>{{ site.hostCountry ?? t('legal.incomplete') }}</dd>
          <dt>{{ t('legal.logs') }}</dt><dd>{{ site.hostLogRetention ?? t('legal.incomplete') }}</dd>
        </dl>
        <p v-if="!site.hostName || !site.hostCountry || !site.hostLogRetention">{{ t('legal.hostPending') }}</p>
        <p>{{ t('legal.contactIntro') }}</p>
        <a v-if="site.contactEmail" :href="`mailto:${site.contactEmail}`">{{ site.contactEmail }}</a>
        <p v-else>{{ t('legal.contactPending') }}</p>
        <p><a href="https://www.pipc.go.kr/eng/">{{ t('legal.authority') }} ↗</a></p>
      </section>
    </main>
  </div>
</template>
<style scoped>
.privacy-shell { max-inline-size: 960px; margin-inline: auto; padding-inline: clamp(1.25rem, 5vw, 4rem); }
header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; padding-block: 1.5rem; border-block-end: 1px solid var(--border); }
main { padding-block: 3rem; } h1 { font-family: Georgia, serif; font-size: clamp(2rem, 5vw, 3rem); line-height: 1.2; }
h2 { font-size: 1.25rem; font-weight: 600; margin-block-end: .7rem; }
p, dd { line-height: 1.8; color: var(--muted-foreground); } p + p { margin-block-start: .8rem; }
.intro { margin-block-start: 1.5rem; } .date { font-size: .85rem; } section { margin-block-start: 2rem; }
a { text-decoration: underline; text-underline-offset: .25rem; } header > a { display: inline-flex; align-items: center; min-block-size: 2.75rem; }
dl { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr); gap: .7rem 1rem; margin-block-end: 1rem; } dt { font-weight: 500; } dd { margin: 0; overflow-wrap: anywhere; }
.skip-link { position: absolute; inset-block-start: -10rem; padding: 1rem; background: var(--foreground); color: var(--background); z-index: 10; } .skip-link:focus { inset-block-start: 1rem; }
@media(max-width: 500px) { dl { grid-template-columns: 1fr; } }
</style>
