# Ownership Model + Seed Page Plan

## Problem Summary

1. **No ownership**: `Venue` has no `adminEmail` field. Admin pages use hardcoded `VENUE_ID = 1` or `VENUE_LIST[0]`, so all admins see the same data.
2. **Seed data in datamodels**: All 6 datamodel files seed data on first load, so a new admin immediately sees Sunset Beach Club's venue, environments, menu, and reservations instead of an empty slate.
3. **`confirm.vue` hardcodes `venueId: 1`**: New reservations are always stamped with venue 1 regardless of which venue the client is booking.

## Solution

Two complementary fixes:
- **Ownership model** — tie each `Venue` to an admin by email, store `venueId` in the session, filter all admin pages by it.
- **Seed page** — remove hardcoded seed data from datamodels (default to empty), replace with a `/seed` dev-tool page.

---

## File-by-File Changes

### 1. `src/datamodel/Venue.js`

- Add `adminEmail = ''` field to the `Venue` class constructor.
- Remove the 6-item `_seed` array and all seed initialization logic. Default to `reactive([])`.
- Remove the `if (!_saved) localStorage.setItem(...)` line.
- Add a new exported helper:
  ```js
  export function getVenueByAdminEmail(email) {
    return VENUE_LIST.find(v => v.adminEmail === email) ?? null
  }
  ```

### 2. `src/datamodel/Environment.js`

- Remove the `_seed` array (Indoor Lounge + Outdoor Terrace) and all seed initialization logic.
- Default to `reactive([])`.

### 3. `src/datamodel/MenuItem.js`

- Remove the 9-item `_seed` array and all seed initialization logic.
- Default to `reactive([])`.

### 4. `src/datamodel/Reservation.js`

- Remove any seed data (if present) and default to `reactive([])`.

### 5. `src/datamodel/ReservationLog.js`

- Remove any seed data (if present) and default to `reactive([])`.

### 6. `src/datamodel/User.js`

- Remove the 5-item `_seed` array and all seed initialization logic (including the "ensure admin/staff always exist" block).
- Default to `reactive([])`.

---

### 7. `src/pages/auth.vue`

**Login flow** (`writeSessionAndRedirect`):
- For `role === 'admin'`: call `getVenueByAdminEmail(user.email)` to find their venue, add `venueId: venue?.id ?? null` to the session object.
- For other roles: `venueId` stays `null` (not needed).

**Register flow** (`register` function):
- After `addUser(newUser)` and only if `regRole.value === 'admin'`:
  - Create a new blank `Venue`:
    ```js
    const newVenue = new Venue({
      id: Date.now(),
      name: '',
      description: '',
      adminEmail: newUser.email,
    })
    addVenue(newVenue)
    ```
  - Pass `venueId: newVenue.id` into `writeSessionAndRedirect` (adjust the function signature to accept an optional override, or set it before calling).

---

### 8. `src/pages/admin/menu.vue`

- Import `useAuth` and call `getSession()`.
- Replace `const VENUE_ID = 1` with `const VENUE_ID = getSession()?.venueId ?? null`.
- Guard filtered list: if `VENUE_ID` is null, show empty state.

---

### 9. `src/pages/admin/reservations.vue`

- Import `useAuth`, call `getSession()`, extract `venueId`.
- Everywhere `RESERVATION_LIST` is used unfiltered, replace with a computed `venueReservations`:
  ```js
  const venueReservations = computed(() =>
    RESERVATION_LIST.filter(r => r.venueId === session?.venueId)
  )
  ```
- Use `venueReservations` instead of `RESERVATION_LIST` for: stats, `filteredReservations`, footer count.

---

### 10. `src/pages/admin/floor-plan.vue`

- Import `useAuth`, call `getSession()`, extract `venueId`.
- Line 885 — filter the initial local copy:
  ```js
  const environments = ref(
    JSON.parse(JSON.stringify(ENVIRONMENT_LIST.filter(e => e.venueId === session?.venueId)))
  )
  ```
- When adding a new environment (wherever `new Environment(...)` is called to push into `environments.value`), ensure it gets `venueId: session.venueId`.
- **Safe save** (`saveLayout`): do NOT splice all of `ENVIRONMENT_LIST`. Instead preserve other venues' environments:
  ```js
  const others = ENVIRONMENT_LIST.filter(e => e.venueId !== session?.venueId)
  ENVIRONMENT_LIST.splice(
    0,
    ENVIRONMENT_LIST.length,
    ...others,
    ...environments.value.map(e => new Environment(e))
  )
  ```

---

### 11. `src/pages/admin/venue-settings.vue`

- Import `useAuth` and `getVenueByAdminEmail` from the datamodel.
- Replace `VENUE_LIST[0]` with `getVenueByAdminEmail(session.email)` in both `defaultForm()` and `saveChanges()`.
- Guard both functions: if the result is null/undefined, return the empty defaults (no crash).

---

### 12. `src/pages/admin/dashboard.vue`

- Import `useAuth`, call `getSession()`, extract `venueId`.
- Add a `venueReservations` computed that filters `RESERVATION_LIST` by `venueId`.
- Add a `venueEnvironments` computed that filters `ENVIRONMENT_LIST` by `venueId`.
- Replace all direct uses of `RESERVATION_LIST` and `ENVIRONMENT_LIST` in KPIs, status breakdown, environments list, and recent reservations with these computed values.

---

### 13. `src/pages/booking/confirm.vue`

- Line 439: replace hardcoded `venueId: 1` with the actual venue from booking context.
- The venueId should already be available in `sessionStorage` (the booking flow stores the selected venue). Read it:
  ```js
  venueId: (() => { try { return JSON.parse(sessionStorage.getItem('spotly_booking') || '{}').venueId ?? null } catch { return null } })(),
  ```
- Check how the booking flow stores venueId in sessionStorage (look at `booking/environment.vue` and `booking/seats.vue`) and use the correct key.

---

### 14. `src/pages/seed.vue` (new file)

A developer tool page at `/seed`. No auth guard needed (academic project).

**UI layout:**
- Page title "Seed & Reset Dev Tool"
- Warning note: "This page is for development only. All actions modify localStorage directly."
- "Clear All Data" button — removes all `spotly_*` keys from localStorage and reloads the page.
- Sections, each with a description and a seed button:

**Section: Accounts**
- Seeds: `admin@spotly.com / admin123 (admin)`, `staff@spotly.com / staff123 (staff)`, `client@spotly.com / client123 (client)`, `jane.smith@example.com / password456 (client)`, `alice.johnson@example.com / password789 (client)`

**Section: Venue + Environments**
- Seeds venue: `{ id: 1, name: 'Sunset Beach Club', adminEmail: 'admin@spotly.com', description: '...', ambienceTags: [...], ... }`
- Seeds 2 environments: Indoor Lounge (11 elements) + Outdoor Terrace (5 elements), both with `venueId: 1`
- This button is disabled if no accounts have been seeded yet (check `spotly_users` in localStorage).

**Section: Menu Items**
- Seeds the 9 menu items all with `venueId: 1`.
- Disabled if no venue exists yet.

**Section: Reservations**
- Shows a date picker (defaults to today).
- Seeds ~5 reservations with mixed statuses (REQUESTED, APPROVED, REJECTED) for venue 1, environment `env_indoor`, on the selected date.
- Disabled if no environments exist yet.

**Section: Seed Everything**
- Single "Seed All" button — runs all of the above in order (accounts → venue+envs → menu → reservations on today's date).

**Implementation notes:**
- Import all datamodel classes and `add*` functions directly.
- Each seed function checks for existing data (e.g., skip if `admin@spotly.com` already exists).
- After each seed action, show a snackbar/success message.
- Use the existing Vuetify design system (gold buttons, dark surface cards, same typography).

---

## Things NOT to change

- `src/pages/home.vue` — shows all venues for client discovery, correct behavior.
- `src/pages/venue/[id].vue` — reads venue by route param ID, unaffected.
- `src/pages/menu/[tableId].vue` — reads venue by ID, unaffected.
- `src/pages/staff/dashboard.vue` — staff has no venue ownership, intentionally sees all environments/reservations.
- `src/pages/client/dashboard.vue` — already filters by `userId`, unaffected.
- `src/pages/booking/environment.vue` — already filters `ENVIRONMENT_LIST` by `venueId` from route, unaffected.
- `src/pages/booking/awaiting.vue` — finds reservation/env by ID, unaffected.
- `src/composables/` — no changes needed.
- `src/router/index.js` — no changes needed.

---

## Key constraints (from CLAUDE.md)

- Datamodel files must follow the exact pattern: `class`, `reactive([])`, `watch` + `storage` listener, CRUD functions.
- Field names are canonical — do not rename existing fields, only add `adminEmail` to `Venue`.
- No Pinia — state stays in datamodel files and component-local refs.
- Design system: primary `#D4AF37`, background `#0A0E14`, surface `#13181F`, Playfair Display headings, Inter body.
