<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { DraftDocument, EntryKind, Locale } from '@portfolio/contracts';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/features/admin/store';
import { useAuthStore } from '@/features/auth/store';
import LoginForm from '@/features/auth/LoginForm.vue';
import ItemEditor from '@/features/admin/components/ItemEditor.vue';
import LinkedInImport from '@/features/linkedin/LinkedInImport.vue';
import DraftPreview from '@/features/admin/components/DraftPreview.vue';
import LanguageSwitcher from '@/features/cv/components/LanguageSwitcher.vue';
const { t, te, locale } = useI18n({ useScope: 'global' });
const editor = useEditorStore();
const auth = useAuthStore();
const router = useRouter();
const selectedId = shallowRef('profile');
const addingKind = shallowRef<EntryKind>('experience');
const importMode = shallowRef(false);
const previewMode = shallowRef(false);
const confirmingPublish = shallowRef(false);
const selectedIndex = computed(() => editor.document?.items.findIndex(item => item.id === selectedId.value) ?? -1);
const selectedItem = computed({
  get: () => editor.document?.items[selectedIndex.value],
  set: value => { if (value && editor.document) editor.document.items[selectedIndex.value] = value; },
});
const errorKey = computed(() => te(`admin.errors.${editor.error}`) ? `admin.errors.${editor.error}` : 'admin.errors.UNKNOWN');
onMounted(() => { if (!editor.document) void editor.load(); });
function beforeUnload(event: BeforeUnloadEvent) { if (editor.dirty) { event.preventDefault(); event.returnValue = ''; } }
window.addEventListener('beforeunload', beforeUnload);
onUnmounted(() => window.removeEventListener('beforeunload', beforeUnload));
onBeforeRouteLeave(() => {
  if (!editor.dirty) return true;
  if (!window.confirm(t('admin.discardConfirm'))) return false;
  editor.clear(); return true;
});
function add() { editor.addEntry(addingKind.value); selectedId.value = editor.document!.items.at(-1)!.id; }
function remove() {
  if (!editor.document || selectedItem.value?.kind === 'profile') return;
  editor.document.items.splice(selectedIndex.value, 1); selectedId.value = 'profile';
}
function move(direction: number) {
  if (!editor.document) return;
  const index = selectedIndex.value;
  const target = index + direction;
  if (target < 1 || target >= editor.document.items.length) return;
  const [item] = editor.document.items.splice(index, 1);
  editor.document.items.splice(target, 0, item!);
}
async function reload() { if (editor.dirty && !window.confirm(t('admin.discardConfirm'))) return; await editor.load(); selectedId.value = 'profile'; }
function imported(document: DraftDocument) {
  editor.document = document; editor.preview = null; editor.previewRevision = 0;
  editor.notice = ''; editor.error = ''; selectedId.value = 'profile'; importMode.value = false;
}
async function preview() { await editor.showPreview(locale.value as Locale); if (editor.preview) previewMode.value = true; }
async function publish() { await editor.publish(); confirmingPublish.value = false; if (!editor.error) previewMode.value = false; }
async function logout() {
  if (editor.dirty && !window.confirm(t('admin.discardConfirm'))) return;
  try { await auth.logout(); editor.clear(); await router.replace('/admin/login'); }
  catch { editor.error = 'UNKNOWN'; }
}
</script>
<template>
  <main class="admin-shell">
    <header class="admin-header"><RouterLink to="/">← {{ t('admin.backToSite') }}</RouterLink><div class="admin-actions"><LanguageSwitcher /><Button v-if="auth.session?.authenticated" type="button" variant="outline" class="admin-button" :disabled="editor.busy" @click="logout">{{ t('admin.logout') }}</Button></div></header>
    <template v-if="auth.session?.authenticated">
      <div class="editor-heading"><div><p class="admin-eyebrow">{{ t('admin.privateArea') }}</p><h1>{{ t('admin.editorTitle') }}</h1><p class="muted">{{ t('admin.editorIntro') }}</p></div><span class="draft-badge">{{ t(editor.dirty ? 'admin.unsaved' : editor.revision === editor.publishedRevision ? 'admin.inSync' : 'admin.draftSaved') }}</span></div>
      <p v-if="editor.error" role="alert" class="error-message">{{ t(errorKey) }}</p>
      <p v-if="editor.notice && !editor.dirty" role="status" class="notice">{{ t(`admin.${editor.notice}`) }}</p>
      <p v-if="editor.busy" role="status" class="muted">{{ t('admin.working') }}</p>
      <div v-if="!editor.document && !editor.busy" class="admin-actions"><Button @click="editor.load">{{ t('admin.reload') }}</Button></div>
      <template v-if="editor.document">
        <LinkedInImport v-if="importMode" :document="editor.document" :disabled="editor.busy" @apply="imported" @cancel="importMode = false" />
        <template v-else>
        <div class="editor-toolbar">
          <div class="admin-actions"><Button type="button" variant="outline" class="admin-button" :disabled="editor.busy" @click="previewMode = false; confirmingPublish = false">{{ t('admin.edit') }}</Button><Button type="button" variant="outline" class="admin-button" :disabled="editor.dirty || editor.busy" @click="preview">{{ t('admin.preview') }}</Button></div>
          <div class="admin-actions"><Button type="button" variant="outline" class="admin-button" :disabled="editor.busy" @click="importMode = true; previewMode = false; confirmingPublish = false">{{ t('linkedin.open') }}</Button><Button type="button" variant="ghost" class="admin-button" :disabled="editor.busy" @click="reload">{{ t('admin.reload') }}</Button><Button type="submit" form="cv-editor" class="admin-button" :disabled="!editor.dirty || editor.busy">{{ t('admin.save') }}</Button></div>
        </div>
        <p v-if="editor.dirty" class="muted toolbar-help">{{ t('admin.saveBeforePreview') }}</p>
        <template v-if="previewMode && editor.preview">
          <section class="publication-panel" :aria-label="t('admin.publication')">
            <p>{{ t('admin.previewIntro') }}</p>
            <p v-if="editor.preview.locale !== locale" class="notice">{{ t('admin.refreshPreview') }}</p>
            <p v-if="confirmingPublish">{{ t('admin.publishConfirm') }}</p>
            <div class="admin-actions"><Button type="button" class="admin-button" :disabled="editor.busy || editor.dirty || editor.previewRevision !== editor.revision" @click="confirmingPublish ? publish() : confirmingPublish = true">{{ t(confirmingPublish ? 'admin.confirmPublish' : 'admin.publish') }}</Button><Button v-if="confirmingPublish" type="button" variant="outline" class="admin-button" :disabled="editor.busy" @click="confirmingPublish = false">{{ t('admin.cancel') }}</Button></div>
          </section>
          <DraftPreview :cv="editor.preview" />
        </template>
        <div v-else class="editor-grid">
          <aside class="editor-sidebar">
            <nav :aria-label="t('admin.sections')"><button v-for="item in editor.document.items" :key="item.id" type="button" :class="{ selected: selectedId === item.id }" :aria-current="selectedId === item.id ? 'true' : undefined" @click="selectedId = item.id"><span class="section-kind">{{ t(item.kind === 'profile' ? 'admin.profile' : `admin.kinds.${item.kind}`) }}</span><span>{{ item.translations.fr.text.title || t('admin.untitled') }}</span></button></nav>
            <div class="add-entry"><label for="add-kind">{{ t('admin.addSection') }}</label><select id="add-kind" v-model="addingKind"><option v-for="kind in ['skill','project','experience','education']" :key="kind" :value="kind">{{ t(`admin.kinds.${kind}`) }}</option></select><Button type="button" variant="outline" class="admin-button" :disabled="editor.busy || editor.document.items.length >= 100" @click="add">+ {{ t('admin.add') }}</Button></div>
          </aside>
          <form id="cv-editor" @submit.prevent="editor.save">
            <fieldset :disabled="editor.busy"><ItemEditor v-if="selectedItem" :key="selectedId" v-model="selectedItem" :first="selectedIndex <= 1" :last="selectedIndex === editor.document.items.length - 1" @remove="remove" @move="move" /></fieldset>
          </form>
        </div>
        </template>
      </template>
    </template>
    <template v-else><p role="alert" class="notice">{{ t('admin.sessionExpired') }}</p><LoginForm @authenticated="editor.error = ''" /></template>
  </main>
</template>
<style scoped>
.editor-heading { display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1.5rem; margin-block: 2.5rem; }
h1 { font-size: clamp(2rem, 4vw, 2.8rem); line-height: 1.2; letter-spacing: -.045em; margin-block: .5rem 1rem; }
.draft-badge { padding: .55rem .8rem; background: var(--muted); border-radius: .3rem; font-size: .8rem; }
.editor-toolbar { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; padding-block: 1rem; border-block: 1px solid var(--border); margin-block: 1.5rem; }
.toolbar-help { margin-block-end: 1.5rem; }
.editor-grid { display: grid; grid-template-columns: minmax(12rem, 17rem) minmax(0, 1fr); gap: 2rem; }
.editor-sidebar nav { display: grid; gap: .4rem; }
.editor-sidebar nav button { text-align: start; display: grid; gap: .3rem; padding: .9rem 1rem; border-radius: .35rem; border: 1px solid transparent; overflow-wrap: anywhere; }
.editor-sidebar nav button:hover { background: var(--muted); }
.editor-sidebar nav button.selected { border-color: var(--border); background: var(--card); }
.section-kind { font-size: .72rem; color: var(--muted-foreground); }
.add-entry { display: grid; gap: .8rem; border-block-start: 1px solid var(--border); margin-block-start: 1.5rem; padding-block-start: 1.5rem; font-size: .85rem; }
.publication-panel { display: grid; gap: 1rem; padding: 1.5rem; background: var(--muted); margin-block-end: 1.5rem; border-radius: .4rem; }
fieldset { min-inline-size: 0; }
@media (max-width: 750px) { .editor-grid { grid-template-columns: 1fr; } .editor-sidebar nav { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 400px) { .editor-sidebar nav { grid-template-columns: 1fr; } }
</style>
