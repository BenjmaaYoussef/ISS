<template>
  <div class="landing-root">
    <AppNavbarPublic />

    <v-main>
      <!-- ═══════════════════════════════════════════
           HERO SECTION — Fullscreen parallax + orbs
      ═══════════════════════════════════════════ -->
      <section ref="heroRef" class="hero-section">
        <!-- Parallax background layers -->
        <div class="hero-bg-layer hero-bg-deep" />
        <div class="hero-bg-layer hero-bg-mid" :style="{ transform: `translateY(${parallaxMid}px)` }" />

        <!-- Animated floating orbs -->
        <div class="orb orb-1" />
        <div class="orb orb-2" />
        <div class="orb orb-3" />
        <div class="orb orb-4" />

        <!-- Geometric grid overlay -->
        <div class="hero-grid-overlay" />

        <!-- Hero content -->
        <div class="hero-content">
          <div class="hero-eyebrow animate-fadeup animate-delay-0">
            <span class="eyebrow-line" />
            <span class="eyebrow-text">Luxury Venue Management</span>
            <span class="eyebrow-line" />
          </div>

          <h1 class="hero-title animate-fadeup animate-delay-1">
            Transform Your Venue
            <br>
            <span class="hero-title-accent">Into An Experience</span>
          </h1>

          <p class="hero-subtitle animate-fadeup animate-delay-2">
            The ultimate booking &amp; floor management system<br class="d-none d-sm-block">
            for high-end hospitality.
          </p>

          <div class="hero-ctas animate-fadeup animate-delay-3">
            <v-btn
              class="hero-btn-primary"
              color="primary"
              size="large"
              to="/auth"
            >
              <v-icon icon="mdi-star-four-points" size="16" start />
              Get Started For Free
            </v-btn>
            <v-btn
              class="hero-btn-outline"
              color="primary"
              size="large"
              to="/home"
              variant="outlined"
            >
              Explore Venues
              <v-icon end icon="mdi-arrow-right" size="16" />
            </v-btn>
          </div>

          <!-- Floating stat pills -->
          <div class="hero-pills animate-fadeup animate-delay-4">
            <div class="stat-pill">
              <v-icon color="primary" icon="mdi-check-circle" size="14" />
              <span>No credit card required</span>
            </div>
            <div class="stat-pill-divider" />
            <div class="stat-pill">
              <v-icon color="primary" icon="mdi-shield-check" size="14" />
              <span>Enterprise-grade security</span>
            </div>
            <div class="stat-pill-divider" />
            <div class="stat-pill">
              <v-icon color="primary" icon="mdi-clock-fast" size="14" />
              <span>Setup in 5 minutes</span>
            </div>
          </div>
        </div>

        <!-- Scroll indicator -->
        <div class="hero-scroll-hint">
          <div class="scroll-mouse">
            <div class="scroll-wheel" />
          </div>
          <span>Scroll to explore</span>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════
           TRUSTED BY — Animated marquee ticker
      ═══════════════════════════════════════════ -->
      <div class="trusted-strip">
        <div class="trusted-inner">
          <span class="trusted-label">Trusted by</span>
          <div class="marquee-track">
            <div class="marquee-content">
              <span
                v-for="brand in [...trustedBrands, ...trustedBrands, ...trustedBrands]"
                :key="brand + Math.random()"
                class="marquee-brand"
              >
                <v-icon class="marquee-diamond" icon="mdi-diamond-outline" size="12" />
                {{ brand }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           STATS COUNTER SECTION
      ═══════════════════════════════════════════ -->
      <section ref="statsRef" class="stats-section">
        <div class="stats-bg-gradient" />
        <v-container style="max-width: 900px; position: relative; z-index: 1;">
          <v-row justify="center">
            <v-col
              v-for="stat in statsData"
              :key="stat.label"
              class="text-center"
              cols="6"
              sm="3"
            >
              <div class="stat-card" :class="{ 'stat-card-visible': statsVisible }">
                <div class="stat-number">
                  <span class="stat-counter">{{ stat.display }}</span>
                  <span class="stat-suffix">{{ stat.suffix }}</span>
                </div>
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-underline" />
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ═══════════════════════════════════════════
           HOW IT WORKS — Diagonal timeline layout
      ═══════════════════════════════════════════ -->
      <section id="how-it-works" ref="hiwRef" class="hiw-section">
        <v-container style="max-width: 1000px; position: relative; z-index: 1;">
          <div class="section-header" :class="{ visible: hiwVisible }">
            <p class="section-overline">The Process</p>
            <h2 class="section-title">How It Works</h2>
            <div class="section-title-bar" />
          </div>

          <!-- Timeline layout -->
          <div class="hiw-timeline">
            <div
              v-for="(step, i) in howItWorks"
              :key="step.title"
              class="hiw-step"
              :class="[`hiw-step-${i}`, { 'hiw-step-visible': hiwVisible }, i % 2 === 1 ? 'hiw-step-right' : 'hiw-step-left']"
              :style="{ transitionDelay: `${0.1 + i * 0.18}s` }"
            >
              <div v-if="i < howItWorks.length - 1" class="hiw-connector" />

              <div class="hiw-card">
                <div class="hiw-step-number">{{ String(i + 1).padStart(2, '0') }}</div>
                <div class="hiw-icon-wrap">
                  <div class="hiw-icon-ring" />
                  <v-icon color="primary" :icon="step.icon" size="28" />
                </div>
                <div class="hiw-card-body">
                  <h3 class="hiw-card-title">{{ step.title }}</h3>
                  <p class="hiw-card-desc">{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </v-container>
      </section>

      <!-- ═══════════════════════════════════════════
           FEATURES — Bento grid with glassmorphism
      ═══════════════════════════════════════════ -->
      <section id="features" ref="featuresRef" class="features-section">
        <div class="features-bg-orb features-orb-1" />
        <div class="features-bg-orb features-orb-2" />
        <v-container style="max-width: 1100px; position: relative; z-index: 1;">
          <div class="section-header" :class="{ visible: featuresVisible }">
            <p class="section-overline">The Platform</p>
            <h2 class="section-title">Why Choose Us?</h2>
            <div class="section-title-bar" />
          </div>

          <!-- Bento grid -->
          <div class="bento-grid" :class="{ 'bento-visible': featuresVisible }">
            <!-- Large featured card (first feature) -->
            <div
              :ref="el => { tiltRefs['feat0'] = el }"
              class="bento-card bento-card-large glass-card"
              :style="{ transitionDelay: '0.05s' }"
              @mouseleave="resetTilt('feat0')"
              @mousemove="onTilt($event, 'feat0')"
            >
              <div class="bento-accent-line" />
              <div class="bento-card-inner">
                <div class="bento-icon-wrap">
                  <v-icon color="primary" :icon="features[0].icon" size="44" />
                  <div class="bento-icon-glow" />
                </div>
                <h3 class="bento-title">{{ features[0].title }}</h3>
                <p class="bento-desc">{{ features[0].desc }}</p>
                <div class="bento-tag">Core Feature</div>
              </div>
              <div class="bento-bg-pattern bento-bg-grid" />
            </div>

            <!-- Medium card (second) -->
            <div
              :ref="el => { tiltRefs['feat1'] = el }"
              class="bento-card bento-card-medium glass-card"
              :style="{ transitionDelay: '0.12s' }"
              @mouseleave="resetTilt('feat1')"
              @mousemove="onTilt($event, 'feat1')"
            >
              <div class="bento-accent-line" />
              <div class="bento-card-inner">
                <div class="bento-icon-wrap">
                  <v-icon color="primary" :icon="features[1].icon" size="36" />
                  <div class="bento-icon-glow" />
                </div>
                <h3 class="bento-title">{{ features[1].title }}</h3>
                <p class="bento-desc">{{ features[1].desc }}</p>
                <div class="bento-live-dot">
                  <span class="live-pulse" />
                  <span>Live updates</span>
                </div>
              </div>
            </div>

            <!-- Small cards -->
            <div
              v-for="(feat, i) in features.slice(2)"
              :key="feat.title"
              :ref="el => { tiltRefs[`feat${i + 2}`] = el }"
              class="bento-card bento-card-small glass-card"
              :style="{ transitionDelay: `${0.2 + i * 0.08}s` }"
              @mouseleave="resetTilt(`feat${i + 2}`)"
              @mousemove="onTilt($event, `feat${i + 2}`)"
            >
              <div class="bento-accent-line" />
              <div class="bento-card-inner">
                <div class="bento-icon-wrap">
                  <v-icon color="primary" :icon="feat.icon" size="32" />
                  <div class="bento-icon-glow" />
                </div>
                <h3 class="bento-title bento-title-sm">{{ feat.title }}</h3>
                <p class="bento-desc bento-desc-sm">{{ feat.desc }}</p>
              </div>
            </div>
          </div>
        </v-container>
      </section>

      <!-- ═══════════════════════════════════════════
           CTA BANNER — Full-width gold accent
      ═══════════════════════════════════════════ -->
      <section ref="ctaRef" class="cta-section">
        <div class="cta-bg-lines" />
        <div class="cta-shimmer" />
        <v-container style="max-width: 800px; position: relative; z-index: 2;">
          <div class="cta-inner" :class="{ 'cta-visible': ctaVisible }">
            <div class="cta-crown">
              <v-icon color="primary" icon="mdi-crown" size="32" />
            </div>
            <h2 class="cta-title">
              Ready to Elevate<br>
              <span class="cta-title-gold">Your Guest Experience?</span>
            </h2>
            <p class="cta-subtitle">
              Join the most sophisticated venue management platform.
              <br class="d-none d-sm-block">
              Start your free trial today — no setup fee, no commitment.
            </p>
            <div class="cta-actions">
              <v-btn
                class="cta-btn-primary"
                color="primary"
                size="x-large"
                to="/auth"
              >
                Start Free Trial
                <v-icon end icon="mdi-arrow-right" size="18" />
              </v-btn>
              <v-btn
                class="cta-btn-text"
                color="primary"
                size="x-large"
                to="/home"
                variant="text"
              >
                View Demo
              </v-btn>
            </div>
          </div>
        </v-container>
      </section>

      <!-- ═══════════════════════════════════════════
           FOOTER — Elegant with gradient divider
      ═══════════════════════════════════════════ -->
      <footer class="site-footer">
        <div class="footer-gradient-line" />
        <div class="footer-inner">
          <div class="footer-brand">
            <span class="footer-logo">Spotly</span>
            <span class="footer-tagline">Luxury Venue Management Platform</span>
          </div>

          <nav aria-label="Footer navigation" class="footer-nav">
            <a class="footer-link" href="#features">Features</a>
            <span aria-hidden="true" class="footer-dot">·</span>
            <a class="footer-link" href="#how-it-works">How It Works</a>
            <span aria-hidden="true" class="footer-dot">·</span>
            <router-link class="footer-link" to="/home">Explore</router-link>
            <span aria-hidden="true" class="footer-dot">·</span>
            <router-link class="footer-link" to="/auth">Get Started</router-link>
          </nav>

          <span class="footer-copy">© 2025 Spotly. All rights reserved.</span>
        </div>
      </footer>
    </v-main>
  </div>
</template>

<script setup>
  import { onMounted, onUnmounted, reactive, ref } from 'vue'
  import AppNavbarPublic from '@/components/layout/AppNavbarPublic.vue'
  import { RESERVATION_LIST } from '@/datamodel/Reservation.js'
  import { VENUE_LIST } from '@/datamodel/Venue.js'

  // ─── Data arrays (unchanged) ───────────────────────────────────────────────
  const trustedBrands = ['Le Meridian', 'Sunset Beach Club', 'Rosewood']
  const howItWorks = [
    { icon: 'mdi-store-search-outline', title: 'Discover a Venue', desc: 'Browse curated luxury venues filtered by ambience, activities, and style.' },
    { icon: 'mdi-seat-outline', title: 'Choose Your Table', desc: 'Pick your environment and reserve the perfect spot on a live floor map.' },
    { icon: 'mdi-glass-cocktail', title: 'Arrive & Enjoy', desc: 'Staff check you in seamlessly. Your experience begins the moment you arrive.' },
  ]
  const features = [
    { icon: 'mdi-floor-plan', title: 'Visual Floor Plans', desc: 'Drag & drop builder for indoors, beach, and terrace environments.' },
    { icon: 'mdi-sync', title: 'Real-Time Sync', desc: 'Staff see updates instantly across all devices. No double bookings.' },
    { icon: 'mdi-office-building-marker', title: 'Multi-Venue Support', desc: 'Manage multiple venues from one dashboard with ease.' },
    { icon: 'mdi-calendar-check', title: 'Smart Reservations', desc: 'Approve, modify and track every reservation with full history.' },
  ]

  // ─── Live stats from datamodel ─────────────────────────────────────────────
  const venueCount = VENUE_LIST.length || 12
  const reservationCount = RESERVATION_LIST.length || 1000
  const citiesCount = new Set(VENUE_LIST.map(v => v.location).filter(Boolean)).size || 3

  const statsData = reactive([
    { label: 'Venues', raw: venueCount, display: '0', suffix: '+' },
    { label: 'Reservations', raw: reservationCount, display: '0', suffix: '+' },
    { label: 'Cities', raw: citiesCount, display: '0', suffix: '' },
    { label: 'Satisfaction', raw: 98, display: '0', suffix: '%' },
  ])

  // ─── Parallax ──────────────────────────────────────────────────────────────
  const heroRef = ref(null)
  const parallaxMid = ref(0)

  function onScroll () {
    const scrollY = window.scrollY
    parallaxMid.value = scrollY * 0.25
  }

  // ─── Intersection Observer visibility states ───────────────────────────────
  const statsRef = ref(null)
  const hiwRef = ref(null)
  const featuresRef = ref(null)
  const ctaRef = ref(null)

  const statsVisible = ref(false)
  const hiwVisible = ref(false)
  const featuresVisible = ref(false)
  const ctaVisible = ref(false)

  // ─── Animated counters ─────────────────────────────────────────────────────
  function animateCounter (stat, duration = 1400) {
    const start = performance.now()
    const target = stat.raw
    function step (now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      stat.display = Math.floor(eased * target).toString()
      if (progress < 1) requestAnimationFrame(step)
      else stat.display = target.toString()
    }
    requestAnimationFrame(step)
  }

  // ─── 3D Tilt effect on feature cards ──────────────────────────────────────
  const tiltRefs = reactive({})

  function onTilt (e, key) {
    const el = tiltRefs[key]
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(8px)`
  }

  function resetTilt (key) {
    const el = tiltRefs[key]
    if (!el) return
    el.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0px)'
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────
  const observers = []

  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function createObserver (ref, setter, onVisible) {
      if (!ref.value) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setter(true)
            if (onVisible) onVisible()
            obs.disconnect()
          }
        },
        { threshold: 0.2 },
      )
      obs.observe(ref.value)
      observers.push(obs)
    }

    createObserver(statsRef, v => {
      statsVisible.value = v
    }, () => {
      if (prefersReducedMotion) {
        for (const s of statsData) {
          s.display = s.raw.toString()
        }
      } else {
        for (const [i, s] of statsData.entries()) setTimeout(() => animateCounter(s), i * 120)
      }
    })

    createObserver(hiwRef, v => {
      hiwVisible.value = v
    })
    createObserver(featuresRef, v => {
      featuresVisible.value = v
    })
    createObserver(ctaRef, v => {
      ctaVisible.value = v
    })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
    for (const o of observers) o.disconnect()
  })
</script>

<style scoped>
/* ══════════════════════════════════════════════════
   GLOBAL TOKENS
══════════════════════════════════════════════════ */
.landing-root {
  background: #0a0e14;
  overflow-x: hidden;
  scroll-behavior: smooth;
}

/* ══════════════════════════════════════════════════
   BASE ANIMATIONS
══════════════════════════════════════════════════ */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes orbFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(40px, -30px) scale(1.08); }
  66%       { transform: translate(-20px, 20px) scale(0.95); }
}

@keyframes orbFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%       { transform: translate(-50px, 40px) scale(1.12); }
}

@keyframes orbFloat3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  40%       { transform: translate(30px, -50px) scale(0.92); }
  80%       { transform: translate(-10px, 30px) scale(1.05); }
}

@keyframes orbFloat4 {
  0%, 100% { transform: translate(0, 0); }
  60%       { transform: translate(20px, -20px); }
}

@keyframes marqueeScroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@keyframes scrollWheel {
  0%   { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(10px); }
}

@keyframes livePulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.8); opacity: 0; }
}

@keyframes shimmer {
  0%   { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(300%) skewX(-15deg); }
}

@keyframes statSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-fadeup {
  opacity: 0;
  animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.animate-delay-0 { animation-delay: 0.1s; }
.animate-delay-1 { animation-delay: 0.25s; }
.animate-delay-2 { animation-delay: 0.4s; }
.animate-delay-3 { animation-delay: 0.55s; }
.animate-delay-4 { animation-delay: 0.7s; }

@media (prefers-reduced-motion: reduce) {
  .animate-fadeup,
  .orb,
  .scroll-wheel,
  .marquee-content,
  .live-pulse {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}

/* ══════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════ */
.hero-section {
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 120px 24px 80px;
  overflow: hidden;
}

.hero-bg-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-bg-deep {
  background:
    radial-gradient(ellipse 100% 80% at 50% 0%,   rgba(212, 175, 55, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse 60%  40% at 80% 80%,  rgba(212, 175, 55, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse 50%  50% at 10% 60%,  rgba(212, 175, 55, 0.03) 0%, transparent 60%),
    #0a0e14;
}

.hero-bg-mid {
  background: radial-gradient(ellipse 70% 50% at 50% 30%, rgba(212, 175, 55, 0.05), transparent 70%);
  will-change: transform;
}

/* Orbs */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  will-change: transform;
}

.orb-1 {
  width: 500px; height: 500px;
  top: -100px; left: -150px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%);
  animation: orbFloat1 18s ease-in-out infinite;
}

.orb-2 {
  width: 400px; height: 400px;
  bottom: -80px; right: -100px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.07) 0%, transparent 70%);
  animation: orbFloat2 22s ease-in-out infinite;
}

.orb-3 {
  width: 280px; height: 280px;
  top: 30%; right: 15%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 70%);
  animation: orbFloat3 15s ease-in-out infinite;
  filter: blur(60px);
}

.orb-4 {
  width: 200px; height: 200px;
  top: 60%; left: 10%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.04) 0%, transparent 70%);
  animation: orbFloat4 12s ease-in-out infinite;
  filter: blur(50px);
}

/* Grid overlay */
.hero-grid-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(212, 175, 55, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212, 175, 55, 0.03) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);
}

/* Hero content */
.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 860px;
}

.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.eyebrow-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.6));
}

.eyebrow-line:last-child {
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.6), transparent);
}

.eyebrow-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.85);
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.2rem, 6vw, 5rem);
  font-weight: 700;
  line-height: 1.12;
  color: #ffffff;
  margin-bottom: 8px;
}

.hero-title-accent {
  color: #d4af37;
  text-shadow: 0 0 40px rgba(212, 175, 55, 0.35), 0 2px 20px rgba(212, 175, 55, 0.2);
}

.hero-subtitle {
  font-family: 'Inter', sans-serif;
  color: rgba(255, 255, 255, 0.5);
  font-size: clamp(1rem, 2vw, 1.1rem);
  line-height: 1.75;
  max-width: 560px;
  margin: 24px 0 44px;
}

.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.hero-btn-primary {
  padding: 0 44px !important;
  height: 54px !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 0.82rem !important;
  letter-spacing: 2px !important;
  text-transform: uppercase !important;
  border-radius: 0 !important;
  color: #0a0e14 !important;
  font-weight: 700 !important;
  transition: box-shadow 0.25s, transform 0.2s !important;
}

.hero-btn-primary:hover {
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.35), 0 4px 16px rgba(212, 175, 55, 0.2) !important;
  transform: translateY(-2px) !important;
}

.hero-btn-outline {
  padding: 0 44px !important;
  height: 54px !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 0.82rem !important;
  letter-spacing: 2px !important;
  text-transform: uppercase !important;
  border-radius: 0 !important;
  font-weight: 600 !important;
  transition: background 0.25s, transform 0.2s !important;
}

.hero-btn-outline:hover {
  background: rgba(212, 175, 55, 0.06) !important;
  transform: translateY(-2px) !important;
}

.hero-pills {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 36px;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.4);
}

.stat-pill-divider {
  width: 1px;
  height: 14px;
  background: rgba(212, 175, 55, 0.2);
}

/* Scroll hint */
.hero-scroll-hint {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 2;
  animation: fadeIn 1s 1.5s both;
}

.scroll-mouse {
  width: 22px;
  height: 36px;
  border: 1.5px solid rgba(212, 175, 55, 0.35);
  border-radius: 11px;
  display: flex;
  justify-content: center;
  padding-top: 6px;
}

.scroll-wheel {
  width: 3px;
  height: 7px;
  border-radius: 2px;
  background: rgba(212, 175, 55, 0.7);
  animation: scrollWheel 1.6s ease-in-out infinite;
}

.hero-scroll-hint > span {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
}

/* ══════════════════════════════════════════════════
   TRUSTED BY MARQUEE
══════════════════════════════════════════════════ */
.trusted-strip {
  background: rgba(19, 24, 31, 0.7);
  border-top: 1px solid rgba(212, 175, 55, 0.1);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  padding: 20px 0;
  overflow: hidden;
}

.trusted-inner {
  display: flex;
  align-items: center;
  gap: 0;
}

.trusted-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
  white-space: nowrap;
  padding: 0 32px 0 24px;
  flex-shrink: 0;
  border-right: 1px solid rgba(212, 175, 55, 0.12);
}

.marquee-track {
  flex: 1;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
}

.marquee-content {
  display: flex;
  gap: 0;
  animation: marqueeScroll 20s linear infinite;
  width: max-content;
}

.marquee-brand {
  font-family: 'Playfair Display', serif;
  font-size: 0.95rem;
  color: rgba(212, 175, 55, 0.5);
  padding: 0 40px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: color 0.2s;
}

.marquee-brand:hover {
  color: rgba(212, 175, 55, 0.85);
}

.marquee-diamond {
  opacity: 0.4;
}

/* ══════════════════════════════════════════════════
   STATS SECTION
══════════════════════════════════════════════════ */
.stats-section {
  position: relative;
  padding: 72px 24px;
  overflow: hidden;
}

.stats-bg-gradient {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(212, 175, 55, 0.04) 0%, transparent 100%),
    #0a0e14;
}

.stat-card {
  padding: 32px 16px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.stat-card-visible {
  opacity: 1;
  transform: translateY(0);
}

.stat-card:nth-child(1) { transition-delay: 0s; }
.stat-card:nth-child(2) { transition-delay: 0.12s; }
.stat-card:nth-child(3) { transition-delay: 0.24s; }
.stat-card:nth-child(4) { transition-delay: 0.36s; }

.stat-number {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
  margin-bottom: 8px;
}

.stat-counter {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.4rem, 5vw, 3.2rem);
  font-weight: 700;
  color: #d4af37;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stat-suffix {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 700;
  color: rgba(212, 175, 55, 0.7);
  line-height: 1;
}

.stat-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 16px;
}

.stat-underline {
  width: 32px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent);
  margin: 0 auto;
}

/* ══════════════════════════════════════════════════
   SECTION HEADER (shared)
══════════════════════════════════════════════════ */
.section-header {
  text-align: center;
  margin-bottom: 64px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.section-header.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-overline {
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.65);
  margin-bottom: 12px;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;
}

.section-title-bar {
  width: 56px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
  margin: 0 auto;
}

/* ══════════════════════════════════════════════════
   HOW IT WORKS — Timeline
══════════════════════════════════════════════════ */
.hiw-section {
  position: relative;
  padding: 96px 24px;
  background:
    radial-gradient(ellipse 70% 50% at 0% 50%, rgba(212, 175, 55, 0.03), transparent 60%),
    #0a0e14;
  border-top: 1px solid rgba(212, 175, 55, 0.08);
}

.hiw-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}

/* Central vertical line on desktop */
@media (min-width: 640px) {
  .hiw-timeline::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 40px;
    bottom: 40px;
    width: 1px;
    background: linear-gradient(180deg, transparent, rgba(212, 175, 55, 0.2) 20%, rgba(212, 175, 55, 0.2) 80%, transparent);
    transform: translateX(-50%);
    z-index: 0;
  }
}

.hiw-step {
  position: relative;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateY(30px);
  padding: 20px 0;
  display: flex;
}

.hiw-step-left {
  justify-content: flex-start;
  transform: translateX(-30px) translateY(10px);
}

.hiw-step-right {
  justify-content: flex-end;
  transform: translateX(30px) translateY(10px);
}

.hiw-step-visible {
  opacity: 1 !important;
  transform: translateX(0) translateY(0) !important;
}

.hiw-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  background: rgba(19, 24, 31, 0.8);
  border: 1px solid rgba(212, 175, 55, 0.12);
  padding: 28px 32px;
  max-width: 420px;
  width: 100%;
  position: relative;
  backdrop-filter: blur(8px);
  transition: border-color 0.25s, box-shadow 0.25s;
}

.hiw-card:hover {
  border-color: rgba(212, 175, 55, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.08);
}

.hiw-step-number {
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
  font-weight: 700;
  color: rgba(212, 175, 55, 0.08);
  line-height: 1;
  position: absolute;
  top: 12px;
  right: 20px;
  user-select: none;
}

.hiw-icon-wrap {
  position: relative;
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hiw-icon-ring {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.04);
}

.hiw-card-body { flex: 1; min-width: 0; }

.hiw-card-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  color: #ffffff;
  margin-bottom: 8px;
  font-weight: 600;
}

.hiw-card-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.87rem;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.7;
}

@media (max-width: 639px) {
  .hiw-step-left,
  .hiw-step-right {
    justify-content: center;
    transform: translateY(30px) !important;
  }
  .hiw-step-visible {
    transform: translateY(0) !important;
  }
  .hiw-card {
    max-width: 100%;
  }
}

/* ══════════════════════════════════════════════════
   FEATURES — Bento Grid + Glass
══════════════════════════════════════════════════ */
.features-section {
  position: relative;
  padding: 96px 24px;
  background: #0d1219;
  border-top: 1px solid rgba(212, 175, 55, 0.08);
  overflow: hidden;
}

.features-bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
}

.features-orb-1 {
  width: 600px; height: 600px;
  top: -200px; right: -200px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.05), transparent 70%);
}

.features-orb-2 {
  width: 400px; height: 400px;
  bottom: -100px; left: -100px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.04), transparent 70%);
}

/* Bento grid layout */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto auto;
  gap: 16px;
}

.bento-card-large  { grid-column: span 2; grid-row: span 2; }
.bento-card-medium { grid-column: span 2; }
.bento-card-small  { grid-column: span 2; }

@media (max-width: 900px) {
  .bento-grid { grid-template-columns: repeat(2, 1fr); }
  .bento-card-large  { grid-column: span 2; }
  .bento-card-medium { grid-column: span 2; }
  .bento-card-small  { grid-column: span 1; }
}

@media (max-width: 540px) {
  .bento-grid { grid-template-columns: 1fr; }
  .bento-card-large,
  .bento-card-medium,
  .bento-card-small  { grid-column: span 1; }
}

/* Bento card base */
.bento-card {
  position: relative;
  overflow: hidden;
  cursor: default;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s, border-color 0.25s;
  opacity: 0;
  transform: translateY(24px);
}

.bento-grid.bento-visible .bento-card {
  opacity: 1;
  transform: translateY(0) perspective(900px) rotateY(0deg) rotateX(0deg);
}

.glass-card {
  background: rgba(19, 24, 31, 0.75);
  border: 1px solid rgba(212, 175, 55, 0.12);
  backdrop-filter: blur(12px);
}

.glass-card:hover {
  border-color: rgba(212, 175, 55, 0.28);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(212, 175, 55, 0.08);
}

.bento-accent-line {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.4), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.bento-card:hover .bento-accent-line {
  opacity: 1;
}

.bento-card-inner {
  position: relative;
  z-index: 2;
  padding: 36px 32px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bento-card-large .bento-card-inner { padding: 44px 40px; }

.bento-icon-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
}

.bento-icon-glow {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.12), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}

.bento-card:hover .bento-icon-glow {
  opacity: 1;
}

.bento-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.3;
}

.bento-title-sm {
  font-size: 1.05rem;
}

.bento-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.7;
  flex: 1;
}

.bento-desc-sm {
  font-size: 0.84rem;
}

.bento-tag {
  display: inline-block;
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.65);
  border: 1px solid rgba(212, 175, 55, 0.2);
  padding: 4px 10px;
  align-self: flex-start;
  margin-top: auto;
}

.bento-live-dot {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.5);
  margin-top: auto;
}

.live-pulse {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d4af37;
  animation: livePulse 1.8s ease-in-out infinite;
}

/* Background pattern inside large card */
.bento-bg-pattern {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.4;
}

.bento-bg-grid {
  background-image:
    linear-gradient(rgba(212, 175, 55, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212, 175, 55, 0.05) 1px, transparent 1px);
  background-size: 32px 32px;
}

/* Staggered entrance */
.bento-grid.bento-visible .bento-card:nth-child(1) { transition: opacity 0.6s 0.05s cubic-bezier(0.16,1,0.3,1), transform 0.6s 0.05s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s, border-color 0.25s; }
.bento-grid.bento-visible .bento-card:nth-child(2) { transition: opacity 0.6s 0.13s cubic-bezier(0.16,1,0.3,1), transform 0.6s 0.13s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s, border-color 0.25s; }
.bento-grid.bento-visible .bento-card:nth-child(3) { transition: opacity 0.6s 0.21s cubic-bezier(0.16,1,0.3,1), transform 0.6s 0.21s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s, border-color 0.25s; }
.bento-grid.bento-visible .bento-card:nth-child(4) { transition: opacity 0.6s 0.29s cubic-bezier(0.16,1,0.3,1), transform 0.6s 0.29s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s, border-color 0.25s; }

/* ══════════════════════════════════════════════════
   CTA BANNER
══════════════════════════════════════════════════ */
.cta-section {
  position: relative;
  padding: 96px 24px;
  overflow: hidden;
  background: #0a0e14;
  border-top: 1px solid rgba(212, 175, 55, 0.08);
}

.cta-bg-lines {
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(
      -45deg,
      rgba(212, 175, 55, 0.015) 0px,
      rgba(212, 175, 55, 0.015) 1px,
      transparent 1px,
      transparent 40px
    );
}

.cta-shimmer {
  position: absolute;
  top: 0;
  left: -40%;
  width: 30%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.04), transparent);
  animation: shimmer 6s ease-in-out infinite;
  pointer-events: none;
}

.cta-inner {
  text-align: center;
  position: relative;
  z-index: 2;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.cta-inner.cta-visible {
  opacity: 1;
  transform: translateY(0);
}

.cta-crown {
  margin-bottom: 24px;
  opacity: 0.7;
}

.cta-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 20px;
}

.cta-title-gold {
  color: #d4af37;
}

.cta-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: clamp(0.95rem, 2vw, 1.05rem);
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.75;
  max-width: 520px;
  margin: 0 auto 44px;
}

.cta-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-btn-primary {
  height: 58px !important;
  padding: 0 52px !important;
  border-radius: 0 !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 0.85rem !important;
  letter-spacing: 2px !important;
  text-transform: uppercase !important;
  color: #0a0e14 !important;
  font-weight: 700 !important;
  transition: box-shadow 0.25s, transform 0.2s !important;
}

.cta-btn-primary:hover {
  box-shadow: 0 0 40px rgba(212, 175, 55, 0.4), 0 8px 24px rgba(212, 175, 55, 0.2) !important;
  transform: translateY(-2px) !important;
}

.cta-btn-text {
  height: 58px !important;
  padding: 0 32px !important;
  border-radius: 0 !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 0.85rem !important;
  letter-spacing: 2px !important;
  text-transform: uppercase !important;
  font-weight: 600 !important;
}

/* ══════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════ */
.site-footer {
  background: #080b10;
  position: relative;
}

.footer-gradient-line {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.35) 30%, rgba(212, 175, 55, 0.35) 70%, transparent 100%);
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  padding: 28px 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer-logo {
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #d4af37;
  letter-spacing: 1px;
}

.footer-tagline {
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.2);
}

.footer-nav {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.footer-link {
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.35);
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;
}

.footer-link:hover {
  color: rgba(212, 175, 55, 0.8);
}

.footer-dot {
  color: rgba(255, 255, 255, 0.15);
  font-size: 0.75rem;
}

.footer-copy {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.18);
}

@media (max-width: 640px) {
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px 20px;
    gap: 16px;
  }
  .footer-copy { align-self: flex-start; }
  .hero-pills { display: none; }
}
</style>
