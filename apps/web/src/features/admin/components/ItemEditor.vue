<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DraftItem } from '@portfolio/contracts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import TranslationEditor from './TranslationEditor.vue';
const item = defineModel<DraftItem>({ required: true });
const emit = defineEmits<{ remove: []; move: [direction: number] }>();
defineProps<{ first: boolean; last: boolean }>();
const { t } = useI18n({ useScope: 'global' });
function common(field: keyof DraftItem, value: unknown) { item.value = { ...item.value, [field]: value }; }
const tagText = ref(item.value.tags.join(', '));
const parseTags = (value: string) => value.split(',').map(tag => tag.trim()).filter(Boolean);
function editTags(value: string | number) { tagText.value = String(value); common('tags', parseTags(tagText.value)); }
watch(() => item.value.tags, tags => {
  if (JSON.stringify(tags) !== JSON.stringify(parseTags(tagText.value))) tagText.value = tags.join(', ');
});
</script>
<template>
  <article class="item-editor">
    <header class="item-heading">
      <h2>{{ item.kind === 'profile' ? t('admin.profile') : item.translations.fr.text.title || t(`admin.kinds.${item.kind}`) }}</h2>
      <div v-if="item.kind !== 'profile'" class="admin-actions">
        <Button type="button" variant="ghost" class="admin-button" :disabled="first" :aria-label="t('admin.moveUp')" @click="emit('move', -1)">↑</Button>
        <Button type="button" variant="ghost" class="admin-button" :disabled="last" :aria-label="t('admin.moveDown')" @click="emit('move', 1)">↓</Button>
        <Button type="button" variant="outline" class="admin-button" @click="emit('remove')">{{ t('admin.remove') }}</Button>
      </div>
    </header>
    <div class="common-fields">
      <template v-if="item.kind === 'profile'">
        <div class="field"><Label for="profile-name-input">{{ t('admin.name') }} *</Label><Input id="profile-name-input" :model-value="item.name" required maxlength="200" @update:model-value="common('name', String($event))" /></div>
        <div class="field"><Label for="profile-github">{{ t('admin.github') }}</Label><Input id="profile-github" type="url" :model-value="item.githubUrl ?? ''" @update:model-value="common('githubUrl', $event || null)" /></div>
      </template>
      <template v-else>
        <div class="field"><Label :for="`${item.id}-kind`">{{ t('admin.kind') }}</Label><select :id="`${item.id}-kind`" :value="item.kind" @change="common('kind', ($event.target as HTMLSelectElement).value)"><option v-for="kind in ['skill','project','experience','education']" :key="kind" :value="kind">{{ t(`admin.kinds.${kind}`) }}</option></select></div>
        <div class="field"><Label :for="`${item.id}-url`">{{ t('admin.url') }}</Label><Input :id="`${item.id}-url`" type="url" :model-value="item.url ?? ''" @update:model-value="common('url', $event || null)" /></div>
        <div class="field"><Label :for="`${item.id}-tags`">{{ t('admin.tags') }}</Label><Input :id="`${item.id}-tags`" :model-value="tagText" @update:model-value="editTags" /></div>
        <div class="date-fields">
          <div class="field"><Label :for="`${item.id}-start`">{{ t('admin.startDate') }}</Label><Input :id="`${item.id}-start`" type="date" :model-value="item.startDate ?? ''" @update:model-value="common('startDate', $event || null)" /></div>
          <div class="field"><Label :for="`${item.id}-end`">{{ t('admin.endDate') }}</Label><Input :id="`${item.id}-end`" type="date" :min="item.startDate ?? undefined" :model-value="item.endDate ?? ''" @update:model-value="common('endDate', $event || null)" /></div>
        </div>
      </template>
    </div>
    <TranslationEditor v-model="item" />
  </article>
</template>
<style scoped>
.item-editor { padding: clamp(1.2rem, 3vw, 2rem); border: 1px solid var(--border); background: var(--card); border-radius: .5rem; }
.item-heading { display: flex; justify-content: space-between; flex-wrap: wrap; align-items: center; gap: 1rem; margin-block-end: 1.5rem; }
h2 { font-size: 1.3rem; font-weight: 600; letter-spacing: -.025em; }
.common-fields { display: grid; gap: 1.2rem; border-block-end: 1px solid var(--border); padding-block-end: 1.5rem; margin-block-end: 1.5rem; }
.date-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
@media (max-width: 500px) { .date-fields { grid-template-columns: 1fr; } }
</style>
