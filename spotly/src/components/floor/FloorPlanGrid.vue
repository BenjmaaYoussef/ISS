<template>
  <!--
    Interactive floor plan grid with environment selector + legend.
    Used live in staff/dashboard.vue and will power the admin floor-plan builder.

    Usage:
      <FloorPlanGrid
        :tables="tables"
        :environments="environments"
        v-model:activeEnv="activeEnv"
        :readonly="false"
        @check-in="handleCheckIn"
        @check-out="handleCheckOut"
        @resolve-call="handleResolveCall"
        @table-click="openDetail"
      />
  -->
  <div>
    <!-- Environment selector + legend row -->
    <div class="env-row d-flex align-center justify-space-between mb-5">
      <div class="d-flex align-center ga-3">
        <div class="env-label">Environment:</div>
        <div
          v-for="env in environments"
          :key="env"
          class="env-chip"
          :class="{ 'env-chip--active': activeEnv === env }"
          @click="$emit('update:activeEnv', env)"
        >
          {{ env }}
        </div>
      </div>

      <!-- Legend -->
      <div class="legend d-flex align-center ga-4">
        <div class="legend-item"><span class="dot dot--free" /> Free</div>
        <div class="legend-item">
          <span class="dot dot--occupied" /> Occupied
        </div>
        <div class="legend-item">
          <span class="dot dot--reserved" /> Reserved
        </div>
        <div class="legend-item">
          <span class="dot dot--call" /> Call Waiter
        </div>
      </div>
    </div>

    <!-- Table grid -->
    <div class="floor-grid">
      <TableCard
        v-for="table in filteredTables"
        :key="table.id"
        :table="table"
        :readonly="readonly"
        @click="$emit('table-click', table)"
        @check-in="$emit('check-in', table)"
        @check-out="$emit('check-out', table)"
        @details="$emit('table-click', table)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import TableCard from "./TableCard.vue";

const props = defineProps({
  /**
   * Full list of table objects.
   * Shape: { id, env, seats, status, guest, time, note }
   */
  tables: {
    type: Array,
    required: true,
  },
  /** List of environment names for the selector chips */
  environments: {
    type: Array,
    required: true,
  },
  /** Currently selected environment (v-model:activeEnv) */
  activeEnv: {
    type: String,
    required: true,
  },
  /** When true, disable all action buttons on cards (preview / builder mode) */
  readonly: {
    type: Boolean,
    default: false,
  },
});

defineEmits([
  "update:activeEnv",
  "table-click",
  "check-in",
  "check-out",
  "resolve-call",
]);

const filteredTables = computed(() =>
  props.tables.filter((t) => t.env === props.activeEnv),
);
</script>

<style scoped>
/* Environment selector */
.env-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7a8d;
}
.env-chip {
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 0.78rem;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #6b7a8d;
  transition: all 0.2s;
}
.env-chip:hover {
  border-color: rgba(212, 175, 55, 0.3);
  color: #d4af37;
}
.env-chip--active {
  background: rgba(212, 175, 55, 0.12);
  border-color: rgba(212, 175, 55, 0.4);
  color: #d4af37;
}

/* Legend */
.legend {
  flex-wrap: wrap;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #6b7a8d;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}
.dot--free {
  background: #334;
  border: 1px solid #556;
}
.dot--occupied {
  background: #d4af37;
}
.dot--reserved {
  background: #c71585;
}
.dot--call {
  background: #c71585;
}

/* Grid */
.floor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 16px;
}
</style>
