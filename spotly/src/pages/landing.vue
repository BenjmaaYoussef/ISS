<template>
  <div>
    <!-- NAVBAR -->
    <AppNavbarPublic />

    <v-main>
      <!-- HERO SECTION -->
      <v-sheet
        color="background"
        class="d-flex flex-column align-center justify-center text-center"
        style="
          min-height: 100vh;
          padding: 120px 24px 80px;
          position: relative;
          overflow: hidden;
        "
      >
        <div
          style="
            position: absolute;
            inset: 0;
            background: radial-gradient(
              ellipse 80% 60% at 50% 40%,
              rgba(212, 175, 55, 0.07),
              transparent 70%
            );
            pointer-events: none;
          "
        />
        <v-chip
          variant="outlined"
          color="primary"
          size="small"
          class="mb-6"
          style="
            letter-spacing: 3px;
            border-radius: 0;
            font-size: 0.7rem;
            text-transform: uppercase;
            animation: fadeUp 0.5s ease both;
          "
        >
          Luxury Venue Management
        </v-chip>
        <h1
          style="
            font-family: &quot;Playfair Display&quot;, serif;
            font-size: clamp(2rem, 5vw, 4.5rem);
            font-weight: 700;
            line-height: 1.15;
            max-width: 780px;
            margin-bottom: 24px;
            color: #d4af37;
            text-shadow: 0 2px 10px rgba(212, 175, 55, 0.4);
            animation: fadeUp 0.5s 0.1s ease both;
          "
        >
          Transform Your Venue<br />Into An Experience
        </h1>
        <p
          style="
            color: rgba(255, 255, 255, 0.55);
            font-size: 1.05rem;
            max-width: 540px;
            line-height: 1.75;
            margin-bottom: 44px;
            font-family: &quot;Inter&quot;, sans-serif;
            animation: fadeUp 0.5s 0.2s ease both;
          "
        >
          The ultimate booking &amp; floor management system for high-end
          hospitality.
        </p>
        <div class="d-flex flex-wrap justify-center" style="gap: 16px; animation: fadeUp 0.5s 0.3s ease both">
          <v-btn
            to="/auth"
            size="large"
            color="primary"
            style="
              padding: 0 48px;
              height: 52px;
              font-size: 0.85rem;
              letter-spacing: 2.5px;
              text-transform: uppercase;
              border-radius: 0;
              color: #0a0e14;
              font-weight: 600;
            "
          >
            Get Started For Free
          </v-btn>
          <v-btn
            to="/home"
            size="large"
            variant="outlined"
            color="primary"
            style="
              padding: 0 48px;
              height: 52px;
              font-size: 0.85rem;
              letter-spacing: 2.5px;
              text-transform: uppercase;
              border-radius: 0;
              font-weight: 600;
            "
          >
            Explore Venues
          </v-btn>
        </div>
      </v-sheet>

      <!-- HOW IT WORKS -->
      <v-divider style="border-color: rgba(212, 175, 55, 0.12)" />
      <v-sheet id="how-it-works" color="background" style="padding: 88px 24px">
        <v-container style="max-width: 900px">
          <h2
            style="
              font-family: 'Playfair Display', serif;
              font-size: 2.2rem;
              color: #d4af37;
              text-align: center;
              margin-bottom: 64px;
            "
          >
            How It Works
          </h2>
          <v-row justify="center" align="center">
            <v-col
              v-for="(step, i) in howItWorks"
              :key="step.title"
              cols="12"
              sm="4"
              class="text-center"
            >
              <div style="position: relative; display: inline-block; margin-bottom: 24px">
                <div
                  style="
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    border: 2px solid rgba(212, 175, 55, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(212, 175, 55, 0.06);
                    margin: 0 auto;
                  "
                >
                  <v-icon :icon="step.icon" color="primary" size="30" />
                </div>
                <div
                  style="
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    background: #d4af37;
                    color: #0a0e14;
                    font-size: 0.7rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Inter', sans-serif;
                  "
                >
                  {{ i + 1 }}
                </div>
              </div>
              <div
                style="
                  font-family: 'Playfair Display', serif;
                  font-size: 1.05rem;
                  color: #fff;
                  margin-bottom: 10px;
                "
              >
                {{ step.title }}
              </div>
              <div
                style="
                  color: rgba(255, 255, 255, 0.45);
                  font-size: 0.87rem;
                  line-height: 1.7;
                  font-family: 'Inter', sans-serif;
                  max-width: 220px;
                  margin: 0 auto;
                "
              >
                {{ step.desc }}
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>

      <!-- TRUSTED BY -->
      <v-divider style="border-color: rgba(212, 175, 55, 0.12)" />
      <v-sheet
        color="background"
        class="d-flex align-center justify-center flex-wrap py-8"
        style="gap: 40px"
      >
        <span
          style="
            color: rgba(255, 255, 255, 0.3);
            font-size: 0.75rem;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-family: &quot;Inter&quot;, sans-serif;
          "
        >
          Trusted by
        </span>
        <v-chip
          v-for="brand in trustedBrands"
          :key="brand"
          variant="outlined"
          style="
            border-color: rgba(212, 175, 55, 0.25);
            color: rgba(212, 175, 55, 0.65);
            border-radius: 0;
            font-family: &quot;Playfair Display&quot;, serif;
            font-size: 0.95rem;
          "
        >
          {{ brand }}
        </v-chip>
      </v-sheet>
      <v-divider style="border-color: rgba(212, 175, 55, 0.12)" />

      <!-- WHY CHOOSE US -->
      <v-sheet id="features" color="#0d1219" style="padding: 88px 24px">
        <v-container style="max-width: 1100px">
          <h2
            style="
              font-family: &quot;Playfair Display&quot;, serif;
              font-size: 2.2rem;
              color: #d4af37;
              text-align: center;
              margin-bottom: 56px;
            "
          >
            Why Choose Us?
          </h2>
          <v-row>
            <v-col
              v-for="feat in features"
              :key="feat.title"
              cols="12"
              sm="6"
              lg="3"
            >
              <v-card
                class="feature-card"
                style="
                  background: var(--color-surface);
                  border: 1px solid rgba(212, 175, 55, 0.18);
                  border-radius: 0;
                  padding: 32px;
                  height: 100%;
                  transition:
                    transform 0.3s,
                    border-color 0.3s;
                "
                @mouseenter="
                  (e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
                  }
                "
                @mouseleave="
                  (e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.18)';
                  }
                "
              >
                <v-icon
                  :icon="feat.icon"
                  color="primary"
                  size="36"
                  class="mb-4"
                />
                <div
                  style="
                    font-family: &quot;Playfair Display&quot;, serif;
                    font-size: 1.1rem;
                    color: #fff;
                    margin-bottom: 10px;
                  "
                >
                  {{ feat.title }}
                </div>
                <div
                  style="
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.87rem;
                    line-height: 1.7;
                    font-family: &quot;Inter&quot;, sans-serif;
                  "
                >
                  {{ feat.desc }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>

      <!-- FOOTER -->
      <v-divider style="border-color: rgba(212, 175, 55, 0.12)" />
      <v-sheet
        color="background"
        class="d-flex align-center justify-space-between flex-wrap pa-6"
        style="gap: 16px"
      >
        <span
          style="
            font-family: &quot;Playfair Display&quot;, serif;
            font-size: 1.1rem;
            color: #d4af37;
          "
          >Spotly</span
        >
        <div class="d-flex" style="gap: 28px">
          <a
            href="#features"
            style="
              color: rgba(255, 255, 255, 0.35);
              text-decoration: none;
              font-size: 0.82rem;
              font-family: &quot;Inter&quot;, sans-serif;
            "
          >
            Features
          </a>
          <a
            href="#how-it-works"
            style="
              color: rgba(255, 255, 255, 0.35);
              text-decoration: none;
              font-size: 0.82rem;
              font-family: &quot;Inter&quot;, sans-serif;
            "
          >
            How It Works
          </a>
        </div>
        <span
          style="
            color: rgba(255, 255, 255, 0.2);
            font-size: 0.78rem;
            font-family: &quot;Inter&quot;, sans-serif;
          "
        >
          © 2025 Spotly. All rights reserved.
        </span>
      </v-sheet>
    </v-main>
  </div>
</template>

<script setup>
import AppNavbarPublic from "@/components/layout/AppNavbarPublic.vue";
const trustedBrands = ["Le Meridian", "Sunset Beach Club", "Rosewood"];
const howItWorks = [
  {
    icon: "mdi-store-search-outline",
    title: "Discover a Venue",
    desc: "Browse curated luxury venues filtered by ambience, activities, and style.",
  },
  {
    icon: "mdi-seat-outline",
    title: "Choose Your Table",
    desc: "Pick your environment and reserve the perfect spot on a live floor map.",
  },
  {
    icon: "mdi-glass-cocktail",
    title: "Arrive & Enjoy",
    desc: "Staff check you in seamlessly. Your experience begins the moment you arrive.",
  },
];
const features = [
  {
    icon: "mdi-floor-plan",
    title: "Visual Floor Plans",
    desc: "Drag & drop builder for indoors, beach, and terrace environments.",
  },
  {
    icon: "mdi-sync",
    title: "Real-Time Sync",
    desc: "Staff see updates instantly across all devices. No double bookings.",
  },
  {
    icon: "mdi-office-building-marker",
    title: "Multi-Venue Support",
    desc: "Manage multiple venues from one dashboard with ease.",
  },
  {
    icon: "mdi-calendar-check",
    title: "Smart Reservations",
    desc: "Approve, modify and track every reservation with full history.",
  },
];
</script>
