<template>
  <div>
    <!-- NAVBAR -->
    <v-app-bar flat color="background" style="border-bottom: 1px solid rgba(212,175,55,0.15);">
      <v-container class="d-flex align-center" fluid style="padding: 0 48px !important;">
        <!-- LOGO -->
        <div class="d-flex align-center" style="gap: 10px; cursor: pointer;" @click="$router.push('/')">
          <svg width="38" height="38" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="46" stroke="#D4AF37" stroke-width="3"/>
            <line x1="50" y1="4"  x2="50" y2="18" stroke="#D4AF37" stroke-width="3" stroke-linecap="round"/>
            <line x1="50" y1="82" x2="50" y2="96" stroke="#D4AF37" stroke-width="3" stroke-linecap="round"/>
            <line x1="4"  y1="50" x2="18" y2="50" stroke="#D4AF37" stroke-width="3" stroke-linecap="round"/>
            <line x1="82" y1="50" x2="96" y2="50" stroke="#D4AF37" stroke-width="3" stroke-linecap="round"/>
            <line x1="20" y1="20" x2="80" y2="80" stroke="#D4AF37" stroke-width="2" opacity="0.3"/>
            <line x1="80" y1="20" x2="20" y2="80" stroke="#D4AF37" stroke-width="2" opacity="0.3"/>
            <path d="M38 65 L38 45 Q38 38 46 38 L58 38 Q64 38 64 44 L64 52 L44 52 L44 65"
                  stroke="#D4AF37" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M38 65 L60 65" stroke="#D4AF37" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M42 65 L40 74" stroke="#D4AF37" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M56 65 L58 74" stroke="#D4AF37" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <span style="font-family:'Playfair Display',serif; font-size:1.5rem; color:#D4AF37; letter-spacing:1px;">
            Spotly
          </span>
        </div>
        <v-spacer />
        <div class="d-none d-md-flex mr-8" style="gap: 8px;">
          <v-btn v-for="link in navLinks" :key="link" variant="text"
                 style="color: rgba(255,255,255,0.65); font-size: 0.88rem; letter-spacing: 0.5px; border-radius: 0;">
            {{ link }}
          </v-btn>
        </div>
        <v-btn variant="outlined" color="primary" to="/auth"
               style="border-radius: 0; font-size: 0.8rem; letter-spacing: 1.5px; text-transform: uppercase;">
          Login
        </v-btn>
      </v-container>
    </v-app-bar>

    <v-main>
      <!-- HERO SECTION -->
      <v-sheet color="background" class="d-flex flex-column align-center justify-center text-center"
               style="min-height: 100vh; padding: 120px 24px 80px; position: relative; overflow: hidden;">
        <div style="position:absolute; inset:0; background:radial-gradient(ellipse 80% 60% at 50% 40%, rgba(212,175,55,0.07), transparent 70%); pointer-events:none;" />
        <v-chip variant="outlined" color="primary" size="small" class="mb-6"
                style="letter-spacing: 3px; border-radius: 0; font-size: 0.7rem; text-transform: uppercase; animation: fadeUp 0.5s ease both;">
          Luxury Venue Management
        </v-chip>
        <h1 style="font-family:'Playfair Display',serif; font-size:clamp(2rem,5vw,4.5rem); font-weight:700; line-height:1.15; max-width:780px; margin-bottom:24px; color:#D4AF37; text-shadow: 0 2px 10px rgba(212,175,55,0.4); animation:fadeUp 0.5s 0.1s ease both;">
          Transform Your Venue<br/>Into An Experience
        </h1>
        <p style="color:rgba(255,255,255,0.55); font-size:1.05rem; max-width:540px; line-height:1.75; margin-bottom:44px; font-family:'Inter',sans-serif; animation:fadeUp 0.5s 0.2s ease both;">
          The ultimate booking &amp; floor management system for high-end hospitality.
        </p>
        <v-btn to="/auth" size="large" color="primary"
               style="padding:0 48px; height:52px; font-size:0.85rem; letter-spacing:2.5px; text-transform:uppercase; border-radius:0; color:#0A0E14; font-weight:600; animation:fadeUp 0.5s 0.3s ease both;">
          Get Started For Free
        </v-btn>
      </v-sheet>

      <!-- TRUSTED BY -->
      <v-divider style="border-color: rgba(212,175,55,0.12);" />
      <v-sheet color="background" class="d-flex align-center justify-center flex-wrap py-8" style="gap: 40px;">
        <span style="color:rgba(255,255,255,0.3); font-size:0.75rem; letter-spacing:2px; text-transform:uppercase; font-family:'Inter',sans-serif;">
          Trusted by
        </span>
        <v-chip v-for="brand in trustedBrands" :key="brand" variant="outlined"
                style="border-color:rgba(212,175,55,0.25); color:rgba(212,175,55,0.65); border-radius:0; font-family:'Playfair Display',serif; font-size:0.95rem;">
          {{ brand }}
        </v-chip>
      </v-sheet>
      <v-divider style="border-color: rgba(212,175,55,0.12);" />

      <!-- WHY CHOOSE US -->
      <v-sheet color="#0d1219" style="padding: 88px 24px;">
        <v-container style="max-width: 1100px;">
          <h2 style="font-family:'Playfair Display',serif; font-size:2.2rem; color:#D4AF37; text-align:center; margin-bottom:56px;">
            Why Choose Us?
          </h2>
          <v-row>
            <v-col v-for="feat in features" :key="feat.title" cols="12" sm="6" lg="3">
              <v-card
                class="feature-card"
                style="background:#111620; border:1px solid rgba(212,175,55,0.15); border-radius:0; padding:32px; height:100%; transition:transform 0.3s, border-color 0.3s;"
                @mouseenter="e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.borderColor='rgba(212,175,55,0.4)'; }"
                @mouseleave="e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(212,175,55,0.15)'; }"
              >
                <v-icon :icon="feat.icon" color="primary" size="36" class="mb-4" />
                <div style="font-family:'Playfair Display',serif; font-size:1.1rem; color:#fff; margin-bottom:10px;">
                  {{ feat.title }}
                </div>
                <div style="color:rgba(255,255,255,0.5); font-size:0.87rem; line-height:1.7; font-family:'Inter',sans-serif;">
                  {{ feat.desc }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>

      <!-- FOOTER -->
      <v-divider style="border-color: rgba(212,175,55,0.12);" />
      <v-sheet color="background" class="d-flex align-center justify-space-between flex-wrap pa-6" style="gap:16px;">
        <span style="font-family:'Playfair Display',serif; font-size:1.1rem; color:#D4AF37;">Spotly</span>
        <div class="d-flex" style="gap: 28px;">
          <a v-for="link in footerLinks" :key="link" href="#"
             style="color:rgba(255,255,255,0.35); text-decoration:none; font-size:0.82rem; font-family:'Inter',sans-serif;">
            {{ link }}
          </a>
        </div>
        <span style="color:rgba(255,255,255,0.2); font-size:0.78rem; font-family:'Inter',sans-serif;">
          © 2025 Spotly. All rights reserved.
        </span>
      </v-sheet>
    </v-main>
  </div>
</template>

<script setup>
const navLinks = ['Features', 'Pricing', 'About Us']
const trustedBrands = ['Le Meridian', 'Sunset Beach Club', 'Rosewood']
const footerLinks = ['Contact', 'Terms of Service', 'Privacy Policy']
const features = [
  { icon: 'mdi-floor-plan', title: 'Visual Floor Plans', desc: 'Drag & drop builder for indoors, beach, and terrace environments.' },
  { icon: 'mdi-sync', title: 'Real-Time Sync', desc: 'Staff see updates instantly across all devices. No double bookings.' },
  { icon: 'mdi-office-building-marker', title: 'Multi-Venue Support', desc: 'Manage multiple venues from one dashboard with ease.' },
  { icon: 'mdi-calendar-check', title: 'Smart Reservations', desc: 'Approve, modify and track every reservation with full history.' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500&display=swap');
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
