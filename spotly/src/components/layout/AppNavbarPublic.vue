<template>
  <v-app-bar
    color="background"
    flat
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
        @click="$router.push('/landing')"
      >
        <svg fill="none" height="38" viewBox="0 0 100 100" width="38">
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="#D4AF37"
            stroke-width="3"
          />
          <line
            stroke="#D4AF37"
            stroke-linecap="round"
            stroke-width="3"
            x1="50"
            x2="50"
            y1="4"
            y2="18"
          />
          <line
            stroke="#D4AF37"
            stroke-linecap="round"
            stroke-width="3"
            x1="50"
            x2="50"
            y1="82"
            y2="96"
          />
          <line
            stroke="#D4AF37"
            stroke-linecap="round"
            stroke-width="3"
            x1="4"
            x2="18"
            y1="50"
            y2="50"
          />
          <line
            stroke="#D4AF37"
            stroke-linecap="round"
            stroke-width="3"
            x1="82"
            x2="96"
            y1="50"
            y2="50"
          />
          <line
            opacity="0.3"
            stroke="#D4AF37"
            stroke-width="2"
            x1="20"
            x2="80"
            y1="20"
            y2="80"
          />
          <line
            opacity="0.3"
            stroke="#D4AF37"
            stroke-width="2"
            x1="80"
            x2="20"
            y1="20"
            y2="80"
          />
          <path
            d="M38 65 L38 45 Q38 38 46 38 L58 38 Q64 38 64 44 L64 52 L44 52 L44 65"
            fill="none"
            stroke="#D4AF37"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
          />
          <path
            d="M38 65 L60 65"
            stroke="#D4AF37"
            stroke-linecap="round"
            stroke-width="2.5"
          />
          <path
            d="M42 65 L40 74"
            stroke="#D4AF37"
            stroke-linecap="round"
            stroke-width="2.5"
          />
          <path
            d="M56 65 L58 74"
            stroke="#D4AF37"
            stroke-linecap="round"
            stroke-width="2.5"
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
          style="
            color: rgba(255, 255, 255, 0.65);
            font-size: 0.88rem;
            letter-spacing: 0.5px;
            border-radius: 0;
          "
          variant="text"
          @click="scrollTo(link)"
        >
          {{ link }}
        </v-btn>
      </div>

      <!-- Sign Up + Login buttons -->
      <div class="d-flex" style="gap: 8px">
        <v-btn
          color="primary"
          style="
            border-radius: 0;
            font-size: 0.8rem;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #0a0e14;
          "
          to="/auth?mode=register"
          variant="flat"
        >
          Sign Up
        </v-btn>
        <v-btn
          color="primary"
          style="
            border-radius: 0;
            font-size: 0.8rem;
            letter-spacing: 1.5px;
            text-transform: uppercase;
          "
          :to="loginRoute"
          variant="outlined"
        >
          Login
        </v-btn>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup>
  defineProps({
    navLinks: {
      type: Array,
      default: () => ['Features', 'How It Works'],
    },
    loginRoute: {
      type: String,
      default: '/auth',
    },
  })

  function scrollTo (label) {
    const anchor = '#' + label.toLowerCase().replace(/\s+/g, '-')
    const el = document.querySelector(anchor)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }
</script>
