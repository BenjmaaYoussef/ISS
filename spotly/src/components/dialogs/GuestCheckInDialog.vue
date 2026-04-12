<template>
  <!--
    D2: Guest Check-In & Operational Notes  (Feature F14)

    Staff dialog to mark a guest as arrived or a no-show and add
    internal operational notes for the reservation.

    Usage:
      <GuestCheckInDialog
        v-model="showDialog"
        :reservation="reservation"
        @mark-arrived="onArrived"
        @mark-no-show="onNoShow"
      />
  -->
  <v-dialog
    max-width="480"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="gcid-card">
      <!-- Gold top strip -->
      <div class="gcid-strip" />

      <!-- Header -->
      <v-card-title class="gcid-title px-6 pt-5 pb-2 d-flex align-center">
        <span class="flex-grow-1">
          Guest Check-In&nbsp;:&nbsp;Reservation
          <span class="gcid-res-id">#{{ reservation.id }}</span>
        </span>
        <v-btn
          class="gcid-close-btn"
          icon
          size="x-small"
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon size="16">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider style="border-color: rgba(212,175,55,0.18)" />

      <!-- Body -->
      <v-card-text class="px-6 py-4">
        <!-- Info grid -->
        <div class="gcid-grid">
          <div class="gcid-row">
            <span class="gcid-label">Guest</span>
            <span class="gcid-value">{{ reservation.guest }}</span>
          </div>
          <div class="gcid-row">
            <span class="gcid-label">Party Size</span>
            <span class="gcid-value">{{ reservation.partySize }}</span>
          </div>
          <div class="gcid-row">
            <span class="gcid-label">Assigned Table</span>
            <span class="gcid-value">
              {{ reservation.tableId }}
              <span class="gcid-tag">{{ reservation.environment }}</span>
            </span>
          </div>
          <div class="gcid-row gcid-row--note">
            <span class="gcid-label">Client Notes</span>
            <span class="gcid-value gcid-client-note">
              "{{ reservation.clientNote }}"
            </span>
          </div>
        </div>

        <!-- Staff operational notes (editable) -->
        <div class="gcid-ops-section mt-4">
          <p class="gcid-ops-label mb-2">
            <v-icon class="mr-1" size="13" style="color: #6b7a8d">mdi-note-edit-outline</v-icon>
            Staff Operational Notes
            <span class="gcid-ops-hint">(Internal)</span>
          </p>
          <v-textarea
            v-model="staffNotes"
            auto-grow
            bg-color="#0a0e14"
            class="gcid-textarea"
            color="#d4af37"
            hide-details
            :placeholder="'e.g. Guest arrived early. Seated at bar first.'"
            rows="3"
            variant="outlined"
          />
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="px-6 pb-5 d-flex gap-3">
        <v-btn
          class="gcid-action-btn gcid-btn--arrived flex-grow-1"
          @click="handle('mark-arrived')"
        >
          <v-icon size="14" start>mdi-check-circle-outline</v-icon>
          Mark as Arrived
        </v-btn>
        <v-btn
          class="gcid-action-btn gcid-btn--noshow flex-grow-1"
          @click="handle('mark-no-show')"
        >
          <v-icon size="14" start>mdi-account-remove-outline</v-icon>
          Mark as No-Show
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { ref, watch } from 'vue'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true,
    },
    /**
     * Reservation object:
     * {
     *   id: Number,
     *   guest: String,
     *   partySize: Number,
     *   tableId: String,
     *   environment: String,
     *   clientNote: String,
     *   staffNote: String,
     * }
     */
    reservation: {
      type: Object,
      default: () => ({
        id: 104,
        guest: 'Epon M.',
        partySize: 2,
        tableId: 'T-12',
        environment: 'Indoor',
        clientNote: 'It\'s my birthday',
        staffNote: '',
      }),
    },
  })

  const emit = defineEmits(['update:modelValue', 'mark-arrived', 'mark-no-show'])

  const staffNotes = ref(props.reservation.staffNote || '')

  // Reset notes when dialog opens with a new reservation
  watch(
    () => props.reservation,
    r => {
      staffNotes.value = r.staffNote || ''
    },
  )

  function handle (event) {
    emit(event, { ...props.reservation, staffNote: staffNotes.value })
    emit('update:modelValue', false)
  }
</script>

<style scoped>
/* ── Card shell ──────────────────────────────────────── */
.gcid-card {
  background: #161d28 !important;
  border: 1px solid rgba(212,175,55,0.18) !important;
  border-radius: 16px !important;
}

/* Gold top strip */
.gcid-strip {
  height: 3px;
  background: linear-gradient(90deg, #d4af37, transparent);
  border-radius: 16px 16px 0 0;
}

/* ── Title ───────────────────────────────────────────── */
.gcid-title {
  font-family: var(--font-heading) !important;
  font-size: 1rem !important;
  color: #f5f0e8 !important;
}

.gcid-res-id {
  color: #d4af37;
  font-weight: 700;
}

.gcid-close-btn {
  color: #6b7a8d !important;
}
.gcid-close-btn:hover {
  color: #f5f0e8 !important;
}

/* ── Info grid ───────────────────────────────────────── */
.gcid-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gcid-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.gcid-row--note {
  align-items: flex-start;
}

.gcid-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7a8d;
  min-width: 108px;
  flex-shrink: 0;
}

.gcid-value {
  font-size: 0.9rem;
  color: rgba(245, 240, 232, 0.85);
  font-weight: 500;
}

.gcid-tag {
  display: inline-block;
  margin-left: 6px;
  font-size: 0.7rem;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.25);
  color: #d4af37;
  border-radius: 4px;
  padding: 1px 6px;
  font-weight: 500;
}

.gcid-client-note {
  color: #d4af37 !important;
  font-style: italic;
}

/* ── Operational notes ───────────────────────────────── */
.gcid-ops-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 10px;
  padding: 12px 14px;
}

.gcid-ops-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7a8d;
}

.gcid-ops-hint {
  color: #4a5568;
  text-transform: none;
  letter-spacing: 0;
  font-size: 0.72rem;
  margin-left: 4px;
}

.gcid-textarea :deep(.v-field__outline) {
  --v-field-border-opacity: 0.25;
}

/* ── Action buttons ──────────────────────────────────── */
.gcid-action-btn {
  font-size: 0.78rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  letter-spacing: 0.04em;
}

.gcid-btn--arrived {
  background: rgba(46, 187, 87, 0.1) !important;
  border: 1px solid rgba(46, 187, 87, 0.3) !important;
  color: #2ebb57 !important;
}

.gcid-btn--noshow {
  background: rgba(224, 82, 82, 0.1) !important;
  border: 1px solid rgba(224, 82, 82, 0.28) !important;
  color: #e05252 !important;
}
</style>
