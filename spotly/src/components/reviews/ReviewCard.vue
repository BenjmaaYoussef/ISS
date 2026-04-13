<template>
  <div class="review-card">
    <!-- Gold left strip -->
    <div class="review-card__strip" />

    <div class="review-card__body">
      <!-- Top row: reviewer + date -->
      <div class="review-card__header">
        <div class="reviewer-avatar" aria-hidden="true">
          {{ initials }}
        </div>
        <div class="reviewer-info">
          <div class="reviewer-name">{{ review.reviewerName }}</div>
          <div class="reviewer-date">{{ formattedDate }}</div>
        </div>
        <div class="review-card__stars">
          <StarRating :model-value="review.rating" readonly size="small" />
        </div>
      </div>

      <!-- Review body text -->
      <p v-if="review.body" class="review-card__text">
        "{{ review.body }}"
      </p>
      <p v-else class="review-card__text review-card__text--empty">
        No written review.
      </p>

      <!-- Status badge (only shown if HIDDEN, e.g. in admin views) -->
      <div v-if="showStatus && review.status === 'HIDDEN'" class="review-card__status-row">
        <span class="review-card__status-badge badge--hidden">
          <v-icon size="10" class="mr-1">mdi-eye-off-outline</v-icon>
          HIDDEN
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import StarRating from '@/components/ui/StarRating.vue'

  const props = defineProps({
    review: {
      type: Object,
      required: true,
    },
    showStatus: {
      type: Boolean,
      default: false,
    },
  })

  const initials = computed(() =>
    props.review.reviewerName
      ?.split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?',
  )

  const formattedDate = computed(() => {
    try {
      return new Date(props.review.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return ''
    }
  })
</script>

<style scoped>
.review-card {
  background: #13181f;
  border: 1px solid rgba(212, 175, 55, 0.14);
  border-radius: 12px;
  display: flex;
  overflow: hidden;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}
.review-card:hover {
  border-color: rgba(212, 175, 55, 0.28);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.review-card__strip {
  width: 3px;
  background: linear-gradient(180deg, #d4af37, rgba(212, 175, 55, 0.3));
  flex-shrink: 0;
}

.review-card__body {
  padding: 16px 18px;
  flex: 1;
  min-width: 0;
}

/* Header */
.review-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.reviewer-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: #d4af37;
  flex-shrink: 0;
  font-family: var(--font-heading);
}

.reviewer-info {
  flex: 1;
  min-width: 0;
}

.reviewer-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #f5f0e8;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reviewer-date {
  font-size: 0.7rem;
  color: #6b7a8d;
  margin-top: 1px;
}

.review-card__stars {
  flex-shrink: 0;
}

/* Body text */
.review-card__text {
  font-size: 0.83rem;
  color: rgba(245, 240, 232, 0.75);
  line-height: 1.6;
  font-style: italic;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.review-card__text--empty {
  color: #4a5568;
  font-style: normal;
  font-size: 0.78rem;
}

/* Status badge */
.review-card__status-row {
  margin-top: 8px;
}

.review-card__status-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-radius: 4px;
  padding: 2px 7px;
}

.badge--hidden {
  background: rgba(107, 122, 141, 0.15);
  border: 1px solid rgba(107, 122, 141, 0.3);
  color: #6b7a8d;
}

</style>
