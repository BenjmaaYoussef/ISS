<template>
  <v-app :style="{ background: '#0A0E14' }">
    
    <!-- ── Top Navigation ── -->
    <v-app-bar
      flat
      :height="64"
      style="background: rgba(17, 23, 32, 0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(212, 175, 55, 0.18);"
    >
      <v-container fluid class="d-flex align-center px-6">
        <!-- Logo -->
        <div class="d-flex align-center">
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="#D4AF37" stroke-width="1.5"/>
            <path d="M12 28 C12 20 16 14 20 12 C24 14 28 20 28 28" stroke="#D4AF37" stroke-width="1.5" fill="none"/>
            <path d="M8 20 C12 16 16 14 20 14 C24 14 28 16 32 20" stroke="#D4AF37" stroke-width="1.5" fill="none"/>
            <circle cx="20" cy="20" r="3" stroke="#D4AF37" stroke-width="1.5" fill="none"/>
          </svg>
          <span class="brand-logo ml-3">Spotly</span>
        </div>

        <!-- Back to Environments Button -->
        <v-btn
          variant="text"
          :ripple="false"
          class="ml-6"
          size="small"
          prepend-icon="mdi-arrow-left"
          style="color: #D4AF37; text-transform: none; font-family: 'Inter', sans-serif;"
          @click="goBackToEnvironment"
        >
          Back to Environments
        </v-btn>

        <v-spacer></v-spacer>

        <!-- Admin Badge -->
        <v-chip
          size="small"
          class="admin-badge mr-4"
          style="background: rgba(212, 175, 55, 0.15); color: #D4AF37; border: 1px solid rgba(212, 175, 55, 0.3);"
        >
          <v-icon start size="16">mdi-shield-crown</v-icon>
          Admin Panel
        </v-chip>

        <!-- Nav Buttons -->
        <v-btn
          flat
          :ripple="false"
          class="text-none px-4"
          size="small"
          style="background: #D4AF37; color: #0A0E14; font-weight: 600;"
          @click="saveLayout"
        >
          <v-icon start size="18">mdi-content-save</v-icon>
          Save Layout
        </v-btn>
      </v-container>
    </v-app-bar>

    <!-- ── Secondary Nav (Tabs) ── -->
    <div class="secondary-nav">
      <v-container fluid class="px-6">
        <div class="d-flex align-center">
          <v-btn
            v-for="tab in tabs"
            :key="tab.value"
            variant="text"
            :ripple="false"
            class="nav-tab"
            :class="{ 'nav-tab--active': currentTab === tab.value }"
            size="small"
            @click="currentTab = tab.value"
          >
            {{ tab.label }}
          </v-btn>

          <v-spacer></v-spacer>

          <!-- Mode Toggle -->
          <div class="mode-toggle">
            <span class="mode-label mr-2">Editing</span>
            <v-switch
              v-model="isEditMode"
              hide-details
              density="compact"
              color="#D4AF37"
              :label="isEditMode ? 'Indoor Lounge' : 'Preview'"
            ></v-switch>
          </div>
        </div>
      </v-container>
    </div>

    <!-- ── Main Content ── -->
    <v-main>
      <v-container fluid class="pa-0" style="height: 100%;">
        <v-row no-gutters style="height: calc(100vh - 156px);">
          
          <!-- LEFT SIDEBAR: Elements Palette -->
          <v-col cols="12" md="2" class="sidebar-left">
            <div class="sidebar-content">
              <div class="sidebar-header">
                <h3 class="sidebar-title">Elements</h3>
              </div>

              <v-list density="compact" class="element-list">
                <v-list-subheader class="element-category">FURNITURE</v-list-subheader>
                
                <v-list-item
                  v-for="element in furnitureElements"
                  :key="element.id"
                  class="element-item"
                  @click="selectElement(element)"
                  :class="{ 'element-item--selected': selectedElement?.id === element.id }"
                >
                  <template #prepend>
                    <div class="element-icon">
                      <v-icon size="20" :style="{ color: selectedElement?.id === element.id ? '#D4AF37' : '#8A8FA8' }">
                        {{ element.icon }}
                      </v-icon>
                    </div>
                  </template>
                  <v-list-item-title class="element-name">{{ element.name }}</v-list-item-title>
                </v-list-item>

                <v-divider class="my-2" style="border-color: rgba(212, 175, 55, 0.1);"></v-divider>

                <v-list-subheader class="element-category">DECOR</v-list-subheader>
                
                <v-list-item
                  v-for="element in decorElements"
                  :key="element.id"
                  class="element-item"
                  @click="selectElement(element)"
                  :class="{ 'element-item--selected': selectedElement?.id === element.id }"
                >
                  <template #prepend>
                    <div class="element-icon">
                      <v-icon size="20" :style="{ color: selectedElement?.id === element.id ? '#D4AF37' : '#8A8FA8' }">
                        {{ element.icon }}
                      </v-icon>
                    </div>
                  </template>
                  <v-list-item-title class="element-name">{{ element.name }}</v-list-item-title>
                </v-list-item>

                <v-divider class="my-2" style="border-color: rgba(212, 175, 55, 0.1);"></v-divider>

                <v-list-subheader class="element-category">STRUCTURE</v-list-subheader>
                
                <v-list-item
                  v-for="element in structureElements"
                  :key="element.id"
                  class="element-item"
                  @click="selectElement(element)"
                  :class="{ 'element-item--selected': selectedElement?.id === element.id }"
                >
                  <template #prepend>
                    <div class="element-icon">
                      <v-icon size="20" :style="{ color: selectedElement?.id === element.id ? '#D4AF37' : '#8A8FA8' }">
                        {{ element.icon }}
                      </v-icon>
                    </div>
                  </template>
                  <v-list-item-title class="element-name">{{ element.name }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </v-col>

          <!-- CENTER: Canvas/Grid -->
          <v-col cols="12" md="8" class="canvas-area">
            <div class="canvas-wrapper">
              <div class="canvas-toolbar">
                <div class="canvas-info">
                  <span class="canvas-label">Indoor Lounge</span>
                  <v-chip size="x-small" style="background: rgba(212, 175, 55, 0.15); color: #D4AF37; margin-left: 8px;">
                    {{ placedElements.length }} elements
                  </v-chip>
                </div>
                <div class="canvas-actions">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    :ripple="false"
                    style="color: #6A7080;"
                  >
                    <v-icon size="20">mdi-grid</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    :ripple="false"
                    style="color: #6A7080;"
                  >
                    <v-icon size="20">mdi-ruler</v-icon>
                  </v-btn>
                </div>
              </div>

              <!-- Grid Canvas -->
              <div
                class="canvas-grid"
                @click="placeElementOnCanvas"
                @contextmenu.prevent
              >
                <!-- Grid lines (visual only) -->
                <svg class="grid-svg" width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(212, 175, 55, 0.08)" stroke-width="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                <!-- Placed Elements -->
                <div
                  v-for="(item, index) in placedElements"
                  :key="index"
                  class="placed-element"
                  :class="{
                    'placed-element--selected': selectedPlacedIndex === index,
                    'placed-element--table2': item.element.type === 'table2',
                    'placed-element--table4': item.element.type === 'table4'
                  }"
                  :style="{
                    left: item.x + 'px',
                    top: item.y + 'px',
                    width: item.width + 'px',
                    height: item.height + 'px',
                    transform: `rotate(${item.rotation}deg)`
                  }"
                  @click.stop="selectPlacedElement(index)"
                >
                  <div class="placed-element-icon">
                    <v-icon :size="item.width > 80 ? 32 : 24" style="color: #F0EAD6;">
                      {{ item.element.icon }}
                    </v-icon>
                  </div>
                  <div class="placed-element-label">{{ item.label }}</div>
                </div>

                <!-- Instruction hint -->
                <div v-if="placedElements.length === 0" class="canvas-hint">
                  <v-icon size="32" style="color: rgba(212, 175, 55, 0.3); margin-bottom: 8px;">mdi-cursor-default-click</v-icon>
                  <p style="color: #6A7080; font-size: 0.85rem;">Select an element from the left and click on the grid to place it</p>
                </div>
              </div>
            </div>
          </v-col>

          <!-- RIGHT SIDEBAR: Properties -->
          <v-col cols="12" md="2" class="sidebar-right">
            <div class="sidebar-content">
              <div class="sidebar-header">
                <h3 class="sidebar-title">Properties</h3>
              </div>

              <!-- Show properties when element is selected -->
              <div v-if="selectedPlacedIndex !== null && placedElements[selectedPlacedIndex]" class="properties-panel">
                <div class="property-group">
                  <label class="property-label">Selected</label>
                  <div class="property-value">
                    {{ placedElements[selectedPlacedIndex].element.name }}
                  </div>
                </div>

                <v-divider class="my-3" style="border-color: rgba(212, 175, 55, 0.1);"></v-divider>

                <div class="property-group">
                  <label class="property-label">Label / ID</label>
                  <v-text-field
                    v-model="placedElements[selectedPlacedIndex].label"
                    variant="outlined"
                    density="compact"
                    hide-details
                    placeholder="e.g., Table A1"
                    class="property-input"
                  ></v-text-field>
                </div>

                <div class="property-group">
                  <label class="property-label">Capacity</label>
                  <v-text-field
                    v-model.number="placedElements[selectedPlacedIndex].capacity"
                    variant="outlined"
                    density="compact"
                    type="number"
                    hide-details
                    class="property-input"
                  ></v-text-field>
                </div>

                <v-divider class="my-3" style="border-color: rgba(212, 175, 55, 0.1);"></v-divider>

                <div class="property-group">
                  <label class="property-label">Position X</label>
                  <v-text-field
                    v-model.number="placedElements[selectedPlacedIndex].x"
                    variant="outlined"
                    density="compact"
                    type="number"
                    hide-details
                    class="property-input"
                  ></v-text-field>
                </div>

                <div class="property-group">
                  <label class="property-label">Position Y</label>
                  <v-text-field
                    v-model.number="placedElements[selectedPlacedIndex].y"
                    variant="outlined"
                    density="compact"
                    type="number"
                    hide-details
                    class="property-input"
                  ></v-text-field>
                </div>

                <v-divider class="my-3" style="border-color: rgba(212, 175, 55, 0.1);"></v-divider>

                <div class="property-group">
                  <label class="property-label">Width</label>
                  <v-text-field
                    v-model.number="placedElements[selectedPlacedIndex].width"
                    variant="outlined"
                    density="compact"
                    type="number"
                    hide-details
                    suffix="px"
                    class="property-input"
                  ></v-text-field>
                </div>

                <div class="property-group">
                  <label class="property-label">Height</label>
                  <v-text-field
                    v-model.number="placedElements[selectedPlacedIndex].height"
                    variant="outlined"
                    density="compact"
                    type="number"
                    hide-details
                    suffix="px"
                    class="property-input"
                  ></v-text-field>
                </div>

                <div class="property-group">
                  <label class="property-label">Rotation</label>
                  <v-slider
                    v-model="placedElements[selectedPlacedIndex].rotation"
                    :min="0"
                    :max="360"
                    :step="45"
                    hide-details
                    color="#D4AF37"
                    thumb-label
                    class="property-slider"
                  ></v-slider>
                </div>

                <v-divider class="my-3" style="border-color: rgba(212, 175, 55, 0.1);"></v-divider>

                <v-btn
                  block
                  variant="outlined"
                  :ripple="false"
                  class="delete-button"
                  @click="deleteSelectedElement"
                >
                  <v-icon start size="18">mdi-delete-outline</v-icon>
                  Delete
                </v-btn>

              </div>

              <!-- Empty state -->
              <div v-else class="properties-empty">
                <v-icon size="48" style="color: rgba(212, 175, 55, 0.2); margin-bottom: 12px;">mdi-cursor-default-click</v-icon>
                <p style="color: #6A7080; font-size: 0.8rem; text-align: center;">
                  Click on a placed element to edit its properties
                </p>
              </div>
            </div>
          </v-col>

        </v-row>
      </v-container>
    </v-main>

    <!-- Save Confirmation Dialog -->
    <v-dialog v-model="showSaveDialog" max-width="420">
      <v-card
        flat
        style="background: #1A2332; border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 16px;"
      >
        <v-card-text class="pa-6 text-center">
          <div class="success-icon mb-4">
            <v-icon size="52" style="color: #2EBB57;">mdi-check-circle-outline</v-icon>
          </div>
          <h2 class="dialog-title mb-2">Layout Saved!</h2>
          <p class="dialog-text">Your floor plan has been saved successfully.</p>
          <v-btn
            block
            flat
            :ripple="false"
            class="gold-button mt-4"
            @click="showSaveDialog = false"
          >
            Close
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<script setup>
import { ref } from 'vue'

const currentTab = ref('dashboard')
const isEditMode = ref(true)
const selectedElement = ref(null)
const selectedPlacedIndex = ref(null)
const placedElements = ref([])
const showSaveDialog = ref(false)

const tabs = [
  { label: 'Dashboard', value: 'dashboard' },
  { label: 'Builder Menu', value: 'builder' },
  { label: 'Reservations', value: 'reservations' },
  { label: 'Settings', value: 'settings' },
]

// Element categories
const furnitureElements = [
  { id: 'chair', name: 'Chair', icon: 'mdi-chair-rolling', type: 'chair' },
  { id: 'seat', name: 'Seat', icon: 'mdi-seat', type: 'seat' },
  { id: 'table2', name: 'Table (2)', icon: 'mdi-table-furniture', type: 'table2' },
  { id: 'table4', name: 'Table (4)', icon: 'mdi-table-chair', type: 'table4' },
  { id: 'sofa', name: 'Sofa', icon: 'mdi-sofa', type: 'sofa' },
]

const decorElements = [
  { id: 'tree', name: 'Tree', icon: 'mdi-tree', type: 'decor' },
  { id: 'plant', name: 'Plant', icon: 'mdi-flower-tulip', type: 'decor' },
]

const structureElements = [
  { id: 'door', name: 'Door', icon: 'mdi-door', type: 'entrance' },
  { id: 'entrance', name: 'Entrance', icon: 'mdi-location-enter', type: 'entrance' },
  { id: 'bar', name: 'Bar', icon: 'mdi-glass-cocktail', type: 'bar' },
]

const selectElement = (element) => {
  selectedElement.value = element
  selectedPlacedIndex.value = null
}

const placeElementOnCanvas = (event) => {
  if (!selectedElement.value) return
  
  const canvas = event.currentTarget
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // Snap to grid (40px)
  const snappedX = Math.round(x / 40) * 40
  const snappedY = Math.round(y / 40) * 40

  // Default dimensions based on element type
  let defaultWidth = 80
  let defaultHeight = 80

  if (selectedElement.value.type === 'table2') {
    defaultWidth = 80
    defaultHeight = 60
  } else if (selectedElement.value.type === 'table4') {
    defaultWidth = 100
    defaultHeight = 100
  } else if (selectedElement.value.type === 'sofa') {
    defaultWidth = 120
    defaultHeight = 60
  }

  placedElements.value.push({
    element: { ...selectedElement.value },
    x: snappedX,
    y: snappedY,
    width: defaultWidth,
    height: defaultHeight,
    rotation: 0,
    label: `${selectedElement.value.name} ${placedElements.value.length + 1}`,
    capacity: selectedElement.value.type.includes('table') ? parseInt(selectedElement.value.type.replace('table', '')) : 1
  })
}

const selectPlacedElement = (index) => {
  selectedPlacedIndex.value = index
  selectedElement.value = null
}

const deleteSelectedElement = () => {
  if (selectedPlacedIndex.value !== null) {
    placedElements.value.splice(selectedPlacedIndex.value, 1)
    selectedPlacedIndex.value = null
  }
}

const saveLayout = () => {
  console.log('Saving layout:', placedElements.value)
  showSaveDialog.value = true
}

const goBackToEnvironment = () => {
  console.log('Navigate back')
}
</script>

<style scoped>
/* ═══ TYPOGRAPHY ═══ */
.brand-logo {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #D4AF37;
  letter-spacing: 0.04em;
}

.admin-badge {
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ═══ SECONDARY NAV ═══ */
.secondary-nav {
  background: #111720;
  border-bottom: 1px solid rgba(212, 175, 55, 0.18);
  padding: 8px 0;
}

.nav-tab {
  font-family: 'Inter', sans-serif !important;
  font-size: 0.85rem !important;
  font-weight: 500 !important;
  color: #6A7080 !important;
  text-transform: none !important;
  letter-spacing: 0.02em !important;
}

.nav-tab--active {
  color: #D4AF37 !important;
  background: rgba(212, 175, 55, 0.08) !important;
}

.mode-toggle {
  display: flex;
  align-items: center;
}

.mode-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #6A7080;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ═══ SIDEBARS ═══ */
.sidebar-left,
.sidebar-right {
  background: #111720;
  border-right: 1px solid rgba(212, 175, 55, 0.18);
  height: 100%;
  overflow-y: auto;
}

.sidebar-right {
  border-right: none;
  border-left: 1px solid rgba(212, 175, 55, 0.18);
}

.sidebar-content {
  padding: 16px;
}

.sidebar-header {
  margin-bottom: 16px;
}

.sidebar-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  color: #D4AF37;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-style: italic;
}

/* Element List */
.element-list {
  background: transparent;
}

.element-category {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  color: #6A7080;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
  padding: 8px 0;
}

.element-item {
  border-radius: 6px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.element-item:hover {
  background: rgba(212, 175, 55, 0.08);
  border-color: rgba(212, 175, 55, 0.2);
}

.element-item--selected {
  background: rgba(212, 175, 55, 0.15) !important;
  border-color: #D4AF37 !important;
}

.element-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.element-name {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #F0EAD6;
  font-weight: 500;
}

/* ═══ CANVAS ═══ */
.canvas-area {
  background: #0A0E14;
  padding: 20px;
}

.canvas-wrapper {
  width: 100%;
  height: 100%;
  background: #161D2B;
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.canvas-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #111720;
  border-bottom: 1px solid rgba(212, 175, 55, 0.18);
}

.canvas-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #F0EAD6;
}

.canvas-actions {
  display: flex;
  gap: 4px;
}

.canvas-grid {
  flex: 1;
  position: relative;
  background: #0A0E14;
  cursor: crosshair;
}

.grid-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.canvas-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

/* Placed Elements */
.placed-element {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(46, 187, 87, 0.1);
  border: 2px solid rgba(46, 187, 87, 0.4);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  transform-origin: center;
}

.placed-element:hover {
  border-color: #2EBB57;
  background: rgba(46, 187, 87, 0.2);
  transform: scale(1.05);
}

.placed-element--selected {
  border-color: #D4AF37 !important;
  background: rgba(212, 175, 55, 0.15) !important;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
}

.placed-element-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.placed-element-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  color: #F0EAD6;
  font-weight: 600;
  text-align: center;
  padding: 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

/* ═══ PROPERTIES PANEL ═══ */
.properties-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.properties-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.property-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.property-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: #8A8FA8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.property-value {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #D4AF37;
}

/* Property Input Overrides */
:deep(.property-input .v-field) {
  background: #0A0E14;
  border-color: rgba(212, 175, 55, 0.2);
  min-height: 36px;
}

:deep(.property-input .v-field__input) {
  color: #F0EAD6;
  font-size: 0.85rem;
  padding: 8px 12px;
}

:deep(.property-input .v-field--focused) {
  border-color: #D4AF37;
}

:deep(.property-slider .v-slider-thumb__label) {
  background: #D4AF37;
  color: #0A0E14;
  font-weight: 600;
}

/* Delete Button */
.delete-button {
  border: 1px solid rgba(199, 21, 133, 0.4) !important;
  color: #C71585 !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 0.82rem !important;
  font-weight: 500 !important;
  text-transform: none !important;
}

.delete-button:hover {
  background: rgba(199, 21, 133, 0.1) !important;
  border-color: #C71585 !important;
}

/* ═══ BUTTONS ═══ */
.gold-button {
  background: #D4AF37 !important;
  color: #0A0E14 !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 0.85rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
}

/* ═══ DIALOG ═══ */
.dialog-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #F0EAD6;
}

.dialog-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #B8BCC8;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(46, 187, 87, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
</style>