<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check, Clock, ExternalLink, SkipForward } from '@lucide/vue';
import type { LearningStatus } from '@portfolio/contracts';
import { Button } from '@/components/ui/button';
import type { Session } from '../program';
import { formatDay, formatTimestamp } from '../lib/format';
import { useLearningStore } from '../store';

const props = defineProps<{ session: Session; heading?: 'h2' | 'h3' }>();
const { t, te } = useI18n({ useScope: 'global' });
const store = useLearningStore();
const entry = computed(() => store.entry(props.session.id));
const rest = computed(() => props.session.type === 'repos');
const late = computed(() => !rest.value && entry.value.status === 'todo' && props.session.date < store.today);
const statusKey = computed(() => late.value ? 'late' : entry.value.status);
const busy = computed(() => store.saving.has(props.session.id));
const notesId = computed(() => `notes-${props.session.id}`);

// Notes are edited locally and saved explicitly, so typing never sends a request per keystroke.
const understood = shallowRef(''); const unclear = shallowRef(''); const link = shallowRef('');
const notice = shallowRef(false);
const failure = shallowRef('');
const failureKey = computed(() => te(`learning.errors.${failure.value}`) ? `learning.errors.${failure.value}` : 'learning.errors.UNKNOWN');
function reset() { understood.value = entry.value.understood; unclear.value = entry.value.unclear; link.value = entry.value.link ?? ''; }
watch(() => props.session.id, reset, { immediate: true });
const dirty = computed(() => understood.value !== entry.value.understood || unclear.value !== entry.value.unclear || link.value.trim() !== (entry.value.link ?? ''));
const hasNotes = computed(() => !!(entry.value.understood || entry.value.unclear || entry.value.link));

async function setStatus(status: LearningStatus) {
  notice.value = false;
  // Clicking the active status again puts the session back to "todo".
  failure.value = await store.save(props.session.id, { status: entry.value.status === status ? 'todo' : status }) ?? '';
}
async function saveNotes() {
  notice.value = false;
  failure.value = await store.save(props.session.id, { understood: understood.value, unclear: unclear.value, link: link.value.trim() || null }) ?? '';
  if (!failure.value) { reset(); notice.value = true; }
}
</script>

<template>
  <article class="session" :class="[`is-${statusKey}`, { rest }]" :aria-labelledby="`title-${session.id}`">
    <div class="session-meta">
      <span class="date">{{ formatDay(session.date) }}</span>
      <span class="type">{{ t(`learning.session.types.${session.type}`) }}</span>
      <span v-if="!rest" class="status">
        <Check v-if="statusKey === 'done'" :size="14" aria-hidden="true" />
        <SkipForward v-else-if="statusKey === 'skipped'" :size="14" aria-hidden="true" />
        <Clock v-else-if="statusKey === 'late'" :size="14" aria-hidden="true" />
        {{ t(`learning.session.status.${statusKey}`) }}
      </span>
    </div>
    <component :is="heading ?? 'h3'" :id="`title-${session.id}`" class="objective">{{ session.objective }}</component>
    <template v-if="!rest">
      <p v-if="session.exercise" class="exercise"><strong>{{ t('learning.session.exercise') }} :</strong> {{ session.exercise }}</p>
      <div v-if="session.resources.length" class="resources">
        <span class="label">{{ t('learning.session.resources') }}</span>
        <ul>
          <li v-for="resource in session.resources" :key="resource.url ?? resource.label">
            <a v-if="resource.url" :href="resource.url" target="_blank" rel="noopener noreferrer">{{ resource.label }}<ExternalLink :size="13" aria-hidden="true" /><span class="sr-only">{{ t('learning.session.newTab') }}</span></a>
            <span v-else>{{ resource.label }}</span>
          </li>
        </ul>
      </div>
      <div class="actions">
        <Button type="button" :variant="entry.status === 'done' ? 'default' : 'outline'" class="admin-button" :aria-pressed="entry.status === 'done'" :disabled="busy" @click="setStatus('done')"><Check :size="16" aria-hidden="true" />{{ t('learning.session.done') }}</Button>
        <Button type="button" :variant="entry.status === 'skipped' ? 'secondary' : 'ghost'" class="admin-button" :aria-pressed="entry.status === 'skipped'" :disabled="busy" @click="setStatus('skipped')"><SkipForward :size="16" aria-hidden="true" />{{ t('learning.session.skip') }}</Button>
        <span v-if="entry.status === 'done' && entry.doneAt" class="muted done-at">{{ t('learning.session.doneAt', { date: formatTimestamp(entry.doneAt) }) }}</span>
      </div>
      <details class="notes" :open="dirty || undefined">
        <summary>{{ t(hasNotes ? 'learning.session.notesFilled' : 'learning.session.notes') }}<span v-if="dirty" class="unsaved"> · {{ t('learning.session.unsavedNotes') }}</span></summary>
        <form @submit.prevent="saveNotes">
          <div class="field"><label :for="`${notesId}-understood`">{{ t('learning.session.understood') }}</label><textarea :id="`${notesId}-understood`" v-model="understood" rows="3" maxlength="5000" /></div>
          <div class="field"><label :for="`${notesId}-unclear`">{{ t('learning.session.unclear') }}</label><textarea :id="`${notesId}-unclear`" v-model="unclear" rows="3" maxlength="5000" /></div>
          <div class="field"><label :for="`${notesId}-link`">{{ t('learning.session.link') }}</label><input :id="`${notesId}-link`" v-model="link" type="url" inputmode="url" maxlength="500" :aria-describedby="`${notesId}-hint`" placeholder="https://"><span :id="`${notesId}-hint`" class="muted hint">{{ t('learning.session.linkHint') }}</span></div>
          <div class="actions"><Button type="submit" class="admin-button" :disabled="busy || !dirty">{{ t(busy ? 'learning.session.saving' : 'learning.session.saveNotes') }}</Button><span v-if="notice && !dirty" role="status" class="muted">{{ t('learning.session.saved') }}</span></div>
        </form>
      </details>
      <p v-if="failure && failure !== 'BUSY'" role="alert" class="error-message">{{ t(failureKey) }}</p>
    </template>
  </article>
</template>

<style scoped>
.session { display: grid; gap: .8rem; padding: 1.2rem; border: 1px solid var(--border); border-inline-start: 4px solid var(--border); border-radius: .4rem; background: var(--card); min-inline-size: 0; }
.session.is-done { border-inline-start-color: var(--portfolio-accent); }
.session.is-late { border-inline-start-color: #b04b3c; }
.session.is-skipped { border-inline-start-color: var(--muted-foreground); }
.session.rest { background: var(--muted); }
.session-meta { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem .8rem; font-size: .8rem; }
.date { display: inline-block; font-weight: 600; }
.date::first-letter { text-transform: uppercase; }
.type { padding: .15rem .5rem; border-radius: 1rem; background: var(--muted); color: var(--muted-foreground); }
.status { display: inline-flex; align-items: center; gap: .25rem; font-weight: 600; }
.is-done .status { color: var(--portfolio-accent); }
.is-late .status { color: #922f22; }
.is-skipped .status, .is-todo .status { color: var(--muted-foreground); }
.objective { margin: 0; font-family: var(--font-serif); font-size: 1.3rem; font-weight: 500; line-height: 1.3; }
.exercise { margin: 0; line-height: 1.6; }
.resources { display: grid; gap: .3rem; }
.label { font-size: .75rem; font-weight: 600; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: .06em; }
.resources ul { display: flex; flex-wrap: wrap; gap: .2rem 1rem; margin: 0; padding: 0; list-style: none; }
.resources a { display: inline-flex; align-items: center; gap: .3rem; min-block-size: 2.75rem; color: var(--portfolio-accent); text-decoration: underline; text-underline-offset: .2rem; overflow-wrap: anywhere; }
.resources span { display: inline-flex; align-items: center; min-block-size: 2.75rem; }
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.done-at { font-size: .8rem; }
.notes summary { display: flex; align-items: center; min-block-size: 2.75rem; cursor: pointer; font-size: .9rem; font-weight: 600; }
.notes form { display: grid; gap: 1rem; padding-block: .5rem; }
.notes input { border: 1px solid var(--input); border-radius: .35rem; padding: .6rem .75rem; background: var(--background); font: inherit; }
.unsaved { font-weight: 400; color: #922f22; }
.hint { font-size: .8rem; line-height: 1.4; }
.sr-only { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
