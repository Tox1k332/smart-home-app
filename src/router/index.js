import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: () => import('../views/LoginView.vue'), meta: { requiresGuest: true } },
  { path: '/register', name: 'Register', component: () => import('../views/RegisterView.vue'), meta: { requiresGuest: true } },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('../views/ForgotPasswordView.vue'), meta: { requiresGuest: true } },
  { path: '/dashboard', name: 'Dashboard', component: () => import('../views/DashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/devices', name: 'Devices', component: () => import('../views/DevicesView.vue'), meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: () => import('../views/ProfileView.vue'), meta: { requiresAuth: true } },
  { path: '/status', name: 'Status', component: () => import('../views/StatusView.vue'), meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHashHistory('/smart-home-app/'),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  if (to.meta.requiresAuth && !isAuthenticated) next('/login')
  else if (to.meta.requiresGuest && isAuthenticated) next('/dashboard')
  else next()
})

export default router
