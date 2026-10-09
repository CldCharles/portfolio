<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PublicCv } from '@portfolio/contracts';
import { groupSections } from '@/features/cv/lib/sections';
import CvHero from '@/features/cv/components/CvHero.vue';
import CvSection from '@/features/cv/components/CvSection.vue';
const props = defineProps<{ cv: PublicCv }>();
const { t } = useI18n({ useScope: 'global' });
const sections = computed(() => groupSections(props.cv.entries, key => t(key)));
</script>
<template>
  <div class="draft-preview" :lang="cv.locale">
    <CvHero :profile="cv.profile" heading-tag="h2" />
    <CvSection v-for="section in sections" :id="section.id" :key="section.id" :title="section.title" :entries="section.entries" />
  </div>
</template>
<style scoped>
.draft-preview { max-inline-size: 960px; margin-inline: auto; padding-inline: clamp(1.25rem, 5vw, 4rem); border: 1px solid var(--border); }
</style>
