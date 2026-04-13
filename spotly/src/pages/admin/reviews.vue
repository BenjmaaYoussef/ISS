<template>
  <AppNavbarSpotly active-link="reviews" :nav-links="adminNavLinks" @nav="handleNav" />

  <v-main class="rv-main">
    <div class="rv-container">

      <!-- ── Page Header ─────────────────────────────────────────────── -->
      <div class="page-header">
        <div>
          <div class="page-eyebrow">
            <v-icon class="mr-1" color="#D4AF37" size="13">mdi-star-outline</v-icon>
            Admin · Reviews
          </div>
          <h1 class="page-title">Guest Reviews</h1>
          <p class="page-sub">Moderate guest feedback for your venue</p>
        </div>
      </div>
      <div class="header-line" />

      <!-- ── Stats ──────────────────────────────────────────────────── -->
      <div class="rv-stats">
        <StatCard
          v-for="stat in stats"
          :key="stat.label"
          :color="stat.color"
          :label="stat.label"
          :value="stat.value"
        />
      </div>

      <!-- ── Filter pills ────────────────────────────────────────────── -->
      <div class="rv-pills-wrap">
        <div class="rv-pills">
          <button
            v-for="opt in filterOptions"
            :key="opt"
            class="rv-pill"
            :class="{ 'rv-pill--active': statusFilter === opt }"
            @click="statusFilter = opt"
          >
            {{ opt }}
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           DESKTOP: CSS-grid table (≥ 768 px)
           ══════════════════════════════════════════════════════════════ -->
      <div class="rv-table-wrap">
        <!-- Sticky header -->
        <div class="rv-grid rv-grid--head">
          <span>ID</span>
          <span>Guest</span>
          <span>Rating</span>
          <span>Review</span>
          <span>Date</span>
          <span>Status</span>
          <span class="rv-col-center">Actions</span>
        </div>

        <!-- Rows -->
        <template v-if="filteredReviews.length > 0">
          <div
            v-for="review in filteredReviews"
            :key="review.id"
            class="rv-grid rv-grid--row"
          >
            <!-- ID -->
            <span class="rv-cell rv-cell--id">#{{ review.id }}</span>

            <!-- Guest -->
            <span class="rv-cell rv-cell--name">{{ review.reviewerName }}</span>

            <!-- Rating -->
            <div class="rv-cell">
              <StarRating :model-value="review.rating" readonly size="small" />
            </div>

            <!-- Review text -->
            <div class="rv-cell">
              <span v-if="review.body" class="rv-body-text" :title="review.body">{{ review.body }}</span>
              <span v-else class="rv-no-text">—</span>
            </div>

            <!-- Date -->
            <div class="rv-cell">
              <span class="rv-date">{{ formatDate(review.createdAt) }}</span>
            </div>

            <!-- Status -->
            <div class="rv-cell">
              <span class="rv-status-badge" :class="`rv-status--${review.status.toLowerCase()}`">
                <v-icon size="10" class="mr-1">
                  {{ review.status === 'VISIBLE' ? 'mdi-eye-outline' : 'mdi-eye-off-outline' }}
                </v-icon>
                {{ review.status }}
              </span>
            </div>

            <!-- Actions -->
            <div class="rv-cell rv-col-center">
              <div class="rv-actions">
                <v-tooltip location="top" text="Make Visible">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      class="rv-btn rv-btn--visible"
                      :disabled="review.status === 'VISIBLE'"
                      icon
                      size="small"
                      @click="setStatus(review, 'VISIBLE')"
                    >
                      <v-icon size="15">mdi-eye-outline</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip location="top" text="Hide">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      class="rv-btn rv-btn--hide"
                      :disabled="review.status === 'HIDDEN'"
                      icon
                      size="small"
                      @click="setStatus(review, 'HIDDEN')"
                    >
                      <v-icon size="15">mdi-eye-off-outline</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </div>
          </div>
        </template>

        <!-- Desktop empty state -->
        <div v-else class="rv-empty rv-empty--desktop">
          <v-icon class="rv-empty__icon" size="56">mdi-star-off-outline</v-icon>
          <p class="rv-empty__title">No reviews found</p>
          <p class="rv-empty__hint">Try changing or clearing the filter above</p>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           MOBILE: card list (< 768 px)
           ══════════════════════════════════════════════════════════════ -->
      <div class="rv-cards">
        <template v-if="filteredReviews.length > 0">
          <div
            v-for="(review, idx) in filteredReviews"
            :key="review.id"
            class="rv-card"
            :style="{ animationDelay: `${idx * 45}ms` }"
          >
            <div class="rv-card__top">
              <span class="rv-card__id">#{{ review.id }}</span>
              <span class="rv-status-badge" :class="`rv-status--${review.status.toLowerCase()}`">
                {{ review.status }}
              </span>
            </div>

            <div class="rv-card__guest">{{ review.reviewerName }}</div>

            <div class="rv-card__rating">
              <StarRating :model-value="review.rating" readonly size="small" />
              <span class="rv-card__date ml-2">{{ formatDate(review.createdAt) }}</span>
            </div>

            <div v-if="review.body" class="rv-card__body">
              "{{ review.body }}"
            </div>

            <div class="rv-card__actions">
              <button
                class="rv-card__btn rv-card__btn--visible"
                :disabled="review.status === 'VISIBLE'"
                @click="setStatus(review, 'VISIBLE')"
              >
                <v-icon size="13">mdi-eye-outline</v-icon>
                Restore
              </button>
              <button
                class="rv-card__btn rv-card__btn--hide"
                :disabled="review.status === 'HIDDEN'"
                @click="setStatus(review, 'HIDDEN')"
              >
                <v-icon size="13">mdi-eye-off-outline</v-icon>
                Hide
              </button>
            </div>
          </div>
        </template>

        <div v-else class="rv-empty rv-empty--mobile">
          <v-icon class="rv-empty__icon" size="40">mdi-star-off-outline</v-icon>
          <p class="rv-empty__title">No reviews found</p>
        </div>
      </div>

    </div>
  </v-main>

  <SpotlySnackbar :snackbar="snackbar" />
</template>

<script setup>
  import { computed, ref } from 'vue'
  import SpotlySnackbar from '@/components/feedback/SpotlySnackbar.vue'
  import AppNavbarSpotly from '@/components/layout/AppNavbarSpotly.vue'
  import StarRating from '@/components/ui/StarRating.vue'
  import StatCard from '@/components/ui/StatCard.vue'
  import { useAdminNav } from '@/composables/useAdminNav'
  import { useAuth } from '@/composables/useAuth'
  import { useSnackbar } from '@/composables/useSnackbar'
  import { REVIEW_LIST, updateReviewStatus } from '@/datamodel/Review.js'

  const { adminNavLinks, handleNav } = useAdminNav()
  const { getSession } = useAuth()
  const { snackbar, notify } = useSnackbar()
  const session = getSession()

  // ── Venue-scoped reviews ──────────────────────────────────────────────────────
  const venueReviews = computed(() =>
    session?.venueId == null
      ? []
      : REVIEW_LIST.filter(r => r.venueId === session.venueId),
  )

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const stats = computed(() => {
    const all     = venueReviews.value
    const visible = all.filter(r => r.status === 'VISIBLE')
    const avg     = visible.length
      ? (visible.reduce((s, r) => s + r.rating, 0) / visible.length).toFixed(1)
      : '—'
    return [
      { label: 'Total Reviews',  value: all.length,                                   color: '#D4AF37' },
      { label: 'Average Rating', value: avg,                                           color: '#6B9FD4' },
      { label: 'Visible',        value: visible.length,                               color: '#2EBB57' },
      { label: 'Hidden',         value: all.filter(r => r.status === 'HIDDEN').length, color: '#6b7a8d' },
    ]
  })

  // ── Filters ───────────────────────────────────────────────────────────────────
  const filterOptions = ['All', 'Visible', 'Hidden']
  const statusFilter  = ref('All')

  const filteredReviews = computed(() => {
    const reviews = venueReviews.value
    if (statusFilter.value === 'Visible') return reviews.filter(r => r.status === 'VISIBLE')
    if (statusFilter.value === 'Hidden')  return reviews.filter(r => r.status === 'HIDDEN')
    return reviews
  })

  // ── Actions ───────────────────────────────────────────────────────────────────
  function setStatus (review, status) {
    updateReviewStatus(review.id, status)
    const msgs = {
      VISIBLE: { text: 'Review restored to visible', color: '#2EBB57', icon: 'mdi-eye-outline' },
      HIDDEN:  { text: 'Review hidden from guests',  color: '#6b7a8d', icon: 'mdi-eye-off-outline' },
    }
    const m = msgs[status]
    notify(m.text, m.color, m.icon)
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function formatDate (iso) {
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch { return '' }
  }
</script>

<style scoped>
/* ── Layout ──────────────────────────────────────────────────────────── */
.rv-main {
  background: #0a0e14 !important;
  font-family: var(--font-body);
}

.rv-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 48px 80px;
}
@media (max-width: 1024px) { .rv-container { padding: 32px 24px 60px; } }
@media (max-width: 600px)  { .rv-container { padding: 24px 16px 60px; } }

/* ── Page header ─────────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.page-eyebrow {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #d4af37;
  opacity: 0.8;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}

.page-title {
  font-family: var(--font-heading);
  font-size: clamp(1.5rem, 3vw, 2.1rem);
  color: #f5f0e8;
  font-weight: 700;
  margin: 0;
}

.page-sub {
  font-size: 0.85rem;
  color: #6b7a8d;
  margin-top: 4px;
}

.header-line {
  height: 1px;
  background: linear-gradient(90deg, rgba(212,175,55,0.3), transparent);
  margin-bottom: 32px;
}

/* ── Stats ───────────────────────────────────────────────────────────── */
.rv-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

/* ── Filter pills ────────────────────────────────────────────────────── */
.rv-pills-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 20px;
  padding-bottom: 4px;
}

.rv-pills {
  display: flex;
  gap: 8px;
  min-width: max-content;
}

.rv-pill {
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 500;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: #6b7a8d;
  cursor: pointer;
  transition: all 180ms ease;
  white-space: nowrap;
}
.rv-pill:hover { border-color: rgba(212,175,55,0.3); color: #d4af37; }
.rv-pill--active {
  background: rgba(212,175,55,0.12);
  border-color: rgba(212,175,55,0.4);
  color: #d4af37;
}

/* ══════════════════════════════════════════════════════
   DESKTOP TABLE (≥ 768px)
══════════════════════════════════════════════════════ */
.rv-table-wrap { display: none; }
@media (min-width: 768px) {
  .rv-table-wrap { display: block; }
  .rv-cards      { display: none; }
}

.rv-grid {
  display: grid;
  grid-template-columns: 60px 1fr 120px 2fr 110px 90px 110px;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
}

.rv-grid--head {
  padding: 12px 16px;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6b7a8d;
  background: rgba(255,255,255,0.02);
  border-radius: 8px 8px 0 0;
  border: 1px solid rgba(212,175,55,0.1);
  border-bottom: none;
  position: sticky;
  top: 0;
  z-index: 1;
}

.rv-grid--row {
  padding: 14px 16px;
  border: 1px solid rgba(212,175,55,0.07);
  border-top: none;
  background: #0d1219;
  transition: background 180ms ease;
}
.rv-grid--row:hover { background: rgba(212,175,55,0.04); }
.rv-grid--row:last-child { border-radius: 0 0 8px 8px; }

.rv-cell { font-size: 0.82rem; color: #9aa3b0; min-width: 0; }
.rv-cell--id { color: #4a5568; font-size: 0.75rem; font-family: monospace; }
.rv-cell--name { color: #f5f0e8; font-weight: 500; }
.rv-col-center { display: flex; justify-content: center; }

.rv-body-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.78rem;
  color: rgba(245, 240, 232, 0.6);
  font-style: italic;
}
.rv-no-text { color: #4a5568; }

.rv-date { font-size: 0.78rem; color: #6b7a8d; }

/* Status badge */
.rv-status-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-radius: 5px;
  padding: 2px 8px;
  white-space: nowrap;
}
.rv-status--visible {
  background: rgba(46, 187, 87, 0.1);
  border: 1px solid rgba(46, 187, 87, 0.25);
  color: #2ebb57;
}
.rv-status--hidden {
  background: rgba(107, 122, 141, 0.1);
  border: 1px solid rgba(107, 122, 141, 0.2);
  color: #6b7a8d;
}

/* Action buttons */
.rv-actions { display: flex; gap: 4px; }

.rv-btn {
  width: 28px !important;
  height: 28px !important;
  border-radius: 6px !important;
}
.rv-btn--visible {
  background: rgba(46, 187, 87, 0.08) !important;
  border: 1px solid rgba(46, 187, 87, 0.2) !important;
  color: #2ebb57 !important;
}
.rv-btn--hide {
  background: rgba(107, 122, 141, 0.08) !important;
  border: 1px solid rgba(107, 122, 141, 0.15) !important;
  color: #6b7a8d !important;
}
.rv-btn:disabled { opacity: 0.3 !important; cursor: default !important; }

/* Empty state */
.rv-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 24px;
  background: #0d1219;
  border: 1px solid rgba(212,175,55,0.07);
  border-top: none;
  border-radius: 0 0 8px 8px;
}
.rv-empty__icon { color: #1e2530 !important; margin-bottom: 12px; }
.rv-empty__title { font-size: 0.9rem; color: #3a4151; margin-bottom: 4px; }
.rv-empty__hint  { font-size: 0.78rem; color: #2a3040; }

/* ══════════════════════════════════════════════════════
   MOBILE CARDS (< 768px)
══════════════════════════════════════════════════════ */
.rv-cards { display: none; }
@media (max-width: 767px) {
  .rv-table-wrap { display: none; }
  .rv-cards { display: block; }
}

.rv-card {
  background: #0d1219;
  border: 1px solid rgba(212,175,55,0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
  animation: rv-card-in 300ms ease both;
}
@keyframes rv-card-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.rv-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.rv-card__id { font-size: 0.72rem; color: #4a5568; font-family: monospace; }
.rv-card__guest {
  font-size: 0.9rem;
  font-weight: 600;
  color: #f5f0e8;
  margin-bottom: 6px;
}
.rv-card__rating {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.rv-card__date { font-size: 0.72rem; color: #6b7a8d; }
.rv-card__body {
  font-size: 0.8rem;
  color: rgba(245, 240, 232, 0.55);
  font-style: italic;
  margin-bottom: 12px;
  line-height: 1.5;
}

.rv-card__actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.rv-card__btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  border-radius: 6px;
  padding: 5px 10px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: opacity 150ms ease;
}
.rv-card__btn:disabled { opacity: 0.3; cursor: default; }

.rv-card__btn--visible {
  background: rgba(46, 187, 87, 0.08);
  border-color: rgba(46, 187, 87, 0.2);
  color: #2ebb57;
}
.rv-card__btn--hide {
  background: rgba(107, 122, 141, 0.08);
  border-color: rgba(107, 122, 141, 0.15);
  color: #6b7a8d;
}

.rv-empty--mobile {
  text-align: center;
  padding: 40px 20px;
}
</style>
