import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/use/useAuth.ts'

const auth = useAuth()

export const routes = [
  {
    path: '/',
    name: 'home',
    redirect: 'login',
    meta: {},
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/views/ForbiddenView.vue'),
  },
  {
    path: '/visitors',
    name: 'visitors',
    component: () => import('@/views/VisitorsView.vue'),
    meta: { auth: true },
  },
  {
    path: '/customer-success',
    name: 'customer-success',
    component: () => import('@/views/CustomerSuccessView.vue'),
    meta: { auth: true },
  },
  {
    path: '/customer-success/companies',
    name: 'companies',
    component: () => import('@/views/CompaniesView.vue'),
    meta: { auth: true },
  },
  {
    path: '/customer-success/progression',
    name: 'progression',
    component: () => import('@/views/ProgressionView.vue'),
    meta: { auth: true },
  },
  {
    path: '/customer-success/year-development',
    name: 'year-development',
    component: () => import('@/views/YearDevelopmentView.vue'),
    meta: { auth: true },
  },
]
const router = createRouter({
  history: createWebHistory('/#/'),
  routes,
})

// Simple navigation guard – if no token is found, redirect to login
router.beforeEach(async (to, from, next) => {
  if (to.meta.auth) {
    let isTokenValid = auth.getAccessToken() === null
    if (isTokenValid) {
      next({ name: 'login' })
    }

    isTokenValid = await auth.isAuthenticated()
    if (isTokenValid) {
      next()
    } else {
      next({ name: 'login' })
    }
  } else {
    next()
  }
})

export default router
