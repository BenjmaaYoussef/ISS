<template>
  <!-- ── Navbar ── -->
  <AppNavbarApp
    :admin-label="sessionName"
    :show-logout="true"
    @logout="logout"
  >
    <template #actions>
      <!-- Live indicator -->
      <div class="live-indicator mr-3">
        <span class="live-dot" />
        LIVE
      </div>
    </template>
  </AppNavbarApp>

  <!-- ── Main ── -->
  <v-main class="spotly-main">
    <div class="staff-wrap pa-3 pa-sm-4 pa-md-5">

      <!-- ── Toolbar ── -->
      <div class="toolbar mb-4 d-flex flex-wrap align-center ga-2 ga-sm-3">

        <!-- Date picker -->
        <input
          v-model="selectedDate"
          type="date"
          class="date-input"
          :max="maxDate"
        />

        <!-- Environment tabs -->
        <div class="env-tabs d-flex align-center ga-2 flex-wrap">
          <button
            v-for="env in ENVIRONMENT_LIST"
            :key="env.id"
            class="env-chip"
            :class="{ 'env-chip--active': selectedEnvId === env.id }"
            @click="selectedEnvId = env.id"
          >
            <v-icon size="12" class="mr-1">{{ env.icon }}</v-icon>
            {{ env.name }}
          </button>
        </div>

        <div class="flex-grow-1" />

        <!-- Panel toggle -->
        <button class="panel-toggle-btn" @click="panelOpen = !panelOpen" :title="panelOpen ? 'Hide reservations' : 'Show reservations'">
          <v-icon size="16">{{ panelOpen ? 'mdi-table-arrow-right' : 'mdi-table-arrow-left' }}</v-icon>
          <span class="d-none d-sm-inline ml-1">{{ panelOpen ? 'Hide' : 'Reservations' }}</span>
          <span v-if="!panelOpen && panelReservations.length" class="panel-toggle-count">{{ panelReservations.length }}</span>
        </button>
      </div>

      <!-- ── Content area ── -->
      <div class="content-area">

        <!-- Floor map -->
        <div class="floor-section">
          <!-- Legend -->
          <div class="legend d-flex align-center ga-4 mb-3">
            <div class="legend-item"><span class="dot dot--free" />Free</div>
            <div class="legend-item"><span class="dot dot--reserved" />Reserved</div>
            <div class="legend-item"><span class="dot dot--occupied" />Occupied</div>
            <div class="ml-auto stats-text">
              {{ occupiedCount }} occupied · {{ reservedCount }} reserved · {{ freeCount }} free
            </div>
          </div>

          <VenueFloorMap
            v-if="selectedEnv"
            :environment="selectedEnv"
            :tables="floorTables"
            mode="staff"
            @table-click="onTableClick"
          />

          <div v-else class="no-env-msg">
            <v-icon size="32" color="rgba(212,175,55,0.3)">mdi-floor-plan</v-icon>
            <p>No environments configured</p>
          </div>
        </div>

        <!-- Reservation panel -->
        <transition name="panel-slide">
          <div v-if="panelOpen" class="res-panel">

            <!-- Panel header -->
            <div class="panel-header d-flex align-center mb-3">
              <span class="panel-title">Reservations</span>
              <span class="panel-date ml-2">{{ formattedDate }}</span>
              <v-spacer />
              <span class="panel-count-badge">{{ panelReservations.length }}</span>
            </div>

            <!-- Search -->
            <div class="search-wrap mb-3">
              <v-icon size="14" class="search-icon">mdi-magnify</v-icon>
              <input
                v-model="panelSearch"
                class="search-input"
                placeholder="Search guest..."
              />
              <button v-if="panelSearch" class="search-clear" @click="panelSearch = ''">
                <v-icon size="13">mdi-close</v-icon>
              </button>
            </div>

            <!-- Status filters -->
            <div class="status-filter-row mb-3 d-flex ga-1 flex-wrap">
              <button
                v-for="f in statusFilters"
                :key="f.key"
                class="sf-chip"
                :class="{ 'sf-chip--active': panelStatusFilter === f.key }"
                @click="panelStatusFilter = f.key"
              >{{ f.label }}</button>
            </div>

            <!-- Reservation list -->
            <div class="res-list">
              <div
                v-for="res in filteredPanelReservations"
                :key="res.id"
                class="res-row"
                :class="{ 'res-row--clickable': ['REQUESTED','APPROVED','CHECKED_IN'].includes(res.status) }"
                @click="onPanelResClick(res)"
              >
                <div class="res-row-top d-flex align-center justify-space-between">
                  <span class="res-guest">{{ res.name }}</span>
                  <ReservationStatusChip :status="res.status" size="x-small" />
                </div>
                <div class="res-row-sub d-flex align-center ga-2 mt-1">
                  <span class="res-meta">
                    <v-icon size="11" class="mr-1">mdi-clock-outline</v-icon>{{ res.time }}
                  </span>
                  <span class="res-meta">
                    <v-icon size="11" class="mr-1">mdi-account-group</v-icon>{{ res.guests }}
                  </span>
                  <span class="res-meta res-env">{{ envNameById(res.environmentId) }}</span>
                </div>
              </div>

              <div v-if="filteredPanelReservations.length === 0" class="res-empty">
                <v-icon size="28" color="rgba(255,255,255,0.1)">mdi-calendar-blank</v-icon>
                <p>No reservations match</p>
              </div>
            </div>
          </div>
        </transition>

      </div>
    </div>
  </v-main>

  <!-- ── Table Detail Dialog (for occupied tables) ── -->
  <TableDetailDialog
    v-model="detailDialog"
    :table="selectedTable"
    @check-in="checkIn(selectedTable)"
    @check-out="checkOut(selectedTable)"
    @resolve-call="detailDialog = false"
  />

  <!-- ── Guest Check-In Dialog ── -->
  <GuestCheckInDialog
    v-model="checkInDialog"
    :reservation="checkInPayload || {}"
    @mark-arrived="handleMarkArrived"
    @mark-no-show="handleMarkNoShow"
  />

  <!-- ── Snackbar ── -->
  <SpotlySnackbar :snackbar="snackbar" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useAuth } from '@/composables/useAuth'
import { useFloorTables } from '@/composables/useFloorTables'
import { ENVIRONMENT_LIST } from '@/datamodel/Environment.js'
import { RESERVATION_LIST, updateReservationStatus, getReservationById } from '@/datamodel/Reservation.js'
import { ReservationLog, addReservationLog } from '@/datamodel/ReservationLog.js'

const { snackbar, notify } = useSnackbar()
const { getSession, logout } = useAuth()
const session = getSession()
const sessionName = session?.name || 'Staff'

// ── Date ──────────────────────────────────────────────────────────────────────
const today = new Date().toISOString().split('T')[0]
const selectedDate = ref(today)
const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

const formattedDate = computed(() => {
  if (!selectedDate.value) return ''
  const d = new Date(selectedDate.value + 'T12:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
})

// ── Environment ───────────────────────────────────────────────────────────────
const selectedEnvId = ref(ENVIRONMENT_LIST[0]?.id || '')
const selectedEnv = computed(() => ENVIRONMENT_LIST.find(e => e.id === selectedEnvId.value) || null)
const envNameById = (id) => ENVIRONMENT_LIST.find(e => e.id === id)?.name || id

// ── Floor tables (from composable) ───────────────────────────────────────────
const floorTables = useFloorTables(selectedEnvId, selectedDate)

const freeCount = computed(() => floorTables.value.filter(t => t.status === 'free').length)
const reservedCount = computed(() => floorTables.value.filter(t => t.status === 'reserved').length)
const occupiedCount = computed(() => floorTables.value.filter(t => t.status === 'occupied').length)

// ── Panel ─────────────────────────────────────────────────────────────────────
const panelOpen = ref(window.innerWidth >= 960)
const panelSearch = ref('')
const panelStatusFilter = ref('all')

const statusFilters = [
  { key: 'all', label: 'All' },
  { key: 'REQUESTED', label: 'Pending' },
  { key: 'APPROVED', label: 'Confirmed' },
  { key: 'CHECKED_IN', label: 'In' },
  { key: 'COMPLETED', label: 'Done' },
  { key: 'NO_SHOW', label: 'No Show' },
]

const envIds = computed(() => ENVIRONMENT_LIST.map(e => e.id))

const panelReservations = computed(() =>
  RESERVATION_LIST.filter(r =>
    r.date === selectedDate.value &&
    envIds.value.includes(r.environmentId),
  ),
)

const filteredPanelReservations = computed(() => {
  let list = panelReservations.value
  if (panelStatusFilter.value !== 'all') {
    list = list.filter(r => r.status === panelStatusFilter.value)
  }
  const q = panelSearch.value.trim().toLowerCase()
  if (q) {
    list = list.filter(r => r.name.toLowerCase().includes(q))
  }
  return list
})

// ── Dialog state ──────────────────────────────────────────────────────────────
const detailDialog = ref(false)
const selectedTable = ref(null)
const checkInDialog = ref(false)
const checkInPayload = ref(null)

// ── Table click handler ───────────────────────────────────────────────────────
const onTableClick = (table) => {
  if (table.status === 'free') {
    notify(`${table.id} is available — ${table.seats} seats`, '#6b7a8d', 'mdi-circle-outline')
    return
  }
  if (table.status === 'reserved') {
    checkIn(table)
    return
  }
  if (table.status === 'occupied') {
    selectedTable.value = table
    detailDialog.value = true
  }
}

// ── Panel reservation click ───────────────────────────────────────────────────
const onPanelResClick = (res) => {
  if (!['REQUESTED', 'APPROVED', 'CHECKED_IN'].includes(res.status)) return

  const env = ENVIRONMENT_LIST.find(e => e.id === res.environmentId)
  const el = env?.elements.find(e => e.id === res.elementId)

  if (res.status === 'CHECKED_IN') {
    selectedTable.value = {
      id: el?.label || res.elementId,
      env: env?.name || res.environmentId,
      envId: res.environmentId,
      elementId: res.elementId,
      seats: el?.capacity || res.guests,
      status: 'occupied',
      guest: res.name,
      time: res.time,
      note: res.notes,
      reservationId: res.id,
    }
    detailDialog.value = true
  } else {
    checkInPayload.value = {
      id: res.id,
      guest: res.name,
      partySize: res.guests,
      tableId: el?.label || res.elementId,
      environment: env?.name || res.environmentId,
      clientNote: res.notes || '',
      staffNote: '',
    }
    checkInDialog.value = true
  }
}

// ── Build check-in payload from table object ──────────────────────────────────
function buildCheckInPayload(t) {
  const res = t.reservationId ? getReservationById(t.reservationId) : null
  return {
    id: res?.id ?? null,
    guest: res?.name || t.guest || '—',
    partySize: res?.guests || t.seats,
    tableId: t.id,
    environment: t.env,
    clientNote: res?.notes || '',
    staffNote: '',
  }
}

// ── Check-in ──────────────────────────────────────────────────────────────────
const checkIn = (t) => {
  const res = t.reservationId ? getReservationById(t.reservationId) : null
  if (res && ['REQUESTED', 'APPROVED'].includes(res.status)) {
    checkInPayload.value = buildCheckInPayload(t)
    checkInDialog.value = true
    detailDialog.value = false
  } else {
    notify(`${t.id} check-in recorded`, '#D4AF37', 'mdi-login')
  }
}

const handleMarkArrived = (payload) => {
  if (payload.id) {
    const res = getReservationById(payload.id)
    if (res) {
      const prev = res.status
      updateReservationStatus(payload.id, 'CHECKED_IN')
      addReservationLog(new ReservationLog({
        id: Date.now(),
        reservationId: payload.id,
        previousStatus: prev,
        newStatus: 'CHECKED_IN',
        timestamp: new Date().toISOString(),
        actorRole: 'staff',
      }))
    }
  }
  checkInDialog.value = false
  notify(`${payload.tableId} — ${payload.guest} checked in`, '#2EBB57', 'mdi-login')
}

const handleMarkNoShow = (payload) => {
  if (payload.id) {
    const res = getReservationById(payload.id)
    if (res) {
      const prev = res.status
      updateReservationStatus(payload.id, 'NO_SHOW')
      addReservationLog(new ReservationLog({
        id: Date.now() + 1,
        reservationId: payload.id,
        previousStatus: prev,
        newStatus: 'NO_SHOW',
        timestamp: new Date().toISOString(),
        actorRole: 'staff',
      }))
    }
  }
  checkInDialog.value = false
  notify(`${payload.tableId} marked no-show`, '#C71585', 'mdi-account-off')
}

// ── Check-out ─────────────────────────────────────────────────────────────────
const checkOut = (t) => {
  const res = t.reservationId ? getReservationById(t.reservationId) : null
  if (res?.status === 'CHECKED_IN') {
    const prev = res.status
    updateReservationStatus(res.id, 'COMPLETED')
    addReservationLog(new ReservationLog({
      id: Date.now(),
      reservationId: res.id,
      previousStatus: prev,
      newStatus: 'COMPLETED',
      timestamp: new Date().toISOString(),
      actorRole: 'staff',
    }))
  }
  detailDialog.value = false
  notify(`${t.id} checked out`, '#2EBB57', 'mdi-logout')
}
</script>

<style scoped>
/* ── Main background ─────────────────────────────────────────────────── */
.spotly-main {
  background: #0a0e14 !important;
}
.staff-wrap {
  max-width: 1440px;
  margin: 0 auto;
}

/* ── Live indicator ──────────────────────────────────────────────────── */
.live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #2ebb57;
}
.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2ebb57;
  animation: livePulse 1.4s infinite;
}
@keyframes livePulse {
  0%   { box-shadow: 0 0 0 0 rgba(46, 187, 87, 0.6); }
  70%  { box-shadow: 0 0 0 7px rgba(46, 187, 87, 0); }
  100% { box-shadow: 0 0 0 0 rgba(46, 187, 87, 0); }
}

/* ── Toolbar ─────────────────────────────────────────────────────────── */
.toolbar {
  /* flex-wrap: wrap already via class */
}

.date-input {
  background: #13181f;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 8px;
  color: #d4af37;
  font-family: var(--font-body);
  font-size: 0.82rem;
  padding: 7px 12px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
  color-scheme: dark;
}
.date-input:hover,
.date-input:focus {
  border-color: rgba(212, 175, 55, 0.5);
}

.env-tabs {
  /* gap + flex-wrap via class */
}
.env-chip {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.76rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #6b7a8d;
  background: transparent;
  transition: all 0.18s;
  white-space: nowrap;
}
.env-chip:hover {
  border-color: rgba(212, 175, 55, 0.3);
  color: #d4af37;
}
.env-chip--active {
  background: rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.4);
  color: #d4af37;
}

.panel-toggle-btn {
  position: relative;
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid rgba(212, 175, 55, 0.25);
  color: #d4af37;
  background: rgba(212, 175, 55, 0.06);
  transition: background 0.18s;
  white-space: nowrap;
}
.panel-toggle-btn:hover {
  background: rgba(212, 175, 55, 0.12);
}
.panel-toggle-count {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #c71585;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
}

/* ── Content layout ──────────────────────────────────────────────────── */
.content-area {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

/* Floor section: grows to fill remaining space */
.floor-section {
  flex: 1;
  min-width: 0;
}

/* On tablet/mobile: stack panel below */
@media (max-width: 959px) {
  .content-area {
    flex-direction: column;
  }
  .res-panel {
    width: 100% !important;
  }
}

/* ── Legend ──────────────────────────────────────────────────────────── */
.legend {
  flex-wrap: wrap;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.74rem;
  color: #6b7a8d;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.dot--free     { background: #334; border: 1px solid #556; }
.dot--reserved { background: #c71585; }
.dot--occupied { background: #d4af37; }
.stats-text {
  font-size: 0.72rem;
  color: #6b7a8d;
  white-space: nowrap;
}

/* No-env placeholder */
.no-env-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.85rem;
}

/* ── Reservation panel ───────────────────────────────────────────────── */
.res-panel {
  width: 300px;
  flex-shrink: 0;
  background: #13181f;
  border: 1px solid rgba(212, 175, 55, 0.14);
  border-radius: 14px;
  padding: 16px;
  /* Sticky on desktop */
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(212, 175, 55, 0.2) transparent;
}

.panel-header {
  /* flex + align-center via class */
}
.panel-title {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
}
.panel-date {
  font-size: 0.72rem;
  color: #6b7a8d;
}
.panel-count-badge {
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.25);
  color: #d4af37;
  font-size: 0.7rem;
  font-weight: 700;
  min-width: 22px;
  height: 22px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

/* Search */
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 10px;
  color: #6b7a8d !important;
  pointer-events: none;
}
.search-input {
  width: 100%;
  background: #0a0e14;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.82);
  font-family: var(--font-body);
  font-size: 0.82rem;
  padding: 8px 32px 8px 30px;
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus {
  border-color: rgba(212, 175, 55, 0.35);
}
.search-clear {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7a8d;
  display: flex;
  align-items: center;
  padding: 2px;
}
.search-clear:hover {
  color: #fff;
}

/* Status filter chips */
.status-filter-row {
  /* flex + ga + flex-wrap via class */
}
.sf-chip {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #6b7a8d;
  background: transparent;
  transition: all 0.15s;
  white-space: nowrap;
}
.sf-chip:hover {
  color: #d4af37;
  border-color: rgba(212, 175, 55, 0.25);
}
.sf-chip--active {
  background: rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.35);
  color: #d4af37;
}

/* Reservation rows */
.res-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.res-row {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
  transition: background 0.15s;
}
.res-row--clickable {
  cursor: pointer;
}
.res-row--clickable:hover {
  background: rgba(212, 175, 55, 0.05);
  border-color: rgba(212, 175, 55, 0.15);
}
.res-guest {
  font-size: 0.84rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
}
.res-meta {
  font-size: 0.72rem;
  color: #6b7a8d;
  display: flex;
  align-items: center;
}
.res-env {
  margin-left: auto;
  font-style: italic;
}
.res-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  gap: 8px;
  color: rgba(255, 255, 255, 0.25);
  font-size: 0.8rem;
}

/* ── Panel slide transition ───────────────────────────────────────────── */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
@media (max-width: 959px) {
  .panel-slide-enter-from,
  .panel-slide-leave-to {
    transform: translateY(8px);
  }
}
</style>
