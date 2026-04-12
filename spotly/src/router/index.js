/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { getEnvironmentsByVenue } from '@/datamodel/Environment.js'
import { getVenueByAdminEmail } from '@/datamodel/Venue.js'
import { isVenueStaff } from '@/datamodel/VenueStaff.js'

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
const PUBLIC_ROUTES = new Set(['/', '/landing', '/auth', '/home', '/seed'])

function isPublic (path) {
  if (PUBLIC_ROUTES.has(path)) {
    return true
  }
  if (path.startsWith('/venue/') || path.startsWith('/menu/')) {
    return true
  }
  return false
}

router.beforeEach(to => {
  // Allow the catch-all 404 page through regardless of auth state
  if (to.matched.some(r => r.path === '/:all(.*)')) {
    return true
  }

  let session = null
  try {
    session = JSON.parse(localStorage.getItem('spotly_session') || 'null')
  } catch {
    session = null
  }

  // No session — redirect gated routes to /auth
  if (!session) {
    if (!isPublic(to.path)) {
      return '/auth'
    }
    return true
  }

  const isOwner = !!getVenueByAdminEmail(session.email)
  const isStaff = isVenueStaff(session.email)

  // Relationship-based access control
  if (to.path.startsWith('/admin/') && !isOwner) {
    return isStaff ? '/staff/dashboard' : '/home'
  }
  if (to.path.startsWith('/staff/') && !isStaff && !isOwner) {
    return '/home'
  }

  // ── Admin onboarding gate ─────────────────────────────────────────────────
  if (isOwner && to.path.startsWith('/admin/') && to.path !== '/admin/onboarding') {
    const venue = getVenueByAdminEmail(session.email)
    if (!venue || !venue.name?.trim()) {
      return '/admin/onboarding'
    }
    if (getEnvironmentsByVenue(venue.id).length === 0) {
      return '/admin/onboarding'
    }
  }

  return true
})

export default router
