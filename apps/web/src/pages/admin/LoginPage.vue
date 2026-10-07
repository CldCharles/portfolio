<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import LoginForm from '@/features/auth/LoginForm.vue';
import LanguageSwitcher from '@/features/cv/components/LanguageSwitcher.vue';
const router = useRouter();
const { t } = useI18n({ useScope: 'global' });
</script>
<template>
  <main class="admin-shell">
    <header class="admin-header"><RouterLink to="/">← {{ t('admin.backToSite') }}</RouterLink><LanguageSwitcher /></header>
    <LoginForm @authenticated="router.replace('/admin')" />
  </main>
</template>
