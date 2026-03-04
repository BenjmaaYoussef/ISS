<template>
  <v-app-bar
    flat
    color="background"
    height="64"
    style="border-bottom: 1px solid rgba(212, 175, 55, 0.18)"
  >
    <v-container
      class="d-flex align-center"
      fluid
      :style="
        compact ? 'padding: 0 16px !important' : 'padding: 0 48px !important'
      "
    >
      <!-- ── Left: Venue Branding ── -->
      <div class="d-flex align-center" style="gap: 16px">
        <!-- Venue name + optional sub-label (e.g. table number) -->
        <div>
          <div class="venue-name">{{ venueName }}</div>
          <div v-if="venueSubLabel" class="venue-sub">{{ venueSubLabel }}</div>
        </div>

        <!-- Powered by Spotly badge -->
        <div
          v-if="showPoweredBy"
          class="d-flex align-center"
          style="
            border-left: 1px solid rgba(212, 175, 55, 0.25);
            padding-left: 14px;
            gap: 6px;
          "
        >
          <img
            src="@/assets/spotlyLogo.png"
            :height="compact ? 18 : 22"
            alt="Spotly"
            style="object-fit: contain; opacity: 0.65"
          />
          <span
            class="powered-text"
            :class="compact ? 'd-none d-sm-inline' : ''"
          >
            Powered by Spotly
          </span>
        </div>
      </div>

      <!-- ── Center slot (step indicators, etc.) ── -->
      <slot name="center" />

      <v-spacer />

      <!-- ── Right: Action slot ── -->
      <slot name="actions">
        <!-- Default actions: My Profile + Logout -->
        <div
          v-if="showDefaultActions"
          class="d-flex align-center"
          style="gap: 12px"
        >
          <v-btn
            variant="outlined"
            color="primary"
            class="btn-outlined-gold"
            style="
              font-size: 0.8rem;
              letter-spacing: 1.5px;
              text-transform: uppercase;
            "
          >
            <v-icon start icon="mdi-account-outline" size="16" />
            My Profile
          </v-btn>
          <v-btn
            variant="text"
            style="
              font-size: 0.8rem;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              color: rgba(255, 255, 255, 0.55);
            "
            @click="$emit('logout')"
          >
            <v-icon start icon="mdi-logout" size="16" />
            Log Out
          </v-btn>
        </div>
      </slot>
    </v-container>
  </v-app-bar>
</template>

<script setup>
defineProps({
  /** Primary venue name displayed as the main heading */
  venueName: {
    type: String,
    required: true,
  },
  /** Optional secondary line below venue name (e.g. "Table #12 — Terrace") */
  venueSubLabel: {
    type: String,
    default: null,
  },
  /** Show the "Powered by Spotly" logo badge */
  showPoweredBy: {
    type: Boolean,
    default: true,
  },
  /** Show the default My Profile + Logout button pair */
  showDefaultActions: {
    type: Boolean,
    default: true,
  },
  /** Reduce horizontal padding for dense layouts (e.g. mobile menu page) */
  compact: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["logout"]);
</script>

<style scoped>
.venue-name {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 700;
  color: #d4af37;
  letter-spacing: 0.5px;
  line-height: 1.2;
  white-space: nowrap;
}
.venue-sub {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7a8d;
  margin-top: 1px;
}
.powered-text {
  font-family: var(--font-body);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.55);
}
</style>
