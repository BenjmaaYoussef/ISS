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
    <div class="menu-container pa-4 pa-sm-6 pa-md-8">

      <!-- Not found state -->
      <div v-if="!venueId" class="not-found">
        <v-icon size="48" color="rgba(212,175,55,0.3)">mdi-silverware</v-icon>
        <p>Menu not found</p>
        <v-btn variant="outlined" color="#D4AF37" @click="$router.back()">Go Back</v-btn>
      </div>

      <template v-else>
        <!-- Welcome -->
        <div class="welcome-section mb-6 mb-sm-8">
          <div class="welcome-heading">{{ venueName }}</div>
          <div class="welcome-sub">
            <v-icon size="14" color="#D4AF37" class="mr-1">mdi-silverware-fork-knife</v-icon>
            {{ subLabel }}
            <span class="filtered-note ml-2 d-none d-sm-inline">— Items filtered for your location</span>
          </div>
        </div>

        <!-- Category Hero Images -->
        <MenuCategoryHero
          :categories="availableCategories"
          v-model="activeCategory"
          class="mb-6 mb-sm-10"
        />

        <!-- Decorative divider -->
        <SpotlyDivider :label="currentCategory?.label || ''" class="mb-8" />

        <!-- Menu Items -->
        <div v-if="filteredItems.length" class="menu-list">
          <MenuItemRow
            v-for="(item, i) in filteredItems"
            :key="item.id"
            :item="item"
            :anim-delay="`${i * 60}ms`"
          />
        </div>

        <div v-else class="menu-empty">
          <v-icon size="36" color="rgba(212,175,55,0.2)">mdi-silverware</v-icon>
          <p>No items in this category yet</p>
        </div>
      </template>
    </div>
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
      return { venueId: env.venueId, elementLabel: el.label, envName: env.name }
    }
  }
  // Fall back: treat as venueId
  const numId = parseInt(tableId)
  if (!isNaN(numId) && VENUE_LIST.find(v => v.id === numId)) {
    return { venueId: numId, elementLabel: null, envName: null }
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

// ── Items for this venue ───────────────────────────────────────────────────────
const venueItems = computed(() =>
  venueId.value != null
    ? MENU_ITEM_LIST.filter(m => m.venueId === venueId.value && m.available !== false)
    : [],
)

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
}
.menu-container {
  max-width: 960px;
  margin: 0 auto;
}

/* ── Welcome ── */
.welcome-heading {
  font-family: var(--font-heading);
  font-size: clamp(1.4rem, 5vw, 2.4rem);
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
}
.welcome-sub {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 0.84rem;
  color: #d4af37;
  margin-top: 8px;
  font-weight: 500;
  letter-spacing: 0.02em;
}
.filtered-note {
  color: #6b7a8d;
  font-style: italic;
  font-size: 0.78rem;
}

/* ── Menu list ── */
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── Empty / not found ── */
.menu-empty,
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 16px;
  gap: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.85rem;
  text-align: center;
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
