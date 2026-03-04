<template>
  <div class="page-root">
    <!-- ── Ambient Background ── -->
    <div class="ambient-bg">
      <div class="ambient-orb orb--gold" />
      <div class="ambient-orb orb--rose" />
      <div class="ambient-orb orb--mid" />
    </div>

    <!-- ── App Bar ── -->
    <AppNavbarVenue
      venue-name="Sunset Beach Club"
      venue-sub-label="Awaiting Decision"
      :show-powered-by="false"
      :show-default-actions="false"
    >
      <template #actions>
        <v-btn
          variant="outlined"
          :ripple="false"
          size="small"
          class="text-none secondary-btn"
          @click="router.push('/client/dashboard')"
        >
          My Reservations
        </v-btn>
      </template>
    </AppNavbarVenue>

    <!-- ── Main ── -->
    <v-main style="position: relative; z-index: 2">
      <div class="page-wrap">
        <!-- ══ PENDING STATE ══ -->
        <div v-if="status === 'pending'" class="two-col-layout">
          <!-- ── LEFT: Animated status ── -->
          <div class="col-left">
            <!-- Venue Badge -->
            <div class="venue-badge mb-8">
              <v-icon size="15" color="#D4AF37" class="mr-1"
                >mdi-map-marker</v-icon
              >
              <span>Sunset Beach Club · Sidi Bou Said</span>
            </div>

            <!-- Pulsing Ring -->
            <div class="pulse-ring-wrap mb-8">
              <div class="pulse-ring pulse-ring--3" />
              <div class="pulse-ring pulse-ring--2" />
              <div class="pulse-ring pulse-ring--1" />
              <div class="pulse-center">
                <v-icon size="28" color="#D4AF37">mdi-clock-outline</v-icon>
              </div>
            </div>

            <!-- Heading -->
            <h1 class="await-title mb-3">Your request is with us</h1>
            <p class="await-sub mb-10">
              Our team is personally reviewing your reservation.<br />
              You will be notified the moment a decision is made.
            </p>

            <!-- Timeline -->
            <div class="timeline mb-8">
              <!-- Step 1: Submitted -->
              <div class="tl-step tl-step--done">
                <div class="tl-icon-wrap">
                  <div class="tl-icon tl-icon--done">
                    <v-icon size="16" color="#0A0E14">mdi-check</v-icon>
                  </div>
                </div>
                <div class="tl-body">
                  <div class="tl-label">Submitted</div>
                  <div class="tl-meta">{{ submittedAt }}</div>
                </div>
              </div>

              <div class="tl-connector tl-connector--done" />

              <!-- Step 2: Under Review -->
              <div class="tl-step tl-step--active">
                <div class="tl-icon-wrap">
                  <div class="tl-icon tl-icon--active">
                    <div class="tl-spinner" />
                  </div>
                </div>
                <div class="tl-body">
                  <div class="tl-label">Under Review</div>
                  <div class="tl-meta">
                    The venue team is reviewing your details
                  </div>
                </div>
              </div>

              <div class="tl-connector tl-connector--pending" />

              <!-- Step 3: Decision -->
              <div class="tl-step tl-step--pending">
                <div class="tl-icon-wrap">
                  <div class="tl-icon tl-icon--pending">
                    <v-icon size="14" color="#4a5568"
                      >mdi-dots-horizontal</v-icon
                    >
                  </div>
                </div>
                <div class="tl-body">
                  <div class="tl-label tl-label--muted">Decision</div>
                  <div class="tl-meta">Awaiting confirmation</div>
                </div>
              </div>
            </div>

            <!-- Live indicator -->
            <div class="live-indicator">
              <span class="live-dot" />
              <span>Listening for updates in real time</span>
            </div>
          </div>

          <!-- ── RIGHT: Summary & controls ── -->
          <div class="col-right">
            <!-- Reservation Summary Card -->
            <div class="summary-card mb-6">
              <div class="summary-card-header">
                <span class="summary-card-title">Reservation Summary</span>
                <span class="summary-ref">Ref #SPT-{{ reservationId }}</span>
              </div>
              <div class="summary-card-body">
                <div class="summary-row-item">
                  <div class="summary-row-icon">
                    <v-icon size="15" color="#D4AF37">mdi-store</v-icon>
                  </div>
                  <div>
                    <div class="summary-row-label">Venue</div>
                    <div class="summary-row-value">Sunset Beach Club</div>
                  </div>
                </div>
                <div class="summary-row-item">
                  <div class="summary-row-icon">
                    <v-icon size="15" color="#D4AF37"
                      >mdi-map-marker-outline</v-icon
                    >
                  </div>
                  <div>
                    <div class="summary-row-label">Environment</div>
                    <div class="summary-row-value">{{ reservationEnv }}</div>
                  </div>
                </div>
                <div class="summary-row-item">
                  <div class="summary-row-icon">
                    <v-icon size="15" color="#D4AF37">mdi-seat</v-icon>
                  </div>
                  <div>
                    <div class="summary-row-label">Table</div>
                    <div class="summary-row-value">{{ reservationTable }}</div>
                  </div>
                </div>
                <div class="summary-row-item">
                  <div class="summary-row-icon">
                    <v-icon size="15" color="#D4AF37">mdi-calendar</v-icon>
                  </div>
                  <div>
                    <div class="summary-row-label">Date</div>
                    <div class="summary-row-value">{{ reservationDate }}</div>
                  </div>
                </div>
                <div class="summary-row-item">
                  <div class="summary-row-icon">
                    <v-icon size="15" color="#D4AF37">mdi-clock-outline</v-icon>
                  </div>
                  <div>
                    <div class="summary-row-label">Time</div>
                    <div class="summary-row-value">{{ reservationTime }}</div>
                  </div>
                </div>
                <div class="summary-row-item">
                  <div class="summary-row-icon">
                    <v-icon size="15" color="#D4AF37">mdi-account-group</v-icon>
                  </div>
                  <div>
                    <div class="summary-row-label">Guests</div>
                    <div class="summary-row-value">
                      {{ reservationGuests }} people
                    </div>
                  </div>
                </div>
                <div class="summary-row-item">
                  <div class="summary-row-icon">
                    <v-icon size="15" color="#D4AF37">mdi-account</v-icon>
                  </div>
                  <div>
                    <div class="summary-row-label">Name</div>
                    <div class="summary-row-value">{{ guestName }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Leave notice -->
            <div class="leave-notice mb-6">
              <v-icon size="17" color="#D4AF37" class="leave-notice-icon"
                >mdi-shield-check-outline</v-icon
              >
              <div>
                <div class="leave-notice-title">
                  You can safely leave this page
                </div>
                <div class="leave-notice-sub">
                  Your request is saved. Track its status any time from your
                  <span
                    class="leave-notice-link"
                    @click="router.push('/client/dashboard')"
                    >Client Dashboard</span
                  >.
                </div>
              </div>
            </div>

            <!-- Demo controls -->
            <div class="demo-controls">
              <div class="demo-label mb-3">— Demo Controls —</div>
              <div class="d-flex gap-3">
                <v-btn
                  flat
                  size="small"
                  class="gold-btn flex-1"
                  @click="simulateDecision('approved')"
                >
                  <v-icon start size="14">mdi-check-circle</v-icon>
                  Simulate Approval
                </v-btn>
                <v-btn
                  flat
                  size="small"
                  class="reject-button flex-1"
                  @click="simulateDecision('rejected')"
                >
                  <v-icon start size="14">mdi-close-circle</v-icon>
                  Simulate Rejection
                </v-btn>
              </div>
            </div>
          </div>
        </div>

        <!-- ══ APPROVED STATE ══ -->
        <Transition name="state-fade">
          <div
            v-if="status === 'approved'"
            class="two-col-layout two-col-layout--decision"
          >
            <!-- LEFT -->
            <div class="col-left">
              <!-- Gold burst rings -->
              <div class="burst-wrap mb-8">
                <div class="burst-ring burst-ring--3" />
                <div class="burst-ring burst-ring--2" />
                <div class="burst-ring burst-ring--1" />
                <div class="burst-center">
                  <v-icon size="32" color="#0A0E14">mdi-check</v-icon>
                </div>
              </div>

              <div class="approved-tag mb-4">
                <v-icon size="13" class="mr-1">mdi-star</v-icon>
                CONFIRMED
              </div>

              <h1 class="approved-title mb-4">Your evening<br />is reserved</h1>
              <p class="approved-sub mb-6">
                Welcome to Sunset Beach Club.<br />
                We look forward to hosting you.
              </p>
              <p class="approved-sub" style="font-size: 0.82rem">
                A confirmation was sent to<br />
                <strong style="color: #d4af37">{{ guestEmail }}</strong>
              </p>
            </div>

            <!-- RIGHT -->
            <div class="col-right">
              <!-- Keepsake Card -->
              <div class="keepsake-card mb-6">
                <div class="keepsake-header">
                  <span class="keepsake-venue">Sunset Beach Club</span>
                  <div class="keepsake-divider-h" />
                  <span class="keepsake-env">{{ reservationEnv }}</span>
                </div>
                <div class="keepsake-body">
                  <div class="keepsake-row">
                    <span class="keepsake-label">Date</span>
                    <span class="keepsake-value">{{ reservationDate }}</span>
                  </div>
                  <div class="keepsake-row">
                    <span class="keepsake-label">Time</span>
                    <span class="keepsake-value">{{ reservationTime }}</span>
                  </div>
                  <div class="keepsake-row">
                    <span class="keepsake-label">Guests</span>
                    <span class="keepsake-value">{{ reservationGuests }}</span>
                  </div>
                  <div class="keepsake-row">
                    <span class="keepsake-label">Table</span>
                    <span class="keepsake-value">{{ reservationTable }}</span>
                  </div>
                  <div class="keepsake-row">
                    <span class="keepsake-label">Guest</span>
                    <span class="keepsake-value">{{ guestName }}</span>
                  </div>
                </div>
                <div class="keepsake-footer">
                  <span class="keepsake-id">Ref #SPT-{{ reservationId }}</span>
                  <div class="keepsake-logo">Spotly</div>
                </div>
              </div>

              <v-btn
                flat
                size="large"
                block
                class="gold-btn"
                @click="router.push('/client/dashboard')"
              >
                View My Dashboard
                <v-icon end size="16">mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </div>
        </Transition>

        <!-- ══ REJECTED STATE ══ -->
        <Transition name="state-fade">
          <div
            v-if="status === 'rejected'"
            class="two-col-layout two-col-layout--decision"
          >
            <!-- LEFT -->
            <div class="col-left">
              <div class="decline-wrap mb-8">
                <div class="decline-ring" />
                <div class="decline-center">
                  <v-icon size="28" color="#C71585">mdi-close</v-icon>
                </div>
              </div>

              <div class="rejected-tag mb-4">
                <v-icon size="13" class="mr-1">mdi-information-outline</v-icon>
                NOT AVAILABLE
              </div>

              <h1 class="rejected-title mb-4">
                This slot isn't<br />available
              </h1>
              <p class="rejected-sub">
                We weren't able to accommodate your request for this time slot.
                We'd love to find you another perfect evening.
              </p>
            </div>

            <!-- RIGHT -->
            <div class="col-right">
              <div class="decline-card mb-6">
                <v-icon size="22" color="#D4AF37" class="mb-3"
                  >mdi-calendar-search</v-icon
                >
                <p class="decline-suggestion">
                  Try a different date, time, or environment — our team will do
                  their best to accommodate you.
                </p>
              </div>

              <!-- Leave notice (also shown on rejection) -->
              <div class="leave-notice mb-6">
                <v-icon size="17" color="#D4AF37" class="leave-notice-icon"
                  >mdi-history</v-icon
                >
                <div>
                  <div class="leave-notice-title">Your history is saved</div>
                  <div class="leave-notice-sub">
                    This request is logged in your
                    <span
                      class="leave-notice-link"
                      @click="router.push('/client/dashboard')"
                      >Client Dashboard</span
                    >
                    for your records.
                  </div>
                </div>
              </div>

              <div class="d-flex gap-3">
                <v-btn
                  flat
                  size="large"
                  class="gold-btn flex-1"
                  @click="router.push('/booking/environment')"
                >
                  <v-icon start size="16">mdi-refresh</v-icon>
                  Book Again
                </v-btn>
                <v-btn
                  variant="outlined"
                  size="large"
                  class="secondary-btn flex-1"
                  @click="router.push('/client/dashboard')"
                >
                  My Dashboard
                </v-btn>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </v-main>
  </div>
</template>

<script setup>
// P19 — Reservation Awaiting Screen
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import AppNavbarVenue from "@/components/layout/AppNavbarVenue.vue";

const router = useRouter();

// ─── Reservation data (read from sessionStorage, set by P6) ──────────────────
const reservationId = ref("10482");
const reservationDate = ref("Sep 14, 2026");
const reservationTime = ref("19:00");
const reservationGuests = ref(2);
const reservationTable = ref("Table A1");
const reservationEnv = ref("Beachfront Terrace");
const guestName = ref("John Doe");
const guestEmail = ref("john@example.com");
const submittedAt = ref("");

onMounted(() => {
  // Set submitted timestamp
  submittedAt.value = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Read cart from sessionStorage if available (passed from P6)
  try {
    const raw = sessionStorage.getItem("spotly_cart");
    if (raw) {
      const cart = JSON.parse(raw);
      const first = cart[0];
      if (first) {
        reservationTable.value = first.tableName ?? reservationTable.value;
        reservationDate.value = first.date ?? reservationDate.value;
        reservationTime.value = first.time ?? reservationTime.value;
        reservationGuests.value = first.guests ?? reservationGuests.value;
        reservationEnv.value = first.environment ?? reservationEnv.value;
      }
    }
    const guestRaw = sessionStorage.getItem("spotly_guest");
    if (guestRaw) {
      const guest = JSON.parse(guestRaw);
      guestName.value = guest.name ?? guestName.value;
      guestEmail.value = guest.email ?? guestEmail.value;
    }
  } catch (_) {}

  // Listen for cross-tab admin decision via storage event
  window.addEventListener("storage", onStorageEvent);
});

onUnmounted(() => {
  window.removeEventListener("storage", onStorageEvent);
});

// ─── Status state machine ─────────────────────────────────────────────────────
// pending → approved | rejected
const status = ref("pending");

// Listen for admin decision from another tab via LocalStorage
const onStorageEvent = (e) => {
  if (e.key !== "spotly_reservation_decision") return;
  try {
    const payload = JSON.parse(e.newValue);
    if (payload?.id === reservationId.value || payload?.latest) {
      applyDecision(payload.decision);
    }
  } catch (_) {}
};

const applyDecision = (decision) => {
  if (decision === "approved" || decision === "rejected") {
    status.value = decision;
  }
};

// ─── Demo: simulate admin decision from this tab ──────────────────────────────
const simulateDecision = (decision) => {
  // Write to LocalStorage to also trigger storage event in any other open tab
  localStorage.setItem(
    "spotly_reservation_decision",
    JSON.stringify({
      id: reservationId.value,
      decision,
      latest: true,
      decidedAt: new Date().toISOString(),
    }),
  );
  // Apply immediately in this tab (storage event doesn't fire for same tab)
  applyDecision(decision);
};
</script>

<style scoped>
/* ═══ AMBIENT BACKGROUND ═══ */
.ambient-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.ambient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.18;
}

.orb--gold {
  width: 600px;
  height: 600px;
  background: #d4af37;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  animation: orbDrift 8s ease-in-out infinite alternate;
}

.orb--rose {
  width: 400px;
  height: 400px;
  background: #c71585;
  bottom: -100px;
  right: -100px;
  animation: orbDrift 11s ease-in-out infinite alternate-reverse;
}

.orb--mid {
  width: 300px;
  height: 300px;
  background: #1a3a5c;
  bottom: 100px;
  left: -80px;
  animation: orbDrift 9s ease-in-out infinite alternate;
}

@keyframes orbDrift {
  from {
    transform: translateX(-50%) translateY(0px) scale(1);
  }
  to {
    transform: translateX(-50%) translateY(30px) scale(1.08);
  }
}

/* ═══ TYPOGRAPHY ═══ */
.step-label {
  font-family: var(--font-heading);
  font-size: 0.82rem;
  color: #d4af37;
  font-style: italic;
}

.step-title {
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 500;
  color: #f0ead6;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ═══ PAGE LAYOUT ═══ */
.page-wrap {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
}

/* Two-column desktop layout */
.two-col-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  max-width: 1100px;
  width: 100%;
  animation: panelIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Narrower columns for decision states (approved/rejected) */
.two-col-layout--decision {
  grid-template-columns: 5fr 6fr;
  gap: 72px;
  align-items: center;
}

/* Collapse to single column on small screens */
@media (max-width: 768px) {
  .two-col-layout {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 0;
  }
  .page-wrap {
    padding: 32px 20px;
    align-items: flex-start;
  }
}

.col-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.col-right {
  display: flex;
  flex-direction: column;
}

@keyframes panelIn {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ═══ VENUE BADGE ═══ */
.venue-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 20px;
  font-family: var(--font-body);
  font-size: 0.78rem;
  color: #b8bcc8;
  letter-spacing: 0.03em;
}

/* ═══ PULSING RING (PENDING) ═══ */
.pulse-ring-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid #d4af37;
  animation: pulseRing 2.4s ease-out infinite;
}

.pulse-ring--1 {
  width: 72px;
  height: 72px;
  animation-delay: 0s;
}
.pulse-ring--2 {
  width: 96px;
  height: 96px;
  animation-delay: 0.4s;
  opacity: 0.6;
}
.pulse-ring--3 {
  width: 120px;
  height: 120px;
  animation-delay: 0.8s;
  opacity: 0.3;
}

@keyframes pulseRing {
  0% {
    transform: scale(0.85);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.1);
    opacity: 0;
  }
}

.pulse-center {
  position: relative;
  z-index: 2;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.12);
  border: 1.5px solid rgba(212, 175, 55, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ═══ HEADINGS ═══ */
.await-title {
  font-family: var(--font-heading);
  font-size: 2.4rem;
  font-weight: 700;
  color: #f0ead6;
  letter-spacing: 0.01em;
  line-height: 1.15;
}

.await-sub {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: #8a8fa8;
  line-height: 1.7;
}

/* ═══ TIMELINE ═══ */
.timeline {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.tl-step {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: 100%;
}

.tl-icon-wrap {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tl-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tl-icon--done {
  background: #2ebb57;
  border: none;
}

.tl-icon--active {
  background: rgba(212, 175, 55, 0.12);
  border: 1.5px solid #d4af37;
}

.tl-icon--pending {
  background: rgba(74, 85, 104, 0.15);
  border: 1.5px solid rgba(74, 85, 104, 0.35);
}

.tl-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(212, 175, 55, 0.25);
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.tl-connector {
  width: 2px;
  height: 28px;
  margin-left: 18px;
  margin-top: 2px;
  margin-bottom: 2px;
}

.tl-connector--done {
  background: #2ebb57;
}
.tl-connector--pending {
  background: rgba(74, 85, 104, 0.3);
}

.tl-body {
  padding-top: 8px;
  padding-bottom: 4px;
}

.tl-label {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: #f0ead6;
  letter-spacing: 0.02em;
}

.tl-label--muted {
  color: #4a5568;
}

.tl-meta {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: #6a7080;
  margin-top: 2px;
}

/* ═══ SUMMARY CARD ═══ */
.summary-card {
  background: #13181f;
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 14px;
  overflow: hidden;
}

.summary-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: rgba(212, 175, 55, 0.06);
  border-bottom: 1px solid rgba(212, 175, 55, 0.12);
}

.summary-card-title {
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 600;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.summary-ref {
  font-family: var(--font-body);
  font-size: 0.7rem;
  color: #4a5568;
  letter-spacing: 0.06em;
}

.summary-card-body {
  padding: 8px 0;
}

.summary-row-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.summary-row-item:last-child {
  border-bottom: none;
}

.summary-row-icon {
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-row-label {
  font-family: var(--font-body);
  font-size: 0.7rem;
  color: #6a7080;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 1px;
}

.summary-row-value {
  font-family: var(--font-body);
  font-size: 0.88rem;
  font-weight: 600;
  color: #f0ead6;
}

/* ═══ LEAVE NOTICE ═══ */
.leave-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-left: 3px solid #d4af37;
  border-radius: 8px;
}

.leave-notice-icon {
  margin-top: 1px;
  flex-shrink: 0;
}

.leave-notice-title {
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 600;
  color: #f0ead6;
  margin-bottom: 3px;
}

.leave-notice-sub {
  font-family: var(--font-body);
  font-size: 0.78rem;
  color: #8a8fa8;
  line-height: 1.5;
}

.leave-notice-link {
  color: #d4af37;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.leave-notice-link:hover {
  color: #f0ead6;
}

/* keep flex-1 utility */
.flex-1 {
  flex: 1;
}

/* ═══ LIVE INDICATOR ═══ */
.live-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: #6a7080;
  letter-spacing: 0.04em;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2ebb57;
  box-shadow: 0 0 0 0 rgba(46, 187, 87, 0.6);
  animation: livePulse 1.6s ease-in-out infinite;
}

@keyframes livePulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(46, 187, 87, 0.6);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(46, 187, 87, 0);
  }
}

/* ═══ DEMO CONTROLS ═══ */
.demo-controls {
  width: 100%;
  padding: 16px 20px;
  background: rgba(19, 24, 31, 0.6);
  border: 1px dashed rgba(212, 175, 55, 0.18);
  border-radius: 10px;
  margin-top: auto;
}

.demo-label {
  font-family: var(--font-body);
  font-size: 0.7rem;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center;
}

/* ═══ APPROVED STATE ═══ */
.burst-wrap {
  position: relative;
  width: 130px;
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.burst-ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid #d4af37;
}

.burst-ring--1 {
  width: 70px;
  height: 70px;
  opacity: 0.9;
  animation: burstPop 0.5s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.burst-ring--2 {
  width: 98px;
  height: 98px;
  opacity: 0.5;
  animation: burstPop 0.5s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.burst-ring--3 {
  width: 130px;
  height: 130px;
  opacity: 0.2;
  animation: burstPop 0.5s 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes burstPop {
  from {
    transform: scale(0.3);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: inherit;
  }
}

.burst-center {
  position: relative;
  z-index: 2;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #d4af37;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: burstPop 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  box-shadow: 0 0 40px rgba(212, 175, 55, 0.5);
}

.approved-tag {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.5);
  border-radius: 20px;
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 700;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.approved-title {
  font-family: var(--font-heading);
  font-size: 2.4rem;
  font-weight: 700;
  color: #f0ead6;
  line-height: 1.15;
}

.approved-sub {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: #8a8fa8;
  line-height: 1.7;
}

/* ═══ KEEPSAKE CARD ═══ */
.keepsake-card {
  width: 100%;
  background: linear-gradient(135deg, #13181f 0%, #1a2230 100%);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(212, 175, 55, 0.1);
  animation: cardReveal 0.7s 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes cardReveal {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.keepsake-header {
  background: linear-gradient(
    90deg,
    rgba(212, 175, 55, 0.18) 0%,
    rgba(212, 175, 55, 0.06) 100%
  );
  border-bottom: 1px solid rgba(212, 175, 55, 0.18);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.keepsake-venue {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 700;
  color: #d4af37;
}

.keepsake-divider-h {
  flex: 1;
  height: 1px;
  background: rgba(212, 175, 55, 0.25);
}

.keepsake-env {
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: #8a8fa8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.keepsake-body {
  padding: 20px 24px;
}

.keepsake-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.keepsake-row:last-child {
  border-bottom: none;
}

.keepsake-label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: #6a7080;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.keepsake-value {
  font-family: var(--font-body);
  font-size: 0.88rem;
  font-weight: 600;
  color: #f0ead6;
}

.keepsake-footer {
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(212, 175, 55, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.keepsake-id {
  font-family: var(--font-body);
  font-size: 0.7rem;
  color: #4a5568;
  letter-spacing: 0.08em;
}

.keepsake-logo {
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(212, 175, 55, 0.5);
}

/* ═══ REJECTED STATE ═══ */
.decline-wrap {
  position: relative;
  width: 110px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.decline-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid rgba(199, 21, 133, 0.4);
  animation: burstPop 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.decline-center {
  position: relative;
  z-index: 2;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(199, 21, 133, 0.1);
  border: 1.5px solid rgba(199, 21, 133, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: burstPop 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.rejected-tag {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  background: rgba(199, 21, 133, 0.1);
  border: 1px solid rgba(199, 21, 133, 0.4);
  border-radius: 20px;
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 700;
  color: #c71585;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.rejected-title {
  font-family: var(--font-heading);
  font-size: 2.2rem;
  font-weight: 700;
  color: #f0ead6;
  line-height: 1.2;
}

.rejected-sub {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: #8a8fa8;
  line-height: 1.7;
}

.decline-card {
  padding: 20px 24px;
  background: rgba(19, 24, 31, 0.8);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-left: 3px solid #d4af37;
  border-radius: 10px;
  max-width: 400px;
}

.decline-suggestion {
  font-family: var(--font-body);
  font-size: 0.88rem;
  color: #b8bcc8;
  line-height: 1.6;
  margin: 0;
}

/* ═══ BUTTONS ═══ */
/* .gold-btn and .secondary-btn are global — see settings.scss */

.reject-button {
  background: rgba(199, 21, 133, 0.15) !important;
  color: #c71585 !important;
  border: 1px solid rgba(199, 21, 133, 0.35) !important;
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.04em;
}

.reject-button:hover {
  background: rgba(199, 21, 133, 0.25) !important;
}

/* ═══ STATE TRANSITIONS ═══ */
.state-fade-enter-active {
  animation: panelIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.state-fade-leave-active {
  animation: panelOut 0.3s ease both;
}

@keyframes panelOut {
  to {
    opacity: 0;
    transform: translateY(-12px) scale(0.98);
  }
}
</style>
