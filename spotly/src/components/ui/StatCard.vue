<template>
  <!--
    Metric tile — value + label, used in admin stats rows.

    Usage:
      <StatCard
        v-for="stat in stats"
        :key="stat.label"
        :value="stat.value"
        :label="stat.label"
        :color="stat.color"
      />
  -->
  <div class="stat-card">
    <div class="stat-value" :style="{ color: color }">{{ value }}</div>
    <div class="stat-label">{{ label }}</div>
  </div>
</template>

<script setup>
defineProps({
  value: { type: [String, Number], required: true },
  label: { type: String, required: true },
  /** Hex color for the value number */
  color: { type: String, default: "#D4AF37" },
});
</script>

<style scoped>
.stat-card {
  background: #13181f;
  border: 1px solid rgba(212,175,55,0.18);
  border-radius: 12px;
  padding: 20px 32px;
  text-align: center;
  min-width: 100px;
  transition:
    border-color 0.2s,
    transform 0.2s;
}
.stat-card:hover {
  border-color: rgba(212, 175, 55, 0.4);
  transform: translateY(-2px);
}
.stat-value {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}
.stat-label {
  color: #6b7a8d;
  font-family: var(--font-body);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 6px;
}
</style>
