<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { ExternalLink } from '@lucide/vue';
import { program } from '../program';
import { getAllResources } from '../lib/progress';

const { t } = useI18n({ useScope: 'global' });
const resources = getAllResources(program);
const phase = shallowRef<number | 'all' | 'bonus'>('all');
const visible = computed(() => resources.filter(resource => phase.value === 'all' || (phase.value === 'bonus' ? !resource.phases.length : resource.phases.includes(phase.value))));
</script>

<template>
  <section class="library" aria-labelledby="library-heading">
    <h2 id="library-heading" tabindex="-1">{{ t('learning.resources.heading') }}</h2>
    <div class="field filter">
      <label for="library-phase">{{ t('learning.resources.filter') }}</label>
      <select id="library-phase" v-model="phase">
        <option value="all">{{ t('learning.resources.all') }}</option>
        <option v-for="item in program.phases" :key="item.id" :value="item.id">{{ t('learning.phase', { n: item.id, title: item.title }) }}</option>
        <option value="bonus">{{ t('learning.resources.bonus') }}</option>
      </select>
    </div>
    <p class="muted" role="status">{{ t('learning.resources.count', visible.length) }}</p>
    <ul>
      <li v-for="resource in visible" :key="resource.url ?? resource.title">
        <a v-if="resource.url" :href="resource.url" target="_blank" rel="noopener noreferrer">{{ resource.title }}<ExternalLink :size="13" aria-hidden="true" /><span class="sr-only">{{ t('learning.session.newTab') }}</span></a>
        <span v-else class="plain">{{ resource.title }}</span>
        <span v-if="resource.note" class="note">{{ resource.note }}</span>
        <span class="phases">{{ resource.phases.length ? resource.phases.map(id => `P${id}`).join(' · ') : t('learning.resources.bonus') }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.library { display: grid; gap: 1rem; }
h2 { margin: 0; font-size: 1.5rem; }
.filter { max-inline-size: 22rem; }
.muted { margin: 0; font-size: .85rem; }
ul { display: grid; gap: 0; margin: 0; padding: 0; list-style: none; border-block-start: 1px solid var(--border); }
li { display: grid; gap: .15rem; padding-block: .5rem; border-block-end: 1px solid var(--border); }
a, .plain { display: inline-flex; align-items: center; gap: .3rem; min-block-size: 2.75rem; overflow-wrap: anywhere; }
a { color: var(--portfolio-accent); text-decoration: underline; text-underline-offset: .2rem; justify-self: start; }
.note { font-size: .88rem; line-height: 1.5; }
.phases { font-size: .75rem; color: var(--muted-foreground); }
.sr-only { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
