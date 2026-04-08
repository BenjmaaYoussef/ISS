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

- [x] **Create `useFloorTables.js`** — Accepts `(environmentId, date)` as refs, returns computed UI table array by joining `ENVIRONMENT_LIST` elements with `RESERVATION_LIST`. Centralizes the shape transformation logic.

- [x] **Create `VenueFloorMap.vue`** — Per spec above. Uses `TableCard` for each element. Scales canvas with `transform: scale()`. Emits `table-click`.

- [x] **Rewrite `staff/dashboard.vue`** — Full page rewrite:
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

- [x] **menu/[tableId].vue — use MENU_ITEM_LIST** — Import `MENU_ITEM_LIST`. Read `route.params.tableId`, look up the element's `venueId` via `ENVIRONMENT_LIST`, filter `MENU_ITEM_LIST` by `venueId`, group by `category`.

- [x] **menu/[tableId].vue — fix category keys** — Current: `"cocktail"`, `"food"`, `"dessert"`. Canonical: `starters | mains | desserts | drinks`. Align filter chips and grouping.

- [x] **menu/[tableId].vue — fix dead buttons** — "Go back": wire to `router.back()`. "Save menu": remove (leftover from non-existent edit mode).

- [x] **menu/[tableId].vue — fix venue label** — Navbar hardcodes `"Table #12 — Terrace"`. Compute from looked-up element label + environment name.

---

## Phase 9 — Venue Settings Persistence + 404 + Datamodel Gaps (MEDIUM)

**Scope:** `admin/venue-settings.vue`, `src/datamodel/Venue.js`, `src/datamodel/ReservationLog.js`, `src/pages/[...all].vue` (new), `src/components/layout/AppNavbarPublic.vue`, `src/pages/admin/floor-plan.vue`

### Tasks

- [x] **Venue.js — add missing fields** — Extend the `Venue` class with: `tagline`, `location`, `venueType`, `hours` (array of `{ envId, open, close, active }`), `slides` (array of `{ title, subtitle, bgColor }`). Update `updateVenue()` to accept and persist these.

- [x] **venue-settings.vue — persist all fields** — Add `tagline`, `location`, `venueType`, `hours`, `slides` to the `updateVenue()` call in `saveChanges()`.

- [x] **venue-settings.vue — crash fix** — Line 658: `updateVenue(VENUE_LIST[0].id, ...)` throws `TypeError` when `VENUE_LIST` is empty. Guard: `if (!VENUE_LIST[0]) return`. Also guard the `defaultForm()` initializer.

- [x] **floor-plan.vue — fix hardcoded currentEnvId** — Line 888: `const currentEnvId = ref("env_indoor")`. Replace with `ref(environments.value[0]?.id ?? '')` so it defaults to the first real environment rather than a hardcoded string that may not exist.

- [x] **floor-plan.vue — remove orphaned TODO comment** — Line 1222: Remove the `//TODO` comment (the code beneath it is complete and functional).

- [x] **ReservationLog.js — complete CRUD** — Add `updateReservationLog(id, changes)` and `deleteReservationLog(id)` to satisfy the required data layer pattern (even if not called today).

- [x] **404 page** — Create `src/pages/[...all].vue`: branded not-found page with "Page not found" message and a "Go Home" button linking to `/`. `unplugin-vue-router` treats this file as the catch-all automatically.

- [x] **AppNavbarPublic.vue — wire nav links** — The `<v-btn>` nav links have no `to` prop or `@click`. Wire them to their routes or scroll targets.

- [x] **Seed reservation dates** — All 5 seed reservations in `Reservation.js` are dated `2026-02-15`–`2026-02-18`. This means the staff dashboard shows a completely empty floor plan on first run. Add at least 2–3 seed reservations dated dynamically (using `new Date().toISOString().split('T')[0]` for "today") so the app demonstrates its full feature set on first load.

---

## Phase 9.5 — Gallery & Image Upload (MEDIUM)

**Scope:** `src/utils/uploadImage.js` (new), `admin/venue-settings.vue` (Section 5 Gallery), `src/pages/venue/[id].vue` (hero slideshow), `src/datamodel/Venue.js`
**Goal:** Admin can upload real photos for each slideshow slide. Images are hosted via an external image API and stored as URLs in `Venue.slides[].imageUrl`. The venue public page hero displays the uploaded images.

### Image hosting

Uses **Cloudinary** with an unsigned upload preset. Credentials are stored in `.env.local` (gitignored — never committed). The utility wrapper is at `src/utils/uploadImage.js`.

**`.env.local` (already created):**
```
VITE_CLOUDINARY_CLOUD_NAME=dwgzoyuyq
VITE_CLOUDINARY_UPLOAD_PRESET=spotly_uploads
```

### Venue.slides shape update

Current `slides[]` item: `{ title, subtitle, bgColor }`
Extended: `{ title, subtitle, bgColor, imageUrl }` — `imageUrl` is optional; gradient fallback used when absent.

### Tasks

- [x] **`src/utils/uploadImage.js` — image upload utility** — Create a thin wrapper that reads `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` and POSTs a `File` to `https://api.cloudinary.com/v1_1/{cloud}/image/upload` via `FormData`. Returns `data.secure_url`. Throws a descriptive error on failure.

- [x] **Venue.js — add `imageUrl` to slides items** — Extend the `Venue` constructor to pass through `imageUrl` inside each `slides[]` item (already optional — no migration needed for existing seed).

- [x] **venue-settings.vue — Gallery section: image upload UI** — Replace the gradient-only slide display in Section 5 with:
  - Each slide card shows the image (if `slide.imageUrl`) or the gradient preview (fallback)
  - A "Upload Photo" button per slide opens a hidden `<input type="file" accept="image/*">` picker
  - On file select: call `uploadImage(file)`, show a loading spinner on that card, then set `slide.imageUrl` on success
  - Show an error toast on upload failure (network error, size limit, etc.)
  - An "×" / remove button clears `slide.imageUrl` (reverts to gradient)
  - Saving the form (existing `saveChanges`) already persists `slides` to `Venue.js` — no additional wiring needed

- [x] **venue/[id].vue — hero slideshow uses imageUrl** — In the hero slideshow, if `slide.imageUrl` is present use `background-image: url(slide.imageUrl)` with `background-size: cover`; otherwise fall back to `slide.bgColor` gradient. No change to transition/timing logic.

- [x] **`.env.local` — document in CLAUDE.md** — Add a note to CLAUDE.md that `.env.local` must contain the image API credentials before running phase 9.5 (so future sessions don't miss the setup step).

---

## Phase 10 — Admin & Client Polish (LOW)

**Scope:** `admin/reservations.vue`, `admin/menu.vue`, `client/dashboard.vue`, `booking/confirm.vue`, global

### Tasks

- [x] **admin/reservations.vue — add "Cancelled" filter** — `filterOptions` at line 194 is missing `"Cancelled"`. Add it, and add a corresponding entry in `displayToStatus`.

- [x] **admin/reservations.vue — reject confirmation** — Reject fires immediately with no confirmation dialog. Add a simple confirm dialog (or at minimum a `window.confirm` → better: a small inline dialog) before calling `reject(res)`. Also consider disabling reject for already-APPROVED reservations or at least warning.

- [x] **admin/menu.vue — `available` toggle** — The `MenuItem` class has an `available` field but the add/edit dialog has no toggle for it. Add a toggle switch in the dialog form.

- [x] **admin/menu.vue — save validation** — `saveItem()` has no guards. Add `if (!formData.name || !formData.price) return` before writing to the datamodel.

- [x] **client/dashboard.vue — fix all-reservation leak** — Line 366–370: when `sessionUserId === ""` the code falls to the `else` branch which returns the entire `RESERVATION_LIST` unfiltered. Fix: if `sessionUserId` is empty, return `[]` instead.

- [x] **client/dashboard.vue — inline booking expectations** — The "Book a Table" inline dialog creates reservations with `elementId: ""`. Add a visible note "A table will be assigned by our staff" to set expectations, or remove the inline form and route to the full booking flow (`/booking/environment`).

- [x] **client/dashboard.vue — date validation** — Booking form allows past dates. Add `:min="today"` to the date picker.

- [x] **client/dashboard.vue — loyalty tier** — Replace the hardcoded "Gold Member" + dummy progress with a computed tier based on `COMPLETED` reservations count for `sessionUserId` (0–2 → Bronze, 3–9 → Silver, 10+ → Gold).

- [x] **booking/confirm.vue — double-submit guard** — Disable the "Request Reservation" button after first click (set a `submitting` ref) to prevent duplicate reservations on double-click.

- [x] **Datamodel error handling** — Wrap every `JSON.parse(localStorage.getItem(...))` in the datamodel files with try/catch that falls back to seed data. One corrupted key should not crash the entire app.

- [x] **admin/dashboard.vue — dynamic greeting** — Replace hardcoded "Good evening" with a computed that returns morning/afternoon/evening based on `new Date().getHours()`.

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

- [x] **Make `/` the real landing page** — Replace the content of `src/pages/index.vue` with a redirect: add a `<script setup>` that calls `router.replace('/landing')` on mount. Or simply move `landing.vue` content into `index.vue` and remove the separate `/landing` route. Either approach is fine — pick whichever keeps routing cleaner with `unplugin-vue-router`.

- [x] **landing.vue — add "How It Works" section** — Insert a 3-step visual flow between the hero and "Why Choose Us": Step 1 "Discover a venue", Step 2 "Choose your table", Step 3 "Arrive & enjoy". Use the existing design system (gold accents, dark background, Playfair headings).

- [x] **landing.vue — add second hero CTA** — Alongside "Get Started For Free" add an "Explore Venues" button (secondary/outlined style) that routes to `/home`. This gives non-registered visitors a browse path.

- [x] **landing.vue — fix dead footer links** — Replace `href="#"` on Contact, Terms of Service, Privacy Policy with either real anchor targets (if those sections exist on the page) or remove the links entirely. Don't leave dead anchors.

- [x] **AppNavbarPublic.vue — fix logo click** — Change `$router.push('/')` to `$router.push('/landing')` (or `/` once index.vue is the landing page).

- [x] **AppNavbarPublic.vue — wire nav links** — Wire "Features", "Pricing", "About Us" to scroll anchors on the landing page (using `#features`, `#pricing`, `#about` fragment IDs added to the relevant sections), or remove them if those sections don't exist.

- [x] **AppNavbarPublic.vue — add Sign Up button** — Alongside the existing "Login" button, add a "Sign Up" button (gold filled) that routes to `/auth` with a `?mode=register` query param so auth.vue can open the registration panel by default.

- [x] **auth.vue — fix "Back to Home" link** — The back button in the navbar routes to `/` which is currently the dev nav. Change to `/landing` (or `/` once it redirects correctly).

- [x] **Remove or hide `test.vue`** — `src/pages/test.vue` is a datamodel test page auto-registered at `/test`. Either delete it or guard it with `v-if="isDev"` so it doesn't appear in production navigation.

---

## Phase 12 — Per-Environment Menus (LOW)

**Scope:** `src/datamodel/MenuItem.js`, `src/pages/menu/[tableId].vue`, `src/pages/admin/menu.vue`
**Goal:** Menu items can optionally be scoped to a specific environment. Items with no `environmentId` appear in all environments (venue-wide). Items with an `environmentId` only appear when visiting from a matching table/element.

### How it works
- `MenuItem.environmentId = null` → venue-wide (default, backwards-compatible)
- `MenuItem.environmentId = 'env_terrace'` → Terrace only
- Filter in `menu/[tableId].vue`: `m.venueId === venueId && (m.environmentId == null || m.environmentId === envId)`
- When the menu is accessed via the venue page (no element context, only venueId known), `envId` is null → all items with `environmentId == null` are shown (venue-wide only)
- When accessed from a specific table QR code (`/menu/et1`), the element → environment lookup provides `envId` → both venue-wide and environment-specific items are shown

### Tasks

- [x] **MenuItem.js — add `environmentIds` field** — Extended `MenuItem` with `environmentIds = []` (empty = venue-wide, array = restricted to those envs). Multi-env support replaces the original single `environmentId`.

- [x] **menu/[tableId].vue — filter by environmentIds** — Full menu (no element context) shows all items. Element context filters: `environmentIds.length === 0 || environmentIds.includes(envId)`. Also returns `envId` from resolved lookup.

- [x] **admin/menu.vue — environment scope multi-select** — Multi-select chips dropdown in add/edit dialog. Empty = all environments. Each selected env shows as a gold chip on the item row. Also fixed element ID generation in floor-plan to prefix with envId for global uniqueness.

---

## Phase 13 — Relationship-Based Authorization (Remove Role System)

**Scope:** `src/datamodel/User.js`, new `src/datamodel/VenueStaff.js`, `src/pages/auth.vue`, `src/router/index.js`, `src/pages/[...all].vue`, `src/pages/staff/dashboard.vue`, `src/pages/admin/reservations.vue`, `src/pages/admin/venue-settings.vue`, `src/pages/home.vue`, `src/pages/seed.vue`, `CLAUDE.md`

**Goal:** Replace the static `role` field on `User` with relationship-derived authorization. A user's access is determined by: (1) owning a venue (`Venue.adminEmail === email`), (2) being staff at a venue (new `VenueStaff` record), or (3) neither (plain customer). No role is chosen at registration. Any logged-in user can create a venue via a CTA on the home page. Venue owners add/remove staff from their venue settings page.

### New `VenueStaff` model

`src/datamodel/VenueStaff.js` — `{ id, venueId, userEmail }`
- localStorage key: `spotly_venue_staff`
- Functions: `addVenueStaff`, `removeVenueStaff(id)`, `getStaffByVenue(venueId)`, `getVenuesByStaff(userEmail)`, `isVenueStaff(userEmail)`

### Session shape after migration

```js
{ userId: email, name: "First Last", email, venueId: number|null }
```
- Owners: `venueId` = their venue id
- Staff: `venueId` = first assigned venue id
- Customers: `venueId` = null
- `role` field removed entirely

### Role derivation (replaces `session.role`)

| Old check | New check |
|---|---|
| `role === 'admin'` | `getVenueByAdminEmail(email) !== null` |
| `role === 'staff'` | `isVenueStaff(email)` |
| neither | plain customer |

### Tasks

- [x] **Create `VenueStaff.js`** — New file at `src/datamodel/VenueStaff.js`. Class `VenueStaff({ id, venueId, userEmail })`. Storage key `spotly_venue_staff`. Reactive `VENUE_STAFF_LIST`. `watch` + `storage` event listener (cross-tab, same pattern as other models). Functions: `addVenueStaff(record)`, `removeVenueStaff(id)` (splice by id), `getStaffByVenue(venueId)` → array of records, `getVenuesByStaff(userEmail)` → array of records, `isVenueStaff(userEmail)` → boolean.

- [x] **Update `User.js`** — Remove `role` parameter from constructor and `this.role = role`. Change the localStorage load line from `map(u => new User({ role: 'client', ...u }))` to `map(u => new User(u))`. Remove the `if (newData.role !== undefined) user.role = newData.role` line in `updateUserByEmail`.

- [x] **Update `auth.vue` — remove role from registration** — Remove the `regRole` ref, `roleOptions` array, and the role `<v-select>` from the register form template. In `register()`: remove `role: regRole.value` from the `new User(...)` call; remove the entire `if (regRole.value === "admin")` block that auto-created a Venue (users become owners via home page CTA instead). After that block `addUser(newUser)` and call `writeSessionAndRedirect(newUser, null)`.

- [x] **Update `auth.vue` — rewrite `writeSessionAndRedirect`** — Import `getVenuesByStaff` from `VenueStaff.js`. Compute: `const ownerVenue = getVenueByAdminEmail(user.email)` and `const staffVenues = getVenuesByStaff(user.email)`. Set `venueId = ownerVenue?.id ?? staffVenues[0]?.venueId ?? null`. Write session as `{ userId: user.email, name, email: user.email, venueId }` (no `role` field). Redirect: `if (ownerVenue)` → `/admin/dashboard`, `else if (staffVenues.length)` → `/staff/dashboard`, else → `/home`.

- [x] **Update `router/index.js`** — Import `isVenueStaff` from `VenueStaff.js`. Replace the `const role = session.role` block and all subsequent role checks with:
  ```js
  const isOwner = !!getVenueByAdminEmail(session.email)
  const isStaff = isVenueStaff(session.email)

  if (to.path.startsWith('/admin/') && !isOwner)
    return isStaff ? '/staff/dashboard' : '/home'
  if (to.path.startsWith('/staff/') && !isStaff && !isOwner)
    return '/home'
  if (to.path.startsWith('/client/') && isStaff && !isOwner)
    return '/staff/dashboard'
  if (to.path.startsWith('/client/') && isOwner)
    return '/admin/dashboard'
  // Onboarding gate — same logic, replace `role === 'admin'` with `isOwner`
  if (isOwner && to.path.startsWith('/admin/') && to.path !== '/admin/onboarding') { ... }
  ```

- [x] **Update `[...all].vue`** — Import `getVenueByAdminEmail` from `Venue.js` and `isVenueStaff` from `VenueStaff.js`. In the `homeRoute` computed replace `session.role === 'admin'` with `!!getVenueByAdminEmail(session.email)` and `session.role === 'staff'` with `isVenueStaff(session.email)`.

- [x] **Update `staff/dashboard.vue` — scope to assigned venue** — Read `session` via `useAuth`. Compute `const venueEnvs = computed(() => session?.venueId != null ? ENVIRONMENT_LIST.filter(e => e.venueId === session.venueId) : [])`. Replace all uses of `ENVIRONMENT_LIST` in the template and scripts with `venueEnvs`. Add an empty state (styled message) for when `venueEnvs` is empty. This fixes the existing bug where staff saw environments from all venues.

- [x] **Update `admin/reservations.vue` — computed actorRole** — After reading `session`, add `const actorRole = getVenueByAdminEmail(session?.email) ? 'admin' : 'staff'`. Replace both hardcoded `actorRole: "admin"` strings (appear in the approve and reject log entries) with `actorRole`.

- [x] **Update `admin/venue-settings.vue` — staff management section** — Add a "Staff Members" section at the bottom of the settings form (above the Save button). Import `VENUE_STAFF_LIST`, `addVenueStaff`, `removeVenueStaff`, `getStaffByVenue` from `VenueStaff.js`; import `VenueStaff` class; import `USER_LIST` from `User.js`. Add a `staffQuery` ref (search input). Computed `currentStaff`: `getStaffByVenue(venue.id)` — get the full user object for each record by matching `userEmail` in `USER_LIST`. Computed `staffSearchResults`: filter `USER_LIST` by query against `first_name + ' ' + last_name + email`, excluding users already in `currentStaff` and the owner email; only show results when `staffQuery.value.length >= 2`. UI:
  - Search input with label "Search users by name or email"
  - Search results list: each row shows name + email + "Add" chip — on click: `addVenueStaff(new VenueStaff({ id: Date.now(), venueId: venue.id, userEmail: result.email }))` + snackbar "Staff member added"
  - Current staff list: each row shows name + email + "Remove" chip — on click: `removeVenueStaff(record.id)` + snackbar "Staff member removed"
  - Show "No staff assigned yet" when list is empty

- [x] **Update `home.vue` — "Open Your Venue" CTA** — Import `getVenueByAdminEmail`, `addVenue`, `Venue` from `Venue.js`; import `useAuth`. For logged-in users where `getVenueByAdminEmail(session.email) === null`, show a CTA card (matching the page design style) with text "Open Your Venue on Spotly" and a subtitle like "Start accepting reservations today". On click: create `new Venue({ id: Date.now(), adminEmail: session.email, name: '', description: '' })`, call `addVenue(...)`, update session in localStorage with the new `venueId`, then `router.push('/admin/onboarding')`. Hide this CTA when the user already owns a venue.

- [x] **Update `seed.vue`** — Remove `role` from all `new User(...)` calls and from the seed preview table (remove role column, add a "Context" column showing "Venue Owner", "Staff", or "Customer"). After seeding users and venues, seed a VenueStaff record: capture the seeded venue's id and create `new VenueStaff({ id: Date.now() + 1, venueId: <seeded_venue_id>, userEmail: 'staff@spotly.com' })` → `addVenueStaff(...)`. Import `VenueStaff`, `addVenueStaff` from `VenueStaff.js`.

- [x] **Update `CLAUDE.md`** — In the Canonical Data Models section: remove `role` from `User` fields; add a new `VenueStaff` entry: `id, venueId, userEmail` / localStorage key `spotly_venue_staff`; add a note that user "role" is derived — not stored — via `Venue.adminEmail` (owner) or `VenueStaff` record (staff).

### Seed credentials after migration

| Email | Password | Derived access |
|-------|----------|----------------|
| admin@spotly.com | admin123 | Venue Owner (Venue record with matching adminEmail) |
| staff@spotly.com | staff123 | Staff (VenueStaff record linked to seeded venue) |
| client@spotly.com | client123 | Customer (no relationship records) |
| jane.smith@example.com | password456 | Customer |
| alice.johnson@example.com | password789 | Customer |

---

## Phase 14 — Table QR Codes & Call Waiter

**Scope:** `src/pages/admin/qr-codes.vue` (new), `src/datamodel/WaiterCall.js` (new), `src/pages/menu/[tableId].vue`, `src/pages/staff/dashboard.vue`, `src/router/index.js`

**Goal:** Venue managers can generate and print QR code cards for every table. Guests scan a table's QR code to open the menu; they can call the waiter from the menu page. Staff see live waiter call notifications on their dashboard.

### Design decisions (settled)

- QR codes encode the **element ID** (not environment ID), so the call waiter feature can identify the exact table. If a table element is deleted from the floor plan, only that one card needs reprinting — acceptable because removing a physical table is intentional.
- One card per table element. Cards are grouped by environment in the print layout.
- Print is done via `window.print()` with print-specific CSS — no PDF library needed. The browser's "Save as PDF" covers the PDF use case.
- QR library: `qrcode` npm package (generates SVG, no external requests).

### Tasks

- [x] **Install `qrcode`** — `npm install qrcode`. Used to generate QR SVGs client-side.

- [x] **`WaiterCall.js` — new datamodel** — `src/datamodel/WaiterCall.js`. Class `WaiterCall({ id, venueId, environmentId, elementId, tableLabel, envName, timestamp, status })` where `status: 'pending' | 'acknowledged'`. Storage key `spotly_waiter_calls`. Reactive `WAITER_CALL_LIST`. `watch` + `storage` event listener (cross-tab sync — staff dashboard must update in real time). Functions: `addWaiterCall(call)`, `acknowledgeWaiterCall(id)` (sets status to `'acknowledged'`), `getPendingCallsByVenue(venueId)` → active calls only.

- [x] **`menu/[tableId].vue` — wire Call Waiter button** — When the element context is resolved (elementId known), "Call Waiter" creates a `new WaiterCall({ id: Date.now(), venueId, environmentId: envId, elementId: tableId, tableLabel: resolved.elementLabel, envName: resolved.envName, timestamp: new Date().toISOString(), status: 'pending' })` and calls `addWaiterCall(...)`. Show a success snackbar "Waiter has been notified". When no element context (full menu via venueId), keep the current dummy snackbar — no real call is sent.

- [x] **`staff/dashboard.vue` — waiter call notifications** — Import `WAITER_CALL_LIST`, `acknowledgeWaiterCall`, `getPendingCallsByVenue` from `WaiterCall.js`. Add a "Waiter Calls" section at the top of the dashboard (above the floor map). Computed `pendingCalls`: `getPendingCallsByVenue(session.venueId)` sorted by timestamp descending. Each call shows: table label, environment name, time elapsed (e.g. "2 min ago"), and an "Acknowledge" button that calls `acknowledgeWaiterCall(id)`. Acknowledged calls disappear from the list. Show "No active calls" when empty. The cross-tab storage listener already in `WaiterCall.js` makes this update in real time without any polling.

- [x] **`admin/qr-codes.vue` — new page** — Route `/admin/qr-codes`. Add to admin nav. Layout:
  - Page header: "Table QR Codes" + "Print All" button
  - Environments listed as sections. Each section has a header (environment name) and a grid of table cards.
  - Each card: venue name (small, top), table label (large), environment name (small), QR code (SVG centered), "Scan to view menu" tagline, Spotly wordmark at bottom.
  - QR encodes the full URL: `${window.location.origin}/menu/${element.id}`
  - Checkboxes on each card for selective printing. "Print Selected" button activates when any are checked.
  - Print CSS (`@media print`): hides everything except the selected (or all) cards, removes checkboxes, breaks pages between cards, forces white background and black text for ink efficiency.

- [x] **Router** — Register `/admin/qr-codes` route and add it to `useAdminNav.js` nav links.

---

---

## Phase 15 — Walk-in Seating with Conflict Detection

**Scope:** `src/components/dialogs/WalkInDialog.vue` (new), `src/pages/staff/dashboard.vue`

**Goal:** Staff can seat walk-in customers at free tables directly from the floor map. Before confirming, the dialog checks for upcoming reservations on that table and warns or blocks based on how soon the conflict is.

### Design decisions

- Walk-ins are stored as real `Reservation` records with `status: CHECKED_IN` and `userId: ''` (no account). This means the floor map automatically marks the table as occupied via the existing `useFloorTables` logic — no extra wiring needed.
- The table's upcoming reservations (today, status `REQUESTED` or `APPROVED`, time > now) are fetched and displayed inside the dialog. Time comparison uses today's date + the reservation's time string.
- Conflict urgency thresholds:
  - **< 30 min** — block the action (disable confirm button, show red error banner). Staff must find another table.
  - **30–90 min** — warn (yellow banner). Confirm is still allowed but staff must acknowledge the risk.
  - **> 90 min or no upcoming reservation** — safe to seat (green info note showing the window).
- Explicitly inform staff: "Seating this walk-in does not cancel upcoming reservations — you will need to handle them manually."
- Party size is validated against table capacity (confirm disabled if exceeded).

### Tasks

- [ ] **`WalkInDialog.vue` — new component** — `src/components/dialogs/WalkInDialog.vue`. Props: `modelValue` (v-model open), `table` (floor table object with `id`, `envId`, `elementId`, `seats`, `env`). On open, compute `upcomingReservations`: filter `RESERVATION_LIST` by `elementId === table.elementId`, `environmentId === table.envId`, `date === today`, `status in ['REQUESTED', 'APPROVED']`, sorted by time ascending. Derive `nextReservation` (soonest). Compute `minutesUntilNext` from now to next reservation's time. Derive `conflictLevel`: `'block'` (< 30 min), `'warn'` (30–90 min), `'safe'` (> 90 min or none). UI:
  - Header: table name + environment + capacity badge
  - Conflict banner (conditional):
    - Red (`conflictLevel === 'block'`): "Cannot seat — reservation arrives in X min ([Guest Name] at [time]). Please find another table."
    - Yellow (`conflictLevel === 'warn'`): "Limited window — next reservation at [time] ([X] min). Confirm only if the party can be seated and served in time."
    - Green (`conflictLevel === 'safe'` and next exists): "Next reservation at [time] — [X] min window."
  - Full list of upcoming reservations (name, time, guests) shown as compact rows beneath the banner.
  - Disclaimer line (when any upcoming reservation exists): "Seating this walk-in does not cancel upcoming reservations."
  - Party size stepper (1 → table capacity). Validation error if exceeded.
  - Optional notes field.
  - Footer: Cancel + "Seat Walk-in" button. Disabled when `conflictLevel === 'block'` or party size invalid.

- [ ] **`staff/dashboard.vue` — wire free-table click to WalkInDialog** — Replace the current `notify(...)` snackbar for free tables in `onTableClick` with: `walkInTable.value = table; walkInDialog.value = true`. Add `walkInDialog` and `walkInTable` refs. Add `handleWalkIn(payload)` function: creates `new Reservation({ id: Date.now(), venueId: venueId.value, environmentId: payload.table.envId, elementId: payload.table.elementId, userId: '', name: 'Walk-in', email: '', phone: '', date: today, time: currentTimeString(), guests: payload.partySize, notes: payload.notes, status: 'CHECKED_IN' })` and calls `addReservation(...)`. Show snackbar "Walk-in seated at [table]". Import `WalkInDialog` (auto-imported via unplugin). Add `<WalkInDialog v-model="walkInDialog" :table="walkInTable" @confirm="handleWalkIn" />` to the template.

---

## Session Notes

**Last session:** Phase 14 complete — qrcode installed, WaiterCall datamodel, QR codes admin page with print support, Call Waiter wired in menu page, waiter call notifications on staff dashboard. Also fixed staff dashboard venueId derivation to always use VENUE_STAFF_LIST instead of session.venueId (handles users who own one venue but staff another).
**Next session starts at:** Phase 15 — Walk-in Seating with Conflict Detection.
**Blockers / decisions pending:** None.
