<template>
  <v-app-bar
    color="background"
    flat
    height="64"
    style="border-bottom: 1px solid rgba(212, 175, 55, 0.18)"
  >
    <div
      class="navbar-inner d-flex align-center"
      :style="{
        padding: '0 ' + (dense ? '16px' : '32px'),
        width: '100%',
      }"
    >
      <!-- ── Logo ── -->
      <div
        class="logo-area d-flex align-center"
        style="cursor: pointer; margin-right: 32px; flex-shrink: 0"
        @click="$router.push('/')"
      >
        <img
          alt="Spotly"
          :height="dense ? 28 : 34"
          src="@/assets/spotlyLogo.png"
          style="object-fit: contain"
        >
      </div>

      <!-- ── Nav Links (horizontal tabs) ── -->
      <div v-if="navLinks.length > 0" class="nav-links d-flex align-center ga-1">
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

      <!-- ── Nav Tabs (pill style — for staff dashboard) ── -->
      <div v-if="navTabs.length > 0" class="nav-tabs d-flex align-center ml-8 ga-1">
        <div
          v-for="tab in navTabs"
          :key="tab.key"
          class="nav-tab"
          :class="{ 'nav-tab--active': activeLink === tab.key }"
          @click="$emit('nav', tab.key)"
        >
          <v-icon class="mr-1" size="14">{{ tab.icon }}</v-icon>
          {{ tab.label }}
        </div>
      </div>

      <v-spacer />

      <!-- ── Right-side slot (alerts, live dot, back btn, etc.) ── -->
      <slot name="actions" />

      <!-- ── Default: back-to-home link (auth page style) ── -->
      <template v-if="showBackLink && !$slots.actions">
        <v-btn
          style="
            color: rgba(255, 255, 255, 0.55);
            font-size: 0.82rem;
            letter-spacing: 1.5px;
            text-transform: uppercase;
          "
          to="/landing"
          variant="text"
        >
          <v-icon icon="mdi-arrow-left" size="16" start />
          Back to Home
        </v-btn>
      </template>

      <!-- ── Default: admin avatar + logout ── -->
      <div v-if="adminLabel" class="d-flex align-center ga-2 ml-4">
        <v-avatar class="admin-avatar" size="32">
          <span class="text-caption font-weight-bold">
            {{ adminInitials }}
          </span>
        </v-avatar>
        <span class="admin-name d-none d-sm-inline">{{ adminLabel }}</span>
        <v-btn
          v-if="showLogout"
          icon
          size="small"
          style="color: rgba(255,255,255,0.4)"
          title="Logout"
          variant="text"
          @click="$emit('logout')"
        >
          <v-icon size="18">mdi-logout</v-icon>
        </v-btn>
      </div>
    </div>
  </v-app-bar>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    /**
     * Horizontal text links (admin style).
     * Each: { key: string, label: string, icon?: string }
     */
    navLinks: {
      type: Array,
      default: () => [],
    },
    /**
     * Pill-style tab links (staff dashboard style).
     * Each: { key: string, label: string, icon: string }
     */
    navTabs: {
      type: Array,
      default: () => [],
    },
    /** Key of the currently active link/tab */
    activeLink: {
      type: String,
      default: null,
    },
    /** Show "← Back to Home" on the right (auth page) */
    showBackLink: {
      type: Boolean,
      default: false,
    },
    /** Display name for the admin avatar section */
    adminLabel: {
      type: String,
      default: null,
    },
    /** Compact horizontal padding */
    dense: {
      type: Boolean,
      default: false,
    },
    /** Show logout icon next to admin avatar */
    showLogout: {
      type: Boolean,
      default: false,
    },
  })

  defineEmits(['nav', 'logout'])

  const adminInitials = computed(() => {
    if (!props.adminLabel) return ''
    return props.adminLabel
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  })
</script>

<style scoped>
/* Nav links (text row — admin/reservations style) */
.nav-btn {
  color: #6b7a8d !important;
  font-family: var(--font-body);
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: color 0.2s;
}
.nav-btn:hover {
  color: #d4af37 !important;
}
.nav-btn--active {
  color: #d4af37 !important;
}

/* Nav tabs (pill row — staff dashboard style) */
.nav-tab {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 500;
  color: #6b7a8d;
  cursor: pointer;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition:
    color 0.2s,
    background 0.2s;
  display: flex;
  align-items: center;
}
.nav-tab:hover {
  color: #d4af37;
  background: rgba(212, 175, 55, 0.06);
}
.nav-tab--active {
  color: #d4af37 !important;
  background: rgba(212, 175, 55, 0.1);
}

/* Admin avatar */
.admin-avatar {
  background: rgba(212,175,55,0.18) !important;
  border: 1px solid rgba(212, 175, 55, 0.4) !important;
  color: #d4af37 !important;
  font-weight: 700;
}
.admin-name {
  color: #6b7a8d;
  font-size: 0.82rem;
  font-family: var(--font-body);
}
</style>
