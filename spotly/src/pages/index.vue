<template>
  <v-container class="py-10">
    <h1 class="spotly-heading text-h3 text-center mb-1">Spotly</h1>
    <p class="text-center text-medium-emphasis mb-8">
      Luxury Venue Booking &amp; Experience Management System
    </p>

    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-6">
          <v-card-title class="spotly-heading text-h6 mb-4"
            >Pages — Dev Navigation</v-card-title
          >

          <p class="text-overline text-primary mb-2">Public / Client</p>
          <v-list density="compact" bg-color="transparent">
            <v-list-item
              v-for="p in publicPages"
              :key="p.route"
              :to="p.route"
              :prepend-icon="p.icon"
            >
              <v-list-item-title>{{ p.label }}</v-list-item-title>
              <template #append
                ><v-chip size="x-small" color="primary" variant="tonal">{{
                  p.id
                }}</v-chip></template
              >
            </v-list-item>
          </v-list>

          <v-divider class="my-4" />
          <p class="text-overline text-primary mb-2">Admin</p>
          <v-list density="compact" bg-color="transparent">
            <v-list-item
              v-for="p in adminPages"
              :key="p.route"
              :to="p.route"
              :prepend-icon="p.icon"
            >
              <v-list-item-title>{{ p.label }}</v-list-item-title>
              <template #append
                ><v-chip size="x-small" color="primary" variant="tonal">{{
                  p.id
                }}</v-chip></template
              >
            </v-list-item>
          </v-list>

          <v-divider class="my-4" />
          <p class="text-overline text-primary mb-2">Staff</p>
          <v-list density="compact" bg-color="transparent">
            <v-list-item
              v-for="p in staffPages"
              :key="p.route"
              :to="p.route"
              :prepend-icon="p.icon"
            >
              <v-list-item-title>{{ p.label }}</v-list-item-title>
              <template #append
                ><v-chip size="x-small" color="primary" variant="tonal">{{
                  p.id
                }}</v-chip></template
              >
            </v-list-item>
          </v-list>

          <v-divider class="my-4" />
          <p class="text-overline text-primary mb-2">Modals</p>
          <v-list density="compact" bg-color="transparent">
            <v-list-item
              v-for="p in modalPages"
              :key="p.route"
              :to="p.route"
              :prepend-icon="p.icon"
            >
              <v-list-item-title>{{ p.label }}</v-list-item-title>
              <template #append
                ><v-chip size="x-small" color="primary" variant="tonal">{{
                  p.id
                }}</v-chip></template
              >
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const publicPages = [
  {
    id: "P1",
    label: "App Landing Page",
    route: "/landing",
    icon: "mdi-home-outline",
  },
  {
    id: "P2",
    label: "Global Authentication",
    route: "/auth",
    icon: "mdi-account-circle-outline",
  },
  {
    id: "P3",
    label: "Venue Landing Page",
    route: "/venue/demo",
    icon: "mdi-store-outline",
  },
  {
    id: "P4",
    label: "Environment Selection (Booking 1)",
    route: "/booking/environment",
    icon: "mdi-map-marker-outline",
  },
  {
    id: "P5",
    label: "Seat Selection v5.0 (Booking 2)",
    route: "/booking/seats",
    icon: "mdi-seat-outline",
  },
  {
    id: "P6",
    label: "Reservation Confirm & Notes (Booking 3)",
    route: "/booking/confirm",
    icon: "mdi-check-circle-outline",
  },
  {
    id: "P19",
    label: "Reservation Awaiting Screen (Booking 4)",
    route: "/booking/awaiting",
    icon: "mdi-progress-clock",
  },
  {
    id: "P13",
    label: "Client Dashboard",
    route: "/client/dashboard",
    icon: "mdi-view-dashboard-outline",
  },
  {
    id: "P13.1",
    label: "Client Home (Venue Discovery)",
    route: "/home",
    icon: "mdi-home-search-outline",
  },
  {
    id: "P15",
    label: "Digital Menu (QR View)",
    route: "/menu/demo",
    icon: "mdi-qrcode-scan",
  },
];
const adminPages = [
  {
    id: "P9",
    label: "Admin Dashboard",
    route: "/admin/dashboard",
    icon: "mdi-view-dashboard-outline",
  },
  {
    id: "P10",
    label: "Floor Plan Builder v3.0",
    route: "/admin/floor-plan",
    icon: "mdi-floor-plan",
  },
  {
    id: "P11",
    label: "Menu Manager",
    route: "/admin/menu",
    icon: "mdi-silverware-fork-knife",
  },
  {
    id: "P12",
    label: "Reservation Approval Queue",
    route: "/admin/reservations",
    icon: "mdi-clipboard-check-outline",
  },
];
const staffPages = [
  {
    id: "P14",
    label: "Staff Live Dashboard",
    route: "/staff/dashboard",
    icon: "mdi-account-hard-hat-outline",
  },
];
const modalPages = [
  {
    id: "D1",
    label: "Delete Constraint Warning",
    route: "/modals/delete-constraint",
    icon: "mdi-alert-outline",
  },
  {
    id: "D2",
    label: "Guest Check-In & Operational Notes",
    route: "/modals/guest-check-in",
    icon: "mdi-account-check-outline",
  },
];
</script>
