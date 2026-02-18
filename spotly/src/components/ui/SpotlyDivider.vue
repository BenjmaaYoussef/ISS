<template>
  <!--
    Gold gradient section divider with optional centered text label.

    Usage:
      <SpotlyDivider />
      <SpotlyDivider label="Cocktails" />
  -->
  <div class="spotly-divider">
    <div class="divider-line" />
    <div v-if="label" class="divider-text">{{ label }}</div>
    <div class="divider-line" />
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, default: null },
});
</script>

<style scoped>
.spotly-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 8px 0;
}
.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.4), transparent);
}
/* Reverse gradient for second line */
.divider-line:last-child {
  background: linear-gradient(270deg, rgba(212, 175, 55, 0.4), transparent);
}
.divider-text {
  font-family: "Playfair Display", serif;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.7);
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
