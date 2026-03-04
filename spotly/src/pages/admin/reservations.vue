<template>
  <!-- Top Navigation Bar -->
  <AppNavbarApp
    :nav-links="adminNavLinks"
    active-link="reservations"
    admin-label="Admin"
    @nav="handleNav"
  />

  <!-- Main Content -->
  <v-main class="spotly-main">
    <div class="queue-container pa-8">
      <!-- Page Header -->
      <div class="page-header mb-8">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="queue-title">Reservation Queue</h1>
            <p class="queue-subtitle">
              Review and manage pending reservation requests
            </p>
          </div>
          <!-- Filter Dropdown -->
          <v-select
            v-model="statusFilter"
            :items="filterOptions"
            variant="outlined"
            density="compact"
            class="filter-select"
            prepend-inner-icon="mdi-filter-variant"
            hide-details
            style="max-width: 200px"
          />
        </div>
        <!-- Decorative line -->
        <div class="header-line mt-4" />
      </div>

      <!-- Stats Row -->
      <div class="stats-row d-flex ga-4 mb-8">
        <StatCard
          v-for="stat in stats"
          :key="stat.label"
          :value="stat.value"
          :label="stat.label"
          :color="stat.color"
        />
      </div>

      <!-- Reservation Table -->
      <div class="table-wrapper">
        <v-table class="spotly-table" density="comfortable">
          <thead>
            <tr class="table-header-row">
              <th class="table-th">ID</th>
              <th class="table-th">Guest Name</th>
              <th class="table-th">Date / Time</th>
              <th class="table-th">Size</th>
              <th class="table-th">Table</th>
              <th class="table-th">Notes</th>
              <th class="table-th">Status</th>
              <th class="table-th text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(res, index) in filteredReservations"
              :key="res.id"
              class="table-row"
              :class="{ 'table-row--highlighted': res.table === 'VIP-01' }"
            >
              <td class="table-td id-cell">#{{ res.id }}</td>
              <td class="table-td name-cell">
                <div class="guest-name">{{ res.name }}</div>
              </td>
              <td class="table-td">
                <div class="date-time">
                  <span class="date">{{ res.date }}</span>
                  <span class="time">{{ res.time }}</span>
                </div>
              </td>
              <td class="table-td">
                <div class="party-size">
                  <v-icon size="14" class="mr-1" color="#D4AF37"
                    >mdi-account-group</v-icon
                  >
                  {{ res.size }}
                </div>
              </td>
              <td class="table-td">
                <v-chip
                  :class="
                    res.table.startsWith('VIP') ? 'vip-chip' : 'table-chip'
                  "
                  size="small"
                  variant="tonal"
                >
                  {{ res.table }}
                </v-chip>
              </td>
              <td class="table-td notes-cell">
                <span v-if="res.notes" class="notes-text" :title="res.notes">{{
                  res.notes
                }}</span>
                <span v-else class="no-notes">—</span>
              </td>
              <td class="table-td">
                <ReservationStatusChip :status="res.status" />
              </td>
              <td class="table-td text-center">
                <div class="action-btns d-flex justify-center ga-2">
                  <v-btn
                    icon
                    size="small"
                    class="action-btn action-btn--approve"
                    @click="approve(res)"
                    :disabled="res.status === 'Approved'"
                    title="Approve"
                  >
                    <v-icon size="16">mdi-check</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    class="action-btn action-btn--reject"
                    @click="reject(res)"
                    :disabled="res.status === 'Rejected'"
                    title="Reject"
                  >
                    <v-icon size="16">mdi-close</v-icon>
                  </v-btn>
                </div>
              </td>
            </tr>
            <!-- Empty state -->
            <tr v-if="filteredReservations.length === 0">
              <td colspan="8" class="empty-state text-center pa-12">
                <v-icon size="48" color="#D4AF37" class="mb-4"
                  >mdi-calendar-check</v-icon
                >
                <div class="empty-text">
                  No reservations found for this filter
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <!-- Footer note -->
      <div class="footer-note mt-6 d-flex align-center justify-space-between">
        <span
          >Showing {{ filteredReservations.length }} of
          {{ reservations.length }} reservations</span
        >
        <div class="legend d-flex align-center ga-4">
          <div class="legend-item">
            <span class="dot dot--pending"></span> Pending
          </div>
          <div class="legend-item">
            <span class="dot dot--approved"></span> Approved
          </div>
          <div class="legend-item">
            <span class="dot dot--rejected"></span> Rejected
          </div>
        </div>
      </div>
    </div>
  </v-main>

  <!-- Snackbar feedback -->
  <SpotlySnackbar :snackbar="snackbar" />
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useSnackbar } from "@/composables/useSnackbar";
import AppNavbarApp from "@/components/layout/AppNavbarApp.vue";
import StatCard from "@/components/ui/StatCard.vue";
import ReservationStatusChip from "@/components/feedback/ReservationStatusChip.vue";
import SpotlySnackbar from "@/components/feedback/SpotlySnackbar.vue";

const router = useRouter();
const { snackbar, notifySuccess, notifyError } = useSnackbar();

// ─── Nav ──────────────────────────────────────────────────────────────────────
const adminNavLinks = [
  { key: "dashboard", label: "Dashboard" },
  { key: "builder", label: "Builder" },
  { key: "menu", label: "Menu" },
  { key: "reservations", label: "Reservations" },
];
const handleNav = (key) => {
  const routes = {
    dashboard: "/admin/dashboard",
    builder: "/admin/floor-plan",
    menu: "/admin/menu",
    reservations: "/admin/reservations",
  };
  if (routes[key]) router.push(routes[key]);
};

// ─── State ────────────────────────────────────────────────────────────────────
const statusFilter = ref("All");
const filterOptions = ["All", "Pending", "Approved", "Rejected"];

const reservations = ref([
  {
    id: 102,
    name: "John Doe",
    date: "Feb 15",
    time: "19:00",
    size: 5,
    table: "VIP-01",
    notes: "Allergy: nuts",
    status: "Pending",
  },
  {
    id: 105,
    name: "Sarah Smith",
    date: "Feb 16",
    time: "20:00",
    size: 4,
    table: "T-12",
    notes: "",
    status: "Pending",
  },
  {
    id: 108,
    name: "Marcus Lee",
    date: "Feb 17",
    time: "18:30",
    size: 2,
    table: "T-05",
    notes: "Anniversary",
    status: "Approved",
  },
  {
    id: 111,
    name: "Layla Hassan",
    date: "Feb 17",
    time: "21:00",
    size: 6,
    table: "VIP-02",
    notes: "Corporate event",
    status: "Pending",
  },
  {
    id: 114,
    name: "Tom Rivera",
    date: "Feb 18",
    time: "19:30",
    size: 3,
    table: "T-08",
    notes: "",
    status: "Rejected",
  },
]);

const stats = computed(() => [
  { label: "Total", value: reservations.value.length, color: "#D4AF37" },
  {
    label: "Pending",
    value: reservations.value.filter((r) => r.status === "Pending").length,
    color: "#C71585",
  },
  {
    label: "Approved",
    value: reservations.value.filter((r) => r.status === "Approved").length,
    color: "#2EBB57",
  },
  {
    label: "Rejected",
    value: reservations.value.filter((r) => r.status === "Rejected").length,
    color: "#888",
  },
]);

const filteredReservations = computed(() =>
  statusFilter.value === "All"
    ? reservations.value
    : reservations.value.filter((r) => r.status === statusFilter.value),
);

// ─── Snackbar ─────────────────────────────────────────────────────────────────
// snackbar state managed by useSnackbar composable

// ─── Actions ──────────────────────────────────────────────────────────────────
const approve = (res) => {
  res.status = "Approved";
  notifySuccess(`Reservation #${res.id} approved`);
};
const reject = (res) => {
  res.status = "Rejected";
  notifyError(`Reservation #${res.id} rejected`);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
// statusIcon + statusColor now provided by ReservationStatusChip via useTableStatus
</script>

<style scoped>
/* ── CSS Variables ── */
.spotly-app {
  --gold: #d4af37;
  --midnight: #0a0e14;
  --surface: #13181f;
  --surface-2: #161d28;
  --green: #2ebb57;
  --rose: #c71585;
  --text-muted: #6b7a8d;
  background-color: var(--midnight) !important;
  font-family: "Inter", sans-serif;
}

/* ── Navbar ── */
.spotly-navbar {
  background-color: rgba(10, 14, 20, 0.95) !important;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2) !important;
  backdrop-filter: blur(12px);
}

.logo-text {
  font-family: "Playfair Display", serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #d4af37;
  letter-spacing: 0.02em;
}

.nav-btn {
  color: var(--text-muted) !important;
  font-family: "Inter", sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: color 0.2s;
}
.nav-btn:hover,
.nav-btn--active {
  color: var(--gold) !important;
}

.admin-avatar {
  background: rgba(212, 175, 55, 0.2) !important;
  border: 1px solid rgba(212, 175, 55, 0.4) !important;
  color: #d4af37 !important;
  font-weight: 700;
}
.admin-name {
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* ── Main ── */
.spotly-main {
  background-color: var(--midnight) !important;
}
.queue-container {
  max-width: 1280px;
  margin: 0 auto;
}

/* ── Page Header ── */
.queue-title {
  font-family: "Playfair Display", serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: #d4af37;
  line-height: 1.1;
}
.queue-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 4px;
}
.header-line {
  height: 1px;
  background: linear-gradient(90deg, var(--gold), transparent);
  opacity: 0.4;
}

/* Filter select */
.filter-select :deep(.v-field) {
  background: var(--surface) !important;
  border-color: rgba(212, 175, 55, 0.3) !important;
  color: #fff !important;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
}
.filter-select :deep(.v-field__prepend-inner .v-icon) {
  color: var(--gold) !important;
}

/* ── Stats ── */
.stats-row {
  flex-wrap: wrap;
}
.stat-card {
  background: var(--surface);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 12px;
  padding: 20px 32px;
  text-align: center;
  min-width: 120px;
  transition:
    border-color 0.2s,
    transform 0.2s;
}
.stat-card:hover {
  border-color: rgba(212, 175, 55, 0.4);
  transform: translateY(-2px);
}
.stat-value {
  font-family: "Playfair Display", serif;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}
.stat-label {
  color: var(--text-muted);
  font-family: "Inter", sans-serif;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 6px;
}

/* ── Table ── */
.table-wrapper {
  background: var(--surface);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 16px;
  overflow: hidden;
}
.spotly-table {
  background: transparent !important;
}
.table-header-row {
  background: rgba(212, 175, 55, 0.06) !important;
}
.table-th {
  color: var(--gold) !important;
  font-family: "Inter", sans-serif;
  font-size: 0.7rem !important;
  font-weight: 500 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2) !important;
  padding: 16px 16px !important;
  white-space: nowrap;
}
.table-row {
  transition: background 0.15s;
}
.table-row:hover {
  background: rgba(212, 175, 55, 0.04) !important;
}
.table-row--highlighted {
  background: rgba(212, 175, 55, 0.03) !important;
}
.table-td {
  color: rgba(255, 255, 255, 0.82) !important;
  font-size: 0.88rem !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  padding: 14px 16px !important;
  vertical-align: middle;
}

/* Cells */
.id-cell {
  color: var(--gold) !important;
  font-weight: 600;
  font-size: 0.82rem !important;
}
.guest-name {
  font-weight: 500;
  color: #fff;
}
.date-time {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.date {
  font-weight: 500;
  font-size: 0.85rem;
}
.time {
  color: var(--text-muted);
  font-size: 0.78rem;
}
.party-size {
  display: flex;
  align-items: center;
  font-weight: 500;
}
.notes-text {
  color: var(--text-muted);
  font-size: 0.82rem;
  max-width: 140px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.no-notes {
  color: rgba(107, 122, 141, 0.4);
}

/* Chips */
.vip-chip {
  background: rgba(212, 175, 55, 0.15) !important;
  color: var(--gold) !important;
  border: 1px solid rgba(212, 175, 55, 0.3);
  font-weight: 600;
  font-size: 0.72rem !important;
}
.table-chip {
  background: rgba(255, 255, 255, 0.06) !important;
  color: rgba(255, 255, 255, 0.65) !important;
  font-size: 0.72rem !important;
}

.status-chip {
  font-size: 0.72rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.04em;
}
.status-chip--pending {
  background: rgba(199, 21, 133, 0.18) !important;
  color: #c71585 !important;
}
.status-chip--approved {
  background: rgba(46, 187, 87, 0.18) !important;
  color: #2ebb57 !important;
}
.status-chip--rejected {
  background: rgba(150, 150, 150, 0.12) !important;
  color: #888 !important;
}

/* Action Buttons */
.action-btn {
  border-radius: 8px !important;
  transition:
    transform 0.15s,
    box-shadow 0.15s !important;
}
.action-btn--approve {
  background: rgba(46, 187, 87, 0.12) !important;
  color: var(--green) !important;
  border: 1px solid rgba(46, 187, 87, 0.3) !important;
}
.action-btn--approve:hover:not(:disabled) {
  background: rgba(46, 187, 87, 0.25) !important;
  transform: scale(1.1);
  box-shadow: 0 0 12px rgba(46, 187, 87, 0.3);
}
.action-btn--reject {
  background: rgba(199, 21, 133, 0.12) !important;
  color: var(--rose) !important;
  border: 1px solid rgba(199, 21, 133, 0.3) !important;
}
.action-btn--reject:hover:not(:disabled) {
  background: rgba(199, 21, 133, 0.25) !important;
  transform: scale(1.1);
  box-shadow: 0 0 12px rgba(199, 21, 133, 0.3);
}
.action-btn:disabled {
  opacity: 0.3 !important;
}

/* Empty state */
.empty-state {
  background: transparent !important;
}
.empty-text {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 8px;
}

/* Footer */
.footer-note {
  color: var(--text-muted);
  font-size: 0.8rem;
}
.legend {
  flex-wrap: wrap;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--text-muted);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.dot--pending {
  background: var(--rose);
}
.dot--approved {
  background: var(--green);
}
.dot--rejected {
  background: #555;
}
</style>
