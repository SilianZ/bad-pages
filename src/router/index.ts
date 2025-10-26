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
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
