<template>
  <!-- ── Top Navigation ── -->
  <AppNavbarApp
    :nav-links="adminNavLinks"
    active-link="menu"
    admin-label="Admin"
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
          flat
          :ripple="false"
          class="gold-btn"
          size="large"
          prepend-icon="mdi-plus"
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
          selected-class="category-chip--active"
          mandatory
        >
          <v-chip
            v-for="cat in categories"
            :key="cat.value"
            :value="cat.value"
            class="category-chip"
          >
            {{ cat.label }}
          </v-chip>
        </v-chip-group>
      </div>

      <!-- Menu Items Table -->
      <v-card
        flat
        class="menu-table-card"
        style="
          background: var(--color-surface-elevated);
          border: 1px solid rgba(212, 175, 55, 0.18);
          border-radius: 12px;
        "
      >
        <v-data-table
          :headers="headers"
          :items="filteredItems"
          :items-per-page="10"
          class="menu-table"
          style="background: transparent"
        >
          <!-- Image Column -->
          <template v-slot:item.image="{ item }">
            <div class="item-image-cell">
              <v-checkbox
                v-model="item.selected"
                hide-details
                density="compact"
                color="#D4AF37"
                class="mr-2"
              ></v-checkbox>
              <div class="item-image-placeholder">
                <v-icon size="24" style="color: #6a7080"
                  >mdi-image-outline</v-icon
                >
              </div>
            </div>
          </template>

          <!-- Name Column -->
          <template v-slot:item.name="{ item }">
            <span class="item-name">{{ item.name }}</span>
          </template>

          <!-- Price Column -->
          <template v-slot:item.price="{ item }">
            <span class="item-price">{{ item.price }} TND</span>
          </template>

          <!-- Allergens Column -->
          <template v-slot:item.allergens="{ item }">
            <div class="allergens-cell">
              <v-chip
                v-for="allergen in item.allergens"
                :key="allergen"
                size="x-small"
                class="allergen-chip"
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
                >None</span
              >
            </div>
          </template>

          <!-- Tags Column -->
          <template v-slot:item.tags="{ item }">
            <div class="tags-cell">
              <v-chip
                v-for="tag in item.tags"
                :key="tag"
                size="x-small"
                class="tag-chip"
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
          <template v-slot:item.available="{ item }">
            <v-chip
              :style="item.available !== false
                ? 'background: rgba(46,187,87,0.15); color: #2ebb57; border: 1px solid rgba(46,187,87,0.3);'
                : 'background: rgba(150,150,150,0.1); color: #888; border: 1px solid rgba(150,150,150,0.2);'"
              size="x-small"
            >
              <v-icon start size="10">{{ item.available !== false ? 'mdi-check-circle' : 'mdi-minus-circle' }}</v-icon>
              {{ item.available !== false ? 'Available' : 'Unavailable' }}
            </v-chip>
          </template>

          <!-- Actions Column -->
          <template v-slot:item.actions="{ item }">
            <div class="actions-cell">
              <v-btn
                icon
                size="small"
                variant="text"
                :ripple="false"
                @click="editItem(item)"
              >
                <v-icon size="18" style="color: #d4af37">mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                variant="text"
                :ripple="false"
                @click="deleteItem(item)"
              >
                <v-icon size="18" style="color: #c71585"
                  >mdi-delete-outline</v-icon
                >
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
          size="small"
          variant="text"
          :ripple="false"
          @click="closeDialog"
          style="position: absolute; top: 16px; right: 16px"
        >
          <v-icon size="20" style="color: #6a7080">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-alert
          v-if="formError"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
          style="font-size: 0.85rem;"
        >{{ formError }}</v-alert>
        <v-row>
          <!-- Image Upload -->
          <v-col cols="12">
            <label class="field-label mb-2 d-block">Image</label>
            <div class="image-upload-zone">
              <v-icon
                size="48"
                style="color: rgba(212, 175, 55, 0.3); margin-bottom: 8px"
                >mdi-image-plus</v-icon
              >
              <p style="color: #6a7080; font-size: 0.85rem; margin: 0">
                Click to upload or drag and drop
              </p>
            </div>
          </v-col>

          <!-- Name -->
          <v-col cols="12" md="6">
            <label class="field-label mb-2 d-block"
              >Name <span style="color: #c71585">*</span></label
            >
            <v-text-field
              v-model="formData.name"
              variant="outlined"
              density="comfortable"
              placeholder="e.g., Truffle Fries"
              hide-details
              class="spotly-input"
            ></v-text-field>
          </v-col>

          <!-- Price -->
          <v-col cols="12" md="6">
            <label class="field-label mb-2 d-block"
              >Price <span style="color: #c71585">*</span></label
            >
            <v-text-field
              v-model="formData.price"
              variant="outlined"
              density="comfortable"
              type="number"
              suffix="TND"
              placeholder="0.00"
              hide-details
              class="spotly-input"
            ></v-text-field>
          </v-col>

          <!-- Category -->
          <v-col cols="12" md="6">
            <label class="field-label mb-2 d-block"
              >Category <span style="color: #c71585">*</span></label
            >
            <v-select
              v-model="formData.category"
              :items="categories"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="comfortable"
              hide-details
              class="spotly-input"
            ></v-select>
          </v-col>

          <!-- Allergens -->
          <v-col cols="12" md="6">
            <label class="field-label mb-2 d-block">Allergens</label>
            <v-select
              v-model="formData.allergens"
              :items="allergenOptions"
              variant="outlined"
              density="comfortable"
              multiple
              chips
              hide-details
              class="spotly-input"
            ></v-select>
          </v-col>

          <!-- Tags -->
          <v-col cols="12">
            <label class="field-label mb-2 d-block">Tags</label>
            <v-select
              v-model="formData.tags"
              :items="tagOptions"
              variant="outlined"
              density="comfortable"
              multiple
              chips
              hide-details
              class="spotly-input"
            ></v-select>
          </v-col>

          <!-- Description -->
          <v-col cols="12">
            <label class="field-label mb-2 d-block">Description</label>
            <v-textarea
              v-model="formData.description"
              variant="outlined"
              rows="3"
              placeholder="Describe this menu item..."
              hide-details
              class="spotly-input"
            ></v-textarea>
          </v-col>

          <!-- Available toggle -->
          <v-col cols="12">
            <v-switch
              v-model="formData.available"
              color="#D4AF37"
              hide-details
              density="compact"
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
        <v-spacer></v-spacer>
        <v-btn
          variant="outlined"
          :ripple="false"
          class="secondary-btn mr-2"
          @click="closeDialog"
        >
          Cancel
        </v-btn>
        <v-btn flat :ripple="false" class="gold-btn" @click="saveItem">
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
        <v-icon size="64" style="color: #c71585; margin-bottom: 16px"
          >mdi-alert-circle-outline</v-icon
        >
        <h2 class="dialog-title mb-2">Delete Menu Item?</h2>
        <p class="dialog-text mb-4">
          Are you sure you want to delete
          <strong style="color: #d4af37">{{ itemToDelete?.name }}</strong
          >? This action cannot be undone.
        </p>
        <div class="d-flex gap-2 justify-center">
          <v-btn
            variant="outlined"
            :ripple="false"
            class="secondary-btn"
            @click="showDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn flat :ripple="false" class="danger-btn" @click="confirmDelete">
            Delete
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import AppNavbarApp from "@/components/layout/AppNavbarApp.vue";
import { useAdminNav } from "@/composables/useAdminNav";
import { useAuth } from "@/composables/useAuth";
import { MENU_ITEM_LIST, MenuItem, addMenuItem, updateMenuItem, deleteMenuItem } from "@/datamodel/MenuItem";

const router = useRouter();

// ─── Admin Nav ───────────────────────────────────────────────────────────────────────────────
const { adminNavLinks, handleNav } = useAdminNav();
const { getSession } = useAuth();
const session = getSession();

const currentTab = ref("menu");
const selectedCategory = ref("starters");
const showItemDialog = ref(false);
const showDeleteDialog = ref(false);
const isEditing = ref(false);
const itemToDelete = ref(null);
const formError = ref("");

const tabs = [
  { label: "Dashboard", value: "dashboard", route: "/admin/dashboard" },
  { label: "Builder", value: "builder", route: "/admin/floor-plan" },
  { label: "Menu", value: "menu", route: null },
  {
    label: "Reservations",
    value: "reservations",
    route: "/admin/reservations",
  },
];

const handleTabClick = (tab) => {
  if (tab.route) {
    router.push(tab.route);
  } else {
    currentTab.value = tab.value;
  }
};

const categories = [
  { label: "Starters", value: "starters" },
  { label: "Mains", value: "mains" },
  { label: "Desserts", value: "desserts" },
  { label: "Drinks", value: "drinks" },
];

const allergenOptions = [
  "Gluten",
  "Dairy",
  "Nuts",
  "Shellfish",
  "Eggs",
  "Soy",
  "Fish",
];
const tagOptions = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Spicy",
  "Chef Special",
  "Popular",
];

const headers = [
  { title: "Image", key: "image", sortable: false, width: "120px" },
  { title: "Name", key: "name", sortable: true },
  { title: "Price", key: "price", sortable: true },
  { title: "Allergens", key: "allergens", sortable: false },
  { title: "Tags", key: "tags", sortable: false },
  { title: "Status", key: "available", sortable: true, width: "110px" },
  { title: "Actions", key: "actions", sortable: false, align: "end" },
];

// Live list from datamodel — filtered by the admin's own venue
const VENUE_ID = session?.venueId ?? null;

const formData = ref({
  name: "",
  price: "",
  category: "starters",
  allergens: [],
  tags: [],
  description: "",
  available: true,
});

const filteredItems = computed(() => {
  if (VENUE_ID === null) return [];
  return MENU_ITEM_LIST.filter(
    (item) => item.venueId === VENUE_ID && item.category === selectedCategory.value,
  );
});

const openAddDialog = () => {
  isEditing.value = false;
  formError.value = "";
  formData.value = {
    name: "",
    price: "",
    category: selectedCategory.value,
    allergens: [],
    tags: [],
    description: "",
    available: true,
  };
  showItemDialog.value = true;
};

const editItem = (item) => {
  isEditing.value = true;
  formError.value = "";
  formData.value = { ...item, description: item.desc, available: item.available ?? true };
  showItemDialog.value = true;
};

const deleteItem = (item) => {
  itemToDelete.value = item;
  showDeleteDialog.value = true;
};

const confirmDelete = () => {
  deleteMenuItem(itemToDelete.value.id);
  showDeleteDialog.value = false;
  itemToDelete.value = null;
};

const saveItem = () => {
  const { name, price, category, allergens, tags, description, available } = formData.value;
  if (!name || !price) {
    formError.value = !name ? "Item name is required." : "Price is required.";
    return;
  }
  formError.value = "";
  if (isEditing.value) {
    updateMenuItem(formData.value.id, { name, price: Number(price), category, allergens, tags, desc: description, available });
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
    }));
  }
  closeDialog();
};

const closeDialog = () => {
  showItemDialog.value = false;
  formData.value = {
    name: "",
    price: "",
    category: "starters",
    allergens: [],
    tags: [],
    description: "",
    available: true,
  };
};
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
