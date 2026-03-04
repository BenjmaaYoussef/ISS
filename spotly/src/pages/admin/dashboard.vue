<template>
  <!-- ── Top Navigation Bar ── -->
  <AppNavbarApp
    :nav-links="adminNavLinks"
    active-link="dashboard"
    admin-label="Admin"
    @nav="handleNav"
  />

  <!-- ── Main Content ── -->
  <v-main class="spotly-main">
    <div class="dash-container pa-8">

      <!-- ── Welcome Banner ── -->
      <div class="welcome-banner mb-8">
        <div class="welcome-glow" />
        <div class="welcome-content">
          <div class="welcome-eyebrow">
            <v-icon size="14" class="mr-1" color="#D4AF37">mdi-shield-crown</v-icon>
            Admin Panel
          </div>
          <h1 class="welcome-title">Good evening, Admin</h1>
          <p class="welcome-sub">{{ todayLabel }} · Here's your venue at a glance.</p>
        </div>
        <div class="welcome-logo-area">
          <svg width="64" height="64" viewBox="0 0 40 40" fill="none" opacity="0.15">
            <circle cx="20" cy="20" r="18" stroke="#D4AF37" stroke-width="1.5"/>
            <path d="M12 28 C12 20 16 14 20 12 C24 14 28 20 28 28" stroke="#D4AF37" stroke-width="1.5" fill="none"/>
            <path d="M8 20 C12 16 16 14 20 14 C24 14 28 16 32 20" stroke="#D4AF37" stroke-width="1.5" fill="none"/>
            <circle cx="20" cy="20" r="3" stroke="#D4AF37" stroke-width="1.5" fill="none"/>
          </svg>
        </div>
      </div>

      <!-- ── KPI Row ── -->
      <div class="kpi-row mb-8">
        <StatCard
          v-for="kpi in kpis"
          :key="kpi.label"
          :value="kpi.value"
          :label="kpi.label"
          :color="kpi.color"
        />
      </div>

      <!-- ── Two-column layout ── -->
      <div class="dash-grid mb-8">

        <!-- LEFT: Quick Actions -->
        <div>
          <div class="section-label mb-4">
            <v-icon size="15" class="mr-2" color="#D4AF37">mdi-lightning-bolt</v-icon>
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
                <v-icon size="22" :color="action.color">{{ action.icon }}</v-icon>
              </div>
              <div class="action-body">
                <div class="action-title">{{ action.title }}</div>
                <div class="action-desc">{{ action.desc }}</div>
              </div>
              <v-icon size="16" color="#3A4151" class="action-arrow">mdi-chevron-right</v-icon>
            </div>
          </div>
        </div>

        <!-- RIGHT: Status Breakdown -->
        <div>
          <div class="section-label mb-4">
            <v-icon size="15" class="mr-2" color="#D4AF37">mdi-chart-donut</v-icon>
            Reservation Status
          </div>
          <div class="status-card">
            <div
              v-for="item in statusBreakdown"
              :key="item.label"
              class="status-row"
            >
              <div class="status-left">
                <span class="status-dot" :style="{ background: item.color }"></span>
                <span class="status-label">{{ item.label }}</span>
              </div>
              <div class="status-right">
                <span class="status-count" :style="{ color: item.color }">{{ item.count }}</span>
                <div class="status-bar-track">
                  <div
                    class="status-bar-fill"
                    :style="{ width: item.pct + '%', background: item.color }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Environments Overview ── -->
      <div class="section-label mb-4">
        <v-icon size="15" class="mr-2" color="#D4AF37">mdi-floor-plan</v-icon>
        Environments Overview
      </div>
      <div class="env-grid mb-8">
        <div
          v-for="env in environments"
          :key="env.name"
          class="env-card"
        >
          <div class="env-card-top">
            <div class="env-icon-wrap">
              <v-icon size="18" color="#D4AF37">{{ env.icon }}</v-icon>
            </div>
            <div class="env-info">
              <div class="env-name">{{ env.name }}</div>
              <div class="env-meta">{{ env.tables }} tables · {{ env.capacity }} seats</div>
            </div>
          </div>
          <div class="occupancy-track mt-3">
            <div class="occupancy-fill" :style="{ width: env.occupancy + '%', background: occupancyColor(env.occupancy) }"></div>
          </div>
          <div class="occ-label mt-1">{{ env.occupancy }}% occupied</div>
        </div>
      </div>

      <!-- ── Recent Reservations ── -->
      <div class="section-label mb-4">
        <v-icon size="15" class="mr-2" color="#D4AF37">mdi-calendar-clock</v-icon>
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
                <v-chip size="x-small" :class="res.table.startsWith('VIP') ? 'vip-chip' : 'table-chip'" variant="tonal">
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
            <v-icon size="13" class="ml-1">mdi-arrow-right</v-icon>
          </button>
        </div>
      </div>

    </div>
  </v-main>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbarApp from '@/components/layout/AppNavbarApp.vue'
import StatCard from '@/components/ui/StatCard.vue'
import ReservationStatusChip from '@/components/feedback/ReservationStatusChip.vue'

const router = useRouter()

// ─── Nav ──────────────────────────────────────────────────────────────────────
const adminNavLinks = [
  { key: 'dashboard',    label: 'Dashboard' },
  { key: 'builder',      label: 'Builder' },
  { key: 'menu',         label: 'Menu' },
  { key: 'reservations', label: 'Reservations' },
]

const handleNav = (key) => {
  const routes = {
    dashboard:    '/admin/dashboard',
    builder:      '/admin/floor-plan',
    menu:         '/admin/menu',
    reservations: '/admin/reservations',
  }
  if (routes[key]) router.push(routes[key])
}

// ─── Date ─────────────────────────────────────────────────────────────────────
const todayLabel = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
})

// ─── Mock Data ────────────────────────────────────────────────────────────────
const reservations = [
  { id: 102, name: 'John Doe',      date: 'Feb 15', time: '19:00', size: 5, table: 'VIP-01', status: 'Pending'  },
  { id: 105, name: 'Sarah Smith',   date: 'Feb 16', time: '20:00', size: 4, table: 'T-12',   status: 'Pending'  },
  { id: 108, name: 'Marcus Lee',    date: 'Feb 17', time: '18:30', size: 2, table: 'T-05',   status: 'Approved' },
  { id: 111, name: 'Layla Hassan',  date: 'Feb 17', time: '21:00', size: 6, table: 'VIP-02', status: 'Pending'  },
  { id: 114, name: 'Tom Rivera',    date: 'Feb 18', time: '19:30', size: 3, table: 'T-08',   status: 'Rejected' },
  { id: 117, name: 'Nina Farouk',   date: 'Feb 18', time: '20:30', size: 2, table: 'T-03',   status: 'Approved' },
]

// ─── KPIs ─────────────────────────────────────────────────────────────────────
const kpis = computed(() => {
  const total     = reservations.length
  const pending   = reservations.filter(r => r.status === 'Pending').length
  const approved  = reservations.filter(r => r.status === 'Approved').length
  const totalTables = environments.reduce((s, e) => s + e.tables, 0)
  return [
    { label: "Today's Reservations", value: total,       color: '#D4AF37' },
    { label: 'Pending Approvals',    value: pending,     color: '#C71585' },
    { label: 'Approved',             value: approved,    color: '#2EBB57' },
    { label: 'Total Tables',         value: totalTables, color: '#6B9FD4' },
  ]
})

// ─── Status Breakdown ─────────────────────────────────────────────────────────
const statusBreakdown = computed(() => {
  const total = reservations.length || 1
  const map = [
    { label: 'Pending',   color: '#C71585' },
    { label: 'Approved',  color: '#2EBB57' },
    { label: 'Rejected',  color: '#666666' },
    { label: 'Cancelled', color: '#444444' },
  ]
  return map.map(m => {
    const count = reservations.filter(r => r.status === m.label).length
    return { ...m, count, pct: Math.round((count / total) * 100) }
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

// ─── Environments ─────────────────────────────────────────────────────────────
const environments = [
  { name: 'Indoor Dining',  icon: 'mdi-silverware',         tables: 12, capacity: 56, occupancy: 75 },
  { name: 'Rooftop Terrace',icon: 'mdi-weather-sunny',      tables: 8,  capacity: 32, occupancy: 50 },
  { name: 'Beach Club',     icon: 'mdi-beach',              tables: 6,  capacity: 24, occupancy: 33 },
  { name: 'Private Lounge', icon: 'mdi-sofa-single-outline', tables: 4,  capacity: 20, occupancy: 25 },
]

const occupancyColor = (pct) => {
  if (pct >= 70) return '#C71585'
  if (pct >= 40) return '#D4AF37'
  return '#2EBB57'
}

// ─── Recent (last 5) ─────────────────────────────────────────────────────────
const recentReservations = reservations.slice(0, 5)
</script>

<style scoped>
.spotly-main {
  background: #0A0E14;
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
  background: linear-gradient(135deg, #13181F 0%, #1A222D 100%);
  border: 1px solid rgba(212, 175, 55, 0.2);
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
  background: radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%);
  pointer-events: none;
}
.welcome-eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #D4AF37;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}
.welcome-title {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #F0EAD6;
  margin: 0 0 6px;
  line-height: 1.1;
}
.welcome-sub {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #6B7A8D;
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
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6B7A8D;
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
  background: #13181F;
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s, background 0.2s;
}
.action-card:hover {
  border-color: rgba(212, 175, 55, 0.45);
  background: #1A2232;
  transform: translateX(3px);
}
.action-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.action-body {
  flex: 1;
}
.action-title {
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  color: #E8DFC8;
  margin-bottom: 2px;
}
.action-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #6B7A8D;
}

/* ─── Status Breakdown ─── */
.status-card {
  background: #13181F;
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
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: #9AA3B0;
}
.status-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}
.status-count {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  font-weight: 700;
  width: 24px;
  text-align: right;
  flex-shrink: 0;
}
.status-bar-track {
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,0.06);
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
  background: #13181F;
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
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: #E8DFC8;
  line-height: 1.2;
}
.env-meta {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  color: #6B7A8D;
  margin-top: 2px;
}
.occupancy-track {
  height: 4px;
  background: rgba(255,255,255,0.06);
  border-radius: 2px;
  overflow: hidden;
}
.occupancy-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}
.occ-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  color: #5A6370;
}

/* ─── Recent Reservations Table ─── */
.recent-table-wrap {
  background: #13181F;
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  overflow: hidden;
}
.spotly-table {
  background: transparent !important;
}
.t-th {
  font-family: 'Inter', sans-serif !important;
  font-size: 0.68rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  color: #6B7A8D !important;
  padding: 12px 20px !important;
  background: rgba(255,255,255,0.02) !important;
  border-bottom: 1px solid rgba(212,175,55,0.1) !important;
}
.t-row {
  transition: background 0.15s;
}
.t-row:hover {
  background: rgba(212, 175, 55, 0.04) !important;
}
.t-td {
  font-family: 'Inter', sans-serif !important;
  font-size: 0.82rem !important;
  color: #C0C8D4 !important;
  padding: 12px 20px !important;
  border-bottom: 1px solid rgba(255,255,255,0.04) !important;
}
.id-cell {
  color: #6B7A8D !important;
  font-size: 0.75rem !important;
}
.res-date {
  color: #E8DFC8;
  font-size: 0.82rem;
}
.res-time {
  color: #6B7A8D;
  font-size: 0.75rem;
}

/* Table & VIP chips */
.table-chip {
  background: rgba(212,175,55,0.12) !important;
  color: #D4AF37 !important;
  font-size: 0.68rem !important;
  font-weight: 600 !important;
}
.vip-chip {
  background: rgba(199,21,133,0.15) !important;
  color: #E060A0 !important;
  font-size: 0.68rem !important;
  font-weight: 600 !important;
}

.see-all-row {
  padding: 14px 20px;
  text-align: right;
  border-top: 1px solid rgba(255,255,255,0.04);
}
.see-all-btn {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  color: #D4AF37;
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
