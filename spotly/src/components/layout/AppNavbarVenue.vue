<template>
  <v-app-bar
    color="background"
    flat
    height="64"
    style="border-bottom: 1px solid rgba(212, 175, 55, 0.18)"
  >
    <v-container
      class="d-flex align-center"
      fluid
      :style="
        mobile || compact
          ? 'padding: 0 12px !important'
          : 'padding: 0 48px !important'
      "
    >
      <!-- ── Left: Venue Branding ── -->
      <div class="d-flex align-center" style="gap: 12px; min-width: 0">
        <!-- Venue name + optional sub-label (e.g. table number) -->
        <div style="min-width: 0" @click="venueId ? goToVenue() : undefined">
          <div
            class="venue-name"
            :class="[{ 'venue-name--sm': mobile }, { 'venue-name--link': !!venueId }]"
          >{{ venueName }}</div>
          <div v-if="venueSubLabel" class="venue-sub">{{ venueSubLabel }}</div>
        </div>

        <!-- Powered by Spotly badge — logo only on mobile -->
        <div
          v-if="showPoweredBy"
          class="d-flex align-center"
          style="
            border-left: 1px solid rgba(212, 175, 55, 0.25);
            padding-left: 12px;
            gap: 6px;
            flex-shrink: 0;
          "
        >
          <img
            alt="Spotly"
            :height="mobile ? 16 : compact ? 18 : 22"
            src="@/assets/spotlyLogo.png"
            style="object-fit: contain; opacity: 0.65"
          >
          <span v-if="!mobile" class="powered-text">
            Powered by Spotly
          </span>
        </div>
      </div>

      <!-- ── Center slot (step indicators, etc.) ── -->
      <slot name="center" />

      <v-spacer />

      <!-- ── Right: Action slot ── -->
      <slot name="actions">
        <NavAvatarMenu v-if="showDefaultActions" />
      </slot>
    </v-container>
  </v-app-bar>
</template>

<script setup>
  import { useDisplay } from 'vuetify'
  import { useRouter } from 'vue-router'

  const { mobile } = useDisplay()
  const router = useRouter()

  const props = defineProps({
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
    /** Show the default NavAvatarMenu dropdown */
    showDefaultActions: {
      type: Boolean,
      default: true,
    },
    /** Reduce horizontal padding for dense layouts (e.g. mobile menu page) */
    compact: {
      type: Boolean,
      default: false,
    },
    /** When provided, venue name becomes a link that aborts booking and returns to the venue page */
    venueId: {
      type: Number,
      default: null,
    },
  })

  function goToVenue () {
    sessionStorage.removeItem('spotly_cart')
    sessionStorage.removeItem('spotly_booking')
    sessionStorage.removeItem('spotly_selected_env')
    sessionStorage.removeItem('spotly_pending_reservation_id')
    router.push(`/venue/${props.venueId}`)
  }

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
  overflow: hidden;
  text-overflow: ellipsis;
}
.venue-name--sm {
  font-size: 1rem;
}
.venue-name--link {
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.venue-name--link:hover {
  opacity: 0.75;
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
