# PLAN.md — Spotly Production Readiness

## Context
Phases 1–5 (data layer + all page wiring) are done. See `PHASE1-5_DONE.md`.
This plan addresses every gap found in a full multi-role audit (5 parallel explorers + 3 role-based flow testers).

## Session Cycle
1. Read `CLAUDE.md` + `PLAN.md` at the start of every session
2. Work phase tasks in order
3. Test every phase per the **Phase Testing Protocol** in `CLAUDE.md` — Playwright first, then prompt user for manual tests
4. Only mark tasks `[x]` and update Session Notes after all tests pass

---

## Phase 6 — Auth & Session (CRITICAL — blocks everything else)

**Scope:** `src/pages/auth.vue`, `src/datamodel/User.js`, `src/router/index.js`, `src/composables/useAuth.js` (new), `src/components/layout/AppNavbarApp.vue`
**Goal:** Login validates real credentials, writes a session, redirects by role, route guards protect every gated page, and logout fully clears state.

### Root cause
`auth.vue login()` never calls `getUserByEmailAndPassword()`. It accepts any non-empty input, waits 1200 ms, and redirects to `/venue/demo`. No `spotly_session` is ever written to localStorage. Every downstream page that reads `session.userId` or `session.name` gets empty strings. No `router.beforeEach` guard exists — `/admin/*`, `/staff/*`, `/client/*`, `/booking/*` are all publicly accessible.

### Tasks

- [x] **User.js — add `role` field** — Extend the `User` class with `role: 'admin' | 'staff' | 'client'`. Update seed users so at least one of each role exists with known credentials (document below).

- [x] **auth.vue — real login** — Replace the stub with:
  1. Call `getUserByEmailAndPassword(email, password)` from the datamodel.
  2. If not found → show "Invalid credentials" error, do not redirect.
  3. If found → write `localStorage.setItem('spotly_session', JSON.stringify({ userId, name: first_name + ' ' + last_name, email, role }))`.
  4. Redirect by role: `admin` → `/admin/dashboard`, `staff` → `/staff/dashboard`, `client` → `/home`.

- [x] **auth.vue — inline registration** — Replace the dead `href="#"` "Request Access" link with a toggle that shows a second form panel (name, email, password, role selector). On submit call `addUser()` then auto-login using the same session-write logic above.

- [x] **useAuth.js composable (new)** — Create `src/composables/useAuth.js` with:
  - `getSession()` → reads and parses `spotly_session` from localStorage (try/catch)
  - `logout()` → `localStorage.removeItem('spotly_session')` then `router.push('/auth')`
  - Export for use in any page/component.

- [x] **router/index.js — route guards** — Add `router.beforeEach()`:
  - No session → redirect to `/auth` for any route under `/admin/*`, `/staff/*`, `/client/*`, `/booking/*`.
  - Session role `client` → deny `/admin/*` and `/staff/*`, redirect to `/home`.
  - Session role `staff` → deny `/admin/*`, redirect to `/staff/dashboard`.
  - Session role `admin` → allow all gated routes.
  - Public routes (`/`, `/landing`, `/auth`, `/home`, `/venue/*`, `/menu/*`) are always accessible.

- [x] **AppNavbarApp.vue — logout button** — Admin and staff pages use `AppNavbarApp` which currently has no logout mechanism. Add a logout icon button to the navbar that calls `logout()` from `useAuth.js`.

- [x] **All pages — replace hardcoded names** — Replace:
  - `admin/dashboard.vue` "Good evening, Admin" → dynamic time greeting + `session.name`
  - `staff/dashboard.vue` `admin-label="Admin"` → `session.name` from `useAuth`
  - `home.vue` "Welcome back, John!" → `session.name` (if logged in) or "Welcome"

### Seed credentials (document here after implementation)
| Email | Password | Role |
|-------|----------|------|
| admin@spotly.com | admin123 | admin |
| staff@spotly.com | staff123 | staff |
| client@spotly.com | client123 | client |

---

## Phase 7 — Venue Discovery & Booking Flow (CRITICAL)

**Scope:** `home.vue`, `venue/[id].vue`, `booking/environment.vue`, `booking/seats.vue`, `booking/confirm.vue`, `booking/awaiting.vue`
**Goal:** The full chain `home → venue detail → environment → seats → confirm → awaiting` works end-to-end with real data and correct state passing.

### Confirmed breakages (with file:line)
| File | Line | Issue |
|------|------|-------|
| `home.vue` | 190–233 | Venues are a hardcoded local array — `VENUE_LIST` never imported |
| `venue/[id].vue` | 358–420 | `useRoute()` never called, `id` param never read, all content hardcoded |
| `venue/[id].vue` | 97–128 | "Explore Menu" and "Make Reservation" buttons have no handler or `to` |
| `venue/[id].vue` | 134 | CTA navigates to `/environment` (invalid) instead of `/booking/environment?venueId=...` |
| `booking/environment.vue` | 248 | Filter hardcoded to `venueId === 1`; `route.query.venueId` never read |
| `booking/seats.vue` | 793–798 | Cart `date` stored as display string `"Fri 5 Apr"` not ISO `"2026-04-05"` |
| `booking/confirm.vue` | 484–525 | Empty cart not blocked; submitting with 0 items navigates to awaiting with null `pendingId` |
| `booking/confirm.vue` | 468, 530 | `showSuccess` ref is never set `true` — success dialog is dead code |
| `booking/awaiting.vue` | — | "Listening for updates" is cosmetic; no `storage` event listener wired |
| `booking/awaiting.vue` | — | No cancel button — user is stuck until navigating away |

### Tasks

- [x] **home.vue — use VENUE_LIST** — Import `VENUE_LIST` from `src/datamodel/Venue.js`. Replace the hardcoded `venues` ref with a computed that derives from `VENUE_LIST`. Wire search and activity filter against live data. Keep "Book Now" navigating to `/venue/${venue.id}`.

- [x] **venue/[id].vue — use route param** — Import `useRoute` and `getVenueById`. Read `route.params.id`, look up the venue, display all real fields (`name`, `description`, `ambienceTags`, `dressCode`, `images`). Wire:
  - "Make Reservation" → `router.push('/booking/environment?venueId=' + id)`
  - "Explore Menu" → `router.push('/menu/' + id)` (or first environment's tableId)
  - "Choose Your Environment" → same as Make Reservation

- [x] **booking/environment.vue — read venueId from query** — Replace the hardcoded `venueId === 1` filter with `Number(route.query.venueId)`. Also store `venueId` in the sessionStorage booking object: `spotly_booking = { venueId, environmentId }`.

- [x] **booking/seats.vue — fix date format** — Change cart item date to ISO string format (`selectedDate.toISOString().split('T')[0]` or `YYYY-MM-DD` string), not a localized display string like `"Fri 5 Apr"`.

- [x] **booking/confirm.vue — validate cart on mount** — On `onMounted`, if `sessionStorage.spotly_cart` is empty or missing, show a toast and `router.replace('/booking/seats')` rather than silently rendering an empty summary. Remove the dead `showSuccess` ref and its dialog block.

- [x] **booking/awaiting.vue — real-time listener** — Add a `window.addEventListener('storage', handler)` that checks for changes to the `spotly_reservations` key. When the reservation matching `pendingId` changes status, the already-reactive `RESERVATION_LIST` computed will update automatically (the storage listener in `Reservation.js` does the splice). Verify that `currentReservation` is a `computed(() => RESERVATION_LIST.find(r => r.id === pendingId))` — if not, fix it.

- [x] **booking/awaiting.vue — cancel button** — Add a "Cancel this request" button that calls `updateReservationStatus(pendingId, 'CANCELLED')` + `addReservationLog(...)` then redirects to `/client/dashboard`. Only visible when status is REQUESTED.

- [x] **booking/awaiting.vue — hide demo controls** — Wrap the `simulateDecision` / demo buttons in `v-if="isDev"` where `const isDev = import.meta.env.DEV`.

---

## Phase 8 — Staff Page Full Redesign + Menu Page Fix (HIGH)

**Scope:** `src/pages/staff/dashboard.vue` (full rewrite), new `src/composables/useFloorTables.js`, new `src/components/floor/VenueFloorMap.vue`, `src/pages/menu/[tableId].vue`
**Goal:** Staff page rebuilt around a live venue floor map with real-time table statuses. Menu page serves real data.

### Component reuse decisions (confirmed by component audit)

| Component | Decision | Notes |
|-----------|----------|-------|
| `FloorPlanGrid.vue` | **Skip** | Accepts env as string names, not canvas coordinates — wrong abstraction level |
| `TableCard.vue` | **Reuse as-is** | Pass `:readonly="false"` for staff mode. Needs `{ id, env, seats, status, guest, time, note }` shape |
| `TableDetailDialog.vue` | **Reuse as-is** | Clean v-model; action emits carry no payload (parent tracks `selectedTable`) |
| `useTableStatus.js` | **Reuse** | Has all status → label/color/icon mappings already |
| `ReservationStatusChip.vue` | **Reuse** | Use in side panel reservation list |
| `GuestCheckInDialog.vue` | **Reuse as-is** | Already fully wired |

**Key architectural decision:** The datamodel→UI shape transformation (`Environment.elements[]` + `RESERVATION_LIST` → `{ id, env, seats, status, guest, time, note }`) currently exists only as an inline `computed` in `staff/dashboard.vue`. `VenueFloorMap` needs the same logic. Extract it into `useFloorTables.js` to avoid a second copy.

### New `useFloorTables.js` composable (`src/composables/useFloorTables.js`)

Accepts `(environmentId: Ref<string>, date: Ref<string>)`, returns a `computed` array of UI table objects. Joins `ENVIRONMENT_LIST` elements with `RESERVATION_LIST` filtered by env + date. This is the single source of truth for the element→UI transformation.

### New `VenueFloorMap.vue` component (`src/components/floor/VenueFloorMap.vue`)

**Props:**
- `environment` — full environment object (`{ id, name, canvas: { width, height }, elements[] }`)
- `tables` — pre-computed UI table array from `useFloorTables` (caller passes it in, keeping component stateless)
- `mode` — `'staff'` (clickable) | `'readonly'`

**Emits:** `table-click(tableUiObject)`

**Behavior:**
- Scales `environment.canvas` proportionally to container via `transform: scale()`
- Renders each element at `element.x, element.y` with `element.rotation` as absolute-positioned `<TableCard>`
- In `staff` mode: `@check-in` and `@check-out` from `TableCard` bubble up as `table-click`
- No direct datamodel imports — all data passed as props
- Do NOT duplicate scoped CSS already in `TableCard.vue`

### Tasks

- [ ] **Create `useFloorTables.js`** — Accepts `(environmentId, date)` as refs, returns computed UI table array by joining `ENVIRONMENT_LIST` elements with `RESERVATION_LIST`. Centralizes the shape transformation logic.

- [ ] **Create `VenueFloorMap.vue`** — Per spec above. Uses `TableCard` for each element. Scales canvas with `transform: scale()`. Emits `table-click`.

- [ ] **Rewrite `staff/dashboard.vue`** — Full page rewrite:
  - Read `session` from `useAuth` composable — use `session.name` in navbar (remove hardcoded "Admin")
  - Top bar: date selector (defaults to today), environment tab switcher from `ENVIRONMENT_LIST`
  - Main area: `<VenueFloorMap :environment="selectedEnv" :tables="floorTables" mode="staff" @table-click="onTableClick" />`
  - `floorTables` = `useFloorTables(selectedEnvId, selectedDate)`
  - Right side panel (collapsible): full reservation list for selected date with `ReservationStatusChip`, search by guest name, filter by status
  - `onTableClick(table)`: REQUESTED/APPROVED → open `GuestCheckInDialog`; CHECKED_IN → "Check Out" confirm dialog; free → info toast
  - Keep all 3 write paths with `ReservationLog` entries (`actorRole: 'staff'`)
  - Persist staff notes: include `staffNote` from `GuestCheckInDialog` payload in the log entry
  - Remove: broken alerts panel, hardcoded alert ID 2, `resolveCall`, `allOccupied` (all confirmed dead code)
  - Remove all scoped CSS duplicated from component files

### Menu page tasks

- [ ] **menu/[tableId].vue — use MENU_ITEM_LIST** — Import `MENU_ITEM_LIST`. Read `route.params.tableId`, look up the element's `venueId` via `ENVIRONMENT_LIST`, filter `MENU_ITEM_LIST` by `venueId`, group by `category`.

- [ ] **menu/[tableId].vue — fix category keys** — Current: `"cocktail"`, `"food"`, `"dessert"`. Canonical: `starters | mains | desserts | drinks`. Align filter chips and grouping.

- [ ] **menu/[tableId].vue — fix dead buttons** — "Go back": wire to `router.back()`. "Save menu": remove (leftover from non-existent edit mode).

- [ ] **menu/[tableId].vue — fix venue label** — Navbar hardcodes `"Table #12 — Terrace"`. Compute from looked-up element label + environment name.

---

## Phase 9 — Venue Settings Persistence + 404 + Datamodel Gaps (MEDIUM)

**Scope:** `admin/venue-settings.vue`, `src/datamodel/Venue.js`, `src/datamodel/ReservationLog.js`, `src/pages/[...all].vue` (new), `src/components/layout/AppNavbarPublic.vue`, `src/pages/admin/floor-plan.vue`

### Tasks

- [ ] **Venue.js — add missing fields** — Extend the `Venue` class with: `tagline`, `location`, `venueType`, `hours` (array of `{ envId, open, close, active }`), `slides` (array of `{ title, subtitle, bgColor }`). Update `updateVenue()` to accept and persist these.

- [ ] **venue-settings.vue — persist all fields** — Add `tagline`, `location`, `venueType`, `hours`, `slides` to the `updateVenue()` call in `saveChanges()`.

- [ ] **venue-settings.vue — crash fix** — Line 658: `updateVenue(VENUE_LIST[0].id, ...)` throws `TypeError` when `VENUE_LIST` is empty. Guard: `if (!VENUE_LIST[0]) return`. Also guard the `defaultForm()` initializer.

- [ ] **floor-plan.vue — fix hardcoded currentEnvId** — Line 888: `const currentEnvId = ref("env_indoor")`. Replace with `ref(environments.value[0]?.id ?? '')` so it defaults to the first real environment rather than a hardcoded string that may not exist.

- [ ] **floor-plan.vue — remove orphaned TODO comment** — Line 1222: Remove the `//TODO` comment (the code beneath it is complete and functional).

- [ ] **ReservationLog.js — complete CRUD** — Add `updateReservationLog(id, changes)` and `deleteReservationLog(id)` to satisfy the required data layer pattern (even if not called today).

- [ ] **404 page** — Create `src/pages/[...all].vue`: branded not-found page with "Page not found" message and a "Go Home" button linking to `/`. `unplugin-vue-router` treats this file as the catch-all automatically.

- [ ] **AppNavbarPublic.vue — wire nav links** — The `<v-btn>` nav links have no `to` prop or `@click`. Wire them to their routes or scroll targets.

- [ ] **Seed reservation dates** — All 5 seed reservations in `Reservation.js` are dated `2026-02-15`–`2026-02-18`. This means the staff dashboard shows a completely empty floor plan on first run. Add at least 2–3 seed reservations dated dynamically (using `new Date().toISOString().split('T')[0]` for "today") so the app demonstrates its full feature set on first load.

---

## Phase 10 — Admin & Client Polish (LOW)

**Scope:** `admin/reservations.vue`, `admin/menu.vue`, `client/dashboard.vue`, `booking/confirm.vue`, global

### Tasks

- [ ] **admin/reservations.vue — add "Cancelled" filter** — `filterOptions` at line 194 is missing `"Cancelled"`. Add it, and add a corresponding entry in `displayToStatus`.

- [ ] **admin/reservations.vue — reject confirmation** — Reject fires immediately with no confirmation dialog. Add a simple confirm dialog (or at minimum a `window.confirm` → better: a small inline dialog) before calling `reject(res)`. Also consider disabling reject for already-APPROVED reservations or at least warning.

- [ ] **admin/menu.vue — `available` toggle** — The `MenuItem` class has an `available` field but the add/edit dialog has no toggle for it. Add a toggle switch in the dialog form.

- [ ] **admin/menu.vue — save validation** — `saveItem()` has no guards. Add `if (!formData.name || !formData.price) return` before writing to the datamodel.

- [ ] **client/dashboard.vue — fix all-reservation leak** — Line 366–370: when `sessionUserId === ""` the code falls to the `else` branch which returns the entire `RESERVATION_LIST` unfiltered. Fix: if `sessionUserId` is empty, return `[]` instead.

- [ ] **client/dashboard.vue — inline booking expectations** — The "Book a Table" inline dialog creates reservations with `elementId: ""`. Add a visible note "A table will be assigned by our staff" to set expectations, or remove the inline form and route to the full booking flow (`/booking/environment`).

- [ ] **client/dashboard.vue — date validation** — Booking form allows past dates. Add `:min="today"` to the date picker.

- [ ] **client/dashboard.vue — loyalty tier** — Replace the hardcoded "Gold Member" + dummy progress with a computed tier based on `COMPLETED` reservations count for `sessionUserId` (0–2 → Bronze, 3–9 → Silver, 10+ → Gold).

- [ ] **booking/confirm.vue — double-submit guard** — Disable the "Request Reservation" button after first click (set a `submitting` ref) to prevent duplicate reservations on double-click.

- [ ] **Datamodel error handling** — Wrap every `JSON.parse(localStorage.getItem(...))` in the datamodel files with try/catch that falls back to seed data. One corrupted key should not crash the entire app.

- [ ] **admin/dashboard.vue — dynamic greeting** — Replace hardcoded "Good evening" with a computed that returns morning/afternoon/evening based on `new Date().getHours()`.

---

## Phase 11 — Landing Page & Public Onboarding (MEDIUM)

**Scope:** `src/pages/index.vue`, `src/pages/landing.vue`, `src/components/layout/AppNavbarPublic.vue`, `src/pages/auth.vue` (navbar fix)
**Goal:** A real visitor hitting `/` sees a polished brand landing page — not the dev nav. The onboarding chain (`/` → `/landing` → `/auth` → role dashboard) is unbroken.

### Current state
- `/` maps to `index.vue` — a pure dev navigation page listing all routes. Every real visitor sees this.
- `/landing` already exists and is polished: hero, "Why Choose Us" section, "Trusted By" strip, footer. Only one CTA ("Get Started For Free" → `/auth`).
- `AppNavbarPublic` logo click routes to `/` (dev nav). All 3 center nav buttons (Features, Pricing, About Us) are dead with no `to` or `@click`.
- `auth.vue` "← Back to Home" routes to `/` (dev nav).
- `landing.vue` footer has 3 dead `href="#"` links (Contact, Terms, Privacy).
- No "Explore Venues" CTA — no path to browse venues without logging in.
- No "How It Works" section showing the client journey.

### Tasks

- [ ] **Make `/` the real landing page** — Replace the content of `src/pages/index.vue` with a redirect: add a `<script setup>` that calls `router.replace('/landing')` on mount. Or simply move `landing.vue` content into `index.vue` and remove the separate `/landing` route. Either approach is fine — pick whichever keeps routing cleaner with `unplugin-vue-router`.

- [ ] **landing.vue — add "How It Works" section** — Insert a 3-step visual flow between the hero and "Why Choose Us": Step 1 "Discover a venue", Step 2 "Choose your table", Step 3 "Arrive & enjoy". Use the existing design system (gold accents, dark background, Playfair headings).

- [ ] **landing.vue — add second hero CTA** — Alongside "Get Started For Free" add an "Explore Venues" button (secondary/outlined style) that routes to `/home`. This gives non-registered visitors a browse path.

- [ ] **landing.vue — fix dead footer links** — Replace `href="#"` on Contact, Terms of Service, Privacy Policy with either real anchor targets (if those sections exist on the page) or remove the links entirely. Don't leave dead anchors.

- [ ] **AppNavbarPublic.vue — fix logo click** — Change `$router.push('/')` to `$router.push('/landing')` (or `/` once index.vue is the landing page).

- [ ] **AppNavbarPublic.vue — wire nav links** — Wire "Features", "Pricing", "About Us" to scroll anchors on the landing page (using `#features`, `#pricing`, `#about` fragment IDs added to the relevant sections), or remove them if those sections don't exist.

- [ ] **AppNavbarPublic.vue — add Sign Up button** — Alongside the existing "Login" button, add a "Sign Up" button (gold filled) that routes to `/auth` with a `?mode=register` query param so auth.vue can open the registration panel by default.

- [ ] **auth.vue — fix "Back to Home" link** — The back button in the navbar routes to `/` which is currently the dev nav. Change to `/landing` (or `/` once it redirects correctly).

- [ ] **Remove or hide `test.vue`** — `src/pages/test.vue` is a datamodel test page auto-registered at `/test`. Either delete it or guard it with `v-if="isDev"` so it doesn't appear in production navigation.

---

## Session Notes

**Last session:** Phase 7 complete — Venue Discovery & Booking Flow fully implemented and tested (15/15 Playwright tests pass).
**Next session starts at:** Phase 8 — Staff Page Full Redesign + Menu Page Fix.
**Blockers / decisions pending:** None. Implement phases strictly in order (8 → 9 → 10 → 11).
