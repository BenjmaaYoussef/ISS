<template>
  <!-- ── Top Navigation Bar ── -->
  <AppNavbarSpotly />

  <!-- ── Main Content ── -->
  <v-main class="spotly-main">
    <div class="spotly-container">

      <!-- ══ Welcome Banner ══ -->
      <div class="welcome-banner mb-8">
        <div class="welcome-glow" />
        <div class="welcome-glow welcome-glow--right" />
        <div class="welcome-content">
          <div class="welcome-eyebrow">
            <v-icon color="#D4AF37" size="14" class="mr-1">mdi-map-marker-multiple-outline</v-icon>
            Your Spotly Journey
          </div>
          <div class="welcome-greeting">Welcome back, {{ sessionName }}!</div>
          <div class="welcome-sub">
            You have reservations across <strong class="text-gold">{{ venueCount }}</strong> venue{{ venueCount !== 1 ? 's' : '' }} — here's everything at a glance.
          </div>
        </div>
        <div class="welcome-avatar" aria-hidden="true">
          <div class="avatar-ring">{{ initials }}</div>
        </div>
      </div>

      <!-- ══ Quick Stats Row ══ -->
      <div class="stats-row mb-8">
        <div
          v-for="(stat, i) in statsCards"
          :key="stat.label"
          class="stat-card"
          :style="{ animationDelay: `${i * 60}ms` }"
        >
          <div class="stat-icon-wrap">
            <v-icon :color="stat.color" size="20">{{ stat.icon }}</v-icon>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- ══ Two-column layout ══ -->
      <div class="dashboard-grid">

        <!-- ── LEFT: Upcoming Reservations ── -->
        <div class="section">
          <SectionHeader
            class="mb-5"
            :count="upcoming.length"
            icon="mdi-calendar-clock"
            title="Upcoming Reservations"
          />

          <!-- Empty state -->
          <div v-if="upcoming.length === 0" class="empty-card">
            <v-icon class="mb-3" color="#D4AF37" size="40">mdi-calendar-blank</v-icon>
            <div class="empty-title">No upcoming reservations</div>
            <div class="empty-sub mt-1">Discover venues and book your next experience</div>
            <v-btn
              class="book-btn mt-5"
              size="small"
              @click="router.push('/home')"
            >
              <v-icon size="14" start>mdi-magnify</v-icon>
              Explore Venues
            </v-btn>
          </div>

          <!-- Reservation cards -->
          <div
            v-for="(res, i) in upcoming"
            :key="res.id"
            class="reservation-card mb-4"
            :style="{ animationDelay: `${i * 80}ms` }"
          >
            <!-- Status strip -->
            <div
              class="card-strip"
              :class="`strip--${res.status === 'REQUESTED' ? 'pending' : res.status.toLowerCase()}`"
            />

            <div class="card-body">
              <!-- Venue name pill -->
              <div class="venue-pill mb-3">
                <v-icon color="#D4AF37" size="11" class="mr-1">mdi-domain</v-icon>
                {{ res.venueName }}
              </div>

              <!-- Date / Status row -->
              <div class="card-top d-flex align-start justify-space-between mb-3">
                <div>
                  <div class="res-date">{{ res.date }}</div>
                  <div class="res-time">
                    <v-icon class="mr-1" color="#D4AF37" size="12">mdi-clock-outline</v-icon>
                    {{ res.time }}
                  </div>
                </div>
                <ReservationStatusChip :status="res.status" />
              </div>

              <!-- Details grid -->
              <div class="res-details">
                <div class="detail-row">
                  <v-icon color="#6b7a8d" size="13">mdi-map-marker-outline</v-icon>
                  <span class="detail-label">Area</span>
                  <span class="detail-value">{{ res.area }}</span>
                </div>
                <div class="detail-row">
                  <v-icon color="#6b7a8d" size="13">mdi-table-furniture</v-icon>
                  <span class="detail-label">Table</span>
                  <span class="detail-value">{{ res.table }}</span>
                </div>
                <div class="detail-row">
                  <v-icon color="#6b7a8d" size="13">mdi-account-group-outline</v-icon>
                  <span class="detail-label">Guests</span>
                  <span class="detail-value">{{ res.guests }}</span>
                </div>
              </div>

              <!-- Notes -->
              <div v-if="res.notes" class="res-notes mt-3">
                <v-icon class="mr-1" color="#D4AF37" size="12">mdi-note-text-outline</v-icon>
                {{ res.notes }}
              </div>

              <!-- Cancel action -->
              <div class="card-actions mt-4">
                <v-btn
                  class="cancel-btn"
                  :disabled="['CANCELLED', 'REJECTED', 'NO_SHOW', 'COMPLETED', 'CHECKED_IN'].includes(res.status)"
                  size="small"
                  variant="outlined"
                  @click="cancelDialog = true; selectedRes = res"
                >
                  <v-icon size="13" start>mdi-close-circle-outline</v-icon>
                  Cancel Reservation
                </v-btn>
              </div>
            </div>
          </div>
        </div>

        <!-- ── RIGHT: Past Visits + Loyalty ── -->
        <div class="section">
          <SectionHeader
            class="mb-5"
            :count="pastVisits.length"
            icon="mdi-history"
            title="Past Visits"
          />

          <!-- Empty past visits -->
          <div v-if="pastVisits.length === 0" class="empty-card empty-card--compact mb-4">
            <v-icon color="#6b7a8d" size="28" class="mb-2">mdi-clock-outline</v-icon>
            <div class="empty-sub">Your completed visits will appear here</div>
          </div>

          <div class="past-list">
            <div
              v-for="(visit, i) in pastVisits"
              :key="i"
              class="past-item"
              :style="{ animationDelay: `${i * 60}ms` }"
            >
              <div class="past-date-badge" aria-hidden="true">
                <span class="badge-day">{{ visit.day }}</span>
                <span class="badge-month">{{ visit.month }}</span>
              </div>

              <div class="past-mid">
                <div class="past-venue-name">{{ visit.venueName }}</div>
                <div class="past-area">{{ visit.area }}</div>
                <div class="past-meta">
                  Table {{ visit.table }} · {{ visit.guests }} guests
                </div>
              </div>

              <div class="past-right">
                <v-chip class="completed-chip" size="x-small">
                  <v-icon size="10" start>mdi-check-circle</v-icon>
                  Completed
                </v-chip>
              </div>
            </div>
          </div>

          <!-- ── Loyalty Card ── -->
          <div class="loyalty-card mt-6">
            <div class="loyalty-bg" />
            <div class="loyalty-content">
              <div class="loyalty-header d-flex align-center justify-space-between">
                <div class="loyalty-title">
                  <v-icon class="mr-2" color="#D4AF37" size="18">mdi-star-four-points</v-icon>
                  Guest Status
                </div>
                <v-chip
                  class="tier-badge"
                  size="x-small"
                  :class="`tier--${loyaltyTier.key}`"
                >
                  {{ loyaltyTier.label }}
                </v-chip>
              </div>

              <div class="loyalty-tier mt-2">{{ loyaltyTier.label }}</div>
              <div class="loyalty-visits">{{ completedCount }} visit{{ completedCount !== 1 ? 's' : '' }} completed</div>

              <v-progress-linear
                bg-color="rgba(212,175,55,0.15)"
                class="mt-3 mb-1"
                color="#D4AF37"
                height="5"
                :model-value="loyaltyTier.progress"
                rounded
              />

              <div class="loyalty-next">{{ loyaltyTier.next }}</div>

              <!-- Venues visited inline stat -->
              <div class="loyalty-venues-row mt-4">
                <v-icon color="#D4AF37" size="13" class="mr-1">mdi-domain</v-icon>
                <span class="loyalty-venues-text">Venues visited: <strong class="text-gold">{{ venuesVisitedCount }}</strong></span>
              </div>
            </div>
          </div>

          <!-- ── Visited Venues Chips ── -->
          <div v-if="visitedVenueNames.length > 0" class="venues-visited-section mt-5">
            <div class="venues-visited-label mb-3">
              <v-icon color="#6b7a8d" size="13" class="mr-1">mdi-map-marker-check</v-icon>
              Venues You've Explored
            </div>
            <div class="venues-chip-row">
              <v-chip
                v-for="vname in visitedVenueNames"
                :key="vname"
                class="venue-chip mr-2 mb-2"
                size="small"
                @click="router.push('/home')"
              >
                <v-icon size="11" start>mdi-domain</v-icon>
                {{ vname }}
              </v-chip>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-main>

  <!-- ── Cancel Confirmation Dialog ── -->
  <v-dialog v-model="cancelDialog" class="spotly-dialog" max-width="420">
    <v-card class="dialog-card">
      <div class="dialog-strip" />
      <v-card-title class="dialog-title pt-6 px-6">Cancel Reservation?</v-card-title>
      <v-card-text class="px-6 pb-2">
        <p class="dialog-body">
          Are you sure you want to cancel your reservation at
          <strong>{{ selectedRes?.area }}</strong> on
          <strong>{{ selectedRes?.date }}</strong> at
          <strong>{{ selectedRes?.time }}</strong>?
        </p>
        <p class="dialog-note mt-2">This action cannot be undone.</p>
      </v-card-text>
      <v-card-actions class="px-6 pb-6 ga-3">
        <v-btn class="keep-btn" variant="text" @click="cancelDialog = false">Keep it</v-btn>
        <v-spacer />
        <v-btn class="confirm-cancel-btn" @click="confirmCancel">Yes, Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Snackbar -->
  <SpotlySnackbar :snackbar="snackbar" />
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import ReservationStatusChip from '@/components/feedback/ReservationStatusChip.vue'
  import SpotlySnackbar from '@/components/feedback/SpotlySnackbar.vue'
  import SectionHeader from '@/components/ui/SectionHeader.vue'
  import { useAuth } from '@/composables/useAuth'
  import { useSnackbar } from '@/composables/useSnackbar'
  import { ENVIRONMENT_LIST } from '@/datamodel/Environment.js'
  import { RESERVATION_LIST, updateReservationStatus } from '@/datamodel/Reservation.js'
  import { addReservationLog, ReservationLog } from '@/datamodel/ReservationLog.js'
  import { VENUE_LIST } from '@/datamodel/Venue.js'

  const router = useRouter()
  const { snackbar, notify } = useSnackbar()

  // ── Session ─────────────────────────────────────────────────────────────────
  const session = (() => {
    try { return JSON.parse(localStorage.getItem('spotly_session') || '{}') }
    catch { return {} }
  })()
  const sessionUserId = session.userId || ''
  const sessionName   = session.name   || 'Guest'

  // ── Dialogs & state ─────────────────────────────────────────────────────────
  const cancelDialog = ref(false)
  const selectedRes  = ref(null)

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function formatDate (dateStr) {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function venueNameById (venueId) {
    return VENUE_LIST.find(v => v.id === venueId)?.name || 'Unknown Venue'
  }

  function enrichReservation (r) {
    const env = ENVIRONMENT_LIST.find(e => e.id === r.environmentId)
    const el  = env?.elements.find(el => el.id === r.elementId)
    return {
      id:        r.id,
      rawDate:   r.date,
      date:      formatDate(r.date),
      time:      r.time,
      area:      env?.name    || r.environmentId || 'Unknown',
      table:     el?.label    || r.elementId     || 'TBD',
      guests:    r.guests,
      notes:     r.notes,
      status:    r.status,
      venueId:   r.venueId,
      venueName: venueNameById(r.venueId),
    }
  }

  // ── Computed lists ───────────────────────────────────────────────────────────
  const ACTIVE_STATUSES = new Set(['REQUESTED', 'APPROVED', 'CHECKED_IN'])
  const PAST_STATUSES   = new Set(['COMPLETED', 'NO_SHOW', 'CANCELLED', 'REJECTED'])

  const baseList = computed(() =>
    sessionUserId
      ? RESERVATION_LIST.filter(r => r.userId === sessionUserId)
      : [],
  )

  const upcoming = computed(() =>
    baseList.value
      .filter(r => ACTIVE_STATUSES.has(r.status))
      .map(enrichReservation)
      .sort((a, b) => a.rawDate.localeCompare(b.rawDate)),
  )

  const pastVisits = computed(() =>
    baseList.value
      .filter(r => PAST_STATUSES.has(r.status))
      .map(r => {
        const d   = new Date(r.date + 'T00:00:00')
        const env = ENVIRONMENT_LIST.find(e => e.id === r.environmentId)
        const el  = env?.elements.find(el => el.id === r.elementId)
        return {
          day:       String(d.getDate()).padStart(2, '0'),
          month:     d.toLocaleString('en-US', { month: 'short' }),
          area:      env?.name || r.environmentId || 'Unknown',
          table:     el?.label || r.elementId     || 'TBD',
          guests:    r.guests,
          rawDate:   r.date,
          venueId:   r.venueId,
          venueName: venueNameById(r.venueId),
        }
      })
      .sort((a, b) => b.rawDate.localeCompare(a.rawDate)),
  )

  // ── Loyalty tier (unchanged logic) ──────────────────────────────────────────
  const completedCount = computed(() =>
    baseList.value.filter(r => r.status === 'COMPLETED').length,
  )

  const loyaltyTier = computed(() => {
    const n = completedCount.value
    if (n >= 10) return { key: 'gold',   label: 'Gold Member',   progress: 100,           next: "You've reached Gold!" }
    if (n >= 3)  return { key: 'silver', label: 'Silver Member', progress: (n / 10) * 100, next: `${10 - n} more visits to Gold` }
    return              { key: 'bronze', label: 'Bronze Member', progress: (n / 3)  * 100, next: `${3 - n} more visits to Silver` }
  })

  // ── Multi-venue derived stats ────────────────────────────────────────────────
  const venuesVisitedCount = computed(() =>
    new Set(baseList.value.filter(r => r.status === 'COMPLETED').map(r => r.venueId)).size,
  )

  const venueCount = computed(() =>
    new Set(baseList.value.map(r => r.venueId)).size,
  )

  const visitedVenueNames = computed(() => {
    const ids = [...new Set(baseList.value.filter(r => r.status === 'COMPLETED').map(r => r.venueId))]
    return ids.map(id => venueNameById(id)).filter(n => n !== 'Unknown Venue')
  })

  const initials = computed(() =>
    sessionName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
  )

  const statsCards = computed(() => [
    { label: 'Total',         value: baseList.value.length,  icon: 'mdi-calendar-check-outline',  color: '#D4AF37' },
    { label: 'Upcoming',      value: upcoming.value.length,  icon: 'mdi-calendar-clock',           color: '#2ebb57' },
    { label: 'Completed',     value: completedCount.value,   icon: 'mdi-check-decagram-outline',   color: '#6b9fff' },
    { label: 'Venues Visited', value: venuesVisitedCount.value, icon: 'mdi-domain',               color: '#c471ed' },
  ])

  // ── Actions (unchanged logic) ────────────────────────────────────────────────
  function confirmCancel () {
    if (!selectedRes.value) return
    const res = RESERVATION_LIST.find(r => r.id === selectedRes.value.id && r.userId === sessionUserId)
    if (res) {
      const prev = res.status
      updateReservationStatus(res.id, 'CANCELLED')
      addReservationLog(
        new ReservationLog({
          id:              Date.now(),
          reservationId:   res.id,
          previousStatus:  prev,
          newStatus:       'CANCELLED',
          timestamp:       new Date().toISOString(),
          actorRole:       'client',
        }),
      )
    }
    cancelDialog.value = false
    notify('Reservation cancelled successfully', '#C71585', 'mdi-close-circle')
  }

  const { logout } = useAuth()
</script>

<style scoped>
/* ── Design Tokens ── */
.spotly-main {
  --gold:    #d4af37;
  --midnight: #0a0e14;
  --surface: #13181f;
  --surface-2: var(--color-surface-elevated, rgba(255, 255, 255, 0.03));
  --green:   #2ebb57;
  --rose:    #c71585;
  --muted:   #6b7a8d;
  background: var(--midnight) !important;
  font-family: var(--font-body);
}

/* ── Container ── */
.spotly-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 48px 80px;
}
@media (max-width: 1024px) {
  .spotly-container { padding: 32px 24px 60px; }
}
@media (max-width: 600px) {
  .spotly-container { padding: 24px 16px 60px; }
}

/* ── Welcome Banner ── */
.welcome-banner {
  position: relative;
  background: var(--surface);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 20px;
  padding: 36px 40px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  animation: slideUp 0.5s ease both;
}
@media (max-width: 600px) {
  .welcome-banner { padding: 24px 20px; flex-wrap: wrap; }
}
.welcome-glow {
  position: absolute;
  top: -80px;
  left: -80px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
  pointer-events: none;
}
.welcome-glow--right {
  top: auto;
  left: auto;
  bottom: -60px;
  right: -60px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(196, 113, 237, 0.07) 0%, transparent 70%);
}
.welcome-eyebrow {
  display: flex;
  align-items: center;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--gold);
  margin-bottom: 8px;
  opacity: 0.8;
}
.welcome-greeting {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
}
@media (max-width: 600px) {
  .welcome-greeting { font-size: 1.5rem; }
}
.welcome-sub {
  color: var(--muted);
  font-size: 0.88rem;
  margin-top: 6px;
  line-height: 1.55;
}
.text-gold {
  color: var(--gold) !important;
}
.avatar-ring {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.1);
  border: 2px solid rgba(212, 175, 55, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 1.35rem;
  font-weight: 700;
  color: #d4af37;
  box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.12), 0 0 28px rgba(212, 175, 55, 0.15);
  flex-shrink: 0;
}

/* ── Stats Row ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 820px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); gap: 10px; }
}
.stat-card {
  background: var(--surface);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: border-color 0.2s, transform 0.2s;
  animation: slideUp 0.45s ease both;
  cursor: default;
}
.stat-card:hover {
  border-color: rgba(212, 175, 55, 0.2);
  transform: translateY(-2px);
}
.stat-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-value {
  font-family: var(--font-heading);
  font-size: 1.55rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}
.stat-label {
  font-size: 0.72rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 3px;
}

/* ── Dashboard Grid ── */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}
@media (max-width: 820px) {
  .dashboard-grid { grid-template-columns: 1fr; }
}

/* ── Section ── */
.section { min-width: 0; }

/* ── Book CTA ── */
.book-btn {
  background: var(--gold) !important;
  color: #0a0e14 !important;
  font-weight: 600;
  font-size: 0.78rem;
  border-radius: 8px !important;
  letter-spacing: 0.04em;
}

/* ── Empty Card ── */
.empty-card {
  background: var(--surface);
  border: 1px dashed rgba(212, 175, 55, 0.18);
  border-radius: 14px;
  padding: 44px 32px;
  text-align: center;
  color: var(--muted);
}
.empty-card--compact {
  padding: 24px 20px;
}
.empty-title {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}
.empty-sub {
  font-size: 0.82rem;
  color: var(--muted);
}

/* ── Reservation Card ── */
.reservation-card {
  background: var(--surface);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  transition: border-color 0.2s, transform 0.2s;
  animation: slideUp 0.4s ease both;
}
.reservation-card:hover {
  border-color: rgba(212, 175, 55, 0.25);
  transform: translateY(-2px);
}

/* Color strips */
.card-strip      { width: 4px; flex-shrink: 0; }
.strip--pending  { background: var(--rose); }
.strip--approved { background: var(--green); }
.strip--cancelled,
.strip--rejected,
.strip--no_show  { background: rgba(255,255,255,0.12); }
.strip--checked_in { background: #6b9fff; }

.card-body { padding: 18px 20px; flex: 1; min-width: 0; }

/* Venue pill */
.venue-pill {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--gold);
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 20px;
  padding: 3px 10px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.res-date {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}
.res-time {
  font-size: 0.78rem;
  color: var(--muted);
  margin-top: 2px;
  display: flex;
  align-items: center;
}

.res-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
}
.detail-label {
  color: var(--muted);
  min-width: 48px;
  font-size: 0.78rem;
}
.detail-value {
  color: rgba(255, 255, 255, 0.82);
  font-weight: 500;
}

.res-notes {
  font-size: 0.78rem;
  color: var(--muted);
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 6px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
}

.cancel-btn {
  border-color: rgba(199, 21, 133, 0.3) !important;
  color: var(--rose) !important;
  font-size: 0.75rem !important;
  border-radius: 8px !important;
  transition: background 0.2s, box-shadow 0.2s !important;
}
.cancel-btn:hover:not(:disabled) {
  background: rgba(199, 21, 133, 0.1) !important;
  box-shadow: 0 0 10px rgba(199, 21, 133, 0.2);
}

/* ── Past Visits ── */
.past-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.past-item {
  background: var(--surface);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: border-color 0.2s, transform 0.15s;
  animation: slideUp 0.4s ease both;
}
.past-item:hover {
  border-color: rgba(212, 175, 55, 0.18);
  transform: translateX(3px);
}
.past-date-badge {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 8px;
  padding: 8px 10px;
  text-align: center;
  min-width: 44px;
  flex-shrink: 0;
}
.badge-day {
  display: block;
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--gold);
  line-height: 1;
}
.badge-month {
  display: block;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin-top: 2px;
}
.past-mid { flex: 1; min-width: 0; }
.past-venue-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--gold);
  opacity: 0.85;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.past-area {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.88rem;
  margin-top: 1px;
}
.past-meta {
  font-size: 0.74rem;
  color: var(--muted);
  margin-top: 1px;
}
.completed-chip {
  background: rgba(46, 187, 87, 0.12) !important;
  color: #2ebb57 !important;
  font-size: 0.65rem !important;
  font-weight: 600 !important;
  border: 1px solid rgba(46, 187, 87, 0.2);
  flex-shrink: 0;
}

/* ── Loyalty Card ── */
.loyalty-card {
  position: relative;
  background: var(--surface);
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 16px;
  padding: 24px 26px;
  overflow: hidden;
}
.loyalty-bg {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.08), transparent 70%);
  pointer-events: none;
}
.loyalty-title {
  display: flex;
  align-items: center;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
}
.tier-badge {
  font-size: 0.65rem !important;
  font-weight: 700 !important;
  border-radius: 20px !important;
}
.tier--gold   { background: rgba(212, 175, 55, 0.2) !important; color: #d4af37 !important; border: 1px solid rgba(212,175,55,0.35) !important; }
.tier--silver { background: rgba(180, 180, 200, 0.15) !important; color: #b4b4c8 !important; border: 1px solid rgba(180,180,200,0.3) !important; }
.tier--bronze { background: rgba(180, 100, 60, 0.15) !important; color: #c87941 !important; border: 1px solid rgba(180,100,60,0.3) !important; }

.loyalty-tier {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 700;
  color: #d4af37;
}
.loyalty-visits {
  font-size: 0.8rem;
  color: var(--muted);
  margin-top: 2px;
}
.loyalty-next {
  font-size: 0.72rem;
  color: var(--muted);
}
.loyalty-venues-row {
  display: flex;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.loyalty-venues-text {
  font-size: 0.78rem;
  color: var(--muted);
}

/* ── Visited Venues Chips ── */
.venues-visited-section {
  background: var(--surface);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 18px 20px;
}
.venues-visited-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  display: flex;
  align-items: center;
}
.venues-chip-row {
  display: flex;
  flex-wrap: wrap;
}
.venue-chip {
  background: rgba(212, 175, 55, 0.08) !important;
  color: rgba(212, 175, 55, 0.85) !important;
  border: 1px solid rgba(212, 175, 55, 0.2) !important;
  font-size: 0.72rem !important;
  font-weight: 500 !important;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.venue-chip:hover {
  background: rgba(212, 175, 55, 0.15) !important;
  border-color: rgba(212, 175, 55, 0.35) !important;
}

/* ── Cancel Dialog ── */
.dialog-card {
  background: var(--surface-2) !important;
  border: 1px solid rgba(212, 175, 55, 0.18) !important;
  border-radius: 16px !important;
  overflow: hidden;
}
.dialog-strip {
  height: 3px;
  background: linear-gradient(90deg, var(--gold), transparent);
}
.dialog-title {
  font-family: var(--font-heading) !important;
  font-size: 1.25rem !important;
  color: #fff !important;
}
.dialog-body {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.9rem;
  line-height: 1.6;
}
.dialog-note {
  font-size: 0.78rem;
  color: var(--muted);
}
.keep-btn {
  color: var(--muted) !important;
}
.confirm-cancel-btn {
  background: rgba(199, 21, 133, 0.85) !important;
  color: #fff !important;
  font-weight: 600;
  border-radius: 8px !important;
}

/* ── Animation ── */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0);    }
}
</style>
