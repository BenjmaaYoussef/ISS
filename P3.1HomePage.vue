<template>
  <div class="home-page" style="background-color: #0a0e14; min-height: 100vh">
    <!-- Top Navigation Bar -->
    <v-app-bar
      elevation="1"
      style="background-color: #0a0e14; border-bottom: 1px solid #1a2332"
    >
      <div class="d-flex align-center" style="width: 100%">
        <!-- Logo -->
        <div class="d-flex align-center gap-2" style="margin-right: auto">
          <svg
            width="40"
            height="40"
            viewBox="0 0 100 100"
            style="display: flex"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#d4af37"
              stroke-width="3"
            />
            <path
              d="M50 20 L65 45 L75 35 L60 65 L70 80 L50 70 L30 80 L40 65 L25 35 L35 45 Z"
              fill="#d4af37"
              opacity="0.8"
            />
          </svg>
          <span class="text-h6" style="color: #d4af37; font-weight: 300"
            >Spotly</span
          >
        </div>

        <!-- Menu Items -->
        <div class="d-flex align-center gap-4" style="margin-right: 2rem">
          <v-btn
            text
            style="color: #e0e0e0; text-transform: none; font-size: 0.95rem"
            @click="showSection('home')"
          >
            Home
          </v-btn>
          <v-btn
            text
            style="color: #e0e0e0; text-transform: none; font-size: 0.95rem"
            @click="navigateToReservations"
          >
            My Reservations
          </v-btn>
          <v-btn
            text
            style="color: #e0e0e0; text-transform: none; font-size: 0.95rem"
            @click="handleLogout"
          >
            Logout
          </v-btn>
        </div>
      </div>
    </v-app-bar>

    <!-- Main Content -->
    <v-container fluid class="pa-6" style="max-width: 1400px; margin: 0 auto">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-h4 mb-2" style="color: #d4af37; font-weight: 300">
          Welcome, [USER NAME]
        </h1>
        <p style="color: #a0a0a0; font-size: 1.1rem">
          Discover exquisite venues for your perfect celebration
        </p>
      </div>

      <!-- Search Bar -->
      <v-card
        class="mb-8"
        elevation="2"
        style="background-color: #0f1419; border: 1px solid #1a2332"
      >
        <v-card-text class="pa-4">
          <v-text-field
            v-model="searchQuery"
            placeholder="Search for venues..."
            prepend-inner-icon="mdi-magnify"
            single-line
            outlined
            dense
            style="
              background-color: #1a2332;
              border-radius: 4px;
              color: #e0e0e0;
            "
            :style="{
              '--v-field-input-color': '#e0e0e0',
              '--v-field-border-color': '#2a3a4a',
            }"
            @input="handleSearch"
          />
        </v-card-text>
      </v-card>

      <!-- Filter Section -->
      <div class="mb-8">
        <p class="mb-4" style="color: #d4af37; font-weight: 500; font-size: 0.95rem">
          WHAT ARE YOU LOOKING FOR?
        </p>
        <div class="d-flex flex-wrap gap-3">
          <v-chip
            v-for="activity in activities"
            :key="activity"
            :outlined="!selectedActivities.includes(activity)"
            :color="selectedActivities.includes(activity) ? '#d4af37' : 'transparent'"
            :text-color="
              selectedActivities.includes(activity) ? '#0a0e14' : '#a0a0a0'
            "
            @click="toggleActivity(activity)"
            style="
              cursor: pointer;
              border: 1px solid
                #2a3a4a;
              min-height: 36px;
              font-size: 0.9rem;
            "
          >
            {{ activity }}
          </v-chip>
        </div>
      </div>

      <!-- Suggestions Section -->
      <div>
        <p class="mb-6" style="color: #d4af37; font-weight: 500; font-size: 0.95rem">
          SUGGESTIONS
        </p>

        <!-- Venue Cards Grid -->
        <v-row>
          <v-col
            v-for="venue in filteredVenues"
            :key="venue.id"
            cols="12"
            sm="6"
            lg="4"
          >
            <v-card
              elevation="0"
              style="
                background-color: #0f1419;
                border: 1px solid #2a3a4a;
                height: 100%;
                display: flex;
                flex-direction: column;
                transition: all 0.3s ease;
                cursor: pointer;
              "
              @mouseenter="hoveredCard = venue.id"
              @mouseleave="hoveredCard = null"
              @click="selectVenue(venue)"
            >
              <!-- Image Placeholder -->
              <div
                style="
                  background: linear-gradient(135deg, #2a3a4a 0%, #1a2a3a 100%);
                  height: 200px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-bottom: 1px solid #2a3a4a;
                  position: relative;
                  overflow: hidden;
                "
              >
                <div
                  style="
                    font-size: 3.5rem;
                    color: #3a4a5a;
                    opacity: 0.5;
                  "
                >
                  🏖️
                </div>
                <div
                  v-if="hoveredCard === venue.id"
                  style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(212, 175, 55, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  <v-btn
                    color="#d4af37"
                    variant="elevated"
                    size="large"
                    style="text-transform: none; font-size: 1rem"
                    @click.stop="selectVenue(venue)"
                  >
                    View Details
                  </v-btn>
                </div>
              </div>

              <!-- Card Content -->
              <v-card-text class="pa-4 flex-grow-1 d-flex flex-column">
                <h3 style="color: #d4af37; margin-bottom: 0.5rem; font-size: 1.1rem">
                  {{ venue.name }}
                </h3>
                <p
                  style="
                    color: #a0a0a0;
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                    flex-grow: 1;
                  "
                >
                  {{ venue.description }}
                </p>

                <!-- Ambience Tags -->
                <div class="mb-3">
                  <div class="d-flex flex-wrap gap-2">
                    <v-chip
                      v-for="tag in venue.ambienceTags"
                      :key="tag"
                      size="small"
                      style="
                        background-color: #1a2a3a;
                        color: #d4af37;
                        border: 1px solid #2a3a4a;
                        height: 24px;
                        font-size: 0.75rem;
                      "
                    >
                      #{{ tag }}
                    </v-chip>
                  </div>
                </div>

                <!-- Action Buttons -->
                <v-btn
                  color="#d4af37"
                  variant="elevated"
                  full-width
                  style="
                    text-transform: none;
                    font-size: 0.95rem;
                    font-weight: 500;
                  "
                  @click.stop="selectVenue(venue)"
                >
                  Book Now
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Empty State -->
      <v-row v-if="filteredVenues.length === 0" class="mt-8">
        <v-col cols="12" class="text-center">
          <p style="color: #606a6a; font-size: 1.1rem">
            No venues match your criteria. Try adjusting your filters.
          </p>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'P3HomePage',
  data() {
    return {
      searchQuery: '',
      selectedActivities: [],
      hoveredCard: null,
      activities: ['Outdoors', 'Indoors', 'Football', 'Beach', 'Party'],
      venues: [
        {
          id: 1,
          name: 'Sunset Beach Club',
          description: 'Premium lounge with sunset views',
          ambienceTags: ['Beach', 'Luxury', 'Sunset'],
          activities: ['Outdoors', 'Beach', 'Party'],
        },
        {
          id: 2,
          name: 'Urban Elegance',
          description: 'Sophisticated indoor dining experience',
          ambienceTags: ['Indoor', 'Elegant', 'Modern'],
          activities: ['Indoors', 'Party'],
        },
        {
          id: 3,
          name: 'Sports Lounge',
          description: 'Premier sports bar with premium seating',
          ambienceTags: ['Sports', 'Casual', 'Vibrant'],
          activities: ['Indoors', 'Football'],
        },
        {
          id: 4,
          name: 'Garden Terrace',
          description: 'Open-air garden with ambient lighting',
          ambienceTags: ['Outdoor', 'Natural', 'Romantic'],
          activities: ['Outdoors', 'Party', 'Beach'],
        },
        {
          id: 5,
          name: 'Rooftop Paradise',
          description: 'City views with panoramic scenery',
          ambienceTags: ['Modern', 'Urban', 'Chic'],
          activities: ['Outdoors', 'Indoors', 'Party'],
        },
        {
          id: 6,
          name: 'Coastal Club',
          description: 'Beachfront venue with exclusive access',
          ambienceTags: ['Luxury', 'Beach', 'Exclusive'],
          activities: ['Beach', 'Outdoors'],
        },
      ],
    };
  },
  computed: {
    filteredVenues() {
      return this.venues.filter((venue) => {
        const matchesSearch = venue.name
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());

        const matchesActivities =
          this.selectedActivities.length === 0 ||
          this.selectedActivities.some((activity) =>
            venue.activities.includes(activity)
          );

        return matchesSearch && matchesActivities;
      });
    },
  },
  methods: {
    toggleActivity(activity) {
      const index = this.selectedActivities.indexOf(activity);
      if (index > -1) {
        this.selectedActivities.splice(index, 1);
      } else {
        this.selectedActivities.push(activity);
      }
    },
    handleSearch() {
      // Search is reactive through computed property
    },
    selectVenue(venue) {
      console.log('Selected venue:', venue);
      // Navigate to booking flow for this venue
      this.$router.push({
        name: 'P4EnvironmentSelection',
        params: { venueId: venue.id },
      });
    },
    navigateToReservations() {
      console.log('Navigate to My Reservations');
      // Navigate to P13 Client Dashboard
      this.$router.push({ name: 'P13ClientDashboard' });
    },
    handleLogout() {
      console.log('Logging out');
      // Clear auth state
      // this.$store.commit('clearAuth');
      this.$router.push({ name: 'Login' });
    },
    showSection(section) {
      console.log('Show section:', section);
    },
  },
};
</script>

<style scoped>
/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #0a0e14;
}

::-webkit-scrollbar-thumb {
  background: #2a3a4a;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #3a4a5a;
}

/* Smooth transitions for cards */
.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-card:hover {
  transform: translateY(-2px);
  border-color: #d4af37 !important;
}

/* Custom chip styling for activities */
.v-chip {
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Text field styling */
:deep(.v-field__input) {
  color: #e0e0e0 !important;
}

:deep(.v-field__outline) {
  border-color: #2a3a4a !important;
}

:deep(.v-field:hover .v-field__outline) {
  border-color: #d4af37 !important;
}
</style>