<script setup lang="ts">
import { computed } from 'vue';
import { ArrowUpRight, Code, Languages, Mail, MapPin } from '@lucide/vue';
import { splitIntroduction } from '../lib/presentation';
import { useI18n } from 'vue-i18n';
import type { PublicCv } from '@portfolio/contracts';
import { Button } from '@/components/ui/button';
import { useSiteConfig } from '@/features/legal/config';
import CvPdfExport from './CvPdfExport.vue';
const props = defineProps<{
  profile: PublicCv['profile']; languages?: { title: string; locale: string }[];
  /** CV locale; the admin preview may differ from the interface language. */
  cvLocale?: string; exportable?: boolean; headingTag?: 'h1' | 'h2';
}>();
const { t, locale } = useI18n({ useScope: 'global' });
const site = useSiteConfig();
// Optional local portrait; no placeholder or external image request.
const portraits = import.meta.glob<string>('/src/assets/portrait.{webp,jpg,png}', { eager: true, query: '?url', import: 'default' });
const portraitUrl = portraits['/src/assets/portrait.webp'] ?? portraits['/src/assets/portrait.jpg'] ?? portraits['/src/assets/portrait.png'];
const introduction = computed(() => splitIntroduction(props.profile.text.description));
// Region names come from the browser/Node locale data, so no translation is stored.
const country = computed(() => props.profile.countryCode
  ? new Intl.DisplayNames([props.cvLocale ?? locale.value], { type: 'region' }).of(props.profile.countryCode) ?? null
  : null);
</script>

<template>
  <section class="hero" aria-labelledby="profile-name">
    <div class="hero-heading" :class="{ 'has-portrait': portraitUrl }">
      <div class="hero-identity">
        <component :is="headingTag ?? 'h1'" id="profile-name" class="name">{{ profile.name }}</component>
        <p class="role" :lang="profile.text.locale">{{ profile.text.title }}</p>
      </div>
      <img v-if="portraitUrl" :src="portraitUrl" alt="" class="portrait" width="152" height="152" />
    </div>
    <p v-if="profile.text.fallback" class="fallback-note">{{ t('cv.fallback') }}</p>
    <div class="hero-intro">
      <p class="intro-copy" :lang="profile.text.locale">{{ introduction.lead }}</p>
      <details v-if="introduction.rest" class="intro-details">
        <summary>{{ t('cv.moreAbout') }}</summary>
        <p class="intro-copy" :lang="profile.text.locale">{{ introduction.rest }}</p>
      </details>
    </div>
    <ul v-if="country || profile.text.subtitle || languages?.length" class="facts" :aria-label="t('cv.atAGlance')">
      <li v-if="country"><MapPin :size="16" aria-hidden="true" /><span class="sr-only">{{ t('cv.location') }} : </span>{{ country }}</li>
      <li v-if="profile.text.subtitle"><Code :size="16" aria-hidden="true" /><span class="sr-only">{{ t('cv.stack') }} : </span><span :lang="profile.text.locale">{{ profile.text.subtitle }}</span></li>
      <li v-if="languages?.length"><Languages :size="16" aria-hidden="true" /><span class="sr-only">{{ t('cv.spokenLanguages') }} : </span>
        <!-- Same separator as the technology line; each name keeps its own language. -->
        <span><template v-for="(language, index) in languages" :key="index"><template v-if="index"> · </template><span :lang="language.locale">{{ language.title }}</span></template></span>
      </li>
    </ul>
    <div class="hero-actions">
      <CvPdfExport v-if="exportable" />
      <Button v-if="site.contactEmail" as="a" :href="`mailto:${site.contactEmail}`" variant="outline" class="contact-link">
        <Mail :size="16" aria-hidden="true" />{{ t('cv.contact') }}
      </Button>
      <Button v-if="profile.githubUrl" as="a" :href="profile.githubUrl" variant="ghost" class="github-link">
        {{ t('cv.github') }} <ArrowUpRight :size="16" aria-hidden="true" />
      </Button>
    </div>
  </section>
</template>

<style scoped>
.hero { padding-block: 3.5rem 3rem; border-block-end: 1px solid var(--border); }
.hero-heading { display: grid; grid-template-columns: minmax(0, 1fr); align-items: start; gap: 1rem 2rem; }
.hero-heading.has-portrait { grid-template-columns: minmax(0, 1fr) auto; }
.name { font-family: var(--font-serif); font-size: 4rem; font-weight: 500; line-height: 1.02; letter-spacing: -.025em; text-wrap: balance; overflow-wrap: anywhere; }
.role { margin-block-start: .875rem; color: var(--portfolio-accent); font-size: 1.1875rem; font-weight: 600; line-height: 1.45; letter-spacing: -.005em; }
.portrait { display: block; inline-size: 152px; block-size: 152px; border-radius: 1.25rem; object-fit: cover; box-shadow: 0 0 0 1px rgb(28 42 48 / 8%), 0 12px 32px -16px rgb(28 42 48 / 35%); }
.hero-intro { margin-block-start: 1.375rem; max-inline-size: 62ch; }
.intro-copy { font-size: 1.0625rem; line-height: 1.7; color: var(--muted-foreground); white-space: pre-line; }
.intro-details { margin-block-start: .25rem; }
.intro-details summary { color: var(--portfolio-accent); cursor: pointer; font-size: .875rem; font-weight: 500; padding-block: .5rem; min-block-size: 2.75rem; }
.intro-details[open] .intro-copy { margin-block: .5rem 1rem; }
.facts { display: flex; flex-wrap: wrap; gap: .625rem 1.75rem; margin-block-start: 1.5rem; font-size: .875rem; list-style: none; }
.facts li { display: flex; align-items: center; gap: .5rem; }
.facts svg { flex: none; color: var(--portfolio-accent); }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .625rem; margin-block-start: 2rem; }
.contact-link, .github-link { min-block-size: 2.75rem; block-size: auto; gap: .5rem; padding: .5rem 1.125rem; border-radius: .625rem; font-weight: 600; white-space: normal; }
.contact-link { color: var(--portfolio-accent); background: var(--card); border-color: var(--portfolio-accent-line); }
.contact-link:hover { color: var(--portfolio-accent); background: var(--card); border-color: var(--portfolio-accent); }
.github-link { padding-inline: .625rem; color: var(--muted-foreground); background: transparent; }
.github-link:hover { color: var(--portfolio-accent); background: transparent; }
summary:focus-visible { outline: 2px solid var(--portfolio-accent); outline-offset: 3px; }
@media (min-width: 641px) and (max-width: 900px) { .name { font-size: 3.25rem; } .portrait { inline-size: 120px; block-size: 120px; } }
@media (max-width: 640px) {
  .hero { padding-block: 1.75rem 2rem; }
  .hero-heading { gap: 1rem; }
  .name { font-size: 2.375rem; line-height: 1.06; }
  .role { font-size: 1rem; margin-block-start: .625rem; }
  .portrait { inline-size: 76px; block-size: 76px; border-radius: .875rem; }
  .hero-intro { margin-block-start: 1rem; }
  .intro-copy { font-size: 1rem; line-height: 1.6; }
  .facts { flex-direction: column; gap: .5rem; margin-block-start: 1.25rem; }
  .hero-actions { margin-block-start: 1.375rem; }
}
@media (max-width: 360px) { .name { font-size: 2rem; } .portrait { inline-size: 64px; block-size: 64px; } }
@media print { .hero-actions { display: none; } }
</style>
