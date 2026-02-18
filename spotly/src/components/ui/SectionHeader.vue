<template>
  <!--
    Page section heading with optional gold icon, count badge, and subtitle.

    Usage:
      <SectionHeader title="Reservation Queue" subtitle="Review pending requests" />
      <SectionHeader title="Upcoming" icon="mdi-calendar-clock" :count="3" />
  -->
  <div class="section-header">
    <div class="header-left">
      <div class="title-row">
        <v-icon
          v-if="icon"
          :icon="icon"
          color="#D4AF37"
          size="18"
          class="mr-2"
        />
        <span class="section-title">{{ title }}</span>
        <v-chip v-if="count !== null" size="x-small" class="count-chip ml-2">
          {{ count }}
        </v-chip>
      </div>
      <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
    </div>

    <!-- Optional right-side controls slot -->
    <slot name="actions" />
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: null },
  icon: { type: String, default: null },
  /** Show a count badge next to the title; pass null to hide */
  count: { type: Number, default: null },
});
</script>

<style scoped>
.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
  margin-bottom: 20px;
}
.header-left {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
}
.section-title {
  font-family: "Playfair Display", serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.2;
}
.section-subtitle {
  color: #6b7a8d;
  font-size: 0.88rem;
  font-family: "Inter", sans-serif;
  margin: 4px 0 0;
}

.count-chip {
  background: rgba(212, 175, 55, 0.12) !important;
  color: #d4af37 !important;
  font-weight: 700;
  font-size: 0.68rem !important;
  border: 1px solid rgba(212, 175, 55, 0.25);
}
</style>
