<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
const props = defineProps<{ sections: { id: string; title: string }[] }>();
const { t } = useI18n({ useScope: 'global' });
const activeId = ref<string | null>(null);
let frame: number | null = null;
let mounted = false;
function updateActiveSection() {
  frame = null;
  const threshold = Math.min(window.innerHeight * .25, 160);
  let current: string | null = null;
  for (const section of props.sections) {
    const element = document.getElementById(section.id);
    if (element && element.getBoundingClientRect().top <= threshold) current = section.id;
  }
  activeId.value = current;
}
function scheduleUpdate() {
  if (mounted && frame === null) frame = window.requestAnimationFrame(updateActiveSection);
}
onMounted(() => {
  mounted = true;
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  scheduleUpdate();
});
watch(() => props.sections, scheduleUpdate, { flush: 'post' });
onUnmounted(() => {
  mounted = false;
  window.removeEventListener('scroll', scheduleUpdate);
  window.removeEventListener('resize', scheduleUpdate);
  if (frame !== null) window.cancelAnimationFrame(frame);
});
</script>

<template>
  <nav v-if="sections.length" class="cv-navigation" :aria-label="t('nav.label')">
    <a v-for="section in sections" :key="section.id" :href="`#${section.id}`"
      :aria-current="activeId === section.id ? 'location' : undefined">
      <span class="section-marker" aria-hidden="true"></span>{{ section.title }}
    </a>
  </nav>
</template>

<style scoped>
.cv-navigation { position: sticky; inset-block-start: 2rem; padding-block-start: 3rem; display: grid; gap: .25rem; }
.cv-navigation a { display: flex; gap: .75rem; align-items: center; min-block-size: 2.75rem; padding: .5rem .25rem; font-size: .85rem; line-height: 1.5; color: var(--muted-foreground); }
.section-marker { flex: 0 0 .3rem; inline-size: .3rem; block-size: .3rem; border-radius: 50%; background: transparent; }
.cv-navigation a:hover, .cv-navigation a[aria-current] { color: var(--portfolio-accent); }
.cv-navigation a[aria-current] { font-weight: 600; }
.cv-navigation a[aria-current] .section-marker { background: var(--portfolio-accent); }
@media (max-width: 900px) {
  .cv-navigation { position: static; display: flex; flex-wrap: wrap; gap: .25rem 1.25rem; padding-block: .75rem 0; }
  .cv-navigation a { padding-inline: 0; }
  .section-marker { display: none; }
  .cv-navigation a[aria-current] { text-decoration: underline; text-underline-offset: .35rem; }
}
@media print { .cv-navigation { display: none; } }
</style>
