<template>
  <!--
    Single table card for the floor plan grid.

    Props:
      table: { id, env, seats, status, guest, time, note }
      readonly: hides action buttons (for future builder/preview mode)

    Emits:
      click        – card clicked
      check-in     – Check In button
      check-out    – Check Out button
      details      – Details button (call-waiter state)
  -->
  <div
    class="table-card"
    :class="`table-card--${table.status}`"
    @click="$emit('click', table)"
  >
    <!-- Call-waiter pulse ring -->
    <div v-if="table.status === 'call'" class="call-pulse" />

    <!-- Header row: table ID + seat count -->
    <div class="table-card-header">
      <span class="table-id">{{ table.id }}</span>
      <span class="table-seats">
        <v-icon size="11" class="mr-1">mdi-account</v-icon>{{ table.seats }}
      </span>
    </div>

    <!-- Status badge -->
    <div class="table-status-badge" :class="`badge--${table.status}`">
      {{ label }}
    </div>

    <!-- Occupied / reserved / call body -->
    <template v-if="table.status !== 'free'">
      <div class="table-guest mt-2">{{ table.guest }}</div>
      <div class="table-time">{{ table.time }}</div>
      <div v-if="table.note" class="table-note mt-1">
        <v-icon size="10" class="mr-1">mdi-note-outline</v-icon>{{ table.note }}
      </div>
    </template>
    <template v-else>
      <div class="table-free-text mt-2">{{ table.seats }} seats available</div>
    </template>

    <!-- Action buttons -->
    <div v-if="!readonly" class="table-action mt-3">
      <v-btn
        v-if="table.status === 'occupied'"
        size="x-small"
        class="action-chip action-chip--checkout"
        @click.stop="$emit('check-out', table)"
        >Check Out</v-btn
      >
      <v-btn
        v-else-if="table.status === 'reserved'"
        size="x-small"
        class="action-chip action-chip--checkin"
        @click.stop="$emit('check-in', table)"
        >Check In</v-btn
      >
      <v-btn
        v-else-if="table.status === 'call'"
        size="x-small"
        class="action-chip action-chip--details"
        @click.stop="$emit('details', table)"
        >Details</v-btn
      >
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { statusLabel } from "@/composables/useTableStatus";

const props = defineProps({
  table: {
    type: Object,
    required: true,
    // shape: { id, env, seats, status, guest, time, note }
  },
  /** When true, action buttons (Check In/Out/Details) are hidden */
  readonly: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["click", "check-in", "check-out", "details"]);

const label = computed(() => statusLabel(props.table.status));
</script>

<style scoped>
.table-card {
  position: relative;
  background: #13181f;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 18px;
  cursor: pointer;
  transition:
    transform 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
  overflow: hidden;
  animation: fadeIn 0.35s ease both;
}
.table-card:hover {
  transform: translateY(-3px);
}

/* Status variants */
.table-card--free {
  border-color: rgba(80, 100, 130, 0.3);
}
.table-card--occupied {
  border-color: rgba(212, 175, 55, 0.35);
  box-shadow: 0 0 18px rgba(212, 175, 55, 0.07);
}
.table-card--reserved {
  border-color: rgba(199, 21, 133, 0.35);
  box-shadow: 0 0 18px rgba(199, 21, 133, 0.07);
}
.table-card--call {
  border-color: rgba(199, 21, 133, 0.5);
  box-shadow: 0 0 22px rgba(199, 21, 133, 0.18);
  animation:
    callGlow 1.5s ease-in-out infinite alternate,
    fadeIn 0.35s ease both;
}

@keyframes callGlow {
  from {
    box-shadow: 0 0 14px rgba(199, 21, 133, 0.15);
  }
  to {
    box-shadow: 0 0 30px rgba(199, 21, 133, 0.4);
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Call pulse ring */
.call-pulse {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(199, 21, 133, 0.2), transparent 70%);
  animation: pulseBg 1.2s ease-in-out infinite;
}
@keyframes pulseBg {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.3;
  }
}

/* Header */
.table-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.table-id {
  font-family: "Playfair Display", serif;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}
.table-seats {
  font-size: 0.72rem;
  color: #6b7a8d;
  display: flex;
  align-items: center;
}

/* Status badge pill */
.table-status-badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 8px;
  border-radius: 20px;
  margin-top: 6px;
}
.badge--free {
  background: rgba(80, 100, 130, 0.15);
  color: #6b7a8d;
}
.badge--occupied {
  background: rgba(212, 175, 55, 0.15);
  color: #d4af37;
}
.badge--reserved {
  background: rgba(199, 21, 133, 0.15);
  color: #c71585;
}
.badge--call {
  background: rgba(199, 21, 133, 0.2);
  color: #c71585;
}

/* Body text */
.table-guest {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
}
.table-time {
  font-size: 0.75rem;
  color: #6b7a8d;
  margin-top: 2px;
}
.table-note {
  font-size: 0.72rem;
  color: #d4af37;
  display: flex;
  align-items: center;
}
.table-free-text {
  font-size: 0.78rem;
  color: #6b7a8d;
}

/* Action chips */
.action-chip {
  font-size: 0.68rem !important;
  font-weight: 600 !important;
  border-radius: 6px !important;
  letter-spacing: 0.04em !important;
}
.action-chip--checkout {
  background: rgba(212, 175, 55, 0.12) !important;
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
  color: #d4af37 !important;
}
.action-chip--checkout:hover {
  background: rgba(212, 175, 55, 0.25) !important;
}
.action-chip--checkin {
  background: rgba(46, 187, 87, 0.12) !important;
  border: 1px solid rgba(46, 187, 87, 0.3) !important;
  color: #2ebb57 !important;
}
.action-chip--checkin:hover {
  background: rgba(46, 187, 87, 0.25) !important;
}
.action-chip--details {
  background: rgba(199, 21, 133, 0.12) !important;
  border: 1px solid rgba(199, 21, 133, 0.3) !important;
  color: #c71585 !important;
}
</style>
