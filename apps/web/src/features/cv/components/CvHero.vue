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
    <div class="hero-heading">
    <div class="hero-identity">
    <p class="role" :lang="profile.text.locale">{{ profile.text.title }}</p>
    <component :is="headingTag ?? 'h1'" id="profile-name" class="name">{{ profile.name }}</component>
    </div>
    <img v-if="portraitUrl" :src="portraitUrl" alt="" class="portrait" width="128" height="128" />
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
.hero { padding-block: clamp(2.5rem, 5vw, 4rem); }
.hero-heading { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; }
.hero-identity { min-inline-size: 0; }
.portrait { flex: 0 0 auto; inline-size: 128px; block-size: 128px; object-fit: cover; border-radius: .75rem; }
@media (max-width: 600px) { .hero-heading { gap: 1rem; align-items: start; } .portrait { inline-size: 80px; block-size: 80px; } }
.role { color: var(--portfolio-accent); font-size: .75rem; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; margin-block-end: 1rem; }
.name { font-family: Georgia, 'Times New Roman', serif; font-size: clamp(2.7rem, 5vw, 4.1rem); font-weight: 400; line-height: 1.08; letter-spacing: -.045em; max-inline-size: 16ch; text-wrap: balance; }
.hero-intro { margin-block-start: 1.4rem; max-inline-size: 60ch; }
.intro-copy { font-size: 1rem; line-height: 1.75; color: var(--muted-foreground); white-space: pre-line; }
.intro-details { margin-block-start: .5rem; }
.intro-details summary { color: var(--portfolio-accent); cursor: pointer; font-size: .85rem; padding-block: .6rem; min-block-size: 2.75rem; }
.intro-details[open] .intro-copy { margin-block: .5rem 1rem; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: end; gap: .6rem 1.25rem; margin-block-start: 1.25rem; }
.github-link { min-block-size: 2.75rem; block-size: auto; padding: .65rem .5rem; gap: .7rem; white-space: normal; color: var(--portfolio-accent); background: transparent; }
summary:focus-visible { outline: 2px solid var(--portfolio-accent); outline-offset: 3px; }
</style>
