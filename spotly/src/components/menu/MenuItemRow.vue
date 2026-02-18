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
      <div class="item-dot" />
      <div class="item-info">
        <div class="item-name">{{ item.name }}</div>
        <div v-if="item.desc" class="item-desc">{{ item.desc }}</div>
        <div v-if="item.tags?.length" class="item-tags d-flex ga-2 mt-1">
          <span v-for="tag in item.tags" :key="tag" class="item-tag">{{
            tag
          }}</span>
        </div>
      </div>
    </div>

    <div class="item-right d-flex align-center ga-2">
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
  padding: 18px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  animation: itemFadeIn 0.4s ease both;
  gap: 16px;
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
  gap: 14px;
  flex: 1;
}

/* Gold bullet dot */
.item-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d4af37;
  margin-top: 7px;
  flex-shrink: 0;
}

.item-name {
  font-family: "Playfair Display", serif;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.3;
}
.item-desc {
  font-size: 0.78rem;
  color: #6b7a8d;
  margin-top: 3px;
  line-height: 1.4;
}

.item-tag {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 7px;
  border-radius: 20px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: rgba(212, 175, 55, 0.7);
  font-family: "Inter", sans-serif;
}

.item-right {
  flex-shrink: 0;
}
.item-price {
  font-family: "Playfair Display", serif;
  font-size: 1rem;
  font-weight: 700;
  color: #d4af37;
  white-space: nowrap;
}

.edit-btn:hover {
  background: rgba(212, 175, 55, 0.1) !important;
}
.delete-btn:hover {
  background: rgba(199, 21, 133, 0.1) !important;
}
</style>
