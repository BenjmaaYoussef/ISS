<template>
  <!-- ── Top Navigation Bar ── -->
  <AppNavbarVenue
    venue-name="Spotly"
    venue-sub-label="Venue Discovery"
    :show-powered-by="false"
    :show-default-actions="false"
  >
    <template #actions>
      <v-btn
        variant="text"
        class="back-btn"
        size="small"
        @click="$router.push('/client/dashboard')"
      >
        <v-icon start size="14">mdi-arrow-left</v-icon>
        My Dashboard
      </v-btn>
      <v-btn
        variant="text"
        class="logout-btn"
        size="small"
        @click="handleLogout"
      >
        <v-icon start size="14">mdi-logout</v-icon>
        Logout
      </v-btn>
    </template>
  </AppNavbarVenue>

  <!-- ── Main Content ── -->
  <v-main class="spotly-main">
    <div class="spotly-container">
      <!-- ── Welcome Banner ── -->
      <div class="welcome-banner mb-8">
        <div class="welcome-glow" />
        <div class="welcome-content">
          <div class="welcome-greeting">Welcome back, John!</div>
          <div class="welcome-sub">
            Discover exquisite venues for your next unforgettable experience.
          </div>
        </div>
        <div class="welcome-avatar">
          <div class="avatar-ring">JD</div>
        </div>
      </div>

      <!-- ── Discovery Panel: Search + Filters ── -->
      <div class="discovery-panel mb-8">
        <SectionHeader
          title="Find Your Venue"
          icon="mdi-magnify"
          subtitle="Search by name or filter by activity"
          class="mb-5"
        />

        <!-- Search -->
        <v-text-field
          v-model="searchQuery"
          placeholder="Search venues, moods, or activities…"
          prepend-inner-icon="mdi-magnify"
          single-line
          variant="outlined"
          density="compact"
          hide-details
          class="spotly-input mb-5"
        />

        <!-- Activity filters -->
        <div class="filter-label mb-3">What are you looking for?</div>
        <div class="d-flex flex-wrap ga-2">
          <v-chip
            v-for="activity in activities"
            :key="activity"
            class="filter-chip"
            :class="{
              'filter-chip--active': selectedActivities.includes(activity),
            }"
            @click="toggleActivity(activity)"
          >
            {{ activity }}
          </v-chip>
        </div>
      </div>

      <!-- ── Venue Grid ── -->
      <div>
        <SectionHeader
          title="Suggestions"
          icon="mdi-star-four-points"
          :count="filteredVenues.length"
          class="mb-6"
        />

        <v-row v-if="filteredVenues.length > 0">
          <v-col
            v-for="(venue, i) in filteredVenues"
            :key="venue.id"
            cols="12"
            sm="6"
            lg="4"
            class="d-flex"
          >
            <div
              class="venue-card"
              :style="{ animationDelay: `${i * 80}ms` }"
              @mouseenter="hoveredCard = venue.id"
              @mouseleave="hoveredCard = null"
              @click="selectVenue(venue)"
            >
              <!-- Image area -->
              <div class="venue-image-area">
                <div class="venue-image-placeholder">🏖️</div>
                <transition name="fade">
                  <div
                    v-if="hoveredCard === venue.id"
                    class="venue-image-overlay"
                  >
                    <v-btn
                      class="cta-btn"
                      size="small"
                      @click.stop="selectVenue(venue)"
                    >
                      View Details
                    </v-btn>
                  </div>
                </transition>
              </div>

              <!-- Card Body -->
              <div class="venue-body pa-4">
                <div class="venue-name">{{ venue.name }}</div>
                <div class="venue-desc mt-1 mb-3">{{ venue.description }}</div>

                <!-- Ambience Tags -->
                <div class="d-flex flex-wrap ga-1 mb-4">
                  <v-chip
                    v-for="tag in venue.ambienceTags"
                    :key="tag"
                    class="ambience-chip"
                    size="x-small"
                  >
                    #{{ tag }}
                  </v-chip>
                </div>

                <v-btn class="cta-btn" block @click.stop="selectVenue(venue)">
                  Book Now
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <v-icon size="48" color="#D4AF37" class="mb-3"
            >mdi-store-search-outline</v-icon
          >
          <div>No venues match your criteria.</div>
          <v-btn
            variant="text"
            size="small"
            class="mt-3"
            style="color: #d4af37; font-size: 0.82rem"
            @click="clearFilters"
          >
            Clear filters
          </v-btn>
        </div>
      </div>
    </div>
  </v-main>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import AppNavbarVenue from "@/components/layout/AppNavbarVenue.vue";
import SectionHeader from "@/components/ui/SectionHeader.vue";

const router = useRouter();

const searchQuery = ref("");
const selectedActivities = ref([]);
const hoveredCard = ref(null);

const activities = ["Outdoors", "Indoors", "Football", "Beach", "Party"];

const venues = ref([
  {
    id: 1,
    name: "Sunset Beach Club",
    description: "Premium lounge with breathtaking sunset views",
    ambienceTags: ["Beach", "Luxury", "Sunset"],
    activities: ["Outdoors", "Beach", "Party"],
  },
  {
    id: 2,
    name: "Urban Elegance",
    description: "Sophisticated indoor fine-dining experience",
    ambienceTags: ["Indoor", "Elegant", "Modern"],
    activities: ["Indoors", "Party"],
  },
  {
    id: 3,
    name: "Sports Lounge",
    description: "Premier sports bar with premium seating",
    ambienceTags: ["Sports", "Casual", "Vibrant"],
    activities: ["Indoors", "Football"],
  },
  {
    id: 4,
    name: "Garden Terrace",
    description: "Open-air garden with ambient lighting",
    ambienceTags: ["Outdoor", "Natural", "Romantic"],
    activities: ["Outdoors", "Party", "Beach"],
  },
  {
    id: 5,
    name: "Rooftop Paradise",
    description: "City views with panoramic urban scenery",
    ambienceTags: ["Modern", "Urban", "Chic"],
    activities: ["Outdoors", "Indoors", "Party"],
  },
  {
    id: 6,
    name: "Coastal Club",
    description: "Beachfront venue with exclusive private access",
    ambienceTags: ["Luxury", "Beach", "Exclusive"],
    activities: ["Beach", "Outdoors"],
  },
]);

const filteredVenues = computed(() =>
  venues.value.filter((v) => {
    const matchesSearch = v.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesActivities =
      selectedActivities.value.length === 0 ||
      selectedActivities.value.some((a) => v.activities.includes(a));
    return matchesSearch && matchesActivities;
  }),
);

function toggleActivity(activity) {
  const idx = selectedActivities.value.indexOf(activity);
  if (idx > -1) selectedActivities.value.splice(idx, 1);
  else selectedActivities.value.push(activity);
}

function clearFilters() {
  searchQuery.value = "";
  selectedActivities.value = [];
}

function selectVenue(venue) {
  router.push({ path: "/booking/environment", query: { venueId: venue.id } });
}

function handleLogout() {
  router.push("/auth");
}
</script>

<style scoped>
/* ── Design tokens — all hardcoded so they work outside v-main scope too ── */
.spotly-main {
  --gold: #d4af37;
  --midnight: #0a0e14;
  --surface: #13181f;
  --muted: #6b7a8d;
  background: #0a0e14 !important;
  font-family: var(--font-body);
}

.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* ── Navbar buttons — hardcoded so values survive outside v-main ── */
.back-btn {
  color: #6b7a8d !important;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: color 0.2s;
}
.back-btn:hover {
  color: #d4af37 !important;
}
.logout-btn {
  color: #6b7a8d !important;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: color 0.2s;
}
.logout-btn:hover {
  color: #d4af37 !important;
}

/* ── Welcome Banner ── */
.welcome-banner {
  position: relative;
  background: var(--surface);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 20px;
  padding: 32px 36px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.welcome-glow {
  position: absolute;
  top: -60px;
  left: -60px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(212, 175, 55, 0.12) 0%,
    transparent 70%
  );
  pointer-events: none;
}
.welcome-greeting {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
}
.welcome-sub {
  color: var(--muted);
  font-size: 0.88rem;
  margin-top: 6px;
}
.welcome-avatar {
  flex-shrink: 0;
}
.avatar-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.18);
  border: 2px solid rgba(212, 175, 55, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 700;
  color: #d4af37;
  box-shadow:
    0 0 0 3px rgba(212, 175, 55, 0.25),
    0 0 24px rgba(212, 175, 55, 0.18);
}

/* ── Discovery Panel ── */
.discovery-panel {
  background: var(--surface);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 24px 28px;
}

/* ── Search input ── */
.spotly-input :deep(.v-field) {
  background: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(212, 175, 55, 0.18) !important;
  color: #fff !important;
  font-size: 0.88rem;
  border-radius: 10px;
}
.spotly-input :deep(.v-field:hover) {
  border-color: rgba(212, 175, 55, 0.45) !important;
}
.spotly-input :deep(.v-field__input) {
  color: #fff !important;
}
.spotly-input :deep(.v-field__prepend-inner .v-icon) {
  color: #6b7a8d !important;
}

/* ── Filter label ── */
.filter-label {
  font-size: 0.72rem;
  font-family: var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6b7a8d;
}

/* ── Activity filter chips ── */
.filter-chip {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #6b7a8d !important;
  font-size: 0.8rem !important;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s;
}
.filter-chip:hover {
  border-color: rgba(212, 175, 55, 0.35) !important;
  color: #d4af37 !important;
}
.filter-chip--active {
  background: rgba(212, 175, 55, 0.18) !important;
  border-color: rgba(212, 175, 55, 0.5) !important;
  color: #d4af37 !important;
  font-weight: 600;
}

/* ── Venue Cards ── */
.venue-card {
  background: var(--surface);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  width: 100%;
  transition:
    border-color 0.2s,
    transform 0.2s;
  animation: slideUp 0.4s ease both;
}
.venue-card:hover {
  border-color: rgba(212, 175, 55, 0.3);
  transform: translateY(-3px);
}

.venue-image-area {
  background: linear-gradient(
    135deg,
    var(--color-surface-elevated) 0%,
    #13181f 100%
  );
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.venue-image-placeholder {
  font-size: 3.5rem;
  opacity: 0.3;
}
.venue-image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(212, 175, 55, 0.07);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.venue-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.venue-name {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 600;
  color: #fff;
}
.venue-desc {
  font-size: 0.83rem;
  color: #6b7a8d;
  flex: 1;
}

/* Ambience chips */
.ambience-chip {
  background: rgba(212, 175, 55, 0.08) !important;
  color: rgba(212, 175, 55, 0.75) !important;
  border: 1px solid rgba(212, 175, 55, 0.18) !important;
  font-size: 0.7rem !important;
}

/* CTA button */
.cta-btn {
  background: #d4af37 !important;
  color: #0a0e14 !important;
  font-weight: 600;
  font-size: 0.8rem;
  border-radius: 8px !important;
  letter-spacing: 0.04em;
  text-transform: none;
  box-shadow: none !important;
}

/* ── Empty State ── */
.empty-state {
  background: var(--surface);
  border: 1px dashed rgba(212, 175, 55, 0.18);
  border-radius: 14px;
  padding: 48px;
  text-align: center;
  color: #6b7a8d;
  font-size: 0.9rem;
}

/* ── Overlay transition ── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Card slide-up animation ── */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
