<template>
  <!-- ── App Bar ── -->
  <AppNavbarVenue
    venue-name="Sunset Beach Club"
    :show-powered-by="false"
    :show-default-actions="false"
  >
    <template #actions>
      <BookingStepIndicator
        :steps="[
          { label: 'Environment' },
          { label: 'Select Table' },
          { label: 'Confirm' },
        ]"
        :current-step="3"
      />
      <v-btn
        variant="text"
        :ripple="false"
        class="text-none px-4 ml-4"
        size="small"
        style="color: rgba(255, 255, 255, 0.55); font-size: 0.78rem"
        @click="goBack"
      >
        <v-icon size="14" class="mr-1">mdi-arrow-left</v-icon>Back
      </v-btn>
    </template>
  </AppNavbarVenue>

  <!-- ── Main Content ── -->
  <v-main class="spotly-main">
    <div class="spotly-container spotly-container--wide">
      <!-- Back Button -->
      <v-btn
        variant="text"
        :ripple="false"
        size="small"
        class="text-none mb-5"
        style="color: #d4af37; font-size: 0.85rem"
        @click="goBack"
      >
        <v-icon start size="18">mdi-chevron-left</v-icon>
        Back to Map
      </v-btn>

      <!-- Page Layout -->
      <v-row>
        <!-- LEFT COLUMN: Form -->
        <v-col cols="12" md="8">
          <!-- Venue Header -->
          <div class="mb-6">
            <h1 class="venue-title">Sunset Beach Club</h1>
            <div class="venue-location mt-1">
              <v-icon size="15" style="color: #6a7080">mdi-map-marker</v-icon>
              <span class="ml-1">Sidi Bou Said, Tunisia</span>
            </div>
          </div>

          <h2 class="page-subtitle mb-5">Complete your reservation</h2>

          <!-- SECTION 1: Your Details -->
          <v-card
            flat
            class="form-section mb-4"
            style="
              background: var(--color-surface-elevated);
              border: 1px solid rgba(212, 175, 55, 0.18);
              border-radius: 12px;
            "
          >
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-5">
                <div class="section-number">1</div>
                <span class="section-title ml-3">Your Details</span>
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <label class="field-label mb-2 d-block">
                    Name <span style="color: #c71585">*</span>
                  </label>
                  <v-text-field
                    v-model="form.name"
                    placeholder="Enter your full name"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    :rules="[(v) => !!v || 'Name is required']"
                    class="spotly-input"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <label class="field-label mb-2 d-block">
                    Email <span style="color: #c71585">*</span>
                  </label>
                  <v-text-field
                    v-model="form.email"
                    type="email"
                    placeholder="your.email@example.com"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    :rules="emailRules"
                    class="spotly-input"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <label class="field-label mb-2 d-block"> Phone Number </label>
                  <v-text-field
                    v-model="form.phone"
                    type="tel"
                    placeholder="+216 XX XXX XXX"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    class="spotly-input"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- SECTION 2: Booking Summary -->
          <v-card
            flat
            class="form-section mb-4"
            style="
              background: var(--color-surface-elevated);
              border: 1px solid rgba(212, 175, 55, 0.18);
              border-radius: 12px;
            "
          >
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-5">
                <div class="section-number">2</div>
                <span class="section-title ml-3">Booking Summary</span>
              </div>

              <!-- Cart items (from P5) -->
              <template v-if="cart.length > 0">
                <div
                  v-for="(item, idx) in cart"
                  :key="item.id"
                  :style="
                    idx > 0
                      ? 'margin-top:16px; padding-top:16px; border-top:1px solid rgba(212,175,55,0.08)'
                      : ''
                  "
                >
                  <div class="summary-row" style="margin-bottom: 6px">
                    <span class="summary-label" style="color: #d4af37"
                      >Table {{ idx + 1 }}</span
                    >
                    <span class="summary-value" style="color: #d4af37">{{
                      item.label
                    }}</span>
                  </div>
                  <div class="summary-grid">
                    <div class="summary-row">
                      <span class="summary-label">Area</span>
                      <span class="summary-value">{{ item.env }}</span>
                    </div>
                    <v-divider
                      style="
                        border-color: rgba(212, 175, 55, 0.08);
                        margin: 8px 0;
                      "
                    ></v-divider>
                    <div class="summary-row">
                      <span class="summary-label">Date</span>
                      <span class="summary-value">{{ item.date }}</span>
                    </div>
                    <v-divider
                      style="
                        border-color: rgba(212, 175, 55, 0.08);
                        margin: 8px 0;
                      "
                    ></v-divider>
                    <div class="summary-row">
                      <span class="summary-label">Time</span>
                      <span class="summary-value">{{ item.time }}</span>
                    </div>
                    <v-divider
                      style="
                        border-color: rgba(212, 175, 55, 0.08);
                        margin: 8px 0;
                      "
                    ></v-divider>
                    <div class="summary-row">
                      <span class="summary-label">Guests</span>
                      <span class="summary-value"
                        >{{ item.guests }} / {{ item.cap }} capacity</span
                      >
                    </div>
                    <template v-if="item.notes">
                      <v-divider
                        style="
                          border-color: rgba(212, 175, 55, 0.08);
                          margin: 8px 0;
                        "
                      ></v-divider>
                      <div class="summary-row">
                        <span class="summary-label">Notes</span>
                        <span
                          class="summary-value"
                          style="font-style: italic; color: #8a8fa8"
                          >{{ item.notes }}</span
                        >
                      </div>
                    </template>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="summary-row">
                  <span class="summary-label">Status</span>
                  <span class="summary-value" style="color: #6a7080"
                    >No tables selected</span
                  >
                </div>
              </template>
            </v-card-text>
          </v-card>

          <!-- SECTION 3: Special Request -->
          <v-card
            flat
            class="form-section mb-4"
            style="
              background: var(--color-surface-elevated);
              border: 1px solid rgba(212, 175, 55, 0.18);
              border-radius: 12px;
            "
          >
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-5">
                <div class="section-number">3</div>
                <span class="section-title ml-3">Special Guest Request</span>
              </div>

              <label class="field-label mb-2 d-block">Notes (Optional)</label>
              <v-textarea
                v-model="form.notes"
                placeholder="e.g., It's our anniversary. Please ensure the table is clean."
                variant="outlined"
                rows="5"
                no-resize
                counter="500"
                maxlength="500"
                hide-details="auto"
                class="spotly-input"
              ></v-textarea>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- RIGHT COLUMN: Sidebar -->
        <v-col cols="12" md="4">
          <v-card
            flat
            class="sidebar-card sticky-card"
            style="
              background: var(--color-surface-elevated);
              border: 1px solid rgba(212, 175, 55, 0.18);
              border-radius: 12px;
            "
          >
            <v-card-text class="pa-6">
              <!-- Reservation Preview -->
              <div class="preview-box mb-5">
                <template v-if="firstItem">
                  <div class="d-flex align-start">
                    <div class="preview-icon mr-4">🪑</div>
                    <div style="flex: 1">
                      <div class="preview-title">
                        {{ firstItem.label
                        }}<span
                          v-if="cart.length > 1"
                          style="
                            font-family: var(--font-body);
                            font-size: 0.7rem;
                            color: #d4af37;
                            margin-left: 8px;
                          "
                          >+{{ cart.length - 1 }} more</span
                        >
                      </div>
                      <div class="preview-meta">
                        {{ firstItem.env }} · {{ totalGuests }} guest{{
                          totalGuests !== 1 ? "s" : ""
                        }}
                      </div>
                      <div class="preview-datetime">
                        <div class="d-flex align-center mt-3">
                          <v-icon size="14" style="color: #6a7080"
                            >mdi-calendar-blank</v-icon
                          >
                          <span class="ml-2">{{ firstItem.date }}</span>
                        </div>
                        <div class="d-flex align-center mt-1">
                          <v-icon size="14" style="color: #6a7080"
                            >mdi-clock-outline</v-icon
                          >
                          <span class="ml-2">{{ firstItem.time }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div
                    style="
                      font-family: var(--font-body);
                      font-size: 0.8rem;
                      color: #6a7080;
                      text-align: center;
                      padding: 12px 0;
                    "
                  >
                    No tables added yet
                  </div>
                </template>
              </div>

              <v-divider
                style="border-color: rgba(212, 175, 55, 0.12); margin: 20px 0"
              ></v-divider>

              <!-- Policy Alert -->
              <div class="policy-alert mb-5">
                <v-icon size="18" style="color: #d4af37" class="mr-2"
                  >mdi-information-outline</v-icon
                >
                <div class="policy-text">
                  By confirming, you agree to our cancellation policy. Free
                  cancellation up to 24 hours before your reservation.
                </div>
              </div>

              <!-- Action Buttons -->
              <v-btn
                block
                flat
                size="large"
                :ripple="false"
                class="mb-3 gold-btn"
                :disabled="!isFormValid"
                @click="requestReservation"
              >
                Request Reservation
              </v-btn>

              <v-btn
                block
                variant="outlined"
                size="large"
                :ripple="false"
                class="secondary-btn"
                @click="focusNotes"
              >
                <v-icon start size="18">mdi-note-plus-outline</v-icon>
                Add Note
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-main>

  <!-- SUCCESS DIALOG -->
  <v-dialog
    v-model="showSuccess"
    max-width="520"
    persistent
    content-class="success-dialog"
  >
    <v-card
      flat
      style="
        background: var(--color-surface-elevated);
        border: 1px solid rgba(212, 175, 55, 0.18);
        border-radius: 16px;
      "
    >
      <v-card-text class="pa-8 text-center">
        <!-- Success Icon -->
        <div class="success-icon mb-4">
          <div class="success-circle">
            <v-icon size="52" style="color: #2ebb57"
              >mdi-check-circle-outline</v-icon
            >
          </div>
        </div>

        <h2 class="success-title mb-3">Reservation Requested!</h2>
        <p class="success-message mb-6">
          Your booking request has been submitted to
          <strong style="color: #d4af37">Sunset Beach Club</strong>. You'll
          receive a confirmation email at
          <strong style="color: #d4af37">{{ form.email }}</strong> within 24
          hours.
        </p>

        <!-- Status Badge -->
        <div class="status-badge mb-6">
          <v-icon size="16" class="mr-1">mdi-clock-outline</v-icon>
          REQUESTED
        </div>

        <v-btn
          block
          flat
          size="large"
          :ripple="false"
          class="mb-2 gold-btn"
          @click="goToReservations"
        >
          View My Reservations
        </v-btn>

        <v-btn
          block
          variant="outlined"
          size="large"
          :ripple="false"
          class="secondary-btn"
          @click="closeSuccess"
        >
          Close
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import AppNavbarVenue from "@/components/layout/AppNavbarVenue.vue";
import BookingStepIndicator from "@/components/ui/BookingStepIndicator.vue";

const router = useRouter();

// Read cart passed from P5 via sessionStorage
const cart = ref([]);
try {
  const raw = sessionStorage.getItem("spotly_cart");
  if (raw) cart.value = JSON.parse(raw);
} catch (_) {}

const firstItem = computed(() => cart.value[0] ?? null);
const totalGuests = computed(() =>
  cart.value.reduce((s, c) => s + c.guests, 0),
);

const form = ref({
  name: "",
  email: "",
  phone: "",
  notes: "",
});

const showSuccess = ref(false);

const emailRules = [
  (v) => !!v || "Email is required",
  (v) => /.+@.+\..+/.test(v) || "Email must be valid",
];

const isFormValid = computed(() => {
  return (
    form.value.name.trim() &&
    form.value.email.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)
  );
});

const goBack = () => router.push("/booking/seats");
const requestReservation = () => {
  if (!isFormValid.value) return;
  const payload = {
    guest: {
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
    },
    reservations: cart.value,
    globalNotes: form.value.notes,
    submittedAt: new Date().toISOString(),
  };
  console.log("Reservation payload:", JSON.stringify(payload, null, 2));
  sessionStorage.removeItem("spotly_cart");
  router.push("/booking/awaiting");
};
const focusNotes = () => {
  const textarea = document.querySelector("textarea");
  if (textarea) textarea.focus();
};
const closeSuccess = () => (showSuccess.value = false);
const goToReservations = () => router.push("/client/dashboard");
</script>

<style scoped>
/* ═══ TYPOGRAPHY (Design System) ═══ */

.step-label {
  font-family: var(--font-heading);
  font-size: 0.82rem;
  color: #d4af37;
  font-style: italic;
}

.step-title {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
  color: #f0ead6;
  text-transform: uppercase;
  letter-spacing: 0.08em;
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
}

/* ═══ FORM SECTIONS ═══ */
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

/* ═══ BOOKING SUMMARY ═══ */
.summary-grid {
  width: 100%;
}

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

.summary-value {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: #f0ead6;
}

/* ═══ SIDEBAR ═══ */
.sticky-card {
  position: sticky;
  top: 84px;
}

.preview-icon {
  font-size: 2.2rem;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.1);
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

.policy-alert {
  display: flex;
  align-items: flex-start;
  padding: 12px 14px;
  background: rgba(212, 175, 55, 0.06);
  border-left: 3px solid #d4af37;
  border-radius: 6px;
}

.policy-text {
  font-family: var(--font-body);
  font-size: 0.75rem;
  line-height: 1.5;
  color: #b8bcc8;
}

/* ═══ SUCCESS DIALOG ═══ */
.success-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: rgba(46, 187, 87, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.success-title {
  font-family: var(--font-heading);
  font-size: 1.65rem;
  font-weight: 700;
  color: #f0ead6;
}

.success-message {
  font-family: var(--font-body);
  font-size: 0.9rem;
  line-height: 1.6;
  color: #b8bcc8;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 18px;
  background: rgba(199, 21, 133, 0.15);
  border: 1px solid #c71585;
  border-radius: 24px;
  color: #c71585;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Input deep overrides handled by global .spotly-input */
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

/* Textarea specific */
:deep(.spotly-input textarea.v-field__input) {
  min-height: 120px;
}
</style>
