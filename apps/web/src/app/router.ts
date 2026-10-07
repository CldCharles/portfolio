import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/features/auth/store';
import { pinia } from './pinia';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('@/pages/CvPage.vue') },
    { path: '/admin/login', component: () => import('@/pages/admin/LoginPage.vue') },
    { path: '/admin', component: () => import('@/pages/admin/EditorPage.vue'), meta: { admin: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
});
router.beforeEach(async to => {
  if (!to.path.startsWith('/admin')) return;
  const auth = useAuthStore(pinia);
  try { await auth.check(); } catch { auth.expire(); }
  if (to.meta.admin && !auth.session?.authenticated) return '/admin/login';
  if (to.path === '/admin/login' && auth.session?.authenticated) return '/admin';
});
