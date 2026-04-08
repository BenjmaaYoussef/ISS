<template>
  <AppNavbarSpotly
    :nav-links="adminNavLinks"
    active-link="qr-codes"
    @nav="handleNav"
  />

  <v-main class="spotly-main">
    <div class="qr-wrap pa-4 pa-sm-6">

      <!-- ── Page header ── -->
      <div class="page-header d-flex flex-wrap align-center ga-3 mb-6">
        <div class="header-text">
          <h1 class="page-title">Table QR Codes</h1>
          <p class="page-sub">Generate and print QR cards for every table in your venue</p>
        </div>
        <div class="flex-grow-1" />
        <v-btn
          v-if="selectedIds.length > 0"
          class="print-btn"
          variant="outlined"
          @click="printSelected"
        >
          <v-icon start size="16">mdi-printer-outline</v-icon>
          Print Selected ({{ selectedIds.length }})
        </v-btn>
        <v-btn
          class="print-btn print-btn--primary"
          @click="printAll"
          :disabled="allTableElements.length === 0"
        >
          <v-icon start size="16">mdi-printer</v-icon>
          Print All
        </v-btn>
      </div>

      <!-- ── Empty state ── -->
      <div v-if="allTableElements.length === 0" class="empty-state">
        <div class="empty-glow" />
        <v-icon size="64" color="rgba(212,175,55,0.2)">mdi-qrcode</v-icon>
        <p class="empty-title">No table elements found</p>
        <p class="empty-sub">Add tables to your floor plan environments first, then return here to generate QR codes.</p>
        <v-btn variant="outlined" color="#D4AF37" rounded="xl" to="/admin/floor-plan">
          <v-icon start size="16">mdi-floor-plan</v-icon>
          Open Floor Plan Builder
        </v-btn>
      </div>

      <!-- ── Environments ── -->
      <div v-else>

        <!-- Selection bar -->
        <div class="selection-bar mb-5 d-flex align-center ga-3 flex-wrap">
          <span class="sel-count">{{ selectedIds.length }} of {{ allTableElements.length }} selected</span>
          <button class="sel-btn" @click="selectAll">Select All</button>
          <button class="sel-btn" @click="clearAll" v-if="selectedIds.length > 0">Clear</button>
        </div>

        <!-- Per-environment section -->
        <div v-for="env in envSections" :key="env.id" class="env-section mb-8">
          <div class="env-section-header d-flex align-center ga-2 mb-4">
            <v-icon size="16" :style="{ color: '#D4AF37' }">{{ env.icon || 'mdi-floor-plan' }}</v-icon>
            <span class="env-section-name">{{ env.name }}</span>
            <span class="env-section-count">{{ env.tables.length }} table{{ env.tables.length !== 1 ? 's' : '' }}</span>
          </div>

          <div class="cards-grid">
            <div
              v-for="table in env.tables"
              :key="table.elementId"
              class="qr-card-wrapper"
              :class="{ 'qr-card-wrapper--selected': selectedIds.includes(table.elementId) }"
              @click="toggleSelect(table.elementId)"
            >
              <!-- Selection checkbox overlay -->
              <div class="card-checkbox">
                <v-icon size="16" :color="selectedIds.includes(table.elementId) ? '#D4AF37' : 'rgba(255,255,255,0.2)'">
                  {{ selectedIds.includes(table.elementId) ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline' }}
                </v-icon>
              </div>

              <!-- The printable card -->
              <div class="qr-card" :data-element-id="table.elementId">
                <div class="qr-card-venue">{{ venueName }}</div>
                <div class="qr-card-table">{{ table.label }}</div>
                <div class="qr-card-env">{{ env.name }}</div>
                <div class="qr-code-area">
                  <div v-if="table.svgLoading" class="qr-placeholder">
                    <v-progress-circular size="24" width="2" color="#D4AF37" indeterminate />
                  </div>
                  <div v-else-if="table.svg" class="qr-svg-wrap" v-html="table.svg" />
                  <div v-else class="qr-placeholder">
                    <v-icon size="32" color="rgba(212,175,55,0.3)">mdi-qrcode</v-icon>
                  </div>
                </div>
                <div class="qr-card-tagline">Scan to view menu</div>
                <div class="qr-card-brand">Spotly</div>
                <a
                  :href="`/menu/${table.elementId}`"
                  target="_blank"
                  class="qr-dev-link"
                  @click.stop
                >dev: open menu</a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </v-main>

  <SpotlySnackbar :snackbar="snackbar" />
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import QRCode from 'qrcode'
import { useAuth } from '@/composables/useAuth'
import { useAdminNav, adminNavLinks } from '@/composables/useAdminNav'
import { getVenueByAdminEmail } from '@/datamodel/Venue.js'
import { getEnvironmentsByVenue } from '@/datamodel/Environment.js'
import { useSnackbar } from '@/composables/useSnackbar'
import AppNavbarSpotly from '@/components/layout/AppNavbarSpotly.vue'

const { getSession } = useAuth()
const { handleNav } = useAdminNav()
const { snackbar, notify } = useSnackbar()
const session = getSession()

// ── Resolve admin's venue ─────────────────────────────────────────────────────
const venue = session?.email ? getVenueByAdminEmail(session.email) : null
const venueName = venue?.name || 'Venue'
const venueId = venue?.id ?? null

// ── Build table elements list ─────────────────────────────────────────────────
const envs = computed(() =>
  venueId != null ? getEnvironmentsByVenue(venueId) : []
)

// Flat list of all seat-type elements across all environments
const allTableElements = computed(() => {
  const out = []
  for (const env of envs.value) {
    for (const el of env.elements) {
      if (el.type?.startsWith('table_')) {
        out.push({ ...el, envName: env.name, envId: env.id })
      }
    }
  }
  return out
})

// ── QR SVG generation ─────────────────────────────────────────────────────────
const svgCache = ref({}) // elementId -> svg string

async function generateSvg(elementId) {
  const url = `${window.location.origin}/menu/${elementId}`
  try {
    return await QRCode.toString(url, {
      type: 'svg',
      margin: 1,
      color: { dark: '#0a0e14', light: '#ffffff' },
      width: 160,
    })
  } catch {
    return null
  }
}

onMounted(async () => {
  // Generate QR codes for all table elements
  for (const el of allTableElements.value) {
    const svg = await generateSvg(el.id)
    if (svg) svgCache.value[el.id] = svg
  }
})

// Re-generate if environments change
watch(allTableElements, async (newEls) => {
  for (const el of newEls) {
    if (!svgCache.value[el.id]) {
      const svg = await generateSvg(el.id)
      if (svg) svgCache.value[el.id] = svg
    }
  }
})

// ── Section view model ────────────────────────────────────────────────────────
const envSections = computed(() =>
  envs.value
    .map(env => ({
      id: env.id,
      name: env.name,
      icon: env.icon,
      tables: env.elements
        .filter(el => el.type?.startsWith('table_'))
        .map(el => ({
          elementId: el.id,
          label: el.label || el.id,
          svg: svgCache.value[el.id] || null,
          svgLoading: !svgCache.value[el.id],
          envName: env.name,
        })),
    }))
    .filter(s => s.tables.length > 0)
)

// ── Selection ─────────────────────────────────────────────────────────────────
const selectedIds = ref([])

const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const selectAll = () => {
  selectedIds.value = allTableElements.value.map(el => el.id)
}

const clearAll = () => {
  selectedIds.value = []
}

// ── Print ─────────────────────────────────────────────────────────────────────
async function buildCards(ids) {
  const out = []
  for (const el of allTableElements.value) {
    if (!ids.includes(el.id)) continue
    let svg = svgCache.value[el.id]
    if (!svg) svg = await generateSvg(el.id)
    out.push({ ...el, label: el.label || el.id, svg })
  }
  return out
}

function openPrintWindow(cards) {
  const cardsHtml = cards.map(c => `
    <div class="card">
      <div class="venue">${escapeHtml(venueName)}</div>
      <div class="table">${escapeHtml(c.label)}</div>
      <div class="env">${escapeHtml(c.envName)}</div>
      <div class="qr">${c.svg || ''}</div>
      <div class="tagline">Scan to view menu</div>
      <div class="brand">Spotly</div>
    </div>
  `).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Table QR Codes — ${escapeHtml(venueName)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    background: #fff;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    padding: 8mm;
  }
  .card {
    width: 90mm;
    min-height: 120mm;
    border: 1px solid #ddd;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 14px 12px;
    text-align: center;
    page-break-inside: avoid;
    break-inside: avoid;
    margin: 4mm;
  }
  .venue {
    font-size: 7pt;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #999;
  }
  .table {
    font-size: 22pt;
    font-weight: 800;
    color: #111;
    line-height: 1.1;
    margin: 2px 0;
  }
  .env {
    font-size: 8.5pt;
    color: #666;
    margin-bottom: 6px;
  }
  .qr svg {
    width: 150px !important;
    height: 150px !important;
    display: block;
  }
  .tagline {
    font-size: 8pt;
    color: #888;
    margin-top: 8px;
    letter-spacing: 0.04em;
  }
  .brand {
    font-size: 9pt;
    font-weight: 700;
    color: #b8922a;
    letter-spacing: 0.1em;
    margin-top: 2px;
  }
  @media print {
    body { padding: 4mm; }
    .card { margin: 3mm; }
  }
</style>
</head>
<body>${cardsHtml}</body>
</html>`

  const popup = window.open('', '_blank', 'width=900,height=700,scrollbars=yes')
  if (!popup) {
    notify('Pop-up blocked — please allow pop-ups for this site', '#C71585', 'mdi-alert')
    return
  }
  popup.document.write(html)
  popup.document.close()
  popup.onload = () => {
    popup.focus()
    popup.print()
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function printAll() {
  const cards = await buildCards(allTableElements.value.map(e => e.id))
  openPrintWindow(cards)
}

async function printSelected() {
  if (selectedIds.value.length === 0) {
    notify('No cards selected', '#6b7a8d', 'mdi-alert-circle-outline')
    return
  }
  const cards = await buildCards(selectedIds.value)
  openPrintWindow(cards)
}
</script>

<style scoped>
/* ── Layout ── */
.spotly-main {
  background: #0a0e14 !important;
  min-height: 100vh;
}
.qr-wrap {
  max-width: 1200px;
  margin: 0 auto;
}

/* ── Header ── */
.page-title {
  font-family: var(--font-heading);
  font-size: 1.7rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px;
}
.page-sub {
  font-size: 0.83rem;
  color: rgba(255,255,255,0.45);
  margin: 0;
}
.print-btn {
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.03em !important;
  border-color: rgba(255,255,255,0.15) !important;
  color: rgba(255,255,255,0.7) !important;
  border-radius: 10px !important;
}
.print-btn--primary {
  background: #D4AF37 !important;
  border-color: #D4AF37 !important;
  color: #0a0e14 !important;
}

/* ── Empty state ── */
.empty-state {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 14px;
  text-align: center;
  overflow: hidden;
}
.empty-glow {
  position: absolute;
  width: 360px;
  height: 360px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%);
  pointer-events: none;
}
.empty-title {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  color: #fff;
  margin: 0;
}
.empty-sub {
  font-size: 0.83rem;
  color: rgba(255,255,255,0.4);
  margin: 0 0 8px;
  max-width: 340px;
}

/* ── Selection bar ── */
.selection-bar {
  border-bottom: 1px solid rgba(255,255,255,0.05);
  padding-bottom: 12px;
}
.sel-count {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.45);
}
.sel-btn {
  background: none;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.55);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.sel-btn:hover {
  border-color: #D4AF37;
  color: #D4AF37;
}

/* ── Environment section ── */
.env-section-header {
  border-bottom: 1px solid rgba(212,175,55,0.1);
  padding-bottom: 10px;
}
.env-section-name {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}
.env-section-count {
  font-size: 0.73rem;
  color: rgba(255,255,255,0.35);
  background: rgba(255,255,255,0.05);
  border-radius: 20px;
  padding: 2px 8px;
}

/* ── Cards grid ── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

/* ── Card wrapper ── */
.qr-card-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 16px;
  transition: transform 0.18s, box-shadow 0.18s;
}
.qr-card-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
.qr-card-wrapper--selected .qr-card {
  border-color: rgba(212,175,55,0.55);
  box-shadow: 0 0 0 2px rgba(212,175,55,0.25);
}
.card-checkbox {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}

/* ── QR Card ── */
.qr-card {
  background: linear-gradient(180deg, #181e27 0%, #13181f 100%);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 18px 14px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  user-select: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.qr-card-venue {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(212,175,55,0.7);
}
.qr-card-table {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}
.qr-card-env {
  font-size: 0.68rem;
  color: rgba(255,255,255,0.4);
  margin-bottom: 6px;
}
.qr-code-area {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  margin: 4px 0;
}
.qr-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.03);
  border-radius: 10px;
}
.qr-svg-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qr-svg-wrap :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
.qr-card-tagline {
  font-size: 0.67rem;
  color: rgba(255,255,255,0.35);
  margin-top: 4px;
}
.qr-dev-link {
  font-size: 0.62rem;
  color: rgba(255,255,255,0.2);
  text-decoration: none;
  border-bottom: 1px dashed rgba(255,255,255,0.15);
  margin-top: 4px;
  transition: color 0.15s;
}
.qr-dev-link:hover {
  color: #D4AF37;
  border-bottom-color: #D4AF37;
}
.qr-card-brand {
  font-family: var(--font-heading);
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(212,175,55,0.5);
  letter-spacing: 0.05em;
  margin-top: 2px;
}
</style>
