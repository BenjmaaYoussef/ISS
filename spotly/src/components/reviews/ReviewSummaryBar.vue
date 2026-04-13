<template>
  <div class="review-summary">
    <!-- Average score -->
    <div class="summary-score">
      <span class="score-number">{{ averageRating }}</span>
      <div class="score-right">
        <StarRating :model-value="Math.round(averageRatingNum)" readonly size="default" />
        <div class="score-sub">{{ reviews.length }} review{{ reviews.length !== 1 ? 's' : '' }}</div>
      </div>
    </div>

    <!-- Rating distribution bars -->
    <div class="summary-bars" aria-hidden="true">
      <div v-for="n in [5, 4, 3, 2, 1]" :key="n" class="bar-row">
        <span class="bar-label">{{ n }}</span>
        <v-icon color="rgba(212,175,55,0.5)" size="11">mdi-star</v-icon>
        <div class="bar-track">
          <div
            class="bar-fill"
            :style="{ width: barWidth(n) + '%' }"
          />
        </div>
        <span class="bar-count">{{ countForRating(n) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import StarRating from '@/components/ui/StarRating.vue'

  const props = defineProps({
    reviews: {
      type: Array,
      required: true,
    },
  })

  const averageRatingNum = computed(() => {
    if (props.reviews.length === 0) return 0
    return props.reviews.reduce((sum, r) => sum + r.rating, 0) / props.reviews.length
  })

  const averageRating = computed(() =>
    props.reviews.length === 0 ? '—' : averageRatingNum.value.toFixed(1),
  )

  function countForRating (n) {
    return props.reviews.filter(r => r.rating === n).length
  }

  function barWidth (n) {
    if (props.reviews.length === 0) return 0
    return Math.round((countForRating(n) / props.reviews.length) * 100)
  }
</script>

<style scoped>
.review-summary {
  display: flex;
  align-items: center;
  gap: 32px;
  background: rgba(212, 175, 55, 0.04);
  border: 1px solid rgba(212, 175, 55, 0.14);
  border-radius: 14px;
  padding: 20px 24px;
}

@media (max-width: 600px) {
  .review-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
  }
}

/* Score */
.summary-score {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.score-number {
  font-family: var(--font-heading);
  font-size: 3rem;
  font-weight: 700;
  color: #d4af37;
  line-height: 1;
}

.score-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.score-sub {
  font-size: 0.75rem;
  color: #6b7a8d;
  margin-top: 2px;
}

/* Bars */
.summary-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bar-label {
  font-size: 0.72rem;
  color: #6b7a8d;
  width: 10px;
  text-align: right;
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 5px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4af37, rgba(212, 175, 55, 0.6));
  border-radius: 3px;
  transition: width 400ms ease;
}

.bar-count {
  font-size: 0.68rem;
  color: #4a5568;
  width: 16px;
  text-align: right;
  flex-shrink: 0;
}
</style>
