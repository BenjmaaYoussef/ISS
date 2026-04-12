<template>
  <AppNavbarSpotly active-link="reservations" :nav-links="adminNavLinks" @nav="handleNav" />

  <v-main class="rq-main">
    <div class="rq-container">

      <!-- ── Page Header ─────────────────────────────────────────────── -->
      <div class="page-header">
        <div>
          <div class="page-eyebrow">
            <v-icon class="mr-1" color="#D4AF37" size="13">mdi-calendar-clock</v-icon>
            Admin · Reservations
          </div>
          <h1 class="page-title">Reservation Queue</h1>
          <p class="page-sub">Review and manage pending reservation requests</p>
        </div>
        <div class="header-actions">
          <!-- Desktop filter (hidden on mobile) -->
          <v-select
            v-model="statusFilter"
            class="rq-filter-select rq-filter-select--desktop"
            density="compact"
            hide-details
            :items="filterOptions"
            prepend-inner-icon="mdi-filter-variant"
            variant="outlined"
          />
        </div>
      </div>
      <div class="header-line" />

      <!-- ── Stats ──────────────────────────────────────────────────── -->
      <div class="rq-stats">
        <StatCard
          v-for="stat in stats"
          :key="stat.label"
          :color="stat.color"
          :label="stat.label"
          :value="stat.value"
        />
      </div>

      <!-- ── Mobile filter pills ────────────────────────────────────── -->
      <div class="rq-pills-wrap">
        <div class="rq-pills">
          <button
            v-for="opt in filterOptions"
            :key="opt"
            class="rq-pill"
            :class="{ 'rq-pill--active': statusFilter === opt }"
            @click="statusFilter = opt"
          >
            {{ opt }}
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           DESKTOP: custom CSS-grid table (≥ 768 px)
           ══════════════════════════════════════════════════════════════ -->
      <div class="rq-table-wrap">
        <!-- Sticky header -->
        <div class="rq-grid rq-grid--head">
          <span>ID</span>
          <span>Guest</span>
          <span>Date / Time</span>
          <span>Guests</span>
          <span>Table</span>
          <span>Notes</span>
          <span>Status</span>
          <span class="rq-col-center">Actions</span>
        </div>

        <!-- Rows -->
        <template v-if="filteredReservations.length > 0">
          <div
            v-for="res in filteredReservations"
            :key="res.id"
            class="rq-grid rq-grid--row"
          >
            <!-- ID -->
            <span class="rq-cell rq-cell--id">#{{ res.id }}</span>

            <!-- Guest -->
            <span class="rq-cell rq-cell--name">{{ res.name }}</span>

            <!-- Date / Time -->
            <div class="rq-cell">
              <span class="rq-date">{{ res.date }}</span>
              <span class="rq-time">{{ res.time }}</span>
            </div>

            <!-- Guests -->
            <div class="rq-cell rq-cell--guests">
              <v-icon color="#D4AF37" size="14">mdi-account-group</v-icon>
              {{ res.guests }}
            </div>

            <!-- Table chip -->
            <div class="rq-cell">
              <v-chip
                :class="res.elementId.startsWith('VIP') ? 'rq-chip--vip' : 'rq-chip--table'"
                size="small"
                variant="tonal"
              >
                {{ res.elementId }}
              </v-chip>
            </div>

            <!-- Notes -->
            <div class="rq-cell">
              <span v-if="res.notes" class="rq-notes" :title="res.notes">{{ res.notes }}</span>
              <span v-else class="rq-no-notes">—</span>
            </div>

            <!-- Status -->
            <div class="rq-cell">
              <ReservationStatusChip :status="res.status" />
            </div>

            <!-- Actions -->
            <div class="rq-cell rq-col-center">
              <div class="rq-actions">
                <v-tooltip location="top" text="Approve">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      class="rq-btn rq-btn--approve"
                      :disabled="res.status === 'APPROVED'"
                      icon
                      size="small"
                      @click="approve(res)"
                    >
                      <v-icon size="16">mdi-check</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip location="top" text="Reject">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      class="rq-btn rq-btn--reject"
                      :disabled="res.status === 'REJECTED'"
                      icon
                      size="small"
                      @click="confirmReject(res)"
                    >
                      <v-icon size="16">mdi-close</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </div>
          </div>
        </template>

        <!-- Desktop empty state -->
        <div v-else class="rq-empty rq-empty--desktop">
          <v-icon class="rq-empty__icon" size="56">mdi-calendar-check</v-icon>
          <p class="rq-empty__title">No reservations found</p>
          <p class="rq-empty__hint">Try changing or clearing the filter above</p>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           MOBILE: card list (< 768 px)
           ══════════════════════════════════════════════════════════════ -->
      <div class="rq-cards">
        <template v-if="filteredReservations.length > 0">
          <div
            v-for="(res, idx) in filteredReservations"
            :key="res.id"
            class="rq-card"
            :style="{ animationDelay: `${idx * 45}ms` }"
          >
            <!-- Card top: ID + status -->
            <div class="rq-card__top">
              <span class="rq-card__id">#{{ res.id }}</span>
              <ReservationStatusChip :status="res.status" />
            </div>

            <!-- Guest name -->
            <div class="rq-card__name">{{ res.name }}</div>

            <!-- Date + time row -->
            <div class="rq-card__datetime">
              <v-icon size="14" style="color: #D4AF37; margin-right: 4px">mdi-calendar</v-icon>
              <span class="rq-card__date">{{ res.date }}</span>
              <span class="rq-card__sep">·</span>
              <v-icon size="14" style="color: #6b7a8d; margin-right: 4px">mdi-clock-outline</v-icon>
              <span class="rq-card__time">{{ res.time }}</span>
            </div>

            <!-- Middle: party + table -->
            <div class="rq-card__meta">
              <div class="rq-card__guests">
                <v-icon color="#D4AF37" size="14">mdi-account-group</v-icon>
                <span>{{ res.guests }} guest{{ res.guests !== 1 ? 's' : '' }}</span>
              </div>
              <v-chip
                :class="res.elementId.startsWith('VIP') ? 'rq-chip--vip' : 'rq-chip--table'"
                size="small"
                variant="tonal"
              >
                {{ res.elementId }}
              </v-chip>
            </div>

            <!-- Notes -->
            <div v-if="res.notes" class="rq-card__notes">
              <v-icon size="13" style="color: #6b7a8d; margin-right: 4px">mdi-note-text-outline</v-icon>
              <span>{{ res.notes }}</span>
            </div>

            <!-- Action buttons -->
            <div class="rq-card__actions">
              <button
                class="rq-card__btn rq-card__btn--approve"
                :disabled="res.status === 'APPROVED'"
                @click="approve(res)"
              >
                <v-icon size="16">mdi-check</v-icon>
                Approve
              </button>
              <button
                class="rq-card__btn rq-card__btn--reject"
                :disabled="res.status === 'REJECTED'"
                @click="confirmReject(res)"
              >
                <v-icon size="16">mdi-close</v-icon>
                Reject
              </button>
            </div>
          </div>
        </template>

        <!-- Mobile empty state -->
        <div v-else class="rq-empty rq-empty--mobile">
          <v-icon class="rq-empty__icon" size="56">mdi-calendar-check</v-icon>
          <p class="rq-empty__title">No reservations found</p>
          <p class="rq-empty__hint">Try a different filter</p>
        </div>
      </div>

      <!-- ── Footer ──────────────────────────────────────────────────── -->
      <div class="rq-footer">
        <span>Showing <strong style="color: #D4AF37">{{ filteredReservations.length }}</strong> of {{ venueReservations.length }} reservations</span>
        <div class="rq-legend">
          <div class="rq-legend__item"><span class="rq-dot rq-dot--pending" />Pending</div>
          <div class="rq-legend__item"><span class="rq-dot rq-dot--approved" />Approved</div>
          <div class="rq-legend__item"><span class="rq-dot rq-dot--rejected" />Rejected</div>
        </div>
      </div>

    </div>
  </v-main>

  <!-- ── Reject Confirmation Dialog ─────────────────────────────────── -->
  <v-dialog v-model="rejectDialog" max-width="400">
    <v-card flat style="background: var(--color-surface-elevated); border: 1px solid rgba(212,175,55,0.18); border-radius: 16px;">
      <v-card-text class="pa-6 text-center">
        <v-icon size="56" style="color: #c71585; margin-bottom: 12px">mdi-close-circle-outline</v-icon>
        <h2 style="font-family: var(--font-heading); color: #f0ead6; font-size: 1.3rem; margin-bottom: 8px;">Reject Reservation?</h2>
        <p style="color: #b8bcc8; font-size: 0.9rem; margin-bottom: 20px;">
          Reject reservation <strong style="color: #d4af37">#{{ pendingRejectRes?.id }}</strong> for <strong style="color: #fff">{{ pendingRejectRes?.name }}</strong>?
        </p>
        <div class="d-flex gap-3 justify-center">
          <v-btn class="secondary-btn" variant="outlined" @click="rejectDialog = false">Cancel</v-btn>
          <v-btn class="danger-btn" flat @click="doReject">Reject</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <SpotlySnackbar :snackbar="snackbar" />
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import ReservationStatusChip from '@/components/feedback/ReservationStatusChip.vue'
  import SpotlySnackbar from '@/components/feedback/SpotlySnackbar.vue'
  import AppNavbarSpotly from '@/components/layout/AppNavbarSpotly.vue'
  import StatCard from '@/components/ui/StatCard.vue'
  import { useAdminNav } from '@/composables/useAdminNav'
  import { useAuth } from '@/composables/useAuth'
  import { useSnackbar } from '@/composables/useSnackbar'
  import { RESERVATION_LIST, updateReservationStatus } from '@/datamodel/Reservation'
  import { addReservationLog, ReservationLog } from '@/datamodel/ReservationLog'
  import { getVenueByAdminEmail } from '@/datamodel/Venue.js'

  const router = useRouter()
  const { snackbar, notifySuccess, notifyError } = useSnackbar()

  // ─── Nav ──────────────────────────────────────────────────────────────────────
  const { adminNavLinks, handleNav } = useAdminNav()
  const { getSession } = useAuth()
  const session = getSession()
  const actorRole = getVenueByAdminEmail(session?.email) ? 'admin' : 'staff'

  // ─── Venue-scoped reservations ────────────────────────────────────────────────
  const venueReservations = computed(() =>
    session?.venueId == null
      ? []
      : RESERVATION_LIST.filter(r => r.venueId === session.venueId),
  )

  // ─── State ────────────────────────────────────────────────────────────────────
  const statusFilter = ref('All')
  const filterOptions = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled']
  // Map display labels → canonical statuses
  const displayToStatus = { Pending: 'REQUESTED', Approved: 'APPROVED', Rejected: 'REJECTED', Cancelled: 'CANCELLED' }

  // ─── Reject confirmation dialog ────────────────────────────────────────────────
  const rejectDialog = ref(false)
  const pendingRejectRes = ref(null)

  function confirmReject (res) {
    pendingRejectRes.value = res
    rejectDialog.value = true
  }
  function doReject () {
    const res = pendingRejectRes.value
    if (!res) return
    const prev = res.status
    updateReservationStatus(res.id, 'REJECTED')
    addReservationLog(new ReservationLog({
      id: Date.now(),
      reservationId: res.id,
      previousStatus: prev,
      newStatus: 'REJECTED',
      timestamp: new Date().toISOString(),
      actorRole,
    }))
    notifyError(`Reservation #${res.id} rejected`)
    rejectDialog.value = false
    pendingRejectRes.value = null
  }

  const stats = computed(() => [
    { label: 'Total', value: venueReservations.value.length, color: '#D4AF37' },
    { label: 'Pending', value: venueReservations.value.filter(r => r.status === 'REQUESTED').length, color: '#C71585' },
    { label: 'Approved', value: venueReservations.value.filter(r => r.status === 'APPROVED').length, color: '#2EBB57' },
    { label: 'Rejected', value: venueReservations.value.filter(r => r.status === 'REJECTED').length, color: '#888' },
  ])

  const filteredReservations = computed(() => {
    if (statusFilter.value === 'All') return venueReservations.value
    const canonical = displayToStatus[statusFilter.value]
    return venueReservations.value.filter(r => r.status === canonical)
  })

  // ─── Actions ──────────────────────────────────────────────────────────────────
  function approve (res) {
    const prev = res.status
    updateReservationStatus(res.id, 'APPROVED')
    addReservationLog(new ReservationLog({
      id: Date.now(),
      reservationId: res.id,
      previousStatus: prev,
      newStatus: 'APPROVED',
      timestamp: new Date().toISOString(),
      actorRole,
    }))
    notifySuccess(`Reservation #${res.id} approved`)
  }
  // ─── Helpers ──────────────────────────────────────────────────────────────────
  // statusIcon + statusColor now provided by ReservationStatusChip via useTableStatus
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   TOKENS
   ═══════════════════════════════════════════════════════════════ */
.rq-main {
  --gold:       #d4af37;
  --midnight:   #0a0e14;
  --surface:    #13181f;
  --green:      #2ebb57;
  --rose:       #c71585;
  --muted:      #6b7a8d;
  --border:     rgba(212, 175, 55, 0.15);
  background-color: var(--midnight) !important;
  font-family: var(--font-body);
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT
   ═══════════════════════════════════════════════════════════════ */
.rq-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 48px 80px;
}
@media (max-width: 1024px) {
  .rq-container {
    padding: 32px 24px 60px;
  }
}

/* ═══════════════════════════════════════════════════════════════
   PAGE HEADER
   ═══════════════════════════════════════════════════════════════ */
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

/* Desktop filter select */
.rq-filter-select--desktop {
  max-width: 200px;
  min-width: 160px;
}
.rq-filter-select--desktop :deep(.v-field) {
  background: var(--surface) !important;
  border-color: rgba(212, 175, 55, 0.3) !important;
  color: #fff !important;
  font-size: 0.85rem;
}
.rq-filter-select--desktop :deep(.v-field__prepend-inner .v-icon) {
  color: var(--gold) !important;
}

/* ═══════════════════════════════════════════════════════════════
   STATS ROW
   ═══════════════════════════════════════════════════════════════ */
.rq-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE FILTER PILLS  (hidden on desktop)
   ═══════════════════════════════════════════════════════════════ */
.rq-pills-wrap {
  display: none;
  overflow-x: auto;
  scrollbar-width: none;
  margin-bottom: 24px;
  -webkit-overflow-scrolling: touch;
}
.rq-pills-wrap::-webkit-scrollbar { display: none; }

.rq-pills {
  display: flex;
  gap: 8px;
  padding-bottom: 2px;
}

.rq-pill {
  flex-shrink: 0;
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-size: 0.82rem;
  font-family: var(--font-body);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.15s;
  touch-action: manipulation;
  min-height: 44px;
  display: flex;
  align-items: center;
}
.rq-pill:hover {
  border-color: rgba(212, 175, 55, 0.4);
  color: rgba(255, 255, 255, 0.8);
}
.rq-pill--active {
  background: rgba(212, 175, 55, 0.15);
  border-color: rgba(212, 175, 55, 0.6);
  color: var(--gold);
}
.rq-pill--active:hover {
  transform: translateY(-1px);
}

/* ═══════════════════════════════════════════════════════════════
   DESKTOP TABLE  (CSS Grid)
   ═══════════════════════════════════════════════════════════════ */
.rq-table-wrap {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 8px;
}

/* 8-column grid: ID | Guest | Date | Guests | Table | Notes | Status | Actions */
.rq-grid {
  display: grid;
  grid-template-columns: 80px 1fr 110px 70px 90px 1fr 110px 96px;
  align-items: center;
}

/* Sticky header */
.rq-grid--head {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgba(212, 175, 55, 0.07);
  border-bottom: 1px solid rgba(212, 175, 55, 0.25);
  padding: 0;
}
.rq-grid--head > span {
  padding: 14px 14px;
  color: var(--gold);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
}

/* Data rows */
.rq-grid--row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.045);
  transition: background 0.15s;
  cursor: default;
  position: relative;
}
.rq-grid--row:last-child { border-bottom: none; }
.rq-grid--row::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.04) 50%, transparent 100%);
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
.rq-grid--row:hover { background: rgba(212, 175, 55, 0.035); }
.rq-grid--row:hover::after { opacity: 1; }

/* Cells */
.rq-cell {
  padding: 14px 14px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}
.rq-cell--id {
  color: var(--gold);
  font-weight: 600;
  font-size: 0.8rem;
  flex-direction: row;
  align-items: center;
}
.rq-cell--name {
  font-weight: 500;
  color: #fff;
  flex-direction: row;
  align-items: center;
}
.rq-cell--guests {
  flex-direction: row;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}
.rq-col-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.rq-date {
  font-weight: 500;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.85);
}
.rq-time {
  color: var(--muted);
  font-size: 0.77rem;
}
.rq-notes {
  color: var(--muted);
  font-size: 0.82rem;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}
.rq-no-notes { color: rgba(107, 122, 141, 0.38); }

/* Chips */
.rq-chip--vip {
  background: rgba(212, 175, 55, 0.16) !important;
  color: var(--gold) !important;
  border: 1px solid rgba(212, 175, 55, 0.32);
  font-weight: 600;
  font-size: 0.72rem !important;
}
.rq-chip--table {
  background: rgba(255, 255, 255, 0.06) !important;
  color: rgba(255, 255, 255, 0.6) !important;
  font-size: 0.72rem !important;
}

/* Action icon buttons */
.rq-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.rq-btn {
  border-radius: 8px !important;
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s !important;
  cursor: pointer;
}
.rq-btn--approve {
  background: rgba(46, 187, 87, 0.11) !important;
  color: var(--green) !important;
  border: 1px solid rgba(46, 187, 87, 0.28) !important;
}
.rq-btn--approve:hover:not(:disabled) {
  background: rgba(46, 187, 87, 0.22) !important;
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(46, 187, 87, 0.28);
}
.rq-btn--reject {
  background: rgba(199, 21, 133, 0.11) !important;
  color: var(--rose) !important;
  border: 1px solid rgba(199, 21, 133, 0.28) !important;
}
.rq-btn--reject:hover:not(:disabled) {
  background: rgba(199, 21, 133, 0.22) !important;
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(199, 21, 133, 0.28);
}
.rq-btn:disabled { opacity: 0.28 !important; cursor: not-allowed; }

/* ═══════════════════════════════════════════════════════════════
   MOBILE CARDS  (hidden on desktop)
   ═══════════════════════════════════════════════════════════════ */
.rq-cards { display: none; }

@keyframes rq-slide-up {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rq-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 18px 16px;
  margin-bottom: 12px;
  animation: rq-slide-up 0.3s ease-out both;
  transition: border-color 0.2s;
}
.rq-card:active {
  border-color: rgba(212, 175, 55, 0.32);
}

.rq-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.rq-card__id {
  color: var(--gold);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}
.rq-card__name {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 600;
  color: #f0ead6;
  margin-bottom: 8px;
  line-height: 1.3;
}
.rq-card__datetime {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
}
.rq-card__date {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.84rem;
  font-weight: 500;
}
.rq-card__sep {
  color: var(--muted);
  margin: 0 4px;
}
.rq-card__time {
  color: var(--muted);
  font-size: 0.82rem;
}

.rq-card__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.rq-card__guests {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.84rem;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 500;
}

.rq-card__notes {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 0.8rem;
  color: var(--muted);
  font-style: italic;
  margin-bottom: 14px;
  line-height: 1.4;
}

/* Card action buttons — full-width row */
.rq-card__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
}
.rq-card__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  transition: opacity 0.15s, transform 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.rq-card__btn:active:not(:disabled) { transform: scale(0.97); }
.rq-card__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.rq-card__btn--approve {
  background: rgba(46, 187, 87, 0.14);
  border-color: rgba(46, 187, 87, 0.32);
  color: var(--green);
}
.rq-card__btn--reject {
  background: rgba(199, 21, 133, 0.14);
  border-color: rgba(199, 21, 133, 0.32);
  color: var(--rose);
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATES
   ═══════════════════════════════════════════════════════════════ */
.rq-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 24px;
  text-align: center;
}
.rq-empty__icon {
  color: var(--gold) !important;
  opacity: 0.6;
  margin-bottom: 16px;
  animation: rq-pulse 2.4s ease-in-out infinite;
}
@keyframes rq-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 0.9; transform: scale(1.06); }
}
.rq-empty__title {
  color: rgba(255, 255, 255, 0.7);
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 6px;
}
.rq-empty__hint {
  color: var(--muted);
  font-size: 0.85rem;
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */
.rq-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  color: var(--muted);
  font-size: 0.8rem;
  flex-wrap: wrap;
  gap: 12px;
}
.rq-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.rq-legend__item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
}
.rq-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.rq-dot--pending  { background: var(--rose); }
.rq-dot--approved { background: var(--green); }
.rq-dot--rejected { background: #555; }

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════ */

/* Tablet: 2×2 stats grid */
@media (max-width: 960px) {
  .rq-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile breakpoint */
@media (max-width: 767px) {
  .rq-container {
    padding: 24px 16px 56px;
  }

  /* Hide desktop filter in header */
  .rq-filter-select--desktop {
    display: none;
  }

  /* Show mobile pills */
  .rq-pills-wrap {
    display: block;
  }

  /* Stats: 2-column mini grid */
  .rq-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 24px;
  }

  /* Hide desktop table */
  .rq-table-wrap {
    display: none;
  }

  /* Show mobile cards */
  .rq-cards {
    display: block;
  }

  /* Stack footer vertically */
  .rq-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Very small phones */
@media (max-width: 375px) {
  .page-title {
    font-size: 1.5rem;
  }
  .rq-card__actions {
    grid-template-columns: 1fr;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .rq-card { animation: none; }
  .rq-empty__icon { animation: none; }
  .rq-btn,
  .rq-card__btn { transition: none; }
}
</style>
