<template>
  <!-- ── Top Navigation Bar ── -->
  <AppNavbarVenue
    venue-name="Sunset Beach Club"
    venue-sub-label="My Dashboard"
    :show-powered-by="true"
    :show-default-actions="false"
    @logout="logout"
  >
    <template #actions>
      <v-btn variant="text" class="logout-btn" size="small" @click="logout">
        <v-icon start size="14">mdi-logout</v-icon>
        Logout
      </v-btn>
    </template>
  </AppNavbarVenue>

  <!-- ── Main Content ── -->
  <v-main class="spotly-main">
    <div class="spotly-container">
      <!-- Welcome Banner -->
      <div class="welcome-banner mb-8">
        <div class="welcome-glow" />
        <div class="welcome-content">
          <div class="welcome-greeting">Welcome back, {{ sessionName }}!</div>
          <div class="welcome-sub">
            Here's a glance at your reservations at Sunset Beach Club.
          </div>
        </div>
        <div class="welcome-avatar">
          <div class="avatar-ring">{{ sessionName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() }}</div>
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="dashboard-grid">
        <!-- ── LEFT: Upcoming Reservations ── -->
        <div class="section">
          <SectionHeader
            title="Upcoming Reservations"
            icon="mdi-calendar-clock"
            :count="upcoming.length"
            class="mb-5"
          />

          <div v-if="upcoming.length === 0" class="empty-card">
            <v-icon size="40" color="#D4AF37" class="mb-3"
              >mdi-calendar-blank</v-icon
            >
            <div>No upcoming reservations</div>
            <v-btn class="book-btn mt-4" size="small" @click="bookDialog = true"
              >Book a Table</v-btn
            >
          </div>

          <div
            v-for="(res, i) in upcoming"
            :key="res.id"
            class="reservation-card mb-4"
            :style="{ animationDelay: `${i * 80}ms` }"
          >
            <!-- Status indicator strip -->
            <div
              class="card-strip"
              :class="`strip--${res.status === 'REQUESTED' ? 'pending' : res.status.toLowerCase()}`"
            />

            <div class="card-body">
              <!-- Date/Time row -->
              <div
                class="card-top d-flex align-start justify-space-between mb-3"
              >
                <div>
                  <div class="res-date">{{ res.date }}</div>
                  <div class="res-time">
                    <v-icon size="12" class="mr-1" color="#D4AF37"
                      >mdi-clock-outline</v-icon
                    >
                    {{ res.time }}
                  </div>
                </div>
                <ReservationStatusChip :status="res.status" />
              </div>

              <!-- Details -->
              <div class="res-details">
                <div class="detail-row">
                  <v-icon size="13" color="#6b7a8d"
                    >mdi-map-marker-outline</v-icon
                  >
                  <span class="detail-label">Area</span>
                  <span class="detail-value">{{ res.area }}</span>
                </div>
                <div class="detail-row">
                  <v-icon size="13" color="#6b7a8d">mdi-table-furniture</v-icon>
                  <span class="detail-label">Table</span>
                  <span class="detail-value">{{ res.table }}</span>
                </div>
                <div class="detail-row">
                  <v-icon size="13" color="#6b7a8d"
                    >mdi-account-group-outline</v-icon
                  >
                  <span class="detail-label">Guests</span>
                  <span class="detail-value">{{ res.guests }}</span>
                </div>
              </div>

              <!-- Notes -->
              <div v-if="res.notes" class="res-notes mt-3">
                <v-icon size="12" color="#D4AF37" class="mr-1"
                  >mdi-note-text-outline</v-icon
                >
                {{ res.notes }}
              </div>

              <!-- Cancel -->
              <div class="card-actions mt-4">
                <v-btn
                  variant="outlined"
                  size="small"
                  class="cancel-btn"
                  :disabled="['CANCELLED', 'REJECTED', 'NO_SHOW', 'COMPLETED', 'CHECKED_IN'].includes(res.status)"
                  @click="
                    cancelDialog = true;
                    selectedRes = res;
                  "
                >
                  <v-icon start size="13">mdi-close-circle-outline</v-icon>
                  Cancel Reservation
                </v-btn>
              </div>
            </div>
          </div>
        </div>

        <!-- ── RIGHT: Past Visits ── -->
        <div class="section">
          <SectionHeader
            title="Past Visits"
            icon="mdi-history"
            :count="pastVisits.length"
            class="mb-5"
          />

          <div class="past-list">
            <div
              v-for="(visit, i) in pastVisits"
              :key="i"
              class="past-item"
              :style="{ animationDelay: `${i * 60}ms` }"
            >
              <div class="past-left">
                <div class="past-date-badge">
                  <span class="badge-day">{{ visit.day }}</span>
                  <span class="badge-month">{{ visit.month }}</span>
                </div>
              </div>
              <div class="past-mid">
                <div class="past-area">{{ visit.area }}</div>
                <div class="past-meta">
                  Table {{ visit.table }} · {{ visit.guests }} guests
                </div>
              </div>
              <div class="past-right">
                <v-chip class="completed-chip" size="x-small">
                  <v-icon start size="10">mdi-check-circle</v-icon>
                  Completed
                </v-chip>
              </div>
            </div>
          </div>

          <!-- Loyalty Card -->
          <div class="loyalty-card mt-6">
            <div class="loyalty-bg" />
            <div class="loyalty-content">
              <div class="loyalty-title">
                <v-icon color="#D4AF37" size="18" class="mr-2"
                  >mdi-star-four-points</v-icon
                >
                Guest Status
              </div>
              <div class="loyalty-tier">Gold Member</div>
              <div class="loyalty-visits">
                {{ pastVisits.length }} visits completed
              </div>
              <v-progress-linear
                :model-value="(pastVisits.length / 10) * 100"
                color="#D4AF37"
                bg-color="rgba(212,175,55,0.18)"
                rounded
                height="4"
                class="mt-3"
              />
              <div class="loyalty-next mt-1">
                {{ 10 - pastVisits.length }} more visits to Platinum
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-main>

  <!-- ── Cancel Confirmation Dialog ── -->
  <v-dialog v-model="cancelDialog" max-width="420" class="spotly-dialog">
    <v-card class="dialog-card">
      <div class="dialog-strip" />
      <v-card-title class="dialog-title pt-6 px-6"
        >Cancel Reservation?</v-card-title
      >
      <v-card-text class="px-6 pb-2">
        <p class="dialog-body">
          Are you sure you want to cancel your reservation at
          <strong>{{ selectedRes?.area }}</strong> on
          <strong>{{ selectedRes?.date }}</strong> at
          <strong>{{ selectedRes?.time }}</strong
          >?
        </p>
        <p class="dialog-note mt-2">This action cannot be undone.</p>
      </v-card-text>
      <v-card-actions class="px-6 pb-6 ga-3">
        <v-btn variant="text" class="keep-btn" @click="cancelDialog = false"
          >Keep it</v-btn
        >
        <v-spacer />
        <v-btn class="confirm-cancel-btn" @click="confirmCancel"
          >Yes, Cancel</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ── Book Table Dialog ── -->
  <v-dialog v-model="bookDialog" max-width="460" class="spotly-dialog">
    <v-card class="dialog-card">
      <div class="dialog-strip" />
      <v-card-title class="dialog-title pt-6 px-6"
        >New Reservation</v-card-title
      >
      <v-card-text class="px-6">
        <v-row dense class="mt-2">
          <v-col cols="6">
            <v-text-field
              v-model="newRes.date"
              label="Date"
              type="date"
              variant="outlined"
              density="compact"
              class="spotly-input"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="newRes.time"
              label="Time"
              type="time"
              variant="outlined"
              density="compact"
              class="spotly-input"
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="newRes.area"
              :items="areas"
              label="Area"
              variant="outlined"
              density="compact"
              class="spotly-input"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="newRes.guests"
              label="Guests"
              type="number"
              min="1"
              max="20"
              variant="outlined"
              density="compact"
              class="spotly-input"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="newRes.notes"
              label="Special Notes (optional)"
              variant="outlined"
              density="compact"
              class="spotly-input"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="px-6 pb-6 ga-3">
        <v-btn variant="text" class="keep-btn" @click="bookDialog = false"
          >Cancel</v-btn
        >
        <v-spacer />
        <v-btn class="book-btn" @click="submitBooking">Request Booking</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Snackbar -->
  <SpotlySnackbar :snackbar="snackbar" />
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useSnackbar } from "@/composables/useSnackbar";
import { useAuth } from "@/composables/useAuth";
import AppNavbarVenue from "@/components/layout/AppNavbarVenue.vue";
import SectionHeader from "@/components/ui/SectionHeader.vue";
import ReservationStatusChip from "@/components/feedback/ReservationStatusChip.vue";
import SpotlySnackbar from "@/components/feedback/SpotlySnackbar.vue";
import { RESERVATION_LIST, Reservation, addReservation, updateReservationStatus } from "@/datamodel/Reservation.js";
import { ENVIRONMENT_LIST } from "@/datamodel/Environment.js";
import { ReservationLog, addReservationLog } from "@/datamodel/ReservationLog.js";

const { snackbar, notify } = useSnackbar();

// ── Session ────────────────────────────────────────────────────────────────────
const session = (() => {
  try { return JSON.parse(localStorage.getItem("spotly_session") || "{}"); } catch { return {}; }
})();
const sessionUserId = session.userId || "";
const sessionName = session.name || "Guest";

// ── Dialogs & state ────────────────────────────────────────────────────────────
const cancelDialog = ref(false);
const bookDialog = ref(false);
const selectedRes = ref(null);

const newRes = reactive({ date: "", time: "", area: "", guests: 2, notes: "" });

// ── Derived areas from ENVIRONMENT_LIST ────────────────────────────────────────
const areas = computed(() => ENVIRONMENT_LIST.map((e) => e.name));

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function enrichReservation(r) {
  const env = ENVIRONMENT_LIST.find((e) => e.id === r.environmentId);
  const el = env?.elements.find((el) => el.id === r.elementId);
  return {
    id: r.id,
    rawDate: r.date,
    date: formatDate(r.date),
    time: r.time,
    area: env?.name || r.environmentId || "Unknown",
    table: el?.label || r.elementId || "TBD",
    guests: r.guests,
    notes: r.notes,
    status: r.status,
  };
}

// ── Computed lists ─────────────────────────────────────────────────────────────
const ACTIVE_STATUSES = ["REQUESTED", "APPROVED", "CHECKED_IN"];
const PAST_STATUSES = ["COMPLETED", "NO_SHOW"];

const baseList = computed(() =>
  sessionUserId
    ? RESERVATION_LIST.filter((r) => r.userId === sessionUserId)
    : RESERVATION_LIST,
);

const upcoming = computed(() =>
  baseList.value
    .filter((r) => ACTIVE_STATUSES.includes(r.status))
    .map(enrichReservation)
    .sort((a, b) => a.rawDate.localeCompare(b.rawDate)),
);

const pastVisits = computed(() =>
  baseList.value
    .filter((r) => PAST_STATUSES.includes(r.status))
    .map((r) => {
      const d = new Date(r.date + "T00:00:00");
      const env = ENVIRONMENT_LIST.find((e) => e.id === r.environmentId);
      const el = env?.elements.find((el) => el.id === r.elementId);
      return {
        day: String(d.getDate()).padStart(2, "0"),
        month: d.toLocaleString("en-US", { month: "short" }),
        area: env?.name || r.environmentId || "Unknown",
        table: el?.label || r.elementId || "TBD",
        guests: r.guests,
        rawDate: r.date,
      };
    })
    .sort((a, b) => b.rawDate.localeCompare(a.rawDate)),
);

// ── Actions ────────────────────────────────────────────────────────────────────
const confirmCancel = () => {
  if (!selectedRes.value) return;
  const res = RESERVATION_LIST.find((r) => r.id === selectedRes.value.id);
  if (res) {
    const prev = res.status;
    updateReservationStatus(res.id, "CANCELLED");
    addReservationLog(
      new ReservationLog({
        id: Date.now(),
        reservationId: res.id,
        previousStatus: prev,
        newStatus: "CANCELLED",
        timestamp: new Date().toISOString(),
        actorRole: "client",
      }),
    );
  }
  cancelDialog.value = false;
  notify("Reservation cancelled successfully", "#C71585", "mdi-close-circle");
};

const submitBooking = () => {
  if (!newRes.date || !newRes.time || !newRes.area) {
    notify("Please fill in all required fields", "#C71585", "mdi-alert-circle");
    return;
  }
  const matchedEnv = ENVIRONMENT_LIST.find(
    (e) => e.name === newRes.area,
  );
  const id = Date.now();
  addReservation(
    new Reservation({
      id,
      venueId: 1,
      environmentId: matchedEnv?.id || "",
      elementId: "",
      userId: sessionUserId,
      name: sessionName,
      email: session.email || "",
      phone: "",
      date: newRes.date,
      time: newRes.time,
      guests: Number(newRes.guests),
      notes: newRes.notes,
      status: "REQUESTED",
    }),
  );
  addReservationLog(
    new ReservationLog({
      id: id + 1,
      reservationId: id,
      previousStatus: null,
      newStatus: "REQUESTED",
      timestamp: new Date().toISOString(),
      actorRole: "client",
    }),
  );
  bookDialog.value = false;
  Object.assign(newRes, { date: "", time: "", area: "", guests: 2, notes: "" });
  notify("Booking request submitted!", "#2EBB57", "mdi-check-circle");
};

const { logout } = useAuth();
</script>

<style scoped>
.spotly-app {
  --gold: #d4af37;
  --midnight: #0a0e14;
  --surface: #13181f;
  --surface-2: var(--color-surface-elevated);
  --green: #2ebb57;
  --rose: #c71585;
  --muted: #6b7a8d;
  background-color: var(--midnight) !important;
  font-family: var(--font-body);
}

/* ── Navbar ── */
.spotly-navbar {
  background: rgba(10, 14, 20, 0.96) !important;
  border-bottom: 1px solid rgba(212, 175, 55, 0.18) !important;
  backdrop-filter: blur(14px);
}
.powered-by {
  border-left: 1px solid rgba(212, 175, 55, 0.18);
  padding-left: 12px;
}
.powered-text {
  font-family: var(--font-body);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.55);
}
.venue-sub {
  font-size: 0.7rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 1px;
}
.book-btn {
  background: #d4af37 !important;
  color: #0a0e14 !important;
  font-weight: 600;
  font-size: 0.78rem;
  border-radius: 8px !important;
  letter-spacing: 0.04em;
}
.logout-btn {
  color: var(--muted) !important;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
}
.logout-btn:hover {
  color: var(--gold) !important;
}

/* ── Main ── */
.spotly-main {
  background: var(--midnight) !important;
}
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* ── Welcome Banner ── */
.welcome-banner {
  position: relative;
  background: var(--surface);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 20px;
  padding: 32px 36px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.welcome-glow {
  position: absolute;
  top: -60px;
  left: -60px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(212, 175, 55, 0.12) 0%,
    transparent 70%
  );
  pointer-events: none;
}
.welcome-greeting {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
}
.welcome-sub {
  color: var(--muted);
  font-size: 0.88rem;
  margin-top: 6px;
}
.avatar-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.18);
  border: 2px solid rgba(212, 175, 55, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 700;
  color: #d4af37;
  box-shadow:
    0 0 0 3px rgba(212, 175, 55, 0.25),
    0 0 24px rgba(212, 175, 55, 0.18);
}

/* ── Grid ── */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}
@media (max-width: 820px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

/* ── Section Header ── */
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.18);
}
.section-title {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
}
.count-chip {
  background: rgba(212, 175, 55, 0.12) !important;
  color: var(--gold) !important;
  font-weight: 700;
  font-size: 0.68rem !important;
  border: 1px solid rgba(212, 175, 55, 0.25);
}

/* ── Reservation Card ── */
.reservation-card {
  background: var(--surface);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  transition:
    border-color 0.2s,
    transform 0.2s;
  animation: slideUp 0.4s ease both;
}
.reservation-card:hover {
  border-color: rgba(212, 175, 55, 0.25);
  transform: translateY(-2px);
}
.card-strip {
  width: 4px;
  flex-shrink: 0;
}
.strip--pending {
  background: var(--rose);
}
.strip--approved {
  background: var(--green);
}
.strip--cancelled {
  background: #444;
}

.card-body {
  padding: 18px 20px;
  flex: 1;
}

.res-date {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}
.res-time {
  font-size: 0.78rem;
  color: var(--muted);
  margin-top: 2px;
  display: flex;
  align-items: center;
}

.res-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
}
.detail-label {
  color: var(--muted);
  min-width: 48px;
  font-size: 0.78rem;
}
.detail-value {
  color: rgba(255, 255, 255, 0.82);
  font-weight: 500;
}

.res-notes {
  font-size: 0.78rem;
  color: var(--muted);
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 6px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
}

/* Status Chips */
.status-chip {
  font-size: 0.7rem !important;
  font-weight: 600 !important;
}
.status-chip--pending {
  background: rgba(199, 21, 133, 0.18) !important;
  color: #c71585 !important;
}
.status-chip--approved {
  background: rgba(46, 187, 87, 0.18) !important;
  color: #2ebb57 !important;
}
.status-chip--cancelled {
  background: rgba(150, 150, 150, 0.1) !important;
  color: #888 !important;
}

/* Cancel Button */
.cancel-btn {
  border-color: rgba(199, 21, 133, 0.3) !important;
  color: var(--rose) !important;
  font-size: 0.75rem !important;
  border-radius: 8px !important;
  transition:
    background 0.2s,
    box-shadow 0.2s !important;
}
.cancel-btn:hover:not(:disabled) {
  background: rgba(199, 21, 133, 0.1) !important;
  box-shadow: 0 0 10px rgba(199, 21, 133, 0.2);
}

/* Empty Card */
.empty-card {
  background: var(--surface);
  border: 1px dashed rgba(212, 175, 55, 0.18);
  border-radius: 14px;
  padding: 40px;
  text-align: center;
  color: var(--muted);
  font-size: 0.9rem;
}

/* ── Past Visits ── */
.past-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.past-item {
  background: var(--surface);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition:
    border-color 0.2s,
    transform 0.15s;
  animation: slideUp 0.4s ease both;
}
.past-item:hover {
  border-color: rgba(212, 175, 55, 0.18);
  transform: translateX(3px);
}
.past-date-badge {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 8px;
  padding: 8px 12px;
  text-align: center;
  min-width: 48px;
}
.badge-day {
  display: block;
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gold);
  line-height: 1;
}
.badge-month {
  display: block;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin-top: 2px;
}
.past-mid {
  flex: 1;
}
.past-area {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
}
.past-meta {
  font-size: 0.76rem;
  color: var(--muted);
  margin-top: 2px;
}

.completed-chip {
  background: rgba(46, 187, 87, 0.12) !important;
  color: #2ebb57 !important;
  font-size: 0.65rem !important;
  font-weight: 600 !important;
  border: 1px solid rgba(46, 187, 87, 0.2);
}

/* ── Loyalty Card ── */
.loyalty-card {
  position: relative;
  background: var(--surface);
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 14px;
  padding: 22px 24px;
  overflow: hidden;
}
.loyalty-bg {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(212, 175, 55, 0.08),
    transparent 70%
  );
  pointer-events: none;
}
.loyalty-title {
  display: flex;
  align-items: center;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
}
.loyalty-tier {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 700;
  color: #d4af37;
  margin-top: 4px;
}
.loyalty-visits {
  font-size: 0.8rem;
  color: var(--muted);
  margin-top: 2px;
}
.loyalty-next {
  font-size: 0.72rem;
  color: var(--muted);
}

/* ── Dialog ── */
.dialog-card {
  background: var(--surface-2) !important;
  border: 1px solid rgba(212, 175, 55, 0.18) !important;
  border-radius: 16px !important;
  overflow: hidden;
}
.dialog-strip {
  height: 3px;
  background: linear-gradient(90deg, var(--gold), transparent);
}
.dialog-title {
  font-family: var(--font-heading) !important;
  font-size: 1.25rem !important;
  color: #fff !important;
}
.dialog-body {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.9rem;
  line-height: 1.6;
}
.dialog-note {
  font-size: 0.78rem;
  color: var(--muted);
}

.keep-btn {
  color: var(--muted) !important;
}
.confirm-cancel-btn {
  background: rgba(199, 21, 133, 0.85) !important;
  color: #fff !important;
  font-weight: 600;
  border-radius: 8px !important;
}

/* Inputs */
.spotly-input :deep(.v-field) {
  background: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(212, 175, 55, 0.18) !important;
  color: #fff !important;
  font-size: 0.85rem;
}
.spotly-input :deep(label) {
  color: var(--muted) !important;
  font-size: 0.82rem;
}

/* Animation */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
