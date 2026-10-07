import { createApp } from 'vue';
import { router } from '@/app/router';
import { pinia } from '@/app/pinia';
import '@/styles/main.css';
import App from './App.vue';
import { i18n } from './i18n';

createApp(App).use(pinia).use(i18n).use(router).mount('#app');
