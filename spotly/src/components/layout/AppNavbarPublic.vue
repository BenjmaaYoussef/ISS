<template>
  <v-app-bar
    flat
    color="background"
    style="border-bottom: 1px solid rgba(212, 175, 55, 0.18)"
  >
    <v-container
      class="d-flex align-center"
      fluid
      style="padding: 0 48px !important"
    >
      <!-- LOGO (marketing SVG compass) -->
      <div
        class="d-flex align-center"
        style="gap: 10px; cursor: pointer"
        @click="$router.push('/')"
      >
        <svg width="38" height="38" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="46" stroke="#D4AF37" stroke-width="3" />
          <line
            x1="50"
            y1="4"
            x2="50"
            y2="18"
            stroke="#D4AF37"
            stroke-width="3"
            stroke-linecap="round"
          />
          <line
            x1="50"
            y1="82"
            x2="50"
            y2="96"
            stroke="#D4AF37"
            stroke-width="3"
            stroke-linecap="round"
          />
          <line
            x1="4"
            y1="50"
            x2="18"
            y2="50"
            stroke="#D4AF37"
            stroke-width="3"
            stroke-linecap="round"
          />
          <line
            x1="82"
            y1="50"
            x2="96"
            y2="50"
            stroke="#D4AF37"
            stroke-width="3"
            stroke-linecap="round"
          />
          <line
            x1="20"
            y1="20"
            x2="80"
            y2="80"
            stroke="#D4AF37"
            stroke-width="2"
            opacity="0.3"
          />
          <line
            x1="80"
            y1="20"
            x2="20"
            y2="80"
            stroke="#D4AF37"
            stroke-width="2"
            opacity="0.3"
          />
          <path
            d="M38 65 L38 45 Q38 38 46 38 L58 38 Q64 38 64 44 L64 52 L44 52 L44 65"
            stroke="#D4AF37"
            stroke-width="2.5"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M38 65 L60 65"
            stroke="#D4AF37"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <path
            d="M42 65 L40 74"
            stroke="#D4AF37"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <path
            d="M56 65 L58 74"
            stroke="#D4AF37"
            stroke-width="2.5"
            stroke-linecap="round"
          />
        </svg>
        <span class="brand-logo">Spotly</span>
      </div>

      <v-spacer />

      <!-- Center nav links -->
      <div class="d-none d-md-flex mr-8" style="gap: 8px">
        <v-btn
          v-for="link in navLinks"
          :key="link"
          variant="text"
          style="
            color: rgba(255, 255, 255, 0.65);
            font-size: 0.88rem;
            letter-spacing: 0.5px;
            border-radius: 0;
          "
        >
          {{ link }}
        </v-btn>
      </div>

      <!-- Login button -->
      <v-btn
        variant="outlined"
        color="primary"
        :to="loginRoute"
        style="
          border-radius: 0;
          font-size: 0.8rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        "
      >
        Login
      </v-btn>
    </v-container>
  </v-app-bar>
</template>

<script setup>
defineProps({
  navLinks: {
    type: Array,
    default: () => ["Features", "Pricing", "About Us"],
  },
  loginRoute: {
    type: String,
    default: "/auth",
  },
});
</script>
