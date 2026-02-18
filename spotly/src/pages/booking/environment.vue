<template>
  <!-- NAVBAR -->
  <AppNavbarVenue
    venue-name="Sunset Beach Club"
    :show-powered-by="true"
    :show-default-actions="true"
    @logout="$router.push('/auth')"
  />

  <v-main>
    <v-sheet color="background" style="min-height: 100vh; padding-bottom: 80px">
      <v-container style="max-width: 1100px; padding: 40px 48px">
        <!-- Back -->
        <v-btn
          variant="text"
          @click="$router.back()"
          style="
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.82rem;
            letter-spacing: 1px;
            text-transform: uppercase;
            padding: 0;
            margin-bottom: 40px;
          "
        >
          <v-icon start icon="mdi-arrow-left" size="16" />
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
              :class="{ selected: selected === env.name }"
              @click="selected = env.name"
              :style="{
                border:
                  selected === env.name
                    ? '1px solid #D4AF37'
                    : '1px solid rgba(212,175,55,0.15)',
                background:
                  selected === env.name ? 'rgba(212,175,55,0.05)' : '#13181f',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden',
              }"
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
                  v-if="selected === env.name"
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
                  :color="selected === env.name ? 'primary' : ''"
                  :variant="selected === env.name ? 'flat' : 'outlined'"
                  block
                  style="
                    font-size: 0.78rem;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    height: 42px;
                  "
                  :style="
                    selected === env.name
                      ? 'color:#0A0E14; font-weight:600;'
                      : 'border-color:rgba(212,175,55,0.3); color:rgba(212,175,55,0.8);'
                  "
                  @click.stop="selected = env.name"
                >
                  <v-icon
                    end
                    :icon="
                      selected === env.name ? 'mdi-check' : 'mdi-arrow-right'
                    "
                    size="16"
                  />
                  {{ selected === env.name ? "Selected" : "Select" }}
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
            size="large"
            :disabled="!selected"
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
      </v-container>
    </v-sheet>
  </v-main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppNavbarVenue from "@/components/layout/AppNavbarVenue.vue";

const router = useRouter();
const selected = ref("");

const environments = [
  {
    name: "Indoor",
    desc: "Elegant dining with air conditioning. Perfect for an intimate, refined experience.",
    icon: "mdi-ceiling-light-outline",
    gradient: "linear-gradient(135deg, #1a1005 0%, #0d0a05 100%)",
  },
  {
    name: "Beach",
    desc: "Sand & sunset views. Feel the breeze while dining steps from the shoreline.",
    icon: "mdi-beach",
    gradient: "linear-gradient(135deg, #0a1a2a 0%, #051015 100%)",
  },
  {
    name: "Terrace",
    desc: "Open-air garden setting. A lush outdoor escape under the stars.",
    icon: "mdi-flower-outline",
    gradient: "linear-gradient(135deg, #0a1a0a 0%, #051005 100%)",
  },
];
function continueBooking() {
  router.push("/floor-plan"); // ← Changé de '/booking/floor-plan' à '/floor-plan'
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500&display=swap");

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.env-card:hover {
  border-color: rgba(212, 175, 55, 0.4) !important;
  transform: translateY(-4px);
}
</style>
