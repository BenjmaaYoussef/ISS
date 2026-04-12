<template>
  <v-app-bar
    color="background"
    flat
    height="64"
    style="border-bottom: 1px solid rgba(212, 175, 55, 0.18)"
  >
    <div class="bar-inner d-flex align-center" style="padding: 0 32px; width: 100%">

      <!-- ── Left: Spotly Logo ── -->
      <div class="logo-area" @click="router.push('/home')">
        <img alt="Spotly" height="32" src="@/assets/spotlyLogo.png" style="object-fit: contain">
      </div>

      <!-- ── Center: Nav tabs ── -->
      <div v-if="navLinks.length > 0" class="nav-links d-flex align-center ga-1 ml-8">
        <v-btn
          v-for="link in navLinks"
          :key="link.key"
          class="nav-btn"
          :class="{ 'nav-btn--active': activeLink === link.key }"
          size="small"
          variant="text"
          @click="$emit('nav', link.key)"
        >
          <v-icon v-if="link.icon" class="mr-1" :icon="link.icon" size="14" />
          {{ link.label }}
        </v-btn>
      </div>

      <v-spacer />

      <!-- ── Extra slot (e.g. live indicator, mode toggle) ── -->
      <slot name="actions" />

      <!-- ── Right: Avatar dropdown ── -->
      <NavAvatarMenu />

    </div>
  </v-app-bar>
</template>

<script setup>
  import { useRouter } from 'vue-router'

  defineProps({
    navLinks: { type: Array, default: () => [] },
    activeLink: { type: String, default: null },
  })

  defineEmits(['nav'])

  const router = useRouter()
</script>

<style scoped>
.logo-area {
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

/* ── Nav tabs ── */
.nav-btn {
  color: #6b7a8d !important;
  font-family: var(--font-body);
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: color 0.2s;
}
.nav-btn:hover { color: #d4af37 !important; }
.nav-btn--active { color: #d4af37 !important; }

</style>
