<template>
  <!-- ── Top Navigation Bar ── -->
  <AppNavbarSpotly
    active-link="dashboard"
    :nav-links="adminNavLinks"
    @nav="handleNav"
  />

  <!-- ── Main Content ── -->
  <v-main class="spotly-main">
    <div class="dash-container">

      <!-- ── Page Header ── -->
      <div class="page-header">
        <div>
          <div class="page-eyebrow">
            <v-icon class="mr-1" color="#D4AF37" size="13">mdi-shield-crown</v-icon>
            Admin Panel
          </div>
          <h1 class="page-title">{{ greeting }}, {{ sessionFirstName }}</h1>
          <p class="page-sub">{{ todayLabel }} · Here's your venue at a glance.</p>
        </div>
        <div class="header-badge">
          <div class="live-dot" />
          <span class="live-label">Live</span>
        </div>
      </div>
      <div class="header-line mb-8" />

      <!-- ── KPI Row ── -->
      <div class="kpi-row mb-8">
        <!-- Today's Reservations — hero card -->
        <div class="kpi-hero">
          <div class="kpi-eyebrow">Today</div>
          <div class="kpi-hero-value">{{ todayReservations }}</div>
          <div class="kpi-hero-label">Reservations Today</div>
          <div class="kpi-hero-bar">
            <div
              class="kpi-hero-bar-fill"
              :style="{ width: todaySharePct + '%' }"
            />
          </div>
          <div class="kpi-hero-sub">
            {{ todaySharePct }}% of total
          </div>
        </div>

        <!-- Secondary KPIs -->
        <div class="kpi-secondary">
          <div
            v-for="kpi in secondaryKpis"
            :key="kpi.label"
            class="kpi-tile"
          >
            <div class="kpi-tile-icon" :style="{ background: kpi.bg, borderColor: kpi.border }">
              <v-icon :color="kpi.iconColor" size="18">{{ kpi.icon }}</v-icon>
            </div>
            <div class="kpi-tile-body">
              <div class="kpi-tile-value" :style="{ color: kpi.color }">{{ kpi.value }}</div>
              <div class="kpi-tile-label">{{ kpi.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Three-column insight row ── -->
      <div class="insight-row mb-8">
        <!-- Status Breakdown -->
        <div class="insight-card">
          <div class="insight-head">
            <v-icon class="mr-2" color="#D4AF37" size="15">mdi-chart-donut</v-icon>
            Status Breakdown
          </div>
          <div class="status-list">
            <div
              v-for="item in statusBreakdown"
              :key="item.label"
              class="status-row"
            >
              <div class="status-left">
                <span class="status-dot" :style="{ background: item.color }" />
                <span class="status-label">{{ item.label }}</span>
              </div>
              <div class="status-right">
                <span class="status-count" :style="{ color: item.color }">{{ item.count }}</span>
                <div class="status-bar-track">
                  <div
                    class="status-bar-fill"
                    :style="{ width: item.pct + '%', background: item.color }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Environment -->
        <div class="insight-card insight-card--accent">
          <div class="insight-head">
            <v-icon class="mr-2" color="#D4AF37" size="15">mdi-trophy-outline</v-icon>
            Top Space
          </div>
          <template v-if="topEnvironment">
            <div class="top-env-icon-wrap">
              <v-icon color="#D4AF37" size="28">{{ topEnvironment.icon }}</v-icon>
            </div>
            <div class="top-env-name">{{ topEnvironment.name }}</div>
            <div class="top-env-stat">
              <span class="top-env-num">{{ topEnvironment.bookings }}</span>
              <span class="top-env-sub"> reservations total</span>
            </div>
            <div class="top-env-occ">
              <div class="top-env-occ-track">
                <div
                  class="top-env-occ-fill"
                  :style="{ width: topEnvironment.occupancy + '%', background: occupancyColor(topEnvironment.occupancy) }"
                />
              </div>
              <span class="top-env-occ-label">{{ topEnvironment.occupancy }}% occupied today</span>
            </div>
          </template>
          <div v-else class="insight-empty">No environments yet</div>
        </div>

        <!-- Quick Actions -->
        <div class="insight-card">
          <div class="insight-head">
            <v-icon class="mr-2" color="#D4AF37" size="15">mdi-lightning-bolt</v-icon>
            Quick Actions
          </div>
          <div class="action-list">
            <div
              v-for="action in quickActions"
              :key="action.key"
              :aria-label="action.title"
              class="action-row"
              :tabindex="0"
              @click="handleNav(action.key)"
              @keydown.enter="handleNav(action.key)"
            >
              <div class="action-icon-wrap">
                <v-icon color="#D4AF37" size="18">{{ action.icon }}</v-icon>
              </div>
              <div class="action-body">
                <div class="action-title">{{ action.title }}</div>
                <div class="action-desc">{{ action.desc }}</div>
              </div>
              <v-icon color="rgba(255,255,255,0.2)" size="14">mdi-chevron-right</v-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Environments Overview ── -->
      <div class="section-label mb-4">
        <v-icon class="mr-2" color="#D4AF37" size="15">mdi-floor-plan</v-icon>
        Environments
        <span class="section-count">{{ environments.length }}</span>
      </div>
      <div v-if="environments.length > 0" class="env-grid mb-8">
        <div v-for="env in environments" :key="env.name" class="env-card">
          <div class="env-card-top">
            <div class="env-icon-wrap">
              <v-icon color="#D4AF37" size="18">{{ env.icon }}</v-icon>
            </div>
            <div class="env-info">
              <div class="env-name">{{ env.name }}</div>
              <div class="env-meta">{{ env.tables }} tables · {{ env.capacity }} seats</div>
            </div>
            <div
              class="env-occ-badge"
              :style="{ color: occupancyColor(env.occupancy), borderColor: occupancyColor(env.occupancy) + '33' }"
            >
              {{ env.occupancy }}%
            </div>
          </div>
          <div class="occupancy-track mt-3">
            <div
              class="occupancy-fill"
              :style="{
                width: env.occupancy + '%',
                background: occupancyColor(env.occupancy),
              }"
            />
          </div>
          <div class="occ-label mt-1">{{ env.bookings }} bookings · {{ env.occupancy }}% today</div>
        </div>
      </div>
      <div v-else class="empty-state mb-8">
        <v-icon color="#3A4151" size="40">mdi-floor-plan</v-icon>
        <div class="empty-state-text">No environments configured yet.</div>
        <button class="empty-state-link" @click="handleNav('builder')">Go to Floor Plan Builder →</button>
      </div>

      <!-- ── Recent Reservations ── -->
      <div class="section-label mb-4">
        <v-icon class="mr-2" color="#D4AF37" size="15">mdi-calendar-clock</v-icon>
        Recent Reservations
      </div>

      <!-- Desktop table -->
      <div class="recent-table-wrap mb-2">
        <div v-if="recentReservations.length > 0">
          <v-table class="spotly-table" density="comfortable">
            <thead>
              <tr>
                <th class="t-th">ID</th>
                <th class="t-th">Guest</th>
                <th class="t-th">Date / Time</th>
                <th class="t-th res-col-guests">Guests</th>
                <th class="t-th">Space</th>
                <th class="t-th">Table</th>
                <th class="t-th">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="res in recentReservations" :key="res.id" class="t-row">
                <td class="t-td id-cell">#{{ res.id }}</td>
                <td class="t-td">
                  <div class="guest-cell">
                    <div class="guest-avatar">{{ res.name.charAt(0).toUpperCase() }}</div>
                    <div>
                      <div class="guest-name">{{ res.name }}</div>
                      <div class="guest-email">{{ res.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="t-td">
                  <span class="res-date">{{ res.date }}</span>
                  <span class="res-time ml-2">{{ res.time }}</span>
                </td>
                <td class="t-td res-col-guests">
                  <v-icon color="#6b7a8d" size="13">mdi-account-group-outline</v-icon>
                  <span class="ml-1" style="color: #9aa3b0; font-size: 0.8rem;">{{ res.guests }}</span>
                </td>
                <td class="t-td">
                  <span class="env-chip">{{ res.envName }}</span>
                </td>
                <td class="t-td">
                  <v-chip
                    :class="res.table && res.table.toLowerCase().includes('vip') ? 'vip-chip' : 'table-chip'"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ res.table || '—' }}
                  </v-chip>
                </td>
                <td class="t-td">
                  <ReservationStatusChip :status="res.status" />
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
        <div v-else class="empty-table-state">
          <v-icon color="#3A4151" size="36">mdi-calendar-blank-outline</v-icon>
          <div class="empty-table-text">No reservations yet</div>
        </div>
        <div class="see-all-row">
          <button class="see-all-btn" @click="handleNav('reservations')">
            View all reservations
            <v-icon class="ml-1" size="13">mdi-arrow-right</v-icon>
          </button>
        </div>
      </div>

    </div>
  </v-main>
</template>

<script setup>
  import { computed } from 'vue'
  import ReservationStatusChip from '@/components/feedback/ReservationStatusChip.vue'
  import AppNavbarSpotly from '@/components/layout/AppNavbarSpotly.vue'
  import StatCard from '@/components/ui/StatCard.vue'
  import { useAdminNav } from '@/composables/useAdminNav'
  import { useAuth } from '@/composables/useAuth'
  import { ENVIRONMENT_LIST } from '@/datamodel/Environment.js'
  import { RESERVATION_LIST } from '@/datamodel/Reservation.js'

  // ─── Nav ──────────────────────────────────────────────────────────────────────
  const { adminNavLinks, handleNav } = useAdminNav()
  const { getSession, logout } = useAuth()
  const session = getSession()
  const sessionName = session?.name || 'Admin'
  const sessionFirstName = session?.name?.split(' ')[0] || 'Admin'

  // ─── Venue-scoped data ────────────────────────────────────────────────────────
  const venueReservations = computed(() =>
    session?.venueId == null
      ? []
      : RESERVATION_LIST.filter(r => r.venueId === session.venueId),
  )
  const venueEnvironments = computed(() =>
    session?.venueId == null
      ? []
      : ENVIRONMENT_LIST.filter(e => e.venueId === session.venueId),
  )

  // ─── Date ─────────────────────────────────────────────────────────────────────
  const todayLabel = computed(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  })

  const greeting = computed(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })

  const today = new Date().toISOString().split('T')[0]

  // ─── KPIs from live data ───────────────────────────────────────────────────────
  const kpis = computed(() => {
    const total = venueReservations.value.length
    const pending = venueReservations.value.filter(r => r.status === 'REQUESTED').length
    const approved = venueReservations.value.filter(r => r.status === 'APPROVED').length
    const totalTables = venueEnvironments.value.reduce(
      (s, e) => s + e.elements.filter(el => el.capacity > 0).length,
      0,
    )
    return [
      { label: 'Total Reservations', value: total, color: '#D4AF37' },
      { label: 'Pending Approvals', value: pending, color: '#C71585' },
      { label: 'Approved', value: approved, color: '#2EBB57' },
      { label: 'Total Tables', value: totalTables, color: '#6B9FD4' },
    ]
  })

  // ─── Today's stats ────────────────────────────────────────────────────────────
  const todayReservations = computed(() =>
    venueReservations.value.filter(r => r.date === today).length,
  )

  const todaySharePct = computed(() => {
    const total = venueReservations.value.length
    if (total === 0) return 0
    return Math.round((todayReservations.value / total) * 100)
  })

  // ─── Secondary KPI tiles ──────────────────────────────────────────────────────
  const secondaryKpis = computed(() => {
    const total = venueReservations.value.length
    const pending = venueReservations.value.filter(r => r.status === 'REQUESTED').length
    const approved = venueReservations.value.filter(r => r.status === 'APPROVED').length
    const checkedIn = venueReservations.value.filter(r => r.status === 'CHECKED_IN').length
    const totalTables = venueEnvironments.value.reduce(
      (s, e) => s + e.elements.filter(el => el.capacity > 0).length,
      0,
    )
    return [
      {
        label: 'Pending Approvals',
        value: pending,
        color: '#C71585',
        iconColor: '#C71585',
        bg: 'rgba(199,21,133,0.1)',
        border: 'rgba(199,21,133,0.25)',
        icon: 'mdi-clock-alert-outline',
      },
      {
        label: 'Confirmed',
        value: approved,
        color: '#2EBB57',
        iconColor: '#2EBB57',
        bg: 'rgba(46,187,87,0.1)',
        border: 'rgba(46,187,87,0.25)',
        icon: 'mdi-calendar-check-outline',
      },
      {
        label: 'Checked In',
        value: checkedIn,
        color: '#6B9FD4',
        iconColor: '#6B9FD4',
        bg: 'rgba(107,159,212,0.1)',
        border: 'rgba(107,159,212,0.25)',
        icon: 'mdi-account-check-outline',
      },
      {
        label: 'Total Reservations',
        value: total,
        color: '#D4AF37',
        iconColor: '#D4AF37',
        bg: 'rgba(212,175,55,0.1)',
        border: 'rgba(212,175,55,0.25)',
        icon: 'mdi-calendar-multiselect-outline',
      },
      {
        label: 'Total Tables',
        value: totalTables,
        color: '#9B8EC4',
        iconColor: '#9B8EC4',
        bg: 'rgba(155,142,196,0.1)',
        border: 'rgba(155,142,196,0.25)',
        icon: 'mdi-table-chair',
      },
      {
        label: 'Spaces',
        value: venueEnvironments.value.length,
        color: '#5DB8C4',
        iconColor: '#5DB8C4',
        bg: 'rgba(93,184,196,0.1)',
        border: 'rgba(93,184,196,0.25)',
        icon: 'mdi-floor-plan',
      },
    ]
  })

  // ─── Status Breakdown ─────────────────────────────────────────────────────────
  const statusBreakdown = computed(() => {
    const total = venueReservations.value.length || 1
    const map = [
      { label: 'Pending', status: 'REQUESTED', color: '#C71585' },
      { label: 'Approved', status: 'APPROVED', color: '#2EBB57' },
      { label: 'Checked In', status: 'CHECKED_IN', color: '#6B9FD4' },
      { label: 'Rejected', status: 'REJECTED', color: '#555e6b' },
      { label: 'Cancelled', status: 'CANCELLED', color: '#3d4652' },
    ]
    return map.map(m => {
      const count = venueReservations.value.filter(r => r.status === m.status).length
      return { label: m.label, color: m.color, count, pct: Math.round((count / total) * 100) }
    })
  })

  // ─── Quick Actions ────────────────────────────────────────────────────────────
  const quickActions = [
    {
      key: 'builder',
      icon: 'mdi-floor-plan',
      title: 'Floor Plan Builder',
      desc: 'Manage environments & configure tables',
    },
    {
      key: 'menu',
      icon: 'mdi-silverware-fork-knife',
      title: 'Menu Manager',
      desc: 'Add items, set prices, manage allergens',
    },
    {
      key: 'reservations',
      icon: 'mdi-calendar-check',
      title: 'Reservation Queue',
      desc: 'Review, approve or reject requests',
    },
    {
      key: 'venue-settings',
      icon: 'mdi-pencil-ruler',
      title: 'Venue Settings',
      desc: 'Update identity, description & images',
    },
  ]

  // ─── Environments from datamodel ──────────────────────────────────────────────
  const environments = computed(() =>
    venueEnvironments.value.map(env => {
      const seatElements = env.elements.filter(el => el.capacity > 0)
      const tableCount = seatElements.length
      const capacity = seatElements.reduce((s, el) => s + el.capacity, 0)
      const allBookings = venueReservations.value.filter(r => r.environmentId === env.id).length
      const activeToday = venueReservations.value.filter(
        r =>
          r.environmentId === env.id
          && r.date === today
          && ['APPROVED', 'CHECKED_IN'].includes(r.status),
      ).length
      const occupancy = tableCount > 0 ? Math.round((activeToday / tableCount) * 100) : 0
      return { name: env.name, icon: env.icon, tables: tableCount, capacity, occupancy, bookings: allBookings }
    }),
  )

  // ─── Top environment by bookings ─────────────────────────────────────────────
  const topEnvironment = computed(() => {
    if (environments.value.length === 0) return null
    return environments.value.toSorted((a, b) => b.bookings - a.bookings)[0]
  })

  function occupancyColor (pct) {
    if (pct >= 70) return '#C71585'
    if (pct >= 40) return '#D4AF37'
    return '#2EBB57'
  }

  // ─── Recent (last 6) ─────────────────────────────────────────────────────────
  const recentReservations = computed(() => {
    return venueReservations.value
      .toSorted((a, b) => b.id - a.id)
      .slice(0, 6)
      .map(r => {
        const env = venueEnvironments.value.find(e => e.id === r.environmentId)
        const el = env?.elements.find(el => el.id === r.elementId)
        return {
          id: r.id,
          name: r.name,
          email: r.email || '',
          date: new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          time: r.time,
          guests: r.guests,
          envName: env?.name || '—',
          table: el?.label || r.elementId || '—',
          status: r.status,
        }
      })
  })
</script>

<style scoped>
/* ─── Container ─── */
.dash-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 48px 80px;
}

/* ─── Page Header ─── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
.page-eyebrow {
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #d4af37;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}
.page-title {
  font-family: var(--font-heading);
  font-size: 2.2rem;
  font-weight: 700;
  color: #f5f0e8;
  margin: 0 0 8px;
  line-height: 1.1;
}
.page-sub {
  font-family: var(--font-body);
  font-size: 0.88rem;
  color: #6b7a8d;
  margin: 0;
  line-height: 1.5;
}
.header-line {
  height: 1px;
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.05) 100%);
}
.header-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  background: rgba(46, 187, 87, 0.1);
  border: 1px solid rgba(46, 187, 87, 0.25);
  border-radius: 20px;
  padding: 6px 14px;
  flex-shrink: 0;
  margin-top: 4px;
}
.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2ebb57;
  animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
.live-label {
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 600;
  color: #2ebb57;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ─── KPI Row ─── */
.kpi-row {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 16px;
}

/* Hero KPI */
.kpi-hero {
  background: linear-gradient(135deg, #161e2b 0%, #1a2232 100%);
  border: 1px solid rgba(212, 175, 55, 0.22);
  border-radius: 16px;
  padding: 28px 28px 24px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.kpi-hero::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%);
  pointer-events: none;
}
.kpi-eyebrow {
  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #d4af37;
  margin-bottom: 12px;
}
.kpi-hero-value {
  font-family: var(--font-heading);
  font-size: 3.5rem;
  font-weight: 700;
  color: #f5f0e8;
  line-height: 1;
  margin-bottom: 4px;
}
.kpi-hero-label {
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: #6b7a8d;
  margin-bottom: 20px;
}
.kpi-hero-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}
.kpi-hero-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4af37, #f0d060);
  border-radius: 2px;
  transition: width 0.6s ease;
}
.kpi-hero-sub {
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: #d4af37;
  opacity: 0.7;
}

/* Secondary KPI grid */
.kpi-secondary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 12px;
}
.kpi-tile {
  background: #13181f;
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: border-color 0.2s, transform 0.15s;
}
.kpi-tile:hover {
  border-color: rgba(212, 175, 55, 0.3);
  transform: translateY(-1px);
}
.kpi-tile-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kpi-tile-value {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 2px;
}
.kpi-tile-label {
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: #6b7a8d;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

/* ─── Insight Row ─── */
.insight-row {
  display: grid;
  grid-template-columns: 1fr 220px 1fr;
  gap: 16px;
}
.insight-card {
  background: #13181f;
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 14px;
  padding: 20px 22px;
}
.insight-card--accent {
  background: linear-gradient(160deg, #161e2b 0%, #13181f 100%);
  border-color: rgba(212, 175, 55, 0.22);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.insight-head {
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6b7a8d;
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}

/* Status list */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 13px;
}
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.status-left {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100px;
  flex-shrink: 0;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-label {
  font-family: var(--font-body);
  font-size: 0.78rem;
  color: #9aa3b0;
  white-space: nowrap;
}
.status-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}
.status-count {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  width: 22px;
  text-align: right;
  flex-shrink: 0;
}
.status-bar-track {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}
.status-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

/* Top environment card */
.top-env-icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px 0 14px;
}
.top-env-name {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 700;
  color: #f5f0e8;
  margin-bottom: 6px;
}
.top-env-stat {
  margin-bottom: 16px;
}
.top-env-num {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  font-weight: 700;
  color: #d4af37;
}
.top-env-sub {
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: #6b7a8d;
}
.top-env-occ {
  width: 100%;
}
.top-env-occ-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
}
.top-env-occ-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}
.top-env-occ-label {
  font-family: var(--font-body);
  font-size: 0.68rem;
  color: #6b7a8d;
}
.insight-empty {
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: #3a4151;
  text-align: center;
  margin: auto 0;
}

/* Action list */
.action-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.action-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s, transform 0.15s;
  outline: none;
}
.action-row:hover,
.action-row:focus-visible {
  border-color: rgba(212, 175, 55, 0.35);
  background: rgba(212, 175, 55, 0.04);
  transform: translateX(3px);
}
.action-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.action-body {
  flex: 1;
  min-width: 0;
}
.action-title {
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 600;
  color: #e8dfc8;
  margin-bottom: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.action-desc {
  font-family: var(--font-body);
  font-size: 0.7rem;
  color: #6b7a8d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ─── Section Label ─── */
.section-label {
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6b7a8d;
  display: flex;
  align-items: center;
  gap: 4px;
}
.section-count {
  background: rgba(212, 175, 55, 0.12);
  color: #d4af37;
  font-family: var(--font-body);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 20px;
  margin-left: 6px;
}

/* ─── Environments Grid ─── */
.env-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}
.env-card {
  background: #13181f;
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  padding: 18px 20px;
  transition: border-color 0.2s, transform 0.15s;
}
.env-card:hover {
  border-color: rgba(212, 175, 55, 0.3);
  transform: translateY(-2px);
}
.env-card-top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.env-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.env-info {
  flex: 1;
  min-width: 0;
}
.env-name {
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 600;
  color: #e8dfc8;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.env-meta {
  font-family: var(--font-body);
  font-size: 0.68rem;
  color: #6b7a8d;
  margin-top: 2px;
}
.env-occ-badge {
  font-family: var(--font-heading);
  font-size: 0.88rem;
  font-weight: 700;
  border: 1px solid;
  border-radius: 8px;
  padding: 3px 8px;
  flex-shrink: 0;
}
.occupancy-track {
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}
.occupancy-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}
.occ-label {
  font-family: var(--font-body);
  font-size: 0.68rem;
  color: #5a6370;
}

/* ─── Empty states ─── */
.empty-state {
  background: #13181f;
  border: 1px dashed rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}
.empty-state-text {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: #6b7a8d;
}
.empty-state-link {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: #d4af37;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.15s;
}
.empty-state-link:hover { opacity: 1; }

/* ─── Recent Reservations Table ─── */
.recent-table-wrap {
  background: #13181f;
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 14px;
  overflow: hidden;
}
.spotly-table {
  background: transparent !important;
}
.t-th {
  font-family: var(--font-body) !important;
  font-size: 0.67rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  color: #6b7a8d !important;
  padding: 12px 18px !important;
  background: rgba(255, 255, 255, 0.02) !important;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1) !important;
}
.t-row {
  transition: background 0.15s;
}
.t-row:hover {
  background: rgba(212, 175, 55, 0.03) !important;
}
.t-td {
  font-family: var(--font-body) !important;
  font-size: 0.82rem !important;
  color: #c0c8d4 !important;
  padding: 12px 18px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
  vertical-align: middle !important;
}
.id-cell {
  color: #6b7a8d !important;
  font-size: 0.72rem !important;
  font-family: var(--font-body) !important;
}
.res-date {
  color: #e8dfc8;
  font-size: 0.82rem;
}
.res-time {
  color: #6b7a8d;
  font-size: 0.72rem;
}
.guest-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.guest-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.2);
  color: #d4af37;
  font-family: var(--font-heading);
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.guest-name {
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: #e8dfc8;
  font-weight: 500;
  line-height: 1.2;
}
.guest-email {
  font-family: var(--font-body);
  font-size: 0.68rem;
  color: #6b7a8d;
}
.env-chip {
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: #9aa3b0;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 5px;
  padding: 2px 8px;
}
.table-chip {
  background: rgba(212, 175, 55, 0.12) !important;
  color: #d4af37 !important;
  font-size: 0.68rem !important;
  font-weight: 600 !important;
}
.vip-chip {
  background: rgba(199, 21, 133, 0.15) !important;
  color: #e060a0 !important;
  font-size: 0.68rem !important;
  font-weight: 600 !important;
}
.empty-table-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px 24px;
  text-align: center;
}
.empty-table-text {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: #6b7a8d;
}
.see-all-row {
  padding: 14px 20px;
  text-align: right;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}
.see-all-btn {
  font-family: var(--font-body);
  font-size: 0.78rem;
  color: #d4af37;
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  letter-spacing: 0.04em;
  opacity: 0.85;
  transition: opacity 0.15s;
  padding: 4px 0;
}
.see-all-btn:hover { opacity: 1; }

/* ─── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 1200px) {
  .insight-row {
    grid-template-columns: 1fr 1fr;
  }
  .insight-card--accent {
    grid-row: 1;
    grid-column: span 2;
    flex-direction: row;
    text-align: left;
    align-items: center;
    gap: 20px;
    padding: 18px 24px;
  }
  .top-env-icon-wrap {
    margin: 0;
    flex-shrink: 0;
  }
  .top-env-occ {
    min-width: 140px;
  }
}

@media (max-width: 1024px) {
  .dash-container {
    padding: 32px 24px 60px;
  }
  .kpi-row {
    grid-template-columns: 1fr;
  }
  .kpi-hero {
    padding: 22px 24px 20px;
  }
  .kpi-secondary {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto;
  }
  .page-title {
    font-size: 1.9rem;
  }
  .res-col-guests {
    display: none;
  }
}

@media (max-width: 768px) {
  .insight-row {
    grid-template-columns: 1fr;
  }
  .insight-card--accent {
    grid-column: span 1;
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
  .top-env-icon-wrap {
    margin: 4px 0 14px;
  }
  .kpi-secondary {
    grid-template-columns: repeat(2, 1fr);
  }
  .env-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .dash-container {
    padding: 24px 16px 60px;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .page-title {
    font-size: 1.6rem;
  }
  .kpi-secondary {
    grid-template-columns: 1fr 1fr;
  }
  .kpi-tile {
    padding: 12px 14px;
  }
  .env-grid {
    grid-template-columns: 1fr;
  }
  /* Hide env-occ-badge on tiny screens */
  .env-occ-badge {
    display: none;
  }
}
</style>
