<template>
  <!-- APP BAR -->
  <AppNavbarVenue
    venue-name="Sunset Beach Club"
    :show-powered-by="true"
    :show-default-actions="false"
  >
    <template #actions>
      <BookingStepIndicator
        :steps="[
          { label: 'Environment' },
          { label: 'Select Table' },
          { label: 'Confirm' },
        ]"
        :current-step="2"
      />
      <v-btn
        variant="text"
        :ripple="false"
        class="text-none px-4 ml-4"
        size="small"
        style="color: rgba(255, 255, 255, 0.55); font-size: 0.78rem"
        @click="$router.push('/booking/environment')"
      >
        <v-icon size="14" class="mr-1">mdi-arrow-left</v-icon>Back
      </v-btn>
    </template>
  </AppNavbarVenue>

  <!-- MAIN LAYOUT -->
  <v-main class="spotly-main">
    <div class="booking-layout">
      <!-- CENTER: Floor plan -->
      <div class="floor-col">
        <!-- Env tabs -->
        <div class="env-tab-bar">
          <div class="env-tabs">
            <button
              v-for="env in floorPlan.environments"
              :key="env.id"
              class="env-tab"
              :class="{ 'env-tab--active': currentEnvId === env.id }"
              @click="switchEnv(env.id)"
            >
              <v-icon
                size="13"
                class="mr-1"
                :style="{
                  color: currentEnvId === env.id ? '#D4AF37' : '#6A7080',
                }"
                >{{ env.icon }}</v-icon
              >
              {{ env.name }}
            </button>
          </div>
          <div class="legend">
            <span class="legend-dot legend-dot--avail"></span
            ><span class="legend-lbl">Available</span>
            <span class="legend-dot legend-dot--rsvd ml-3"></span
            ><span class="legend-lbl">Reserved</span>
            <span class="legend-dot legend-dot--cart ml-3"></span
            ><span class="legend-lbl">In cart</span>
          </div>
        </div>

        <!-- Canvas -->
        <div class="canvas-scroll">
          <div class="canvas-wrap">
            <!-- Grid -->
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
                    stroke="rgba(212,175,55,0.05)"
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
                    stroke="rgba(212,175,55,0.1)"
                    stroke-width="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#g40)" />
              <rect width="100%" height="100%" fill="url(#g200)" />
            </svg>

            <!-- Elements -->
            <div
              v-for="el in currentEnvElements"
              :key="el.id"
              class="placed-el"
              :class="[
                el.type.startsWith('table_')
                  ? getTableClass(el)
                  : 'placed-el--decor',
              ]"
              :style="getElementStyle(el)"
              @click="onTableClick(el)"
            >
              <!-- Table -->
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
                  >
                    <v-icon
                      v-if="isInCart(el.id)"
                      size="14"
                      style="
                        color: #d4af37;
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                      "
                      >mdi-cart</v-icon
                    >
                  </div>
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

              <!-- Decor / structure -->
              <template v-else>
                <div
                  class="struct-el"
                  :class="'struct-el--' + el.type"
                  :style="getStructStyle(el)"
                >
                  <v-icon size="18" class="struct-icon">{{
                    getElementDef(el.type)?.icon
                  }}</v-icon>
                  <span v-if="(el.w ?? 1) > 1" class="struct-label">{{
                    el.label
                  }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Table detail panel -->
      <transition name="panel-in">
        <div v-if="selectedTable" class="detail-panel">
          <div class="dp-head">
            <div>
              <div class="dp-title">{{ selectedTable.label }}</div>
              <div class="dp-sub">
                <v-icon size="12" class="mr-1" style="color: #6a7080"
                  >mdi-map-marker-outline</v-icon
                >
                {{ currentEnv?.name }}
              </div>
            </div>
            <button class="dp-close" @click="selectedTable = null">
              <v-icon size="16">mdi-close</v-icon>
            </button>
          </div>

          <!-- Status -->
          <div class="dp-status-row">
            <span
              class="status-chip"
              :class="
                selectedTable.status === 'reserved'
                  ? 'status-chip--rsvd'
                  : isInCart(selectedTable.id)
                    ? 'status-chip--cart'
                    : 'status-chip--avail'
              "
            >
              {{
                selectedTable.status === "reserved"
                  ? "Reserved"
                  : isInCart(selectedTable.id)
                    ? "In your cart"
                    : "Available"
              }}
            </span>
            <div class="dp-cap">
              <v-icon size="13" class="mr-1" style="color: #6a7080"
                >mdi-account-group-outline</v-icon
              >
              Up to {{ selectedTable.capacity }} guests
            </div>
          </div>

          <template v-if="selectedTable.status !== 'reserved'">
            <div class="dp-divider"></div>

            <!-- Date -->
            <div class="dp-field">
              <label class="dp-lbl">Date</label>
              <div class="date-pills">
                <button
                  v-for="d in dateOptions"
                  :key="d.value"
                  class="date-pill"
                  :class="{ 'date-pill--on': bookingDate === d.value }"
                  @click="bookingDate = d.value"
                >
                  <div class="date-pill-day">{{ d.day }}</div>
                  <div class="date-pill-num">{{ d.num }}</div>
                </button>
              </div>
            </div>

            <!-- Time -->
            <div class="dp-field">
              <label class="dp-lbl">Time</label>
              <div class="time-pills">
                <button
                  v-for="t in timeSlots"
                  :key="t"
                  class="time-pill"
                  :class="{ 'time-pill--on': bookingTime === t }"
                  @click="bookingTime = t"
                >
                  {{ t }}
                </button>
              </div>
            </div>

            <!-- Guests -->
            <div class="dp-field">
              <label class="dp-lbl">Guests</label>
              <div class="guest-stepper">
                <button
                  class="gs-btn"
                  @click="guestCount = Math.max(1, guestCount - 1)"
                >
                  −
                </button>
                <span class="gs-val">{{ guestCount }}</span>
                <button
                  class="gs-btn"
                  @click="
                    guestCount = Math.min(
                      selectedTable.capacity,
                      guestCount + 1,
                    )
                  "
                >
                  +
                </button>
              </div>
            </div>

            <!-- Notes -->
            <div class="dp-field">
              <label class="dp-lbl">Special Requests</label>
              <textarea
                v-model="specialRequests"
                class="dp-notes"
                placeholder="Allergies, celebrations, preferences…"
                rows="2"
              ></textarea>
            </div>

            <div class="dp-divider"></div>

            <!-- Add to cart -->
            <button
              v-if="!isInCart(selectedTable.id)"
              class="add-cart-btn"
              :disabled="!bookingDate || !bookingTime"
              @click="addToCart"
            >
              <v-icon size="16" class="mr-2">mdi-cart-plus</v-icon>
              Add to Cart
            </button>
            <div v-else class="in-cart-cta">
              <div class="in-cart-msg">
                <v-icon size="14" class="mr-1" style="color: #d4af37"
                  >mdi-check-circle</v-icon
                >
                Added · {{ bookingDate }}, {{ bookingTime }}, {{ guestCount }}p
              </div>
              <button
                class="remove-btn"
                @click="removeFromCart(selectedTable.id)"
              >
                Remove
              </button>
            </div>
          </template>

          <template v-else>
            <div class="dp-divider"></div>
            <div class="reserved-msg">
              <v-icon
                size="28"
                style="color: rgba(199, 21, 133, 0.4); margin-bottom: 8px"
                >mdi-lock-outline</v-icon
              >
              <p>
                This table is already reserved and not available for booking.
              </p>
            </div>
          </template>
        </div>

        <!-- Idle prompt when nothing selected -->
        <div v-else class="detail-panel detail-panel--idle">
          <v-icon
            size="44"
            style="color: rgba(212, 175, 55, 0.18); margin-bottom: 14px"
            >mdi-cursor-default-click-outline</v-icon
          >
          <div class="idle-title">Select a Table</div>
          <p class="idle-sub">
            Click any available table on the floor plan to see details and add
            it to your reservation.
          </p>
        </div>
      </transition>
    </div>
  </v-main>

  <!-- CART BAR -->
  <transition name="cart-bar-in">
    <div v-if="cart.length > 0" class="cart-bar">
      <div class="cart-bar-info">
        <v-icon size="16" class="mr-2" style="color: #d4af37"
          >mdi-cart-outline</v-icon
        >
        <span class="cart-bar-count"
          >{{ cart.length }} table{{ cart.length !== 1 ? "s" : "" }}</span
        >
        <span class="cart-bar-dot mx-2">·</span>
        <span class="cart-bar-guests"
          >{{ totalGuests }} guest{{ totalGuests !== 1 ? "s" : "" }}</span
        >
        <span class="cart-bar-dot mx-2">·</span>
        <span class="cart-bar-date"
          >{{ cart[0]?.date }}, {{ cart[0]?.time }}</span
        >
      </div>
      <div class="d-flex gap-2">
        <button class="cart-outline-btn" @click="showCartSheet = true">
          View Cart
        </button>
        <button class="cart-confirm-btn" @click="goToConfirm">
          Continue to Confirmation
          <v-icon size="14" class="ml-1">mdi-arrow-right</v-icon>
        </button>
      </div>
    </div>
  </transition>

  <!-- CART SHEET -->
  <v-dialog v-model="showCartSheet" max-width="480" :scrim-opacity="0.6">
    <v-card
      flat
      style="
        background: var(--color-surface);
        border: 1px solid rgba(212, 175, 55, 0.18);
        border-radius: 16px;
      "
    >
      <v-card-text class="pa-0">
        <div class="cs-head">
          <div class="cs-title">Your Cart</div>
          <button class="dp-close" @click="showCartSheet = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>

        <div class="cs-list">
          <div v-for="item in cart" :key="item.id" class="cs-item">
            <div class="cs-item-main">
              <div class="cs-item-name">{{ item.label }}</div>
              <div class="cs-item-meta">
                <v-icon size="11" class="mr-1" style="color: #6a7080"
                  >mdi-map-marker-outline</v-icon
                >{{ item.env }}
                <span class="mx-2" style="color: rgba(212, 175, 55, 0.3)"
                  >·</span
                >
                <v-icon size="11" class="mr-1" style="color: #6a7080"
                  >mdi-account-outline</v-icon
                >{{ item.guests }}p
                <span class="mx-2" style="color: rgba(212, 175, 55, 0.3)"
                  >·</span
                >
                <v-icon size="11" class="mr-1" style="color: #6a7080"
                  >mdi-clock-outline</v-icon
                >{{ item.date }}, {{ item.time }}
              </div>
              <div v-if="item.notes" class="cs-item-notes">
                "{{ item.notes }}"
              </div>
            </div>
            <button class="cs-remove" @click="removeFromCart(item.id)">
              <v-icon size="16">mdi-delete-outline</v-icon>
            </button>
          </div>
        </div>

        <div class="cs-footer">
          <div class="cs-total">
            <span class="cs-total-lbl">Total</span>
            <span class="cs-total-val"
              >{{ cart.length }} table{{ cart.length !== 1 ? "s" : "" }},
              {{ totalGuests }} guests</span
            >
          </div>
          <button class="cart-confirm-btn w-100 mt-3" @click="goToConfirm">
            Continue to Confirmation
            <v-icon size="14" class="ml-1">mdi-arrow-right</v-icon>
          </button>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import AppNavbarVenue from "@/components/layout/AppNavbarVenue.vue";
import BookingStepIndicator from "@/components/ui/BookingStepIndicator.vue";

const router = useRouter();

// ── Mock floor plan (same JSON format as P10 output) ─────────────────────────
const floorPlan = {
  venueId: "venue_demo",
  environments: [
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
        },
        {
          id: "e10",
          type: "bar_counter",
          label: "Bar",
          capacity: 0,
          w: 3,
          h: 1,
          x: 780,
          y: 550,
          rotation: 0,
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
  ],
};

// ── Element catalog ───────────────────────────────────────────────────────────
const elementDefs = {
  entrance: { name: "Entrance", icon: "mdi-location-enter" },
  bar_counter: { name: "Bar", icon: "mdi-glass-cocktail" },
  stage: { name: "Stage", icon: "mdi-microphone-outline" },
  plant: { name: "Plant", icon: "mdi-flower-tulip-outline" },
  pillar: { name: "Pillar", icon: "mdi-pillar" },
};
const getElementDef = (type) => elementDefs[type] ?? null;

// ── Environment ───────────────────────────────────────────────────────────────
const currentEnvId = ref(floorPlan.environments[0].id);
const currentEnv = computed(() =>
  floorPlan.environments.find((e) => e.id === currentEnvId.value),
);
const currentEnvElements = computed(() => currentEnv.value?.elements ?? []);
const switchEnv = (id) => {
  currentEnvId.value = id;
  selectedTable.value = null;
};

// ── Canvas helpers ────────────────────────────────────────────────────────────
const GRID = 40;
const isRound = (el) => el?.shape === "round";
const getChairs = (el) => {
  const cap = el.capacity;
  if (!cap || cap <= 0) return { top: 0, bottom: 0 };
  return { top: Math.ceil(cap / 2), bottom: Math.floor(cap / 2) };
};
const getStructStyle = (el) => ({
  width: (el.w ?? 1) * GRID + "px",
  height: (el.h ?? 1) * GRID + "px",
});
const getElementStyle = (el) => ({
  position: "absolute",
  left: el.x + "px",
  top: el.y + "px",
  transform: "rotate(" + el.rotation + "deg)",
  transformOrigin: "center center",
  cursor:
    el.type.startsWith("table_") && el.status !== "reserved"
      ? "pointer"
      : "default",
});

// ── Table status / class ──────────────────────────────────────────────────────
const isInCart = (id) => cart.value.some((c) => c.id === id);
const getTableClass = (el) => {
  if (el.status === "reserved") return "placed-el--reserved";
  if (isInCart(el.id)) return "placed-el--cart";
  if (selectedTable.value?.id === el.id) return "placed-el--selected";
  return "placed-el--available";
};

// ── Selection + booking form ──────────────────────────────────────────────────
const selectedTable = ref(null);
const bookingDate = ref(null);
const bookingTime = ref(null);
const guestCount = ref(2);
const specialRequests = ref("");

const onTableClick = (el) => {
  if (!el.type.startsWith("table_")) return;
  selectedTable.value = el;
  guestCount.value = Math.min(el.capacity, 2);
  specialRequests.value = "";
  const existing = cart.value.find((c) => c.id === el.id);
  if (existing) {
    bookingDate.value = existing.date;
    bookingTime.value = existing.time;
    guestCount.value = existing.guests;
    specialRequests.value = existing.notes;
  }
};

// ── Date / time options ───────────────────────────────────────────────────────
const dateOptions = (() => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i + 1);
    return {
      value: `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`,
      day: days[d.getDay()],
      num: d.getDate(),
    };
  });
})();

const timeSlots = [
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
  "11:00 PM",
];

// ── Cart ──────────────────────────────────────────────────────────────────────
const cart = ref([]);
const showCartSheet = ref(false);
const totalGuests = computed(() =>
  cart.value.reduce((s, c) => s + c.guests, 0),
);

const addToCart = () => {
  if (!selectedTable.value || !bookingDate.value || !bookingTime.value) return;
  const existing = cart.value.findIndex((c) => c.id === selectedTable.value.id);
  const item = {
    id: selectedTable.value.id,
    label: selectedTable.value.label,
    env: currentEnv.value.name,
    envId: currentEnvId.value,
    cap: selectedTable.value.capacity,
    date: bookingDate.value,
    time: bookingTime.value,
    guests: guestCount.value,
    notes: specialRequests.value,
  };
  if (existing >= 0) cart.value.splice(existing, 1, item);
  else cart.value.push(item);
};

const removeFromCart = (id) => {
  cart.value = cart.value.filter((c) => c.id !== id);
};

// ── Confirm ───────────────────────────────────────────────────────────────────
const goToConfirm = () => {
  showCartSheet.value = false;
  // In a real app this would go into a composable store; here we use sessionStorage
  sessionStorage.setItem("spotly_cart", JSON.stringify(cart.value));
  router.push("/booking/confirm");
};
</script>

<style scoped>
/* Step indicator */
.step-indicator {
  display: flex;
  align-items: center;
  gap: 0;
}
.step-pip {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-size: 0.65rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(212, 175, 55, 0.18);
  color: #6a7080;
  flex-shrink: 0;
}
.step-pip--active {
  background: rgba(212, 175, 55, 0.18) !important;
  border-color: #d4af37 !important;
  color: #d4af37 !important;
  box-shadow: 0 0 8px rgba(212, 175, 55, 0.3);
}
.step-pip--done {
  background: rgba(46, 187, 87, 0.15) !important;
  border-color: #2ebb57 !important;
  color: #2ebb57 !important;
}
.step-line {
  width: 28px;
  height: 1px;
  background: rgba(212, 175, 55, 0.18);
  flex-shrink: 0;
}
.step-line--done {
  background: #2ebb57;
}
.step-lbl {
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 600;
  color: #f0ead6;
}

.cart-nav-btn {
  display: flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  color: #0a0e14;
  background: #d4af37;
  border: none;
  border-radius: 20px;
  padding: 5px 14px;
  cursor: pointer;
  transition: background 0.18s;
}
.cart-nav-btn:hover {
  background: #e9c74a;
}

/* Layout */
.booking-layout {
  display: flex;
  height: calc(100vh - 58px);
  overflow: hidden;
}
.floor-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Env tabs */
.env-tab-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #0d1219;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 8px;
}
.env-tabs {
  display: flex;
  gap: 3px;
}
.env-tab {
  display: flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: 0.76rem;
  font-weight: 500;
  color: #6a7080;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 4px 12px;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
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
.legend {
  display: flex;
  align-items: center;
  gap: 4px;
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.legend-dot--avail {
  background: #2ebb57;
}
.legend-dot--rsvd {
  background: #c71585;
  opacity: 0.5;
}
.legend-dot--cart {
  background: #d4af37;
}
.legend-lbl {
  font-family: var(--font-body);
  font-size: 0.65rem;
  color: #6a7080;
}

/* Canvas */
.canvas-scroll {
  flex: 1;
  overflow: auto;
  background: #0a0e14;
}
.canvas-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.canvas-scroll::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.18);
  border-radius: 3px;
}
.canvas-wrap {
  position: relative;
  background: #0d1219;
  border: 1px solid rgba(212, 175, 55, 0.1);
  margin: 16px;
  border-radius: 12px;
  overflow: hidden;
  width: 1000px;
  height: 660px;
}
.grid-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

/* Placed elements */
.placed-el {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  user-select: none;
  transition: filter 0.18s;
}
.table-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.chair-row {
  display: flex;
  gap: 5px;
}
.chair {
  border-radius: 3px;
  background: rgba(200, 200, 200, 0.1);
  border: 1.5px solid rgba(200, 200, 200, 0.18);
  transition:
    background 0.2s,
    border-color 0.2s;
}
.chair--h {
  width: 16px;
  height: 10px;
}
.table-surface {
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  border: 2px solid rgba(200, 200, 200, 0.2);
  border-radius: 6px;
  width: 80px;
  height: 48px;
  transition:
    background 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
}
.table-surface--round {
  width: 66px !important;
  height: 66px !important;
  border-radius: 50% !important;
}
.table-unit--round .table-surface {
  width: 66px;
  height: 66px;
  border-radius: 50%;
}
.el-label {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.el-name {
  font-family: var(--font-body);
  font-size: 0.66rem;
  font-weight: 700;
  color: #9a9fa8;
}
.el-seats {
  font-family: var(--font-body);
  font-size: 0.58rem;
  color: #5a6070;
}

/* Table states */
.placed-el--available .table-unit {
  color: #2ebb57;
}
.placed-el--available .table-surface {
  background: rgba(46, 187, 87, 0.07) !important;
  border-color: rgba(46, 187, 87, 0.45) !important;
}
.placed-el--available .chair {
  background: rgba(46, 187, 87, 0.15) !important;
  border-color: rgba(46, 187, 87, 0.35) !important;
}
.placed-el--available:hover .table-surface {
  background: rgba(46, 187, 87, 0.14) !important;
  border-color: #2ebb57 !important;
  box-shadow: 0 0 18px rgba(46, 187, 87, 0.2) !important;
}
.placed-el--available .el-name {
  color: #b8f0c8;
}

.placed-el--reserved {
  opacity: 0.55;
  pointer-events: none;
}
.placed-el--reserved .table-surface {
  background: rgba(199, 21, 133, 0.06) !important;
  border-color: rgba(199, 21, 133, 0.3) !important;
}
.placed-el--reserved .chair {
  background: rgba(199, 21, 133, 0.1) !important;
  border-color: rgba(199, 21, 133, 0.3) !important;
}
.placed-el--reserved .el-name {
  color: #f0a0c8;
}

.placed-el--selected .table-surface {
  background: rgba(212, 175, 55, 0.12) !important;
  border-color: #d4af37 !important;
  box-shadow: 0 0 22px rgba(212, 175, 55, 0.28) !important;
}
.placed-el--selected .chair {
  background: rgba(212, 175, 55, 0.25) !important;
  border-color: rgba(212, 175, 55, 0.55) !important;
}
.placed-el--selected .el-name {
  color: #d4af37;
}

.placed-el--cart .table-surface {
  background: rgba(212, 175, 55, 0.18) !important;
  border-color: #d4af37 !important;
  box-shadow: 0 0 16px rgba(212, 175, 55, 0.25) !important;
}
.placed-el--cart .chair {
  background: rgba(212, 175, 55, 0.18) !important;
  border-color: rgba(212, 175, 55, 0.5) !important;
}
.placed-el--cart .el-name {
  color: #d4af37;
}

/* Structure / decor */
.placed-el--decor {
  pointer-events: none;
}
.struct-el {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.18);
  min-width: 40px;
  min-height: 40px;
}
.struct-icon {
  color: #6a7080 !important;
}
.struct-label {
  font-family: var(--font-body);
  font-size: 0.62rem;
  color: #6a7080;
  white-space: nowrap;
  padding-right: 8px;
}
.struct-el--entrance {
  background: rgba(126, 200, 227, 0.06);
  border-color: rgba(126, 200, 227, 0.2);
}
.struct-el--bar_counter {
  background: rgba(212, 175, 55, 0.06);
  border-color: rgba(212, 175, 55, 0.18);
}
.struct-el--stage {
  background: rgba(46, 187, 87, 0.06);
  border-color: rgba(46, 187, 87, 0.2);
}

/* Detail panel */
.detail-panel {
  width: 280px;
  min-width: 280px;
  background: #0d1219;
  border-left: 1px solid rgba(212, 175, 55, 0.12);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
}
.detail-panel::-webkit-scrollbar {
  width: 4px;
}
.detail-panel::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.18);
  border-radius: 2px;
}
.detail-panel--idle {
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  text-align: center;
}
.idle-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 600;
  color: #f0ead6;
  margin-bottom: 8px;
  font-style: italic;
}
.idle-sub {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: #4a5060;
  line-height: 1.6;
}

.dp-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 14px 10px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}
.dp-title {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 700;
  color: #f0ead6;
  font-style: italic;
}
.dp-sub {
  display: flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: 0.65rem;
  color: #6a7080;
  margin-top: 2px;
}
.dp-close {
  background: none;
  border: none;
  color: #6a7080;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: color 0.15s;
}
.dp-close:hover {
  color: #f0ead6;
}
.dp-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
}
.status-chip {
  font-family: var(--font-body);
  font-size: 0.63rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 9px;
  border-radius: 10px;
}
.status-chip--avail {
  background: rgba(46, 187, 87, 0.15);
  color: #2ebb57;
  border: 1px solid rgba(46, 187, 87, 0.3);
}
.status-chip--rsvd {
  background: rgba(199, 21, 133, 0.12);
  color: #c71585;
  border: 1px solid rgba(199, 21, 133, 0.25);
}
.status-chip--cart {
  background: rgba(212, 175, 55, 0.18);
  color: #d4af37;
  border: 1px solid rgba(212, 175, 55, 0.3);
}
.dp-cap {
  display: flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: 0.65rem;
  color: #6a7080;
}
.dp-divider {
  height: 1px;
  background: rgba(212, 175, 55, 0.1);
  margin: 6px 14px;
}
.dp-field {
  padding: 8px 14px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dp-lbl {
  font-family: var(--font-body);
  font-size: 0.62rem;
  font-weight: 700;
  color: #6a7080;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Date pills */
.date-pills {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.date-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 36px;
}
.date-pill:hover {
  border-color: rgba(212, 175, 55, 0.35);
}
.date-pill--on {
  background: rgba(212, 175, 55, 0.14) !important;
  border-color: #d4af37 !important;
}
.date-pill-day {
  font-family: var(--font-body);
  font-size: 0.55rem;
  color: #6a7080;
  text-transform: uppercase;
}
.date-pill--on .date-pill-day {
  color: #d4af37;
}
.date-pill-num {
  font-family: var(--font-heading);
  font-size: 0.9rem;
  font-weight: 700;
  color: #f0ead6;
}
.date-pill--on .date-pill-num {
  color: #d4af37;
}

/* Time pills */
.time-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.time-pill {
  font-family: var(--font-body);
  font-size: 0.65rem;
  font-weight: 500;
  color: #8a8fa8;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.15s;
}
.time-pill:hover {
  border-color: rgba(212, 175, 55, 0.35);
  color: #f0ead6;
}
.time-pill--on {
  background: rgba(212, 175, 55, 0.14) !important;
  border-color: #d4af37 !important;
  color: #d4af37 !important;
}

/* Guest stepper */
.guest-stepper {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 6px;
  height: 32px;
  overflow: hidden;
  width: fit-content;
}
.gs-btn {
  width: 32px;
  height: 100%;
  background: rgba(212, 175, 55, 0.08);
  border: none;
  color: #d4af37;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
.gs-btn:hover {
  background: rgba(212, 175, 55, 0.18);
}
.gs-val {
  padding: 0 14px;
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 700;
  color: #f0ead6;
  min-width: 32px;
  text-align: center;
}

/* Notes */
.dp-notes {
  width: 100%;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 6px;
  color: #f0ead6;
  font-family: var(--font-body);
  font-size: 0.76rem;
  padding: 7px 10px;
  resize: none;
  outline: none;
  transition: border-color 0.15s;
}
.dp-notes::placeholder {
  color: #4a5060;
}
.dp-notes:focus {
  border-color: rgba(212, 175, 55, 0.45);
}

/* Add to cart */
.add-cart-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - 28px);
  margin: 10px 14px 14px;
  padding: 9px;
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #0a0e14;
  background: #d4af37;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 0.18s,
    box-shadow 0.18s;
}
.add-cart-btn:hover:not(:disabled) {
  background: #e9c74a;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.35);
}
.add-cart-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.in-cart-cta {
  margin: 10px 14px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 8px;
  padding: 8px 12px;
}
.in-cart-msg {
  display: flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: 0.68rem;
  color: #d4af37;
}
.remove-btn {
  background: none;
  border: none;
  font-family: var(--font-body);
  font-size: 0.65rem;
  color: #c71585;
  cursor: pointer;
  text-decoration: underline;
}
.reserved-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 16px;
}
.reserved-msg p {
  font-family: var(--font-body);
  font-size: 0.74rem;
  color: #4a5060;
  line-height: 1.5;
}

/* Panel transition */
.panel-in-enter-active,
.panel-in-leave-active {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.panel-in-enter-from,
.panel-in-leave-to {
  width: 0;
  min-width: 0;
  opacity: 0;
}

/* Cart bar */
.cart-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: rgba(17, 23, 32, 0.97);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(212, 175, 55, 0.22);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.5);
  flex-wrap: wrap;
  gap: 10px;
}
.cart-bar-in-enter-active,
.cart-bar-in-leave-active {
  transition:
    transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.22s;
}
.cart-bar-in-enter-from,
.cart-bar-in-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.cart-bar-info {
  display: flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: 0.82rem;
}
.cart-bar-count {
  font-weight: 700;
  color: #d4af37;
}
.cart-bar-dot {
  color: rgba(212, 175, 55, 0.4);
}
.cart-bar-guests {
  color: #f0ead6;
}
.cart-bar-date {
  color: #8a8fa8;
}
.cart-outline-btn {
  font-family: var(--font-body);
  font-size: 0.76rem;
  font-weight: 500;
  color: #d4af37;
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 7px;
  padding: 6px 16px;
  cursor: pointer;
  transition: all 0.15s;
}
.cart-outline-btn:hover {
  background: rgba(212, 175, 55, 0.08);
}
.cart-confirm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #0a0e14;
  background: #d4af37;
  border: none;
  border-radius: 7px;
  padding: 7px 18px;
  cursor: pointer;
  transition: background 0.18s;
}
.cart-confirm-btn:hover {
  background: #e9c74a;
}
.cart-confirm-btn.w-100 {
  width: 100%;
}

/* Cart sheet */
.cs-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.12);
}
.cs-title {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
  color: #f0ead6;
  font-style: italic;
}
.cs-list {
  padding: 8px 0;
  max-height: 340px;
  overflow-y: auto;
}
.cs-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.07);
}
.cs-item-name {
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 700;
  color: #f0ead6;
  margin-bottom: 4px;
}
.cs-item-meta {
  display: flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: 0.65rem;
  color: #6a7080;
  flex-wrap: wrap;
}
.cs-item-notes {
  font-family: var(--font-body);
  font-size: 0.65rem;
  color: #8a8fa8;
  font-style: italic;
  margin-top: 4px;
}
.cs-remove {
  background: none;
  border: none;
  color: rgba(199, 21, 133, 0.5);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: color 0.15s;
}
.cs-remove:hover {
  color: #c71585;
}
.cs-footer {
  padding: 14px 20px 20px;
  border-top: 1px solid rgba(212, 175, 55, 0.1);
}
.cs-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cs-total-lbl {
  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6a7080;
}
.cs-total-val {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 700;
  color: #f0ead6;
}

.gap-2 {
  gap: 8px;
}
</style>
