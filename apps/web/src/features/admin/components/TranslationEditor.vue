<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DraftItem, Locale } from '@portfolio/contracts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { localeLabels, supportedLocales } from '@/i18n';
const item = defineModel<DraftItem>({ required: true });
const { t } = useI18n({ useScope: 'global' });
const language = shallowRef<Locale>('fr');
const translation = computed(() => item.value.translations[language.value]);
const source = computed(() => item.value.translations.fr.text);
const current = computed(() => language.value === 'fr' || !!translation.value?.reviewedSource && JSON.stringify(translation.value.reviewedSource) === JSON.stringify(source.value));
function edit(field: 'title' | 'subtitle' | 'description', value: string | number) {
  const updated = JSON.parse(JSON.stringify(item.value)) as DraftItem;
  updated.translations[language.value]!.text[field] = String(value);
  updated.translations[language.value]!.reviewedSource = null;
  item.value = updated;
}
function createTranslation() {
  item.value = { ...item.value, translations: { ...item.value.translations, [language.value]: { text: { title: '', subtitle: '', description: '' }, reviewedSource: null } } };
}
function approve() {
  if (!translation.value || !translation.value.text.title.trim()) return;
  item.value = { ...item.value, translations: { ...item.value.translations, [language.value]: { ...translation.value, reviewedSource: { ...source.value } } } };
}
function remove() { item.value = { ...item.value, translations: { ...item.value.translations, [language.value]: null } }; }
</script>
<template>
  <div class="translation-editor">
    <div class="translation-tabs" role="group" :aria-label="t('admin.contentLanguage')">
      <Button v-for="lang in supportedLocales" :key="lang" type="button" class="admin-button" :variant="language === lang ? 'default' : 'outline'" :aria-pressed="language === lang" :lang="lang" @click="language = lang">{{ localeLabels[lang] }}</Button>
    </div>
    <div class="translation-status"><span class="status-dot" :class="{ current }" />{{ t(language === 'fr' ? 'admin.source' : !translation ? 'admin.missing' : current ? 'admin.current' : 'admin.needsReview') }}</div>
    <template v-if="translation">
      <details v-if="language !== 'fr'" class="source-reference"><summary>{{ t('admin.viewSource') }}</summary><div lang="fr"><strong>{{ source.title }}</strong><p>{{ source.subtitle }}</p><p>{{ source.description }}</p></div></details>
      <div class="field"><Label :for="`${item.id}-title-${language}`">{{ t('admin.title') }} *</Label><Input :id="`${item.id}-title-${language}`" :lang="language" :model-value="translation.text.title" maxlength="200" required @update:model-value="edit('title', $event)" /></div>
      <div class="field"><Label :for="`${item.id}-subtitle-${language}`">{{ t('admin.subtitle') }}</Label><Input :id="`${item.id}-subtitle-${language}`" :lang="language" :model-value="translation.text.subtitle" maxlength="300" @update:model-value="edit('subtitle', $event)" /></div>
      <div class="field"><Label :for="`${item.id}-description-${language}`">{{ t('admin.description') }}</Label><textarea :id="`${item.id}-description-${language}`" :lang="language" :value="translation.text.description" maxlength="5000" rows="5" @input="edit('description', ($event.target as HTMLTextAreaElement).value)" /></div>
      <div v-if="language !== 'fr'" class="admin-actions"><Button type="button" class="admin-button" variant="outline" :disabled="current || !translation.text.title.trim()" @click="approve">{{ t('admin.approveTranslation') }}</Button><Button type="button" variant="ghost" class="admin-button" @click="remove">{{ t('admin.removeTranslation') }}</Button></div>
    </template>
    <Button v-else type="button" class="admin-button" variant="outline" @click="createTranslation">{{ t('admin.addTranslation') }}</Button>
  </div>
</template>
<style scoped>
.translation-editor { display: grid; gap: 1.25rem; }
.translation-tabs, .translation-status { display: flex; align-items: center; flex-wrap: wrap; gap: .6rem; }
.translation-status { font-size: .8rem; color: var(--muted-foreground); }
.status-dot { inline-size: .5rem; block-size: .5rem; border-radius: 50%; background: #a26a1a; }
.status-dot.current { background: var(--portfolio-accent); }
.source-reference { padding: 1rem; background: var(--muted); border-radius: .4rem; font-size: .9rem; }
.source-reference summary { cursor: pointer; min-block-size: 2rem; }
.source-reference p { white-space: pre-line; margin-block-start: .75rem; }
</style>
