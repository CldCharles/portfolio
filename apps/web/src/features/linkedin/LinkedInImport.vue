<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DraftDocument, Locale } from '@portfolio/contracts';
import { Button } from '@/components/ui/button';
import { MAX_FILE_BYTES, ImportError, applyChoices, chooseTarget, createChoices, parseLinkedIn, type ImportChoice, type ImportKind } from './import';
const props = defineProps<{ document: DraftDocument; disabled: boolean }>();
const emit = defineEmits<{ apply: [document: DraftDocument]; cancel: [] }>();
const { t } = useI18n();
const kind = ref<ImportKind>('experience');
const language = ref<Locale>('fr');
const choices = ref<ImportChoice[]>([]);
const error = ref('');
const reading = ref(false);
const fileInput = ref<HTMLInputElement>();
let readVersion = 0;
onBeforeUnmount(() => { readVersion++; });
const selectedCount = computed(() => choices.value.filter(choice => choice.selected).length);
function reset() {
  readVersion++; reading.value = false; choices.value = []; error.value = '';
  if (fileInput.value) fileInput.value.value = '';
}
async function readFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  const version = ++readVersion;
  choices.value = []; error.value = ''; reading.value = false;
  if (!file) return;
  if (file.size > MAX_FILE_BYTES) { error.value = 'tooLarge'; return; }
  reading.value = true;
  try {
    const text = await file.text();
    if (version !== readVersion) return;
    choices.value = createChoices(parseLinkedIn(text, kind.value), props.document, language.value);
  } catch (reason) { if (version === readVersion) error.value = reason instanceof ImportError ? reason.code : 'invalidCsv'; }
  finally { if (version === readVersion) reading.value = false; }
}
function apply() {
  error.value = '';
  try { emit('apply', applyChoices(props.document, choices.value, language.value)); }
  catch (reason) { error.value = reason instanceof ImportError ? reason.code : 'invalidCsv'; }
}
function targetChanged(choice: ImportChoice, event: Event) {
  chooseTarget(choice, (event.target as HTMLSelectElement).value, props.document, language.value);
}
function existing(choice: ImportChoice) { return props.document.items.find(item => item.id === choice.target); }
</script>
<template>
  <section class="import-panel" aria-labelledby="import-title">
    <h2 id="import-title">{{ t('linkedin.title') }}</h2>
    <p>{{ t('linkedin.intro') }} <a href="https://www.linkedin.com/help/linkedin/answer/a1339364" target="_blank" rel="noopener noreferrer">{{ t('linkedin.exportHelp') }} ↗</a></p>
    <p class="muted">{{ t('linkedin.privacy') }}</p>
    <form @submit.prevent="apply">
      <fieldset :disabled="disabled || reading">
        <div class="import-settings">
          <label>{{ t('linkedin.fileKind') }}<select v-model="kind" @change="reset"><option v-for="value in ['profile','experience','education','skill']" :key="value" :value="value">{{ t(`linkedin.files.${value}`) }}</option></select></label>
          <label>{{ t('linkedin.language') }}<select v-model="language" @change="reset"><option value="fr">Français</option><option value="en">English</option><option value="ko">한국어</option></select></label>
          <label>{{ t('linkedin.file') }}<input ref="fileInput" type="file" accept=".csv,text/csv" @change="readFile" /></label>
        </div>
        <p class="muted">{{ t('linkedin.limits') }}</p>
        <p v-if="language !== 'fr'" class="notice">{{ t('linkedin.frenchRequired') }}</p>
        <p v-if="reading" role="status">{{ t('linkedin.reading') }}</p>
        <p v-if="error" role="alert" class="error-message">{{ t(`linkedin.errors.${error}`) }}</p>
        <p v-if="choices.length">{{ t('linkedin.reviewIntro') }}</p>
        <article v-for="(choice, index) in choices" :key="index" class="import-row">
          <label class="import-check"><input v-model="choice.selected" type="checkbox" />{{ choice.row.text.title }} · {{ choice.row.text.subtitle || t('admin.kinds.skill') }}</label>
          <label>{{ t('linkedin.destination') }}<select :value="choice.target" @change="targetChanged(choice, $event)"><option value="" disabled>{{ t('linkedin.choose') }}</option><option v-if="choice.row.kind !== 'profile'" value="new">{{ t('linkedin.newEntry') }}</option><option v-for="item in document.items.filter(item => item.kind === choice.row.kind)" :key="item.id" :value="item.id">{{ item.translations.fr.text.title }} · {{ item.translations.fr.text.subtitle }}</option></select></label>
          <details><summary>{{ t('linkedin.compare') }}</summary>
            <div class="comparison">
              <div><h3>{{ t('linkedin.before') }}</h3><template v-if="existing(choice)"><p v-if="choice.row.kind === 'profile'">{{ existing(choice)!.name }}</p><template v-for="field in ['title','subtitle','description'] as const" :key="field"><strong>{{ t(`admin.${field}`) }}</strong><p class="import-text">{{ existing(choice)!.translations[language]?.text[field] || '—' }}</p></template></template><p v-else>{{ t('linkedin.newEntry') }}</p></div>
              <div><h3>{{ t('linkedin.imported') }} · {{ language.toUpperCase() }}</h3><p v-if="choice.row.name">{{ choice.row.name }}</p><template v-for="field in ['title','subtitle','description'] as const" :key="field"><strong>{{ t(`admin.${field}`) }}</strong><p class="import-text">{{ choice.row.text[field] || '—' }}</p></template></div>
            </div>
          </details>
          <p v-if="choice.row.warnings.length" class="notice">{{ t('linkedin.dates') }} {{ choice.row.warnings[1] }}</p>
          <fieldset :disabled="!choice.selected" class="french-fields">
            <legend>{{ t('linkedin.frenchVersion') }}</legend>
            <label>{{ t('admin.title') }}<input v-model="choice.french.title" :required="choice.selected" maxlength="200" /></label>
            <label>{{ t('admin.subtitle') }}<input v-model="choice.french.subtitle" maxlength="300" /></label>
            <label>{{ t('admin.description') }}<textarea v-model="choice.french.description" maxlength="5000" rows="4" /></label>
          </fieldset>
        </article>
        <p v-if="choices.length" class="muted">{{ t('linkedin.preserved') }}</p>
        <div class="admin-actions"><Button type="submit" class="admin-button" :disabled="!selectedCount">{{ t('linkedin.apply', { count: selectedCount }) }}</Button><Button type="button" variant="outline" class="admin-button" @click="emit('cancel')">{{ t('admin.cancel') }}</Button></div>
      </fieldset>
    </form>
  </section>
</template>
<style scoped>
.import-panel { display: grid; gap: 1rem; margin-block: 2rem; }
h2 { font-size: 1.7rem; } h3 { font-weight: 600; margin-block-end: .8rem; }
a { text-decoration: underline; }
fieldset { min-inline-size: 0; display: grid; gap: 1rem; }
.import-settings, .comparison { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
label { display: grid; gap: .5rem; font-size: .9rem; }
input, select, textarea { width: 100%; min-width: 0; }
.import-row { border: 1px solid var(--border); border-radius: .4rem; padding: 1.2rem; display: grid; gap: 1rem; }
.import-check { display: flex; align-items: start; gap: .6rem; overflow-wrap: anywhere; }
.import-check input { width: 1.1rem; height: 1.1rem; flex-shrink: 0; margin-block-start: .2rem; }
.comparison { margin-block-start: 1rem; }
.import-text { white-space: pre-wrap; overflow-wrap: anywhere; margin-block: .3rem 1rem; }
.french-fields legend { margin-block-end: .8rem; font-weight: 600; }
summary { cursor: pointer; } .admin-actions { flex-wrap: wrap; }
@media(max-width: 650px) { .import-settings, .comparison { grid-template-columns: 1fr; } }
</style>
