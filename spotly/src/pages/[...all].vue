<template>
  <v-app>
    <v-main style="background: #0a0e14; min-height: 100vh">
      <div class="not-found-container">
        <div class="not-found-code">404</div>
        <div class="not-found-title">Page Not Found</div>
        <p class="not-found-sub">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <v-btn
          class="gold-btn mt-6"
          flat
          @click="goHome"
        >
          <v-icon size="16" start>mdi-home-outline</v-icon>
          Go Home
        </v-btn>
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { getVenueByAdminEmail } from '@/datamodel/Venue.js'
  import { isVenueStaff } from '@/datamodel/VenueStaff.js'

  const router = useRouter()

  const homeRoute = computed(() => {
    try {
      const session = JSON.parse(localStorage.getItem('spotly_session') || 'null')
      if (!session) return '/landing'
      if (getVenueByAdminEmail(session.email)) return '/admin/dashboard'
      if (isVenueStaff(session.email)) return '/staff/dashboard'
      return '/home'
    } catch {
      return '/landing'
    }
  })

  function goHome () {
    router.push(homeRoute.value)
  }
</script>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px;
  text-align: center;
}

.not-found-code {
  font-family: var(--font-heading);
  font-size: clamp(80px, 15vw, 160px);
  font-weight: 700;
  color: #D4AF37;
  line-height: 1;
  opacity: 0.85;
}

.not-found-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 16px;
}

.not-found-sub {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 12px;
  max-width: 380px;
}

.gold-btn {
  background: #D4AF37 !important;
  color: #0A0E14 !important;
  font-size: 0.8rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 0 28px;
  height: 42px;
  border-radius: 0;
}
</style>
