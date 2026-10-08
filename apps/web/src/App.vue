<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Locale } from '@portfolio/contracts';
import { useCvStore } from '@/features/cv/stores/cv';
import { useSiteConfig } from '@/features/legal/config';
import { updateMetadata } from '@/features/legal/metadata';
import SiteFooter from '@/features/legal/SiteFooter.vue';
const route = useRoute();
const { t, locale } = useI18n();
const site = useSiteConfig();
const cv = useCvStore();
if (typeof document !== 'undefined') watch([() => route.path, locale, () => cv.cv], () => {
  const privacy = route.path === '/privacy';
  const publicCv = route.path === '/' ? cv.cv : null;
  const title = privacy ? t('legal.title') : route.path.startsWith('/admin') ? t('admin.privateArea') : `${publicCv?.profile.name ?? site.editorName} — ${publicCv?.profile.text.title ?? 'Portfolio'}`;
  const description = privacy ? t('legal.description') : publicCv?.profile.text.description ?? t('app.description');
  updateMetadata(route.path, locale.value as Locale, site, publicCv, title, description);
}, { immediate: true });
</script>

<template>
  <RouterView />
  <SiteFooter />
</template>
