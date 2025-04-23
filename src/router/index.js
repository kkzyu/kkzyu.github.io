import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/assets/views/HomeView.vue') },
  { path: '/cv', component: () => import('@/assets/views/CvView.vue') },
  { path: '/programs', component: () => import('@/assets/views/ProgramsView.vue') },
  { path: '/WordCloud', component: () => import('@/components/Programs/WordCloud.vue') },
  { path: '/GreedySnake', component: () => import('@/components/Programs/GreedySnake.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router