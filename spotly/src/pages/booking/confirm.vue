<template>
  <!-- ── App Bar ── -->
  <AppNavbarVenue
    :show-default-actions="false"
    :show-powered-by="false"
    :venue-name="venueName"
    :venue-id="bookingVenueId"
  >
    <template #actions>
      <BookingStepIndicator
        :current-step="3"
        :steps="[
          { label: 'Environment' },
          { label: 'Select Table' },
          { label: 'Confirm' },
        ]"
      />
      <v-btn
        class="text-none px-4 ml-4 nav-back-btn d-none d-sm-flex"
        :ripple="false"
        size="small"
        variant="text"
        @click="goBack"
      >
        <v-icon class="mr-1" size="14">mdi-arrow-left</v-icon>Back
      </v-btn>
    </template>
  </AppNavbarVenue>

  <!-- ── Main Content ── -->
  <v-main class="spotly-main">
    <div class="spotly-container spotly-container--wide confirm-page">
      <!-- Back Button -->
      <v-btn
        class="back-btn text-none mb-5"
        :ripple="false"
        size="small"
        variant="text"
        @click="goBack"
      >
        <v-icon size="18" start>mdi-chevron-left</v-icon>
        Back to Map
      </v-btn>

      <!-- Page Layout -->
      <v-row>
        <!-- LEFT COLUMN: Form -->
        <v-col cols="12" md="8">
          <!-- Venue Header -->
          <div class="venue-header mb-6">
            <h1 class="venue-title">{{ venueName }}</h1>
            <div class="venue-location mt-1">
              <v-icon size="15" style="color: #6a7080">mdi-map-marker</v-icon>
              <span class="ml-1">Sidi Bou Said, Tunisia</span>
            </div>
          </div>

          <h2 class="page-subtitle mb-6">Complete your reservation</h2>

          <!-- SECTION 1: Your Details -->
          <v-card class="form-section mb-4" flat>
            <v-card-text class="pa-6">
              <div class="section-header mb-5">
                <div class="section-number">1</div>
                <span class="section-title ml-3">Your Details</span>
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <label class="field-label mb-2 d-block">
                    Name <span class="required-star">*</span>
                  </label>
                  <v-text-field
                    v-model="form.name"
                    class="spotly-input"
                    density="comfortable"
                    hide-details="auto"
                    placeholder="Enter your full name"
                    :rules="[(v) => !!v || 'Name is required']"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <label class="field-label mb-2 d-block">
                    Email <span class="required-star">*</span>
                  </label>
                  <v-text-field
                    v-model="form.email"
                    class="spotly-input"
                    density="comfortable"
                    hide-details="auto"
                    placeholder="your.email@example.com"
                    :rules="emailRules"
                    type="email"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <label class="field-label mb-2 d-block">Phone Number</label>
                  <v-text-field
                    v-model="form.phone"
                    class="spotly-input"
                    density="comfortable"
                    hide-details
                    placeholder="+216 XX XXX XXX"
                    type="tel"
                    variant="outlined"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- SECTION 2: Booking Summary -->
          <v-card class="form-section mb-4" flat>
            <v-card-text class="pa-6">
              <div class="section-header mb-5">
                <div class="section-number">2</div>
                <span class="section-title ml-3">Booking Summary</span>
              </div>

              <!-- Cart items (from P5) -->
              <template v-if="cart.length > 0">
                <div
                  v-for="(item, idx) in cart"
                  :key="item.id"
                  :class="{ 'cart-item-separator': idx > 0 }"
                >
                  <div class="summary-row" style="margin-bottom: 6px">
                    <span class="summary-label summary-label--gold">Table {{ idx + 1 }}</span>
                    <span class="summary-value summary-value--gold">{{ item.label }}</span>
                  </div>
                  <div class="summary-grid">
                    <div class="summary-row">
                      <span class="summary-label">Area</span>
                      <span class="summary-value">{{ item.env }}</span>
                    </div>
                    <v-divider class="summary-divider" />
                    <div class="summary-row">
                      <span class="summary-label">Date</span>
                      <span class="summary-value">{{ item.date }}</span>
                    </div>
                    <v-divider class="summary-divider" />
                    <div class="summary-row">
                      <span class="summary-label">Time</span>
                      <span class="summary-value">{{ item.time }}</span>
                    </div>
                    <v-divider class="summary-divider" />
                    <div class="summary-row">
                      <span class="summary-label">Guests</span>
                      <span class="summary-value">{{ item.guests }} / {{ item.cap }} capacity</span>
                    </div>
                    <template v-if="item.notes">
                      <v-divider class="summary-divider" />
                      <div class="summary-row">
                        <span class="summary-label">Notes</span>
                        <span class="summary-value summary-value--muted">{{ item.notes }}</span>
                      </div>
                    </template>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="summary-row">
                  <span class="summary-label">Status</span>
                  <span class="summary-value summary-value--dim">No tables selected</span>
                </div>
              </template>
            </v-card-text>
          </v-card>

          <!-- SECTION 3: Special Request -->
          <v-card class="form-section mb-4" flat>
            <v-card-text class="pa-6">
              <div class="section-header mb-5">
                <div class="section-number">3</div>
                <span class="section-title ml-3">Special Guest Request</span>
              </div>

              <label class="field-label mb-2 d-block">Notes (Optional)</label>
              <v-textarea
                v-model="form.notes"
                class="spotly-input"
                counter="500"
                hide-details="auto"
                maxlength="500"
                no-resize
                placeholder="e.g., It's our anniversary. Please ensure the table is clean."
                rows="5"
                variant="outlined"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- RIGHT COLUMN: Sidebar -->
        <v-col cols="12" md="4">
          <v-card class="sidebar-card sticky-card" flat>
            <v-card-text class="pa-6">
              <!-- Reservation Preview -->
              <div class="preview-box mb-5">
                <template v-if="firstItem">
                  <div class="d-flex align-start">
                    <div class="preview-icon mr-4">
                      <v-icon size="26" color="#d4af37">mdi-seat</v-icon>
                    </div>
                    <div style="flex: 1">
                      <div class="preview-title">
                        {{ firstItem.label
                        }}<span
                          v-if="cart.length > 1"
                          class="preview-more"
                        >+{{ cart.length - 1 }} more</span>
                      </div>
                      <div class="preview-meta">
                        {{ firstItem.env }} · {{ totalGuests }} guest{{
                          totalGuests !== 1 ? "s" : ""
                        }}
                      </div>
                      <div class="preview-datetime">
                        <div class="d-flex align-center mt-3">
                          <v-icon size="14" style="color: #6a7080">mdi-calendar-blank</v-icon>
                          <span class="ml-2">{{ firstItem.date }}</span>
                        </div>
                        <div class="d-flex align-center mt-1">
                          <v-icon size="14" style="color: #6a7080">mdi-clock-outline</v-icon>
                          <span class="ml-2">{{ firstItem.time }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="preview-empty">No tables added yet</div>
                </template>
              </div>

              <v-divider class="sidebar-divider mb-5" />

              <!-- Policy Alert -->
              <div class="policy-alert mb-5">
                <v-icon class="mr-2 policy-icon" size="18">mdi-information-outline</v-icon>
                <div class="policy-text">
                  By confirming, you agree to our cancellation policy. Free
                  cancellation up to 24 hours before your reservation.
                </div>
              </div>

              <!-- Action Buttons -->
              <v-btn
                block
                class="gold-btn mb-3"
                :disabled="!isFormValid || submitting"
                flat
                :loading="submitting"
                :ripple="false"
                size="large"
                @click="requestReservation"
              >
                Request Reservation
              </v-btn>

              <v-btn
                block
                class="secondary-btn"
                :ripple="false"
                size="large"
                variant="outlined"
                @click="focusNotes"
              >
                <v-icon size="18" start>mdi-note-plus-outline</v-icon>
                Add Note
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-main>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import AppNavbarVenue from '@/components/layout/AppNavbarVenue.vue'
  import BookingStepIndicator from '@/components/ui/BookingStepIndicator.vue'
  import { addReservation, Reservation, RESERVATION_LIST } from '@/datamodel/Reservation.js'
  import { addReservationLog, ReservationLog } from '@/datamodel/ReservationLog.js'
  import { VENUE_LIST } from '@/datamodel/Venue.js'

  const route = useRoute()
  const router = useRouter()

  const booking = (() => {
    try { return JSON.parse(sessionStorage.getItem('spotly_booking') || '{}') }
    catch { return {} }
  })()
  const bookingVenueId = Number(booking.venueId) || null
  const bookingEnvId   = booking.environmentId   || null

  const venueName = computed(() =>
    VENUE_LIST.find(v => v.id === bookingVenueId)?.name ?? 'Venue',
  )

  // Read cart passed from seats page via sessionStorage
  const cart = ref([])
  try {
    const raw = sessionStorage.getItem('spotly_cart')
    if (raw) cart.value = JSON.parse(raw)
  } catch {}

  onMounted(() => {
    // Auth guard: must be logged in to confirm a booking
    const session = (() => {
      try { return JSON.parse(localStorage.getItem('spotly_session') || 'null') }
      catch { return null }
    })()
    if (!session?.userId) {
      router.replace(`/auth?redirect=${encodeURIComponent(route.fullPath)}`)
      return
    }
    if (cart.value.length === 0) {
      router.replace(bookingVenueId
        ? `/booking/seats?venueId=${bookingVenueId}&envId=${bookingEnvId ?? ''}`
        : '/booking/seats')
    }
  })

  const firstItem = computed(() => cart.value[0] ?? null)
  const totalGuests = computed(() =>
    cart.value.reduce((s, c) => s + c.guests, 0),
  )

  const submitting = ref(false)

  const form = ref({
    name: '',
    email: '',
    phone: '',
    notes: '',
  })

  const emailRules = [
    v => !!v || 'Email is required',
    v => /.+@.+\..+/.test(v) || 'Email must be valid',
  ]

  const isFormValid = computed(() => {
    return (
      form.value.name.trim()
      && form.value.email.trim()
      && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)
    )
  })

  const goBack = () => router.push(bookingVenueId
    ? `/booking/seats?venueId=${bookingVenueId}&envId=${bookingEnvId ?? ''}`
    : '/booking/seats')
  function requestReservation () {
    if (!isFormValid.value || submitting.value) return
    submitting.value = true
    const baseId
      = RESERVATION_LIST.length > 0
        ? Math.max(...RESERVATION_LIST.map(r => r.id)) + 1
        : 1
    for (const [idx, item] of cart.value.entries()) {
      const resId = baseId + idx
      addReservation(
        new Reservation({
          id: resId,
          venueId: (() => {
            try {
              return JSON.parse(sessionStorage.getItem('spotly_booking') || '{}').venueId ?? null
            } catch {
              return null
            }
          })(),
          environmentId: item.envId,
          elementId: item.id,
          userId: (() => {
            try {
              return JSON.parse(localStorage.getItem('spotly_session') || '{}').userId || ''
            } catch {
              return ''
            }
          })(),
          name: form.value.name,
          email: form.value.email,
          phone: form.value.phone,
          date: item.date,
          time: item.time,
          guests: item.guests,
          notes: form.value.notes || item.notes,
          status: 'REQUESTED',
        }),
      )
      addReservationLog(
        new ReservationLog({
          id: Date.now() + idx,
          reservationId: resId,
          previousStatus: null,
          newStatus: 'REQUESTED',
          timestamp: new Date().toISOString(),
          actorRole: 'client',
        }),
      )
    }
    if (cart.value.length > 0) {
      sessionStorage.setItem('spotly_pending_reservation_id', String(baseId))
    }
    sessionStorage.removeItem('spotly_cart')
    router.push('/booking/awaiting')
  }
  function focusNotes () {
    const textarea = document.querySelector('textarea')
    if (textarea) textarea.focus()
  }
  const goToReservations = () => router.push('/client/dashboard')
</script>

<style scoped>
/* ═══ PAGE ═══ */
.confirm-page {
  padding-top: 32px;
  padding-bottom: 80px;
}

.nav-back-btn {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.78rem;
}

.back-btn {
  color: #d4af37;
  font-size: 0.85rem;
}

/* ═══ VENUE HEADER ═══ */
.venue-header {
  padding-bottom: 4px;
}

.venue-title {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: #f0ead6;
  letter-spacing: 0.02em;
  line-height: 1.2;
  margin: 0;
}

.venue-location {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: #8a8fa8;
  display: flex;
  align-items: center;
}

.page-subtitle {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 600;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-style: italic;
  margin: 0;
}

/* ═══ FORM SECTIONS ═══ */
.form-section {
  background: var(--color-surface-elevated) !important;
  border: 1px solid rgba(212, 175, 55, 0.18) !important;
  border-radius: 14px !important;
}

.section-header {
  display: flex;
  align-items: center;
}

.section-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #d4af37;
  color: #0a0e14;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 700;
  flex-shrink: 0;
}

.section-title {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: #f0ead6;
  letter-spacing: 0.02em;
}

.field-label {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
  color: #b8bcc8;
  letter-spacing: 0.02em;
}

.required-star {
  color: #c71585;
}

/* ═══ BOOKING SUMMARY ═══ */
.cart-item-separator {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(212, 175, 55, 0.08);
}

.summary-grid { width: 100%; }

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.summary-label {
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 500;
  color: #8a8fa8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.summary-label--gold { color: #d4af37; }

.summary-value {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: #f0ead6;
}

.summary-value--gold { color: #d4af37; }
.summary-value--muted { font-style: italic; color: #8a8fa8; }
.summary-value--dim { color: #6a7080; }

.summary-divider {
  border-color: rgba(212, 175, 55, 0.08) !important;
  margin: 8px 0 !important;
}

/* ═══ SIDEBAR ═══ */
.sidebar-card {
  background: var(--color-surface-elevated) !important;
  border: 1px solid rgba(212, 175, 55, 0.18) !important;
  border-radius: 14px !important;
}

.sticky-card {
  position: sticky;
  top: 84px;
}

.preview-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  flex-shrink: 0;
}

.preview-title {
  font-family: var(--font-heading);
  font-size: 1.2rem;
  font-weight: 600;
  color: #f0ead6;
  margin-bottom: 4px;
}

.preview-more {
  font-family: var(--font-body);
  font-size: 0.7rem;
  color: #d4af37;
  margin-left: 8px;
}

.preview-meta {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: #8a8fa8;
  margin-bottom: 6px;
}

.preview-datetime {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: #b8bcc8;
}

.preview-empty {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: #6a7080;
  text-align: center;
  padding: 12px 0;
}

.sidebar-divider {
  border-color: rgba(212, 175, 55, 0.12) !important;
}

/* ═══ POLICY ALERT ═══ */
.policy-alert {
  display: flex;
  align-items: flex-start;
  padding: 12px 14px;
  background: rgba(212, 175, 55, 0.06);
  border-left: 3px solid #d4af37;
  border-radius: 6px;
}

.policy-icon {
  color: #d4af37 !important;
  flex-shrink: 0;
}

.policy-text {
  font-family: var(--font-body);
  font-size: 0.75rem;
  line-height: 1.5;
  color: #b8bcc8;
}

/* ═══ INPUT DEEP OVERRIDES ═══ */
:deep(.spotly-input .v-field__outline) {
  display: none;
}

:deep(.spotly-input .v-field--variant-outlined .v-field__outline) {
  display: none;
}

:deep(.spotly-input .v-messages__message) {
  color: #c71585;
  font-size: 0.72rem;
  font-family: var(--font-body);
}

:deep(.v-counter) {
  color: #6a7080;
  font-size: 0.7rem;
  font-family: var(--font-body);
}

:deep(.spotly-input textarea.v-field__input) {
  min-height: 120px;
}

/* ═══ RESPONSIVE ═══ */
@media (max-width: 960px) {
  .sticky-card {
    position: static;
  }
}
</style>
