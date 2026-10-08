<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { PublicCv } from '@portfolio/contracts';
import { Button } from '@/components/ui/button';
import CvPdfExport from './CvPdfExport.vue';
defineProps<{ profile: PublicCv['profile']; exportable?: boolean }>();
const { t } = useI18n({ useScope: 'global' });
</script>

<template>
  <section class="hero" aria-labelledby="profile-name">
    <div class="hero-heading">
      <p class="eyebrow"><span class="accent-line" aria-hidden="true" />{{ t('cv.eyebrow') }}</p>
      <h1 id="profile-name" class="name">{{ profile.name }}</h1>
      <p class="role" :lang="profile.text.locale">{{ profile.text.title }}</p>
    </div>
    <div class="hero-intro">
      <p v-if="profile.text.fallback" class="fallback-note">{{ t('cv.fallback') }}</p>
      <div :lang="profile.text.locale">
        <h2 class="intro-title">{{ profile.text.subtitle }}</h2>
        <p class="intro-copy">{{ profile.text.description }}</p>
      </div>
      <Button v-if="profile.githubUrl" as="a" :href="profile.githubUrl" variant="outline" class="github-link">
        {{ t('cv.github') }} <span aria-hidden="true">↗</span>
      </Button>
      <CvPdfExport v-if="exportable" />
    </div>
  </section>
</template>

<style scoped>
.hero { padding-block: clamp(3.5rem, 8vw, 7.5rem); display: grid; grid-template-columns: 1.25fr 1fr; gap: clamp(2.5rem, 6vw, 6rem); align-items: end; }
.eyebrow { display: flex; align-items: center; gap: .7rem; font-size: .72rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; margin-block-end: 2rem; color: var(--muted-foreground); }
.accent-line { inline-size: 1.5rem; block-size: 2px; background: var(--portfolio-accent); flex-shrink: 0; }
.name { font-family: Georgia, 'Times New Roman', serif; font-size: clamp(3.2rem, 6.4vw, 5.5rem); line-height: 1.03; letter-spacing: -.055em; max-inline-size: 10ch; text-wrap: balance; }
.role { margin-block-start: 1.6rem; color: var(--portfolio-accent); font-size: 1rem; font-weight: 500; }
.intro-title { font-size: 1.4rem; font-weight: 500; letter-spacing: -.035em; margin-block-end: 1rem; text-wrap: balance; }
.intro-copy { font-size: 1rem; line-height: 1.85; color: var(--muted-foreground); white-space: pre-line; }
.github-link { margin-block-start: 1.6rem; min-block-size: 2.9rem; block-size: auto; padding: .75rem 1rem; gap: 1rem; white-space: normal; border-radius: .3rem; background: transparent; }
@media (max-width: 700px) { .hero { grid-template-columns: 1fr; } .name { max-inline-size: 12ch; } }
</style>
