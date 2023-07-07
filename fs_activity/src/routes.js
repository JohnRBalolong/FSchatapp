import { createRouter, createWebHistory } from 'vue-router';
import index from './components/index.vue';
import Dashboard from './components/Dashboard.vue';
import { requireAuth } from './auth.js';


const routes = [
    { path: '/', component: index, name: 'index' },
    { path: '/dashboard', component: Dashboard, name: 'dashboard', beforeEnter: requireAuth },
    // { path: '/dashboard', component: Dashboard, name: 'Dashboard', beforeEnter: requireAuth },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;