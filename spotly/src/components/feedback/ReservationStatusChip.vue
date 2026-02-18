<template>
  <!--
    Unified status chip for both reservation statuses (Pending/Approved/Rejected/Cancelled)
    and floor-plan statuses (free/occupied/reserved/call).

    Usage:
      <ReservationStatusChip status="Pending" />
      <ReservationStatusChip status="occupied" size="x-small" />
  -->
  <v-chip
    :color="vuetifyColor"
    variant="tonal"
    :size="size"
    class="status-chip"
  >
    <v-icon v-if="showIcon" start :size="iconSize">{{ icon }}</v-icon>
    {{ label }}
  </v-chip>
</template>

<script setup>
import { computed } from "vue";
import {
  statusLabel,
  statusIcon,
  statusVuetifyColor,
} from "@/composables/useTableStatus";

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: "small",
  },
  showIcon: {
    type: Boolean,
    default: true,
  },
});

const label = computed(() => statusLabel(props.status));
const icon = computed(() => statusIcon(props.status));
const vuetifyColor = computed(() => statusVuetifyColor(props.status));
const iconSize = computed(() => (props.size === "x-small" ? 10 : 12));
</script>

<style scoped>
.status-chip {
  font-size: 0.7rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.04em;
}
</style>
