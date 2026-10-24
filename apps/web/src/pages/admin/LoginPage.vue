<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import LoginForm from '@/features/auth/LoginForm.vue';
import LanguageSwitcher from '@/features/cv/components/LanguageSwitcher.vue';
import ThemeToggle from '@/features/theme/ThemeToggle.vue';
const router = useRouter();
const route = useRoute();
// Only known admin routes: the query parameter must never become an open redirect.
const target = () => route.query.redirect === '/admin/apprentissage' ? '/admin/apprentissage' : '/admin';
const { t } = useI18n({ useScope: 'global' });
</script>
<template>
  <main class="admin-shell">
    <header class="admin-header"><RouterLink to="/">← {{ t('admin.backToSite') }}</RouterLink><div class="admin-actions"><ThemeToggle /><LanguageSwitcher /></div></header>
    <LoginForm @authenticated="router.replace(target())" />
  </main>
</template>
