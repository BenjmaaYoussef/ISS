<template>
  <!-- ── Top Navigation ── -->
  <AppNavbarSpotly
    active-link="menu"
    :nav-links="adminNavLinks"
    @nav="handleNav"
  />

  <!-- ── Main Content ── -->
  <v-main class="spotly-main">
    <div class="spotly-container spotly-container--wide">
      <!-- Page Header -->
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="page-title">Menu Management</h1>
          <p class="page-subtitle">
            Manage menu items, prices, allergens, and categories
          </p>
        </div>
        <v-btn
          class="gold-btn"
          flat
          prepend-icon="mdi-plus"
          :ripple="false"
          size="large"
          @click="openAddDialog"
        >
          Add New Item
        </v-btn>
      </div>

      <!-- Category Filter -->
      <div class="mb-5">
        <label class="filter-label mb-2 d-block">Category</label>
        <v-chip-group
          v-model="selectedCategory"
          mandatory
          selected-class="category-chip--active"
        >
          <v-chip
            v-for="cat in categories"
            :key="cat.value"
            class="category-chip"
            :value="cat.value"
          >
            {{ cat.label }}
          </v-chip>
        </v-chip-group>
      </div>

      <!-- Menu Items Table -->
      <v-card
        class="menu-table-card"
        flat
        style="
          background: var(--color-surface-elevated);
          border: 1px solid rgba(212, 175, 55, 0.18);
          border-radius: 12px;
        "
      >
        <v-data-table
          class="menu-table"
          :headers="headers"
          :items="filteredItems"
          :items-per-page="10"
          style="background: transparent"
        >
          <!-- Image Column -->
          <template #item.image="{ item }">
            <div class="item-image-cell">
              <v-checkbox
                v-model="item.selected"
                class="mr-2"
                color="#D4AF37"
                density="compact"
                hide-details
              />
              <div class="item-image-placeholder">
                <v-icon
                  size="24"
                  style="color: #6a7080"
                >mdi-image-outline</v-icon>
              </div>
            </div>
          </template>

          <!-- Name Column -->
          <template #item.name="{ item }">
            <div class="d-flex align-center gap-2 flex-wrap">
              <span class="item-name">{{ item.name }}</span>
              <v-chip
                v-for="eid in (item.environmentIds ?? [])"
                :key="eid"
                size="x-small"
                style="background: rgba(212,175,55,0.12); color: #d4af37; border: 1px solid rgba(212,175,55,0.25); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.04em;"
              >
                {{ venueEnvironments.find(e => e.id === eid)?.name ?? eid }}
              </v-chip>
            </div>
          </template>

          <!-- Price Column -->
          <template #item.price="{ item }">
            <span class="item-price">{{ item.price }} TND</span>
          </template>

          <!-- Allergens Column -->
          <template #item.allergens="{ item }">
            <div class="allergens-cell">
              <v-chip
                v-for="allergen in item.allergens"
                :key="allergen"
                class="allergen-chip"
                size="x-small"
                style="
                  background: rgba(212, 175, 55, 0.1);
                  color: #d4af37;
                  margin-right: 4px;
                "
              >
                {{ allergen }}
              </v-chip>
              <span
                v-if="item.allergens.length === 0"
                style="color: #6a7080; font-size: 0.8rem"
              >None</span>
            </div>
          </template>

          <!-- Tags Column -->
          <template #item.tags="{ item }">
            <div class="tags-cell">
              <v-chip
                v-for="tag in item.tags"
                :key="tag"
                class="tag-chip"
                size="x-small"
                style="
                  background: rgba(46, 187, 87, 0.15);
                  color: #2ebb57;
                  margin-right: 4px;
                "
              >
                {{ tag }}
              </v-chip>
            </div>
          </template>

          <!-- Available Column -->
          <template #item.available="{ item }">
            <v-chip
              size="x-small"
              :style="item.available !== false
                ? 'background: rgba(46,187,87,0.15); color: #2ebb57; border: 1px solid rgba(46,187,87,0.3);'
                : 'background: rgba(150,150,150,0.1); color: #888; border: 1px solid rgba(150,150,150,0.2);'"
            >
              <v-icon size="10" start>{{ item.available !== false ? 'mdi-check-circle' : 'mdi-minus-circle' }}</v-icon>
              {{ item.available !== false ? 'Available' : 'Unavailable' }}
            </v-chip>
          </template>

          <!-- Actions Column -->
          <template #item.actions="{ item }">
            <div class="actions-cell">
              <v-btn
                icon
                :ripple="false"
                size="small"
                variant="text"
                @click="editItem(item)"
              >
                <v-icon size="18" style="color: #d4af37">mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                :ripple="false"
                size="small"
                variant="text"
                @click="deleteItem(item)"
              >
                <v-icon
                  size="18"
                  style="color: #c71585"
                >mdi-delete-outline</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>
    </div>
  </v-main>

  <!-- ── Add/Edit Item Dialog ── -->
  <v-dialog v-model="showItemDialog" max-width="700" persistent>
    <v-card
      flat
      style="
        background: var(--color-surface-elevated);
        border: 1px solid rgba(212, 175, 55, 0.18);
        border-radius: 16px;
      "
    >
      <v-card-title class="dialog-header pa-6">
        <h2 class="dialog-title">
          {{ isEditing ? "Edit Menu Item" : "Add New Menu Item" }}
        </h2>
        <v-btn
          icon
          :ripple="false"
          size="small"
          style="position: absolute; top: 16px; right: 16px"
          variant="text"
          @click="closeDialog"
        >
          <v-icon size="20" style="color: #6a7080">mdi-close</v-icon>
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
              <v-icon
                size="48"
                style="color: rgba(212, 175, 55, 0.3); margin-bottom: 8px"
              >mdi-image-plus</v-icon>
              <p style="color: #6a7080; font-size: 0.85rem; margin: 0">
                Click to upload or drag and drop
              </p>
            </div>
          </v-col>

          <!-- Name -->
          <v-col cols="12" md="6">
            <label class="field-label mb-2 d-block">Name <span style="color: #c71585">*</span></label>
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
            <label class="field-label mb-2 d-block">Price <span style="color: #c71585">*</span></label>
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
            <label class="field-label mb-2 d-block">Category <span style="color: #c71585">*</span></label>
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
            <p style="font-size: 0.75rem; color: #6a7080; margin-top: 6px;">
              Leave empty to show in all environments.
            </p>
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
                <span class="field-label" style="text-transform: none; font-size: 0.85rem; color: #b8bcc8;">
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

  <!-- ── Delete Confirmation Dialog ── -->
  <v-dialog v-model="showDeleteDialog" max-width="420">
    <v-card
      flat
      style="
        background: var(--color-surface-elevated);
        border: 1px solid rgba(212, 175, 55, 0.18);
        border-radius: 16px;
      "
    >
      <v-card-text class="pa-6 text-center">
        <v-icon
          size="64"
          style="color: #c71585; margin-bottom: 16px"
        >mdi-alert-circle-outline</v-icon>
        <h2 class="dialog-title mb-2">Delete Menu Item?</h2>
        <p class="dialog-text mb-4">
          Are you sure you want to delete
          <strong style="color: #d4af37">{{ itemToDelete?.name }}</strong>? This action cannot be undone.
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

  // ─── Admin Nav ───────────────────────────────────────────────────────────────────────────────
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
    { label: 'Starters', value: 'starters' },
    { label: 'Mains', value: 'mains' },
    { label: 'Desserts', value: 'desserts' },
    { label: 'Drinks', value: 'drinks' },
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
/* ═══ TYPOGRAPHY ═══ */

.admin-badge {
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.admin-name {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: #f0ead6;
  font-weight: 500;
}

/* ═══ SECONDARY NAV ═══ */
.secondary-nav {
  background: var(--color-surface);
  border-bottom: 1px solid rgba(212, 175, 55, 0.18);
  padding: 8px 0;
}

.nav-tab {
  font-family: var(--font-body) !important;
  font-size: 0.85rem !important;
  font-weight: 500 !important;
  color: #6a7080 !important;
  text-transform: none !important;
  letter-spacing: 0.02em !important;
}

.nav-tab--active {
  color: #d4af37 !important;
  background: rgba(212, 175, 55, 0.08) !important;
}

/* ═══ PAGE HEADER ═══ */
.page-title {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: #f0ead6;
  letter-spacing: 0.02em;
  margin: 0;
}

.page-subtitle {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: #8a8fa8;
  margin: 4px 0 0 0;
}

/* ═══ CATEGORY FILTER ═══ */
.filter-label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  color: #8a8fa8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.category-chip {
  background: #161d2b !important;
  border: 1px solid rgba(212, 175, 55, 0.18) !important;
  color: #b8bcc8 !important;
  font-family: var(--font-body) !important;
  font-size: 0.85rem !important;
  font-weight: 500 !important;
  text-transform: none !important;
  letter-spacing: 0.02em !important;
}

.category-chip--active {
  background: rgba(212, 175, 55, 0.18) !important;
  border-color: #d4af37 !important;
  color: #d4af37 !important;
}

/* ═══ DATA TABLE ═══ */
.menu-table-card {
  overflow: hidden;
}

:deep(.menu-table) {
  background: transparent;
}

:deep(.menu-table .v-table__wrapper) {
  background: transparent;
}

:deep(.menu-table th) {
  background: var(--color-surface) !important;
  color: #8a8fa8 !important;
  font-family: var(--font-body) !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08em !important;
  border-bottom: 1px solid rgba(212, 175, 55, 0.18) !important;
}

:deep(.menu-table td) {
  border-bottom: 1px solid rgba(212, 175, 55, 0.08) !important;
  padding: 16px !important;
}

:deep(.menu-table tr:hover) {
  background: rgba(212, 175, 55, 0.05) !important;
}

.item-image-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-image-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #161d2b;
  border: 1px solid rgba(212, 175, 55, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-name {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: #f0ead6;
}

.item-price {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 700;
  color: #d4af37;
}

.allergens-cell,
.tags-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.allergen-chip,
.tag-chip {
  font-family: var(--font-body) !important;
  font-size: 0.7rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
}

.actions-cell {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}

/* ═══ BUTTONS ═══ */
/* .gold-btn, .secondary-btn, .danger-btn are global — see settings.scss */

/* ═══ DIALOG ═══ */
.dialog-header {
  position: relative;
  border-bottom: 1px solid rgba(212, 175, 55, 0.18);
}

.dialog-title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  color: #f0ead6;
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

/* Input deep overrides handled by global .spotly-input */
:deep(.spotly-input .v-select__selection-text) {
  color: #f0ead6;
}

:deep(.spotly-input .v-chip) {
  background: rgba(212, 175, 55, 0.18);
  color: #d4af37;
}
</style>
