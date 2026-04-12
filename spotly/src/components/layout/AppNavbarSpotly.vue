<template>
  <!-- ══ Mobile Slide-Over Drawer ══ -->
  <v-navigation-drawer
    v-model="drawerOpen"
    class="spotly-drawer"
    location="left"
    temporary
    width="272"
  >
    <!-- Brand header -->
    <div class="drawer-brand">
      <div class="drawer-brand__logo" @click="router.push('/home'); drawerOpen = false">
        <img alt="Spotly" height="26" src="@/assets/spotlyLogo.png" style="object-fit:contain">
      </div>
      <span class="drawer-brand__pill">Admin</span>
      <v-btn
        class="drawer-close"
        aria-label="Close menu"
        density="compact"
        icon
        :ripple="false"
        variant="text"
        @click="drawerOpen = false"
      >
        <v-icon size="18">mdi-close</v-icon>
      </v-btn>
    </div>

    <div class="drawer-sep" />

    <!-- Nav items -->
    <v-list class="drawer-nav" nav>
      <v-list-item
        v-for="link in navLinks"
        :key="link.key"
        class="drawer-item"
        :class="{ 'drawer-item--active': activeLink === link.key }"
        :prepend-icon="link.icon || navIcons[link.key] || 'mdi-circle-small'"
        rounded="lg"
        :title="link.label"
        @click="$emit('nav', link.key); drawerOpen = false"
      />
    </v-list>

    <!-- Footer: avatar -->
    <template #append>
      <div class="drawer-sep" />
      <div class="drawer-footer">
        <NavAvatarMenu />
      </div>
    </template>
  </v-navigation-drawer>

  <!-- ══ Top App Bar ══ -->
  <v-app-bar class="spotly-bar" color="#0a0e14" elevation="0" height="60">
    <div class="bar-inner">

      <!-- Hamburger — mobile only -->
      <v-btn
        class="bar-hamburger"
        aria-label="Open navigation menu"
        density="compact"
        icon
        :ripple="false"
        variant="text"
        @click="drawerOpen = !drawerOpen"
      >
        <v-icon size="20">mdi-menu</v-icon>
      </v-btn>

      <!-- Brand -->
      <div class="bar-brand" role="button" tabindex="0" @click="router.push('/home')" @keydown.enter="router.push('/home')">
        <img alt="Spotly" height="28" src="@/assets/spotlyLogo.png" style="object-fit:contain">
        <span class="bar-brand__sep" />
        <span class="bar-brand__admin">Admin</span>
      </div>

      <!-- Desktop nav -->
      <nav v-if="navLinks.length" class="bar-nav" aria-label="Admin navigation">
        <v-btn
          v-for="link in navLinks"
          :key="link.key"
          class="bar-link"
          :class="{ 'bar-link--active': activeLink === link.key }"
          :ripple="false"
          variant="text"
          @click="$emit('nav', link.key)"
        >
          {{ link.label }}
        </v-btn>
      </nav>

      <v-spacer />

      <!-- Extra actions slot -->
      <slot name="actions" />

      <!-- Avatar — desktop only -->
      <div class="bar-avatar">
        <NavAvatarMenu />
      </div>

    </div>
  </v-app-bar>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  defineProps({
    navLinks: { type: Array, default: () => [] },
    activeLink: { type: String, default: null },
  })

  defineEmits(['nav'])

  const router = useRouter()
  const drawerOpen = ref(false)

  /* Fallback icon map — used only when navLinks items don't carry an icon field */
  const navIcons = {
    dashboard:       'mdi-view-dashboard-outline',
    builder:         'mdi-floor-plan',
    menu:            'mdi-silverware-fork-knife',
    reservations:    'mdi-calendar-clock-outline',
    'qr-codes':      'mdi-qrcode',
    'venue-settings':'mdi-tune-vertical',
  }
</script>

<style scoped>
/* ═══════════════════════════════════════════
   TOKENS
═══════════════════════════════════════════ */
.spotly-bar,
.spotly-drawer {
  --gold:        #d4af37;
  --gold-dim:    rgba(212, 175, 55, 0.12);
  --gold-border: rgba(212, 175, 55, 0.20);
  --gold-hover:  rgba(212, 175, 55, 0.07);
  --midnight:    #0a0e14;
  --surface:     #13181f;
  --text-dim:    rgba(255, 255, 255, 0.48);
  --text-mid:    rgba(255, 255, 255, 0.70);
  --text-bright: rgba(255, 255, 255, 0.92);
  --radius:      8px;
  --dur:         0.18s;
}

/* ═══════════════════════════════════════════
   APP BAR
═══════════════════════════════════════════ */
.spotly-bar {
  border-bottom: 1px solid rgba(212, 175, 55, 0.13) !important;
  backdrop-filter: blur(12px) saturate(1.3);
  background: rgba(10, 14, 20, 0.92) !important;
}

.bar-inner {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 24px;
  gap: 0;
}

/* ── Brand ── */
.bar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
  padding: 6px 4px;
  border-radius: var(--radius);
  transition: opacity var(--dur) ease;
  outline: none;
}
.bar-brand:hover { opacity: 0.82; }
.bar-brand:focus-visible {
  outline: 2px solid var(--gold-border);
  outline-offset: 2px;
}

.bar-brand__sep {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

.bar-brand__admin {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gold);
  opacity: 0.85;
}

/* ── Desktop nav ── */
.bar-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 28px;
}

/* v-btn overrides for nav links */
.bar-link {
  height: 36px !important;
  min-width: unset !important;
  padding: 0 13px !important;
  border-radius: var(--radius) !important;
  background: transparent !important;
  color: var(--text-dim) !important;
  border: 1px solid transparent !important;
  transition:
    color      var(--dur) ease,
    background var(--dur) ease,
    border-color var(--dur) ease !important;
}

/* Override Vuetify typography defaults on the inner content */
.bar-link :deep(.v-btn__content) {
  font-family: var(--font-body, 'Inter', sans-serif) !important;
  font-size: 0.82rem !important;
  font-weight: 500 !important;
  letter-spacing: 0.01em !important;
  text-transform: none !important;
  white-space: nowrap;
}

.bar-link:hover {
  color: var(--text-bright) !important;
  background: var(--gold-hover) !important;
}

/* Active pill */
.bar-link--active {
  color: var(--gold) !important;
  background: var(--gold-dim) !important;
  border-color: var(--gold-border) !important;
}

.bar-link--active :deep(.v-btn__content) {
  font-weight: 600 !important;
}

/* Suppress Vuetify hover overlay on our v-btn */
.bar-link :deep(.v-btn__overlay) { display: none; }

/* ── Hamburger ── */
.bar-hamburger {
  color: var(--text-mid) !important;
  margin-right: 8px;
  display: none !important;
}
.bar-hamburger:hover {
  color: var(--text-bright) !important;
  background: var(--gold-hover) !important;
}
.bar-hamburger :deep(.v-btn__overlay) { display: none; }

/* ── Avatar wrapper ── */
.bar-avatar {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

/* ═══════════════════════════════════════════
   DRAWER
═══════════════════════════════════════════ */
.spotly-drawer {
  background: var(--surface) !important;
  border-right: 1px solid rgba(212, 175, 55, 0.10) !important;
}

/* Brand row */
.drawer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 16px 14px;
  min-height: 60px;
}

.drawer-brand__logo {
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: opacity var(--dur) ease;
}
.drawer-brand__logo:hover { opacity: 0.8; }

.drawer-brand__pill {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gold);
  background: var(--gold-dim);
  border: 1px solid var(--gold-border);
  border-radius: 4px;
  padding: 2px 7px;
  line-height: 1.6;
  flex-shrink: 0;
}

/* v-btn close */
.drawer-close {
  margin-left: auto !important;
  color: var(--text-dim) !important;
}
.drawer-close:hover {
  color: var(--text-bright) !important;
  background: rgba(255, 255, 255, 0.06) !important;
}
.drawer-close :deep(.v-btn__overlay) { display: none; }

/* Divider */
.drawer-sep {
  height: 1px;
  background: rgba(212, 175, 55, 0.10);
  margin: 0 16px;
}

/* v-list wrapper */
.drawer-nav {
  padding: 12px 10px !important;
}

/* v-list-item overrides */
.drawer-item {
  position: relative !important;
  min-height: 44px !important;
  color: var(--text-dim) !important;
  transition:
    color      var(--dur) ease,
    background var(--dur) ease !important;
}

.drawer-item :deep(.v-list-item-title) {
  font-family: var(--font-body, 'Inter', sans-serif) !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  letter-spacing: 0.01em !important;
}

.drawer-item :deep(.v-list-item__prepend .v-icon) {
  color: inherit !important;
  opacity: 0.75;
  margin-inline-end: 12px !important;
}

.drawer-item:hover {
  color: var(--text-bright) !important;
  background: rgba(255, 255, 255, 0.04) !important;
}

/* Suppress Vuetify hover overlay */
.drawer-item :deep(.v-list-item__overlay) { display: none; }

.drawer-item--active {
  color: var(--gold) !important;
  background: var(--gold-dim) !important;
}

.drawer-item--active :deep(.v-list-item-title) {
  font-weight: 600 !important;
}

.drawer-item--active :deep(.v-list-item__prepend .v-icon) {
  opacity: 1;
}

/* Left accent bar on active item */
.drawer-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 55%;
  border-radius: 0 3px 3px 0;
  background: var(--gold);
  z-index: 1;
}

/* Footer */
.drawer-footer {
  padding: 12px 16px 16px;
}

/* ═══════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════ */
@media (max-width: 959px) {
  .bar-hamburger  { display: inline-flex !important; }
  .bar-nav        { display: none !important; }
  .bar-avatar     { display: none; }
  .bar-brand__sep,
  .bar-brand__admin { display: none; }
  .bar-inner      { padding: 0 12px; }
}

/* ═══════════════════════════════════════════
   REDUCED MOTION
═══════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .bar-link,
  .bar-hamburger,
  .bar-brand,
  .drawer-item,
  .drawer-close {
    transition: none !important;
  }
}
</style>
