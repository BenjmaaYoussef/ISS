<template>
  <!-- ── Top Navigation ── -->
  <AppNavbarSpotly
    active-link="menu"
    :nav-links="adminNavLinks"
    @nav="handleNav"
  />

  <!-- ── Main Content ── -->
  <v-main class="spotly-main">
    <div class="menu-page-container">

      <!-- ══ Page Header ══ -->
      <div class="page-header">
        <div>
          <div class="page-eyebrow">
            <v-icon class="mr-1" color="#D4AF37" size="13">mdi-silverware-fork-knife</v-icon>
            Admin · Menu
          </div>
          <h1 class="page-title">Menu Management</h1>
          <p class="page-sub">Manage items, prices, allergens &amp; categories</p>
        </div>
        <div class="header-actions">
          <!-- Desktop add button -->
          <v-btn
            class="gold-btn header-add-btn--desktop"
            flat
            prepend-icon="mdi-plus"
            :ripple="false"
            size="large"
            @click="openAddDialog"
          >
            Add New Item
          </v-btn>
        </div>
      </div>
      <div class="header-line" />

      <!-- ══ Category Pill Bar ══ -->
      <div class="category-bar-wrap">
        <div class="category-bar">
          <button
            v-for="cat in categories"
            :key="cat.value"
            class="category-pill"
            :class="{ 'category-pill--active': selectedCategory === cat.value }"
            type="button"
            @click="selectedCategory = cat.value"
          >
            <v-icon class="category-pill__icon" size="18">{{ cat.icon }}</v-icon>
            <span class="category-pill__label">{{ cat.label }}</span>
          </button>
        </div>
      </div>

      <!-- ══ Items Count ══ -->
      <div class="items-count-row">
        <span class="items-count">
          {{ filteredItems.length }}
          {{ filteredItems.length === 1 ? 'item' : 'items' }}
          in {{ categories.find(c => c.value === selectedCategory)?.label }}
        </span>
      </div>

      <!-- ══ Empty State ══ -->
      <div v-if="filteredItems.length === 0" class="empty-state">
        <div class="empty-state__icon-wrap">
          <v-icon class="empty-state__icon" size="48">mdi-silverware-fork-knife</v-icon>
        </div>
        <div class="empty-state__line" />
        <h3 class="empty-state__title">No items yet</h3>
        <p class="empty-state__desc">Add your first {{ categories.find(c => c.value === selectedCategory)?.label.toLowerCase() }} item to get started.</p>
        <v-btn
          class="gold-btn mt-4"
          flat
          prepend-icon="mdi-plus"
          :ripple="false"
          @click="openAddDialog"
        >
          Add Item
        </v-btn>
      </div>

      <!-- ══ Card Grid ══ -->
      <div v-else class="menu-grid">
        <div
          v-for="(item, index) in filteredItems"
          :key="item.id"
          class="menu-card"
          :style="{ '--card-delay': `${index * 40}ms` }"
        >
          <!-- Card: Left — image placeholder -->
          <div class="menu-card__image">
            <v-icon size="28" style="color: #6a7080;">mdi-image-outline</v-icon>
          </div>

          <!-- Card: Center — content -->
          <div class="menu-card__body">
            <!-- Name + environments -->
            <div class="menu-card__name-row">
              <span class="menu-card__name">{{ item.name }}</span>
              <span
                v-if="item.available !== false"
                class="status-pill status-pill--available"
              >
                <v-icon size="9" style="margin-right:3px;">mdi-check-circle</v-icon>
                Available
              </span>
              <span v-else class="status-pill status-pill--unavailable">
                <v-icon size="9" style="margin-right:3px;">mdi-minus-circle</v-icon>
                Off menu
              </span>
            </div>

            <!-- Description snippet -->
            <p v-if="item.desc" class="menu-card__desc">{{ item.desc }}</p>

            <!-- Environment scope chips -->
            <div v-if="(item.environmentIds ?? []).length > 0" class="menu-card__chips-row">
              <span
                v-for="eid in (item.environmentIds ?? [])"
                :key="eid"
                class="scope-chip"
              >
                <v-icon size="10" style="margin-right:2px;">mdi-map-marker-outline</v-icon>
                {{ venueEnvironments.find(e => e.id === eid)?.name ?? eid }}
              </span>
            </div>

            <!-- Tags row -->
            <div v-if="(item.tags ?? []).length > 0" class="menu-card__chips-row">
              <span
                v-for="tag in item.tags"
                :key="tag"
                class="tag-chip"
              >{{ tag }}</span>
            </div>

            <!-- Allergens row -->
            <div v-if="(item.allergens ?? []).length > 0" class="menu-card__chips-row">
              <span class="allergen-label">Allergens:</span>
              <span
                v-for="allergen in item.allergens"
                :key="allergen"
                class="allergen-chip"
              >{{ allergen }}</span>
            </div>
          </div>

          <!-- Card: Right — price + actions -->
          <div class="menu-card__aside">
            <span class="menu-card__price">{{ item.price }}<span class="menu-card__currency"> TND</span></span>
            <div class="menu-card__actions">
              <button
                class="icon-btn icon-btn--edit"
                title="Edit item"
                type="button"
                @click="editItem(item)"
              >
                <v-icon size="17">mdi-pencil</v-icon>
              </button>
              <button
                class="icon-btn icon-btn--delete"
                title="Delete item"
                type="button"
                @click="deleteItem(item)"
              >
                <v-icon size="17">mdi-delete-outline</v-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div><!-- /menu-page-container -->
  </v-main>

  <!-- ══ Mobile FAB ══ -->
  <v-btn
    class="mobile-fab"
    color="#D4AF37"
    elevation="8"
    icon
    :ripple="false"
    size="56"
    @click="openAddDialog"
  >
    <v-icon size="24" style="color: #0A0E14;">mdi-plus</v-icon>
  </v-btn>

  <!-- ══ Add/Edit Item Dialog ══ -->
  <v-dialog v-model="showItemDialog" max-width="700" persistent>
    <v-card
      flat
      style="background: var(--color-surface-elevated); border: 1px solid rgba(212,175,55,0.18); border-radius: 16px;"
    >
      <v-card-title class="dialog-header pa-6">
        <h2 class="dialog-title">
          {{ isEditing ? "Edit Menu Item" : "Add New Menu Item" }}
        </h2>
        <v-btn
          icon
          :ripple="false"
          size="small"
          style="position: absolute; top: 16px; right: 16px;"
          variant="text"
          @click="closeDialog"
        >
          <v-icon size="20" style="color: #6a7080;">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-alert
          v-if="formError"
          class="mb-4"
          density="compact"
          style="font-size: 0.85rem;"
          type="error"
          variant="tonal"
        >{{ formError }}</v-alert>

        <v-row>
          <!-- Image Upload -->
          <v-col cols="12">
            <label class="field-label mb-2 d-block">Image</label>
            <div class="image-upload-zone">
              <v-icon size="48" style="color: rgba(212,175,55,0.3); margin-bottom: 8px;">mdi-image-plus</v-icon>
              <p style="color: #6a7080; font-size: 0.85rem; margin: 0;">Click to upload or drag and drop</p>
            </div>
          </v-col>

          <!-- Name -->
          <v-col cols="12" md="6">
            <label class="field-label mb-2 d-block">Name <span style="color:#c71585;">*</span></label>
            <v-text-field
              v-model="formData.name"
              class="spotly-input"
              density="comfortable"
              hide-details
              placeholder="e.g., Truffle Fries"
              variant="outlined"
            />
          </v-col>

          <!-- Price -->
          <v-col cols="12" md="6">
            <label class="field-label mb-2 d-block">Price <span style="color:#c71585;">*</span></label>
            <v-text-field
              v-model="formData.price"
              class="spotly-input"
              density="comfortable"
              hide-details
              placeholder="0.00"
              suffix="TND"
              type="number"
              variant="outlined"
            />
          </v-col>

          <!-- Category -->
          <v-col cols="12" md="6">
            <label class="field-label mb-2 d-block">Category <span style="color:#c71585;">*</span></label>
            <v-select
              v-model="formData.category"
              class="spotly-input"
              density="comfortable"
              hide-details
              item-title="label"
              item-value="value"
              :items="categories"
              variant="outlined"
            />
          </v-col>

          <!-- Environment scope -->
          <v-col cols="12" md="6">
            <label class="field-label mb-2 d-block">Environments</label>
            <v-select
              v-model="formData.environmentIds"
              chips
              class="spotly-input"
              closable-chips
              density="comfortable"
              hide-details
              item-title="title"
              item-value="value"
              :items="environmentOptions"
              multiple
              placeholder="All environments"
              variant="outlined"
            />
            <p style="font-size:0.75rem; color:#6a7080; margin-top:6px;">Leave empty to show in all environments.</p>
          </v-col>

          <!-- Allergens -->
          <v-col cols="12" md="6">
            <label class="field-label mb-2 d-block">Allergens</label>
            <v-select
              v-model="formData.allergens"
              chips
              class="spotly-input"
              density="comfortable"
              hide-details
              :items="allergenOptions"
              multiple
              variant="outlined"
            />
          </v-col>

          <!-- Tags -->
          <v-col cols="12">
            <label class="field-label mb-2 d-block">Tags</label>
            <v-select
              v-model="formData.tags"
              chips
              class="spotly-input"
              density="comfortable"
              hide-details
              :items="tagOptions"
              multiple
              variant="outlined"
            />
          </v-col>

          <!-- Description -->
          <v-col cols="12">
            <label class="field-label mb-2 d-block">Description</label>
            <v-textarea
              v-model="formData.description"
              class="spotly-input"
              hide-details
              placeholder="Describe this menu item..."
              rows="3"
              variant="outlined"
            />
          </v-col>

          <!-- Available toggle -->
          <v-col cols="12">
            <v-switch
              v-model="formData.available"
              color="#D4AF37"
              density="compact"
              hide-details
            >
              <template #label>
                <span class="field-label" style="text-transform:none; font-size:0.85rem; color:#b8bcc8;">
                  Available on menu
                </span>
              </template>
            </v-switch>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn
          class="secondary-btn mr-2"
          :ripple="false"
          variant="outlined"
          @click="closeDialog"
        >
          Cancel
        </v-btn>
        <v-btn class="gold-btn" flat :ripple="false" @click="saveItem">
          {{ isEditing ? "Save Changes" : "Add Item" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ══ Delete Confirmation Dialog ══ -->
  <v-dialog v-model="showDeleteDialog" max-width="420">
    <v-card
      flat
      style="background: var(--color-surface-elevated); border: 1px solid rgba(212,175,55,0.18); border-radius: 16px;"
    >
      <v-card-text class="pa-6 text-center">
        <v-icon size="64" style="color: #c71585; margin-bottom: 16px;">mdi-alert-circle-outline</v-icon>
        <h2 class="dialog-title mb-2">Delete Menu Item?</h2>
        <p class="dialog-text mb-4">
          Are you sure you want to delete
          <strong style="color: #d4af37;">{{ itemToDelete?.name }}</strong>?
          This action cannot be undone.
        </p>
        <div class="d-flex gap-2 justify-center">
          <v-btn
            class="secondary-btn"
            :ripple="false"
            variant="outlined"
            @click="showDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn class="danger-btn" flat :ripple="false" @click="confirmDelete">
            Delete
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import AppNavbarSpotly from '@/components/layout/AppNavbarSpotly.vue'
  import { useAdminNav } from '@/composables/useAdminNav'
  import { useAuth } from '@/composables/useAuth'
  import { ENVIRONMENT_LIST } from '@/datamodel/Environment'
  import { addMenuItem, deleteMenuItem, MENU_ITEM_LIST, MenuItem, updateMenuItem } from '@/datamodel/MenuItem'

  const router = useRouter()

  // ─── Admin Nav ─────────────────────────────────────────────────────────────
  const { adminNavLinks, handleNav } = useAdminNav()
  const { getSession } = useAuth()
  const session = getSession()

  const currentTab = ref('menu')
  const selectedCategory = ref('starters')
  const showItemDialog = ref(false)
  const showDeleteDialog = ref(false)
  const isEditing = ref(false)
  const itemToDelete = ref(null)
  const formError = ref('')

  const tabs = [
    { label: 'Dashboard', value: 'dashboard', route: '/admin/dashboard' },
    { label: 'Builder', value: 'builder', route: '/admin/floor-plan' },
    { label: 'Menu', value: 'menu', route: null },
    {
      label: 'Reservations',
      value: 'reservations',
      route: '/admin/reservations',
    },
  ]

  function handleTabClick (tab) {
    if (tab.route) {
      router.push(tab.route)
    } else {
      currentTab.value = tab.value
    }
  }

  const categories = [
    { label: 'Starters', value: 'starters', icon: 'mdi-food' },
    { label: 'Mains', value: 'mains', icon: 'mdi-silverware' },
    { label: 'Desserts', value: 'desserts', icon: 'mdi-cake-variant' },
    { label: 'Drinks', value: 'drinks', icon: 'mdi-glass-cocktail' },
  ]

  const allergenOptions = [
    'Gluten',
    'Dairy',
    'Nuts',
    'Shellfish',
    'Eggs',
    'Soy',
    'Fish',
  ]
  const tagOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Spicy',
    'Chef Special',
    'Popular',
  ]

  const headers = [
    { title: 'Image', key: 'image', sortable: false, width: '120px' },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Price', key: 'price', sortable: true },
    { title: 'Allergens', key: 'allergens', sortable: false },
    { title: 'Tags', key: 'tags', sortable: false },
    { title: 'Status', key: 'available', sortable: true, width: '110px' },
    { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
  ]

  // Live list from datamodel — filtered by the admin's own venue
  const VENUE_ID = session?.venueId ?? null

  // Environments for this venue — used in the scope dropdown
  const venueEnvironments = computed(() =>
    ENVIRONMENT_LIST.filter(e => e.venueId === VENUE_ID),
  )

  const environmentOptions = computed(() =>
    venueEnvironments.value.map(e => ({ title: e.name, value: e.id })),
  )

  const formData = ref({
    name: '',
    price: '',
    category: 'starters',
    allergens: [],
    tags: [],
    description: '',
    available: true,
    environmentIds: [],
  })

  const filteredItems = computed(() => {
    if (VENUE_ID === null) return []
    return MENU_ITEM_LIST.filter(
      item => item.venueId === VENUE_ID && item.category === selectedCategory.value,
    )
  })

  function openAddDialog () {
    isEditing.value = false
    formError.value = ''
    formData.value = {
      name: '',
      price: '',
      category: selectedCategory.value,
      allergens: [],
      tags: [],
      description: '',
      available: true,
      environmentIds: [],
    }
    showItemDialog.value = true
  }

  function editItem (item) {
    isEditing.value = true
    formError.value = ''
    formData.value = { ...item, description: item.desc, available: item.available ?? true, environmentIds: item.environmentIds ?? [] }
    showItemDialog.value = true
  }

  function deleteItem (item) {
    itemToDelete.value = item
    showDeleteDialog.value = true
  }

  function confirmDelete () {
    deleteMenuItem(itemToDelete.value.id)
    showDeleteDialog.value = false
    itemToDelete.value = null
  }

  function saveItem () {
    const { name, price, category, allergens, tags, description, available, environmentIds } = formData.value
    if (!name || !price) {
      formError.value = name ? 'Price is required.' : 'Item name is required.'
      return
    }
    formError.value = ''
    if (isEditing.value) {
      updateMenuItem(formData.value.id, { name, price: Number(price), category, allergens, tags, desc: description, available, environmentIds })
    } else {
      addMenuItem(new MenuItem({
        id: Date.now(),
        venueId: VENUE_ID,
        name,
        price: Number(price),
        category,
        allergens,
        tags,
        desc: description,
        available,
        environmentIds,
      }))
    }
    closeDialog()
  }

  function closeDialog () {
    showItemDialog.value = false
    formData.value = {
      name: '',
      price: '',
      category: 'starters',
      allergens: [],
      tags: [],
      description: '',
      available: true,
      environmentIds: [],
    }
  }
</script>

<style scoped>
/* ═══════════════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════════════ */
.menu-page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 48px 80px;
}
@media (max-width: 1024px) {
  .menu-page-container {
    padding: 32px 24px 60px;
  }
}

/* ═══════════════════════════════════════════════════
   PAGE HEADER
═══════════════════════════════════════════════════ */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.page-eyebrow {
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}
.page-title {
  font-family: var(--font-heading);
  font-size: 2.1rem;
  font-weight: 700;
  color: #f0ead6;
  line-height: 1.15;
  margin: 0 0 8px;
}
.page-sub {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: #6a7080;
  margin: 0;
}
.header-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.header-line {
  height: 1px;
  background: linear-gradient(90deg, rgba(212,175,55,0.3) 0%, rgba(212,175,55,0.05) 100%);
  margin-top: 24px;
  margin-bottom: 32px;
}

/* Hide desktop button on mobile; it's replaced by FAB */
.header-add-btn--desktop {
  display: inline-flex;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .header-add-btn--desktop {
    display: none;
  }
  .menu-page-container {
    padding: 24px 16px 120px; /* extra bottom for FAB */
  }
}

/* ═══════════════════════════════════════════════════
   CATEGORY PILL BAR
═══════════════════════════════════════════════════ */
.category-bar-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  margin-bottom: 20px;
}

.category-bar-wrap::-webkit-scrollbar {
  display: none;
}

.category-bar {
  display: inline-flex;
  gap: 8px;
  padding: 4px 0 6px;
  min-width: max-content;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 999px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  background: rgba(255, 255, 255, 0.03);
  color: #8a8fa8;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 180ms ease;
  white-space: nowrap;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px; /* touch target */
}

.category-pill:hover {
  border-color: rgba(212, 175, 55, 0.45);
  color: #d4af37;
  background: rgba(212, 175, 55, 0.07);
}

.category-pill--active {
  background: rgba(212, 175, 55, 0.14);
  border-color: #d4af37;
  color: #d4af37;
  box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.25) inset;
}

.category-pill__icon {
  opacity: 0.85;
}

.category-pill__label {
  line-height: 1;
}

/* ═══════════════════════════════════════════════════
   ITEMS COUNT
═══════════════════════════════════════════════════ */
.items-count-row {
  margin-bottom: 16px;
}

.items-count {
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 600;
  color: #6a7080;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ═══════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════ */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 72px 24px;
  text-align: center;
}

.empty-state__icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-state__icon {
  color: rgba(212, 175, 55, 0.5) !important;
}

.empty-state__line {
  width: 48px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
  border-radius: 1px;
  margin-bottom: 20px;
  animation: pulse-line 2.4s ease-in-out infinite;
}

@keyframes pulse-line {
  0%, 100% { opacity: 0.4; transform: scaleX(0.6); }
  50%       { opacity: 1;   transform: scaleX(1); }
}

.empty-state__title {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 700;
  color: #f0ead6;
  margin: 0 0 8px;
}

.empty-state__desc {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: #8a8fa8;
  margin: 0;
  line-height: 1.6;
  max-width: 320px;
}

/* ═══════════════════════════════════════════════════
   MENU CARD GRID
═══════════════════════════════════════════════════ */
.menu-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

/* Two-column grid on desktop */
@media (min-width: 768px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (min-width: 1100px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }
}

/* ═══════════════════════════════════════════════════
   MENU CARD
═══════════════════════════════════════════════════ */
.menu-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border-radius: 14px;
  background: var(--color-surface-elevated);
  border: 1px solid rgba(212, 175, 55, 0.13);
  cursor: default;
  transition:
    border-color 200ms ease,
    box-shadow 200ms ease,
    transform 200ms ease;
  animation: card-in 300ms ease both;
  animation-delay: var(--card-delay, 0ms);
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.menu-card:hover {
  border-color: rgba(212, 175, 55, 0.38);
  box-shadow: 0 4px 24px rgba(212, 175, 55, 0.08);
  transform: translateY(-1px);
}

/* Image placeholder */
.menu-card__image {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(212, 175, 55, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Body (center) */
.menu-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.menu-card__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.menu-card__name {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 700;
  color: #f0ead6;
  line-height: 1.3;
  /* Allow wrapping on small screens */
  word-break: break-word;
}

.menu-card__desc {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: #8a8fa8;
  margin: 0;
  line-height: 1.5;
  /* Cap to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.menu-card__chips-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
}

/* Status pills */
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1;
  white-space: nowrap;
}

.status-pill--available {
  background: rgba(46, 187, 87, 0.14);
  color: #2ebb57;
  border: 1px solid rgba(46, 187, 87, 0.28);
}

.status-pill--unavailable {
  background: rgba(150, 150, 150, 0.1);
  color: #888;
  border: 1px solid rgba(150, 150, 150, 0.2);
}

/* Scope chips (environments) */
.scope-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.22);
  color: #d4af37;
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

/* Tag chips */
.tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(46, 187, 87, 0.1);
  border: 1px solid rgba(46, 187, 87, 0.2);
  color: #2ebb57;
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}

/* Allergen chips */
.allergen-label {
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 600;
  color: #6a7080;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.allergen-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(212, 175, 55, 0.07);
  border: 1px solid rgba(212, 175, 55, 0.18);
  color: #c4a435;
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}

/* Aside (right) — price + action buttons */
.menu-card__aside {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  min-width: 76px;
}

.menu-card__price {
  font-family: var(--font-body);
  font-size: 1.05rem;
  font-weight: 700;
  color: #d4af37;
  white-space: nowrap;
  /* tabular nums for alignment in list */
  font-variant-numeric: tabular-nums;
}

.menu-card__currency {
  font-size: 0.72rem;
  font-weight: 600;
  opacity: 0.7;
  letter-spacing: 0.04em;
}

.menu-card__actions {
  display: flex;
  gap: 4px;
}

/* Icon action buttons */
.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

/* Ensure min 44×44 touch area via padding trick on mobile */
@media (max-width: 600px) {
  .icon-btn {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }
}

.icon-btn--edit {
  color: #d4af37;
}

.icon-btn--edit:hover {
  background: rgba(212, 175, 55, 0.14);
  border-color: rgba(212, 175, 55, 0.3);
}

.icon-btn--delete {
  color: #c0506a;
}

.icon-btn--delete:hover {
  background: rgba(199, 21, 133, 0.12);
  border-color: rgba(199, 21, 133, 0.25);
}

/* ═══════════════════════════════════════════════════
   MOBILE FAB
═══════════════════════════════════════════════════ */
.mobile-fab {
  position: fixed !important;
  bottom: 24px;
  right: 20px;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.35) !important;
  /* Only show on mobile */
  display: none !important;
}

@media (max-width: 600px) {
  .mobile-fab {
    display: flex !important;
  }
}

/* ═══════════════════════════════════════════════════
   DIALOG STYLES
═══════════════════════════════════════════════════ */
.dialog-header {
  position: relative;
  border-bottom: 1px solid rgba(212, 175, 55, 0.18);
}

.dialog-title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  color: #f0ead6;
  margin: 0;
}

.dialog-text {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: #b8bcc8;
  line-height: 1.6;
}

.field-label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  color: #8a8fa8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.image-upload-zone {
  width: 100%;
  height: 140px;
  border: 2px dashed rgba(212, 175, 55, 0.3);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(212, 175, 55, 0.03);
}

.image-upload-zone:hover {
  border-color: rgba(212, 175, 55, 0.5);
  background: rgba(212, 175, 55, 0.08);
}

/* ═══════════════════════════════════════════════════
   FORM INPUT DEEP OVERRIDES
═══════════════════════════════════════════════════ */
:deep(.spotly-input .v-select__selection-text) {
  color: #f0ead6;
}

:deep(.spotly-input .v-chip) {
  background: rgba(212, 175, 55, 0.18);
  color: #d4af37;
}

/* ═══════════════════════════════════════════════════
   REDUCED MOTION
═══════════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .menu-card,
  .category-pill,
  .icon-btn,
  .empty-state__line {
    animation: none !important;
    transition: none !important;
  }
}
</style>
