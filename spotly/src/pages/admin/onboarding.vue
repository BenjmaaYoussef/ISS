<template>
  <div class="onboarding-root">
    <!-- Header -->
    <div class="ob-header">
      <div class="ob-logo">
        <v-icon class="mr-2" color="#D4AF37" size="18">mdi-map-marker-star-outline</v-icon>
        <span class="ob-logo-text">Spotly</span>
      </div>
      <div class="ob-step-indicator">
        <div
          v-for="(label, i) in steps"
          :key="i"
          class="ob-step"
          :class="{
            'ob-step--active': step === i + 1,
            'ob-step--done': step > i + 1,
          }"
        >
          <div class="ob-step-dot">
            <v-icon v-if="step > i + 1" size="12">mdi-check</v-icon>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="ob-step-label">{{ label }}</span>
        </div>
        <div class="ob-step-line" />
      </div>
    </div>

    <!-- Card -->
    <div class="ob-card">
      <!-- ── STEP 1: Venue Identity ── -->
      <transition mode="out-in" name="ob-fade">
        <div v-if="step === 1" key="step1">
          <div class="ob-eyebrow">Step 1 of 2</div>
          <h1 class="ob-title">Set up your venue</h1>
          <p class="ob-sub">
            This is how guests will discover you. You can refine everything
            later in Venue Settings.
          </p>

          <div class="ob-fields">
            <div class="ob-field-group">
              <label class="ob-label">Venue Name <span class="ob-req">*</span></label>
              <v-text-field
                v-model="v1.name"
                class="spotly-input"
                density="comfortable"
                hide-details="auto"
                placeholder="e.g. Sunset Beach Club"
                :rules="[r => !!r.trim() || 'Required']"
                variant="outlined"
                @keydown.enter="nextStep"
              />
            </div>

            <div class="ob-field-group">
              <label class="ob-label">Tagline</label>
              <v-text-field
                v-model="v1.tagline"
                class="spotly-input"
                density="comfortable"
                hide-details
                placeholder="e.g. Where every sunset tells a story"
                variant="outlined"
              />
            </div>

            <div class="ob-field-group">
              <label class="ob-label">Description <span class="ob-req">*</span></label>
              <v-textarea
                v-model="v1.description"
                class="spotly-input"
                density="comfortable"
                hide-details="auto"
                no-resize
                placeholder="Tell guests what makes your venue unique…"
                rows="3"
                :rules="[r => !!r.trim() || 'Required']"
                variant="outlined"
              />
            </div>

            <div class="ob-row">
              <div class="ob-field-group ob-field-group--half">
                <label class="ob-label">Venue Type</label>
                <v-select
                  v-model="v1.venueType"
                  class="spotly-input"
                  density="comfortable"
                  hide-details
                  :items="venueTypes"
                  placeholder="Select type"
                  variant="outlined"
                />
              </div>
              <div class="ob-field-group ob-field-group--half">
                <label class="ob-label">Location</label>
                <v-text-field
                  v-model="v1.location"
                  class="spotly-input"
                  density="comfortable"
                  hide-details
                  placeholder="e.g. Hammamet, Tunisia"
                  variant="outlined"
                />
              </div>
            </div>
          </div>

          <div v-if="step1Error" class="ob-error">
            <v-icon class="mr-1" size="14">mdi-alert-circle-outline</v-icon>
            {{ step1Error }}
          </div>

          <div class="ob-actions">
            <button class="gold-btn ob-cta" @click="nextStep">
              Continue
              <v-icon class="ml-2" size="15">mdi-arrow-right</v-icon>
            </button>
          </div>
        </div>

        <!-- ── STEP 2: First Environment ── -->
        <div v-else-if="step === 2" key="step2">
          <div class="ob-eyebrow">Step 2 of 2</div>
          <h1 class="ob-title">Create your first space</h1>
          <p class="ob-sub">
            An environment is a bookable area of your venue — like a terrace,
            lounge, or rooftop. You'll design its floor plan right after this.
          </p>

          <div class="ob-fields">
            <div class="ob-field-group">
              <label class="ob-label">Environment Name <span class="ob-req">*</span></label>
              <v-text-field
                v-model="v2.name"
                class="spotly-input"
                density="comfortable"
                hide-details="auto"
                placeholder="e.g. Rooftop Terrace"
                :rules="[r => !!r.trim() || 'Required']"
                variant="outlined"
                @keydown.enter="finish"
              />
            </div>

            <div class="ob-field-group">
              <label class="ob-label">Icon</label>
              <div class="icon-grid">
                <div
                  v-for="opt in iconOptions"
                  :key="opt.icon"
                  class="icon-opt"
                  :class="{ 'icon-opt--active': v2.icon === opt.icon }"
                  :title="opt.label"
                  @click="v2.icon = opt.icon"
                >
                  <v-icon size="20">{{ opt.icon }}</v-icon>
                  <span>{{ opt.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="step2Error" class="ob-error">
            <v-icon class="mr-1" size="14">mdi-alert-circle-outline</v-icon>
            {{ step2Error }}
          </div>

          <div class="ob-actions">
            <button class="ob-back-btn" @click="step = 1">
              <v-icon class="mr-1" size="14">mdi-arrow-left</v-icon>
              Back
            </button>
            <button class="gold-btn ob-cta" :disabled="finishing" @click="finish">
              <v-progress-circular
                v-if="finishing"
                class="mr-2"
                color="white"
                indeterminate
                size="14"
                width="2"
              />
              Launch my venue
              <v-icon v-if="!finishing" class="ml-2" size="15">mdi-rocket-launch-outline</v-icon>
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import { addEnvironment, Environment, getEnvironmentsByVenue } from '@/datamodel/Environment.js'
  import { getVenueByAdminEmail, updateVenue } from '@/datamodel/Venue.js'

  const router = useRouter()
  const { getSession } = useAuth()
  const session = getSession()

  // Determine which step to start on
  const venue = session?.email ? getVenueByAdminEmail(session.email) : null
  const hasEnvs = venue ? getEnvironmentsByVenue(venue.id).length > 0 : false
  const step = ref(venue?.name?.trim() ? (hasEnvs ? 1 : 2) : 1)

  const steps = ['Venue Info', 'First Space']

  const venueTypes = [
    'Beach Club', 'Restaurant', 'Lounge', 'Rooftop Bar',
    'Beach Bar', 'Café', 'Private Club', 'Event Space',
  ]

  const iconOptions = [
    { icon: 'mdi-map-outline', label: 'General' },
    { icon: 'mdi-umbrella-beach-outline', label: 'Beach' },
    { icon: 'mdi-terrace', label: 'Terrace' },
    { icon: 'mdi-ceiling-light-outline', label: 'Indoor' },
    { icon: 'mdi-glass-cocktail', label: 'Bar' },
    { icon: 'mdi-silverware-fork-knife', label: 'Dining' },
    { icon: 'mdi-sofa-outline', label: 'Lounge' },
    { icon: 'mdi-star-four-points-outline', label: 'VIP' },
    { icon: 'mdi-music', label: 'Stage' },
    { icon: 'mdi-pool', label: 'Pool' },
  ]

  // Step 1 form
  const v1 = ref({
    name: venue?.name ?? '',
    tagline: venue?.tagline ?? '',
    description: venue?.description ?? '',
    venueType: venue?.venueType ?? '',
    location: venue?.location ?? '',
  })

  // Step 2 form
  const v2 = ref({
    name: '',
    icon: 'mdi-map-outline',
  })

  const step1Error = ref('')
  const step2Error = ref('')
  const finishing = ref(false)

  function nextStep () {
    step1Error.value = ''
    if (!v1.value.name.trim()) {
      step1Error.value = 'Venue name is required.'
      return
    }
    if (!v1.value.description.trim()) {
      step1Error.value = 'Description is required.'
      return
    }
    if (!venue) return
    updateVenue(venue.id, {
      name: v1.value.name.trim(),
      tagline: v1.value.tagline.trim(),
      description: v1.value.description.trim(),
      venueType: v1.value.venueType,
      location: v1.value.location.trim(),
    })
    step.value = 2
  }

  async function finish () {
    step2Error.value = ''
    if (!v2.value.name.trim()) {
      step2Error.value = 'Environment name is required.'
      return
    }
    if (!venue) return
    finishing.value = true
    await new Promise(r => setTimeout(r, 400))
    const newEnv = new Environment({
      id: 'env_' + Date.now(),
      venueId: venue.id,
      name: v2.value.name.trim(),
      icon: v2.value.icon,
      canvas: { width: 1000, height: 660 },
      elements: [],
    })
    addEnvironment(newEnv)
    router.push('/admin/floor-plan')
  }
</script>

<style scoped>
.onboarding-root {
  min-height: 100vh;
  background: #0A0E14;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px 60px;
}

/* ── Header ── */
.ob-header {
  width: 100%;
  max-width: 520px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 0 36px;
}

.ob-logo {
  display: flex;
  align-items: center;
}
.ob-logo-text {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: #D4AF37;
  letter-spacing: 0.5px;
}

.ob-step-indicator {
  display: flex;
  align-items: center;
  gap: 0;
  position: relative;
}
.ob-step-line {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  height: 1px;
  background: rgba(212, 175, 55, 0.15);
  z-index: 0;
}
.ob-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  position: relative;
  z-index: 1;
  margin: 0 20px;
}
.ob-step-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #13181F;
  border: 1.5px solid rgba(212, 175, 55, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #6a7080;
  font-family: var(--font-body, Inter);
  transition: all 0.25s;
}
.ob-step--active .ob-step-dot {
  border-color: #D4AF37;
  background: rgba(212, 175, 55, 0.12);
  color: #D4AF37;
}
.ob-step--done .ob-step-dot {
  border-color: #D4AF37;
  background: rgba(212, 175, 55, 0.18);
  color: #D4AF37;
}
.ob-step-label {
  font-size: 10px;
  color: #6a7080;
  white-space: nowrap;
  letter-spacing: 0.3px;
}
.ob-step--active .ob-step-label {
  color: #D4AF37;
}
.ob-step--done .ob-step-label {
  color: rgba(212, 175, 55, 0.6);
}

/* ── Card ── */
.ob-card {
  width: 100%;
  max-width: 520px;
  background: #13181F;
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 14px;
  padding: 40px 44px;
}

.ob-eyebrow {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #D4AF37;
  margin-bottom: 10px;
}
.ob-title {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  color: #F0E6C8;
  margin-bottom: 8px;
  line-height: 1.2;
}
.ob-sub {
  font-size: 13.5px;
  color: #6a7080;
  line-height: 1.6;
  margin-bottom: 28px;
}

/* ── Fields ── */
.ob-fields {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.ob-field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ob-field-group--half {
  flex: 1;
}
.ob-row {
  display: flex;
  gap: 14px;
}
.ob-label {
  font-size: 11.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #8a94a6;
}
.ob-req {
  color: #D4AF37;
}

/* ── Icon grid ── */
.icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.icon-opt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border-radius: 8px;
  border: 1.5px solid rgba(212, 175, 55, 0.12);
  background: rgba(255,255,255,0.02);
  cursor: pointer;
  transition: all 0.18s;
  color: #6a7080;
  font-size: 10px;
}
.icon-opt:hover {
  border-color: rgba(212, 175, 55, 0.35);
  background: rgba(212, 175, 55, 0.06);
  color: #D4AF37;
}
.icon-opt--active {
  border-color: #D4AF37;
  background: rgba(212, 175, 55, 0.12);
  color: #D4AF37;
}

/* ── Error ── */
.ob-error {
  margin-top: 14px;
  font-size: 12.5px;
  color: #ef5350;
  display: flex;
  align-items: center;
}

/* ── Actions ── */
.ob-actions {
  margin-top: 28px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
.ob-cta {
  padding: 10px 24px;
  font-size: 13.5px;
  display: flex;
  align-items: center;
}
.ob-back-btn {
  background: none;
  border: 1.5px solid rgba(212, 175, 55, 0.2);
  color: #8a94a6;
  border-radius: 7px;
  padding: 9px 18px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.18s;
}
.ob-back-btn:hover {
  border-color: rgba(212, 175, 55, 0.4);
  color: #D4AF37;
}

/* ── Transition ── */
.ob-fade-enter-active,
.ob-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.ob-fade-enter-from {
  opacity: 0;
  transform: translateX(18px);
}
.ob-fade-leave-to {
  opacity: 0;
  transform: translateX(-18px);
}
</style>
