<template>
  <v-dialog
    max-width="480"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="srd-card">
      <!-- Gold top strip -->
      <div class="srd-strip" />

      <!-- Header -->
      <v-card-title class="srd-title px-6 pt-5 pb-2 d-flex align-center">
        <v-icon class="mr-2" color="#d4af37" size="17">mdi-star-plus-outline</v-icon>
        <span class="flex-grow-1">Leave a Review</span>
        <v-btn
          class="srd-close-btn"
          icon
          size="x-small"
          variant="text"
          @click="close"
        >
          <v-icon size="16">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider style="border-color: rgba(212,175,55,0.18)" />

      <!-- Body -->
      <v-card-text class="px-6 py-5">
        <!-- Venue name -->
        <div class="srd-venue-row mb-5">
          <v-icon class="mr-1" color="#6b7a8d" size="13">mdi-domain</v-icon>
          <span class="srd-venue-name">{{ reservation?.venueName || 'Venue' }}</span>
        </div>

        <!-- Star rating selector -->
        <div class="srd-section mb-5">
          <div class="srd-label mb-3">Your Rating <span class="srd-required">*</span></div>
          <div class="srd-stars-wrap">
            <StarRating
              v-model="rating"
              size="large"
            />
            <span class="srd-rating-hint" :class="{ 'srd-rating-hint--active': rating > 0 }">
              {{ ratingLabel }}
            </span>
          </div>
          <div v-if="showRatingError" class="srd-field-error mt-1">
            <v-icon size="12" class="mr-1">mdi-alert-circle-outline</v-icon>
            Please select a rating before submitting.
          </div>
        </div>

        <!-- Written review -->
        <div class="srd-section">
          <div class="srd-label mb-2">
            Your Review
            <span class="srd-optional">(optional)</span>
          </div>
          <v-textarea
            v-model="body"
            auto-grow
            bg-color="#0a0e14"
            class="srd-textarea"
            color="#d4af37"
            counter
            hide-details="auto"
            maxlength="500"
            placeholder="Share your experience — what made it special, what could be improved..."
            rows="3"
            variant="outlined"
          />
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="px-6 pb-5 ga-3">
        <v-btn class="srd-btn srd-btn--cancel" variant="text" @click="close">
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          class="srd-btn srd-btn--submit"
          :disabled="submitting"
          :loading="submitting"
          @click="submit"
        >
          <v-icon size="14" start>mdi-send-outline</v-icon>
          Submit Review
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import StarRating from '@/components/ui/StarRating.vue'
  import { addReview, getReviewByReservation, Review } from '@/datamodel/Review.js'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true,
    },
    /**
     * { reservationId, venueId, venueName, userId, reviewerName }
     */
    reservation: {
      type: Object,
      default: null,
    },
  })

  const emit = defineEmits(['update:modelValue', 'submitted'])

  const rating       = ref(0)
  const body         = ref('')
  const submitting   = ref(false)
  const showRatingError = ref(false)

  const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
  const ratingLabel = computed(() => RATING_LABELS[rating.value] ?? '')

  // Reset form when dialog opens
  watch(() => props.modelValue, open => {
    if (open) {
      rating.value = 0
      body.value   = ''
      showRatingError.value = false
    }
  })

  function close () {
    emit('update:modelValue', false)
  }

  function submit () {
    if (rating.value === 0) {
      showRatingError.value = true
      return
    }

    // Guard: duplicate review
    if (props.reservation && getReviewByReservation(props.reservation.reservationId)) {
      emit('update:modelValue', false)
      return
    }

    submitting.value = true

    addReview(new Review({
      id:            Date.now(),
      reservationId: props.reservation.reservationId,
      venueId:       props.reservation.venueId,
      userId:        props.reservation.userId,
      reviewerName:  props.reservation.reviewerName,
      rating:        rating.value,
      body:          body.value.trim(),
      createdAt:     new Date().toISOString(),
      status:        'VISIBLE',
    }))

    submitting.value = false
    emit('submitted')
    emit('update:modelValue', false)
  }
</script>

<style scoped>
.srd-card {
  background: #161d28 !important;
  border: 1px solid rgba(212, 175, 55, 0.18) !important;
  border-radius: 16px !important;
}

.srd-strip {
  height: 3px;
  background: linear-gradient(90deg, #d4af37, transparent);
  border-radius: 16px 16px 0 0;
}

.srd-title {
  font-family: var(--font-heading) !important;
  font-size: 1rem !important;
  color: #f5f0e8 !important;
}

.srd-close-btn {
  color: #6b7a8d !important;
}
.srd-close-btn:hover {
  color: #f5f0e8 !important;
}

/* Venue row */
.srd-venue-row {
  display: flex;
  align-items: center;
}
.srd-venue-name {
  font-size: 0.82rem;
  color: rgba(212, 175, 55, 0.8);
  font-weight: 500;
}

/* Section label */
.srd-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7a8d;
}
.srd-required {
  color: #e05252;
  margin-left: 2px;
}
.srd-optional {
  color: #4a5568;
  text-transform: none;
  letter-spacing: 0;
  font-size: 0.7rem;
  margin-left: 4px;
}

/* Stars */
.srd-stars-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.srd-rating-hint {
  font-size: 0.78rem;
  color: #4a5568;
  font-style: italic;
  transition: color 200ms ease;
}
.srd-rating-hint--active {
  color: rgba(212, 175, 55, 0.7);
}

/* Error */
.srd-field-error {
  font-size: 0.72rem;
  color: #e05252;
  display: flex;
  align-items: center;
}

/* Textarea */
.srd-textarea :deep(.v-field__outline) {
  --v-field-border-opacity: 0.25;
}

/* Buttons */
.srd-btn {
  font-size: 0.78rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  letter-spacing: 0.04em;
}
.srd-btn--cancel {
  color: #6b7a8d !important;
}
.srd-btn--cancel:hover {
  color: #f5f0e8 !important;
}
.srd-btn--submit {
  background: rgba(212, 175, 55, 0.12) !important;
  border: 1px solid rgba(212, 175, 55, 0.35) !important;
  color: #d4af37 !important;
  padding: 0 20px !important;
}
.srd-btn--submit:hover:not(:disabled) {
  background: rgba(212, 175, 55, 0.2) !important;
}
.srd-btn--submit:disabled {
  opacity: 0.45 !important;
}
</style>
