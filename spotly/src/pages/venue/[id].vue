<template>
  <AppNavbarVenue
    :show-default-actions="true"
    :show-powered-by="true"
    :venue-name="venue?.name ?? 'Venue'"
  />

  <!-- OWNER PREVIEW BANNER -->
  <Transition name="banner-slide">
    <div v-if="isOwnVenue" class="owner-banner">
      <div class="owner-banner__left">
        <v-icon color="#d4af37" size="16">mdi-crown</v-icon>
        <span>You are previewing your own venue — reservations are disabled</span>
      </div>
      <button class="owner-banner__btn" @click="router.push('/admin/dashboard')">
        <v-icon size="13">mdi-cog-outline</v-icon>
        Go to Admin Panel
      </button>
    </div>
  </Transition>

  <v-main>
    <div class="venue-page">

      <!-- ═══════════════════════════════════════════
           FULLSCREEN HERO WITH SLIDESHOW BACKGROUND
           ═══════════════════════════════════════════ -->
      <section ref="heroRef" class="hero">

        <!-- Slide backgrounds (fullscreen, Ken Burns) -->
        <div class="hero__slides">
          <div
            v-for="(slide, i) in slides"
            :key="i"
            class="hero__slide"
            :class="{ 'hero__slide--active': currentSlide === i, 'hero__slide--prev': prevSlideIndex === i }"
            :style="slide.imageUrl
              ? { backgroundImage: `url(${slide.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: slide.bg }"
          />
        </div>

        <!-- Deep dark overlay gradient -->
        <div class="hero__overlay" />

        <!-- Parallax content layer -->
        <div class="hero__content" :style="{ transform: `translateY(${parallaxY}px)` }">

          <!-- Eyebrow -->
          <div class="hero__eyebrow">
            <span class="hero__eyebrow-dot" />
            Premium Venue
          </div>

          <!-- Venue name -->
          <h1 class="hero__title">{{ venue?.name ?? 'Venue' }}</h1>

          <!-- Description quote -->
          <div v-if="venue?.description" class="hero__quote">
            <div class="hero__quote-bar" />
            <p class="hero__quote-text">"{{ venue.description }}"</p>
          </div>

          <!-- Ambience tags (floating chips) -->
          <div v-if="tags.length > 0" class="hero__tags">
            <span
              v-for="tag in tags"
              :key="tag"
              class="hero__tag"
            ># {{ tag }}</span>
          </div>

          <!-- CTA glass panel -->
          <div class="hero__cta-panel">
            <button class="hero__cta-primary" @click="goToMenu">
              <v-icon size="17">mdi-silverware-fork-knife</v-icon>
              Explore Menu
            </button>

            <v-tooltip
              :disabled="!isOwnVenue && hasEnvironments"
              :text="isOwnVenue ? 'You cannot book your own venue' : (!hasEnvironments ? 'No environments configured yet' : '')"
            >
              <template #activator="{ props: tooltipProps }">
                <span v-bind="tooltipProps">
                  <button
                    class="hero__cta-secondary"
                    :class="{ 'hero__cta--disabled': isOwnVenue || !hasEnvironments }"
                    :disabled="isOwnVenue || !hasEnvironments"
                    @click="goToBooking"
                  >
                    <v-icon size="17">mdi-calendar-check</v-icon>
                    Make Reservation
                  </button>
                </span>
              </template>
            </v-tooltip>

            <v-tooltip
              :disabled="!isOwnVenue && hasEnvironments"
              :text="isOwnVenue ? 'You cannot book your own venue' : (!hasEnvironments ? 'No environments configured yet' : '')"
            >
              <template #activator="{ props: tooltipProps }">
                <span v-bind="tooltipProps" style="display:contents">
                  <button
                    class="hero__cta-ghost"
                    :class="{ 'hero__cta--disabled': isOwnVenue || !hasEnvironments }"
                    :disabled="isOwnVenue || !hasEnvironments"
                    @click="goToBooking"
                  >
                    <v-icon size="17">mdi-beach</v-icon>
                    Choose Your Environment
                  </button>
                </span>
              </template>
            </v-tooltip>
          </div>
        </div>

        <!-- Filmstrip slide controls (bottom) -->
        <div class="hero__filmstrip">
          <button aria-label="Previous slide" class="hero__arrow hero__arrow--left" @click="prevSlide">
            <v-icon size="18">mdi-chevron-left</v-icon>
          </button>

          <div class="hero__dots">
            <button
              v-for="(slide, i) in slides"
              :key="i"
              :aria-label="`Go to slide ${i + 1}: ${slide.title}`"
              class="hero__dot"
              :class="{ 'hero__dot--active': currentSlide === i }"
              @click="currentSlide = i"
            >
              <span
                class="hero__dot-thumb"
                :style="slide.imageUrl
                  ? { backgroundImage: `url(${slide.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: slide.bg }"
              />
              <span class="hero__dot-label">{{ slide.title }}</span>
            </button>
          </div>

          <button aria-label="Next slide" class="hero__arrow hero__arrow--right" @click="nextSlide">
            <v-icon size="18">mdi-chevron-right</v-icon>
          </button>
        </div>

        <!-- Scroll indicator -->
        <div aria-hidden="true" class="hero__scroll-hint">
          <span class="hero__scroll-text">Scroll to explore</span>
          <div class="hero__scroll-arrow">
            <v-icon color="rgba(212,175,55,0.7)" size="20">mdi-chevron-down</v-icon>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════
           SPECS BAR — IMPORTANT INFO
           ═══════════════════════════════════════════ -->
      <section ref="specsRef" class="specs-bar">
        <div class="specs-bar__eyebrow">What to Know</div>
        <div class="specs-bar__items">
          <div
            v-for="(info, idx) in importantInfo"
            :key="info.label"
            class="specs-bar__item"
          >
            <div class="specs-bar__icon-wrap">
              <v-icon color="#D4AF37" :icon="info.icon" size="22" />
            </div>
            <div class="specs-bar__value">{{ info.value }}</div>
            <div class="specs-bar__label">{{ info.label }}</div>
            <div v-if="idx < importantInfo.length - 1" aria-hidden="true" class="specs-bar__sep" />
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════
           ACTIVITIES SECTION
           ═══════════════════════════════════════════ -->
      <section
        v-if="activities.length > 0"
        ref="activitiesRef"
        class="activities-section"
      >
        <div class="activities-section__inner">
          <div class="section-eyebrow">Experiences & Activities</div>
          <h2 class="section-title">What Awaits You</h2>
          <div class="activities-grid">
            <div
              v-for="(activity, idx) in activities"
              :key="activity"
              class="activity-tag"
              :style="{ '--rot': activityRot(idx) }"
            >
              <v-icon color="#D4AF37" size="14" style="margin-right:6px;flex-shrink:0">mdi-star-four-points</v-icon>
              {{ activity }}
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════
           BOTTOM CTA STRIP
           ═══════════════════════════════════════════ -->
      <section class="bottom-cta">
        <div class="bottom-cta__inner">
          <div class="bottom-cta__text">
            <div class="section-eyebrow">Ready to Visit?</div>
            <h2 class="bottom-cta__heading">Reserve your table tonight</h2>
          </div>
          <div class="bottom-cta__actions">
            <button class="hero__cta-primary" @click="goToMenu">
              <v-icon size="17">mdi-silverware-fork-knife</v-icon>
              View Menu
            </button>
            <v-tooltip
              :disabled="!isOwnVenue && hasEnvironments"
              :text="isOwnVenue ? 'You cannot book your own venue' : (!hasEnvironments ? 'No environments configured yet' : '')"
            >
              <template #activator="{ props: tooltipProps }">
                <span v-bind="tooltipProps">
                  <button
                    class="hero__cta-secondary"
                    :class="{ 'hero__cta--disabled': isOwnVenue || !hasEnvironments }"
                    :disabled="isOwnVenue || !hasEnvironments"
                    @click="goToBooking"
                  >
                    <v-icon size="17">mdi-calendar-check</v-icon>
                    Book Now
                  </button>
                </span>
              </template>
            </v-tooltip>
          </div>
        </div>
      </section>

    </div>
  </v-main>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import AppNavbarVenue from '@/components/layout/AppNavbarVenue.vue'
  import { ENVIRONMENT_LIST } from '@/datamodel/Environment.js'
  import { getVenueById } from '@/datamodel/Venue.js'

  let _session = null
  try {
    _session = JSON.parse(localStorage.getItem('spotly_session') || 'null')
  } catch {}

  const route = useRoute()
  const router = useRouter()

  const venueId = computed(() => Number(route.params.id))
  const venue = computed(() => getVenueById(venueId.value))

  const tags = computed(() => venue.value?.ambienceTags ?? [])
  const activities = computed(() => venue.value?.activities ?? [])

  const _fallbackSlides = [
    {
      title: 'Main Hall',
      sub: 'Elegant setting for unforgettable evenings',
      bg: 'linear-gradient(135deg, #1a2a3a 0%, #0d1f2d 40%, #0a1a25 100%)',
      imageUrl: '',
    },
    {
      title: 'Terrace',
      sub: 'Open-air seating with panoramic views',
      bg: 'linear-gradient(135deg, #2a1a0a 0%, #1a1005 40%, #0f0a02 100%)',
      imageUrl: '',
    },
    {
      title: 'Private Area',
      sub: 'Intimate reserved spaces for exclusive events',
      bg: 'linear-gradient(135deg, #0a1a2a 0%, #051015 40%, #020a0f 100%)',
      imageUrl: '',
    },
  ]

  const slides = computed(() => {
    const venueSlides = venue.value?.slides
    if (venueSlides?.length) {
      return venueSlides.map(s => ({
        title: s.title ?? '',
        sub: s.subtitle ?? '',
        bg: s.bgColor || 'linear-gradient(135deg, #1a2a3a 0%, #0d1f2d 40%, #0a1a25 100%)',
        imageUrl: s.imageUrl ?? '',
      }))
    }
    return _fallbackSlides
  })

  const currentSlide = ref(0)
  const prevSlideIndex = ref(-1)
  let timer = null

  function nextSlide () {
    prevSlideIndex.value = currentSlide.value
    currentSlide.value = (currentSlide.value + 1) % slides.value.length
  }
  function prevSlide () {
    prevSlideIndex.value = currentSlide.value
    currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length
  }

  // Parallax scroll
  const parallaxY = ref(0)
  const heroRef = ref(null)

  function handleScroll () {
    const scrollY = window.scrollY
    parallaxY.value = scrollY * 0.22
  }

  onMounted(() => {
    timer = setInterval(nextSlide, 4500)
    window.addEventListener('scroll', handleScroll, { passive: true })
  })
  onUnmounted(() => {
    clearInterval(timer)
    window.removeEventListener('scroll', handleScroll)
  })

  const importantInfo = computed(() => [
    {
      icon: 'mdi-hanger',
      label: 'Dress Code',
      value: venue.value?.dressCode || 'Smart Casual',
    },
    {
      icon: 'mdi-translate',
      label: 'Languages',
      value: venue.value?.supportedLanguages?.join(', ') || 'English',
    },
    {
      icon: 'mdi-clock-outline',
      label: 'Opening Hours',
      value: '12:00 PM – 2:00 AM',
    },
    {
      icon: 'mdi-map-marker-outline',
      label: 'Location',
      value: 'Contact venue for address',
    },
  ])

  // Seeded rotation for activity tags (deterministic by index)
  function activityRot (idx) {
    const rotations = [-3, 2, -1.5, 3.5, -2.5, 1, -4, 2.5, -1, 3, -2, 1.5]
    return `${rotations[idx % rotations.length]}deg`
  }

  const hasEnvironments = computed(() =>
    ENVIRONMENT_LIST.some(e => e.venueId === venueId.value),
  )

  const isOwnVenue = computed(() =>
    !!_session && venue.value?.adminEmail === _session.email,
  )

  function goToBooking () {
    router.push(`/booking/environment?venueId=${venueId.value}`)
  }

  function goToMenu () {
    router.push(`/menu/${venueId.value}`)
  }
</script>

<style scoped>
/* ─────────────────────────────────────────────
   OWNER BANNER
───────────────────────────────────────────── */
.owner-banner {
  position: relative;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 32px;
  background: rgba(212, 175, 55, 0.08);
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  backdrop-filter: blur(8px);
}

.owner-banner__left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d4af37;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.owner-banner__btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  background: rgba(212, 175, 55, 0.14);
  border: 1px solid rgba(212, 175, 55, 0.32);
  border-radius: 4px;
  color: #d4af37;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
  white-space: nowrap;
}

.owner-banner__btn:hover {
  background: rgba(212, 175, 55, 0.22);
  border-color: rgba(212, 175, 55, 0.5);
}

/* Banner transition */
.banner-slide-enter-active { transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.banner-slide-leave-active { transition: all 0.25s ease-in; }
.banner-slide-enter-from,
.banner-slide-leave-to { transform: translateY(-100%); opacity: 0; }

/* ─────────────────────────────────────────────
   PAGE WRAPPER
───────────────────────────────────────────── */
.venue-page {
  background: var(--color-bg, #0a0e14);
  min-height: 100vh;
  overflow-x: hidden;
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
.hero {
  position: relative;
  width: 100%;
  height: 100svh;
  min-height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* Slide backgrounds */
.hero__slides {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero__slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: scale(1.08);
  transition: opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

.hero__slide--active {
  opacity: 1;
  animation: kenBurns 9s ease-in-out infinite alternate;
}

.hero__slide--prev {
  opacity: 0;
  transition: opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes kenBurns {
  0%   { transform: scale(1.0) translate(0, 0); }
  100% { transform: scale(1.1) translate(-1%, -1%); }
}

@media (prefers-reduced-motion: reduce) {
  .hero__slide--active { animation: none; transform: scale(1); }
}

/* Overlay gradient */
.hero__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(
      to bottom,
      rgba(10, 14, 20, 0.25) 0%,
      rgba(10, 14, 20, 0.1) 30%,
      rgba(10, 14, 20, 0.55) 60%,
      rgba(10, 14, 20, 0.92) 85%,
      rgba(10, 14, 20, 1) 100%
    );
  pointer-events: none;
}

/* Content layer (parallax target) */
.hero__content {
  position: relative;
  z-index: 2;
  padding: 0 max(5vw, 24px) 180px;
  max-width: 860px;
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .hero__content { transform: none !important; }
}

/* Eyebrow */
.hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.75);
  margin-bottom: 16px;
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.hero__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d4af37;
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(212, 175, 55, 0.7);
}

/* Title */
.hero__title {
  font-family: var(--font-heading, 'Playfair Display', serif);
  font-size: clamp(2.6rem, 6vw, 5rem);
  font-weight: 700;
  line-height: 1.08;
  color: #ffffff;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.5), 0 0 60px rgba(212, 175, 55, 0.08);
  margin: 0 0 24px;
  animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

/* Quote */
.hero__quote {
  display: flex;
  gap: 18px;
  margin-bottom: 28px;
  animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}

.hero__quote-bar {
  width: 2px;
  min-height: 100%;
  background: linear-gradient(to bottom, rgba(212,175,55,0.7), rgba(212,175,55,0.1));
  flex-shrink: 0;
  border-radius: 2px;
}

.hero__quote-text {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 1rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.7;
  margin: 0;
  max-width: 560px;
}

/* Tags */
.hero__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 36px;
  animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both;
}

.hero__tag {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 1.5px;
  color: rgba(212, 175, 55, 0.85);
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 3px;
  padding: 4px 10px;
  backdrop-filter: blur(4px);
  transition: background 0.2s ease, border-color 0.2s ease;
}

.hero__tag:hover {
  background: rgba(212, 175, 55, 0.14);
  border-color: rgba(212, 175, 55, 0.38);
}

/* CTA glass panel */
.hero__cta-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px 24px;
  background: rgba(10, 14, 20, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(212, 175, 55, 0.14);
  border-radius: 8px;
  width: fit-content;
  animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both;
}

/* CTA buttons */
.hero__cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 28px;
  height: 48px;
  background: #d4af37;
  color: #0a0e14;
  border: none;
  border-radius: 4px;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  white-space: nowrap;
}

.hero__cta-primary:hover {
  background: #e8c84a;
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(212, 175, 55, 0.35);
}

.hero__cta-primary:active { transform: translateY(0); }

.hero__cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 28px;
  height: 48px;
  background: transparent;
  color: #d4af37;
  border: 1px solid rgba(212, 175, 55, 0.5);
  border-radius: 4px;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
  white-space: nowrap;
}

.hero__cta-secondary:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.8);
  transform: translateY(-1px);
}

.hero__cta-secondary:active { transform: translateY(0); }

.hero__cta-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 28px;
  height: 48px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
  white-space: nowrap;
}

.hero__cta-ghost:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.hero__cta-ghost:active { transform: translateY(0); }

.hero__cta--disabled {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}

/* Filmstrip */
.hero__filmstrip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px max(5vw, 24px);
  background: linear-gradient(to top, rgba(10, 14, 20, 0.9) 0%, transparent 100%);
}

.hero__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
  flex-shrink: 0;
}

.hero__arrow:hover {
  background: rgba(212, 175, 55, 0.15);
  border-color: rgba(212, 175, 55, 0.4);
  color: #d4af37;
}

.hero__dots {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 4px 0;
}

.hero__dots::-webkit-scrollbar { display: none; }

.hero__dot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.hero__dot:hover { transform: translateY(-2px); }

.hero__dot-thumb {
  display: block;
  width: 52px;
  height: 32px;
  border-radius: 3px;
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  overflow: hidden;
}

.hero__dot--active .hero__dot-thumb {
  border-color: #d4af37;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
}

.hero__dot-label {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.25s ease;
  text-align: center;
  max-width: 60px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero__dot--active .hero__dot-label { color: #d4af37; }

/* Scroll hint */
.hero__scroll-hint {
  position: absolute;
  bottom: 80px;
  right: max(5vw, 24px);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  opacity: 0.6;
  pointer-events: none;
}

.hero__scroll-text {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.7);
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}

.hero__scroll-arrow {
  animation: bounceY 1.8s ease-in-out infinite;
}

@keyframes bounceY {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(6px); }
}

@media (prefers-reduced-motion: reduce) {
  .hero__scroll-arrow { animation: none; }
}

/* ─────────────────────────────────────────────
   SPECS BAR
───────────────────────────────────────────── */
.specs-bar {
  position: relative;
  background: var(--color-surface, #13181f);
  border-top: 1px solid rgba(212, 175, 55, 0.1);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  padding: 48px max(5vw, 24px) 52px;
}

.specs-bar::before {
  content: '';
  position: absolute;
  top: 0; left: 50%; right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(212,175,55,0.3), transparent);
  transform: translateX(-50%);
  width: 60%;
}

.specs-bar__eyebrow {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.55);
  text-align: center;
  margin-bottom: 36px;
}

.specs-bar__items {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 0;
  flex-wrap: wrap;
  max-width: 1100px;
  margin: 0 auto;
}

.specs-bar__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 24px 40px;
  flex: 1;
  min-width: 180px;
  text-align: center;
}

.specs-bar__icon-wrap {
  width: 48px;
  height: 48px;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.06);
  margin-bottom: 4px;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.specs-bar__item:hover .specs-bar__icon-wrap {
  border-color: rgba(212, 175, 55, 0.5);
  background: rgba(212, 175, 55, 0.1);
}

.specs-bar__value {
  font-family: var(--font-heading, 'Playfair Display', serif);
  font-size: 1.15rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.3;
}

.specs-bar__label {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.55);
}

.specs-bar__sep {
  position: absolute;
  right: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(212, 175, 55, 0.2), transparent);
}

/* ─────────────────────────────────────────────
   ACTIVITIES SECTION
───────────────────────────────────────────── */
.activities-section {
  padding: 80px max(5vw, 24px);
  background: var(--color-bg, #0a0e14);
}

.activities-section__inner {
  max-width: 1100px;
  margin: 0 auto;
}

.section-eyebrow {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.55);
  margin-bottom: 10px;
}

.section-title {
  font-family: var(--font-heading, 'Playfair Display', serif);
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 48px;
  line-height: 1.2;
}

.activities-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.activity-tag {
  display: inline-flex;
  align-items: center;
  padding: 12px 22px;
  background: rgba(19, 24, 31, 0.9);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 4px;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);
  letter-spacing: 0.3px;
  transform: rotate(var(--rot, 0deg));
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  cursor: default;
  user-select: none;
}

.activity-tag:hover {
  transform: rotate(0deg) scale(1.04);
  background: rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.35);
  color: #ffffff;
}

@media (prefers-reduced-motion: reduce) {
  .activity-tag { transform: none !important; }
}

/* ─────────────────────────────────────────────
   BOTTOM CTA STRIP
───────────────────────────────────────────── */
.bottom-cta {
  background: var(--color-surface, #13181f);
  border-top: 1px solid rgba(212, 175, 55, 0.1);
  padding: 64px max(5vw, 24px);
}

.bottom-cta__inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
}

.bottom-cta__text { flex: 1; min-width: 200px; }

.bottom-cta__heading {
  font-family: var(--font-heading, 'Playfair Display', serif);
  font-size: clamp(1.4rem, 2.5vw, 2rem);
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.25;
}

.bottom-cta__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

/* ─────────────────────────────────────────────
   SHARED KEYFRAMES
───────────────────────────────────────────── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─────────────────────────────────────────────
   RESPONSIVE
───────────────────────────────────────────── */
@media (max-width: 768px) {
  .hero__content {
    padding: 0 20px 200px;
  }

  .hero__title {
    font-size: clamp(2rem, 9vw, 3rem);
  }

  .hero__cta-panel {
    flex-direction: column;
    width: 100%;
    padding: 16px;
  }

  .hero__cta-primary,
  .hero__cta-secondary,
  .hero__cta-ghost {
    width: 100%;
    justify-content: center;
  }

  .hero__dot-thumb { width: 36px; height: 24px; }
  .hero__dot-label { display: none; }

  .hero__scroll-hint { display: none; }

  .owner-banner {
    flex-direction: column;
    align-items: flex-start;
    padding: 10px 16px;
    gap: 8px;
  }

  .specs-bar__item { min-width: 140px; padding: 20px 20px; }
  .specs-bar__sep  { display: none; }

  .activities-section { padding: 56px 20px; }

  .bottom-cta__inner { flex-direction: column; align-items: flex-start; }
  .bottom-cta__actions { width: 100%; }
  .bottom-cta__actions .hero__cta-primary,
  .bottom-cta__actions .hero__cta-secondary { flex: 1; justify-content: center; }
}

@media (max-width: 480px) {
  .hero__filmstrip { padding: 10px 12px; }
  .hero__dot-thumb { width: 28px; height: 18px; }
  .specs-bar { padding: 36px 16px 40px; }
  .specs-bar__item { min-width: 100%; flex-direction: row; align-items: center; text-align: left; gap: 14px; padding: 14px 0; border-bottom: 1px solid rgba(212,175,55,0.08); }
  .specs-bar__icon-wrap { flex-shrink: 0; width: 40px; height: 40px; }
  .specs-bar__sep { display: none; }
}
</style>
