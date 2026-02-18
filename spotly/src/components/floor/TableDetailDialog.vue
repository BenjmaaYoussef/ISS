<template>
  <!--
    Table detail popup dialog.

    Usage:
      <TableDetailDialog
        v-model="detailDialog"
        :table="selectedTable"
        @check-in="checkIn"
        @check-out="checkOut"
        @resolve-call="resolveCall"
      />
  -->
  <v-dialog
    :model-value="modelValue"
    max-width="400"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="dialog-card" v-if="table">
      <!-- Color strip at top based on status -->
      <div class="dialog-strip" :class="`dialog-strip--${table.status}`" />

      <v-card-title class="dialog-title pt-5 px-6 d-flex align-center">
        {{ table.id }}
        <ReservationStatusChip
          :status="table.status"
          size="x-small"
          class="ml-2"
        />
      </v-card-title>

      <v-card-text class="px-6 pb-2">
        <div class="detail-grid">
          <div class="detail-item">
            <span class="dl">Guest</span>
            <span class="dv">{{ table.guest || "—" }}</span>
          </div>
          <div class="detail-item">
            <span class="dl">Time</span>
            <span class="dv">{{ table.time || "—" }}</span>
          </div>
          <div class="detail-item">
            <span class="dl">Seats</span>
            <span class="dv">{{ table.seats }}</span>
          </div>
          <div class="detail-item">
            <span class="dl">Area</span>
            <span class="dv">{{ table.env }}</span>
          </div>
          <div v-if="table.note" class="detail-item">
            <span class="dl">Note</span>
            <span class="dv gold-text">{{ table.note }}</span>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-5 ga-2">
        <v-btn
          variant="text"
          class="keep-btn"
          @click="$emit('update:modelValue', false)"
        >
          Close
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="table.status === 'call'"
          class="action-chip action-chip--checkout"
          @click="handle('resolve-call')"
        >
          <v-icon start size="13">mdi-check</v-icon> Resolve Alert
        </v-btn>
        <v-btn
          v-if="table.status === 'occupied'"
          class="action-chip action-chip--checkout"
          @click="handle('check-out')"
          >Check Out</v-btn
        >
        <v-btn
          v-if="table.status === 'reserved'"
          class="action-chip action-chip--checkin"
          @click="handle('check-in')"
          >Check In</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import ReservationStatusChip from "@/components/feedback/ReservationStatusChip.vue";

defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  table: {
    type: Object,
    default: null,
    // shape: { id, env, seats, status, guest, time, note }
  },
});

const emit = defineEmits([
  "update:modelValue",
  "check-in",
  "check-out",
  "resolve-call",
]);

function handle(event) {
  emit(event);
  emit("update:modelValue", false);
}
</script>

<style scoped>
.dialog-card {
  background: #161d28 !important;
  border: 1px solid rgba(212, 175, 55, 0.2) !important;
  border-radius: 16px !important;
}

/* Top color strip */
.dialog-strip {
  height: 3px;
}
.dialog-strip--occupied {
  background: linear-gradient(90deg, #d4af37, transparent);
}
.dialog-strip--reserved {
  background: linear-gradient(90deg, #c71585, transparent);
}
.dialog-strip--call {
  background: linear-gradient(90deg, #c71585, transparent);
}
.dialog-strip--free {
  background: linear-gradient(90deg, #334, transparent);
}

.dialog-title {
  font-family: "Playfair Display", serif !important;
  font-size: 1.2rem !important;
  color: #fff !important;
}

/* Detail grid */
.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}
.detail-item {
  display: flex;
  gap: 12px;
  align-items: center;
}
.dl {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7a8d;
  min-width: 48px;
}
.dv {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.82);
  font-weight: 500;
}
.gold-text {
  color: #d4af37 !important;
}

.keep-btn {
  color: #6b7a8d !important;
}

/* Action chips */
.action-chip {
  font-size: 0.72rem !important;
  font-weight: 600 !important;
  border-radius: 6px !important;
}
.action-chip--checkout {
  background: rgba(212, 175, 55, 0.12) !important;
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
  color: #d4af37 !important;
}
.action-chip--checkin {
  background: rgba(46, 187, 87, 0.12) !important;
  border: 1px solid rgba(46, 187, 87, 0.3) !important;
  color: #2ebb57 !important;
}
</style>
