import { createRouter as Silian_createRouter, createWebHistory as Silian_createWebHistory } from 'vue-router';
const Silian_router = Silian_createRouter({
    history: Silian_createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: () => import('../views/HomeView.vue') // @ts-ignore
        },
        {
            path: '/test',
            name: 'Test',
            component: () => import('../views/TestView.vue') // @ts-ignore
        },
        {
            path: '/insights',
            name: 'Article',
            component: () => import('../views/ArticleView.vue') // @ts-ignore
        },
        {
            path: '/insights/communication-bias',
            name: 'InsightOne',
            // @ts-ignore Lazy-loaded Vue SFC
            component: () => import('../views/InsightOneView.vue')
        },
        {
            path: '/insights/habit-design',
            name: 'InsightTwo',
            // @ts-ignore Lazy-loaded Vue SFC
            component: () => import('../views/InsightTwoView.vue')
        }
    ],
    scrollBehavior() {
        return { top: 0 };
    }
});
export default Silian_router;
