<template>
  <div
    class="star-rating"
    :class="[`star-rating--${size}`, { 'star-rating--interactive': !readonly }]"
    :aria-label="readonly ? `Rating: ${modelValue} out of 5` : 'Select a rating'"
    role="group"
  >
    <button
      v-for="n in 5"
      :key="n"
      class="star-btn"
      :class="{ 'star-btn--filled': n <= (hovered > 0 ? hovered : modelValue) }"
      :aria-label="readonly ? undefined : `Rate ${n} star${n !== 1 ? 's' : ''}`"
      :aria-pressed="!readonly ? (n === modelValue) : undefined"
      :disabled="readonly"
      :tabindex="readonly ? -1 : 0"
      type="button"
      @click="!readonly && emit('update:modelValue', n)"
      @mouseenter="!readonly && (hovered = n)"
      @mouseleave="!readonly && (hovered = 0)"
      @focus="!readonly && (hovered = n)"
      @blur="!readonly && (hovered = 0)"
    >
      <v-icon
        :color="n <= (hovered > 0 ? hovered : modelValue) ? '#D4AF37' : 'rgba(212,175,55,0.22)'"
        :size="iconSize"
      >
        {{ n <= (hovered > 0 ? hovered : modelValue) ? 'mdi-star' : 'mdi-star-outline' }}
      </v-icon>
    </button>

    <span v-if="showCount" class="star-count">({{ count }})</span>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'

  const props = defineProps({
    modelValue: {
      type: Number,
      default: 0,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'default', // 'small' | 'default' | 'large'
    },
    showCount: {
      type: Boolean,
      default: false,
    },
    count: {
      type: Number,
      default: 0,
    },
  })

  const emit = defineEmits(['update:modelValue'])
  const hovered = ref(0)

  const iconSize = computed(() => {
    if (props.size === 'small')  return 14
    if (props.size === 'large')  return 26
    return 20
  })
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.star-rating--interactive .star-btn {
  cursor: pointer;
  transition: transform 150ms ease;
}
.star-rating--interactive .star-btn:hover {
  transform: scale(1.15);
}

.star-btn {
  background: none;
  border: none;
  padding: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: transform 150ms ease;
  min-width: 24px;
  min-height: 24px;
}
.star-btn:focus-visible {
  outline: 2px solid rgba(212, 175, 55, 0.6);
  outline-offset: 1px;
}
.star-btn:disabled {
  cursor: default;
}

.star-rating--small .star-btn {
  min-width: 18px;
  min-height: 18px;
  padding: 1px;
}

.star-rating--large .star-btn {
  min-width: 32px;
  min-height: 32px;
  padding: 3px;
}

.star-count {
  font-size: 0.75rem;
  color: #6b7a8d;
  margin-left: 4px;
  font-family: var(--font-body);
}
</style>
