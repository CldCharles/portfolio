<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { Moon, Sun } from '@lucide/vue';
import { chooseTheme, currentTheme } from './theme';
// The server does not know the system setting: CSS picks the icon, and the pressed
// state is only set once mounted, so the server-rendered markup hydrates unchanged.
const { t } = useI18n({ useScope: 'global' });
const dark = shallowRef<boolean>();
let media: MediaQueryList | undefined;
const sync = () => { dark.value = currentTheme() === 'dark'; };
onMounted(() => {
  sync();
  media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', sync);
});
onBeforeUnmount(() => media?.removeEventListener('change', sync));
function toggle() {
  chooseTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  sync();
}
</script>

<template>
  <button type="button" class="theme-toggle" :aria-label="t('nav.darkTheme')" :aria-pressed="dark" :title="t('nav.darkTheme')" @click="toggle">
    <Moon class="moon" :size="17" aria-hidden="true" /><Sun class="sun" :size="17" aria-hidden="true" />
  </button>
</template>

<style scoped>
.theme-toggle { display: inline-grid; place-items: center; inline-size: 2.75rem; block-size: 2.75rem; padding: 0; border: 0; border-radius: .3rem; background: none; color: var(--portfolio-ink-mute); cursor: pointer; }
.theme-toggle:hover { background: var(--portfolio-accent-soft); color: var(--portfolio-accent); }
@media print { .theme-toggle { display: none; } }
</style>

<style>
/* Unscoped: the icon depends on <html>, which a scoped selector cannot reach. */
.theme-toggle .sun, [data-theme=dark] .theme-toggle .moon { display: none; }
[data-theme=dark] .theme-toggle .sun { display: block; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme=light]) .theme-toggle .moon { display: none; }
  :root:not([data-theme=light]) .theme-toggle .sun { display: block; }
}
</style>
