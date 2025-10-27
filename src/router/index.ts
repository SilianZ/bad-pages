import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
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
    return { top: 0 }
  }
})

export default router
