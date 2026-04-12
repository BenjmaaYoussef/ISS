<template>
  <!-- NAVBAR -->
  <AppNavbarVenue
    :show-default-actions="false"
    :show-powered-by="true"
    venue-name="Sunset Beach Club"
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
        class="text-none px-4 ml-4"
        :ripple="false"
        size="small"
        style="color: rgba(255, 255, 255, 0.55); font-size: 0.78rem"
        variant="text"
        @click="router.back()"
      >
        <v-icon class="mr-1" size="14">mdi-arrow-left</v-icon>Back
      </v-btn>
    </template>
  </AppNavbarVenue>

  <v-main class="spotly-main">
    <v-sheet color="background" style="min-height: 100vh; padding-bottom: 80px">
      <div class="spotly-container spotly-container--narrow">
        <!-- Back -->
        <v-btn
          style="
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.82rem;
            letter-spacing: 1px;
            text-transform: uppercase;
            padding: 0;
            margin-bottom: 40px;
          "
          variant="text"
          @click="$router.back()"
        >
          <v-icon icon="mdi-arrow-left" size="16" start />
          Back
        </v-btn>

        <!-- Title -->
        <div style="margin-bottom: 48px; animation: fadeUp 0.5s ease both">
          <div
            style="
              font-size: 0.72rem;
              letter-spacing: 3px;
              text-transform: uppercase;
              color: rgba(212, 175, 55, 0.6);
              font-family: &quot;Inter&quot;, sans-serif;
              margin-bottom: 10px;
            "
          >
            Step 1 of 3
          </div>
          <h1
            style="
              font-family: &quot;Playfair Display&quot;, serif;
              font-size: clamp(1.6rem, 3vw, 2.4rem);
              font-weight: 700;
              color: #fff;
            "
          >
            Where do you like to sit?
          </h1>
          <p
            style="
              color: rgba(255, 255, 255, 0.4);
              font-family: &quot;Inter&quot;, sans-serif;
              font-size: 0.9rem;
              margin-top: 8px;
            "
          >
            Choose your preferred environment for tonight's experience.
          </p>
        </div>

        <!-- Environment Cards -->
        <v-row style="gap: 0">
          <v-col
            v-for="(env, i) in environments"
            :key="env.name"
            cols="12"
            sm="4"
            :style="`animation: fadeUp 0.5s ${0.1 * i}s ease both;`"
          >
            <div
              class="env-card"
              :class="{ selected: selected === env.id }"
              :style="{
                border:
                  selected === env.id
                    ? '1px solid #D4AF37'
                    : '1px solid rgba(212,175,55,0.18)',
                background:
                  selected === env.id ? 'rgba(212,175,55,0.05)' : '#13181f',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden',
              }"
              @click="selected = env.id"
            >
              <!-- Image area -->
              <div
                :style="{
                  height: '200px',
                  background: env.gradient,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }"
              >
                <v-icon
                  :icon="env.icon"
                  size="56"
                  style="color: rgba(212, 175, 55, 0.4)"
                />

                <!-- Selected badge -->
                <div
                  v-if="selected === env.id"
                  style="
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: #d4af37;
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  <v-icon icon="mdi-check" size="16" style="color: #0a0e14" />
                </div>
              </div>

              <!-- Info -->
              <div style="padding: 24px">
                <h3
                  style="
                    font-family: &quot;Playfair Display&quot;, serif;
                    font-size: 1.2rem;
                    color: #fff;
                    margin-bottom: 6px;
                  "
                >
                  {{ env.name }}
                </h3>
                <p
                  style="
                    font-family: &quot;Inter&quot;, sans-serif;
                    font-size: 0.83rem;
                    color: rgba(255, 255, 255, 0.45);
                    line-height: 1.6;
                    margin-bottom: 20px;
                  "
                >
                  {{ env.desc }}
                </p>

                <!-- Select Button -->
                <v-btn
                  block
                  :color="selected === env.id ? 'primary' : ''"
                  style="
                    font-size: 0.78rem;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    height: 42px;
                  "
                  :style="
                    selected === env.id
                      ? 'color:#0A0E14; font-weight:600;'
                      : 'border-color:rgba(212,175,55,0.3); color:rgba(212,175,55,0.8);'
                  "
                  :variant="selected === env.id ? 'flat' : 'outlined'"
                  @click.stop="selected = env.id"
                >
                  <v-icon
                    end
                    :icon="
                      selected === env.id ? 'mdi-check' : 'mdi-arrow-right'
                    "
                    size="16"
                  />
                  {{ selected === env.id ? "Selected" : "Select" }}
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Continue Button -->
        <div
          style="
            margin-top: 48px;
            display: flex;
            justify-content: flex-end;
            animation: fadeUp 0.5s 0.4s ease both;
          "
        >
          <v-btn
            color="primary"
            :disabled="!selected"
            size="large"
            style="
              font-size: 0.85rem;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: #0a0e14;
              font-weight: 600;
              padding: 0 48px;
              height: 52px;
            "
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
  import { computed, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import AppNavbarVenue from '@/components/layout/AppNavbarVenue.vue'
  import BookingStepIndicator from '@/components/ui/BookingStepIndicator.vue'
  import { ENVIRONMENT_LIST } from '@/datamodel/Environment.js'

  const route = useRoute()
  const router = useRouter()
  const selected = ref('')

  const venueId = computed(() => Number(route.query.venueId) || 1)
  const environments = computed(() => ENVIRONMENT_LIST.filter(e => e.venueId === venueId.value))

  function continueBooking () {
    sessionStorage.setItem('spotly_selected_env', selected.value)
    sessionStorage.setItem('spotly_booking', JSON.stringify({ venueId: venueId.value, environmentId: selected.value }))
    router.push('/booking/seats')
  }
</script>

<style scoped>
.env-card:hover {
  border-color: rgba(212, 175, 55, 0.4) !important;
  transform: translateY(-4px);
}
</style>
