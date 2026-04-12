<template>
  <v-dialog max-width="520" :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card style="background: #13181f; border: 1px solid rgba(212,175,55,0.18);">
      <v-card-title style="font-family: var(--font-heading); color: #fff; padding: 20px 20px 12px;">
        <v-icon class="mr-2" color="#D4AF37" start>mdi-walk</v-icon>
        Seat a Walk-in
      </v-card-title>

      <v-card-text style="overflow-y: auto; max-height: 60vh; padding: 0 20px 8px;">

        <!-- Empty / all-blocked state -->
        <div v-if="allBlocked" class="walkin-empty">
          <v-icon color="rgba(255,255,255,0.15)" size="36">mdi-table-off</v-icon>
          <span>No tables available for walk-in right now.</span>
        </div>

        <!-- Table list -->
        <v-list v-else class="walkin-list pa-0" density="compact">
          <template v-for="table in sortedTables" :key="table.elementId">
            <v-tooltip
              :disabled="conflictMap.get(table.elementId)?.conflictLevel !== 'block'"
              location="top"
              :text="`Unavailable — reservation in ${conflictMap.get(table.elementId)?.minutesUntilNext ?? '?'} min`"
            >
              <template #activator="{ props: tooltipProps }">
                <v-list-item
                  v-bind="tooltipProps"
                  class="walkin-row"
                  :class="{
                    'walkin-row--selected': selectedTable?.elementId === table.elementId,
                    'walkin-row--blocked': conflictMap.get(table.elementId)?.conflictLevel === 'block',
                  }"
                  @click="onRowClick(table)"
                >
                  <template #prepend>
                    <div class="walkin-row-label">
                      <div class="wt-label">{{ table.label }}</div>
                      <div class="wt-env">{{ table.envName }}</div>
                    </div>
                  </template>
                  <template #append>
                    <v-chip
                      :color="chipColor(conflictMap.get(table.elementId)?.conflictLevel)"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ chipText(table) }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>
            </v-tooltip>
          </template>
        </v-list>

        <!-- Detail panel -->
        <template v-if="selectedTable">
          <v-divider class="my-3" style="border-color: rgba(255,255,255,0.08);" />

          <!-- Conflict alert -->
          <v-alert
            class="mb-3"
            density="compact"
            style="font-size: 0.82rem;"
            :type="alertType(selectedConflict?.conflictLevel)"
            variant="tonal"
          >
            {{ alertMessage }}
          </v-alert>

          <!-- Upcoming reservations -->
          <div v-if="selectedConflict?.upcomingReservations?.length" class="upcoming-list mb-2">
            <div
              v-for="r in selectedConflict.upcomingReservations"
              :key="r.id"
              class="upcoming-row"
            >
              <span class="up-name">{{ r.name }}</span>
              <span class="up-dot">·</span>
              <span class="up-time">{{ r.time }}</span>
              <span class="up-dot">·</span>
              <span class="up-guests">{{ r.guests }} guests</span>
            </div>
          </div>
          <p v-if="selectedConflict?.upcomingReservations?.length" class="walkin-disclaimer mb-3">
            Seating this walk-in does not cancel upcoming reservations.
          </p>

          <!-- ── Guest account search ── -->
          <div class="guest-section mb-3">
            <div class="guest-section-label mb-2">
              <v-icon class="mr-1" size="13" style="color: #D4AF37;">mdi-account-search-outline</v-icon>
              Guest account
              <span class="optional-tag">optional</span>
            </div>

            <!-- Selected user chip -->
            <div v-if="selectedUser" class="selected-user-chip">
              <v-icon class="mr-1" color="#D4AF37" size="14">mdi-account-circle-outline</v-icon>
              <span class="su-name">{{ selectedUser.first_name }} {{ selectedUser.last_name }}</span>
              <span class="su-email">{{ selectedUser.email }}</span>
              <button class="su-clear" @click="clearUser">
                <v-icon size="14">mdi-close</v-icon>
              </button>
            </div>

            <!-- Search input -->
            <div v-else class="user-search-wrap">
              <v-icon class="us-icon" size="14">mdi-magnify</v-icon>
              <input
                v-model="userQuery"
                autocomplete="off"
                class="us-input"
                placeholder="Search by name or email..."
                @blur="onSearchBlur"
                @input="onUserSearch"
              >
              <button v-if="userQuery" class="us-clear" @click="userQuery = ''; userResults = []" @mousedown.prevent>
                <v-icon size="13">mdi-close</v-icon>
              </button>

              <!-- Results dropdown -->
              <div v-if="userResults.length > 0" class="us-dropdown">
                <button
                  v-for="u in userResults"
                  :key="u.email"
                  class="us-result"
                  @click="selectUser(u)"
                  @mousedown.prevent
                >
                  <v-icon class="mr-2" color="rgba(255,255,255,0.3)" size="14">mdi-account-outline</v-icon>
                  <span class="usr-name">{{ u.first_name }} {{ u.last_name }}</span>
                  <span class="usr-email">{{ u.email }}</span>
                </button>
              </div>

              <!-- No results -->
              <div v-if="userQuery.length >= 2 && userResults.length === 0 && !searching" class="us-no-results">
                No accounts found
              </div>
            </div>
          </div>

          <!-- Party size -->
          <div class="d-flex align-center ga-3 mb-3">
            <span class="field-label">Party size</span>
            <div class="stepper d-flex align-center ga-2">
              <button class="step-btn" :disabled="partySize <= 1" @click="partySize = Math.max(1, partySize - 1)">
                <v-icon size="16">mdi-minus</v-icon>
              </button>
              <span class="step-value">{{ partySize }}</span>
              <button class="step-btn" :disabled="partySize >= selectedTable.seats" @click="partySize = Math.min(selectedTable.seats, partySize + 1)">
                <v-icon size="16">mdi-plus</v-icon>
              </button>
            </div>
            <span v-if="partySize > selectedTable.seats" class="capacity-error">
              Exceeds table capacity ({{ selectedTable.seats }} seats)
            </span>
          </div>

          <!-- Notes -->
          <v-textarea
            v-model="notes"
            density="compact"
            hide-details
            label="Notes"
            rows="2"
            style="font-size: 0.82rem;"
            variant="outlined"
          />
        </template>
      </v-card-text>

      <v-card-actions style="padding: 12px 20px 16px; border-top: 1px solid rgba(255,255,255,0.06);">
        <v-spacer />
        <v-btn color="rgba(255,255,255,0.5)" variant="text" @click="cancel">Cancel</v-btn>
        <v-btn
          color="#D4AF37"
          :disabled="!canConfirm"
          variant="tonal"
          @click="confirm"
        >
          <v-icon size="16" start>mdi-walk</v-icon>
          Seat Walk-in
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import { RESERVATION_LIST } from '@/datamodel/Reservation.js'
  import { USER_LIST } from '@/datamodel/User.js'
  import { getVenueByAdminEmail } from '@/datamodel/Venue.js'
  import { getStaffByVenue } from '@/datamodel/VenueStaff.js'

  const props = defineProps({
    modelValue: Boolean,
    freeTables: { type: Array, default: () => [] },
    venueId: { type: [Number, String], default: null },
  })
  const emit = defineEmits(['update:modelValue', 'confirm'])

  // ── Internal state ────────────────────────────────────────────────────────────
  const selectedTable = ref(null)
  const partySize = ref(1)
  const notes = ref('')

  // Reset party size when table changes
  watch(selectedTable, () => {
    partySize.value = 1
  })

  // ── User search ───────────────────────────────────────────────────────────────
  const selectedUser = ref(null)
  const userQuery = ref('')
  const userResults = ref([])
  const searching = ref(false)

  function onUserSearch () {
    const q = userQuery.value.trim().toLowerCase()
    if (q.length < 2) {
      userResults.value = []; return
    }
    const staffEmails = new Set(getStaffByVenue(props.venueId).map(r => r.userEmail))

    userResults.value = USER_LIST.filter(u => {
      if (staffEmails.has(u.email)) return false
      if (getVenueByAdminEmail(u.email)?.id === props.venueId) return false
      const fullName = `${u.first_name} ${u.last_name}`.toLowerCase()
      return fullName.includes(q) || u.email.toLowerCase().includes(q)
    }).slice(0, 6)
  }

  function selectUser (u) {
    selectedUser.value = u
    userQuery.value = ''
    userResults.value = []
  }

  function clearUser () {
    selectedUser.value = null
    userQuery.value = ''
    userResults.value = []
  }

  function onSearchBlur () {
    // Small delay so mousedown on a result fires before blur clears it
    setTimeout(() => {
      userResults.value = []
    }, 150)
  }

  // ── Conflict computation ──────────────────────────────────────────────────────
  const conflictMap = ref(new Map())

  // Parse any time string ("HH:MM", "H:MM AM/PM", etc.) → ms
  function parseTime (t) {
    const s = t.trim()
    const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (m12) {
      let h = Number.parseInt(m12[1], 10)
      const min = Number.parseInt(m12[2], 10)
      const period = m12[3].toUpperCase()
      if (period === 'AM' && h === 12) h = 0
      if (period === 'PM' && h !== 12) h += 12
      return h * 3_600_000 + min * 60_000
    }
    const m24 = s.match(/^(\d{1,2}):(\d{2})$/)
    if (m24) return Number.parseInt(m24[1], 10) * 3_600_000 + Number.parseInt(m24[2], 10) * 60_000
    return 0
  }

  function buildConflictMap () {
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toTimeString().slice(0, 5)
    const nowMs = parseTime(now)
    const map = new Map()

    for (const table of props.freeTables) {
      const upcoming = RESERVATION_LIST
        .filter(r =>
          r.elementId === table.elementId
          && r.date === today
          && ['REQUESTED', 'APPROVED'].includes(r.status)
          && parseTime(r.time) > nowMs,
        )
        .sort((a, b) => parseTime(a.time) - parseTime(b.time))

      const next = upcoming[0] ?? null
      let minutesUntilNext = null
      let conflictLevel = 'safe'

      if (next) {
        minutesUntilNext = Math.round((parseTime(next.time) - nowMs) / 60_000)
        if (minutesUntilNext < 30) conflictLevel = 'block'
        else if (minutesUntilNext <= 90) conflictLevel = 'warn'
        else conflictLevel = 'safe'
      }

      map.set(table.elementId, { nextReservation: next, minutesUntilNext, conflictLevel, upcomingReservations: upcoming })
    }
    conflictMap.value = map
  }

  // Rebuild when dialog opens, reset all state
  watch(() => props.modelValue, open => {
    if (open) {
      buildConflictMap()
      selectedTable.value = null
      partySize.value = 1
      notes.value = ''
      selectedUser.value = null
      userQuery.value = ''
      userResults.value = []
    }
  })

  // ── Sorted display list ───────────────────────────────────────────────────────
  const sortedTables = computed(() => {
    const order = { safe: 0, warn: 1, block: 2 }
    return [...props.freeTables].sort((a, b) => {
      const ca = conflictMap.value.get(a.elementId) ?? { conflictLevel: 'safe', minutesUntilNext: null }
      const cb = conflictMap.value.get(b.elementId) ?? { conflictLevel: 'safe', minutesUntilNext: null }
      if (order[ca.conflictLevel] !== order[cb.conflictLevel])
        return order[ca.conflictLevel] - order[cb.conflictLevel]
      if (ca.conflictLevel !== 'block') {
        const ma = ca.minutesUntilNext ?? Infinity
        const mb = cb.minutesUntilNext ?? Infinity
        return mb - ma
      }
      return 0
    })
  })

  // ── Empty / all-blocked ───────────────────────────────────────────────────────
  const allBlocked = computed(() =>
    props.freeTables.every(t => conflictMap.value.get(t.elementId)?.conflictLevel === 'block'),
  )

  // ── Selected conflict ─────────────────────────────────────────────────────────
  const selectedConflict = computed(() =>
    selectedTable.value ? conflictMap.value.get(selectedTable.value.elementId) ?? null : null,
  )

  // ── Chip helpers ──────────────────────────────────────────────────────────────
  function chipColor (level) {
    if (level === 'block') return 'error'
    if (level === 'warn') return 'warning'
    return 'success'
  }

  function chipText (table) {
    const c = conflictMap.value.get(table.elementId)
    if (!c) return 'Open'
    if (c.conflictLevel === 'block') return `Reserved in ${c.minutesUntilNext}m`
    if (c.conflictLevel === 'warn') return `${c.minutesUntilNext}m window`
    if (c.minutesUntilNext != null) {
      const h = Math.floor(c.minutesUntilNext / 60)
      const m = c.minutesUntilNext % 60
      return h > 0 ? `${h}h ${m}m free` : `${m}m free`
    }
    return 'Open'
  }

  // ── Alert helpers ─────────────────────────────────────────────────────────────
  function alertType (level) {
    if (level === 'block') return 'error'
    if (level === 'warn') return 'warning'
    return 'success'
  }

  const alertMessage = computed(() => {
    if (!selectedConflict.value) return ''
    const c = selectedConflict.value
    const next = c.nextReservation
    if (c.conflictLevel === 'block')
      return `Cannot seat — reservation arrives in ${c.minutesUntilNext} min (${next?.name} at ${next?.time}).`
    if (c.conflictLevel === 'warn')
      return `Limited window — next reservation at ${next?.time} (${c.minutesUntilNext} min). Confirm only if the party can be served in time.`
    if (next)
      return `Next reservation at ${next.time} — ${c.minutesUntilNext} min window.`
    return 'No reservations today — table is fully open.'
  })

  // ── Row interaction ───────────────────────────────────────────────────────────
  function onRowClick (table) {
    if (conflictMap.value.get(table.elementId)?.conflictLevel === 'block') return
    selectedTable.value = table
  }

  // ── Confirm / cancel ──────────────────────────────────────────────────────────
  const canConfirm = computed(() => {
    if (!selectedTable.value) return false
    if (selectedConflict.value?.conflictLevel === 'block') return false
    if (partySize.value > selectedTable.value.seats) return false
    return true
  })

  function resetState () {
    selectedTable.value = null
    partySize.value = 1
    notes.value = ''
    selectedUser.value = null
    userQuery.value = ''
    userResults.value = []
  }

  function confirm () {
    if (!canConfirm.value) return
    emit('confirm', {
      table: selectedTable.value,
      partySize: partySize.value,
      notes: notes.value,
      user: selectedUser.value ?? null,
      conflict: selectedConflict.value ?? null,
    })
    resetState()
    emit('update:modelValue', false)
  }

  function cancel () {
    resetState()
    emit('update:modelValue', false)
  }
</script>

<style scoped>
.walkin-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.85rem;
  text-align: center;
}

.walkin-list {
  background: transparent !important;
}

.walkin-row {
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  margin-bottom: 6px;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  min-height: 52px;
}
.walkin-row:hover:not(.walkin-row--blocked) {
  background: rgba(212, 175, 55, 0.05);
  border-color: rgba(212, 175, 55, 0.2);
}
.walkin-row--selected {
  border-left: 3px solid var(--color-gold, #D4AF37) !important;
  background: rgba(212, 175, 55, 0.07) !important;
}
.walkin-row--blocked {
  opacity: 0.5;
  cursor: not-allowed;
}

.walkin-row-label { padding: 4px 0; }
.wt-label {
  font-weight: 600;
  font-size: 0.88rem;
  color: #fff;
  line-height: 1.2;
}
.wt-env {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}

/* ── Upcoming reservations ── */
.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.upcoming-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.6);
  padding: 3px 0;
}
.up-name  { font-weight: 500; color: rgba(255, 255, 255, 0.8); }
.up-dot   { color: rgba(255, 255, 255, 0.2); }
.up-time, .up-guests { color: rgba(255, 255, 255, 0.5); }

.walkin-disclaimer {
  font-size: 0.74rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.35);
  margin: 0;
}

/* ── Guest search section ── */
.guest-section {
  /* spacing via mb-3 */
}
.guest-section-label {
  display: flex;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.optional-tag {
  margin-left: 6px;
  font-size: 0.68rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.25);
  text-transform: none;
  letter-spacing: 0;
}

/* Selected user chip */
.selected-user-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 8px;
}
.su-name {
  font-size: 0.84rem;
  font-weight: 600;
  color: #fff;
}
.su-email {
  font-size: 0.74rem;
  color: rgba(255, 255, 255, 0.4);
  flex: 1;
}
.su-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.15s;
}
.su-clear:hover { color: rgba(255, 255, 255, 0.7); }

/* Search input */
.user-search-wrap {
  position: relative;
}
.us-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7a8d !important;
  pointer-events: none;
}
.us-input {
  width: 100%;
  background: #0a0e14;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.82);
  font-family: var(--font-body);
  font-size: 0.82rem;
  padding: 9px 32px 9px 30px;
  outline: none;
  transition: border-color 0.2s;
}
.us-input:focus { border-color: rgba(212, 175, 55, 0.35); }
.us-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7a8d;
  display: flex;
  align-items: center;
  padding: 2px;
}
.us-clear:hover { color: #fff; }

/* Dropdown */
.us-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #1a2030;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
  z-index: 10;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
.us-result {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
}
.us-result:last-child { border-bottom: none; }
.us-result:hover { background: rgba(212, 175, 55, 0.07); }
.usr-name {
  font-size: 0.84rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  flex-shrink: 0;
}
.usr-email {
  font-size: 0.74rem;
  color: rgba(255, 255, 255, 0.35);
  margin-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.us-no-results {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #1a2030;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  z-index: 10;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.3);
  padding: 12px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

/* ── Party size ── */
.field-label {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.6);
  min-width: 72px;
}
.step-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  background: rgba(212, 175, 55, 0.06);
  color: #D4AF37;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.step-btn:hover:not(:disabled) { background: rgba(212, 175, 55, 0.14); }
.step-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.step-value {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  min-width: 24px;
  text-align: center;
}
.capacity-error {
  font-size: 0.75rem;
  color: #ff5252;
}
</style>
