<template>
  <!-- ── Top Navigation Bar ── -->
  <AppNavbarSpotly />

  <!-- ── Main Content ── -->
  <v-main class="spotly-main">

    <!-- ══════════════════════════════════════
         HERO WELCOME BANNER
    ══════════════════════════════════════ -->
    <section class="hero-banner">
      <!-- Animated particle field -->
      <div aria-hidden="true" class="hero-particles">
        <span v-for="n in 18" :key="n" class="particle" :style="particleStyle(n)" />
      </div>

      <!-- Ambient glow blobs -->
      <div aria-hidden="true" class="blob blob-1" />
      <div aria-hidden="true" class="blob blob-2" />

      <!-- Gold diagonal rule -->
      <div aria-hidden="true" class="hero-rule" />

      <div class="hero-inner">
        <!-- Left: greeting text -->
        <div class="hero-text">
          <p class="hero-eyebrow">
            <span aria-hidden="true" class="eyebrow-dot" />
            Good evening
          </p>
          <h1 class="hero-heading">
            Welcome back,<br>
            <span class="hero-name">{{ sessionName }}</span>
          </h1>
          <p class="hero-sub">
            Discover exquisite venues for your next unforgettable experience.
          </p>

          <!-- Quick-stats strip -->
          <div aria-label="quick stats" class="hero-stats">
            <div class="stat-pill">
              <v-icon color="#D4AF37" size="14">mdi-map-marker-multiple-outline</v-icon>
              <span>{{ filteredVenues.length }} venues</span>
            </div>
            <div aria-hidden="true" class="stat-divider" />
            <div class="stat-pill">
              <v-icon color="#D4AF37" size="14">mdi-tag-multiple-outline</v-icon>
              <span>{{ activities.length }} activities</span>
            </div>
          </div>
        </div>

        <!-- Right: avatar -->
        <div aria-label="Your profile initials" class="hero-avatar-wrap">
          <div aria-hidden="true" class="avatar-halo" />
          <div aria-hidden="true" class="avatar-ring-outer" />
          <div class="avatar-core">{{ sessionInitials }}</div>
        </div>
      </div>

      <!-- Scroll cue -->
      <div aria-hidden="true" class="scroll-cue">
        <v-icon color="rgba(212,175,55,0.5)" size="18">mdi-chevron-double-down</v-icon>
      </div>
    </section>

    <!-- ══════════════════════════════════════
         DISCOVERY / SEARCH PANEL
    ══════════════════════════════════════ -->
    <div class="page-body">
      <section aria-label="Venue search and filters" class="glass-panel">
        <!-- Panel header -->
        <div class="panel-header">
          <div aria-hidden="true" class="panel-icon-wrap">
            <v-icon color="#D4AF37" size="18">mdi-magnify</v-icon>
          </div>
          <div>
            <h2 class="panel-title">Find Your Venue</h2>
            <p class="panel-sub">Search by name or filter by activity</p>
          </div>
        </div>

        <!-- Mode toggle -->
        <div aria-label="Discovery mode" class="mode-toggle" role="group">
          <button
            class="mode-pill"
            :class="{ 'mode-pill--active': discoveryMode === 'search' }"
            @click="discoveryMode = 'search'"
          >
            <v-icon size="14">mdi-magnify</v-icon>
            Search
          </button>
          <button
            class="mode-pill"
            :class="{ 'mode-pill--active': discoveryMode === 'describe' }"
            @click="discoveryMode = 'describe'"
          >
            <v-icon size="14">mdi-creation</v-icon>
            Describe with AI
          </button>
        </div>

        <!-- Search field (search mode only) -->
        <div v-show="discoveryMode === 'search'">
          <div class="search-wrap">
            <v-icon aria-hidden="true" class="search-icon" size="18">mdi-magnify</v-icon>
            <input
              v-model="searchQuery"
              aria-label="Search venues"
              class="search-input"
              placeholder="Search venues, moods, or activities…"
              type="search"
            >
            <transition name="fade-scale">
              <button
                v-if="searchQuery"
                aria-label="Clear search"
                class="search-clear"
                @click="searchQuery = ''"
              >
                <v-icon size="16">mdi-close</v-icon>
              </button>
            </transition>
          </div>

          <!-- Activity filter chips -->
          <div v-if="activities.length > 0">
            <p class="filter-label">What are you looking for?</p>
            <div aria-label="Filter by activity" class="filter-chips" role="group">
              <button
                v-for="activity in activities"
                :key="activity"
                :aria-pressed="selectedActivities.includes(activity)"
                class="pill-chip"
                :class="{ 'pill-chip--active': selectedActivities.includes(activity) }"
                @click="toggleActivity(activity)"
              >
                {{ activity }}
              </button>
            </div>
          </div>
        </div>

        <!-- Describe mode input -->
        <div v-show="discoveryMode === 'describe'" class="describe-section">
          <!-- Starter prompt chips -->
          <div class="starter-chips">
            <span class="starter-label">Need inspiration?</span>
            <div class="starter-scroll-wrap">
              <div class="starter-scroll-row">
                <button
                  v-for="prompt in STARTER_PROMPTS"
                  :key="prompt"
                  class="starter-chip"
                  :disabled="aiSearchLoading"
                  @click="describeQuery = prompt"
                >
                  {{ prompt }}
                </button>
              </div>
              <div class="starter-scroll-hint" aria-hidden="true">
                <v-icon size="16" color="rgba(212,175,55,0.7)">mdi-chevron-right</v-icon>
              </div>
            </div>
          </div>

          <v-textarea
            v-model="describeQuery"
            auto-grow
            class="describe-textarea"
            :disabled="aiSearchLoading"
            hide-details
            no-resize
            placeholder="Describe your ideal evening — occasion, vibe, music, dress code…"
            :rows="2"
            variant="outlined"
          />

          <v-btn
            append-icon="mdi-creation"
            class="mt-3 find-venues-btn"
            :disabled="aiSearchLoading"
            :loading="aiSearchLoading"
            @click="runSemanticSearch"
          >
            Find Venues
          </v-btn>
        </div>
      </section>

      <!-- ══════════════════════════════════════
           VENUE GRID
      ══════════════════════════════════════ -->
      <section aria-label="Venue listings">
        <!-- Section heading -->
        <div class="section-heading-row">
          <div class="section-heading-left">
            <div aria-hidden="true" class="section-icon">
              <v-icon color="#D4AF37" size="16">mdi-star-four-points</v-icon>
            </div>
            <h2 class="section-title">Curated for You</h2>
          </div>
          <div aria-label="Number of results" class="section-count">
            {{ displayedVenues.length }}
            <span class="section-count-label">{{ displayedVenues.length === 1 ? 'venue' : 'venues' }}</span>
          </div>
        </div>

        <!-- "Curated for" banner — shown after an AI search returns results -->
        <transition name="fade">
          <div
            v-if="discoveryMode === 'describe' && aiSummary && !aiSearchLoading"
            class="curated-for-banner"
          >
            <v-icon size="14" class="curated-icon">mdi-creation</v-icon>
            Curated for
            <span class="curated-summary">{{ aiSummary }}</span>
            <span class="curated-count">— {{ displayedVenues.length }} {{ displayedVenues.length === 1 ? 'venue' : 'venues' }}</span>
          </div>
        </transition>

        <!-- Skeleton loaders while AI is searching -->
        <div v-if="aiSearchLoading" class="venue-grid">
          <v-skeleton-loader
            v-for="n in 3"
            :key="n"
            class="venue-skeleton"
            type="card"
          />
        </div>

        <!-- Cards grid -->
        <div v-else-if="displayedVenues.length > 0" class="venue-grid">
          <article
            v-for="(venue, i) in displayedVenues"
            :key="venue.id"
            :aria-label="`${venue.name} — click to view details`"
            class="venue-card"
            :style="{
              animationDelay: `${i * 70}ms`,
              transform: tiltStyle(venue.id),
            }"
            tabindex="0"
            @click="selectVenue(venue)"
            @keydown.enter="selectVenue(venue)"
            @keydown.space.prevent="selectVenue(venue)"
            @mouseenter="hoveredCard = venue.id"
            @mouseleave="onCardMouseLeave(venue.id)"
            @mousemove="onCardMouseMove($event, venue.id)"
          >
            <!-- ── Image zone ── -->
            <div
              aria-hidden="true"
              class="card-image"
              :style="venue.images?.[0]
                ? { backgroundImage: `url(${venue.images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : venue.slides?.[0]?.imageUrl
                  ? { backgroundImage: `url(${venue.slides[0].imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : {}"
            >
              <!-- Gradient placeholder when no image -->
              <div v-if="!venue.images?.[0] && !venue.slides?.[0]?.imageUrl" class="card-image-placeholder">
                <div class="placeholder-gradient" :style="placeholderGradient(i)" />
                <v-icon color="rgba(212,175,55,0.25)" size="40">mdi-image-outline</v-icon>
              </div>

              <!-- Bottom gradient overlay (always) -->
              <div aria-hidden="true" class="card-image-overlay" />

              <!-- Owner badge -->
              <div v-if="venue.id === ownerVenueId" aria-label="Your venue" class="badge-owner">
                <v-icon size="11">mdi-crown</v-icon>
                YOUR VENUE
              </div>

              <!-- AI reason badge -->
              <div
                v-if="discoveryMode === 'describe' && getAIReason(venue.id)"
                class="badge-ai-reason"
              >
                <v-icon size="11">mdi-creation</v-icon>
                {{ getAIReason(venue.id) }}
              </div>

              <!-- Ambience tags on image -->
              <div aria-label="Ambience tags" class="card-tags-row">
                <span
                  v-for="tag in (venue.ambienceTags || []).slice(0, 3)"
                  :key="tag"
                  class="tag-chip"
                >#{{ tag }}</span>
              </div>

              <!-- Venue name overlaid on image -->
              <div class="card-name-overlay">
                <h3 class="card-name">{{ venue.name }}</h3>
              </div>

              <!-- Hover reveal CTA on image -->
              <transition name="slide-up-fade">
                <div v-if="hoveredCard === venue.id" aria-hidden="true" class="card-hover-cta">
                  <span class="hover-cta-text">
                    {{ venue.id === ownerVenueId ? 'Preview' : 'View Details' }}
                  </span>
                  <v-icon size="14">mdi-arrow-right</v-icon>
                </div>
              </transition>
            </div>

            <!-- ── Card body ── -->
            <div class="card-body">
              <p class="card-desc">{{ venue.description || 'An exquisite venue awaiting your visit.' }}</p>

              <div class="card-actions">
                <button
                  v-if="venue.id === ownerVenueId"
                  aria-label="Manage your venue"
                  class="btn-manage"
                  @click.stop="router.push('/admin/dashboard')"
                >
                  <v-icon size="14">mdi-cog-outline</v-icon>
                  Manage Venue
                </button>
                <button
                  v-else
                  aria-label="Book this venue"
                  class="btn-book"
                  @click.stop="selectVenue(venue)"
                >
                  Book Now
                  <v-icon class="btn-arrow" size="14">mdi-arrow-right</v-icon>
                </button>
              </div>
            </div>

            <!-- Shine reflection on hover -->
            <div aria-hidden="true" class="card-shine" />
          </article>
        </div>

        <!-- ── Empty state ── -->
        <div v-else-if="!aiSearchLoading" class="empty-state" role="status">
          <div aria-hidden="true" class="empty-orb" />
          <v-icon class="empty-icon mb-4" size="52">
            {{ discoveryMode === 'describe' && aiRankedVenues !== null ? 'mdi-creation' : 'mdi-store-search-outline' }}
          </v-icon>
          <p class="empty-title">
            {{ discoveryMode === 'describe' && aiRankedVenues !== null
              ? 'No venues matched your description'
              : 'No venues match your criteria' }}
          </p>
          <p class="empty-sub">
            {{ discoveryMode === 'describe' && aiRankedVenues !== null
              ? 'Try different words or switch to Search.'
              : 'Try adjusting your search or removing filters.' }}
          </p>
          <div aria-hidden="true" class="empty-line" />
          <button
            v-if="discoveryMode === 'search'"
            class="empty-clear"
            @click="clearFilters"
          >
            <v-icon size="14">mdi-refresh</v-icon>
            Clear all filters
          </button>
          <button
            v-else
            class="empty-clear"
            @click="discoveryMode = 'search'"
          >
            <v-icon size="14">mdi-magnify</v-icon>
            Switch to Search
          </button>
        </div>
      </section>

      <!-- ══════════════════════════════════════
           OPEN YOUR VENUE — CTA BAND
      ══════════════════════════════════════ -->
      <section
        v-if="showOpenVenueCta"
        aria-label="Open your venue on Spotly"
        class="cta-band"
        role="banner"
        @click="createVenue"
      >
        <!-- Background layers -->
        <div aria-hidden="true" class="cta-bg-pattern" />
        <div aria-hidden="true" class="cta-glow-left" />
        <div aria-hidden="true" class="cta-glow-right" />

        <!-- Diagonal accent -->
        <div aria-hidden="true" class="cta-diagonal" />

        <div class="cta-content">
          <div class="cta-text-block">
            <p class="cta-eyebrow">
              <v-icon color="#D4AF37" size="14">mdi-storefront-outline</v-icon>
              Partner with Spotly
            </p>
            <h2 class="cta-heading">Open Your Venue<br>on Spotly</h2>
            <p class="cta-sub-text">
              Join hundreds of premium venues. Start accepting reservations today with zero friction.
            </p>
          </div>
          <button aria-label="Get started — open your venue" class="cta-action-btn">
            Get Started
            <v-icon class="cta-btn-icon" size="16">mdi-arrow-right</v-icon>
          </button>
        </div>
      </section>

      <!-- Bottom spacer -->
      <div style="height: 64px" />
    </div>
  </v-main>

  <!-- Snackbar -->
  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    location="bottom center"
    :timeout="3500"
  >
    <v-icon v-if="snackbar.icon" class="mr-2" size="16">{{ snackbar.icon }}</v-icon>
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import AppNavbarSpotly from '@/components/layout/AppNavbarSpotly.vue'
  import SectionHeader from '@/components/ui/SectionHeader.vue'
  import { useAI } from '@/composables/useAI.js'
  import { useSnackbar } from '@/composables/useSnackbar.js'
  import { addVenue, getVenueByAdminEmail, getVenueById, Venue, VENUE_LIST } from '@/datamodel/Venue.js'

  const router = useRouter()
  const { callAI } = useAI()
  const { snackbar, notify } = useSnackbar()

  let _session = null
  try {
    _session = JSON.parse(localStorage.getItem('spotly_session') || 'null')
  } catch {}
  const sessionName = _session?.name || 'Guest'
  const sessionInitials = sessionName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const ownerVenue = _session ? getVenueByAdminEmail(_session.email) : null
  const ownerVenueId = ownerVenue?.id ?? null

  const isOwner = computed(() => !!ownerVenueId)

  const showOpenVenueCta = computed(() => !!_session && !isOwner.value)

  function createVenue () {
    if (!_session) return
    const newVenue = new Venue({
      id: Date.now(),
      name: '',
      description: '',
      adminEmail: _session.email,
    })
    addVenue(newVenue)
    const session = { ..._session, venueId: newVenue.id }
    localStorage.setItem('spotly_session', JSON.stringify(session))
    router.push('/admin/onboarding')
  }

  const searchQuery = ref('')
  const selectedActivities = ref([])
  const hoveredCard = ref(null)

  const activities = computed(() => {
    const all = new Set()
    for (const v of VENUE_LIST) {
      for (const a of v.activities) all.add(a)
    }
    return [...all]
  })

  const filteredVenues = computed(() =>
    VENUE_LIST.filter(v => {
      const matchesSearch = v.name
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase())
      const matchesActivities
        = selectedActivities.value.length === 0
          || selectedActivities.value.some(a => v.activities.includes(a))
      return matchesSearch && matchesActivities
    }),
  )

  function toggleActivity (activity) {
    const idx = selectedActivities.value.indexOf(activity)
    if (idx === -1) {
      selectedActivities.value.push(activity)
    } else {
      selectedActivities.value.splice(idx, 1)
    }
  }

  function clearFilters () {
    searchQuery.value = ''
    selectedActivities.value = []
  }

  // ── AI Describe mode ──
  const STARTER_PROMPTS = [
    'Romantic anniversary dinner, intimate and candlelit',
    'Lively birthday celebration with friends',
    'Formal business dinner, quiet atmosphere',
    'Casual date night with a relaxed vibe',
  ]

  const discoveryMode   = ref('search')
  const describeQuery   = ref('')
  const aiSearchLoading = ref(false)
  const aiRankedVenues  = ref(null)
  const aiSummary       = ref(null)

  const displayedVenues = computed(() => {
    if (discoveryMode.value === 'describe' && aiRankedVenues.value !== null) {
      return aiRankedVenues.value.map(r => r.venue)
    }
    return filteredVenues.value
  })

  function getAIReason (venueId) {
    return aiRankedVenues.value?.find(r => r.venue.id === venueId)?.reason ?? null
  }

  async function runSemanticSearch () {
    if (describeQuery.value.trim().length < 10) {
      notify('Please describe your evening in a bit more detail.')
      return
    }
    aiSearchLoading.value = true
    aiRankedVenues.value = null

    const venuePayload = VENUE_LIST.map(v => ({
      id: v.id,
      name: v.name,
      description: v.description,
      ambienceTags: v.ambienceTags,
      activities: v.activities,
      dressCode: v.dressCode,
    }))

    const systemPrompt = `You are a venue recommendation engine for Spotly.
Match the user's description to the venues listed below.
Return ONLY valid JSON — an object with exactly two keys:
{
  "summary": "<4-6 word phrase capturing the user's intent, lowercase, e.g. 'a romantic proposal dinner'>",
  "venues": [{ "venueId": <number>, "reason": "<one sentence, max 12 words, specific to this venue>" }]
}

Rules:
- venues: only include venues that genuinely match. Omit any that do not match.
- The reason must cite something specific from the venue data (ambience, activities, dressCode).
- Never invent features the venue does not have.
- If no venue matches, return venues as an empty array [].
- summary: always present, even when venues is empty.

Venues:
${JSON.stringify(venuePayload)}`

    try {
      const result = await callAI(systemPrompt, describeQuery.value, { json: true, maxTokens: 512 })
      if (!result?.venues || !Array.isArray(result.venues)) throw new Error('Unexpected response format')
      const ranked = result.venues
        .filter(r => getVenueById(r.venueId))
        .map(r => ({ venue: getVenueById(r.venueId), reason: r.reason }))
      aiRankedVenues.value = ranked
      aiSummary.value = result.summary ?? null
    } catch {
      notify('AI matching unavailable — try the search bar instead.', '#C71585', 'mdi-close-circle')
      aiRankedVenues.value = null
    } finally {
      aiSearchLoading.value = false
    }
  }

  watch(discoveryMode, () => {
    aiRankedVenues.value = null
    aiSummary.value      = null
    describeQuery.value  = ''
  })

  function selectVenue (venue) {
    router.push(`/venue/${venue.id}`)
  }

  // ── 3D tilt per-card mouse tracking ──
  const cardTilts = ref({})

  function onCardMouseMove (e, id) {
    // Disable tilt on touch devices (coarse pointer)
    if (window.matchMedia('(pointer: coarse)').matches) return
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rotY = ((x - cx) / cx) * 7 // max ±7deg
    const rotX = -((y - cy) / cy) * 5 // max ±5deg
    cardTilts.value[id] = { rotX, rotY }
  }

  function onCardMouseLeave (id) {
    hoveredCard.value = null
    cardTilts.value[id] = null
  }

  function tiltStyle (id) {
    const t = cardTilts.value[id]
    if (!t) return 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)'
    return `perspective(1000px) rotateX(${t.rotX}deg) rotateY(${t.rotY}deg) translateZ(8px)`
  }

  // ── Particle styles (deterministic pseudo-random) ──
  function particleStyle (n) {
    const left = ((n * 37 + 13) % 97).toFixed(1)
    const top = ((n * 53 + 7) % 91).toFixed(1)
    const size = (((n * 17) % 4) + 2).toFixed(0)
    const delay = (((n * 11) % 40) / 10).toFixed(1)
    const dur = (3 + ((n * 7) % 4)).toFixed(1)
    return {
      left: `${left}%`,
      top: `${top}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${delay}s`,
      animationDuration: `${dur}s`,
    }
  }

  // ── Placeholder gradient per card ──
  const GRADIENTS = [
    'linear-gradient(135deg, #1a1228 0%, #0d1a2e 100%)',
    'linear-gradient(135deg, #0d1a1a 0%, #1a2010 100%)',
    'linear-gradient(135deg, #1a1010 0%, #2a1820 100%)',
    'linear-gradient(135deg, #10101a 0%, #1a2030 100%)',
    'linear-gradient(135deg, #1a1800 0%, #2a1a0d 100%)',
    'linear-gradient(135deg, #0a1428 0%, #1a0a28 100%)',
  ]
  function placeholderGradient (i) {
    return { background: GRADIENTS[i % GRADIENTS.length] }
  }
</script>

<style scoped>
/* ══════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════ */
.spotly-main {
  --gold:          #D4AF37;
  --gold-dim:      rgba(212, 175, 55, 0.15);
  --gold-border:   rgba(212, 175, 55, 0.22);
  --gold-glow:     rgba(212, 175, 55, 0.08);
  --midnight:      #0A0E14;
  --surface:       #13181F;
  --surface-2:     #1a2030;
  --muted:         #6B7A8D;
  --muted-light:   rgba(255,255,255,0.55);
  --border-subtle: rgba(255,255,255,0.06);
  --ease-expo:     cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out:      cubic-bezier(0.0, 0, 0.2, 1);
  background: var(--midnight) !important;
  font-family: var(--font-body, 'Inter', sans-serif);
  min-height: 100dvh;
}

/* ══════════════════════════════════════════════
   HERO BANNER
══════════════════════════════════════════════ */
.hero-banner {
  position: relative;
  min-height: 420px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  background:
    linear-gradient(
      180deg,
      rgba(212,175,55,0.04) 0%,
      transparent 60%
    ),
    var(--midnight);
  border-bottom: 1px solid var(--border-subtle);
  padding: 80px 0 56px;
}

/* Ambient blobs */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  will-change: transform;
}
.blob-1 {
  width: 480px;
  height: 480px;
  top: -160px;
  left: -120px;
  background: radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 65%);
  animation: blobDrift1 14s ease-in-out infinite alternate;
}
.blob-2 {
  width: 360px;
  height: 360px;
  bottom: -100px;
  right: 5%;
  background: radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 65%);
  animation: blobDrift2 18s ease-in-out infinite alternate;
}
@keyframes blobDrift1 {
  from { transform: translate(0, 0) scale(1);   }
  to   { transform: translate(40px, 30px) scale(1.08); }
}
@keyframes blobDrift2 {
  from { transform: translate(0, 0) scale(1);   }
  to   { transform: translate(-30px, -20px) scale(1.06); }
}

/* Diagonal gold rule */
.hero-rule {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--gold-border) 35%, var(--gold-border) 65%, transparent 100%);
}

/* Particles */
.hero-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.particle {
  position: absolute;
  border-radius: 50%;
  background: var(--gold);
  opacity: 0;
  animation: particleFade var(--dur, 4s) var(--ease-out) infinite;
}
@keyframes particleFade {
  0%   { opacity: 0;    transform: translateY(0)   scale(1);    }
  30%  { opacity: 0.35; }
  70%  { opacity: 0.15; }
  100% { opacity: 0;    transform: translateY(-28px) scale(0.5); }
}

/* Inner layout */
.hero-inner {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  z-index: 1;
}

/* Hero text */
.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  font-family: var(--font-body, 'Inter', sans-serif);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--gold);
  font-weight: 600;
  margin-bottom: 14px;
}
.eyebrow-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gold);
  animation: pulse 2.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0.5); }
  50%       { box-shadow: 0 0 0 5px rgba(212,175,55,0); }
}

.hero-heading {
  font-family: var(--font-heading, 'Playfair Display', serif);
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 700;
  line-height: 1.1;
  color: #fff;
  margin: 0;
  letter-spacing: -0.01em;
}
.hero-name {
  background: linear-gradient(120deg, #D4AF37 0%, #f5d97a 50%, #b8921a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-sub {
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.6;
  margin-top: 16px;
  max-width: 480px;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 24px;
}
.stat-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(212,175,55,0.08);
  border: 1px solid var(--gold-border);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.75);
  font-weight: 500;
}
.stat-divider {
  width: 1px;
  height: 16px;
  background: var(--border-subtle);
}

/* Avatar */
.hero-avatar-wrap {
  position: relative;
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-halo {
  position: absolute;
  inset: -16px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 65%);
  animation: haloBreath 3s ease-in-out infinite alternate;
}
@keyframes haloBreath {
  from { transform: scale(0.92); opacity: 0.6; }
  to   { transform: scale(1.08); opacity: 1; }
}
.avatar-ring-outer {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1.5px solid rgba(212,175,55,0.35);
  animation: ringRotate 10s linear infinite;
}
@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.avatar-core {
  position: relative;
  z-index: 1;
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.06) 100%);
  border: 2px solid rgba(212,175,55,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading, 'Playfair Display', serif);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--gold);
  box-shadow:
    0 0 0 4px rgba(212,175,55,0.1),
    0 0 32px rgba(212,175,55,0.15),
    inset 0 1px 0 rgba(255,255,255,0.08);
}

/* Scroll cue */
.scroll-cue {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  animation: scrollBounce 2s ease-in-out infinite;
}
@keyframes scrollBounce {
  0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.5; }
  50%       { transform: translateX(-50%) translateY(5px); opacity: 0.9; }
}

/* ══════════════════════════════════════════════
   PAGE BODY
══════════════════════════════════════════════ */
.page-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 0;
}

/* ══════════════════════════════════════════════
   GLASS SEARCH PANEL
══════════════════════════════════════════════ */
.glass-panel {
  background:
    linear-gradient(
      135deg,
      rgba(255,255,255,0.035) 0%,
      rgba(255,255,255,0.015) 100%
    );
  backdrop-filter: blur(18px) saturate(1.4);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
  border: 1px solid rgba(212,175,55,0.14);
  border-top: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 40px;
  box-shadow:
    0 1px 0 0 rgba(255,255,255,0.04) inset,
    0 24px 48px rgba(0,0,0,0.3);
}

.panel-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 24px;
}
.panel-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--gold-dim);
  border: 1px solid var(--gold-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.panel-title {
  font-family: var(--font-heading, 'Playfair Display', serif);
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 4px;
}
.panel-sub {
  font-size: 0.8rem;
  color: var(--muted);
  margin: 0;
}

/* Search input custom */
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(212,175,55,0.18);
  border-radius: 12px;
  padding: 0 14px;
  margin-bottom: 22px;
  transition: border-color 0.2s var(--ease-out);
}
.search-wrap:focus-within {
  border-color: rgba(212,175,55,0.5);
  background: rgba(255,255,255,0.06);
  box-shadow: 0 0 0 3px rgba(212,175,55,0.08);
}
.search-icon {
  color: var(--muted) !important;
  flex-shrink: 0;
  margin-right: 10px;
}
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.9rem;
  padding: 13px 0;
  caret-color: var(--gold);
}
.search-input::placeholder {
  color: var(--muted);
}
.search-input::-webkit-search-cancel-button { display: none; }
.search-clear {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--muted);
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s;
}
.search-clear:hover { color: #fff; }

/* Filter chips */
.filter-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
  font-weight: 600;
  margin-bottom: 10px;
}
.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.pill-chip {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  color: var(--muted);
  font-size: 0.8rem;
  font-family: var(--font-body, 'Inter', sans-serif);
  padding: 6px 16px;
  cursor: pointer;
  transition:
    background 0.18s var(--ease-out),
    border-color 0.18s var(--ease-out),
    color 0.18s var(--ease-out),
    box-shadow 0.18s var(--ease-out),
    transform 0.12s var(--ease-out);
}
.pill-chip:hover {
  border-color: rgba(212,175,55,0.38);
  color: var(--gold);
  transform: translateY(-1px);
}
.pill-chip:active {
  transform: scale(0.97);
}
.pill-chip--active {
  background: rgba(212,175,55,0.14) !important;
  border-color: rgba(212,175,55,0.55) !important;
  color: var(--gold) !important;
  font-weight: 600;
  box-shadow: 0 0 12px rgba(212,175,55,0.12);
}

/* ══════════════════════════════════════════════
   SECTION HEADING
══════════════════════════════════════════════ */
.section-heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}
.section-heading-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.section-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--gold-dim);
  border: 1px solid var(--gold-border);
  display: flex;
  align-items: center;
  justify-content: center;
}
.section-title {
  font-family: var(--font-heading, 'Playfair Display', serif);
  font-size: 1.45rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.01em;
}
.section-count {
  font-family: var(--font-heading, 'Playfair Display', serif);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--gold);
  display: flex;
  align-items: baseline;
  gap: 5px;
}
.section-count-label {
  font-size: 0.75rem;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-weight: 400;
  color: var(--muted);
  text-transform: lowercase;
}

/* ══════════════════════════════════════════════
   VENUE GRID
══════════════════════════════════════════════ */
.venue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  align-items: start;
}

/* ── Venue Card ── */
.venue-card {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition:
    border-color 0.25s var(--ease-out),
    box-shadow 0.3s var(--ease-out),
    transform 0.2s var(--ease-expo);
  will-change: transform;
  transform-style: preserve-3d;
  animation: cardEntrance 0.5s var(--ease-expo) both;
}
.venue-card:hover {
  border-color: rgba(212,175,55,0.32);
  box-shadow:
    0 0 0 1px rgba(212,175,55,0.1),
    0 16px 48px rgba(0,0,0,0.45),
    0 0 32px rgba(212,175,55,0.06);
}
.venue-card:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 3px;
}
@keyframes cardEntrance {
  from { opacity: 0; transform: perspective(1000px) translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: perspective(1000px) translateY(0) scale(1); }
}

/* Card image zone */
.card-image {
  position: relative;
  height: 220px;
  background: var(--surface-2);
  overflow: hidden;
  flex-shrink: 0;
}
.card-image-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.placeholder-gradient {
  position: absolute;
  inset: 0;
}

/* Bottom gradient scrim */
.card-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(10, 14, 20, 0.95) 0%,
    rgba(10, 14, 20, 0.4) 45%,
    transparent 100%
  );
  pointer-events: none;
}

/* Owner badge */
.badge-owner {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 3;
  background: var(--gold);
  color: #0a0e14;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 4px 11px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Ambience tags on image */
.card-tags-row {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}
.tag-chip {
  background: rgba(10,14,20,0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 20px;
  color: rgba(212,175,55,0.9);
  font-size: 0.65rem;
  font-weight: 600;
  padding: 3px 9px;
  letter-spacing: 0.04em;
}

/* Venue name on image */
.card-name-overlay {
  position: absolute;
  bottom: 14px;
  left: 16px;
  right: 16px;
  z-index: 3;
}
.card-name {
  font-family: var(--font-heading, 'Playfair Display', serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  letter-spacing: -0.01em;
}

/* Hover CTA strip at image bottom */
.card-hover-cta {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 4;
  background: linear-gradient(90deg, rgba(212,175,55,0.9) 0%, rgba(180,140,20,0.9) 100%);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  color: #0a0e14;
}
.hover-cta-text {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* Card body */
.card-body {
  padding: 18px 18px 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 14px;
}
.card-desc {
  font-size: 0.84rem;
  color: var(--muted);
  line-height: 1.55;
  flex: 1;
  margin: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* Action buttons */
.card-actions {
  margin-top: auto;
}
.btn-book {
  width: 100%;
  background: var(--gold);
  color: #0a0e14;
  border: none;
  border-radius: 10px;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition:
    background 0.18s var(--ease-out),
    box-shadow 0.18s var(--ease-out),
    transform 0.12s var(--ease-out);
}
.btn-book:hover {
  background: #e8c84a;
  box-shadow: 0 6px 20px rgba(212,175,55,0.35);
  transform: translateY(-1px);
}
.btn-book:active { transform: scale(0.98); }
.btn-arrow {
  transition: transform 0.18s var(--ease-out);
}
.btn-book:hover .btn-arrow {
  transform: translateX(3px);
}

.btn-manage {
  width: 100%;
  background: rgba(212,175,55,0.1);
  color: var(--gold);
  border: 1px solid rgba(212,175,55,0.35);
  border-radius: 10px;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.84rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition:
    background 0.18s var(--ease-out),
    border-color 0.18s var(--ease-out),
    transform 0.12s var(--ease-out);
}
.btn-manage:hover {
  background: rgba(212,175,55,0.18);
  border-color: rgba(212,175,55,0.6);
  transform: translateY(-1px);
}
.btn-manage:active { transform: scale(0.98); }

/* Card shine shimmer */
.card-shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  opacity: 0;
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0) 40%,
    rgba(255,255,255,0.04) 50%,
    rgba(255,255,255,0) 60%
  );
  transition: opacity 0.3s;
}
.venue-card:hover .card-shine {
  opacity: 1;
}

/* ══════════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════════ */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 72px 32px;
  background: var(--surface);
  border: 1px dashed rgba(212,175,55,0.2);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}
.empty-orb {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 65%);
  pointer-events: none;
}
.empty-icon {
  color: rgba(212,175,55,0.4) !important;
  animation: emptyFloat 3s ease-in-out infinite;
}
@keyframes emptyFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}
.empty-title {
  font-family: var(--font-heading, 'Playfair Display', serif);
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  margin: 0 0 8px;
}
.empty-sub {
  font-size: 0.85rem;
  color: var(--muted);
  margin: 0 0 24px;
}
.empty-line {
  width: 48px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  margin-bottom: 20px;
  animation: lineGlow 2s ease-in-out infinite alternate;
}
@keyframes lineGlow {
  from { opacity: 0.4; width: 40px; }
  to   { opacity: 1;   width: 80px; }
}
.empty-clear {
  background: transparent;
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 20px;
  color: var(--gold);
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 8px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.04em;
  transition:
    background 0.2s,
    border-color 0.2s,
    transform 0.12s;
}
.empty-clear:hover {
  background: rgba(212,175,55,0.1);
  border-color: rgba(212,175,55,0.6);
  transform: translateY(-1px);
}

/* ══════════════════════════════════════════════
   OPEN YOUR VENUE — CTA BAND
══════════════════════════════════════════════ */
.cta-band {
  position: relative;
  margin-top: 64px;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(212,175,55,0.2);
  min-height: 200px;
  display: flex;
  align-items: center;
  transition:
    border-color 0.25s var(--ease-out),
    box-shadow 0.25s var(--ease-out);
}
.cta-band:hover {
  border-color: rgba(212,175,55,0.45);
  box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 48px rgba(212,175,55,0.08);
}

/* Background layers */
.cta-bg-pattern {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      135deg,
      #0d1220 0%,
      #131822 50%,
      #0d1015 100%
    );
  z-index: 0;
}

/* Diagonal accent shape */
.cta-diagonal {
  position: absolute;
  top: 0;
  right: 0;
  width: 45%;
  height: 100%;
  background: linear-gradient(135deg, transparent 0%, rgba(212,175,55,0.04) 100%);
  clip-path: polygon(15% 0, 100% 0, 100% 100%, 0% 100%);
  z-index: 1;
}

/* Glow spots */
.cta-glow-left {
  position: absolute;
  top: -80px;
  left: -60px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 65%);
  filter: blur(40px);
  pointer-events: none;
  z-index: 1;
  animation: ctaGlow 6s ease-in-out infinite alternate;
}
.cta-glow-right {
  position: absolute;
  bottom: -60px;
  right: 10%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 65%);
  filter: blur(30px);
  pointer-events: none;
  z-index: 1;
}
@keyframes ctaGlow {
  from { transform: translate(0,0) scale(1);   opacity: 0.7; }
  to   { transform: translate(20px, 10px) scale(1.1); opacity: 1; }
}

/* CTA inner content */
.cta-content {
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 48px 52px;
}

.cta-text-block {
  flex: 1;
}
.cta-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.13em;
  color: var(--gold);
  font-weight: 700;
  margin: 0 0 14px;
}
.cta-heading {
  font-family: var(--font-heading, 'Playfair Display', serif);
  font-size: clamp(1.7rem, 3.5vw, 2.6rem);
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
  line-height: 1.15;
  letter-spacing: -0.01em;
}
.cta-sub-text {
  font-size: 0.88rem;
  color: var(--muted);
  line-height: 1.6;
  max-width: 400px;
  margin: 0;
}

.cta-action-btn {
  flex-shrink: 0;
  background: var(--gold);
  color: #0a0e14;
  border: none;
  border-radius: 12px;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 16px 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition:
    background 0.2s var(--ease-out),
    box-shadow 0.2s var(--ease-out),
    transform 0.15s var(--ease-out);
  box-shadow: 0 8px 24px rgba(212,175,55,0.3);
}
.cta-action-btn:hover {
  background: #e8c84a;
  box-shadow: 0 12px 36px rgba(212,175,55,0.45);
  transform: translateY(-2px);
}
.cta-action-btn:active { transform: scale(0.98); }
.cta-btn-icon {
  transition: transform 0.18s var(--ease-out);
}
.cta-action-btn:hover .cta-btn-icon {
  transform: translateX(3px);
}

/* Spotly container (still used by SectionHeader outside if any) */
.spotly-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ══════════════════════════════════════════════
   MODE TOGGLE
══════════════════════════════════════════════ */
.mode-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 22px;
}
.mode-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  color: var(--muted);
  font-size: 0.82rem;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-weight: 500;
  padding: 8px 18px;
  cursor: pointer;
  transition:
    background 0.18s var(--ease-out),
    border-color 0.18s var(--ease-out),
    color 0.18s var(--ease-out);
}
.mode-pill:hover {
  border-color: rgba(212,175,55,0.38);
  color: var(--gold);
}
.mode-pill--active {
  background: rgba(212,175,55,0.16) !important;
  border-color: rgba(212,175,55,0.55) !important;
  color: var(--gold) !important;
  font-weight: 600;
}

/* ══════════════════════════════════════════════
   DESCRIBE MODE
══════════════════════════════════════════════ */
.describe-section {
  display: flex;
  flex-direction: column;
}
.describe-textarea :deep(.v-field) {
  background: rgba(255,255,255,0.04) !important;
  border-radius: 12px !important;
  color: #fff;
  caret-color: var(--gold);
}
.describe-textarea :deep(.v-field__outline) {
  color: rgba(212,175,55,0.25) !important;
}
.describe-textarea :deep(.v-field--focused .v-field__outline) {
  color: rgba(212,175,55,0.55) !important;
}
.describe-textarea :deep(textarea::placeholder) {
  color: var(--muted);
}
.find-venues-btn {
  align-self: flex-start;
  background: var(--gold) !important;
  color: #0a0e14 !important;
  font-weight: 700 !important;
  font-size: 0.88rem !important;
  letter-spacing: 0.04em !important;
  border-radius: 10px !important;
  padding: 0 24px !important;
  height: 44px !important;
  text-transform: none !important;
}
.find-venues-btn:hover {
  background: #e8c84a !important;
  box-shadow: 0 6px 20px rgba(212,175,55,0.35) !important;
}

/* Starter prompt chips */
.starter-chips {
  margin-bottom: 14px;
}
.starter-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
}
.starter-scroll-wrap {
  position: relative;
}
.starter-scroll-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 7px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 4px;
  padding-right: 32px;
  scrollbar-width: none;
}
.starter-scroll-row::-webkit-scrollbar {
  display: none;
}
.starter-chip {
  flex-shrink: 0;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 20px;
  color: rgba(255,255,255,0.5);
  font-size: 0.78rem;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-weight: 400;
  padding: 6px 14px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.15s var(--ease-out),
    border-color 0.15s var(--ease-out),
    color 0.15s var(--ease-out);
}
.starter-chip:hover:not(:disabled) {
  background: rgba(212,175,55,0.08);
  border-color: rgba(212,175,55,0.4);
  color: rgba(255,255,255,0.85);
}
.starter-chip:disabled {
  opacity: 0.35;
  cursor: default;
}
.starter-scroll-hint {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 4px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: linear-gradient(to right, transparent, var(--surface) 70%);
  pointer-events: none;
}

/* "Curated for" banner */
.curated-for-banner {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 22px;
  font-size: 0.85rem;
  color: var(--muted-light);
  font-family: var(--font-body, 'Inter', sans-serif);
}
.curated-icon {
  color: var(--gold) !important;
  flex-shrink: 0;
}
.curated-summary {
  font-family: var(--font-heading, 'Playfair Display', serif);
  font-style: italic;
  color: var(--gold);
  font-size: 0.92rem;
}
.curated-count {
  color: var(--muted);
  font-size: 0.8rem;
}

/* Skeleton cards */
.venue-skeleton {
  border-radius: 18px !important;
  overflow: hidden;
  background: var(--surface) !important;
  border: 1px solid var(--border-subtle);
}

/* AI reason badge */
.badge-ai-reason {
  position: absolute;
  bottom: 50px;
  left: 12px;
  right: 12px;
  z-index: 4;
  background: rgba(212, 150, 0, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 0.68rem;
  font-weight: 600;
  color: #0a0e14;
  display: flex;
  align-items: flex-start;
  gap: 5px;
  line-height: 1.35;
}

/* ══════════════════════════════════════════════
   TRANSITIONS
══════════════════════════════════════════════ */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s var(--ease-out);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.15s, transform 0.15s var(--ease-expo);
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.slide-up-fade-enter-active {
  transition: opacity 0.2s var(--ease-out), transform 0.2s var(--ease-expo);
}
.slide-up-fade-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.slide-up-fade-enter-from {
  opacity: 0;
  transform: translateY(100%);
}
.slide-up-fade-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* ══════════════════════════════════════════════
   REDUCED MOTION
══════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .blob-1, .blob-2,
  .avatar-ring-outer,
  .avatar-halo,
  .eyebrow-dot,
  .scroll-cue,
  .particle,
  .empty-icon,
  .empty-line,
  .cta-glow-left {
    animation: none !important;
  }
  .venue-card,
  .btn-book,
  .btn-manage,
  .pill-chip,
  .cta-action-btn {
    transition: none !important;
  }
}

/* ══════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════ */

/* Tablet */
@media (max-width: 900px) {
  .venue-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 18px;
  }
  .cta-content {
    flex-direction: column;
    align-items: flex-start;
    padding: 36px 32px;
    gap: 24px;
  }
  .cta-action-btn {
    width: 100%;
    justify-content: center;
  }
}

/* Mobile */
@media (max-width: 600px) {
  .hero-banner {
    padding: 60px 0 44px;
    min-height: 360px;
  }
  .hero-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 28px;
  }
  .hero-avatar-wrap {
    align-self: center;
  }
  .hero-heading {
    font-size: 2.2rem;
  }
  .hero-stats {
    flex-wrap: wrap;
  }
  .glass-panel {
    padding: 20px 18px;
    border-radius: 16px;
  }
  .venue-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .card-image {
    height: 190px;
  }
  .section-heading-row {
    flex-wrap: wrap;
    gap: 8px;
  }
  .cta-content {
    padding: 28px 22px;
  }
  .cta-heading {
    font-size: 1.7rem;
  }
  .page-body {
    padding: 28px 16px 0;
  }
}
</style>
