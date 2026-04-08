<template>
  <!--
    Single menu item card — supports read-only (guest view) and editable (admin view).

    Usage (read-only):
      <MenuItemRow :item="item" />

    Usage (editable — admin/menu.vue):
      <MenuItemRow :item="item" editable @edit="onEdit" @delete="onDelete" />

    Item shape:
      { id, name, desc?, price, tags?: string[], allergens?: string[], category }
  -->
  <div class="menu-card" :style="{ animationDelay: animDelay }">
    <!-- Admin action buttons — top right -->
    <div v-if="editable" class="card-actions">
      <v-btn icon size="x-small" variant="text" class="edit-btn" @click="$emit('edit', item)">
        <v-icon size="14" color="#D4AF37">mdi-pencil-outline</v-icon>
      </v-btn>
      <v-btn icon size="x-small" variant="text" class="delete-btn" @click="$emit('delete', item)">
        <v-icon size="14" color="#C71585">mdi-trash-can-outline</v-icon>
      </v-btn>
    </div>

    <!-- Main content -->
    <div class="card-body">
      <div class="card-top">
        <div class="item-name">{{ item.name }}</div>
        <div class="item-price">
          <span class="price-amount">{{ item.price }}</span>
          <span class="price-unit">tnd</span>
        </div>
      </div>

      <div v-if="item.desc" class="item-desc">{{ item.desc }}</div>

      <div v-if="item.tags?.length || item.allergens?.length" class="card-footer">
        <div v-if="item.tags?.length" class="item-tags">
          <span v-for="tag in item.tags" :key="tag" class="tag tag--flavor">{{ tag }}</span>
        </div>
        <div v-if="item.allergens?.length" class="item-tags">
          <span v-for="a in item.allergens" :key="a" class="tag tag--allergen">{{ a }}</span>
        </div>
      </div>
    </div>

    <!-- Gold hover accent line -->
    <div class="card-accent" />
  </div>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  animDelay: {
    type: String,
    default: "0ms",
  },
});

defineEmits(["edit", "delete"]);
</script>

<style scoped>
.menu-card {
  position: relative;
  background: #13181f;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
  animation: cardFadeIn 0.45s ease both;
  transition:
    border-color 0.25s ease,
    transform 0.25s ease,
    box-shadow 0.25s ease;
  cursor: default;
}
@media (min-width: 480px) {
  .menu-card {
    padding: 22px 20px;
    border-radius: 16px;
  }
}
.menu-card:hover {
  border-color: rgba(212, 175, 55, 0.35);
  transform: translateY(-2px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(212, 175, 55, 0.1);
}
.menu-card:hover .card-accent {
  opacity: 1;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Gold bottom accent line */
.card-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #d4af37 0%, rgba(212, 175, 55, 0.2) 60%, transparent 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
}

/* Admin action buttons */
.card-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 4px;
  z-index: 1;
}
.edit-btn,
.delete-btn {
  opacity: 0.5;
  transition: opacity 0.2s, background 0.2s !important;
}
.edit-btn:hover {
  opacity: 1;
  background: rgba(212, 175, 55, 0.12) !important;
}
.delete-btn:hover {
  opacity: 1;
  background: rgba(199, 21, 133, 0.12) !important;
}

/* Card body */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.item-name {
  font-family: var(--font-heading);
  font-size: 1.08rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.3;
  flex: 1;
  letter-spacing: 0.01em;
}

.item-price {
  display: flex;
  align-items: baseline;
  gap: 3px;
  flex-shrink: 0;
}
.price-amount {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: #d4af37;
  line-height: 1;
}
.price-unit {
  font-size: 0.68rem;
  font-weight: 500;
  color: rgba(212, 175, 55, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.item-desc {
  font-size: 0.8rem;
  color: #8b9aad;
  line-height: 1.55;
  font-family: var(--font-body);
}

.card-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 3px 9px;
  border-radius: 20px;
  font-family: var(--font-body);
  font-weight: 500;
}
.tag--flavor {
  border: 1px solid rgba(212, 175, 55, 0.25);
  color: rgba(212, 175, 55, 0.7);
  background: rgba(212, 175, 55, 0.06);
}
.tag--allergen {
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.03);
}
</style>
