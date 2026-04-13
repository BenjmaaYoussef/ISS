<template>
  <!-- NAVBAR -->
  <AppNavbarVenue
    :show-default-actions="false"
    :show-powered-by="true"
    :venue-name="venueName"
  >
    <template #actions>
      <BookingStepIndicator
        :current-step="1"
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
        @click="router.back()"
      >
        <v-icon class="mr-1" size="14">mdi-arrow-left</v-icon>Back
      </v-btn>
    </template>
  </AppNavbarVenue>

  <v-main class="spotly-main">
    <v-sheet color="background" class="page-sheet">
      <div class="spotly-container spotly-container--narrow">

        <!-- Back -->
        <v-btn
          class="back-btn text-none"
          variant="text"
          @click="$router.back()"
        >
          <v-icon icon="mdi-arrow-left" size="16" start />
          Back
        </v-btn>

        <!-- Title -->
        <div class="page-header">
          <div class="step-eyebrow">Step 1 of 3</div>
          <h1 class="page-title">Where do you like to sit?</h1>
          <p class="page-subtitle">
            Choose your preferred environment for tonight's experience.
          </p>
        </div>

        <!-- Environment Cards -->
        <v-row class="env-grid">
          <v-col
            v-for="(env, i) in environments"
            :key="env.name"
            cols="12"
            sm="4"
            :style="`animation: fadeUp 0.5s ${0.1 * i}s ease both;`"
          >
            <div
              class="env-card"
              :class="{ 'env-card--selected': selected === env.id }"
              @click="selected = env.id"
            >
              <!-- Gradient image area -->
              <div
                class="env-card-visual"
                :style="{ background: env.gradient }"
              >
                <!-- Overlay -->
                <div class="env-card-overlay" />

                <!-- Icon -->
                <v-icon
                  :icon="env.icon"
                  class="env-icon"
                  :class="{ 'env-icon--selected': selected === env.id }"
                  size="64"
                />

                <!-- Selected badge -->
                <div v-if="selected === env.id" class="selected-badge">
                  <v-icon icon="mdi-check" size="16" class="check-icon" />
                </div>

                <!-- Gold glow overlay when selected -->
                <div v-if="selected === env.id" class="selected-glow" />
              </div>

              <!-- Info -->
              <div class="env-card-body">
                <h3 class="env-name">{{ env.name }}</h3>
                <p class="env-desc">{{ env.desc }}</p>

                <!-- Select Button -->
                <v-btn
                  block
                  :color="selected === env.id ? 'primary' : ''"
                  :variant="selected === env.id ? 'flat' : 'outlined'"
                  class="env-select-btn"
                  :class="selected === env.id ? 'env-select-btn--active' : 'env-select-btn--idle'"
                  @click.stop="selected = env.id"
                >
                  <v-icon
                    end
                    :icon="selected === env.id ? 'mdi-check' : 'mdi-arrow-right'"
                    size="16"
                  />
                  {{ selected === env.id ? "Selected" : "Select" }}
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Continue Button -->
        <div class="continue-row">
          <v-btn
            color="primary"
            :disabled="!selected"
            size="large"
            class="continue-btn"
            @click="continueBooking"
          >
            Continue
            <v-icon end icon="mdi-arrow-right" size="18" />
          </v-btn>
        </div>

      </div>
    </v-sheet>
  </v-main>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import AppNavbarVenue from '@/components/layout/AppNavbarVenue.vue'
  import BookingStepIndicator from '@/components/ui/BookingStepIndicator.vue'
  import { ENVIRONMENT_LIST } from '@/datamodel/Environment.js'
  import { VENUE_LIST } from '@/datamodel/Venue.js'

  const route = useRoute()
  const router = useRouter()
  const selected = ref('')

  const venueId = computed(() => Number(route.query.venueId) || null)
  const venue = computed(() => venueId.value ? VENUE_LIST.find(v => v.id === venueId.value) : null)
  const venueName = computed(() => venue.value?.name ?? 'Venue')
  const environments = computed(() => ENVIRONMENT_LIST.filter(e => e.venueId === venueId.value))

  onMounted(() => {
    // Auth guard: must be logged in to book
    const session = (() => {
      try { return JSON.parse(localStorage.getItem('spotly_session') || 'null') }
      catch { return null }
    })()
    if (!session?.userId) {
      router.replace(`/auth?redirect=${encodeURIComponent(route.fullPath)}`)
      return
    }
    // VenueId guard: must be a valid venue
    if (!venue.value) {
      router.replace('/home')
    }
  })

  function continueBooking () {
    sessionStorage.setItem('spotly_selected_env', selected.value)
    sessionStorage.setItem('spotly_booking', JSON.stringify({ venueId: venueId.value, environmentId: selected.value }))
    router.push(`/booking/seats?venueId=${venueId.value}&envId=${selected.value}`)
  }
</script>

<style scoped>
/* ═══ PAGE ═══ */
.page-sheet {
  min-height: 100vh;
  padding-bottom: 80px;
}

.back-btn {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.82rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 0;
  margin-bottom: 40px;
}

.nav-back-btn {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.78rem;
}

/* ═══ HEADER ═══ */
.page-header {
  margin-bottom: 48px;
  animation: fadeUp 0.5s ease both;
}

.step-eyebrow {
  font-size: 0.72rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.6);
  font-family: var(--font-body);
  margin-bottom: 10px;
}

.page-title {
  font-family: var(--font-heading);
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.4);
  font-family: var(--font-body);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.6;
}

/* ═══ ENVIRONMENT CARDS ═══ */
.env-grid {
  gap: 0;
}

.env-card {
  background: #13181f;
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.25s ease;
  height: 100%;
}

.env-card:hover {
  border-color: rgba(212, 175, 55, 0.4);
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
}

.env-card--selected {
  border-color: #d4af37 !important;
  background: rgba(212, 175, 55, 0.04);
  box-shadow:
    0 0 0 1px rgba(212, 175, 55, 0.2),
    0 0 32px rgba(212, 175, 55, 0.12),
    0 8px 24px rgba(0, 0, 0, 0.3) !important;
  transform: translateY(-5px);
}

/* Card visual area */
.env-card-visual {
  height: 200px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.env-card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 14, 20, 0.35);
  transition: background 0.3s;
}

.env-card--selected .env-card-overlay {
  background: rgba(10, 14, 20, 0.2);
}

.env-icon {
  position: relative;
  z-index: 1;
  color: rgba(255, 255, 255, 0.35) !important;
  transition:
    color 0.3s ease,
    transform 0.3s ease;
}

.env-icon--selected {
  color: rgba(212, 175, 55, 0.75) !important;
  transform: scale(1.1);
}

.env-card:hover .env-icon {
  transform: scale(1.08);
  color: rgba(255, 255, 255, 0.55) !important;
}

.env-card--selected:hover .env-icon {
  color: rgba(212, 175, 55, 0.9) !important;
}

/* Selected badge */
.selected-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  background: #d4af37;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: badgePop 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes badgePop {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

.check-icon {
  color: #0a0e14 !important;
}

/* Gold glow */
.selected-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: 1;
}

/* Card body */
.env-card-body {
  padding: 24px;
}

.env-name {
  font-family: var(--font-heading);
  font-size: 1.2rem;
  color: #fff;
  margin: 0 0 6px;
  font-weight: 600;
}

.env-desc {
  font-family: var(--font-body);
  font-size: 0.83rem;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.6;
  margin: 0 0 20px;
}

.env-select-btn {
  font-size: 0.78rem !important;
  letter-spacing: 2px !important;
  text-transform: uppercase !important;
  height: 42px !important;
}

.env-select-btn--active {
  color: #0a0e14 !important;
  font-weight: 600 !important;
}

.env-select-btn--idle {
  border-color: rgba(212, 175, 55, 0.3) !important;
  color: rgba(212, 175, 55, 0.8) !important;
}

/* ═══ CONTINUE ROW ═══ */
.continue-row {
  margin-top: 48px;
  display: flex;
  justify-content: flex-end;
  animation: fadeUp 0.5s 0.4s ease both;
}

.continue-btn {
  font-size: 0.85rem !important;
  letter-spacing: 2px !important;
  text-transform: uppercase !important;
  color: #0a0e14 !important;
  font-weight: 600 !important;
  padding: 0 48px !important;
  height: 52px !important;
}

/* ═══ RESPONSIVE ═══ */
@media (max-width: 600px) {
  .back-btn {
    margin-bottom: 24px;
  }

  .page-header {
    margin-bottom: 28px;
  }

  .env-card-visual {
    height: 160px;
  }

  .continue-row {
    justify-content: stretch;
    margin-top: 28px;
  }

  .continue-btn {
    width: 100% !important;
    padding: 0 24px !important;
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
