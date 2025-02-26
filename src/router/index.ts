import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/use/auth.ts'

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
    path: '/customer-success',
    name: 'customer-success',
    component: () => import('@/views/CustomerSuccessView.vue'),
    meta: {
      auth: true,
    },
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
