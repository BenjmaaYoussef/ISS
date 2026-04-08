<template>
  <!--
    Category selector with gradient hero images.
    Used in menu/[tableId].vue (read-only) and admin/menu.vue (editable).

    Usage:
      <MenuCategoryHero
        :categories="categories"
        v-model="activeCategory"
      />

    Category shape:
      { key: string, label: string, icon: string, gradient: string, count: number }
  -->
  <div class="hero-grid">
    <div
      v-for="cat in categories"
      :key="cat.key"
      class="hero-card"
      :class="{ 'hero-card--active': modelValue === cat.key }"
      @click="$emit('update:modelValue', cat.key)"
    >
      <!-- Gradient background -->
      <div class="hero-bg" :style="{ background: cat.gradient }" />

      <!-- Icon badge -->
      <div class="hero-icon-badge">
        <v-icon size="32" color="rgba(255,255,255,0.95)">{{ cat.icon }}</v-icon>
      </div>

      <!-- Label and count -->
      <div class="hero-label">{{ cat.label }}</div>
      <div class="hero-count-badge">{{ cat.count }}</div>

      <!-- Active indicator glow -->
      <div v-if="modelValue === cat.key" class="hero-active-glow" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  /**
   * Array of category objects.
   * Each: { key, label, icon, gradient, count }
   */
  categories: {
    type: Array,
    required: true,
  },
  /** Currently active category key (v-model) */
  modelValue: {
    type: String,
    required: true,
  },
});

defineEmits(["update:modelValue"]);
</script>

<style scoped>
.hero-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.hero-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  padding: 28px 18px 20px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition:
    border-color 0.28s ease,
    transform 0.28s ease,
    box-shadow 0.28s ease;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.hero-card:hover {
  border-color: rgba(212, 175, 55, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.15);
}
.hero-card--active {
  border-color: rgba(212, 175, 55, 0.6) !important;
  box-shadow:
    inset 0 0 20px rgba(212, 175, 55, 0.12),
    0 0 24px rgba(212, 175, 55, 0.2);
}

.hero-bg {
  position: absolute;
  inset: 0;
  opacity: 0.85;
  transition: opacity 0.28s ease;
}
.hero-card--active .hero-bg {
  opacity: 0.95;
}

.hero-icon-badge {
  position: relative;
  z-index: 1;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.1);
  border: 1.5px solid rgba(212, 175, 55, 0.25);
  border-radius: 14px;
  margin-bottom: 12px;
  backdrop-filter: blur(8px);
  transition:
    background 0.28s ease,
    border-color 0.28s ease,
    transform 0.28s ease;
}
.hero-card:hover .hero-icon-badge {
  background: rgba(212, 175, 55, 0.15);
  border-color: rgba(212, 175, 55, 0.35);
  transform: scale(1.05);
}
.hero-card--active .hero-icon-badge {
  background: rgba(212, 175, 55, 0.2);
  border-color: rgba(212, 175, 55, 0.4);
}

.hero-label {
  position: relative;
  z-index: 1;
  font-family: var(--font-heading);
  font-size: 1.02rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.02em;
  margin-bottom: 6px;
}

.hero-count-badge {
  position: relative;
  z-index: 1;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #d4af37;
  padding: 4px 12px;
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.28);
  border-radius: 12px;
  backdrop-filter: blur(4px);
  transition:
    background 0.28s ease,
    color 0.28s ease;
  font-family: var(--font-body);
}
.hero-card--active .hero-count-badge {
  background: rgba(212, 175, 55, 0.18);
  border-color: rgba(212, 175, 55, 0.38);
  color: #e5c158;
}

/* Soft glow when active */
.hero-active-glow {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  box-shadow: inset 0 0 20px rgba(212, 175, 55, 0.12);
  pointer-events: none;
  z-index: 0;
}
</style>
