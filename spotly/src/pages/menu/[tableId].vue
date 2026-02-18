<template>
  <!-- top bar -->
  <AppNavbarVenue
    venue-name="Sunset Beach Club"
    venue-sub-label="Table #12 — Terrace"
    :compact="true"
    :show-powered-by="true"
    :show-default-actions="false"
  >
    <template #actions>
      <v-btn icon variant="text" class="icon-btn" title="Go back" size="small">
        <v-icon color="#6b7a8d" size="20">mdi-arrow-left</v-icon>
      </v-btn>
      <v-btn
        icon
        variant="text"
        class="icon-btn"
        title="Save menu"
        size="small"
      >
        <v-icon color="#6b7a8d" size="20">mdi-bookmark-outline</v-icon>
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
      <!-- Welcome -->
      <div class="welcome-section mb-6 mb-sm-8">
        <div class="welcome-heading">Welcome to Sunset Beach Club</div>
        <div class="welcome-sub">
          <v-icon size="14" color="#D4AF37" class="mr-1">mdi-map-marker</v-icon>
          Terrace Exclusive Menu
          <span class="filtered-note ml-2 d-none d-sm-inline"
            >— Items filtered for your location</span
          >
        </div>
      </div>

      <!-- Category Hero Images -->
      <MenuCategoryHero
        :categories="categories"
        v-model="activeCategory"
        class="mb-6 mb-sm-10"
      />

      <!-- Decorative divider -->
      <SpotlyDivider :label="currentCategory.label" class="mb-8" />

      <!-- Menu Items -->
      <div class="menu-list">
        <MenuItemRow
          v-for="(item, i) in filteredItems"
          :key="item.id"
          :item="item"
          :anim-delay="`${i * 60}ms`"
        />
      </div>
    </div>
  </v-main>

  <!-- Snackbar -->
  <SpotlySnackbar :snackbar="snackbar" location="bottom center" />
</template>

<script setup>
import { ref, computed } from "vue";
import { useSnackbar } from "@/composables/useSnackbar";
import AppNavbarVenue from "@/components/layout/AppNavbarVenue.vue";
import MenuCategoryHero from "@/components/menu/MenuCategoryHero.vue";
import MenuItemRow from "@/components/menu/MenuItemRow.vue";
import SpotlyDivider from "@/components/ui/SpotlyDivider.vue";
import SpotlySnackbar from "@/components/feedback/SpotlySnackbar.vue";

const { snackbar, notify } = useSnackbar();

// ── Categories ────────────────────────────────────────────────────────────────
const categories = [
  {
    key: "cocktail",
    label: "Cocktails",
    icon: "mdi-glass-cocktail",
    gradient: "linear-gradient(135deg,#1a0a2e,#3d1a5e)",
    count: 6,
  },
  {
    key: "food",
    label: "Food",
    icon: "mdi-silverware-variant",
    gradient: "linear-gradient(135deg,#0d1f0a,#1e4a14)",
    count: 8,
  },
  {
    key: "dessert",
    label: "Desserts",
    icon: "mdi-ice-cream",
    gradient: "linear-gradient(135deg,#1f0a0a,#4a1414)",
    count: 5,
  },
];
const activeCategory = ref("food");
const currentCategory = computed(() =>
  categories.find((c) => c.key === activeCategory.value),
);

// ── Menu Items ────────────────────────────────────────────────────────────────
const menuItems = ref([
  // Food
  {
    id: 1,
    category: "food",
    name: "Bruschetta",
    price: 12,
    desc: "Grilled bread, tomatoes, fresh basil, olive oil",
    tags: ["Vegetarian"],
  },
  {
    id: 2,
    category: "food",
    name: "Calamari Fritti",
    price: 18,
    desc: "Crispy fried squid, lemon aioli, herbs",
    tags: ["Seafood"],
  },
  {
    id: 3,
    category: "food",
    name: "Terrace Mezze Platter",
    price: 28,
    desc: "Hummus, tapenade, pita, seasonal crudités",
    tags: ["Vegetarian", "Shareable"],
  },
  {
    id: 4,
    category: "food",
    name: "Sea Bass Fillet",
    price: 42,
    desc: "Pan-seared, citrus butter sauce, steamed vegetables",
    tags: ["Seafood", "Chef's Pick"],
  },
  {
    id: 5,
    category: "food",
    name: "Wagyu Beef Burger",
    price: 38,
    desc: "Wagyu patty, truffle mayo, aged cheddar, brioche",
    tags: ["Bestseller"],
  },
  // Cocktails
  {
    id: 6,
    category: "cocktail",
    name: "Terrace Spritz",
    price: 16,
    desc: "Aperol, prosecco, fresh orange, soda",
    tags: ["Signature"],
  },
  {
    id: 7,
    category: "cocktail",
    name: "Gold Rush",
    price: 18,
    desc: "Bourbon, honey syrup, lemon juice",
    tags: ["Signature"],
  },
  {
    id: 8,
    category: "cocktail",
    name: "Mojito Classique",
    price: 14,
    desc: "White rum, lime, mint, soda",
    tags: [],
  },
  {
    id: 9,
    category: "cocktail",
    name: "Negroni",
    price: 17,
    desc: "Gin, Campari, sweet vermouth",
    tags: ["Classic"],
  },
  {
    id: 10,
    category: "cocktail",
    name: "Virgin Sunrise",
    price: 12,
    desc: "Orange juice, grenadine, soda",
    tags: ["Non-alcoholic"],
  },
  // Desserts
  {
    id: 11,
    category: "dessert",
    name: "Crème Brûlée",
    price: 14,
    desc: "Vanilla custard, caramelized sugar crust",
    tags: ["Classic"],
  },
  {
    id: 12,
    category: "dessert",
    name: "Chocolate Fondant",
    price: 16,
    desc: "Dark chocolate, molten center, vanilla ice cream",
    tags: ["Chef's Pick"],
  },
  {
    id: 13,
    category: "dessert",
    name: "Baklava Selection",
    price: 12,
    desc: "Honey, pistachio, filo pastry — 4 pieces",
    tags: ["Local"],
  },
]);

const filteredItems = computed(() =>
  menuItems.value.filter((i) => i.category === activeCategory.value),
);

// ── Call Waiter ───────────────────────────────────────────────────────────────
const callWaiter = () =>
  notify(
    "Waiter has been notified — they'll be right with you!",
    "#D4AF37",
    "mdi-room-service",
  );

// ── Snackbar ──────────────────────────────────────────────────────────────────
// snackbar managed by useSnackbar composable
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap");

.spotly-app {
  --gold: #d4af37;
  --midnight: #0a0e14;
  --surface: #111720;
  --surface2: #161d28;
  --green: #2ebb57;
  --rose: #c71585;
  --muted: #6b7a8d;
  background: var(--midnight) !important;
  font-family: "Inter", sans-serif;
}

/* ── Navbar ── */
.spotly-navbar {
  background: rgba(10, 14, 20, 0.97) !important;
  border-bottom: 1px solid rgba(212, 175, 55, 0.18) !important;
  backdrop-filter: blur(14px);
}
.navbar-inner {
  height: 100%;
}
.venue-name {
  font-family: "Playfair Display", serif;
  font-size: 1rem;
  font-weight: 700;
  color: #d4af37;
  line-height: 1.2;
  white-space: nowrap;
}
.table-label {
  font-size: 0.62rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 1px;
  white-space: nowrap;
}
.powered-by {
  border-left: 1px solid rgba(212, 175, 55, 0.2);
  padding-left: 10px;
}
.powered-text {
  font-family: "Inter", sans-serif;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.55);
}

.icon-btn {
  opacity: 0.6;
  transition: opacity 0.2s !important;
}
.icon-btn:hover {
  opacity: 1;
}

.call-waiter-btn {
  background: transparent !important;
  border: 1.5px solid var(--gold) !important;
  color: var(--gold) !important;
  font-weight: 600;
  font-size: 0.8rem;
  border-radius: 24px !important;
  letter-spacing: 0.06em;
  transition:
    background 0.2s,
    box-shadow 0.2s !important;
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

/* ── Main ── */
.spotly-main {
  background: var(--midnight) !important;
}
.menu-container {
  max-width: 960px;
  margin: 0 auto;
}

/* ── Welcome ── */
.welcome-heading {
  font-family: "Playfair Display", serif;
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
  color: var(--gold);
  margin-top: 8px;
  font-weight: 500;
  letter-spacing: 0.02em;
}
.filtered-note {
  color: var(--muted);
  font-style: italic;
  font-size: 0.78rem;
}

/* ── Hero Grid ── */
.hero-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
@media (max-width: 480px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .hero-card {
    min-height: unset !important;
    padding: 16px 18px !important;
    display: flex !important;
    align-items: center !important;
    gap: 14px;
    border-radius: 12px !important;
  }
  .hero-icon {
    margin-bottom: 0 !important;
    flex-shrink: 0;
  }
  .hero-label {
    font-size: 0.95rem !important;
  }
  .hero-count {
    margin-top: 2px !important;
  }
}
@media (min-width: 481px) and (max-width: 680px) {
  .hero-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .hero-card {
    padding: 18px 14px 14px !important;
    min-height: 110px !important;
  }
  .hero-label {
    font-size: 0.9rem !important;
  }
}
.hero-card {
  position: relative;
  border-radius: 16px;
  padding: 28px 24px 22px;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition:
    transform 0.25s,
    border-color 0.25s,
    box-shadow 0.25s;
  min-height: 140px;
}
.hero-card:hover {
  transform: translateY(-4px);
  border-color: rgba(212, 175, 55, 0.3);
}
.hero-card--active {
  border-color: rgba(212, 175, 55, 0.5) !important;
  box-shadow: 0 0 24px rgba(212, 175, 55, 0.12);
}
.hero-bg {
  position: absolute;
  inset: 0;
  opacity: 0.85;
  transition: opacity 0.25s;
}
.hero-card:hover .hero-bg {
  opacity: 1;
}
.hero-icon {
  position: relative;
  z-index: 1;
  margin-bottom: 12px;
}
.hero-label {
  position: relative;
  z-index: 1;
  font-family: "Playfair Display", serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.01em;
}
.hero-count {
  position: relative;
  z-index: 1;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.hero-active-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--gold), transparent);
}

/* ── Section Divider ── */
.section-divider {
  display: flex;
  align-items: center;
  gap: 16px;
}
.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(212, 175, 55, 0.2);
}
.divider-text {
  font-family: "Cormorant Garamond", serif;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--gold);
  white-space: nowrap;
}

/* ── Menu List ── */
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.menu-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  animation: slideIn 0.35s ease both;
  transition: background 0.15s;
  border-radius: 8px;
  gap: 12px;
}
.menu-item:hover {
  background: rgba(212, 175, 55, 0.03);
}

.item-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.item-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--gold);
  margin-top: 8px;
  flex-shrink: 0;
  opacity: 0.6;
}
.item-info {
  min-width: 0;
  flex: 1;
}
.item-name {
  font-family: "Playfair Display", serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.3;
}
.item-desc {
  font-size: 0.76rem;
  color: var(--muted);
  margin-top: 3px;
  line-height: 1.5;
  /* Allow wrapping on mobile */
  word-break: break-word;
}

.item-tags {
  flex-wrap: wrap;
}
.item-tag {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 7px;
  border-radius: 10px;
  background: rgba(212, 175, 55, 0.1);
  color: var(--gold);
  border: 1px solid rgba(212, 175, 55, 0.2);
  white-space: nowrap;
}

.item-right {
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
  padding-left: 8px;
  padding-top: 2px;
}
.item-price {
  font-family: "Playfair Display", serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gold);
  white-space: nowrap;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
