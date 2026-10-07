<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { EntryKind, PublicCv } from '@portfolio/contracts';
import CvHero from '@/features/cv/components/CvHero.vue';
import CvSection from '@/features/cv/components/CvSection.vue';
const props = defineProps<{ cv: PublicCv }>();
const { t } = useI18n({ useScope: 'global' });
const sections = computed(() => ([
  { id: 'skills', kind: 'skill', title: t('cv.skills'), introduction: t('cv.skillsIntro') },
  { id: 'projects', kind: 'project', title: t('cv.projects'), introduction: t('cv.projectsIntro') },
  { id: 'experience', kind: 'experience', title: t('cv.experience') },
  { id: 'education', kind: 'education', title: t('cv.education') },
] as { id: string; kind: EntryKind; title: string; introduction?: string }[])
  .map(section => ({ ...section, entries: props.cv.entries.filter(entry => entry.kind === section.kind) }))
  .filter(section => section.entries.length));
</script>
<template>
  <div class="draft-preview" :lang="cv.locale">
    <CvHero :profile="cv.profile" />
    <CvSection v-for="(section, index) in sections" :key="section.id" v-bind="section" :number="String(index + 1).padStart(2, '0')" />
  </div>
</template>
<style scoped>
.draft-preview { max-inline-size: 1160px; margin-inline: auto; padding-inline: clamp(1.25rem, 5vw, 4rem); border: 1px solid var(--border); }
</style>
