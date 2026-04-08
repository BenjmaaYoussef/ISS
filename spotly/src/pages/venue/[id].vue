<template>
  <!-- NAVBAR -->
  <AppNavbarVenue
    :venue-name="venue?.name ?? 'Venue'"
    :show-powered-by="true"
    :show-default-actions="true"
  />

  <v-main>
    <v-sheet color="background" style="min-height: 100vh; padding-bottom: 80px">

      <!-- OWNER PREVIEW BANNER -->
      <div v-if="isOwnVenue" style="background: rgba(212,175,55,0.1); border-bottom: 1px solid rgba(212,175,55,0.25); padding: 10px 48px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px; color: #d4af37; font-size: 0.82rem; font-weight: 600; letter-spacing: 0.04em;">
          <v-icon size="18" color="#d4af37">mdi-crown</v-icon>
          You are previewing your own venue — reservations are disabled
        </div>
        <v-btn
          size="small"
          style="background: rgba(212,175,55,0.18); color: #d4af37; border: 1px solid rgba(212,175,55,0.35); font-size: 0.78rem; text-transform: none; font-weight: 600; box-shadow: none;"
          @click="router.push('/admin/dashboard')"
        >
          <v-icon start size="14">mdi-cog-outline</v-icon>
          Go to Admin Panel
        </v-btn>
      </div>

      <!-- HERO -->
      <v-sheet
        color="background"
        style="position: relative; overflow: hidden; padding: 80px 0 0"
      >
        <v-container style="max-width: 1200px; padding: 0 48px">
          <v-row align="center" style="gap: 0">
            <!-- LEFT: Info -->
            <v-col cols="12" md="6" style="padding-right: 48px">
              <!-- Venue name -->
              <div
                style="
                  font-size: 0.72rem;
                  letter-spacing: 3px;
                  text-transform: uppercase;
                  color: rgba(212, 175, 55, 0.7);
                  margin-bottom: 12px;
                "
              >
                Premium Venue
              </div>
              <h1
                style="
                  font-size: clamp(2rem, 4vw, 3.2rem);
                  font-weight: 700;
                  color: #d4af37;
                  line-height: 1.15;
                  margin-bottom: 20px;
                  animation: fadeUp 0.5s ease both;
                "
              >
                {{ venue?.name ?? 'Venue' }}
              </h1>

              <!-- Quote -->
              <div
                style="
                  border-left: 2px solid rgba(212, 175, 55, 0.4);
                  padding-left: 20px;
                  margin-bottom: 28px;
                  animation: fadeUp 0.5s 0.1s ease both;
                "
              >
                <p
                  style="
                    font-size: 1.1rem;
                    font-style: italic;
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.7;
                  "
                >
                  "{{ venue?.description ?? '' }}"
                </p>
              </div>

              <!-- Tags -->
              <div
                class="d-flex flex-wrap"
                style="
                  gap: 10px;
                  margin-bottom: 36px;
                  animation: fadeUp 0.5s 0.2s ease both;
                "
              >
                <v-chip
                  v-for="tag in tags"
                  :key="tag"
                  variant="outlined"
                  size="small"
                  style="
                    border-color: rgba(212, 175, 55, 0.3);
                    color: rgba(212, 175, 55, 0.8);
                    font-size: 0.78rem;
                    letter-spacing: 1px;
                  "
                >
                  # {{ tag }}
                </v-chip>
              </div>

              <!-- CTA Buttons -->
              <div
                class="d-flex flex-wrap"
                style="gap: 14px; animation: fadeUp 0.5s 0.3s ease both"
              >
                <v-btn
                  color="primary"
                  size="large"
                  style="
                    font-size: 0.82rem;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: #0a0e14;
                    font-weight: 600;
                    padding: 0 32px;
                    height: 50px;
                  "
                  @click="goToMenu"
                >
                  <v-icon start icon="mdi-silverware-fork-knife" size="18" />
                  Explore Menu
                </v-btn>
                <v-tooltip
                  :text="isOwnVenue ? 'You cannot book your own venue' : (!hasEnvironments ? 'No environments configured for this venue yet' : '')"
                  :disabled="!isOwnVenue && hasEnvironments"
                >
                  <template #activator="{ props: tooltipProps }">
                    <span v-bind="tooltipProps">
                      <v-btn
                        variant="outlined"
                        color="primary"
                        size="large"
                        style="
                          font-size: 0.82rem;
                          letter-spacing: 2px;
                          text-transform: uppercase;
                          padding: 0 32px;
                          height: 50px;
                        "
                        :disabled="isOwnVenue || !hasEnvironments"
                        @click="goToBooking"
                      >
                        <v-icon start icon="mdi-calendar-check" size="18" />
                        Make Reservation
                      </v-btn>
                    </span>
                  </template>
                </v-tooltip>
              </div>

              <!-- ENVIRONMENT BUTTON -->
              <div class="mt-6" style="animation: fadeUp 0.5s 0.4s ease both">
                <v-tooltip
                  :text="isOwnVenue ? 'You cannot book your own venue' : (!hasEnvironments ? 'No environments configured for this venue yet' : '')"
                  :disabled="!isOwnVenue && hasEnvironments"
                >
                  <template #activator="{ props: tooltipProps }">
                    <span v-bind="tooltipProps" style="display: block">
                      <v-btn
                        color="primary"
                        variant="outlined"
                        size="large"
                        style="
                          font-size: 0.82rem;
                          letter-spacing: 2px;
                          text-transform: uppercase;
                          width: 100%;
                        "
                        :disabled="isOwnVenue || !hasEnvironments"
                        @click="goToBooking"
                      >
                        <v-icon start icon="mdi-beach" size="18" />
                        Choose Your Environment
                      </v-btn>
                    </span>
                  </template>
                </v-tooltip>
              </div>
            </v-col>

            <!-- RIGHT: Slideshow -->
            <v-col
              cols="12"
              md="6"
              style="animation: fadeUp 0.5s 0.15s ease both"
            >
              <div
                style="
                  position: relative;
                  border: 1px solid rgba(212, 175, 55, 0.18);
                  overflow: hidden;
                  aspect-ratio: 16/10;
                "
              >
                <!-- Slide images -->
                <div
                  v-for="(slide, i) in slides"
                  :key="i"
                  :style="{
                    position: 'absolute',
                    inset: 0,
                    ...(slide.imageUrl
                      ? { backgroundImage: `url(${slide.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : { background: slide.bg }),
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '24px',
                    opacity: currentSlide === i ? 1 : 0,
                    transition: 'opacity 0.7s ease',
                  }"
                >
                  <div>
                    <div
                      style="
                        font-size: 1.3rem;
                        color: #fff;
                        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
                      "
                    >
                      {{ slide.title }}
                    </div>
                    <div
                      style="
                        font-size: 0.8rem;
                        color: rgba(255, 255, 255, 0.6);
                        margin-top: 4px;
                      "
                    >
                      {{ slide.sub }}
                    </div>
                  </div>
                </div>

                <!-- Controls -->
                <div
                  style="
                    position: absolute;
                    bottom: 14px;
                    right: 16px;
                    display: flex;
                    gap: 6px;
                    z-index: 2;
                  "
                >
                  <div
                    v-for="(_, i) in slides"
                    :key="i"
                    @click="currentSlide = i"
                    :style="{
                      width: currentSlide === i ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      background:
                        currentSlide === i
                          ? '#D4AF37'
                          : 'rgba(255,255,255,0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }"
                  />
                </div>

                <!-- Arrows -->
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  style="
                    position: absolute;
                    left: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255, 255, 255, 0.7);
                    z-index: 2;
                    background: rgba(0, 0, 0, 0.3);
                  "
                  @click="prevSlide"
                >
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  style="
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255, 255, 255, 0.7);
                    z-index: 2;
                    background: rgba(0, 0, 0, 0.3);
                  "
                  @click="nextSlide"
                >
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>

      <v-divider
        style="border-color: rgba(212, 175, 55, 0.12); margin-top: 64px"
      />

      <!-- IMPORTANT INFO -->
      <v-sheet color="background" style="padding: 64px 0">
        <v-container style="max-width: 1200px; padding: 0 48px">
          <div
            style="
              font-size: 0.72rem;
              letter-spacing: 3px;
              text-transform: uppercase;
              color: rgba(212, 175, 55, 0.6);
              margin-bottom: 8px;
            "
          >
            What to know
          </div>
          <h2 style="font-size: 1.8rem; color: #fff; margin-bottom: 40px">
            Important Info
          </h2>

          <v-row style="gap: 0">
            <v-col
              v-for="info in importantInfo"
              :key="info.label"
              cols="12"
              sm="6"
              md="3"
            >
              <v-card
                flat
                style="
                  background: #13181f;
                  border: 1px solid rgba(212, 175, 55, 0.12);
                  padding: 28px;
                  height: 100%;
                  transition: border-color 0.3s;
                "
                @mouseenter="
                  (e) =>
                    (e.currentTarget.style.borderColor =
                      'rgba(212,175,55,0.35)')
                "
                @mouseleave="
                  (e) =>
                    (e.currentTarget.style.borderColor =
                      'rgba(212,175,55,0.12)')
                "
              >
                <div
                  style="
                    width: 44px;
                    height: 44px;
                    border: 1.5px solid rgba(212, 175, 55, 0.35);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 16px;
                  "
                >
                  <v-icon :icon="info.icon" color="primary" size="22" />
                </div>
                <div
                  style="
                    font-size: 0.72rem;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: rgba(212, 175, 55, 0.6);
                    margin-bottom: 6px;
                  "
                >
                  {{ info.label }}
                </div>
                <div style="font-size: 1rem; color: #fff; line-height: 1.5">
                  {{ info.value }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>
    </v-sheet>
  </v-main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppNavbarVenue from "@/components/layout/AppNavbarVenue.vue";
import { getVenueById } from "@/datamodel/Venue.js";
import { ENVIRONMENT_LIST } from "@/datamodel/Environment.js";

let _session = null;
try { _session = JSON.parse(localStorage.getItem("spotly_session") || "null"); } catch {}

const route = useRoute();
const router = useRouter();

const venueId = computed(() => Number(route.params.id));
const venue = computed(() => getVenueById(venueId.value));

const tags = computed(() => venue.value?.ambienceTags ?? []);

const _fallbackSlides = [
  {
    title: "Main Hall",
    sub: "Elegant setting for unforgettable evenings",
    bg: "linear-gradient(135deg, #1a2a3a 0%, #0d1f2d 40%, #0a1a25 100%)",
    imageUrl: "",
  },
  {
    title: "Terrace",
    sub: "Open-air seating with panoramic views",
    bg: "linear-gradient(135deg, #2a1a0a 0%, #1a1005 40%, #0f0a02 100%)",
    imageUrl: "",
  },
  {
    title: "Private Area",
    sub: "Intimate reserved spaces for exclusive events",
    bg: "linear-gradient(135deg, #0a1a2a 0%, #051015 40%, #020a0f 100%)",
    imageUrl: "",
  },
];

const slides = computed(() => {
  const venueSlides = venue.value?.slides;
  if (venueSlides?.length) {
    return venueSlides.map(s => ({
      title: s.title ?? "",
      sub: s.subtitle ?? "",
      bg: s.bgColor || "linear-gradient(135deg, #1a2a3a 0%, #0d1f2d 40%, #0a1a25 100%)",
      imageUrl: s.imageUrl ?? "",
    }));
  }
  return _fallbackSlides;
});

const currentSlide = ref(0);
let timer = null;

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length;
}
function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length;
}

onMounted(() => {
  timer = setInterval(nextSlide, 4000);
});
onUnmounted(() => clearInterval(timer));

const importantInfo = computed(() => [
  {
    icon: "mdi-hanger",
    label: "Dress Code",
    value: venue.value?.dressCode || "Smart Casual",
  },
  {
    icon: "mdi-translate",
    label: "Languages Spoken",
    value: venue.value?.supportedLanguages?.join(", ") || "English",
  },
  {
    icon: "mdi-clock-outline",
    label: "Opening Hours",
    value: "12:00 PM – 2:00 AM",
  },
  {
    icon: "mdi-map-marker-outline",
    label: "Location",
    value: "Contact venue for address",
  },
]);

const hasEnvironments = computed(() =>
  ENVIRONMENT_LIST.some((e) => e.venueId === venueId.value),
);

const isOwnVenue = computed(() =>
  !!_session && venue.value?.adminEmail === _session.email,
);

function goToBooking() {
  router.push(`/booking/environment?venueId=${venueId.value}`);
}

function goToMenu() {
  router.push(`/menu/${venueId.value}`);
}
</script>
