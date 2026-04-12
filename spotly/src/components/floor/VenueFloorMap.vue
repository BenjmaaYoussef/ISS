<template>
  <!--
    VenueFloorMap — displays an environment's floor plan with live table statuses.

    Props:
      environment — full environment object { id, name, canvas: { width, height }, elements[] }
      tables      — pre-computed UI table array from useFloorTables (includes x, y, rotation)
      mode        — 'staff' (clickable) | 'readonly'

    Emits:
      table-click(tableUiObject)
  -->
  <div ref="outerRef" class="vfm-outer" :style="{ height: scaledHeight + 'px' }">
    <div v-if="environment" class="vfm-canvas" :style="canvasStyle">

      <!-- Decor elements (entrance, bar, plants — capacity 0) -->
      <div
        v-for="el in decorElements"
        :key="el.id"
        class="vfm-decor"
        :style="{ left: el.x + 'px', top: el.y + 'px' }"
      >
        <v-icon color="rgba(255,255,255,0.18)" size="18">{{ decorIcon(el.type) }}</v-icon>
        <span class="vfm-decor-label">{{ el.label }}</span>
      </div>

      <!-- Table cards -->
      <div
        v-for="table in tables"
        :key="table.elementId"
        class="vfm-slot"
        :style="slotStyle(table)"
      >
        <TableCard
          :readonly="mode === 'readonly'"
          :table="table"
          @check-in="$emit('table-click', table)"
          @check-out="$emit('table-click', table)"
          @click="$emit('table-click', table)"
          @details="$emit('table-click', table)"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="vfm-empty">
      <v-icon color="rgba(212,175,55,0.3)" size="40">mdi-floor-plan</v-icon>
      <p>No environment selected</p>
    </div>
  </div>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import TableCard from './TableCard.vue'

  const props = defineProps({
    /** Full environment object with canvas dimensions and elements array */
    environment: {
      type: Object,
      default: null,
    },
    /** Pre-computed UI table array from useFloorTables (includes x, y, rotation) */
    tables: {
      type: Array,
      default: () => [],
    },
    /** 'staff' = clickable action buttons; 'readonly' = display only */
    mode: {
      type: String,
      default: 'readonly',
    },
  })

  defineEmits(['table-click'])

  // ── Container measurement ─────────────────────────────────────────────────────
  const outerRef = ref(null)
  const containerWidth = ref(1000) // default until measured

  let ro = null
  onMounted(() => {
    if (!outerRef.value) return
    containerWidth.value = outerRef.value.clientWidth || 1000
    ro = new ResizeObserver(entries => {
      containerWidth.value = entries[0].contentRect.width || 1000
    })
    ro.observe(outerRef.value)
  })
  onUnmounted(() => ro?.disconnect())

  // ── Scale computation ─────────────────────────────────────────────────────────
  const canvasW = computed(() => props.environment?.canvas?.width || 1000)
  const canvasH = computed(() => props.environment?.canvas?.height || 660)
  const scale = computed(() => Math.min(1, containerWidth.value / canvasW.value))
  const scaledHeight = computed(() => Math.ceil(canvasH.value * scale.value))

  const canvasStyle = computed(() => ({
    position: 'relative',
    width: `${canvasW.value}px`,
    height: `${canvasH.value}px`,
    transform: `scale(${scale.value})`,
    transformOrigin: 'top left',
  }))

  // ── Table slot positioning ────────────────────────────────────────────────────
  const CARD_WIDTH = 130 // px — matches seed element spacing (~140px between elements)

  function slotStyle (table) {
    const style = {
      position: 'absolute',
      left: `${table.x}px`,
      top: `${table.y}px`,
      width: `${CARD_WIDTH}px`,
      transformOrigin: 'center center',
    }
    if (table.rotation) {
      style.transform = `rotate(${table.rotation}deg)`
    }
    return style
  }

  // ── Decor elements ────────────────────────────────────────────────────────────
  const DECOR_ICONS = {
    entrance: 'mdi-door-open',
    bar_counter: 'mdi-glass-mug-variant',
    plant: 'mdi-flower-outline',
    sofa: 'mdi-sofa-outline',
    stage: 'mdi-star-outline',
    dj_booth: 'mdi-music',
  }

  const decorIcon = type => DECOR_ICONS[type] || 'mdi-circle-small'

  const decorElements = computed(() =>
    props.environment?.elements?.filter(el => el.capacity === 0) || [],
  )
</script>

<style scoped>
/* ── Outer wrapper ─────────────────────────────────────────────────────── */
.vfm-outer {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid rgba(212, 175, 55, 0.12);
  background: #0a0e14;
}

/* ── Canvas (scaled internally) ───────────────────────────────────────── */
.vfm-canvas {
  /* Grid pattern overlay */
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 39px,
      rgba(255, 255, 255, 0.025) 39px,
      rgba(255, 255, 255, 0.025) 40px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 39px,
      rgba(255, 255, 255, 0.025) 39px,
      rgba(255, 255, 255, 0.025) 40px
    );
  background-color: #0a0e14;
}

/* ── Decor labels ─────────────────────────────────────────────────────── */
.vfm-decor {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  pointer-events: none;
}

.vfm-decor-label {
  font-size: 0.55rem;
  color: rgba(255, 255, 255, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

/* ── Empty state ──────────────────────────────────────────────────────── */
.vfm-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.85rem;
}
</style>
