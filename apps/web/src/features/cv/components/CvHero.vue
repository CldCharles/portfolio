<script setup lang="ts">
import { computed } from 'vue';
import { splitIntroduction } from '../lib/presentation';
import { useI18n } from 'vue-i18n';
import type { PublicCv } from '@portfolio/contracts';
import { Button } from '@/components/ui/button';
import CvPdfExport from './CvPdfExport.vue';
const props = defineProps<{ profile: PublicCv['profile']; exportable?: boolean; headingTag?: 'h1' | 'h2' }>();
const { t } = useI18n({ useScope: 'global' });
// Optional local portrait; no placeholder or external image request.
const portraits = import.meta.glob<string>('/src/assets/portrait.{webp,jpg,png}', { eager: true, query: '?url', import: 'default' });
const portraitUrl = portraits['/src/assets/portrait.webp'] ?? portraits['/src/assets/portrait.jpg'] ?? portraits['/src/assets/portrait.png'];
const introduction = computed(() => splitIntroduction(props.profile.text.description));
</script>

<template>
  <section class="hero" aria-labelledby="profile-name">
    <div class="hero-heading" :class="{ 'has-portrait': portraitUrl }">
    <div class="hero-identity">
    <component :is="headingTag ?? 'h1'" id="profile-name" class="name">{{ profile.name }}</component>
    <p class="role" :lang="profile.text.locale">{{ profile.text.title }}</p>
    </div>
    <span v-if="portraitUrl" class="portrait-frame"><img :src="portraitUrl" alt="" class="portrait" width="128" height="128" /></span>
    </div>
    <p v-if="profile.text.fallback" class="fallback-note">{{ t('cv.fallback') }}</p>
    <div class="hero-intro">
      <p class="intro-copy" :lang="profile.text.locale">{{ introduction.lead }}</p>
      <details v-if="introduction.rest" class="intro-details">
        <summary>{{ t('cv.moreAbout') }}</summary>
        <p class="intro-copy" :lang="profile.text.locale">{{ introduction.rest }}</p>
      </details>
    </div>
    <div class="hero-actions">
      <CvPdfExport v-if="exportable" />
      <Button v-if="profile.githubUrl" as="a" :href="profile.githubUrl" variant="ghost" class="github-link">
        {{ t('cv.github') }} <span aria-hidden="true">↗</span>
      </Button>
    </div>
  </section>
</template>

<style scoped>
.hero { padding-block: 2rem; }
.hero-heading { display: grid; grid-template-columns: minmax(0, 1fr); align-items: center; gap: .75rem 1.5rem; }
.hero-heading.has-portrait { grid-template-columns: minmax(0, 1fr) auto; }
.hero-heading:not(.has-portrait) .name { max-inline-size: 100%; }
.hero-identity { display: contents; }
.name { grid-column: 1; max-inline-size: 16ch; font-family: Georgia, 'Times New Roman', serif; font-size: 3.5rem; font-weight: 400; line-height: 1.05; letter-spacing: -.035em; text-wrap: balance; overflow-wrap: anywhere; }
.role { grid-column: 1; color: var(--portfolio-accent); font-size: 1rem; font-weight: 600; line-height: 1.5; margin: 0; }
.portrait-frame { grid-column: 2; grid-row: 1 / span 2; inline-size: 128px; block-size: 128px; border-radius: .75rem; overflow: hidden; }
.portrait { display: block; inline-size: 100%; block-size: 100%; object-fit: cover; }
.hero-intro { margin-block-start: 1rem; max-inline-size: 60ch; }
.intro-copy { font-size: 1rem; line-height: 1.65; color: var(--muted-foreground); white-space: pre-line; }
.intro-details { margin-block-start: .25rem; }
.intro-details summary { color: var(--portfolio-accent); cursor: pointer; font-size: .85rem; padding-block: .5rem; min-block-size: 2.75rem; }
.intro-details[open] .intro-copy { margin-block: .5rem 1rem; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem 1rem; margin-block-start: 1rem; }
.github-link { min-block-size: 2.75rem; block-size: auto; padding: .5rem; gap: .5rem; white-space: normal; color: var(--portfolio-accent); background: transparent; }
summary:focus-visible { outline: 2px solid var(--portfolio-accent); outline-offset: 3px; }
@media (min-width: 601px) and (max-width: 900px) { .name { font-size: 3rem; } .portrait-frame { inline-size: 112px; block-size: 112px; } }
@media (max-width: 600px) {
  .hero { padding-block: 1.25rem 1.5rem; }
  .hero-heading { gap: .75rem; align-items: start; }
  .name { font-size: 2.25rem; line-height: 1.1; }
  .portrait-frame { grid-row: 1; inline-size: 80px; block-size: 80px; }
  .role { grid-column: 1 / -1; font-size: .9375rem; line-height: 1.45; }
  .hero-intro, .hero-actions { margin-block-start: .75rem; }
  .intro-copy { line-height: 1.5; }
}
@media (max-width: 360px) { .name { font-size: 2rem; } .portrait-frame { inline-size: 64px; block-size: 64px; } }
</style>
