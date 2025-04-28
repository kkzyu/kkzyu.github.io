import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/assets/views/HomeView.vue') },
  { path: '/cv', component: () => import('@/assets/views/CvView.vue') },
  { path: '/programs', component: () => import('@/assets/views/ProgramsView.vue') },
  { path: '/WordCloud', component: () => import('@/components/Programs/WordCloud.vue') },
  { path: '/GreedySnake', component: () => import('@/components/Programs/GreedySnake.vue') },
  {
    path: '/blog',
    name: 'Blog',
    beforeEnter() {
      window.open('https://kkzyu.github.io/blog/', '_blank')
      // 或者不新开标签页：
      // window.location.href = 'https://kkzyu.github.io/blog/'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router