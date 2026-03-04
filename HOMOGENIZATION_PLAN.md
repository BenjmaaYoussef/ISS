# Spotly UI Homogenization — Execution Prompt

## Context

You are working on a Vue 3 + Vuetify 3 project located at `/Users/benjmaayoussef/ISS/spotly/src/`.

The app is a luxury venue booking & management system called **Spotly**. It uses a dark gold-accent design system (Midnight Base + Champagne Gold).

The Vuetify theme is defined in `src/plugins/vuetify.js`:

- `background`: `#0A0E14`
- `surface`: `#13181F`
- `primary` (gold): `#D4AF37`
- `error` (rose): `#C71585`
- `secondary` (green): `#2EBB57`

Global CSS tokens are in `src/styles/settings.scss`.
Two layout navbar components exist:

- `src/components/layout/AppNavbarApp.vue` — internal app pages (admin/staff/auth), uses Spotly logo image
- `src/components/layout/AppNavbarVenue.vue` — guest/venue-facing pages

The dev index page at `/` (`src/pages/index.vue`) lists all pages grouped by role.

---

## Goal

Make all pages **fully homogeneous**: same navbar component (no inline `<v-app-bar>`), same color values, same spacing, same typography classes, same button names, same component patterns. No reinvention per page.

---

## All Pages & Their Routes

| ID    | Label                         | Route                       | File                                 |
| ----- | ----------------------------- | --------------------------- | ------------------------------------ |
| P1    | App Landing Page              | `/landing`                  | `pages/landing.vue`                  |
| P2    | Global Authentication         | `/auth`                     | `pages/auth.vue`                     |
| P3    | Venue Landing Page            | `/venue/demo`               | `pages/venue/[id].vue`               |
| P4    | Environment Selection         | `/booking/environment`      | `pages/booking/environment.vue`      |
| P5    | Seat Selection                | `/booking/seats`            | `pages/booking/seats.vue`            |
| P6    | Reservation Confirm           | `/booking/confirm`          | `pages/booking/confirm.vue`          |
| P19   | Reservation Awaiting          | `/booking/awaiting`         | `pages/booking/awaiting.vue`         |
| P13   | Client Dashboard              | `/client/dashboard`         | `pages/client/dashboard.vue`         |
| P13.1 | Client Home (Venue Discovery) | `/home`                     | `pages/home.vue`                     |
| P15   | Digital Menu (QR)             | `/menu/demo`                | `pages/menu/[tableId].vue`           |
| P9    | Admin Dashboard               | `/admin/dashboard`          | `pages/admin/dashboard.vue`          |
| P10   | Floor Plan Builder            | `/admin/floor-plan`         | `pages/admin/floor-plan.vue`         |
| P11   | Menu Manager                  | `/admin/menu`               | `pages/admin/menu.vue`               |
| P12   | Reservation Queue             | `/admin/reservations`       | `pages/admin/reservations.vue`       |
| P16   | Venue Identity Studio         | `/admin/venue-settings`     | `pages/admin/venue-settings.vue`     |
| P14   | Staff Live Dashboard          | `/staff/dashboard`          | `pages/staff/dashboard.vue`          |
| D1    | Delete Constraint Dialog      | `/modals/delete-constraint` | `pages/modals/delete-constraint.vue` |
| D2    | Guest Check-In Dialog         | `/modals/guest-check-in`    | `pages/modals/guest-check-in.vue`    |

---

## Existing Shared Components

```
src/components/
  layout/
    AppNavbarApp.vue       ← logo img, navLinks or navTabs, adminLabel, showBackLink, #actions slot
    AppNavbarVenue.vue     ← venueName, venueSubLabel, showPoweredBy, showDefaultActions, compact, #actions slot
  ui/
    SectionHeader.vue      ← title, subtitle, icon, count, #actions slot
    StatCard.vue           ← value, label, color
    SpotlyDivider.vue      ← label
  feedback/
    ReservationStatusChip.vue  ← status, size, showIcon
    SpotlySnackbar.vue         ← snackbar (from useSnackbar()), timeout, location
  dialogs/
    DeleteConstraintDialog.vue
    GuestCheckInDialog.vue
  AppFooter.vue            ← exists but currently used nowhere
```

---

## Phased Execution Plan

Execute each phase completely before moving to the next. After each phase, verify no regressions.

---

### Phase 0 — Design Token Foundation (`src/styles/settings.scss`)

**Objective:** Single source of truth for all reused values and utility classes.

Add to `settings.scss`:

**CSS custom properties:**

```scss
:root {
  --font-heading: "Playfair Display", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;
  --color-gold: #d4af37;
  --color-bg: #0a0e14;
  --color-surface: #13181f;
  --color-surface-elevated: #161e2b; /* form cards, section backgrounds */
  --color-text-primary: #f5f0e8;
  --color-text-secondary: #9aa3b0;
  --color-text-muted: #6b7a8d;
  --color-rose: #c71585;
  --color-green: #2ebb57;
  --border-card: rgba(212, 175, 55, 0.18); /* card / bar borders */
  --border-subtle: rgba(212, 175, 55, 0.12); /* inner element borders */
}
```

**`@keyframes fadeUp`:**

```scss
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Global utility classes:**

```scss
/* ─── Brand Logo Text ─── */
.brand-logo {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-gold);
  letter-spacing: 0.04em;
}

/* ─── Page-level main wrapper ─── */
.spotly-main {
  background: var(--color-bg);
  min-height: 100vh;
}

/* ─── Standard page content container ─── */
.spotly-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 48px;
}
.spotly-container--wide {
  max-width: 1600px;
}
.spotly-container--narrow {
  max-width: 960px;
}

/* ─── Form field label ─── */
.field-label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

/* ─── Section label (mini header without border) ─── */
.section-label-sm {
  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ─── Buttons ─── */
.gold-btn {
  background: var(--color-gold) !important;
  color: #0a0e14 !important;
  font-family: var(--font-body) !important;
  font-size: 0.82rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08em !important;
  border-radius: 4px !important;
}
.gold-btn:hover {
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.3) !important;
}
.gold-btn:disabled {
  opacity: 0.4 !important;
}

.secondary-btn {
  border: 1px solid rgba(212, 175, 55, 0.35) !important;
  color: var(--color-gold) !important;
  background: transparent !important;
  font-family: var(--font-body) !important;
  font-size: 0.82rem !important;
  font-weight: 500 !important;
  letter-spacing: 0.04em !important;
  border-radius: 4px !important;
}
.secondary-btn:hover {
  border-color: rgba(212, 175, 55, 0.6) !important;
  background: rgba(212, 175, 55, 0.06) !important;
}

.danger-btn {
  background: rgba(199, 21, 133, 0.15) !important;
  border: 1px solid var(--color-rose) !important;
  color: var(--color-rose) !important;
  font-family: var(--font-body) !important;
  font-size: 0.82rem !important;
  font-weight: 600 !important;
  border-radius: 4px !important;
}

/* ─── Input override (Vuetify → Spotly) ─── */
.spotly-input :deep(.v-field) {
  background: var(--color-surface-elevated);
  border-radius: 6px;
  font-family: var(--font-body);
}
.spotly-input :deep(.v-field__input) {
  color: var(--color-text-primary);
  font-size: 0.88rem;
  min-height: 44px;
}
.spotly-input :deep(.v-field__input::placeholder) {
  color: var(--color-text-muted);
  opacity: 1;
}
.spotly-input :deep(.v-field--focused .v-field__outline) {
  --v-field-border-color: var(--color-gold);
}

/* ─── Table ─── */
.spotly-table {
  background: transparent !important;
}
.spotly-th {
  font-family: var(--font-body) !important;
  font-size: 0.68rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  color: var(--color-text-muted) !important;
  padding: 12px 20px !important;
  background: rgba(255, 255, 255, 0.02) !important;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1) !important;
}
.spotly-tr {
  transition: background 0.15s;
}
.spotly-tr:hover {
  background: rgba(212, 175, 55, 0.04) !important;
}
.spotly-td {
  font-family: var(--font-body) !important;
  font-size: 0.82rem !important;
  color: #c0c8d4 !important;
  padding: 12px 20px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
}

/* ─── Dialog Card ─── */
.spotly-dialog-card {
  background: var(--color-surface-elevated) !important;
  border: 1px solid var(--border-card) !important;
  border-radius: 16px !important;
}

/* ─── Step indicator (booking flow) ─── */
.step-label {
  font-family: var(--font-heading);
  font-size: 0.82rem;
  color: var(--color-gold);
  font-style: italic;
}
.step-title {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
```

---

### Phase 1 — Strip Nested `<v-app>` (5 pages)

`App.vue` already wraps everything in `<v-app>`. Remove the outer `<v-app ...>` opening tag and its matching closing `</v-app>` from:

1. `pages/booking/seats.vue`
2. `pages/booking/confirm.vue`
3. `pages/booking/awaiting.vue`
4. `pages/admin/floor-plan.vue`
5. `pages/admin/menu.vue`

Also remove any `<v-app :style="{ background: '#0A0E14' }">` inline background — it's redundant with the theme.

---

### Phase 2 — Create `AppNavbarPublic.vue`

**File:** `src/components/layout/AppNavbarPublic.vue`

Used only by the marketing landing page (`/landing`). Extracts the existing inline navbar from `landing.vue` verbatim into a reusable component.

**Props:**

```js
navLinks: { type: Array, default: () => ['Features', 'Pricing', 'About Us'] }
loginRoute: { type: String, default: '/auth' }
```

The navbar contains:

- Left: SVG compass logo + "Spotly" text (this page uses the marketing SVG, different from the product logo used in AppNavbarApp/Venue — that's intentional for the public page)
- Center: text nav links
- Right: "Login" outlined gold button

Then in `landing.vue`, replace the inline `<v-app-bar ...>` block with `<AppNavbarPublic />`.

---

### Phase 3 — Extend `AppNavbarVenue.vue` with `#center` slot

Add an optional named slot `#center` between the left branding and the right actions. This allows booking pages to inject the step-pip indicator without touching the component's core logic.

```vue
<!-- between left branding and <v-spacer /> -->
<slot name="center" />
```

---

### Phase 4 — Create `BookingStepIndicator.vue`

**File:** `src/components/ui/BookingStepIndicator.vue`

**Props:**

```js
steps: { type: Array, required: true }
// Each: { label: string }
currentStep: { type: Number, required: true }  // 1-based
```

Renders pip dots + lines between them, matching the existing visual in `seats.vue`. Used by seats, confirm, awaiting via the `#center` slot of `AppNavbarVenue`.

---

### Phase 5 — Fix inline navbars (6 pages)

Replace each page's inline `<v-app-bar>` with the appropriate component:

#### `pages/booking/seats.vue`

- Replace inline bar with `AppNavbarVenue` using:
  - `venue-name="Sunset Beach Club"` `:show-powered-by="true"` `:show-default-actions="false"`
  - `#center`: `<BookingStepIndicator :steps="[{label:'Environment'},{label:'Select Table'},{label:'Confirm'}]" :current-step="2" />`
  - `#actions`: Back button + Cart button (keep existing logic)

#### `pages/booking/confirm.vue`

- Replace inline bar with `AppNavbarVenue`:
  - `#center`: `<BookingStepIndicator ... :current-step="3" />`
  - `#actions`: "My Profile" + "Log Out" buttons (keep existing)

#### `pages/booking/awaiting.vue`

- Replace inline bar with `AppNavbarVenue`:
  - `venue-name="Sunset Beach Club"` `venue-sub-label="Awaiting Decision"` `:show-default-actions="false"`
  - `#actions`: "My Reservations" button

#### `pages/admin/floor-plan.vue`

- Replace inline bar with `AppNavbarApp`:
  - `:nav-links="adminNavLinks"` `active-link="builder"` `admin-label="Admin"` `@nav="handleNav"`
  - The environment tabs row moves to a secondary nav strip **below** the `<v-app-bar>`, consistent with how `admin/menu.vue` already has a secondary nav

#### `pages/admin/menu.vue`

- Replace inline bar with `AppNavbarApp`:
  - `:nav-links="adminNavLinks"` `active-link="menu"` `admin-label="Admin"` `@nav="handleNav"`
  - The secondary tabs strip stays as-is below the bar

#### `pages/landing.vue`

- Replace inline `<v-app-bar>` with `<AppNavbarPublic />`

---

### Phase 6 — `<v-main>` + Container Normalization (all pages)

Every page with a `<v-main>` should add class `spotly-main`:

```vue
<v-main class="spotly-main">
```

Every page's top-level content div should use `.spotly-container` (or a modifier):

```vue
<div class="spotly-container">
```

Map per page:
| Page | Current container | Target |
|---|---|---|
| booking/environment | `<v-container style="max-width:1100px; padding:0 48px">` | `<div class="spotly-container spotly-container--narrow">` |
| booking/confirm | `<v-container fluid class="py-6 px-6" style="max-width:1400px">` | `<div class="spotly-container spotly-container--wide">` |
| admin/menu | `<v-container fluid class="pa-6" style="max-width:1600px">` | `<div class="spotly-container spotly-container--wide">` |
| admin/dashboard | `<div class="dash-container pa-8">` (has scoped CSS max-width) | `<div class="spotly-container">` — remove scoped `.dash-container` |
| admin/reservations | `<div class="queue-container pa-8">` | `<div class="spotly-container">` |
| admin/venue-settings | `<div class="studio-container">` (scoped) | keep scoped for this complex page, just add `spotly-main` to `<v-main>` |
| client/dashboard | `<div class="dashboard-container pa-8">` | `<div class="spotly-container">` |
| home | `<div class="home-container pa-8">` | `<div class="spotly-container">` |
| staff/dashboard | `<div class="staff-container pa-6">` | `<div class="spotly-container">` |

---

### Phase 7 — Surface Color & Text Color Cleanup

**Surface colors to fix** (replace all occurrences in both `<template>` and `<style>`):

| Wrong value           | Replace with                                | Semantic                     |
| --------------------- | ------------------------------------------- | ---------------------------- |
| `#1a2332`             | `var(--color-surface-elevated)` / `#161E2B` | Form card, dialog background |
| `#111620` / `#111720` | `var(--color-surface)` / `#13181F`          | Standard surface             |
| `#161d28` / `#161D28` | `var(--color-surface-elevated)` / `#161E2B` | Slightly elevated            |
| `#0d1219`             | `var(--color-surface)` / `#13181F`          | Slightly dark surface        |

**Text colors to fix:**

| Wrong value                                      | Replace with     |
| ------------------------------------------------ | ---------------- |
| `#f0ead6` / `#F0EAD6` / `#e8dfc8` / `#E8DFC8`    | `#F5F0E8`        |
| `#6a7080` / `#6A7080`                            | `#6B7A8D`        |
| `#8a8fa8` / `#8A8FA8` / `#9aa3b0`                | `#9AA3B0`        |
| `rgba(255,255,255,0.45)` inline style muted text | `color: #9AA3B0` |
| `rgba(255,255,255,0.5)` inline muted             | `color: #9AA3B0` |

**Border colors to fix** (standardize alpha):

| Wrong value             | Replace with                                                                |
| ----------------------- | --------------------------------------------------------------------------- |
| `rgba(212,175,55,0.12)` | keep as-is (`--border-subtle`)                                              |
| `rgba(212,175,55,0.15)` | `rgba(212,175,55,0.18)` (`--border-card`)                                   |
| `rgba(212,175,55,0.20)` | `rgba(212,175,55,0.18)`                                                     |
| `rgba(212,175,55,0.25)` | Use context — if it's a card border use `0.18`, if a hover state use `0.35` |

---

### Phase 8 — Typography & Button Class Unification

**Remove local scoped definitions and rely on global classes from Phase 0:**

1. **`.brand-logo`** — defined locally (scoped) in `seats.vue`, `confirm.vue`, `awaiting.vue`, `floor-plan.vue`. Remove these 4 scoped definitions after Phase 0 adds it globally.

2. **`.gold-button` → `.gold-btn`** — `confirm.vue` uses `.gold-button`. `venue-settings.vue` uses `.gold-btn`. Standardize all to `.gold-btn`. Update template class references AND remove scoped CSS.

3. **`.secondary-button` → `.secondary-btn`** — same as above. `confirm.vue` uses `.secondary-button`. Rename to `.secondary-btn`.

4. **`.delete-button` → `.danger-btn`** — `admin/menu.vue` uses `.delete-button`. Rename.

5. **`.custom-input` → `.spotly-input`** — `confirm.vue` and `admin/menu.vue` use `.custom-input`. Rename to `.spotly-input`. Remove local `:deep()` overrides (already in global `.spotly-input`).

6. **Font strings** — Replace all raw `"Playfair Display", Georgia, serif` with `var(--font-heading)` and all `"Inter", sans-serif` / `"Inter", system-ui, sans-serif` with `var(--font-body)` inside `<style>` blocks.

7. **`@keyframes fadeUp`** — Remove local definitions in any pages that have it. After Phase 0 adds it globally, it will be available everywhere.

---

### Phase 9 — Table Class Unification

`admin/dashboard.vue` uses `.t-th`, `.t-td`, `.t-row`.
`admin/reservations.vue` uses `.table-th`, `.table-td`, `.table-row`, `.table-header-row`.

Both pages:

1. Replace class names in `<template>` to `.spotly-th`, `.spotly-td`, `.spotly-tr`
2. Remove the scoped CSS definitions for those classes (already added globally in Phase 0)

---

### Phase 10 — Dialog Card Class

Every dialog `v-card` currently has:

```html
style="background: #1a2332; border: 1px solid rgba(212,175,55,0.2);
border-radius: 16px;"
```

Replace with class `spotly-dialog-card` (defined globally in Phase 0). Remove the inline style.

Affected dialogs in:

- `admin/menu.vue` (add-item dialog, delete dialog)
- `booking/confirm.vue` (success dialog)
- `booking/seats.vue` (cart sheet dialog)
- Any dialogs in `booking/awaiting.vue`

---

### Phase 11 — Create `WelcomeBanner.vue`

**File:** `src/components/ui/WelcomeBanner.vue`

**Props:**

```js
greeting: { type: String, required: true }       // "Welcome back, John!"
subtext:  { type: String, required: true }       // secondary line
eyebrow:  { type: String, default: null }        // "Admin Panel" row with icon (admin dashboard only)
eyebrowIcon: { type: String, default: null }     // mdi icon for eyebrow
avatarLabel: { type: String, default: null }     // "JD" — show avatar ring on right
showWatermark: { type: Boolean, default: false } // SVG watermark (admin dashboard)
```

Extract the `.welcome-banner` HTML from `client/dashboard.vue` as the base template.

Then replace in:

- `pages/client/dashboard.vue`: remove scoped `.welcome-banner` styles, use component
- `pages/home.vue`: same
- `pages/admin/dashboard.vue`: use with `eyebrow="Admin Panel"` `eyebrow-icon="mdi-shield-crown"` `:show-watermark="true"`

---

### Phase 12 — Create `SpotlyPageHeader.vue`

**File:** `src/components/ui/SpotlyPageHeader.vue`

Complex admin pages each define their own page title + subtitle + actions header. Extract into a component.

**Props:**

```js
title:    { type: String, required: true }
subtitle: { type: String, default: null }
eyebrow:  { type: String, default: null }  // "Admin · Venue Management"
```

**Slots:**

```
#actions — right-side buttons
```

**Renders:**

- Optional eyebrow line (small uppercase, gold)
- H1 title (Playfair Display)
- Optional subtitle (Inter, muted)
- Gold decorative line below
- Optional right-side action slot

Replace in:

- `pages/admin/reservations.vue` — `.page-header` block
- `pages/admin/venue-settings.vue` — `.page-header` block
- `pages/admin/menu.vue` — page header div

---

### Phase 13 — Adopt Existing Components Where Missing

**`SectionHeader.vue`** — already used in `client/dashboard.vue` and `home.vue`. Should also replace the 5 inline `.section-label` divs in `admin/dashboard.vue`:

```vue
<!-- Before -->
<div class="section-label mb-4">
  <v-icon size="15" class="mr-2" color="#D4AF37">mdi-lightning-bolt</v-icon>
  Quick Actions
</div>
<!-- After -->
<SectionHeader title="Quick Actions" icon="mdi-lightning-bolt" class="mb-4" />
```

**`ReservationStatusChip`** — verify it's used in `client/dashboard.vue` for reservation status display.

**`AppFooter.vue`** — add to `landing.vue` at the bottom, replacing the inline footer block.

**`StatCard.vue`** — used in admin/dashboard and admin/reservations. Verify staff/dashboard doesn't have its own inline stats.

---

### Phase 14 — Remove Orphan `<v-app>` in Awaiting Page

`booking/awaiting.vue` has an ambient background with absolutely positioned orbs:

```html
<div class="ambient-bg">
  <div class="ambient-orb orb--gold" />
  ...
</div>
```

These are positioned relative to `<v-app>`. After removing `<v-app>`, ensure the `.ambient-bg` is positioned relative to the page root element instead. The outermost `<template>` fragment should wrap them in a single `<div class="page-root">`.

---

## Implementation Rules

1. **Never use inline styles for color values** — always use CSS variables or the Vuetify theme color system.
2. **Never define `.gold-btn`, `.secondary-btn`, `.danger-btn`, `.spotly-input`, `.brand-logo`, `.spotly-th/td/tr`, `.spotly-dialog-card` in scoped styles** — they are global.
3. **All `<v-main>` elements get `class="spotly-main"`**.
4. **Font families in `<style>` blocks must use `var(--font-heading)` and `var(--font-body)`**.
5. **One `<v-app>` per app** — only in `App.vue`.
6. **Logo in product pages = `<img src="@/assets/spotlyLogo.png">` only**, except landing page which uses the SVG in `AppNavbarPublic`.
7. **Card borders = `var(--border-card)`**, inner element borders = `var(--border-subtle)`.
8. **Card background = `var(--color-surface)` (`#13181F`)**, elevated form sections = `var(--color-surface-elevated)` (`#161E2B`).

---

## Verification Checklist (per phase)

After each phase:

- [ ] Run `npm run dev` in `/Users/benjmaayoussef/ISS/spotly/`
- [ ] Visit every affected page via the dev navigation at `http://localhost:5173/`
- [ ] Confirm no Vuetify console warnings about nested `<v-app>`
- [ ] Confirm no missing component errors
- [ ] Confirm visual appearance is unchanged (only class/structure refactor, not design)

---

## File Reference

```
/Users/benjmaayoussef/ISS/spotly/
  src/
    App.vue
    assets/
      spotlyLogo.png              ← use this for all product-page logos
    styles/
      settings.scss               ← Phase 0 target
    plugins/
      vuetify.js                  ← Vuetify theme (read-only, reference only)
    components/
      layout/
        AppNavbarApp.vue          ← extend in Phase 3, use in Phase 5
        AppNavbarVenue.vue        ← extend in Phase 3, use in Phase 5
        AppNavbarPublic.vue       ← create in Phase 2
      ui/
        SectionHeader.vue         ← existing ✅
        StatCard.vue              ← existing ✅
        SpotlyDivider.vue         ← existing ✅
        BookingStepIndicator.vue  ← create in Phase 4
        WelcomeBanner.vue         ← create in Phase 11
        SpotlyPageHeader.vue      ← create in Phase 12
      feedback/
        ReservationStatusChip.vue ← existing ✅
        SpotlySnackbar.vue        ← existing ✅
      dialogs/
        DeleteConstraintDialog.vue
        GuestCheckInDialog.vue
      AppFooter.vue               ← existing, adopt in Phase 13
    pages/
      landing.vue
      auth.vue
      home.vue
      venue/[id].vue
      booking/environment.vue
      booking/seats.vue
      booking/confirm.vue
      booking/awaiting.vue
      client/dashboard.vue
      menu/[tableId].vue
      admin/dashboard.vue
      admin/floor-plan.vue
      admin/menu.vue
      admin/reservations.vue
      admin/venue-settings.vue
      staff/dashboard.vue
      modals/delete-constraint.vue
      modals/guest-check-in.vue
```
