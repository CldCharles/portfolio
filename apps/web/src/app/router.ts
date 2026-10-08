import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import { useAuthStore } from '@/features/auth/store';
import type { Pinia } from 'pinia';
import { pinia } from './pinia';

export function createPortfolioRouter(store: Pinia, server = false) {
const router = createRouter({
  history: server ? createMemoryHistory() : createWebHistory(),
  routes: [
    { path: '/', component: () => import('@/pages/CvPage.vue') },
    { path: '/privacy', component: () => import('@/pages/PrivacyPage.vue') },
    { path: '/admin/login', component: () => import('@/pages/admin/LoginPage.vue') },
    { path: '/admin', component: () => import('@/pages/admin/EditorPage.vue'), meta: { admin: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
});
router.beforeEach(async to => {
  if (server || !to.path.startsWith('/admin')) return;
  const auth = useAuthStore(store);
  try { await auth.check(); } catch { auth.expire(); }
  if (to.meta.admin && !auth.session?.authenticated) return '/admin/login';
  if (to.path === '/admin/login' && auth.session?.authenticated) return '/admin';
});

return router;
}
export const router = typeof window === 'undefined' ? undefined : createPortfolioRouter(pinia);
