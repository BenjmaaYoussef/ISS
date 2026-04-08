<template>
  <v-menu v-if="session" offset="8" min-width="200">
    <template #activator="{ props: menuProps }">
      <div class="avatar-trigger" v-bind="menuProps">
        <div class="avatar-ring">{{ initials }}</div>
        <span class="avatar-name">{{ session.name }}</span>
        <v-icon size="16" color="#6b7a8d">mdi-chevron-down</v-icon>
      </div>
    </template>
    <v-list class="switcher-menu" density="compact">
      <v-list-item
        v-for="item in menuItems"
        :key="item.to"
        :prepend-icon="item.icon"
        :title="item.label"
        class="switcher-item"
        @click="router.push(item.to)"
      />
      <v-divider class="my-1" style="border-color: rgba(255,255,255,0.08)" />
      <v-list-item
        prepend-icon="mdi-logout"
        title="Logout"
        class="switcher-item switcher-item--danger"
        @click="logout"
      />
    </v-list>
  </v-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getVenueByAdminEmail } from '@/datamodel/Venue.js'
import { isVenueStaff } from '@/datamodel/VenueStaff.js'

const router = useRouter()

let session = null
try { session = JSON.parse(localStorage.getItem('spotly_session') || 'null') } catch {}

const initials = computed(() => {
  if (!session?.name) return '?'
  return session.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
})

const isOwner = computed(() => !!session && !!getVenueByAdminEmail(session.email))
const isStaff = computed(() => !!session && isVenueStaff(session.email))

const menuItems = computed(() => {
  const items = []
  if (isOwner.value)
    items.push({ label: 'Manage My Venue', icon: 'mdi-storefront-outline', to: '/admin/dashboard' })
  if (isStaff.value)
    items.push({ label: 'Staff Dashboard', icon: 'mdi-view-dashboard-outline', to: '/staff/dashboard' })
  items.push({ label: 'My Bookings', icon: 'mdi-calendar-heart-outline', to: '/client/dashboard' })
  return items
})

function logout() {
  localStorage.removeItem('spotly_session')
  router.push('/auth')
}
</script>

<style scoped>
.avatar-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
  margin-left: 12px;
}
.avatar-trigger:hover { background: rgba(212, 175, 55, 0.08); }

.avatar-ring {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.18);
  border: 1.5px solid rgba(212, 175, 55, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 0.75rem;
  font-weight: 700;
  color: #d4af37;
  flex-shrink: 0;
}

.avatar-name {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.75);
  font-family: var(--font-body);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.switcher-menu {
  background: #13181f !important;
  border: 1px solid rgba(212, 175, 55, 0.18) !important;
  border-radius: 10px !important;
  padding: 6px !important;
}
.switcher-item {
  border-radius: 6px !important;
  font-size: 0.85rem !important;
  color: rgba(255, 255, 255, 0.75) !important;
  min-height: 38px !important;
}
.switcher-item:hover {
  background: rgba(212, 175, 55, 0.08) !important;
  color: #d4af37 !important;
}
.switcher-item :deep(.v-icon) {
  color: #6b7a8d !important;
  font-size: 16px !important;
}
.switcher-item:hover :deep(.v-icon) { color: #d4af37 !important; }
.switcher-item--danger:hover {
  background: rgba(239, 68, 68, 0.08) !important;
  color: #ef4444 !important;
}
.switcher-item--danger:hover :deep(.v-icon) { color: #ef4444 !important; }
</style>
