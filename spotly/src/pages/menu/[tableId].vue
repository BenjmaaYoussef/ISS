<template>
  <!-- top bar -->
  <AppNavbarVenue
    :venue-name="venueName"
    :venue-sub-label="subLabel"
    :compact="true"
    :show-powered-by="true"
    :show-default-actions="false"
  >
    <template #actions>
      <v-btn icon variant="text" class="icon-btn" title="Go back" size="small" @click="$router.back()">
        <v-icon color="#6b7a8d" size="20">mdi-arrow-left</v-icon>
      </v-btn>
      <!-- Icon-only on mobile -->
      <v-btn
        icon
        class="call-waiter-btn call-waiter-icon d-flex d-sm-none"
        size="small"
        @click="callWaiter"
        title="Call Waiter"
      >
        <v-icon size="18">mdi-room-service</v-icon>
      </v-btn>
      <!-- Full button on sm+ -->
      <v-btn class="call-waiter-btn d-none d-sm-flex" @click="callWaiter">
        <v-icon start size="15">mdi-room-service</v-icon>
        Call Waiter
      </v-btn>
    </template>
  </AppNavbarVenue>

  <!-- ── Main ── -->
  <v-main class="spotly-main">

    <!-- Not found state -->
    <div v-if="!venueId" class="not-found">
      <div class="not-found-glow" />
      <v-icon size="64" color="rgba(212,175,55,0.2)">mdi-silverware</v-icon>
      <p class="not-found-title">Menu not found</p>
      <p class="not-found-sub">We couldn't locate a menu for this table.</p>
      <v-btn variant="outlined" color="#D4AF37" rounded="xl" @click="$router.back()">Go Back</v-btn>
    </div>

    <template v-else>
      <!-- ── Hero banner ── -->
      <div class="menu-hero">
        <div class="hero-bg-overlay" />
        <div class="hero-content">
          <div class="hero-ornament">
            <span class="ornament-line" />
            <v-icon size="16" color="rgba(212,175,55,0.6)">mdi-silverware-fork-knife</v-icon>
            <span class="ornament-line" />
          </div>
          <h1 class="hero-title">{{ venueName }}</h1>
          <div class="hero-badge">
            <v-icon size="12" color="#D4AF37">mdi-map-marker-outline</v-icon>
            <span>{{ subLabel }}</span>
          </div>
          <p v-if="subLabel !== 'Full Menu'" class="hero-note">Menu curated for your location</p>
        </div>
        <!-- Bottom fade -->
        <div class="hero-fade" />
      </div>

      <!-- ── Sticky category nav ── -->
      <div class="category-sticky">
        <div class="category-sticky-inner">
          <MenuCategoryHero
            :categories="availableCategories"
            v-model="activeCategory"
          />
        </div>
      </div>

      <!-- ── Items ── -->
      <div class="menu-body">
        <!-- Section heading -->
        <div class="section-heading">
          <span class="section-ornament" />
          <span class="section-title">{{ currentCategory?.label }}</span>
          <span class="section-ornament" />
        </div>

        <div v-if="filteredItems.length" class="menu-grid">
          <MenuItemRow
            v-for="(item, i) in filteredItems"
            :key="item.id"
            :item="item"
            :anim-delay="`${i * 55}ms`"
          />
        </div>

        <div v-else class="menu-empty">
          <div class="empty-icon-ring">
            <v-icon size="36" color="rgba(212,175,55,0.35)">mdi-silverware</v-icon>
          </div>
          <p class="empty-title">Nothing here yet</p>
          <p class="empty-sub">This category has no items for your location.</p>
        </div>
      </div>
    </template>

  </v-main>

  <!-- Snackbar -->
  <SpotlySnackbar :snackbar="snackbar" location="bottom center" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSnackbar } from '@/composables/useSnackbar'
import { MENU_ITEM_LIST } from '@/datamodel/MenuItem.js'
import { ENVIRONMENT_LIST } from '@/datamodel/Environment.js'
import { VENUE_LIST } from '@/datamodel/Venue.js'

const route = useRoute()
const { snackbar, notify } = useSnackbar()

// ── Resolve venueId from tableId param ────────────────────────────────────────
// The param may be:
//   a) An element id (e.g. "e1", "et1") — look up environment
//   b) A venueId directly (e.g. "1") — used by venue/[id].vue "Explore Menu" button
const tableId = route.params.tableId

const resolved = computed(() => {
  // Try element id lookup first
  for (const env of ENVIRONMENT_LIST) {
    const el = env.elements.find(e => e.id === tableId)
    if (el) {
      return { venueId: env.venueId, elementLabel: el.label, envName: env.name, envId: env.id }
    }
  }
  // Fall back: treat as venueId
  const numId = parseInt(tableId)
  if (!isNaN(numId) && VENUE_LIST.find(v => v.id === numId)) {
    return { venueId: numId, elementLabel: null, envName: null, envId: null }
  }
  return null
})

const venueId = computed(() => resolved.value?.venueId ?? null)

const venueName = computed(() => {
  if (!venueId.value) return 'Menu'
  return VENUE_LIST.find(v => v.id === venueId.value)?.name || 'Venue Menu'
})

const subLabel = computed(() => {
  const r = resolved.value
  if (!r) return ''
  if (r.elementLabel && r.envName) return `${r.elementLabel} — ${r.envName}`
  return 'Full Menu'
})

// ── Categories (canonical) ────────────────────────────────────────────────────
const ALL_CATEGORIES = [
  {
    key: 'starters',
    label: 'Starters',
    icon: 'mdi-food-fork-drink',
    gradient: 'linear-gradient(135deg,#0d1f0a,#1e4a14)',
  },
  {
    key: 'mains',
    label: 'Mains',
    icon: 'mdi-silverware-variant',
    gradient: 'linear-gradient(135deg,#1a1208,#3d2a10)',
  },
  {
    key: 'desserts',
    label: 'Desserts',
    icon: 'mdi-ice-cream',
    gradient: 'linear-gradient(135deg,#1f0a0a,#4a1414)',
  },
  {
    key: 'drinks',
    label: 'Drinks',
    icon: 'mdi-glass-cocktail',
    gradient: 'linear-gradient(135deg,#1a0a2e,#3d1a5e)',
  },
]

// ── Items for this venue / environment ────────────────────────────────────────
const envId = computed(() => resolved.value?.envId ?? null)

const venueItems = computed(() => {
  if (venueId.value == null) return []
  const eid = envId.value
  return MENU_ITEM_LIST.filter(m => {
    if (m.venueId !== venueId.value || m.available === false) return false
    // Full menu (no element context): show everything for this venue
    if (eid == null) return true
    // Element context: show venue-wide items (empty array) + items scoped to this env
    const ids = m.environmentIds ?? []
    return ids.length === 0 || ids.includes(eid)
  })
})

// Only show categories that have at least one item
const availableCategories = computed(() => {
  const keys = new Set(venueItems.value.map(i => i.category))
  return ALL_CATEGORIES
    .filter(c => keys.has(c.key))
    .map(c => ({ ...c, count: venueItems.value.filter(i => i.category === c.key).length }))
})

const activeCategory = ref(availableCategories.value[0]?.key || 'starters')

const currentCategory = computed(() =>
  ALL_CATEGORIES.find(c => c.key === activeCategory.value),
)

const filteredItems = computed(() =>
  venueItems.value.filter(i => i.category === activeCategory.value),
)

// ── Call Waiter ───────────────────────────────────────────────────────────────
const callWaiter = () =>
  notify("Waiter has been notified — they'll be right with you!", '#D4AF37', 'mdi-room-service')
</script>

<style scoped>
.spotly-main {
  background: #0a0e14 !important;
  min-height: 100vh;
}

/* ── Not found ── */
.not-found {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  gap: 14px;
  text-align: center;
  padding: 32px;
  overflow: hidden;
}
.not-found-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.06) 0%, transparent 70%);
  pointer-events: none;
}
.not-found-title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  color: #fff;
  font-weight: 600;
  margin: 0;
}
.not-found-sub {
  font-size: 0.85rem;
  color: #6b7a8d;
  margin: 0 0 8px;
}

/* ── Hero banner ── */
.menu-hero {
  position: relative;
  background: linear-gradient(180deg, #0f1520 0%, #0a0e14 100%);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  padding: 40px 20px 44px;
  text-align: center;
  overflow: hidden;
}
@media (min-width: 600px) {
  .menu-hero {
    padding: 64px 32px 56px;
  }
}
.hero-bg-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 80% at 50% 0%, rgba(212, 175, 55, 0.05) 0%, transparent 70%),
    radial-gradient(ellipse 40% 40% at 20% 100%, rgba(212, 175, 55, 0.03) 0%, transparent 60%);
  pointer-events: none;
}
.hero-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to bottom, transparent, #0a0e14);
  pointer-events: none;
}
.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.hero-ornament {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ornament-line {
  display: block;
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.4));
}
.ornament-line:last-child {
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.4), transparent);
}
.hero-title {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 6vw, 3.2rem);
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
  letter-spacing: -0.01em;
  margin: 0;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 50px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  background: rgba(212, 175, 55, 0.07);
  font-size: 0.8rem;
  color: #d4af37;
  font-weight: 500;
  font-family: var(--font-body);
  letter-spacing: 0.04em;
}
.hero-note {
  font-size: 0.78rem;
  color: #6b7a8d;
  font-style: italic;
  margin: 0;
  font-family: var(--font-body);
}

/* ── Sticky category nav ── */
.category-sticky {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(10, 14, 20, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 14px 0;
}
.category-sticky-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ── Menu body ── */
.menu-body {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 20px 80px;
}

/* Section heading */
.section-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}
.section-title {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(212, 175, 55, 0.8);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
}
.section-ornament {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.2), transparent);
}
.section-ornament:last-child {
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2));
}

/* Card grid */
.menu-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 600px) {
  .menu-grid {
    gap: 16px;
  }
}
@media (min-width: 680px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ── Empty state ── */
.menu-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 16px;
  gap: 14px;
  text-align: center;
}
.empty-icon-ring {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 1px solid rgba(212, 175, 55, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.04);
  box-shadow: 0 0 40px rgba(212, 175, 55, 0.06);
}
.empty-title {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  font-weight: 600;
}
.empty-sub {
  font-size: 0.8rem;
  color: #6b7a8d;
  margin: 0;
  font-family: var(--font-body);
}

/* ── Navbar icon button ── */
.icon-btn {
  opacity: 0.6;
  transition: opacity 0.2s !important;
}
.icon-btn:hover {
  opacity: 1;
}

/* ── Call waiter button ── */
.call-waiter-btn {
  background: transparent !important;
  border: 1.5px solid #d4af37 !important;
  color: #d4af37 !important;
  font-weight: 600;
  font-size: 0.8rem;
  border-radius: 24px !important;
  letter-spacing: 0.06em;
  transition: background 0.2s, box-shadow 0.2s !important;
}
.call-waiter-icon {
  border-radius: 50% !important;
  width: 36px !important;
  height: 36px !important;
  min-width: unset !important;
}
.call-waiter-btn:hover {
  background: rgba(212, 175, 55, 0.1) !important;
  box-shadow: 0 0 16px rgba(212, 175, 55, 0.25);
}
</style>
