<template>
  <v-app :style="{ background: '#0A0E14' }">
    <!-- ── App Bar ── -->
    <v-app-bar
      flat
      :height="58"
      style="
        background: rgba(17, 23, 32, 0.97);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(212, 175, 55, 0.18);
      "
    >
      <v-container fluid class="d-flex align-center px-6">
        <!-- Logo -->
        <div class="d-flex align-center">
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
            <circle
              cx="20"
              cy="20"
              r="18"
              stroke="#D4AF37"
              stroke-width="1.5"
            />
            <path
              d="M12 28 C12 20 16 14 20 12 C24 14 28 20 28 28"
              stroke="#D4AF37"
              stroke-width="1.5"
              fill="none"
            />
            <path
              d="M8 20 C12 16 16 14 20 14 C24 14 28 16 32 20"
              stroke="#D4AF37"
              stroke-width="1.5"
              fill="none"
            />
            <circle
              cx="20"
              cy="20"
              r="3"
              stroke="#D4AF37"
              stroke-width="1.5"
              fill="none"
            />
          </svg>
          <span class="brand-logo ml-3">Spotly</span>
        </div>

        <v-spacer></v-spacer>

        <!-- Step Indicator -->
        <div class="step-indicator d-none d-md-flex align-center">
          <span class="step-label">Step 2</span>
          <span class="mx-2" style="color: rgba(212, 175, 55, 0.35)">·</span>
          <span class="step-title">Select Table</span>
        </div>

        <v-spacer></v-spacer>

        <!-- Nav Buttons -->
        <v-btn
          flat
          :ripple="false"
          class="text-none px-4 mr-2"
          size="small"
          style="
            background: #d4af37;
            color: #0a0e14;
            font-weight: 600;
            letter-spacing: 0.02em;
          "
        >
          My Profile
        </v-btn>
        <v-btn
          variant="outlined"
          :ripple="false"
          class="text-none px-4"
          size="small"
          style="
            border: 1px solid rgba(212, 175, 55, 0.35);
            color: #d4af37;
            font-weight: 500;
          "
        >
          Log Out
        </v-btn>
      </v-container>
    </v-app-bar>

    <!-- ── Filters Bar ── -->
    <div class="filters-bar">
      <v-container
        fluid
        class="d-flex align-center px-6 py-2"
        style="flex-wrap: wrap; gap: 18px"
      >
        <span class="filters-label">Filters</span>

        <!-- Date Filter -->
        <div class="filter-group">
          <span class="filter-field-label">📅 Date</span>
          <v-menu v-model="dateMenu" :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
                :ripple="false"
                class="filter-chip"
                size="small"
              >
                {{ selectedDate }}
                <v-icon end size="10" style="color: #d4af37"
                  >mdi-chevron-down</v-icon
                >
              </v-btn>
            </template>
            <v-date-picker
              v-model="selectedDate"
              @update:model-value="dateMenu = false"
            ></v-date-picker>
          </v-menu>
        </div>

        <!-- Time Filter -->
        <div class="filter-group">
          <span class="filter-field-label">🕗 Time</span>
          <v-menu v-model="timeMenu" :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
                :ripple="false"
                class="filter-chip"
                size="small"
              >
                {{ selectedTime }}
                <v-icon end size="10" style="color: #d4af37"
                  >mdi-chevron-down</v-icon
                >
              </v-btn>
            </template>
            <v-list style="background: #1a2332">
              <v-list-item
                v-for="time in timeOptions"
                :key="time"
                @click="
                  selectedTime = time;
                  timeMenu = false;
                "
                style="color: #f0ead6"
              >
                {{ time }}
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <!-- Guests Control -->
        <div class="filter-group">
          <span class="filter-field-label">👥 Guests</span>
          <div class="guests-control">
            <v-btn
              icon
              size="x-small"
              variant="text"
              :ripple="false"
              @click="decrementGuests"
              style="color: #d4af37"
            >
              <v-icon size="16">mdi-minus</v-icon>
            </v-btn>
            <span class="guests-count">{{ guestCount }}</span>
            <v-btn
              icon
              size="x-small"
              variant="text"
              :ripple="false"
              @click="incrementGuests"
              style="color: #d4af37"
            >
              <v-icon size="16">mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>

        <v-spacer></v-spacer>

        <!-- Legend -->
        <div class="legend-inline d-none d-md-flex">
          <div class="legend-item">
            <div class="legend-box legend-box--available"></div>
            <span>Available</span>
          </div>
          <div class="legend-item">
            <div class="legend-box legend-box--reserved"></div>
            <span>Reserved</span>
          </div>
          <div class="legend-item">
            <div class="legend-box legend-box--selected"></div>
            <span>Selected</span>
          </div>
        </div>
      </v-container>
    </div>

    <!-- ── Main Content (Floor Plan) ── -->
    <v-main>
      <div
        class="floor-wrap"
        :style="{
          paddingBottom: selectedTable || selectedSunbed ? '100px' : '20px',
        }"
      >
        <div class="floor-plan">
          <!-- SEA VIEW top wall -->
          <div class="wall wall--top">🌊 Sea View</div>

          <!-- BAR right wall -->
          <div class="wall wall--right">
            <span class="wall-label">🍸 Bar Area</span>
            <div class="bar-counter">
              <div
                v-for="n in 5"
                :key="`bs-${n}`"
                class="bar-stool"
                :class="{ 'bar-stool--taken': [2, 4].includes(n) }"
              ></div>
            </div>
          </div>

          <!-- ENTRANCE bottom wall -->
          <div class="wall wall--bottom">🚪 Entrance</div>

          <!-- SUNBEDS left strip -->
          <div class="sunbeds-strip">
            <div class="sunbeds-label">Sunbeds</div>
            <div
              v-for="n in 4"
              :key="`sb-${n}`"
              class="sunbed"
              :class="{
                'sunbed--reserved': n === 3,
                'sunbed--selected': selectedSunbed === n,
              }"
              @click="n !== 3 && selectSunbed(n)"
            >
              <svg viewBox="0 0 38 20" fill="none" width="38" height="20">
                <rect
                  x="2"
                  y="3"
                  width="10"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <rect
                  x="14"
                  y="6"
                  width="22"
                  height="9"
                  rx="2"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <line
                  x1="16"
                  y1="15"
                  x2="16"
                  y2="19"
                  stroke="currentColor"
                  stroke-width="1.3"
                />
                <line
                  x1="34"
                  y1="15"
                  x2="34"
                  y2="19"
                  stroke="currentColor"
                  stroke-width="1.3"
                />
              </svg>
              <span class="sunbed-num">{{ n }}</span>
              <div
                class="sb-dot"
                :class="n === 3 ? 'sb-dot--rose' : 'sb-dot--green'"
              ></div>
            </div>
          </div>

          <!-- Zone labels -->
          <div class="zone-label" style="top: 72px; left: 200px">Zone A</div>
          <div class="zone-label" style="top: 232px; left: 200px">Zone B</div>
          <div
            class="zone-label zone-label--vip"
            style="top: 392px; left: 200px"
          >
            ✦ VIP
          </div>

          <!-- Horizontal zone dividers -->
          <div
            class="zone-divider"
            style="top: 224px; left: 130px; width: 690px"
          ></div>
          <div
            class="zone-divider zone-divider--vip"
            style="top: 384px; left: 130px; width: 690px"
          ></div>

          <!-- TABLES (absolute positions) -->
          <div
            v-for="t in allTables"
            :key="t.id"
            class="table-unit"
            :class="{
              'tu--available': t.status === 'available',
              'tu--reserved': t.status === 'reserved',
              'tu--selected': selectedTable === t.id,
              'tu--vip': t.vip,
            }"
            :style="{ left: t.x + 'px', top: t.y + 'px' }"
            @click="selectTable(t)"
          >
            <!-- Top chairs -->
            <div class="chair-row">
              <div
                v-for="i in t.topSeats"
                :key="'t' + i"
                class="chair chair--h"
              ></div>
            </div>

            <!-- Middle: left chairs + surface + right chairs -->
            <div class="tu-middle">
              <div class="chair-col">
                <div
                  v-for="i in t.leftSeats"
                  :key="'l' + i"
                  class="chair chair--v"
                ></div>
              </div>
              <div
                class="tu-surface"
                :class="t.vip ? 'tu-surface--round' : ''"
              ></div>
              <div class="chair-col">
                <div
                  v-for="i in t.rightSeats"
                  :key="'r' + i"
                  class="chair chair--v"
                ></div>
              </div>
            </div>

            <!-- Bottom chairs -->
            <div class="chair-row">
              <div
                v-for="i in t.bottomSeats"
                :key="'b' + i"
                class="chair chair--h"
              ></div>
            </div>

            <!-- Label -->
            <div class="tu-label">
              <span class="tu-name">{{ t.name }}</span>
              <span class="tu-seats">{{ t.seats }} seats</span>
            </div>
          </div>
        </div>
      </div>
    </v-main>

    <!-- ── Action Bar (slides up when selection made) ── -->
    <div
      class="action-bar"
      :class="{
        'action-bar--visible':
          selectedTable !== null || selectedSunbed !== null,
      }"
    >
      <v-container fluid class="d-flex align-center justify-space-between px-6">
        <!-- Selection Summary -->
        <div class="selection-summary" v-if="selectedTable !== null">
          <span class="summary-icon">🪑</span>
          <div class="summary-info">
            <span class="summary-title">{{ getSelectedInfo()?.name }}</span>
            <span class="summary-meta"
              >{{ getSelectedInfo()?.seats }} seats · {{ selectedDate }} ·
              {{ selectedTime }}</span
            >
          </div>
        </div>
        <div class="selection-summary" v-else-if="selectedSunbed !== null">
          <span class="summary-icon">🛏</span>
          <div class="summary-info">
            <span class="summary-title">Sunbed {{ selectedSunbed }}</span>
            <span class="summary-meta">Beachside · {{ selectedDate }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <v-btn
            variant="outlined"
            :ripple="false"
            class="secondary-button mr-2"
            @click="clearSelection"
          >
            Clear
          </v-btn>
          <v-btn
            flat
            :ripple="false"
            class="gold-button"
            @click="confirmSelection"
          >
            Confirm Reservation
          </v-btn>
        </div>
      </v-container>
    </div>
  </v-app>
</template>

<script setup>
import { ref, computed } from "vue";

const selectedDate = ref("14/09/2026");
const selectedTime = ref("19:00h");
const guestCount = ref(2);
const selectedTable = ref(null);
const selectedSunbed = ref(null);

const dateMenu = ref(false);
const timeMenu = ref(false);

const timeOptions = [
  "17:00h",
  "17:30h",
  "18:00h",
  "18:30h",
  "19:00h",
  "19:30h",
  "20:00h",
  "20:30h",
  "21:00h",
  "21:30h",
  "22:00h",
];

// Tables with absolute positions
const allTables = ref([
  // Zone A
  {
    id: 1,
    name: "Table A1",
    seats: 4,
    status: "available",
    vip: false,
    x: 200,
    y: 82,
    topSeats: 2,
    bottomSeats: 2,
    leftSeats: 0,
    rightSeats: 0,
  },
  {
    id: 2,
    name: "Table A2",
    seats: 4,
    status: "reserved",
    vip: false,
    x: 380,
    y: 82,
    topSeats: 2,
    bottomSeats: 2,
    leftSeats: 0,
    rightSeats: 0,
  },
  {
    id: 3,
    name: "Table A3",
    seats: 2,
    status: "available",
    vip: false,
    x: 560,
    y: 82,
    topSeats: 1,
    bottomSeats: 1,
    leftSeats: 0,
    rightSeats: 0,
  },
  {
    id: 4,
    name: "Table A4",
    seats: 2,
    status: "available",
    vip: false,
    x: 680,
    y: 82,
    topSeats: 1,
    bottomSeats: 1,
    leftSeats: 0,
    rightSeats: 0,
  },

  // Zone B
  {
    id: 5,
    name: "Table B1",
    seats: 6,
    status: "available",
    vip: false,
    x: 200,
    y: 250,
    topSeats: 3,
    bottomSeats: 3,
    leftSeats: 0,
    rightSeats: 0,
  },
  {
    id: 6,
    name: "Table B2",
    seats: 4,
    status: "available",
    vip: false,
    x: 400,
    y: 250,
    topSeats: 2,
    bottomSeats: 2,
    leftSeats: 0,
    rightSeats: 0,
  },
  {
    id: 7,
    name: "Table B3",
    seats: 6,
    status: "reserved",
    vip: false,
    x: 575,
    y: 250,
    topSeats: 2,
    bottomSeats: 2,
    leftSeats: 1,
    rightSeats: 1,
  },

  // Zone VIP
  {
    id: 8,
    name: "VIP 1",
    seats: 8,
    status: "available",
    vip: true,
    x: 200,
    y: 405,
    topSeats: 2,
    bottomSeats: 2,
    leftSeats: 2,
    rightSeats: 2,
  },
  {
    id: 9,
    name: "VIP 2",
    seats: 8,
    status: "reserved",
    vip: true,
    x: 420,
    y: 405,
    topSeats: 2,
    bottomSeats: 2,
    leftSeats: 2,
    rightSeats: 2,
  },
  {
    id: 10,
    name: "VIP 3",
    seats: 6,
    status: "available",
    vip: true,
    x: 640,
    y: 405,
    topSeats: 2,
    bottomSeats: 2,
    leftSeats: 1,
    rightSeats: 1,
  },
]);

const selectTable = (t) => {
  if (t.status === "reserved") return;
  selectedTable.value = selectedTable.value === t.id ? null : t.id;
  selectedSunbed.value = null;
};

const selectSunbed = (n) => {
  selectedSunbed.value = selectedSunbed.value === n ? null : n;
  selectedTable.value = null;
};

const getSelectedInfo = () =>
  allTables.value.find((t) => t.id === selectedTable.value);

const clearSelection = () => {
  selectedTable.value = null;
  selectedSunbed.value = null;
};

const confirmSelection = () => {
  console.log("Confirming reservation...");
  // Navigate to P6 confirmation page
};

const incrementGuests = () => guestCount.value++;
const decrementGuests = () => {
  if (guestCount.value > 1) guestCount.value--;
};
</script>

<style scoped>
/* ═══ DESIGN SYSTEM TYPOGRAPHY ═══ */
.brand-logo {
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #d4af37;
  letter-spacing: 0.04em;
}

.step-label {
  font-family: "Playfair Display", Georgia, serif;
  font-size: 0.8rem;
  color: #d4af37;
}

.step-title {
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  font-weight: 500;
  color: #f0ead6;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ═══ FILTERS BAR ═══ */
.filters-bar {
  background: #111720;
  border-bottom: 1px solid rgba(212, 175, 55, 0.18);
  position: sticky;
  top: 58px;
  z-index: 50;
}

.filters-label {
  font-family: "Playfair Display", Georgia, serif;
  font-size: 0.76rem;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-style: italic;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 7px;
}

.filter-field-label {
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  color: #6a7080;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.filter-chip {
  background: #161d2b !important;
  border: 1px solid rgba(212, 175, 55, 0.2) !important;
  border-radius: 20px !important;
  color: #f0ead6 !important;
  font-family: "Inter", sans-serif !important;
  font-size: 0.8rem !important;
  padding: 5px 12px !important;
  height: auto !important;
  min-height: 28px !important;
  text-transform: none !important;
  letter-spacing: 0.02em !important;
}

.filter-chip:hover {
  border-color: rgba(212, 175, 55, 0.45) !important;
  background: rgba(212, 175, 55, 0.08) !important;
}

.guests-control {
  display: flex;
  align-items: center;
  background: #161d2b;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 20px;
  padding: 0 4px;
  height: 28px;
}

.guests-count {
  min-width: 26px;
  text-align: center;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  color: #f0ead6;
  padding: 0 4px;
}

/* Legend */
.legend-inline {
  display: flex;
  align-items: center;
  gap: 14px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  color: #6a7080;
}

.legend-box {
  width: 13px;
  height: 13px;
  border-radius: 3px;
  border: 1.5px solid transparent;
}

.legend-box--available {
  background: rgba(46, 187, 87, 0.2);
  border-color: #2ebb57;
}

.legend-box--reserved {
  background: rgba(199, 21, 133, 0.2);
  border-color: #c71585;
}

.legend-box--selected {
  background: rgba(212, 175, 55, 0.25);
  border-color: #d4af37;
}

/* ═══ FLOOR PLAN ═══ */
.floor-wrap {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
  overflow: auto;
  min-height: calc(100vh - 140px);
  transition: padding-bottom 0.3s ease;
}

.floor-plan {
  position: relative;
  width: 860px;
  height: 585px;
  flex-shrink: 0;
  background: #161d2b;
  background-image:
    linear-gradient(rgba(212, 175, 55, 0.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212, 175, 55, 0.022) 1px, transparent 1px);
  background-size: 40px 40px;
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 18px;
  overflow: hidden;
}

/* Walls */
.wall {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 600;
}

.wall--top {
  top: 0;
  left: 0;
  right: 0;
  height: 42px;
  background: linear-gradient(
    90deg,
    rgba(14, 60, 120, 0.55),
    rgba(0, 100, 180, 0.28)
  );
  color: #7ec8e3;
  border-bottom: 1px solid rgba(126, 200, 227, 0.18);
}

.wall--bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: 36px;
  background: rgba(212, 175, 55, 0.05);
  color: #9e7e20;
  border-top: 1px solid rgba(212, 175, 55, 0.18);
  font-size: 0.68rem;
}

.wall--right {
  top: 42px;
  right: 0;
  width: 94px;
  bottom: 36px;
  background: rgba(212, 175, 55, 0.04);
  border-left: 1px solid rgba(212, 175, 55, 0.18);
  flex-direction: column;
  gap: 14px;
  padding: 16px 8px;
}

.wall-label {
  font-size: 0.65rem;
  color: #9e7e20;
  letter-spacing: 0.1em;
  text-align: center;
}

.bar-counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar-stool {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid rgba(46, 187, 87, 0.5);
  background: rgba(46, 187, 87, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.bar-stool:hover {
  border-color: #2ebb57;
  background: rgba(46, 187, 87, 0.2);
}

.bar-stool--taken {
  border-color: rgba(199, 21, 133, 0.5);
  background: rgba(199, 21, 133, 0.1);
  cursor: not-allowed;
}

/* Sunbeds Strip */
.sunbeds-strip {
  position: absolute;
  top: 42px;
  left: 0;
  width: 118px;
  bottom: 36px;
  border-right: 1px solid rgba(212, 175, 55, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  padding: 12px 8px;
}

.sunbeds-label {
  font-family: "Inter", sans-serif;
  font-size: 0.6rem;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-style: italic;
  margin-bottom: 2px;
}

.sunbed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  width: 94px;
  border-radius: 6px;
  border: 1px solid rgba(212, 175, 55, 0.18);
  background: #111720;
  cursor: pointer;
  transition: all 0.2s;
  color: #6a7080;
}

.sunbed:hover {
  border-color: rgba(212, 175, 55, 0.45);
  color: #f0ead6;
  background: rgba(212, 175, 55, 0.08);
}

.sunbed--reserved {
  opacity: 0.5;
  cursor: not-allowed;
}

.sunbed--selected {
  border-color: #d4af37 !important;
  color: #d4af37 !important;
  background: rgba(212, 175, 55, 0.13) !important;
}

.sunbed-num {
  font-family: "Inter", sans-serif;
  font-size: 0.66rem;
}

.sb-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.sb-dot--green {
  background: #2ebb57;
}

.sb-dot--rose {
  background: #c71585;
}

/* Zone Labels */
.zone-label {
  position: absolute;
  font-family: "Inter", sans-serif;
  font-size: 0.62rem;
  color: #6a7080;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 600;
}

.zone-label--vip {
  color: #d4af37;
  font-size: 0.66rem;
}

.zone-divider {
  position: absolute;
  height: 1px;
  background: repeating-linear-gradient(
    90deg,
    rgba(212, 175, 55, 0.22) 0,
    rgba(212, 175, 55, 0.22) 5px,
    transparent 5px,
    transparent 11px
  );
}

.zone-divider--vip {
  background: repeating-linear-gradient(
    90deg,
    rgba(212, 175, 55, 0.45) 0,
    rgba(212, 175, 55, 0.45) 5px,
    transparent 5px,
    transparent 11px
  );
}

/* ═══ TABLE UNIT ═══ */
.table-unit {
  position: absolute;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  user-select: none;
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}

.table-unit:hover:not(.tu--reserved) {
  transform: scale(1.05);
}

.chair-row {
  display: flex;
  gap: 6px;
}

.tu-middle {
  display: flex;
  align-items: center;
  gap: 4px;
}

.chair-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chair {
  border-radius: 3px;
  background: rgba(200, 200, 200, 0.18);
  border: 1.5px solid rgba(200, 200, 200, 0.3);
  transition:
    background 0.2s,
    border-color 0.2s;
}

.chair--h {
  width: 16px;
  height: 12px;
}

.chair--v {
  width: 12px;
  height: 18px;
}

.tu-surface {
  width: 88px;
  height: 54px;
  border-radius: 8px;
  background: #161d2b;
  border: 2px solid currentColor;
  transition:
    background 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
}

.tu-surface--round {
  width: 74px;
  height: 74px;
  border-radius: 50%;
}

.tu-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 4px;
}

.tu-name {
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  color: #f0ead6;
  letter-spacing: 0.02em;
}

.tu-seats {
  font-family: "Inter", sans-serif;
  font-size: 0.6rem;
  color: #6a7080;
}

/* Table Status Colors */
.tu--available {
  color: #2ebb57;
}

.tu--available .tu-surface {
  background: rgba(46, 187, 87, 0.07);
  border-color: rgba(46, 187, 87, 0.5);
}

.tu--available .chair {
  background: rgba(46, 187, 87, 0.22);
  border-color: rgba(46, 187, 87, 0.45);
}

.tu--available:hover .tu-surface {
  background: rgba(46, 187, 87, 0.14);
  border-color: #2ebb57;
  box-shadow: 0 0 20px rgba(46, 187, 87, 0.18);
}

.tu--reserved {
  color: #c71585;
  cursor: not-allowed;
  opacity: 0.6;
}

.tu--reserved .tu-surface {
  background: rgba(199, 21, 133, 0.07);
  border-color: rgba(199, 21, 133, 0.35);
}

.tu--reserved .chair {
  background: rgba(199, 21, 133, 0.18);
  border-color: rgba(199, 21, 133, 0.38);
}

.tu--selected {
  color: #d4af37;
}

.tu--selected .tu-surface {
  background: rgba(212, 175, 55, 0.15) !important;
  border-color: #d4af37 !important;
  box-shadow: 0 0 26px rgba(212, 175, 55, 0.28) !important;
}

.tu--selected .chair {
  background: rgba(212, 175, 55, 0.32) !important;
  border-color: #d4af37 !important;
}

/* ═══ ACTION BAR ═══ */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(17, 23, 32, 0.97);
  border-top: 1px solid rgba(212, 175, 55, 0.18);
  padding: 18px 0;
  min-height: 80px;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(12px);
  z-index: 100;
}

.action-bar--visible {
  transform: translateY(0);
}

.selection-summary {
  display: flex;
  align-items: center;
  gap: 14px;
}

.summary-icon {
  font-size: 1.25rem;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-title {
  font-family: "Playfair Display", Georgia, serif;
  font-size: 0.92rem;
  font-weight: 600;
  color: #f0ead6;
}

.summary-meta {
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #6a7080;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.gold-button {
  background: #d4af37 !important;
  color: #0a0e14 !important;
  font-family: "Inter", sans-serif !important;
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
  padding: 10px 24px !important;
  box-shadow: 0 4px 14px rgba(212, 175, 55, 0.2);
}

.gold-button:hover {
  background: #e8c84a !important;
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.35);
}

.secondary-button {
  border: 1px solid rgba(212, 175, 55, 0.35) !important;
  color: #d4af37 !important;
  font-family: "Inter", sans-serif !important;
  font-size: 0.8rem !important;
  font-weight: 500 !important;
  letter-spacing: 0.04em !important;
  padding: 10px 24px !important;
}

.secondary-button:hover {
  border-color: rgba(212, 175, 55, 0.6) !important;
  background: rgba(212, 175, 55, 0.08) !important;
}

/* Override Vuetify button text transform */
:deep(.v-btn__content) {
  text-transform: inherit !important;
}
</style>
