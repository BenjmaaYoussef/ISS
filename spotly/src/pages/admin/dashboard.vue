<template>
  <!-- ── Top Navigation Bar ── -->
  <AppNavbarSpotly
    active-link="dashboard"
    :nav-links="adminNavLinks"
    @nav="handleNav"
  />

  <!-- ── Main Content ── -->
  <v-main class="spotly-main">
    <div class="spotly-container">
      <!-- ── Welcome Banner ── -->
      <div class="welcome-banner mb-8">
        <div class="welcome-glow" />
        <div class="welcome-content">
          <div class="welcome-eyebrow">
            <v-icon class="mr-1" color="#D4AF37" size="14">mdi-shield-crown</v-icon>
            Admin Panel
          </div>
          <h1 class="welcome-title">{{ greeting }}, {{ sessionFirstName }}</h1>
          <p class="welcome-sub">
            {{ todayLabel }} · Here's your venue at a glance.
          </p>
        </div>
        <div class="welcome-logo-area">
          <svg
            fill="none"
            height="64"
            opacity="0.15"
            viewBox="0 0 40 40"
            width="64"
          >
            <circle
              cx="20"
              cy="20"
              r="18"
              stroke="#D4AF37"
              stroke-width="1.5"
            />
            <path
              d="M12 28 C12 20 16 14 20 12 C24 14 28 20 28 28"
              fill="none"
              stroke="#D4AF37"
              stroke-width="1.5"
            />
            <path
              d="M8 20 C12 16 16 14 20 14 C24 14 28 16 32 20"
              fill="none"
              stroke="#D4AF37"
              stroke-width="1.5"
            />
            <circle
              cx="20"
              cy="20"
              fill="none"
              r="3"
              stroke="#D4AF37"
              stroke-width="1.5"
            />
          </svg>
        </div>
      </div>

      <!-- ── KPI Row ── -->
      <div class="kpi-row mb-8">
        <StatCard
          v-for="kpi in kpis"
          :key="kpi.label"
          :color="kpi.color"
          :label="kpi.label"
          :value="kpi.value"
        />
      </div>

      <!-- ── Two-column layout ── -->
      <div class="dash-grid mb-8">
        <!-- LEFT: Quick Actions -->
        <div>
          <div class="section-label mb-4">
            <v-icon class="mr-2" color="#D4AF37" size="15">mdi-lightning-bolt</v-icon>
            Quick Actions
          </div>
          <div class="action-cards">
            <div
              v-for="action in quickActions"
              :key="action.key"
              class="action-card"
              @click="handleNav(action.key)"
            >
              <div class="action-icon-wrap">
                <v-icon :color="action.color" size="22">{{
                  action.icon
                }}</v-icon>
              </div>
              <div class="action-body">
                <div class="action-title">{{ action.title }}</div>
                <div class="action-desc">{{ action.desc }}</div>
              </div>
              <v-icon class="action-arrow" color="#3A4151" size="16">mdi-chevron-right</v-icon>
            </div>
          </div>
        </div>

        <!-- RIGHT: Status Breakdown -->
        <div>
          <div class="section-label mb-4">
            <v-icon class="mr-2" color="#D4AF37" size="15">mdi-chart-donut</v-icon>
            Reservation Status
          </div>
          <div class="status-card">
            <div
              v-for="item in statusBreakdown"
              :key="item.label"
              class="status-row"
            >
              <div class="status-left">
                <span
                  class="status-dot"
                  :style="{ background: item.color }"
                />
                <span class="status-label">{{ item.label }}</span>
              </div>
              <div class="status-right">
                <span class="status-count" :style="{ color: item.color }">{{
                  item.count
                }}</span>
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
      </div>

      <!-- ── Environments Overview ── -->
      <div class="section-label mb-4">
        <v-icon class="mr-2" color="#D4AF37" size="15">mdi-floor-plan</v-icon>
        Environments Overview
      </div>
      <div class="env-grid mb-8">
        <div v-for="env in environments" :key="env.name" class="env-card">
          <div class="env-card-top">
            <div class="env-icon-wrap">
              <v-icon color="#D4AF37" size="18">{{ env.icon }}</v-icon>
            </div>
            <div class="env-info">
              <div class="env-name">{{ env.name }}</div>
              <div class="env-meta">
                {{ env.tables }} tables · {{ env.capacity }} seats
              </div>
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
          <div class="occ-label mt-1">{{ env.occupancy }}% occupied</div>
        </div>
      </div>

      <!-- ── Recent Reservations ── -->
      <div class="section-label mb-4">
        <v-icon class="mr-2" color="#D4AF37" size="15">mdi-calendar-clock</v-icon>
        Recent Reservations
      </div>
      <div class="recent-table-wrap">
        <v-table class="spotly-table" density="comfortable">
          <thead>
            <tr>
              <th class="t-th">ID</th>
              <th class="t-th">Guest</th>
              <th class="t-th">Date / Time</th>
              <th class="t-th">Table</th>
              <th class="t-th">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="res in recentReservations" :key="res.id" class="t-row">
              <td class="t-td id-cell">#{{ res.id }}</td>
              <td class="t-td">{{ res.name }}</td>
              <td class="t-td">
                <span class="res-date">{{ res.date }}</span>
                <span class="res-time ml-2">{{ res.time }}</span>
              </td>
              <td class="t-td">
                <v-chip
                  :class="
                    res.table.startsWith('VIP') ? 'vip-chip' : 'table-chip'
                  "
                  size="x-small"
                  variant="tonal"
                >
                  {{ res.table }}
                </v-chip>
              </td>
              <td class="t-td">
                <ReservationStatusChip :status="res.status" />
              </td>
            </tr>
          </tbody>
        </v-table>
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

  // ─── Status Breakdown ─────────────────────────────────────────────────────────
  const statusBreakdown = computed(() => {
    const total = venueReservations.value.length || 1
    const map = [
      { label: 'Pending', status: 'REQUESTED', color: '#C71585' },
      { label: 'Approved', status: 'APPROVED', color: '#2EBB57' },
      { label: 'Rejected', status: 'REJECTED', color: '#666666' },
      { label: 'Cancelled', status: 'CANCELLED', color: '#444444' },
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
      color: '#D4AF37',
      title: 'Floor Plan Builder',
      desc: 'Manage environments, place & configure tables',
    },
    {
      key: 'menu',
      icon: 'mdi-silverware-fork-knife',
      color: '#D4AF37',
      title: 'Menu Manager',
      desc: 'Add items, set prices, manage allergens & tags',
    },
    {
      key: 'reservations',
      icon: 'mdi-calendar-check',
      color: '#D4AF37',
      title: 'Reservation Queue',
      desc: 'Review, approve or reject pending requests',
    },
  ]

  // ─── Environments from datamodel ──────────────────────────────────────────────
  const environments = computed(() =>
    venueEnvironments.value.map(env => {
      const seatElements = env.elements.filter(el => el.capacity > 0)
      const tableCount = seatElements.length
      const capacity = seatElements.reduce((s, el) => s + el.capacity, 0)
      const activeToday = venueReservations.value.filter(
        r =>
          r.environmentId === env.id
          && r.date === today
          && ['APPROVED', 'CHECKED_IN'].includes(r.status),
      ).length
      const occupancy = tableCount > 0 ? Math.round((activeToday / tableCount) * 100) : 0
      return { name: env.name, icon: env.icon, tables: tableCount, capacity, occupancy }
    }),
  )

  function occupancyColor (pct) {
    if (pct >= 70) return '#C71585'
    if (pct >= 40) return '#D4AF37'
    return '#2EBB57'
  }

  // ─── Recent (last 5) ─────────────────────────────────────────────────────────
  const recentReservations = computed(() => {
    return [...venueReservations.value]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5)
      .map(r => {
        const env = venueEnvironments.value.find(e => e.id === r.environmentId)
        const el = env?.elements.find(el => el.id === r.elementId)
        return {
          id: r.id,
          name: r.name,
          date: new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          time: r.time,
          table: el?.label || r.elementId || '—',
          status: r.status,
        }
      })
  })
</script>

<style scoped>
.spotly-main {
  background: #0a0e14;
  min-height: 100vh;
}

/* ─── Container ─── */
.dash-container {
  max-width: 1280px;
  margin: 0 auto;
}

/* ─── Welcome Banner ─── */
.welcome-banner {
  position: relative;
  background: linear-gradient(135deg, #13181f 0%, #1a222d 100%);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 16px;
  padding: 32px 36px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.welcome-glow {
  position: absolute;
  top: -60px;
  left: -60px;
  width: 240px;
  height: 240px;
  background: radial-gradient(
    circle,
    rgba(212, 175, 55, 0.07) 0%,
    transparent 70%
  );
  pointer-events: none;
}
.welcome-eyebrow {
  font-family: var(--font-body);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #d4af37;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}
.welcome-title {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: #f0ead6;
  margin: 0 0 6px;
  line-height: 1.1;
}
.welcome-sub {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: #6b7a8d;
  margin: 0;
}

/* ─── KPI Row ─── */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

/* ─── Section Label ─── */
.section-label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6b7a8d;
  display: flex;
  align-items: center;
}

/* ─── Two-col grid ─── */
.dash-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* ─── Quick Actions ─── */
.action-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #13181f;
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    transform 0.15s,
    background 0.2s;
}
.action-card:hover {
  border-color: rgba(212, 175, 55, 0.45);
  background: #1a2232;
  transform: translateX(3px);
}
.action-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.action-body {
  flex: 1;
}
.action-title {
  font-family: var(--font-body);
  font-size: 0.88rem;
  font-weight: 600;
  color: #e8dfc8;
  margin-bottom: 2px;
}
.action-desc {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: #6b7a8d;
}

/* ─── Status Breakdown ─── */
.status-card {
  background: #13181f;
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  gap: 10px;
  width: 110px;
  flex-shrink: 0;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-label {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: #9aa3b0;
}
.status-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}
.status-count {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
  width: 24px;
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
  transition: width 0.4s ease;
}

/* ─── Environments Grid ─── */
.env-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.env-card {
  background: #13181f;
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  padding: 18px 20px;
  transition: border-color 0.2s;
}
.env-card:hover {
  border-color: rgba(212, 175, 55, 0.35);
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
.env-name {
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 600;
  color: #e8dfc8;
  line-height: 1.2;
}
.env-meta {
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: #6b7a8d;
  margin-top: 2px;
}
.occupancy-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}
.occupancy-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}
.occ-label {
  font-family: var(--font-body);
  font-size: 0.7rem;
  color: #5a6370;
}

/* ─── Recent Reservations Table ─── */
.recent-table-wrap {
  background: #13181f;
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  overflow: hidden;
}
.spotly-table {
  background: transparent !important;
}
.t-th {
  font-family: var(--font-body) !important;
  font-size: 0.68rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  color: #6b7a8d !important;
  padding: 12px 20px !important;
  background: rgba(255, 255, 255, 0.02) !important;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1) !important;
}
.t-row {
  transition: background 0.15s;
}
.t-row:hover {
  background: rgba(212, 175, 55, 0.04) !important;
}
.t-td {
  font-family: var(--font-body) !important;
  font-size: 0.82rem !important;
  color: #c0c8d4 !important;
  padding: 12px 20px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
}
.id-cell {
  color: #6b7a8d !important;
  font-size: 0.75rem !important;
}
.res-date {
  color: #e8dfc8;
  font-size: 0.82rem;
}
.res-time {
  color: #6b7a8d;
  font-size: 0.75rem;
}

/* Table & VIP chips */
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
.see-all-btn:hover {
  opacity: 1;
}
</style>
