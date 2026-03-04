<template>
  <!-- APP BAR -->
  <AppNavbarApp
    :nav-links="adminNavLinks"
    active-link="builder"
    admin-label="Admin"
    @nav="handleNav"
  >
    <template #actions>
      <!-- Mode toggle -->
      <div class="mode-segmented mr-4">
        <button
          class="mode-seg-btn"
          :class="{ 'mode-seg-btn--active': !isPreviewMode }"
          @click="isPreviewMode = false"
        >
          <v-icon size="13" class="mr-1">mdi-pencil-ruler</v-icon>Edit
        </button>
        <button
          class="mode-seg-btn"
          :class="{ 'mode-seg-btn--active': isPreviewMode }"
          @click="isPreviewMode = true"
        >
          <v-icon size="13" class="mr-1">mdi-eye-outline</v-icon>Preview
        </button>
      </div>
      <v-btn
        icon
        size="x-small"
        variant="text"
        :ripple="false"
        :disabled="historyIndex <= 0"
        @click="undo"
        style="color: #6a7080"
        class="mr-1"
        title="Undo"
      >
        <v-icon size="17">mdi-undo</v-icon>
      </v-btn>
      <v-btn
        icon
        size="x-small"
        variant="text"
        :ripple="false"
        :disabled="historyIndex >= history.length - 1"
        @click="redo"
        style="color: #6a7080"
        class="mr-3"
        title="Redo"
      >
        <v-icon size="17">mdi-redo</v-icon>
      </v-btn>
      <button class="gold-btn" @click="saveLayout">
        <v-icon size="14" class="mr-1">mdi-content-save-outline</v-icon>Save
        Layout
      </button>
    </template>
  </AppNavbarApp>

  <!-- ── Secondary Nav: Back + Environment Tabs ── -->
  <div
    class="secondary-nav"
    style="
      background: rgba(17, 23, 32, 0.97);
      border-bottom: 1px solid rgba(212, 175, 55, 0.1);
      padding: 0 20px;
    "
  >
    <div class="d-flex align-center" style="height: 44px; gap: 4px">
      <button
        class="dash-back-btn"
        @click="router.push('/admin/dashboard')"
        title="Admin Dashboard"
      >
        <v-icon size="12" class="mr-1">mdi-view-dashboard-outline</v-icon
        >Dashboard
      </button>
      <div class="bar-divider mx-4"></div>
      <div class="env-tabs">
        <button
          v-for="env in environments"
          :key="env.id"
          class="env-tab"
          :class="{ 'env-tab--active': currentEnvId === env.id }"
          @click="switchEnv(env.id)"
        >
          <v-icon
            size="13"
            class="mr-1"
            :style="{ color: currentEnvId === env.id ? '#D4AF37' : '#6A7080' }"
            >{{ env.icon }}</v-icon
          >
          {{ env.name }}
        </button>
        <button
          class="env-tab env-tab--add"
          @click="openAddEnv"
          title="Add environment"
        >
          <v-icon size="14">mdi-plus</v-icon>
        </button>
      </div>
    </div>
  </div>

  <!-- MAIN 3-COLUMN BUILDER -->
  <v-main class="spotly-main">
    <div class="builder-layout">
      <!-- LEFT: Palette -->
      <transition name="panel-slide-left">
        <div v-if="!isPreviewMode" class="side-panel palette-panel">
          <div class="panel-head">
            <span class="panel-title">Elements</span>
            <span class="panel-hint">arm → click canvas</span>
          </div>

          <div v-for="cat in paletteCategories" :key="cat.id" class="pal-cat">
            <div class="pal-cat-label">{{ cat.name }}</div>
            <div class="pal-grid">
              <div
                v-for="el in cat.items"
                :key="el.type"
                class="pal-card"
                :class="{ 'pal-card--armed': armedType === el.type }"
                @click="armElement(el.type)"
                :title="el.name"
              >
                <div class="pal-preview" v-if="el.type.startsWith('table_')">
                  <div
                    class="pal-table-mini"
                    :class="{
                      'mini--round':
                        el.type === 'table_round_2' ||
                        el.type === 'table_large_8',
                    }"
                  >
                    <div class="mini-chairs-top">
                      <div
                        v-for="i in getMiniChairs(el.type).top"
                        :key="i"
                        class="mini-chair mini-chair--h"
                      ></div>
                    </div>
                    <div class="mini-mid">
                      <div class="mini-chairs-side">
                        <div
                          v-for="i in getMiniChairs(el.type).left"
                          :key="i"
                          class="mini-chair mini-chair--v"
                        ></div>
                      </div>
                      <div
                        class="mini-surface"
                        :class="{
                          'mini-surface--round':
                            el.type === 'table_round_2' ||
                            el.type === 'table_large_8',
                        }"
                      ></div>
                      <div class="mini-chairs-side">
                        <div
                          v-for="i in getMiniChairs(el.type).right"
                          :key="i"
                          class="mini-chair mini-chair--v"
                        ></div>
                      </div>
                    </div>
                    <div class="mini-chairs-top">
                      <div
                        v-for="i in getMiniChairs(el.type).bottom"
                        :key="i"
                        class="mini-chair mini-chair--h"
                      ></div>
                    </div>
                  </div>
                </div>
                <div class="pal-preview" v-else>
                  <v-icon
                    size="24"
                    :style="{
                      color: armedType === el.type ? '#D4AF37' : '#6A7080',
                    }"
                    >{{ el.icon }}</v-icon
                  >
                </div>
                <div class="pal-name">{{ el.name }}</div>
                <div v-if="armedType === el.type" class="armed-pip"></div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- CENTER: Canvas -->
      <div class="canvas-col">
        <!-- Canvas toolbar -->
        <div class="canvas-bar">
          <div class="d-flex align-center" style="gap: 8px">
            <span class="canvas-env-name">{{ currentEnv?.name }}</span>
            <div class="elem-count-chip">
              {{ currentEnvElements.length }} elements
            </div>
            <div v-if="armedType && !isPreviewMode" class="armed-indicator">
              <v-icon size="11" class="mr-1">mdi-cursor-default-click</v-icon>
              Placing: {{ getElementDef(armedType)?.name }}
              <button class="armed-cancel" @click="armedType = null">✕</button>
            </div>
          </div>
          <div class="d-flex align-center" style="gap: 4px">
            <button
              class="zoom-btn"
              @click="zoom = Math.max(0.4, zoom - 0.25)"
              title="Zoom out"
            >
              <v-icon size="15">mdi-magnify-minus-outline</v-icon>
            </button>
            <span class="zoom-val">{{ Math.round(zoom * 100) }}%</span>
            <button
              class="zoom-btn"
              @click="zoom = Math.min(2, zoom + 0.25)"
              title="Zoom in"
            >
              <v-icon size="15">mdi-magnify-plus-outline</v-icon>
            </button>
            <button
              class="zoom-btn"
              @click="zoom = 1"
              title="Reset zoom"
              style="margin-left: 2px"
            >
              <v-icon size="15">mdi-fullscreen</v-icon>
            </button>
          </div>
        </div>

        <!-- Canvas viewport -->
        <div
          class="canvas-viewport"
          ref="canvasViewport"
          tabindex="0"
          @click="onCanvasClick"
          @mousemove="onCanvasMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
          @keydown.delete.prevent="deleteSelected"
          @keydown.backspace.prevent="deleteSelected"
          @keydown.escape="
            armedType = null;
            selectedId = null;
          "
        >
          <div
            class="canvas-scaler"
            :style="{
              transform: 'scale(' + zoom + ')',
              transformOrigin: '0 0',
              width: (currentEnv?.canvas.width ?? 1000) + 'px',
              height: (currentEnv?.canvas.height ?? 660) + 'px',
            }"
          >
            <!-- Grid SVG -->
            <svg
              class="grid-svg"
              :width="currentEnv?.canvas.width ?? 1000"
              :height="currentEnv?.canvas.height ?? 660"
            >
              <defs>
                <pattern
                  id="g40"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="rgba(212,175,55,0.06)"
                    stroke-width="0.5"
                  />
                </pattern>
                <pattern
                  id="g200"
                  width="200"
                  height="200"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 200 0 L 0 0 0 200"
                    fill="none"
                    stroke="rgba(212,175,55,0.13)"
                    stroke-width="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#g40)" />
              <rect width="100%" height="100%" fill="url(#g200)" />
            </svg>

            <!-- Placed elements -->
            <div
              v-for="el in currentEnvElements"
              :key="el.id"
              class="placed-el"
              :class="[
                {
                  'placed-el--selected': selectedId === el.id && !isPreviewMode,
                },
                {
                  'placed-el--available':
                    isPreviewMode &&
                    el.status === 'available' &&
                    el.type.startsWith('table_'),
                },
                {
                  'placed-el--reserved':
                    isPreviewMode &&
                    el.status === 'reserved' &&
                    el.type.startsWith('table_'),
                },
                { 'placed-el--non-table': !el.type.startsWith('table_') },
              ]"
              :style="getElementStyle(el)"
              @click.stop
              @mousedown.stop="startDrag($event, el)"
            >
              <!-- Table with chairs -->
              <template v-if="el.type.startsWith('table_')">
                <div
                  class="table-unit"
                  :class="{ 'table-unit--round': isRound(el) }"
                >
                  <div class="chair-row">
                    <div
                      v-for="i in getChairs(el).top"
                      :key="'t' + i"
                      class="chair chair--h"
                    ></div>
                  </div>
                  <div
                    class="table-surface"
                    :class="{ 'table-surface--round': isRound(el) }"
                  ></div>
                  <div class="chair-row">
                    <div
                      v-for="i in getChairs(el).bottom"
                      :key="'b' + i"
                      class="chair chair--h"
                    ></div>
                  </div>
                </div>
                <div class="el-label">
                  <span class="el-name">{{ el.label }}</span>
                  <span class="el-seats">{{ el.capacity }}p</span>
                </div>
              </template>

              <!-- Structure / decor -->
              <template v-else>
                <div
                  class="struct-el"
                  :class="'struct-el--' + el.type"
                  :style="getStructStyle(el)"
                >
                  <v-icon size="20" class="struct-icon">{{
                    getElementDef(el.type)?.icon
                  }}</v-icon>
                </div>
                <div class="el-label-sm">{{ el.label }}</div>
              </template>

              <!-- Selection ring -->
              <div
                v-if="selectedId === el.id && !isPreviewMode"
                class="sel-ring"
              >
                <div class="sel-handle sel-h--tl"></div>
                <div class="sel-handle sel-h--tr"></div>
                <div class="sel-handle sel-h--bl"></div>
                <div
                  class="sel-handle sel-h--br sel-h--resize"
                  @mousedown.stop.prevent="startResize($event, el)"
                  :title="
                    el.type.startsWith('table_')
                      ? 'Drag to resize capacity'
                      : 'Drag to resize'
                  "
                ></div>
              </div>
            </div>

            <!-- Placement cursor -->
            <div
              v-if="armedType && cursorSnap.x !== null && !isPreviewMode"
              class="place-cursor"
              :style="{
                left: cursorSnap.x + 'px',
                top: cursorSnap.y + 'px',
                pointerEvents: 'none',
              }"
            >
              <div class="place-cursor-ring"></div>
              <v-icon
                size="12"
                style="
                  color: #d4af37;
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                "
                >mdi-plus</v-icon
              >
            </div>

            <!-- Empty hint -->
            <div
              v-if="currentEnvElements.length === 0 && !armedType"
              class="canvas-empty-hint"
            >
              <v-icon
                size="40"
                style="color: rgba(212, 175, 55, 0.18); margin-bottom: 12px"
                >mdi-floor-plan</v-icon
              >
              <p>
                Select an element from the palette<br />and click the grid to
                place it
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Properties -->
      <transition name="panel-slide-right">
        <div v-if="!isPreviewMode" class="side-panel props-panel">
          <div class="panel-head">
            <span class="panel-title">Properties</span>
          </div>

          <template v-if="selectedEl">
            <div class="prop-type-row">
              <v-icon size="13" class="mr-1" style="color: #d4af37">{{
                getElementDef(selectedEl.type)?.icon
              }}</v-icon>
              <span>{{ getElementDef(selectedEl.type)?.name }}</span>
            </div>

            <div class="prop-group">
              <label class="prop-lbl">Label</label>
              <v-text-field
                v-model="selectedEl.label"
                variant="outlined"
                density="compact"
                hide-details
                class="prop-tf"
                @input="pushHistory"
              />
            </div>

            <div class="prop-group" v-if="selectedEl.type.startsWith('table_')">
              <label class="prop-lbl">Capacity</label>
              <div class="cap-stepper">
                <button class="cap-step-btn" @click="adjustCapacity(-1)">
                  −
                </button>
                <span class="cap-val">{{ selectedEl.capacity }}</span>
                <button class="cap-step-btn" @click="adjustCapacity(1)">
                  +
                </button>
              </div>
            </div>

            <div
              class="prop-group"
              v-if="!selectedEl.type.startsWith('table_')"
            >
              <label class="prop-lbl">Size (grid units)</label>
              <div class="size-steppers">
                <div style="flex: 1">
                  <div
                    class="prop-lbl"
                    style="font-size: 0.58rem; margin-bottom: 3px"
                  >
                    Width
                  </div>
                  <div class="cap-stepper">
                    <button class="cap-step-btn" @click="adjustW(-1)">−</button>
                    <span class="cap-val">{{ selectedEl.w ?? 1 }}</span>
                    <button class="cap-step-btn" @click="adjustW(1)">+</button>
                  </div>
                </div>
                <div style="flex: 1">
                  <div
                    class="prop-lbl"
                    style="font-size: 0.58rem; margin-bottom: 3px"
                  >
                    Height
                  </div>
                  <div class="cap-stepper">
                    <button class="cap-step-btn" @click="adjustH(-1)">−</button>
                    <span class="cap-val">{{ selectedEl.h ?? 1 }}</span>
                    <button class="cap-step-btn" @click="adjustH(1)">+</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="prop-group" v-if="selectedEl.type.startsWith('table_')">
              <label class="prop-lbl">Shape</label>
              <div class="shape-toggle">
                <button
                  class="shape-btn"
                  :class="{ 'shape-btn--on': !isRound(selectedEl) }"
                  @click="setShape('rect')"
                >
                  <svg width="20" height="14" viewBox="0 0 20 14">
                    <rect
                      x="1"
                      y="1"
                      width="18"
                      height="12"
                      rx="2"
                      stroke="currentColor"
                      stroke-width="1.5"
                      fill="none"
                    />
                  </svg>
                  Rect
                </button>
                <button
                  class="shape-btn"
                  :class="{ 'shape-btn--on': isRound(selectedEl) }"
                  @click="setShape('round')"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14">
                    <circle
                      cx="7"
                      cy="7"
                      r="6"
                      stroke="currentColor"
                      stroke-width="1.5"
                      fill="none"
                    />
                  </svg>
                  Round
                </button>
              </div>
            </div>

            <div class="prop-divider"></div>

            <div class="prop-row">
              <div class="prop-group prop-group--half">
                <label class="prop-lbl">X</label>
                <v-text-field
                  v-model.number="selectedEl.x"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="prop-tf"
                  @input="pushHistory"
                />
              </div>
              <div class="prop-group prop-group--half">
                <label class="prop-lbl">Y</label>
                <v-text-field
                  v-model.number="selectedEl.y"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="prop-tf"
                  @input="pushHistory"
                />
              </div>
            </div>

            <div class="prop-group">
              <label class="prop-lbl"
                >Rotation — {{ selectedEl.rotation }}°</label
              >
              <v-slider
                v-model="selectedEl.rotation"
                :min="0"
                :max="315"
                :step="45"
                hide-details
                color="#D4AF37"
                class="prop-slider"
                @end="pushHistory"
              />
            </div>

            <div class="prop-divider"></div>

            <div class="prop-group" v-if="selectedEl.type.startsWith('table_')">
              <label class="prop-lbl">Status (preview)</label>
              <div class="status-toggle">
                <button
                  class="status-btn status-btn--avail"
                  :class="{
                    'status-btn--on': selectedEl.status === 'available',
                  }"
                  @click="
                    selectedEl.status = 'available';
                    pushHistory();
                  "
                >
                  Available
                </button>
                <button
                  class="status-btn status-btn--rsvd"
                  :class="{
                    'status-btn--on': selectedEl.status === 'reserved',
                  }"
                  @click="
                    selectedEl.status = 'reserved';
                    pushHistory();
                  "
                >
                  Reserved
                </button>
              </div>
            </div>

            <div class="prop-divider"></div>

            <button class="delete-el-btn" @click="deleteSelected">
              <v-icon size="14" class="mr-1">mdi-delete-outline</v-icon>Delete
              Element
            </button>
          </template>

          <template v-else>
            <div class="env-settings-head">Environment</div>

            <div class="prop-group">
              <label class="prop-lbl">Name</label>
              <v-text-field
                v-model="currentEnv.name"
                variant="outlined"
                density="compact"
                hide-details
                class="prop-tf"
              />
            </div>

            <div class="prop-divider"></div>

            <div class="props-idle">
              <v-icon
                size="36"
                style="color: rgba(212, 175, 55, 0.18); margin-bottom: 10px"
                >mdi-cursor-default-click</v-icon
              >
              <p>Click an element on the canvas to edit its properties</p>
            </div>

            <div class="prop-divider"></div>

            <button
              class="danger-env-btn"
              @click="openDeleteEnv"
              :disabled="environments.length <= 1"
            >
              <v-icon size="14" class="mr-1">mdi-trash-can-outline</v-icon
              >Delete Environment
            </button>
          </template>
        </div>
      </transition>
    </div>
  </v-main>

  <!-- Save Dialog -->
  <v-dialog v-model="showSaveDialog" max-width="380">
    <v-card
      flat
      style="
        background: var(--color-surface);
        border: 1px solid rgba(212, 175, 55, 0.18);
        border-radius: 16px;
      "
    >
      <v-card-text class="pa-7 text-center">
        <div class="save-icon-ring">
          <v-icon size="44" style="color: #2ebb57"
            >mdi-check-circle-outline</v-icon
          >
        </div>
        <div class="save-dlg-title mt-4">Layout Saved</div>
        <div class="save-dlg-sub mt-1">
          {{ totalElements }} elements · {{ environments.length }} environment{{
            environments.length !== 1 ? "s" : ""
          }}
        </div>
        <pre class="json-preview mt-4">{{ jsonPreview }}</pre>
        <button class="gold-btn w-100 mt-5" @click="showSaveDialog = false">
          Done
        </button>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Add environment dialog -->
  <v-dialog v-model="showAddEnvDialog" max-width="360">
    <v-card
      flat
      style="
        background: var(--color-surface);
        border: 1px solid rgba(212, 175, 55, 0.18);
        border-radius: 16px;
      "
    >
      <v-card-text class="pa-6">
        <div class="dlg-heading mb-4">New Environment</div>
        <v-text-field
          v-model="newEnvName"
          variant="outlined"
          density="compact"
          hide-details
          label="Name (e.g. Rooftop Bar)"
          class="prop-tf mb-4"
          @keydown.enter="confirmAddEnv"
        />
        <div class="d-flex" style="gap: 8px">
          <button
            class="outline-btn flex-grow-1"
            @click="showAddEnvDialog = false"
          >
            Cancel
          </button>
          <button class="gold-btn flex-grow-1" @click="confirmAddEnv">
            Create
          </button>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Delete environment dialog -->
  <v-dialog v-model="showDeleteEnvDialog" max-width="360">
    <v-card
      flat
      style="
        background: var(--color-surface);
        border: 1px solid rgba(199, 21, 133, 0.3);
        border-radius: 16px;
      "
    >
      <v-card-text class="pa-6 text-center">
        <v-icon size="40" style="color: #c71585; margin-bottom: 12px"
          >mdi-alert-outline</v-icon
        >
        <div class="dlg-heading mb-2">Delete "{{ currentEnv?.name }}"?</div>
        <div class="dlg-sub mb-5">
          This removes {{ currentEnvElements.length }} elements and cannot be
          undone.
        </div>
        <div class="d-flex" style="gap: 8px">
          <button
            class="outline-btn flex-grow-1"
            @click="showDeleteEnvDialog = false"
          >
            Cancel
          </button>
          <button class="danger-btn flex-grow-1" @click="confirmDeleteEnv">
            Delete
          </button>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import AppNavbarApp from "@/components/layout/AppNavbarApp.vue";
import { useAdminNav } from "@/composables/useAdminNav";
const router = useRouter();

// ─── Admin Nav ───────────────────────────────────────────────────────────────────────────────
const { adminNavLinks, handleNav } = useAdminNav();

  if (routes[key]) router.push(routes[key]);
};

// ── Element catalog ──────────────────────────────────────────────────────────
const elementDefs = {
  table_round_2: {
    type: "table_round_2",
    name: "Round 2",
    icon: "mdi-circle-outline",
    defaultCapacity: 2,
  },
  table_rect_4: {
    type: "table_rect_4",
    name: "Square 4",
    icon: "mdi-square-outline",
    defaultCapacity: 4,
  },
  table_rect_6: {
    type: "table_rect_6",
    name: "Rect 6",
    icon: "mdi-rectangle-outline",
    defaultCapacity: 6,
  },
  table_large_8: {
    type: "table_large_8",
    name: "Round 8",
    icon: "mdi-circle-double",
    defaultCapacity: 8,
  },
  entrance: {
    type: "entrance",
    name: "Entrance",
    icon: "mdi-location-enter",
    defaultCapacity: 0,
  },
  bar_counter: {
    type: "bar_counter",
    name: "Bar",
    icon: "mdi-glass-cocktail",
    defaultCapacity: 0,
  },
  stage: {
    type: "stage",
    name: "Stage",
    icon: "mdi-microphone-outline",
    defaultCapacity: 0,
  },
  plant: {
    type: "plant",
    name: "Plant",
    icon: "mdi-flower-tulip-outline",
    defaultCapacity: 0,
  },
  pillar: {
    type: "pillar",
    name: "Pillar",
    icon: "mdi-pillar",
    defaultCapacity: 0,
  },
};
const getElementDef = (type) => elementDefs[type] ?? null;

const paletteCategories = [
  {
    id: "tables",
    name: "Tables",
    items: [
      elementDefs.table_round_2,
      elementDefs.table_rect_4,
      elementDefs.table_rect_6,
      elementDefs.table_large_8,
    ],
  },
  {
    id: "structure",
    name: "Structure",
    items: [elementDefs.entrance, elementDefs.bar_counter, elementDefs.stage],
  },
  {
    id: "decor",
    name: "Decor",
    items: [elementDefs.plant, elementDefs.pillar],
  },
];

// ── Data model (canonical JSON — will be POST'd to API) ──────────────────────
const environments = ref([
  {
    id: "env_indoor",
    name: "Indoor Lounge",
    icon: "mdi-sofa-outline",
    canvas: { width: 1000, height: 660 },
    elements: [
      {
        id: "e1",
        type: "table_rect_4",
        shape: "rect",
        label: "Table A1",
        capacity: 4,
        x: 100,
        y: 90,
        rotation: 0,
        status: "available",
      },
      {
        id: "e2",
        type: "table_rect_4",
        shape: "rect",
        label: "Table A2",
        capacity: 4,
        x: 240,
        y: 90,
        rotation: 0,
        status: "reserved",
      },
      {
        id: "e3",
        type: "table_rect_4",
        shape: "rect",
        label: "Table A3",
        capacity: 4,
        x: 100,
        y: 230,
        rotation: 0,
        status: "available",
      },
      {
        id: "e4",
        type: "table_rect_6",
        shape: "rect",
        label: "Table B1",
        capacity: 6,
        x: 80,
        y: 390,
        rotation: 0,
        status: "available",
      },
      {
        id: "e5",
        type: "table_rect_6",
        shape: "rect",
        label: "Table B2",
        capacity: 6,
        x: 270,
        y: 390,
        rotation: 0,
        status: "reserved",
      },
      {
        id: "e6",
        type: "table_large_8",
        shape: "round",
        label: "VIP 1",
        capacity: 8,
        x: 540,
        y: 80,
        rotation: 0,
        status: "available",
      },
      {
        id: "e7",
        type: "table_round_2",
        shape: "round",
        label: "VIP 2",
        capacity: 2,
        x: 720,
        y: 80,
        rotation: 0,
        status: "available",
      },
      {
        id: "e8",
        type: "table_large_8",
        shape: "round",
        label: "VIP 3",
        capacity: 8,
        x: 540,
        y: 330,
        rotation: 0,
        status: "available",
      },
      {
        id: "e9",
        type: "entrance",
        label: "Entrance",
        capacity: 0,
        w: 1,
        h: 1,
        x: 440,
        y: 590,
        rotation: 0,
        status: "available",
      },
      {
        id: "e10",
        type: "bar_counter",
        label: "Bar",
        capacity: 0,
        w: 3,
        h: 1,
        x: 820,
        y: 450,
        rotation: 0,
        status: "available",
      },
      {
        id: "e11",
        type: "plant",
        label: "Plant",
        capacity: 0,
        w: 1,
        h: 1,
        x: 910,
        y: 100,
        rotation: 0,
        status: "available",
      },
    ],
  },
  {
    id: "env_terrace",
    name: "Outdoor Terrace",
    icon: "mdi-umbrella-beach-outline",
    canvas: { width: 1000, height: 660 },
    elements: [
      {
        id: "et1",
        type: "table_rect_4",
        shape: "rect",
        label: "T1",
        capacity: 4,
        x: 120,
        y: 80,
        rotation: 0,
        status: "available",
      },
      {
        id: "et2",
        type: "table_rect_4",
        shape: "rect",
        label: "T2",
        capacity: 4,
        x: 280,
        y: 80,
        rotation: 0,
        status: "reserved",
      },
      {
        id: "et3",
        type: "table_rect_4",
        shape: "rect",
        label: "T3",
        capacity: 4,
        x: 440,
        y: 80,
        rotation: 0,
        status: "available",
      },
      {
        id: "et4",
        type: "table_rect_6",
        shape: "rect",
        label: "T4",
        capacity: 6,
        x: 120,
        y: 320,
        rotation: 0,
        status: "available",
      },
      {
        id: "et5",
        type: "table_rect_6",
        shape: "rect",
        label: "T5",
        capacity: 6,
        x: 360,
        y: 320,
        rotation: 0,
        status: "available",
      },
    ],
  },
]);

// ── Environment state ─────────────────────────────────────────────────────────
const currentEnvId = ref("env_indoor");
const currentEnv = computed(() =>
  environments.value.find((e) => e.id === currentEnvId.value),
);
const currentEnvElements = computed(() => currentEnv.value?.elements ?? []);
const totalElements = computed(() =>
  environments.value.reduce((s, e) => s + e.elements.length, 0),
);

const switchEnv = (id) => {
  currentEnvId.value = id;
  selectedId.value = null;
  armedType.value = null;
};

// ── Palette / arming ──────────────────────────────────────────────────────────
const armedType = ref(null);
const cursorSnap = ref({ x: null, y: null });

const armElement = (type) => {
  armedType.value = armedType.value === type ? null : type;
  selectedId.value = null;
};

// ── Canvas interaction ────────────────────────────────────────────────────────
const GRID = 40;
const zoom = ref(1);
const canvasViewport = ref(null);
let idCounter = 200;

const getCanvasCoords = (e) => {
  const vp = canvasViewport.value;
  const rect = vp.getBoundingClientRect();
  const rawX = (e.clientX - rect.left + vp.scrollLeft) / zoom.value;
  const rawY = (e.clientY - rect.top + vp.scrollTop) / zoom.value;
  return {
    x: Math.round(rawX / GRID) * GRID,
    y: Math.round(rawY / GRID) * GRID,
    rawX,
    rawY,
  };
};

const onCanvasClick = (e) => {
  if (!armedType.value) {
    selectedId.value = null;
    return;
  }
  const { x, y } = getCanvasCoords(e);
  const def = getElementDef(armedType.value);
  const isTableType = armedType.value.startsWith("table_");
  const newEl = {
    id: "el_" + ++idCounter,
    type: armedType.value,
    label:
      def.name +
      " " +
      (currentEnvElements.value.filter((el) => el.type === armedType.value)
        .length +
        1),
    capacity: def.defaultCapacity,
    ...(isTableType
      ? {
          shape:
            armedType.value === "table_round_2" ||
            armedType.value === "table_large_8"
              ? "round"
              : "rect",
        }
      : { w: 1, h: 1 }),
    x,
    y,
    rotation: 0,
    status: "available",
  };
  currentEnv.value.elements.push(newEl);
  selectedId.value = newEl.id;
  pushHistory();
};

const onCanvasMouseMove = (e) => {
  if (!armedType.value && !isDragging.value) return;
  const { x, y, rawX, rawY } = getCanvasCoords(e);
  if (armedType.value) cursorSnap.value = { x, y };
  if (isDragging.value && dragTarget.value) {
    const dx = rawX - dragOrigin.rawX;
    const dy = rawY - dragOrigin.rawY;
    dragTarget.value.x = Math.round((dragOrigin.elX + dx) / GRID) * GRID;
    dragTarget.value.y = Math.round((dragOrigin.elY + dy) / GRID) * GRID;
  }
};

const onMouseUp = () => {
  if (isDragging.value) {
    pushHistory();
    isDragging.value = false;
    dragTarget.value = null;
  }
};

// ── Selection — mousedown sets it; canvas click clears it ────────────────────
const selectedId = ref(null);
const selectedEl = computed(
  () =>
    currentEnvElements.value.find((el) => el.id === selectedId.value) ?? null,
);

// ── Drag to move ───────────────────────────────────────────────────────────────
const isDragging = ref(false);
const dragTarget = ref(null);
const dragOrigin = { rawX: 0, rawY: 0, elX: 0, elY: 0 };

const startDrag = (e, el) => {
  if (armedType.value || isPreviewMode.value) return;
  // Select immediately on mousedown — no toggle
  selectedId.value = el.id;
  e.preventDefault();
  const { rawX, rawY } = getCanvasCoords(e);
  dragOrigin.rawX = rawX;
  dragOrigin.rawY = rawY;
  dragOrigin.elX = el.x;
  dragOrigin.elY = el.y;
  dragTarget.value = el;
  isDragging.value = true;
};

// ── Resize (drag BR handle) — document-level capture for reliability ─────────
const isResizing = ref(false);
const resizeTarget = ref(null);
const resizeOrigin = { clientX: 0, clientY: 0, origCap: 0, origW: 1, origH: 1 };

const onResizeMove = (e) => {
  if (!isResizing.value || !resizeTarget.value) return;
  const dx = (e.clientX - resizeOrigin.clientX) / zoom.value;
  const dy = (e.clientY - resizeOrigin.clientY) / zoom.value;
  const el = resizeTarget.value;
  if (el.type.startsWith("table_")) {
    const delta = Math.round((dx + dy) / GRID);
    el.capacity = Math.max(1, resizeOrigin.origCap + delta);
  } else {
    el.w = Math.max(1, Math.round(resizeOrigin.origW + dx / GRID));
    el.h = Math.max(1, Math.round(resizeOrigin.origH + dy / GRID));
  }
};

const onResizeEnd = () => {
  if (!isResizing.value) return;
  pushHistory();
  isResizing.value = false;
  resizeTarget.value = null;
  document.removeEventListener("mousemove", onResizeMove);
  document.removeEventListener("mouseup", onResizeEnd);
};

const startResize = (e, el) => {
  if (isPreviewMode.value) return;
  isResizing.value = true;
  resizeTarget.value = el;
  resizeOrigin.clientX = e.clientX;
  resizeOrigin.clientY = e.clientY;
  resizeOrigin.origCap = el.capacity;
  resizeOrigin.origW = el.w ?? 1;
  resizeOrigin.origH = el.h ?? 1;
  document.addEventListener("mousemove", onResizeMove);
  document.addEventListener("mouseup", onResizeEnd, { once: true });
};

// ── Undo / Redo ───────────────────────────────────────────────────────────────
const history = ref([]);
const historyIndex = ref(-1);

const pushHistory = () => {
  const snap = JSON.stringify(environments.value);
  history.value = history.value.slice(0, historyIndex.value + 1);
  history.value.push(snap);
  historyIndex.value = history.value.length - 1;
};
const undo = () => {
  if (historyIndex.value <= 0) return;
  historyIndex.value--;
  environments.value = JSON.parse(history.value[historyIndex.value]);
};
const redo = () => {
  if (historyIndex.value >= history.value.length - 1) return;
  historyIndex.value++;
  environments.value = JSON.parse(history.value[historyIndex.value]);
};
pushHistory();

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteSelected = () => {
  if (!selectedId.value) return;
  const idx = currentEnv.value.elements.findIndex(
    (el) => el.id === selectedId.value,
  );
  if (idx >= 0) {
    currentEnv.value.elements.splice(idx, 1);
    selectedId.value = null;
    pushHistory();
  }
};

// ── Chair layout — always driven by el.capacity, 1 seat per increment ─────────
const getChairs = (el) => {
  const cap = el.capacity;
  if (!cap || cap <= 0) return { top: 0, bottom: 0 };
  return { top: Math.ceil(cap / 2), bottom: Math.floor(cap / 2) };
};
const getMiniChairs = (type) =>
  getChairs({ capacity: elementDefs[type]?.defaultCapacity ?? 2 });
const isRound = (el) => el?.shape === "round";
const getStructStyle = (el) => ({
  width: (el.w ?? 1) * GRID + "px",
  height: (el.h ?? 1) * GRID + "px",
});

// ── Element styles ────────────────────────────────────────────────────────────
const getElementStyle = (el) => ({
  position: "absolute",
  left: el.x + "px",
  top: el.y + "px",
  transform: "rotate(" + el.rotation + "deg)",
  transformOrigin: "center center",
  cursor: isPreviewMode.value
    ? el.type.startsWith("table_")
      ? "pointer"
      : "default"
    : isDragging.value && dragTarget.value?.id === el.id
      ? "grabbing"
      : "grab",
});

// ── Properties panel helpers ──────────────────────────────────────────────────
const adjustCapacity = (delta) => {
  if (!selectedEl.value) return;
  selectedEl.value.capacity = Math.max(1, selectedEl.value.capacity + delta);
  pushHistory();
};
const adjustW = (delta) => {
  if (!selectedEl.value) return;
  selectedEl.value.w = Math.max(1, (selectedEl.value.w ?? 1) + delta);
  pushHistory();
};
const adjustH = (delta) => {
  if (!selectedEl.value) return;
  selectedEl.value.h = Math.max(1, (selectedEl.value.h ?? 1) + delta);
  pushHistory();
};
const setShape = (shape) => {
  if (!selectedEl.value) return;
  selectedEl.value.shape = shape;
  pushHistory();
};

// ── Mode ──────────────────────────────────────────────────────────────────────
const isPreviewMode = ref(false);
watch(isPreviewMode, (v) => {
  if (v) {
    armedType.value = null;
    selectedId.value = null;
  }
});

// ── Environment management ────────────────────────────────────────────────────
const showAddEnvDialog = ref(false);
const showDeleteEnvDialog = ref(false);
const newEnvName = ref("");

const openAddEnv = () => {
  newEnvName.value = "";
  showAddEnvDialog.value = true;
};
const openDeleteEnv = () => {
  if (environments.value.length <= 1) return;
  showDeleteEnvDialog.value = true;
};
const confirmAddEnv = () => {
  const name = newEnvName.value.trim();
  if (!name) return;
  const id = "env_" + Date.now();
  environments.value.push({
    id,
    name,
    icon: "mdi-map-outline",
    canvas: { width: 1000, height: 660 },
    elements: [],
  });
  currentEnvId.value = id;
  showAddEnvDialog.value = false;
  pushHistory();
};
const confirmDeleteEnv = () => {
  const idx = environments.value.findIndex((e) => e.id === currentEnvId.value);
  environments.value.splice(idx, 1);
  currentEnvId.value = environments.value[0]?.id ?? null;
  selectedId.value = null;
  showDeleteEnvDialog.value = false;
  pushHistory();
};

// ── Save ──────────────────────────────────────────────────────────────────────
const showSaveDialog = ref(false);
const jsonPreview = ref("");
const saveLayout = () => {
  const payload = {
    venueId: "venue_demo",
    savedAt: new Date().toISOString(),
    environments: environments.value,
  };
  console.log("Floor plan JSON:", JSON.stringify(payload, null, 2));
  jsonPreview.value = JSON.stringify(payload, null, 2).slice(0, 280) + "\n  …";
  showSaveDialog.value = true;
};
</script>

<style scoped>
.bar-divider {
  width: 1px;
  height: 24px;
  background: rgba(212, 175, 55, 0.18);
  flex-shrink: 0;
}
.dash-back-btn {
  display: flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: #6a7080;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition:
    color 0.15s,
    border-color 0.15s;
  white-space: nowrap;
}
.dash-back-btn:hover {
  color: #d4af37;
  border-color: rgba(212, 175, 55, 0.3);
}
.admin-badge {
  display: flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #d4af37;
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.28);
  padding: 3px 10px;
  border-radius: 20px;
}

/* Env tabs */
.env-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  overflow-x: auto;
  flex-shrink: 0;
  max-width: 480px;
}
.env-tabs::-webkit-scrollbar {
  display: none;
}
.env-tab {
  display: flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 500;
  color: #6a7080;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 4px 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s;
}
.env-tab:hover {
  color: #f0ead6;
  background: rgba(212, 175, 55, 0.06);
}
.env-tab--active {
  color: #d4af37 !important;
  background: rgba(212, 175, 55, 0.12) !important;
  border-color: rgba(212, 175, 55, 0.28) !important;
}
.env-tab--add {
  padding: 4px 8px;
}
.env-tab--add:hover {
  color: #d4af37;
}

/* Mode segmented */
.mode-segmented {
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 8px;
  overflow: hidden;
}
.mode-seg-btn {
  display: flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  color: #6a7080;
  background: transparent;
  border: none;
  padding: 5px 14px;
  cursor: pointer;
  transition: all 0.18s;
}
.mode-seg-btn:hover {
  color: #f0ead6;
}
.mode-seg-btn--active {
  color: #0a0e14 !important;
  background: #d4af37 !important;
  font-weight: 600 !important;
}

/* Buttons */
.gold-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #0a0e14;
  background: #d4af37;
  border: none;
  border-radius: 7px;
  padding: 7px 18px;
  cursor: pointer;
  transition:
    background 0.18s,
    box-shadow 0.18s;
}
.gold-btn:hover {
  background: #e9c74a;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.35);
}
.gold-btn.w-100 {
  width: 100%;
}
.outline-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 500;
  color: #d4af37;
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 7px;
  padding: 7px 18px;
  cursor: pointer;
  transition: all 0.18s;
}
.outline-btn:hover {
  background: rgba(212, 175, 55, 0.08);
}
.danger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 600;
  color: #fff;
  background: #c71585;
  border: none;
  border-radius: 7px;
  padding: 7px 18px;
  cursor: pointer;
  transition: background 0.18s;
}
.danger-btn:hover {
  background: #e0199e;
}

/* Builder layout */
.builder-layout {
  display: flex;
  height: calc(100vh - 60px);
  overflow: hidden;
}
.side-panel {
  width: 210px;
  min-width: 210px;
  background: #0d1219;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid rgba(212, 175, 55, 0.12);
  flex-shrink: 0;
}
.side-panel::-webkit-scrollbar {
  width: 4px;
}
.side-panel::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.18);
  border-radius: 2px;
}
.props-panel {
  border-right: none;
  border-left: 1px solid rgba(212, 175, 55, 0.12);
}
.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 14px 14px 10px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  position: sticky;
  top: 0;
  background: #0d1219;
  z-index: 2;
}
.panel-title {
  font-family: var(--font-heading);
  font-size: 0.88rem;
  font-weight: 600;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-style: italic;
}
.panel-hint {
  font-family: var(--font-body);
  font-size: 0.6rem;
  color: #6a7080;
}

/* Panel transitions */
.panel-slide-left-enter-active,
.panel-slide-left-leave-active,
.panel-slide-right-enter-active,
.panel-slide-right-leave-active {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.panel-slide-left-enter-from,
.panel-slide-left-leave-to,
.panel-slide-right-enter-from,
.panel-slide-right-leave-to {
  width: 0;
  min-width: 0;
  opacity: 0;
}

/* Palette */
.pal-cat {
  padding: 12px 10px 6px;
}
.pal-cat-label {
  font-family: var(--font-body);
  font-size: 0.6rem;
  font-weight: 700;
  color: #6a7080;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  margin-bottom: 8px;
  padding: 0 4px;
}
.pal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.pal-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 4px 7px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.18s;
  min-height: 68px;
}
.pal-card:hover {
  background: rgba(212, 175, 55, 0.07);
  border-color: rgba(212, 175, 55, 0.3);
}
.pal-card--armed {
  background: rgba(212, 175, 55, 0.14) !important;
  border-color: #d4af37 !important;
  box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.3);
}
.pal-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 40px;
}
.pal-name {
  font-family: var(--font-body);
  font-size: 0.62rem;
  color: #8a8fa8;
  text-align: center;
  line-height: 1.2;
}
.pal-card--armed .pal-name {
  color: #d4af37;
}
.armed-pip {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #d4af37;
  box-shadow: 0 0 4px rgba(212, 175, 55, 0.8);
}

/* Mini table preview in palette */
.pal-table-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transform: scale(0.75);
  transform-origin: center;
}
.mini-chairs-top {
  display: flex;
  gap: 3px;
}
.mini-mid {
  display: flex;
  align-items: center;
  gap: 2px;
}
.mini-chairs-side {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.mini-chair {
  background: rgba(212, 175, 55, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.5);
  border-radius: 1px;
}
.mini-chair--h {
  width: 10px;
  height: 6px;
}
.mini-chair--v {
  width: 6px;
  height: 10px;
}
.mini-surface {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 3px;
  width: 44px;
  height: 26px;
}
.mini-surface--round {
  border-radius: 50% !important;
  width: 30px !important;
  height: 30px !important;
}
.mini--round .mini-surface {
  border-radius: 50%;
  width: 30px;
  height: 30px;
}

/* Canvas column */
.canvas-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #0a0e14;
}
.canvas-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #0d1219;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  flex-shrink: 0;
  gap: 8px;
}
.canvas-env-name {
  font-family: var(--font-heading);
  font-size: 0.9rem;
  font-weight: 600;
  color: #f0ead6;
  font-style: italic;
}
.elem-count-chip {
  font-family: var(--font-body);
  font-size: 0.65rem;
  color: #d4af37;
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.22);
  padding: 2px 8px;
  border-radius: 10px;
}
.armed-indicator {
  display: flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: 0.68rem;
  color: #d4af37;
  background: rgba(212, 175, 55, 0.18);
  border: 1px solid rgba(212, 175, 55, 0.4);
  padding: 2px 8px;
  border-radius: 10px;
  animation: pulse-border 1.5s infinite;
}
@keyframes pulse-border {
  0%,
  100% {
    border-color: rgba(212, 175, 55, 0.4);
  }
  50% {
    border-color: rgba(212, 175, 55, 0.8);
  }
}
.armed-cancel {
  background: none;
  border: none;
  color: #d4af37;
  cursor: pointer;
  margin-left: 6px;
  font-size: 0.7rem;
  padding: 0;
  opacity: 0.7;
}
.armed-cancel:hover {
  opacity: 1;
}
.zoom-btn {
  background: transparent;
  border: none;
  color: #6a7080;
  cursor: pointer;
  padding: 3px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: color 0.15s;
}
.zoom-btn:hover {
  color: #d4af37;
}
.zoom-val {
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: #8a8fa8;
  min-width: 34px;
  text-align: center;
}

/* Canvas viewport */
.canvas-viewport {
  flex: 1;
  overflow: auto;
  position: relative;
  outline: none;
}
.canvas-viewport::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.canvas-viewport::-webkit-scrollbar-track {
  background: #0a0e14;
}
.canvas-viewport::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.18);
  border-radius: 3px;
}
.canvas-scaler {
  position: relative;
  background: #0d1219;
  border: 1px solid rgba(212, 175, 55, 0.1);
  margin: 16px;
  border-radius: 12px;
  overflow: hidden;
}
.grid-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

/* Table units on canvas */
.placed-el {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  user-select: none;
  transition: filter 0.2s;
}
.table-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #5a6070;
}
.chair-row {
  display: flex;
  gap: 5px;
}
.chair {
  border-radius: 3px;
  background: rgba(200, 200, 200, 0.12);
  border: 1.5px solid rgba(200, 200, 200, 0.22);
  transition:
    background 0.2s,
    border-color 0.2s;
}
.chair--h {
  width: 16px;
  height: 10px;
}
.chair--v {
  width: 10px;
  height: 16px;
}
.table-surface {
  background: rgba(255, 255, 255, 0.04);
  border: 2px solid rgba(200, 200, 200, 0.25);
  border-radius: 6px;
  width: 80px;
  height: 48px;
  transition:
    background 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
}
.table-surface--round,
.table-unit--round .table-surface {
  width: 66px !important;
  height: 66px !important;
  border-radius: 50% !important;
}
.el-label {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.el-name {
  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 700;
  color: #9a9fa8;
  letter-spacing: 0.02em;
}
.el-seats {
  font-family: var(--font-body);
  font-size: 0.58rem;
  color: #5a6070;
}

/* Available (preview) */
.placed-el--available .table-unit {
  color: #2ebb57;
}
.placed-el--available .table-surface {
  background: rgba(46, 187, 87, 0.08) !important;
  border-color: rgba(46, 187, 87, 0.5) !important;
}
.placed-el--available .chair {
  background: rgba(46, 187, 87, 0.2) !important;
  border-color: rgba(46, 187, 87, 0.4) !important;
}
.placed-el--available:hover .table-surface {
  background: rgba(46, 187, 87, 0.15) !important;
  border-color: #2ebb57 !important;
  box-shadow: 0 0 20px rgba(46, 187, 87, 0.2) !important;
}
.placed-el--available .el-name {
  color: #b8f0c8;
}

/* Reserved (preview) */
.placed-el--reserved {
  opacity: 0.7;
  cursor: not-allowed !important;
}
.placed-el--reserved .table-unit {
  color: #c71585;
}
.placed-el--reserved .table-surface {
  background: rgba(199, 21, 133, 0.07) !important;
  border-color: rgba(199, 21, 133, 0.35) !important;
}
.placed-el--reserved .chair {
  background: rgba(199, 21, 133, 0.15) !important;
  border-color: rgba(199, 21, 133, 0.35) !important;
}
.placed-el--reserved .el-name {
  color: #f0a0c8;
}

/* Selected (edit mode) */
.placed-el--selected .table-unit {
  color: #d4af37;
}
.placed-el--selected .table-surface {
  background: rgba(212, 175, 55, 0.14) !important;
  border-color: #d4af37 !important;
  box-shadow: 0 0 22px rgba(212, 175, 55, 0.25) !important;
}
.placed-el--selected .chair {
  background: rgba(212, 175, 55, 0.28) !important;
  border-color: rgba(212, 175, 55, 0.6) !important;
}
.placed-el--selected .el-name {
  color: #d4af37;
}

/* Selection ring */
.sel-ring {
  position: absolute;
  inset: -8px;
  border: 1px dashed rgba(212, 175, 55, 0.6);
  border-radius: 6px;
  pointer-events: none;
}
.sel-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #d4af37;
  border-radius: 2px;
  pointer-events: none;
}
.sel-h--tl {
  top: -4px;
  left: -4px;
}
.sel-h--tr {
  top: -4px;
  right: -4px;
}
.sel-h--bl {
  bottom: -4px;
  left: -4px;
}
.sel-h--br {
  bottom: -4px;
  right: -4px;
}
.sel-h--resize {
  cursor: se-resize !important;
  pointer-events: all;
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.5);
}

/* Structure / decor elements */
.struct-el {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(212, 175, 55, 0.18);
  transition: all 0.2s;
  min-width: 40px;
  min-height: 40px;
}
.size-steppers {
  display: flex;
  gap: 8px;
}
.placed-el--selected .struct-el {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
}
.struct-icon {
  color: #8a8fa8 !important;
}
.placed-el--selected .struct-icon {
  color: #d4af37 !important;
}
.struct-el--entrance {
  background: rgba(126, 200, 227, 0.07);
  border-color: rgba(126, 200, 227, 0.25);
}
.struct-el--bar_counter {
  background: rgba(212, 175, 55, 0.07);
  border-color: rgba(212, 175, 55, 0.25);
}
.struct-el--stage {
  background: rgba(46, 187, 87, 0.07);
  border-color: rgba(46, 187, 87, 0.25);
}
.el-label-sm {
  font-family: var(--font-body);
  font-size: 0.6rem;
  color: #6a7080;
  text-align: center;
  margin-top: 2px;
}

/* Placement cursor */
.place-cursor {
  position: absolute;
  width: 28px;
  height: 28px;
  margin-left: -14px;
  margin-top: -14px;
}
.place-cursor-ring {
  position: absolute;
  inset: 0;
  border: 1.5px solid rgba(212, 175, 55, 0.7);
  border-radius: 50%;
  animation: place-pulse 1s infinite;
}
@keyframes place-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.4;
  }
}
.canvas-empty-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}
.canvas-empty-hint p {
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: #4a5060;
  text-align: center;
  line-height: 1.6;
}

/* Properties panel */
.prop-type-row {
  display: flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 600;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 10px 14px 6px;
}
.prop-group {
  padding: 8px 14px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.prop-group--half {
  flex: 1;
  padding: 8px 0 0;
}
.prop-row {
  display: flex;
  gap: 8px;
  padding: 8px 14px 0;
}
.prop-lbl {
  font-family: var(--font-body);
  font-size: 0.64rem;
  font-weight: 600;
  color: #6a7080;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.prop-divider {
  height: 1px;
  background: rgba(212, 175, 55, 0.1);
  margin: 10px 14px;
}

:deep(.prop-tf .v-field) {
  background: rgba(0, 0, 0, 0.25) !important;
  border-color: rgba(212, 175, 55, 0.18) !important;
}
:deep(.prop-tf .v-field__input) {
  color: #f0ead6 !important;
  font-family: var(--font-body) !important;
  font-size: 0.82rem !important;
  padding: 6px 10px !important;
  min-height: 34px !important;
}
:deep(.prop-tf .v-field--focused) {
  border-color: rgba(212, 175, 55, 0.5) !important;
}
:deep(.prop-tf .v-select__selection-text) {
  color: #f0ead6 !important;
  font-size: 0.82rem !important;
}
:deep(.prop-slider .v-slider-thumb__label) {
  background: #d4af37;
  color: #0a0e14;
  font-weight: 700;
}

.cap-stepper {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 6px;
  overflow: hidden;
  height: 34px;
}
.cap-step-btn {
  width: 34px;
  height: 100%;
  background: rgba(212, 175, 55, 0.08);
  border: none;
  color: #d4af37;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
.cap-step-btn:hover {
  background: rgba(212, 175, 55, 0.18);
}
.cap-val {
  flex: 1;
  text-align: center;
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  color: #f0ead6;
}

.shape-toggle {
  display: flex;
  gap: 6px;
}
.shape-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
  font-family: var(--font-body);
  font-size: 0.62rem;
  color: #6a7080;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.18s;
}
.shape-btn:hover {
  border-color: rgba(212, 175, 55, 0.3);
  color: #f0ead6;
}
.shape-btn--on {
  border-color: #d4af37 !important;
  color: #d4af37 !important;
  background: rgba(212, 175, 55, 0.12) !important;
}
.shape-btn svg {
  color: currentColor;
}

.status-toggle {
  display: flex;
  gap: 6px;
}
.status-btn {
  flex: 1;
  padding: 5px 4px;
  font-family: var(--font-body);
  font-size: 0.62rem;
  font-weight: 600;
  border-radius: 5px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  color: #6a7080;
  background: rgba(255, 255, 255, 0.02);
}
.status-btn--avail {
  border-color: rgba(46, 187, 87, 0.2);
}
.status-btn--avail:hover {
  border-color: #2ebb57;
  color: #2ebb57;
}
.status-btn--avail.status-btn--on {
  background: rgba(46, 187, 87, 0.15) !important;
  border-color: #2ebb57 !important;
  color: #2ebb57 !important;
}
.status-btn--rsvd {
  border-color: rgba(199, 21, 133, 0.2);
}
.status-btn--rsvd:hover {
  border-color: #c71585;
  color: #c71585;
}
.status-btn--rsvd.status-btn--on {
  background: rgba(199, 21, 133, 0.12) !important;
  border-color: #c71585 !important;
  color: #c71585 !important;
}

.delete-el-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - 28px);
  margin: 0 14px;
  padding: 7px;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  color: #c71585;
  background: transparent;
  border: 1px solid rgba(199, 21, 133, 0.3);
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.18s;
}
.delete-el-btn:hover {
  background: rgba(199, 21, 133, 0.1);
  border-color: #c71585;
}

.env-settings-head {
  font-family: var(--font-body);
  font-size: 0.65rem;
  font-weight: 700;
  color: #6a7080;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 12px 14px 4px;
}
.props-idle {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 14px 16px;
}
.props-idle p {
  font-family: var(--font-body);
  font-size: 0.74rem;
  color: #4a5060;
  line-height: 1.5;
}

.danger-env-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - 28px);
  margin: 0 14px 14px;
  padding: 7px;
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: rgba(199, 21, 133, 0.6);
  background: transparent;
  border: 1px solid rgba(199, 21, 133, 0.15);
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.18s;
}
.danger-env-btn:hover:not(:disabled) {
  color: #c71585;
  border-color: rgba(199, 21, 133, 0.35);
}
.danger-env-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Dialogs */
.save-icon-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(46, 187, 87, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border: 1px solid rgba(46, 187, 87, 0.25);
}
.save-dlg-title {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 700;
  color: #f0ead6;
}
.save-dlg-sub {
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: #6a7080;
}
.json-preview {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 0.58rem;
  color: #6a7080;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 6px;
  padding: 10px;
  text-align: left;
  overflow: hidden;
  max-height: 100px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}
.dlg-heading {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 600;
  color: #f0ead6;
}
.dlg-sub {
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: #8a8fa8;
}
</style>
