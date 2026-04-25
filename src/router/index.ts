import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomePage.vue')
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('@/views/LibraryPage.vue')
    },
    {
      path: '/reader/:id',
      name: 'reader',
      component: () => import('@/views/ReaderPage.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfilePage.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsPage.vue')
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: () => import('@/views/WelcomePage.vue')
    },
    {
      path: '/agents',
      name: 'agents',
      component: () => import('@/views/AgentsPage.vue')
    }
  ]
})

export default router