<template>
  <v-main style="background: #0a0e14; min-height: 100vh;">
    <div style="max-width: 860px; margin: 0 auto; padding: 48px 24px 80px;">

      <!-- Header -->
      <div style="margin-bottom: 8px;">
        <div style="font-family: 'Inter', sans-serif; font-size: 0.72rem; letter-spacing: 3px; text-transform: uppercase; color: #d4af37; margin-bottom: 10px;">
          Developer Tool
        </div>
        <h1 style="font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 700; color: #f0ead6; margin: 0 0 8px;">
          Seed &amp; Reset Dev Tool
        </h1>
      </div>

      <!-- Warning -->
      <v-alert
        class="mb-8"
        density="compact"
        style="font-family: 'Inter', sans-serif; font-size: 0.85rem;"
        type="warning"
        variant="tonal"
      >
        This page is for development only. All actions modify localStorage directly.
      </v-alert>

      <!-- Clear All -->
      <v-card class="seed-card mb-6" flat>
        <v-card-text class="pa-5">
          <div class="section-title mb-1">Clear All Data</div>
          <div class="section-desc mb-4">Removes all <code>spotly_*</code> keys from localStorage and reloads the page. Use this to start fresh.</div>
          <v-btn class="danger-btn" flat @click="clearAll">
            <v-icon size="16" start>mdi-delete-sweep-outline</v-icon>
            Clear All Data
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Accounts -->
      <v-card class="seed-card mb-6" flat>
        <v-card-text class="pa-5">
          <div class="section-title mb-1">Accounts</div>
          <div class="section-desc mb-3">Seeds 5 users (1 venue owner, 1 staff, 3 customers), a demo venue, and a VenueStaff record.</div>
          <v-table class="seed-table mb-4" density="compact">
            <thead>
              <tr>
                <th>Email</th>
                <th>Password</th>
                <th>Context</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in accountPreview" :key="u.email">
                <td>{{ u.email }}</td>
                <td><code>{{ u.password }}</code></td>
                <td>{{ u.context }}</td>
              </tr>
            </tbody>
          </v-table>
          <v-btn class="gold-btn" flat @click="seedAccounts">
            <v-icon size="16" start>mdi-account-plus-outline</v-icon>
            Seed Accounts
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Menu Items -->
      <v-card class="seed-card mb-6" flat>
        <v-card-text class="pa-5">
          <div class="section-title mb-1">Menu Items</div>
          <div class="section-desc mb-4">
            Seeds 9 menu items for the selected venue.
            <span v-if="!hasVenues" style="color: #c71585;"> No venues found — register an admin account first.</span>
          </div>
          <v-select
            v-model="selectedMenuVenueId"
            class="spotly-input mb-4"
            density="compact"
            :disabled="!hasVenues"
            hide-details
            item-title="label"
            item-value="id"
            :items="venueOptions"
            label="Venue"
            style="max-width: 340px;"
            variant="outlined"
          />
          <v-btn class="gold-btn" :disabled="!selectedMenuVenueId" flat @click="seedMenuItems">
            <v-icon size="16" start>mdi-silverware-fork-knife</v-icon>
            Seed Menu Items
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Reservations -->
      <v-card class="seed-card mb-6" flat>
        <v-card-text class="pa-5">
          <div class="section-title mb-1">Reservations</div>
          <div class="section-desc mb-3">
            Seeds reservations with mixed statuses for the selected venue on the chosen date.
            <span v-if="!hasVenues" style="color: #c71585;"> No venues found — register an admin account first.</span>
            <span v-else-if="selectedResVenueId && !selectedResVenueHasEnvs" style="color: #c71585;"> Selected venue has no environments — build the floor plan first.</span>
          </div>
          <div class="d-flex flex-wrap ga-3 mb-4">
            <v-select
              v-model="selectedResVenueId"
              class="spotly-input"
              density="compact"
              :disabled="!hasVenues"
              hide-details
              item-title="label"
              item-value="id"
              :items="venueOptions"
              label="Venue"
              style="max-width: 340px;"
              variant="outlined"
            />
            <v-text-field
              v-model="reservationDate"
              class="spotly-input"
              density="compact"
              hide-details
              label="Date"
              style="max-width: 200px;"
              type="date"
              variant="outlined"
            />
          </div>
          <v-btn class="gold-btn" :disabled="!selectedResVenueId || !selectedResVenueHasEnvs" flat @click="seedReservations">
            <v-icon size="16" start>mdi-calendar-plus-outline</v-icon>
            Seed Reservations
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Seed Everything -->
      <v-card class="seed-card" flat style="border-color: rgba(212,175,55,0.4);">
        <v-card-text class="pa-5">
          <div class="section-title mb-1" style="color: #d4af37;">Seed Everything</div>
          <div class="section-desc mb-4">
            Seeds accounts, then menu items and reservations for the first venue in localStorage (if one exists).
          </div>
          <v-btn class="gold-btn" flat size="large" @click="seedAll">
            <v-icon size="18" start>mdi-database-plus-outline</v-icon>
            Seed All
          </v-btn>
        </v-card-text>
      </v-card>

    </div>
  </v-main>

  <!-- Snackbar -->
  <SpotlySnackbar :snackbar="snackbar" />
</template>

<script setup>
  import { computed, ref } from 'vue'
  import SpotlySnackbar from '@/components/feedback/SpotlySnackbar.vue'
  import { useSnackbar } from '@/composables/useSnackbar'
  import { addEnvironment, Environment, ENVIRONMENT_LIST } from '@/datamodel/Environment.js'
  import { addMenuItem, MENU_ITEM_LIST, MenuItem } from '@/datamodel/MenuItem.js'
  import { addReservation, Reservation, RESERVATION_LIST } from '@/datamodel/Reservation.js'
  import { addUser, User, USER_LIST } from '@/datamodel/User.js'
  import { addVenue, Venue, VENUE_LIST } from '@/datamodel/Venue.js'
  import { addVenueStaff, VENUE_STAFF_LIST, VenueStaff } from '@/datamodel/VenueStaff.js'

  const { snackbar, notifySuccess, notifyError } = useSnackbar()

  const today = new Date().toISOString().split('T')[0]
  const reservationDate = ref(today)

  // ── Venue selectors ────────────────────────────────────────────────────────────
  const venueOptions = computed(() =>
    VENUE_LIST.map(v => ({ id: v.id, label: v.name ? `${v.name} (${v.adminEmail || 'no owner'})` : `Venue ${v.id} (${v.adminEmail || 'no owner'})` })),
  )
  const hasVenues = computed(() => VENUE_LIST.length > 0)

  const selectedMenuVenueId = ref(null)
  const selectedResVenueId = ref(null)

  const selectedResVenueHasEnvs = computed(() =>
    selectedResVenueId.value != null
    && ENVIRONMENT_LIST.some(e => e.venueId === selectedResVenueId.value),
  )

  // ── Preview data ───────────────────────────────────────────────────────────────
  const accountPreview = [
    { email: 'admin@spotly.com', password: 'admin123', context: 'Venue Owner' },
    { email: 'staff@spotly.com', password: 'staff123', context: 'Staff' },
    { email: 'client@spotly.com', password: 'client123', context: 'Customer' },
    { email: 'jane.smith@example.com', password: 'password456', context: 'Customer' },
    { email: 'alice.johnson@example.com', password: 'password789', context: 'Customer' },
  ]

  // ── Clear All ──────────────────────────────────────────────────────────────────
  function clearAll () {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('spotly_'))
    for (const k of keys) localStorage.removeItem(k)
    window.location.reload()
  }

  // ── Seed Accounts ─────────────────────────────────────────────────────────────
  function seedAccounts () {
    const seedUsers = [
      new User({ first_name: 'Admin', last_name: 'User', email: 'admin@spotly.com', password: 'admin123' }),
      new User({ first_name: 'Staff', last_name: 'User', email: 'staff@spotly.com', password: 'staff123' }),
      new User({ first_name: 'John', last_name: 'Doe', email: 'client@spotly.com', password: 'client123' }),
      new User({ first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', password: 'password456' }),
      new User({ first_name: 'Alice', last_name: 'Johnson', email: 'alice.johnson@example.com', password: 'password789' }),
    ]
    let added = 0
    for (const u of seedUsers) {
      if (!USER_LIST.some(existing => existing.email === u.email)) {
        addUser(u)
        added++
      }
    }

    // Ensure admin has a venue record
    let adminVenue = VENUE_LIST.find(v => v.adminEmail === 'admin@spotly.com')
    if (!adminVenue) {
      adminVenue = new Venue({ id: Date.now(), name: 'Spotly Demo Venue', description: 'A demo venue for testing.', adminEmail: 'admin@spotly.com' })
      addVenue(adminVenue)
    }

    // Ensure staff has a VenueStaff record linked to the admin venue
    if (!VENUE_STAFF_LIST.some(r => r.userEmail === 'staff@spotly.com')) {
      addVenueStaff(new VenueStaff({ id: Date.now() + 1, venueId: adminVenue.id, userEmail: 'staff@spotly.com' }))
    }

    notifySuccess(`Accounts seeded (${added} new, ${seedUsers.length - added} already existed)`)
  }

  // ── Seed Menu Items ────────────────────────────────────────────────────────────
  function seedMenuItems (venueId = selectedMenuVenueId.value) {
    if (!venueId) return
    const base = Date.now()
    const items = [
      new MenuItem({ id: base + 1, venueId, category: 'starters', name: 'Truffle Fries', price: 18, tags: ['Vegetarian'], allergens: [] }),
      new MenuItem({ id: base + 2, venueId, category: 'starters', name: 'Caesar Salad', price: 15, tags: [], allergens: ['Dairy', 'Eggs'] }),
      new MenuItem({ id: base + 3, venueId, category: 'mains', name: 'Grilled Salmon', price: 35, tags: ['Chef Special'], allergens: ['Fish'] }),
      new MenuItem({ id: base + 4, venueId, category: 'mains', name: 'Beef Wellington', price: 42, tags: ['Popular'], allergens: ['Gluten'] }),
      new MenuItem({ id: base + 5, venueId, category: 'drinks', name: 'Signature Spritz', price: 16, tags: ['Signature'], allergens: [] }),
      new MenuItem({ id: base + 6, venueId, category: 'drinks', name: 'Gold Rush', price: 18, tags: ['Popular'], allergens: [] }),
      new MenuItem({ id: base + 7, venueId, category: 'drinks', name: 'Virgin Sunrise', price: 12, tags: ['Non-Alcoholic'], allergens: [] }),
      new MenuItem({ id: base + 8, venueId, category: 'desserts', name: 'Crème Brûlée', price: 14, tags: ['Classic'], allergens: ['Dairy', 'Eggs'] }),
      new MenuItem({ id: base + 9, venueId, category: 'desserts', name: 'Chocolate Fondant', price: 16, tags: ['Chef\'s Pick'], allergens: ['Dairy', 'Gluten'] }),
    ]
    for (const item of items) addMenuItem(item)
    notifySuccess(`9 menu items seeded for venue ${venueId}`)
  }

  // ── Seed Reservations ──────────────────────────────────────────────────────────
  function seedReservations (venueId = selectedResVenueId.value) {
    if (!venueId) return
    const envs = ENVIRONMENT_LIST.filter(e => e.venueId === venueId)
    if (envs.length === 0) {
      notifyError('No environments found for this venue'); return
    }

    const date = reservationDate.value || today
    const tomorrow = new Date(new Date(date + 'T12:00:00').getTime() + 86_400_000).toISOString().split('T')[0]

    // Pick elements from available environments (tables only)
    const pickEl = (envIndex, elIndex) => {
      const env = envs[envIndex % envs.length]
      const tables = env.elements.filter(el => el.capacity > 0)
      return tables.length > 0 ? { envId: env.id, elId: tables[elIndex % tables.length].id } : null
    }

    const slots = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => pickEl(i % envs.length, i)).filter(Boolean)
    if (slots.length === 0) {
      notifyError('No table elements found in environments'); return
    }

    const names = ['Sarah Smith', 'Marcus Lee', 'Layla Hassan', 'Alex Morgan', 'James Wilson', 'Emma Davis', 'Noah Clark', 'Olivia Brown', 'Liam Jones', 'Sophia White']
    const times = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30']
    const statuses = ['REQUESTED', 'APPROVED', 'REQUESTED', 'CHECKED_IN', 'REQUESTED', 'APPROVED', 'REJECTED', 'REQUESTED', 'APPROVED', 'COMPLETED']
    const dates = [date, date, date, date, date, tomorrow, tomorrow, '2026-01-10', '2026-02-14', '2026-03-01']

    const baseId = RESERVATION_LIST.length > 0 ? Math.max(...RESERVATION_LIST.map(r => r.id)) + 1 : 1

    let added = 0
    for (const [i, slot] of slots.entries()) {
      addReservation(new Reservation({
        id: baseId + i,
        venueId,
        environmentId: slot.envId,
        elementId: slot.elId,
        userId: i >= 7 ? 'client@spotly.com' : '',
        name: names[i],
        email: i >= 7 ? 'client@spotly.com' : '',
        date: dates[i],
        time: times[i % times.length],
        guests: [2, 3, 4, 6, 4, 2, 5, 3, 4, 2][i],
        notes: ['', 'Anniversary', 'Corporate event', 'Birthday dinner', 'Window seat', '', '', '', 'Valentine dinner', ''][i],
        status: statuses[i],
      }))
      added++
    }
    notifySuccess(`${added} reservations seeded for venue ${venueId} on ${date}`)
  }

  // ── Seed All ───────────────────────────────────────────────────────────────────
  function seedAll () {
    seedAccounts()
    const firstVenue = VENUE_LIST[0]
    if (firstVenue) {
      selectedMenuVenueId.value = firstVenue.id
      selectedResVenueId.value = firstVenue.id
      seedMenuItems(firstVenue.id)
      reservationDate.value = today
      seedReservations(firstVenue.id)
    } else {
      notifySuccess('Accounts seeded. No venues found — register an admin to create one.')
      return
    }
    notifySuccess('All data seeded successfully!')
  }
</script>

<style scoped>
.seed-card {
  background: #13181f !important;
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 12px;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: #f0ead6;
}

.section-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.87rem;
  color: #8a8fa8;
  line-height: 1.6;
}

.seed-table {
  background: transparent !important;
}

:deep(.seed-table th) {
  color: #8a8fa8 !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 0.72rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08em !important;
  background: transparent !important;
}

:deep(.seed-table td) {
  color: #b8bcc8 !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 0.85rem !important;
}

code {
  background: rgba(212, 175, 55, 0.1);
  color: #d4af37;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.82rem;
}
</style>
