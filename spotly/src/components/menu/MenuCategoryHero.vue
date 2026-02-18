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

      <!-- Icon -->
      <div class="hero-icon">
        <v-icon size="28" color="rgba(255,255,255,0.9)">{{ cat.icon }}</v-icon>
      </div>

      <!-- Label and count -->
      <div class="hero-label">// {{ cat.label }}</div>
      <div class="hero-count">{{ cat.count }} items</div>

      <!-- Active indicator line -->
      <div v-if="modelValue === cat.key" class="hero-active-line" />
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
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.hero-card {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  padding: 22px 16px 18px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition:
    border-color 0.2s,
    transform 0.2s;
  min-height: 110px;
}
.hero-card:hover {
  border-color: rgba(212, 175, 55, 0.3);
  transform: translateY(-2px);
}
.hero-card--active {
  border-color: rgba(212, 175, 55, 0.55) !important;
}

.hero-bg {
  position: absolute;
  inset: 0;
  opacity: 0.9;
  transition: opacity 0.2s;
}
.hero-card--active .hero-bg {
  opacity: 1;
}

.hero-icon {
  position: relative;
  margin-bottom: 10px;
}

.hero-label {
  position: relative;
  font-family: "Playfair Display", serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.02em;
}

.hero-count {
  position: relative;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 3px;
  font-family: "Inter", sans-serif;
  letter-spacing: 0.06em;
}

/* Gold underline when active */
.hero-active-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #d4af37, transparent);
}
</style>
