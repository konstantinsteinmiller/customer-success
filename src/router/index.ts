import { createRouter, createWebHistory } from 'vue-router'

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
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('access_token')) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
