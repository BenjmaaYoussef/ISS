<template>
  <!--
    Category selector — horizontal scrollable pill tabs.
    Used in menu/[tableId].vue (read-only) and admin/menu.vue (editable).

    Usage:
      <MenuCategoryHero
        :categories="categories"
        v-model="activeCategory"
      />

    Category shape:
      { key: string, label: string, icon: string, gradient: string, count: number }
  -->
  <div class="category-nav" role="tablist">
    <button
      v-for="cat in categories"
      :key="cat.key"
      :aria-selected="modelValue === cat.key"
      class="cat-pill"
      :class="{ 'cat-pill--active': modelValue === cat.key }"
      role="tab"
      @click="$emit('update:modelValue', cat.key)"
    >
      <!-- Icon -->
      <span class="cat-icon">
        <v-icon size="18">{{ cat.icon }}</v-icon>
      </span>

      <!-- Label -->
      <span class="cat-label">{{ cat.label }}</span>

      <!-- Item count badge -->
      <span class="cat-count">{{ cat.count }}</span>
    </button>
  </div>
</template>

<script setup>
  defineProps({
    categories: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: String,
      required: true,
    },
  })

  defineEmits(['update:modelValue'])
</script>

<style scoped>
.category-nav {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.category-nav::-webkit-scrollbar {
  display: none;
}

.cat-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #13181f;
  color: #8b9aad;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition:
    border-color 0.22s ease,
    background 0.22s ease,
    color 0.22s ease,
    box-shadow 0.22s ease,
    transform 0.22s ease;
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  outline: none;
}
@media (min-width: 480px) {
  .cat-pill {
    gap: 8px;
    padding: 10px 20px;
    font-size: 0.85rem;
  }
}
.cat-pill:hover {
  border-color: rgba(212, 175, 55, 0.35);
  color: rgba(212, 175, 55, 0.8);
  transform: translateY(-1px);
}

.cat-pill--active {
  background: rgba(212, 175, 55, 0.12);
  border-color: rgba(212, 175, 55, 0.55);
  color: #d4af37;
  box-shadow:
    0 0 20px rgba(212, 175, 55, 0.15),
    inset 0 0 16px rgba(212, 175, 55, 0.06);
}
.cat-pill--active:hover {
  transform: none;
}

.cat-icon {
  display: flex;
  align-items: center;
  opacity: 0.8;
  transition: opacity 0.22s ease;
}
.cat-pill--active .cat-icon {
  opacity: 1;
}

.cat-label {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 0.92rem;
}

.cat-count {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.07);
  color: inherit;
  letter-spacing: 0.04em;
  transition: background 0.22s ease;
  font-family: var(--font-body);
}
.cat-pill--active .cat-count {
  background: rgba(212, 175, 55, 0.2);
}
</style>
