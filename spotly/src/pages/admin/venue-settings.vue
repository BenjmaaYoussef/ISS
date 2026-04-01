<template>
  <!-- P16 — Venue Identity Studio -->

  <!-- ── Top Navigation Bar ── -->
  <AppNavbarApp
    :nav-links="adminNavLinks"
    active-link="venue-settings"
    admin-label="Admin"
    @nav="handleNav"
  />

  <v-main class="spotly-main">
    <div class="studio-container">
      <!-- ── Page Header ── -->
      <div class="page-header">
        <div>
          <div class="page-eyebrow">
            <v-icon size="13" color="#D4AF37" class="mr-1"
              >mdi-pencil-ruler</v-icon
            >
            Admin · Venue Management
          </div>
          <h1 class="page-title">Venue Identity Studio</h1>
          <p class="page-sub">
            Shape how your venue appears to every guest. Changes reflect on the
            public profile in real time.
          </p>
        </div>
        <div class="header-actions">
          <v-btn
            variant="outlined"
            :ripple="false"
            class="secondary-btn mr-3"
            @click="resetForm"
          >
            <v-icon start size="15">mdi-refresh</v-icon>
            Reset
          </v-btn>
          <v-btn
            flat
            :ripple="false"
            class="gold-btn"
            :loading="saving"
            @click="saveChanges"
          >
            <v-icon start size="15">mdi-content-save-outline</v-icon>
            Save Changes
          </v-btn>
        </div>
      </div>

      <div class="header-line mb-8" />

      <!-- ── Two-Column Layout ── -->
      <div class="studio-grid">
        <!-- ══ LEFT: Editor ══ -->
        <div class="editor-col">
          <!-- SECTION 1: Basic Identity -->
          <div class="form-section mb-6">
            <div class="section-head">
              <div class="section-num">1</div>
              <div>
                <div class="section-title">Basic Identity</div>
                <div class="section-sub">The core of your public profile</div>
              </div>
            </div>

            <div class="fields-wrap">
              <div class="field-group">
                <label class="field-label"
                  >Venue Name <span class="req">*</span></label
                >
                <v-text-field
                  v-model="form.name"
                  placeholder="e.g. Sunset Beach Club"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="spotly-input"
                />
              </div>

              <div class="field-group">
                <label class="field-label">Tagline / Signature Quote</label>
                <v-text-field
                  v-model="form.tagline"
                  placeholder="e.g. Where every sunset tells a story"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="spotly-input"
                />
                <div class="field-hint">
                  Appears as an italic quote on the venue landing page
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">About the Venue</label>
                <v-textarea
                  v-model="form.description"
                  placeholder="Describe the atmosphere, history, and soul of your venue…"
                  variant="outlined"
                  rows="4"
                  counter="300"
                  maxlength="300"
                  hide-details="auto"
                  no-resize
                  class="spotly-input"
                />
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <div class="field-group">
                    <label class="field-label">City / Location</label>
                    <v-text-field
                      v-model="form.location"
                      placeholder="e.g. Sidi Bou Said, Tunisia"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                      class="spotly-input"
                      prepend-inner-icon="mdi-map-marker-outline"
                    />
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="field-group">
                    <label class="field-label">Venue Type</label>
                    <v-select
                      v-model="form.venueType"
                      :items="venueTypes"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                      class="spotly-input"
                    />
                  </div>
                </v-col>
              </v-row>
            </div>
          </div>

          <!-- SECTION 2: Ambience & Tags -->
          <div class="form-section mb-6">
            <div class="section-head">
              <div class="section-num">2</div>
              <div>
                <div class="section-title">Ambience & Tags</div>
                <div class="section-sub">Help guests discover your mood</div>
              </div>
            </div>

            <div class="fields-wrap">
              <div class="field-group">
                <label class="field-label">Ambience Tags</label>
                <div class="tag-grid">
                  <div
                    v-for="tag in availableTags"
                    :key="tag"
                    class="tag-chip"
                    :class="{ 'tag-chip--active': form.tags.includes(tag) }"
                    @click="toggleTag(tag)"
                  >
                    {{ tag }}
                  </div>
                </div>
                <div class="field-hint">
                  These appear as hashtag chips on your public profile
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">Dress Code</label>
                <div class="dress-grid">
                  <div
                    v-for="dc in dressCodes"
                    :key="dc.value"
                    class="dress-option"
                    :class="{
                      'dress-option--active': form.dressCode === dc.value,
                    }"
                    @click="form.dressCode = dc.value"
                  >
                    <v-icon
                      size="18"
                      class="mb-1"
                      :color="
                        form.dressCode === dc.value ? '#D4AF37' : '#6a7080'
                      "
                    >
                      {{ dc.icon }}
                    </v-icon>
                    <span>{{ dc.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 3: Languages -->
          <div class="form-section mb-6">
            <div class="section-head">
              <div class="section-num">3</div>
              <div>
                <div class="section-title">Languages & Service</div>
                <div class="section-sub">Languages your staff serves in</div>
              </div>
            </div>

            <div class="fields-wrap">
              <div class="field-group">
                <label class="field-label">Supported Languages</label>
                <div class="lang-grid">
                  <div
                    v-for="lang in availableLangs"
                    :key="lang.code"
                    class="lang-chip"
                    :class="{
                      'lang-chip--active': form.languages.includes(lang.code),
                    }"
                    @click="toggleLang(lang.code)"
                  >
                    <span class="lang-flag">{{ lang.flag }}</span>
                    <span>{{ lang.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 4: Opening Hours -->
          <div class="form-section mb-6">
            <div class="section-head">
              <div class="section-num">4</div>
              <div>
                <div class="section-title">Opening Hours</div>
                <div class="section-sub">Per environment, per day</div>
              </div>
            </div>

            <div class="fields-wrap">
              <div
                v-for="env in form.environments"
                :key="env.name"
                class="env-hours-row"
              >
                <div class="env-hours-label">
                  <v-icon size="14" color="#D4AF37" class="mr-1">{{
                    env.icon
                  }}</v-icon>
                  {{ env.name }}
                </div>
                <div class="env-hours-fields">
                  <v-text-field
                    v-model="env.open"
                    placeholder="12:00"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="spotly-input hours-input"
                    prefix="Opens"
                  />
                  <div class="hours-dash">—</div>
                  <v-text-field
                    v-model="env.close"
                    placeholder="23:00"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="spotly-input hours-input"
                    prefix="Closes"
                  />
                  <div
                    class="env-toggle"
                    :class="{ 'env-toggle--on': env.active }"
                    @click="env.active = !env.active"
                  >
                    <v-icon size="13">{{
                      env.active ? "mdi-check" : "mdi-minus"
                    }}</v-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 5: Gallery -->
          <div class="form-section mb-6">
            <div class="section-head">
              <div class="section-num">5</div>
              <div>
                <div class="section-title">Gallery & Slideshow</div>
                <div class="section-sub">
                  Scenes shown in your public hero slideshow
                </div>
              </div>
            </div>

            <div class="fields-wrap">
              <div class="gallery-grid">
                <div
                  v-for="(slide, i) in form.slides"
                  :key="i"
                  class="gallery-item"
                  :class="{ 'gallery-item--active': i === 0 }"
                >
                  <div
                    class="gallery-item-inner"
                    :style="{ background: slide.bg }"
                  >
                    <div class="gallery-order-badge">{{ i + 1 }}</div>
                    <div class="gallery-arrows" v-if="form.slides.length > 1">
                      <v-icon
                        size="14"
                        color="rgba(255,255,255,0.5)"
                        class="gallery-arrow"
                        :style="{ opacity: i === 0 ? 0.2 : 1 }"
                        @click="moveSlide(i, -1)"
                        >mdi-chevron-left</v-icon
                      >
                      <v-icon
                        size="14"
                        color="rgba(255,255,255,0.5)"
                        class="gallery-arrow"
                        :style="{
                          opacity: i === form.slides.length - 1 ? 0.2 : 1,
                        }"
                        @click="moveSlide(i, 1)"
                        >mdi-chevron-right</v-icon
                      >
                    </div>
                  </div>
                  <div class="gallery-item-info">
                    <v-text-field
                      v-model="slide.title"
                      placeholder="Scene name"
                      variant="plain"
                      density="compact"
                      hide-details
                      class="gallery-title-input"
                    />
                    <v-text-field
                      v-model="slide.sub"
                      placeholder="Short description"
                      variant="plain"
                      density="compact"
                      hide-details
                      class="gallery-sub-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ══ RIGHT: Live Preview ══ -->
        <div class="preview-col">
          <div class="preview-sticky">
            <div class="preview-header">
              <div class="preview-live-dot" />
              <span class="preview-label">Live Preview</span>
              <span class="preview-sub">as seen by guests</span>
            </div>

            <!-- Venue Card Preview -->
            <div class="venue-preview-card">
              <!-- Hero area -->
              <div
                class="vp-hero"
                :style="{
                  background: form.slides[previewSlide]?.bg ?? '#13181f',
                }"
              >
                <!-- Slide dots -->
                <div class="vp-slide-dots">
                  <div
                    v-for="(s, i) in form.slides"
                    :key="i"
                    class="vp-dot"
                    :class="{ 'vp-dot--active': i === previewSlide }"
                    @click="previewSlide = i"
                  />
                </div>
                <div class="vp-hero-overlay" />
                <div class="vp-hero-content">
                  <div class="vp-scene-label">
                    {{ form.slides[previewSlide]?.title }}
                  </div>
                  <div class="vp-scene-sub">
                    {{ form.slides[previewSlide]?.sub }}
                  </div>
                </div>
              </div>

              <!-- Info area -->
              <div class="vp-body">
                <!-- Type badge -->
                <div class="vp-type-badge mb-3">
                  {{ form.venueType || "Luxury Venue" }}
                </div>

                <!-- Name + location -->
                <div class="vp-name">{{ form.name || "Your Venue Name" }}</div>
                <div class="vp-location mb-3">
                  <v-icon size="12" color="#6a7080">mdi-map-marker</v-icon>
                  <span>{{ form.location || "City, Country" }}</span>
                </div>

                <!-- Tagline -->
                <div v-if="form.tagline" class="vp-tagline mb-3">
                  "{{ form.tagline }}"
                </div>

                <!-- Description excerpt -->
                <div v-if="form.description" class="vp-desc mb-4">
                  {{ form.description.slice(0, 100)
                  }}{{ form.description.length > 100 ? "…" : "" }}
                </div>

                <!-- Tags -->
                <div class="vp-tags mb-4" v-if="form.tags.length">
                  <span
                    v-for="tag in form.tags.slice(0, 4)"
                    :key="tag"
                    class="vp-tag"
                    ># {{ tag }}</span
                  >
                </div>

                <!-- Dress code + languages row -->
                <div class="vp-meta-row mb-4">
                  <div class="vp-meta-item" v-if="form.dressCode">
                    <v-icon size="12" color="#D4AF37"
                      >mdi-tshirt-crew-outline</v-icon
                    >
                    <span>{{ form.dressCode }}</span>
                  </div>
                  <div class="vp-meta-item" v-if="form.languages.length">
                    <v-icon size="12" color="#D4AF37">mdi-translate</v-icon>
                    <span>{{
                      form.languages
                        .map(
                          (c) => availableLangs.find((l) => l.code === c)?.flag,
                        )
                        .join(" ")
                    }}</span>
                  </div>
                </div>

                <!-- Hours snippet -->
                <div class="vp-hours" v-if="activeEnvs.length">
                  <div
                    v-for="env in activeEnvs.slice(0, 3)"
                    :key="env.name"
                    class="vp-hours-row"
                  >
                    <span class="vp-env-name">{{ env.name }}</span>
                    <span class="vp-env-hours"
                      >{{ env.open }} – {{ env.close }}</span
                    >
                  </div>
                </div>

                <!-- CTA buttons -->
                <div class="vp-actions mt-4">
                  <div class="vp-cta-primary">
                    <v-icon size="13" color="#0A0E14"
                      >mdi-calendar-check</v-icon
                    >
                    <span>Make Reservation</span>
                  </div>
                  <div class="vp-cta-secondary">
                    <v-icon size="13" color="#D4AF37"
                      >mdi-silverware-fork-knife</v-icon
                    >
                    <span>Explore Menu</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Preview note -->
            <div class="preview-note">
              <v-icon size="13" color="#4a5568" class="mr-1"
                >mdi-information-outline</v-icon
              >
              This preview updates as you type
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-main>

  <!-- ── Snackbar ── -->
  <SpotlySnackbar :snackbar="snackbar" />
</template>

<script setup>
// P16 — Venue Identity Studio
import { ref, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import AppNavbarApp from "@/components/layout/AppNavbarApp.vue";
import SpotlySnackbar from "@/components/feedback/SpotlySnackbar.vue";
import { useSnackbar } from "@/composables/useSnackbar";
import { useAdminNav } from "@/composables/useAdminNav";
import { VENUE_LIST, updateVenue } from "@/datamodel/Venue.js";

const router = useRouter();
const { snackbar, notifySuccess } = useSnackbar();

// ─── Navbar ───────────────────────────────────────────────────────────────────
const { adminNavLinks, handleNav } = useAdminNav();

// ─── Static options ───────────────────────────────────────────────────────────
const venueTypes = [
  "Beach Club",
  "Restaurant",
  "Lounge",
  "Rooftop Bar",
  "Beach Bar",
  "Café",
  "Private Club",
  "Event Space",
];

const availableTags = [
  "Beach",
  "Luxury",
  "Sunset",
  "Rooftop",
  "Sea View",
  "VIP",
  "Romantic",
  "Family Friendly",
  "Live Music",
  "Cocktails",
  "Fine Dining",
  "Outdoor",
  "Private Events",
];

const dressCodes = [
  { value: "Casual", label: "Casual", icon: "mdi-tshirt-crew-outline" },
  { value: "Smart Casual", label: "Smart Casual", icon: "mdi-polo" },
  { value: "Formal", label: "Formal", icon: "mdi-tie" },
  { value: "Black Tie", label: "Black Tie", icon: "mdi-bow-tie" },
];

const availableLangs = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "ar", label: "Arabic", flag: "🇹🇳" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "it", label: "Italian", flag: "🇮🇹" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" },
];

// ─── Defaults (pre-populated from datamodel) ──────────────────────────────────
const defaultForm = () => {
  const v = VENUE_LIST[0] ?? {};
  return {
    name: v.name ?? "Sunset Beach Club",
    tagline: "Where every sunset tells a story",
    description:
      v.description ??
      "A premier beachfront destination offering an unparalleled dining and lounge experience. Nestled along the azure coast of Sidi Bou Said, our venue blends Mediterranean elegance with modern luxury.",
    location: "Sidi Bou Said, Tunisia",
    venueType: "Beach Club",
    tags: v.ambienceTags?.length ? [...v.ambienceTags] : ["Beach", "Luxury", "Sunset", "Sea View"],
    dressCode: v.dressCode ?? "Smart Casual",
    languages: v.supportedLanguages?.length ? [...v.supportedLanguages] : ["en", "fr", "ar"],
    environments: [
    {
      name: "Indoor Dining",
      icon: "mdi-silverware",
      open: "12:00",
      close: "23:30",
      active: true,
    },
    {
      name: "Beachfront Terrace",
      icon: "mdi-beach",
      open: "10:00",
      close: "00:00",
      active: true,
    },
    {
      name: "Sunset Lounge",
      icon: "mdi-weather-sunset",
      open: "16:00",
      close: "02:00",
      active: true,
    },
    {
      name: "Private Cabana",
      icon: "mdi-umbrella-beach",
      open: "09:00",
      close: "20:00",
      active: false,
    },
    ],
    slides: [
      {
        title: "Beachfront Terrace",
        sub: "Open-air seating with panoramic ocean views",
        bg: "linear-gradient(135deg, #1a2a3a 0%, #0d1f2d 40%, #0a1a25 100%)",
      },
      {
        title: "Sunset Lounge",
        sub: "Premium indoor seating for exclusive events",
        bg: "linear-gradient(135deg, #2a1a0a 0%, #1f0d00 50%, #0a0a0a 100%)",
      },
      {
        title: "Beach Club",
        sub: "Sunbeds, cocktails and the Mediterranean",
        bg: "linear-gradient(135deg, #0a1a2a 0%, #0d2030 50%, #0a1420 100%)",
      },
    ],
  };
};

const form = reactive(defaultForm());

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toggleTag = (tag) =>
  form.tags.includes(tag)
    ? form.tags.splice(form.tags.indexOf(tag), 1)
    : form.tags.push(tag);
const toggleLang = (code) =>
  form.languages.includes(code)
    ? form.languages.splice(form.languages.indexOf(code), 1)
    : form.languages.push(code);

const moveSlide = (i, dir) => {
  const j = i + dir;
  if (j < 0 || j >= form.slides.length) return;
  [form.slides[i], form.slides[j]] = [form.slides[j], form.slides[i]];
  if (previewSlide.value === i) previewSlide.value = j;
  else if (previewSlide.value === j) previewSlide.value = i;
};

const activeEnvs = computed(() => form.environments.filter((e) => e.active));

// ─── Preview ──────────────────────────────────────────────────────────────────
const previewSlide = ref(0);

// ─── Save / Reset ─────────────────────────────────────────────────────────────
const saving = ref(false);

const saveChanges = () => {
  saving.value = true;
  updateVenue(VENUE_LIST[0].id, {
    name: form.name,
    description: form.description,
    ambienceTags: [...form.tags],
    dressCode: form.dressCode,
    supportedLanguages: [...form.languages],
  });
  setTimeout(() => {
    saving.value = false;
    notifySuccess("Venue identity saved successfully");
  }, 700);
};

const resetForm = () => {
  Object.assign(form, defaultForm());
  notifySuccess("Form reset to defaults");
};
</script>

<style scoped>
/* ═══ BASE ═══ */
.spotly-main {
  background: #0a0e14;
  min-height: 100vh;
}

.studio-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 48px 80px;
}

/* ═══ PAGE HEADER ═══ */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-eyebrow {
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}

.page-title {
  font-family: var(--font-heading);
  font-size: 2.1rem;
  font-weight: 700;
  color: #f0ead6;
  line-height: 1.15;
  margin: 0 0 8px;
}

.page-sub {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: #6a7080;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.header-line {
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(212, 175, 55, 0.3) 0%,
    rgba(212, 175, 55, 0.05) 100%
  );
  margin-top: 24px;
}

/* ═══ GRID ═══ */
.studio-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 48px;
  align-items: start;
}

@media (max-width: 1024px) {
  .studio-grid {
    grid-template-columns: 1fr;
  }
  .preview-sticky {
    position: static !important;
  }
  .studio-container {
    padding: 32px 24px 60px;
  }
}

.editor-col {
  min-width: 0;
}
.preview-col {
  min-width: 0;
}

/* ═══ FORM SECTIONS ═══ */
.form-section {
  background: #13181f;
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 14px;
  overflow: hidden;
}

.section-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.08);
  background: rgba(212, 175, 55, 0.03);
}

.section-num {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #d4af37;
  color: #0a0e14;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.section-title {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: #f0ead6;
  letter-spacing: 0.01em;
}

.section-sub {
  font-family: var(--font-body);
  font-size: 0.78rem;
  color: #6a7080;
  margin-top: 2px;
}

.fields-wrap {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 500;
  color: #b8bcc8;
  letter-spacing: 0.02em;
}

.req {
  color: #c71585;
}

.field-hint {
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: #4a5568;
  margin-top: 2px;
}

/* ═══ TAGS ═══ */
.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip {
  padding: 5px 13px;
  border-radius: 20px;
  border: 1px solid rgba(212, 175, 55, 0.18);
  background: transparent;
  font-family: var(--font-body);
  font-size: 0.78rem;
  color: #6a7080;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.tag-chip:hover {
  border-color: rgba(212, 175, 55, 0.45);
  color: #b8bcc8;
  background: rgba(212, 175, 55, 0.05);
}

.tag-chip--active {
  background: rgba(212, 175, 55, 0.12);
  border-color: #d4af37;
  color: #d4af37;
  font-weight: 500;
}

/* ═══ DRESS CODE ═══ */
.dress-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.dress-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 14px 8px;
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.12);
  background: rgba(255, 255, 255, 0.02);
  font-family: var(--font-body);
  font-size: 0.74rem;
  color: #6a7080;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
  user-select: none;
}

.dress-option:hover {
  border-color: rgba(212, 175, 55, 0.35);
  color: #b8bcc8;
}

.dress-option--active {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
  color: #d4af37;
  font-weight: 500;
}

/* ═══ LANGUAGES ═══ */
.lang-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.lang-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(212, 175, 55, 0.18);
  background: transparent;
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: #6a7080;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.lang-chip:hover {
  border-color: rgba(212, 175, 55, 0.4);
  color: #b8bcc8;
}

.lang-chip--active {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
  color: #d4af37;
  font-weight: 500;
}

.lang-flag {
  font-size: 1rem;
}

/* ═══ HOURS ═══ */
.env-hours-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.env-hours-row:last-child {
  border-bottom: none;
}

.env-hours-label {
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 500;
  color: #b8bcc8;
  display: flex;
  align-items: center;
  min-width: 150px;
}

.env-hours-fields {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.hours-input {
  max-width: 130px;
}

.hours-dash {
  font-family: var(--font-body);
  color: #4a5568;
  font-size: 0.9rem;
}

.env-toggle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid rgba(74, 85, 104, 0.4);
  color: #4a5568;
  transition: all 0.15s;
  flex-shrink: 0;
}

.env-toggle--on {
  background: rgba(46, 187, 87, 0.15);
  border-color: #2ebb57;
  color: #2ebb57;
}

/* ═══ GALLERY ═══ */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.gallery-item-inner {
  position: relative;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.1);
}

.gallery-item--active .gallery-item-inner {
  border-color: rgba(212, 175, 55, 0.45);
  box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.18);
}

.gallery-order-badge {
  position: absolute;
  top: 6px;
  left: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.9);
  color: #0a0e14;
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-arrows {
  position: absolute;
  bottom: 5px;
  right: 6px;
  display: flex;
  gap: 2px;
}

.gallery-arrow {
  cursor: pointer;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 3px;
  padding: 2px;
}

.gallery-title-input :deep(.v-field__input) {
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 600;
  color: #f0ead6;
  padding: 4px 0;
  min-height: unset;
}

.gallery-sub-input :deep(.v-field__input) {
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: #6a7080;
  padding: 2px 0;
  min-height: unset;
}

/* ═══ PREVIEW PANEL ═══ */
.preview-sticky {
  position: sticky;
  top: 80px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.preview-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2ebb57;
  box-shadow: 0 0 0 0 rgba(46, 187, 87, 0.6);
  animation: livePulse 1.6s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes livePulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(46, 187, 87, 0.6);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(46, 187, 87, 0);
  }
}

.preview-label {
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 600;
  color: #f0ead6;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.preview-sub {
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: #4a5568;
  margin-left: auto;
  font-style: italic;
}

.venue-preview-card {
  background: #13181f;
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

/* Hero */
.vp-hero {
  height: 150px;
  position: relative;
  transition: background 0.5s ease;
}

.vp-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(10, 14, 20, 0.85) 0%,
    transparent 60%
  );
}

.vp-hero-content {
  position: absolute;
  bottom: 12px;
  left: 16px;
  right: 16px;
  z-index: 2;
}

.vp-scene-label {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 700;
  color: #f0ead6;
  line-height: 1.2;
}

.vp-scene-sub {
  font-family: var(--font-body);
  font-size: 0.68rem;
  color: #8a8fa8;
  margin-top: 2px;
}

.vp-slide-dots {
  position: absolute;
  top: 10px;
  right: 12px;
  z-index: 3;
  display: flex;
  gap: 5px;
}

.vp-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.2s;
}

.vp-dot--active {
  background: #d4af37;
  width: 14px;
  border-radius: 3px;
}

/* Body */
.vp-body {
  padding: 16px;
}

.vp-type-badge {
  display: inline-block;
  padding: 2px 9px;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 12px;
  font-family: var(--font-body);
  font-size: 0.65rem;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.vp-name {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 700;
  color: #d4af37;
  line-height: 1.2;
  margin-top: 6px;
}

.vp-location {
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: #6a7080;
}

.vp-tagline {
  font-family: var(--font-heading);
  font-size: 0.82rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.6);
  border-left: 2px solid rgba(212, 175, 55, 0.35);
  padding-left: 10px;
  line-height: 1.5;
}

.vp-desc {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: #6a7080;
  line-height: 1.6;
}

.vp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.vp-tag {
  font-family: var(--font-body);
  font-size: 0.68rem;
  color: rgba(212, 175, 55, 0.75);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 10px;
  padding: 2px 8px;
  letter-spacing: 0.5px;
}

.vp-meta-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.vp-meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: #8a8fa8;
}

.vp-hours {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.08);
  border-radius: 8px;
  padding: 8px 12px;
}

.vp-hours-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-body);
  font-size: 0.72rem;
  padding: 3px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.vp-hours-row:last-child {
  border-bottom: none;
}

.vp-env-name {
  color: #8a8fa8;
}
.vp-env-hours {
  color: #d4af37;
  font-weight: 500;
}

.vp-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.vp-cta-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 9px 0;
  background: #d4af37;
  border-radius: 7px;
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 600;
  color: #0a0e14;
  letter-spacing: 0.04em;
}

.vp-cta-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 9px 0;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 7px;
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: #d4af37;
  letter-spacing: 0.04em;
}

/* Preview note */
.preview-note {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: #4a5568;
  font-style: italic;
}

/* ═══ BUTTONS ═══ */
.gold-btn {
  background: #d4af37 !important;
  color: #0a0e14 !important;
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  box-shadow: 0 4px 14px rgba(212, 175, 55, 0.18);
}

.gold-btn:hover {
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.35);
}

.secondary-btn {
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
  color: #d4af37 !important;
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.03em;
}

.secondary-btn:hover {
  border-color: rgba(212, 175, 55, 0.6) !important;
  background: rgba(212, 175, 55, 0.06) !important;
}

/* ═══ INPUT OVERRIDES ═══ */
:deep(.spotly-input .v-field) {
  background: #0d1117;
  border-radius: 8px;
}

:deep(.spotly-input .v-field__input) {
  color: #f0ead6;
  font-family: var(--font-body);
  font-size: 0.88rem;
}

:deep(.spotly-input .v-field__input::placeholder) {
  color: #4a5568;
  opacity: 1;
}

:deep(.spotly-input .v-field--focused .v-field__outline) {
  color: #d4af37;
}

:deep(.spotly-input .v-field__outline) {
  color: rgba(212, 175, 55, 0.18);
}

:deep(.spotly-input .v-input__prepend .v-icon) {
  color: #4a5568;
}

:deep(.spotly-input .v-counter) {
  color: #4a5568;
  font-family: var(--font-body);
  font-size: 0.7rem;
}

:deep(.spotly-input .v-select__selection-text) {
  color: #f0ead6;
  font-family: var(--font-body);
  font-size: 0.88rem;
}
</style>
