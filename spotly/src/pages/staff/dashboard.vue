<template>
    <!-- ── Top Navigation Bar ── -->
    <AppNavbarApp
      :nav-tabs="tabs"
      :active-link="activeTab"
      admin-label="Admin"
      @nav="activeTab = $event"
    >
      <template #actions>
        <!-- Alerts Badge -->
        <div class="alerts-btn mr-4" @click="alertsPanel = !alertsPanel">
          <v-icon size="18" color="#D4AF37">mdi-bell-outline</v-icon>
          <span class="alerts-count" v-if="unacknowledgedAlerts > 0">{{
            unacknowledgedAlerts
          }}</span>
        </div>
        <!-- Live indicator -->
        <div class="live-indicator mr-4">
          <span class="live-dot" />
          LIVE
        </div>
      </template>
    </AppNavbarApp>

    <!-- ── Main Content ── -->
    <v-main class="spotly-main">
      <div class="staff-container pa-6">
        <!-- ── ALERTS PANEL ── -->
        <v-expand-transition>
          <div v-if="alertsPanel" class="alerts-panel mb-5">
            <div class="alerts-header mb-3">
              <v-icon color="#D4AF37" size="16" class="mr-2">mdi-bell</v-icon>
              Active Alerts
            </div>
            <div
              v-for="alert in alerts"
              :key="alert.id"
              class="alert-row"
              :class="{ 'alert-row--ack': alert.acked }"
            >
              <div class="alert-left">
                <v-icon
                  size="14"
                  :color="alert.acked ? '#555' : '#D4AF37'"
                  class="mr-2"
                >
                  {{
                    alert.type === "waiter"
                      ? "mdi-room-service"
                      : "mdi-phone-alert"
                  }}
                </v-icon>
                <span class="alert-text">
                  <strong>{{ alert.table }}</strong> — {{ alert.message }}
                </span>
                <span class="alert-time ml-3">{{ alert.time }}</span>
              </div>
              <v-btn
                v-if="!alert.acked"
                size="x-small"
                class="ack-btn"
                @click="acknowledge(alert)"
                >Acknowledge</v-btn
              >
              <span v-else class="acked-label">✓ Acknowledged</span>
            </div>
          </div>
        </v-expand-transition>

        <!-- ── FLOOR PLAN TAB ── -->
        <div v-if="activeTab === 'floor'">
          <FloorPlanGrid
            :tables="tables"
            :environments="environments"
            v-model:active-env="activeEnv"
            @table-click="openTableDetail"
            @check-in="checkIn"
            @check-out="checkOut"
            @resolve-call="resolveCall"
          />

        <!-- ── GUEST LIST TAB ── -->
        <div v-if="activeTab === 'guests'">
          <div class="table-wrapper">
            <v-table class="spotly-table" density="comfortable">
              <thead>
                <tr>
                  <th class="table-th">Table</th>
                  <th class="table-th">Guest</th>
                  <th class="table-th">Time</th>
                  <th class="table-th">Guests</th>
                  <th class="table-th">Status</th>
                  <th class="table-th">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in allOccupied" :key="t.id" class="table-row">
                  <td class="table-td gold-text">{{ t.id }}</td>
                  <td class="table-td">{{ t.guest }}</td>
                  <td class="table-td muted-text">{{ t.time }}</td>
                  <td class="table-td">
                    <v-icon size="13" color="#D4AF37" class="mr-1"
                      >mdi-account-group</v-icon
                    >{{ t.seats }}
                  </td>
                  <td class="table-td">
                    <ReservationStatusChip :status="t.status" size="x-small" />
                  </td>
                  <td class="table-td muted-text">{{ t.note || "—" }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </div>
      </div>
    </v-main>

    <!-- ── Table Detail Dialog ── -->
    <TableDetailDialog
      v-model="detailDialog"
      :table="selectedTable"
      @check-in="checkIn(selectedTable)"
      @check-out="checkOut(selectedTable)"
      @resolve-call="resolveCall(selectedTable)"
    />

    <!-- Snackbar -->
    <SpotlySnackbar :snackbar="snackbar" />
</template>

<script setup>
import { ref, computed } from "vue";
import { useSnackbar } from "@/composables/useSnackbar";
import { statusLabel } from "@/composables/useTableStatus";
import AppNavbarApp from "@/components/layout/AppNavbarApp.vue";
import FloorPlanGrid from "@/components/floor/FloorPlanGrid.vue";
import TableDetailDialog from "@/components/floor/TableDetailDialog.vue";
import ReservationStatusChip from "@/components/feedback/ReservationStatusChip.vue";
import SpotlySnackbar from "@/components/feedback/SpotlySnackbar.vue";

const { snackbar, notify } = useSnackbar();

// ── Tabs ─────────────────────────────────────────────────────────────────────
const tabs = [
  { key: "floor", label: "Live Floor Plan", icon: "mdi-floor-plan" },
  { key: "guests", label: "Guest List", icon: "mdi-account-multiple" },
];
const activeTab = ref("floor");

// ── Alerts ────────────────────────────────────────────────────────────────────
const alertsPanel = ref(true);
const alerts = ref([
  {
    id: 2,
    table: "Table T-12",
    message: "Requesting waiter",
    type: "waiter",
    time: "19:55",
    acked: false,
  },
]);
const unacknowledgedAlerts = computed(
  () => alerts.value.filter((a) => !a.acked).length,
);
const acknowledge = (alert) => {
  alert.acked = true;
  notify(
    `Alert for ${alert.table} acknowledged`,
    "#D4AF37",
    "mdi-check-circle",
  );
};

// ── Environments ──────────────────────────────────────────────────────────────
const environments = ["Indoor Lounge", "Beach", "Terrace", "VIP"];
const activeEnv = ref("Indoor Lounge");

// ── Tables ────────────────────────────────────────────────────────────────────
const tables = ref([
  {
    id: "T-A1",
    env: "Indoor Lounge",
    seats: 4,
    status: "free",
    guest: "",
    time: "",
    note: "",
  },
  {
    id: "T-2",
    env: "Indoor Lounge",
    seats: 4,
    status: "occupied",
    guest: "Sarah Miller",
    time: "14:00",
    note: "",
  },
  {
    id: "T-3",
    env: "Indoor Lounge",
    seats: 2,
    status: "reserved",
    guest: "James",
    time: "19:00",
    note: "Birthday",
  },
  {
    id: "VIP-01",
    env: "Indoor Lounge",
    seats: 6,
    status: "call",
    guest: "Mark",
    time: "18:30",
    note: '"Birthday"',
  },
  {
    id: "T-5",
    env: "Indoor Lounge",
    seats: 2,
    status: "free",
    guest: "",
    time: "",
    note: "",
  },
  {
    id: "T-6",
    env: "Indoor Lounge",
    seats: 6,
    status: "occupied",
    guest: "Chen Family",
    time: "18:00",
    note: "Allergy: nuts",
  },
  {
    id: "B-1",
    env: "Beach",
    seats: 4,
    status: "free",
    guest: "",
    time: "",
    note: "",
  },
  {
    id: "B-2",
    env: "Beach",
    seats: 2,
    status: "reserved",
    guest: "Anna López",
    time: "20:00",
    note: "",
  },
  {
    id: "B-3",
    env: "Beach",
    seats: 6,
    status: "occupied",
    guest: "Rivera Group",
    time: "17:30",
    note: "",
  },
  {
    id: "TR-1",
    env: "Terrace",
    seats: 4,
    status: "free",
    guest: "",
    time: "",
    note: "",
  },
  {
    id: "TR-2",
    env: "Terrace",
    seats: 4,
    status: "occupied",
    guest: "Yuki Tanaka",
    time: "19:30",
    note: "",
  },
  {
    id: "V-1",
    env: "VIP",
    seats: 8,
    status: "reserved",
    guest: "Al-Rashid",
    time: "21:00",
    note: "Corporate",
  },
  {
    id: "V-2",
    env: "VIP",
    seats: 10,
    status: "free",
    guest: "",
    time: "",
    note: "",
  },
]);

const filteredTables = computed(() =>
  tables.value.filter((t) => t.env === activeEnv.value),
);
const allOccupied = computed(() =>
  tables.value.filter((t) =>
    ["occupied", "reserved", "call"].includes(t.status),
  ),
);

// ── Detail Dialog ─────────────────────────────────────────────────────────────
const detailDialog = ref(false);
const selectedTable = ref(null);
const openTableDetail = (t) => {
  selectedTable.value = t;
  detailDialog.value = true;
};

// ── Actions ───────────────────────────────────────────────────────────────────
const checkOut = (t) => {
  t.status = "free";
  t.guest = "";
  t.time = "";
  notify(`${t.id} checked out`, "#2EBB57", "mdi-logout");
};
const checkIn = (t) => {
  t.status = "occupied";
  notify(`${t.id} checked in`, "#D4AF37", "mdi-login");
};
const resolveCall = (t) => {
  t.status = "occupied";
  detailDialog.value = false;
  notify(`Alert for ${t.id} resolved`, "#2EBB57", "mdi-check-circle");
};

// ── Helpers ───────────────────────────────────────────────────────────────────
// statusLabel imported from useTableStatus composable

</script>

<style scoped>
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
.logo-text {
  font-family: "Playfair Display", serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #d4af37;
}

/* Nav tabs */
.nav-tabs {
  gap: 2px;
}
.nav-tab {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition:
    color 0.2s,
    background 0.2s;
  display: flex;
  align-items: center;
}
.nav-tab:hover {
  color: var(--gold);
  background: rgba(212, 175, 55, 0.06);
}
.nav-tab--active {
  color: var(--gold) !important;
  background: rgba(212, 175, 55, 0.1);
}

/* Live indicator */
.live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--green);
}
.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 0 0 rgba(46, 187, 87, 0.6);
  animation: livePulse 1.4s infinite;
}
@keyframes livePulse {
  0% {
    box-shadow: 0 0 0 0 rgba(46, 187, 87, 0.6);
  }
  70% {
    box-shadow: 0 0 0 7px rgba(46, 187, 87, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(46, 187, 87, 0);
  }
}

/* Alerts bell */
.alerts-btn {
  position: relative;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  transition: background 0.2s;
}
.alerts-btn:hover {
  background: rgba(212, 175, 55, 0.16);
}
.alerts-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--rose);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.admin-avatar {
  background: rgba(212, 175, 55, 0.2) !important;
  border: 1px solid rgba(212, 175, 55, 0.4) !important;
  color: #d4af37 !important;
}
.admin-name {
  color: var(--muted);
  font-size: 0.82rem;
}

/* ── Main ── */
.spotly-main {
  background: var(--midnight) !important;
}
.staff-container {
  max-width: 1280px;
  margin: 0 auto;
}

/* ── Alerts Panel ── */
.alerts-panel {
  background: var(--surface);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-left: 3px solid var(--gold);
  border-radius: 12px;
  padding: 16px 20px;
}
.alerts-header {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gold);
  display: flex;
  align-items: center;
}
.alert-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: opacity 0.3s;
}
.alert-row--ack {
  opacity: 0.4;
}
.alert-row:last-child {
  border-bottom: none;
}
.alert-left {
  display: flex;
  align-items: center;
}
.alert-text {
  font-size: 0.84rem;
  color: rgba(255, 255, 255, 0.82);
}
.alert-time {
  font-size: 0.74rem;
  color: var(--muted);
}
.ack-btn {
  background: rgba(212, 175, 55, 0.12) !important;
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
  color: var(--gold) !important;
  font-size: 0.7rem !important;
  border-radius: 6px !important;
}
.acked-label {
  font-size: 0.72rem;
  color: var(--green);
}

/* ── Environment chips ── */
.env-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}
.env-chip {
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 0.78rem;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--muted);
  transition: all 0.2s;
}
.env-chip:hover {
  border-color: rgba(212, 175, 55, 0.3);
  color: var(--gold);
}
.env-chip--active {
  background: rgba(212, 175, 55, 0.12);
  border-color: rgba(212, 175, 55, 0.4);
  color: var(--gold);
}

/* Legend */
.legend {
  flex-wrap: wrap;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--muted);
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}
.dot--free {
  background: #334;
  border: 1px solid #556;
}
.dot--occupied {
  background: #d4af37;
}
.dot--reserved {
  background: #c71585;
}
.dot--call {
  background: #c71585;
}

/* ── Floor Grid ── */
.floor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 16px;
}

/* Table Cards */
.table-card {
  position: relative;
  background: var(--surface);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 18px;
  cursor: pointer;
  transition:
    transform 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
  overflow: hidden;
  animation: fadeIn 0.35s ease both;
}
.table-card:hover {
  transform: translateY(-3px);
}

.table-card--free {
  border-color: rgba(80, 100, 130, 0.3);
}
.table-card--occupied {
  border-color: rgba(212, 175, 55, 0.35);
  box-shadow: 0 0 18px rgba(212, 175, 55, 0.07);
}
.table-card--reserved {
  border-color: rgba(199, 21, 133, 0.35);
  box-shadow: 0 0 18px rgba(199, 21, 133, 0.07);
}
.table-card--call {
  border-color: rgba(199, 21, 133, 0.5);
  box-shadow: 0 0 22px rgba(199, 21, 133, 0.18);
  animation:
    callGlow 1.5s ease-in-out infinite alternate,
    fadeIn 0.35s ease both;
}

@keyframes callGlow {
  from {
    box-shadow: 0 0 14px rgba(199, 21, 133, 0.15);
  }
  to {
    box-shadow: 0 0 30px rgba(199, 21, 133, 0.4);
  }
}

/* Call pulse ring */
.call-pulse {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(199, 21, 133, 0.2), transparent 70%);
  animation: pulseBg 1.2s ease-in-out infinite;
}
@keyframes pulseBg {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.3;
  }
}

.table-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.table-id {
  font-family: "Playfair Display", serif;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}
.table-seats {
  font-size: 0.72rem;
  color: var(--muted);
  display: flex;
  align-items: center;
}

.table-status-badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 8px;
  border-radius: 20px;
  margin-top: 6px;
}
.badge--free {
  background: rgba(80, 100, 130, 0.15);
  color: #6b7a8d;
}
.badge--occupied {
  background: rgba(212, 175, 55, 0.15);
  color: var(--gold);
}
.badge--reserved {
  background: rgba(199, 21, 133, 0.15);
  color: #c71585;
}
.badge--call {
  background: rgba(199, 21, 133, 0.2);
  color: #c71585;
}

.table-guest {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
}
.table-time {
  font-size: 0.75rem;
  color: var(--muted);
  margin-top: 2px;
}
.table-note {
  font-size: 0.72rem;
  color: var(--gold);
  display: flex;
  align-items: center;
}
.table-free-text {
  font-size: 0.78rem;
  color: var(--muted);
}

/* Action chips on card */
.action-chip {
  font-size: 0.68rem !important;
  font-weight: 600 !important;
  border-radius: 6px !important;
  letter-spacing: 0.04em !important;
}
.action-chip--checkout {
  background: rgba(212, 175, 55, 0.12) !important;
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
  color: var(--gold) !important;
}
.action-chip--checkout:hover {
  background: rgba(212, 175, 55, 0.25) !important;
}
.action-chip--checkin {
  background: rgba(46, 187, 87, 0.12) !important;
  border: 1px solid rgba(46, 187, 87, 0.3) !important;
  color: var(--green) !important;
}
.action-chip--checkin:hover {
  background: rgba(46, 187, 87, 0.25) !important;
}
.action-chip--details {
  background: rgba(199, 21, 133, 0.12) !important;
  border: 1px solid rgba(199, 21, 133, 0.3) !important;
  color: #c71585 !important;
}

/* ── Guest List Table ── */
.table-wrapper {
  background: var(--surface);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 14px;
  overflow: hidden;
}
.spotly-table {
  background: transparent !important;
}
.table-th {
  color: var(--gold) !important;
  font-size: 0.7rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2) !important;
  padding: 14px 16px !important;
  font-weight: 500 !important;
}
.table-row:hover {
  background: rgba(212, 175, 55, 0.03) !important;
}
.table-td {
  color: rgba(255, 255, 255, 0.82) !important;
  font-size: 0.85rem !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
  padding: 12px 16px !important;
}
.gold-text {
  color: var(--gold) !important;
  font-weight: 600;
}
.muted-text {
  color: var(--muted) !important;
  font-size: 0.8rem !important;
}

/* Status chips */
.status-chip {
  font-size: 0.68rem !important;
  font-weight: 700 !important;
}
.status-chip--occupied {
  background: rgba(212, 175, 55, 0.15) !important;
  color: var(--gold) !important;
}
.status-chip--reserved {
  background: rgba(199, 21, 133, 0.15) !important;
  color: #c71585 !important;
}
.status-chip--call {
  background: rgba(199, 21, 133, 0.2) !important;
  color: #c71585 !important;
}
.status-chip--free {
  background: rgba(80, 100, 130, 0.15) !important;
  color: #6b7a8d !important;
}

/* ── Dialog ── */
.dialog-card {
  background: var(--surface2) !important;
  border: 1px solid rgba(212, 175, 55, 0.2) !important;
  border-radius: 16px !important;
}
.dialog-strip {
  height: 3px;
}
.dialog-strip--occupied {
  background: linear-gradient(90deg, var(--gold), transparent);
}
.dialog-strip--reserved {
  background: linear-gradient(90deg, var(--rose), transparent);
}
.dialog-strip--call {
  background: linear-gradient(90deg, #c71585, transparent);
}
.dialog-strip--free {
  background: linear-gradient(90deg, #334, transparent);
}
.dialog-title {
  font-family: "Playfair Display", serif !important;
  font-size: 1.2rem !important;
  color: #fff !important;
  display: flex;
  align-items: center;
}
.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}
.detail-item {
  display: flex;
  gap: 12px;
  align-items: center;
}
.dl {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  min-width: 48px;
}
.dv {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.82);
  font-weight: 500;
}
.keep-btn {
  color: var(--muted) !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
