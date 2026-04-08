/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

// ── Public routes (no auth required) ──────────────────────────────────────────
const PUBLIC_ROUTES = ['/', '/landing', '/auth', '/home', '/seed']

function isPublic(path) {
  if (PUBLIC_ROUTES.includes(path)) return true
  if (path.startsWith('/venue/') || path.startsWith('/menu/')) return true
  return false
}

router.beforeEach((to) => {
  // Allow the catch-all 404 page through regardless of auth state
  if (to.matched.some(r => r.path === '/:all(.*)')) return true

  let session = null
  try {
    session = JSON.parse(localStorage.getItem('spotly_session') || 'null')
  } catch {
    session = null
  }

  // No session — redirect gated routes to /auth
  if (!session) {
    if (!isPublic(to.path)) return '/auth'
    return true
  }

  const role = session.role

  // Role-based access control
  if (to.path.startsWith('/admin/') && role !== 'admin') {
    return role === 'staff' ? '/staff/dashboard' : '/home'
  }
  if (to.path.startsWith('/staff/') && role !== 'staff' && role !== 'admin') {
    return '/home'
  }
  if (to.path.startsWith('/client/') && role === 'staff') {
    return '/staff/dashboard'
  }
  if (to.path.startsWith('/client/') && role === 'admin') {
    return '/admin/dashboard'
  }

  return true
})

export default router
