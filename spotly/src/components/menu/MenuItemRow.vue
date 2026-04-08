<template>
  <!--
    Single menu item row — supports read-only (guest view) and editable (admin view).

    Usage (read-only):
      <MenuItemRow :item="item" />

    Usage (editable — future admin/menu.vue):
      <MenuItemRow :item="item" editable @edit="onEdit" @delete="onDelete" />

    Item shape:
      { id, name, desc?, price, tags?: string[], category }
  -->
  <div class="menu-item" :style="{ animationDelay: animDelay }">
    <div class="item-left">
      <div class="item-info">
        <div class="item-name">{{ item.name }}</div>
        <div v-if="item.desc" class="item-desc">{{ item.desc }}</div>
        <div v-if="item.tags?.length" class="item-tags d-flex ga-2 mt-2">
          <span v-for="tag in item.tags" :key="tag" class="item-tag">{{
            tag
          }}</span>
        </div>
      </div>
    </div>

    <div class="item-right d-flex align-center ga-3">
      <div class="item-price">{{ item.price }} tnd</div>

      <!-- Edit/Delete controls — only in editable mode -->
      <template v-if="editable">
        <v-btn
          icon
          size="x-small"
          variant="text"
          class="edit-btn"
          @click="$emit('edit', item)"
        >
          <v-icon size="14" color="#D4AF37">mdi-pencil-outline</v-icon>
        </v-btn>
        <v-btn
          icon
          size="x-small"
          variant="text"
          class="delete-btn"
          @click="$emit('delete', item)"
        >
          <v-icon size="14" color="#C71585">mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
    </div>
  </div>
</template>

<script setup>
defineProps({
  /** Menu item object */
  item: {
    type: Object,
    required: true,
    // shape: { id, name, desc?, price, tags?, category }
  },
  /** Show edit/delete controls (admin menu builder) */
  editable: {
    type: Boolean,
    default: false,
  },
  /** CSS animation-delay value e.g. "120ms" */
  animDelay: {
    type: String,
    default: "0ms",
  },
});

defineEmits(["edit", "delete"]);
</script>

<style scoped>
.menu-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  animation: itemFadeIn 0.4s ease both;
  gap: 16px;
  border-left: 3px solid transparent;
  transition:
    border-left-color 0.3s ease,
    background 0.3s ease,
    box-shadow 0.3s ease;
  position: relative;
}
.menu-item:hover {
  border-left-color: #d4af37;
  background: rgba(212, 175, 55, 0.08);
  box-shadow: inset 0 0 24px rgba(212, 175, 55, 0.08);
}
.menu-item:last-child {
  border-bottom: none;
}
@keyframes itemFadeIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.item-left {
  display: flex;
  align-items: flex-start;
  gap: 0;
  flex: 1;
  min-width: 0;
}

.item-info {
  width: 100%;
}

.item-name {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.3;
  letter-spacing: 0.02em;
}
.item-desc {
  font-size: 0.81rem;
  color: #8b9aad;
  margin-top: 6px;
  line-height: 1.5;
  font-family: var(--font-body);
}

.item-tags {
  gap: 8px;
}

.item-tag {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 10px;
  border-radius: 16px;
  border: 1px solid rgba(212, 175, 55, 0.4);
  color: rgba(212, 175, 55, 0.75);
  font-family: var(--font-body);
  font-weight: 500;
  background: rgba(212, 175, 55, 0.05);
  transition: all 0.2s ease;
}
.item-tag:hover {
  background: rgba(212, 175, 55, 0.12);
  border-color: rgba(212, 175, 55, 0.55);
}

.item-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-price {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 700;
  color: #d4af37;
  white-space: nowrap;
  letter-spacing: 0.02em;
  min-width: max-content;
}

.edit-btn {
  opacity: 0.6;
  transition: opacity 0.2s, background 0.2s !important;
}
.edit-btn:hover {
  opacity: 1;
  background: rgba(212, 175, 55, 0.15) !important;
}

.delete-btn {
  opacity: 0.6;
  transition: opacity 0.2s, background 0.2s !important;
}
.delete-btn:hover {
  opacity: 1;
  background: rgba(199, 21, 133, 0.15) !important;
}
</style>
