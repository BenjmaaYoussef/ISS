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
      <v-container style="max-width: 1200px; padding: 40px 48px">
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
            Step 2 of 3
          </div>
          <h1
            style="
              font-family: &quot;Playfair Display&quot;, serif;
              font-size: clamp(1.6rem, 3vw, 2.4rem);
              font-weight: 700;
              color: #fff;
            "
          >
            Choose your table
          </h1>
          <p
            style="
              color: rgba(255, 255, 255, 0.4);
              font-family: &quot;Inter&quot;, sans-serif;
              font-size: 0.9rem;
              margin-top: 8px;
            "
          >
            Select from available tables in your chosen environment.
          </p>
        </div>

        <!-- Floor Plan Placeholder -->
        <v-sheet
          style="
            background: #13181f;
            border: 1px solid rgba(212, 175, 55, 0.2);
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 48px;
          "
        >
          <div style="text-align: center">
            <v-icon
              icon="mdi-floor-plan"
              size="64"
              style="color: rgba(212, 175, 55, 0.2)"
            />
            <p
              style="
                color: rgba(255, 255, 255, 0.3);
                font-family: &quot;Inter&quot;, sans-serif;
                margin-top: 16px;
              "
            >
              Interactive floor plan coming soon
            </p>
          </div>
        </v-sheet>

        <!-- Continue Button -->
        <div style="display: flex; justify-content: flex-end">
          <v-btn
            color="primary"
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
            @click="$router.push('/booking/confirm')"
          >
            Continue to Booking
            <v-icon end icon="mdi-arrow-right" size="18" />
          </v-btn>
        </div>
      </v-container>
    </v-sheet>
  </v-main>
</template>

<script setup>
import { useRouter } from "vue-router";
import AppNavbarVenue from "@/components/layout/AppNavbarVenue.vue";

const router = useRouter();
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
</style>
