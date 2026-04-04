# PLAN.md — Spotly Dynamification

## Goal
Replace all hardcoded data in the UI with live reads/writes to `src/datamodel/` files backed by localStorage. Each datamodel file follows the professor's required pattern (class + reactive list + CRUD) extended with localStorage persistence and cross-tab sync via `storage` events.

## Session Cycle
1. Read `CLAUDE.md` + `PLAN.md` at the start of every session (always up to date)
2. Do the phase work
3. Run Playwright tests: `npx playwright test e2e/phaseX.spec.js`
4. Update the "Session Notes" section below with what was done and what's next
5. Mark tasks `[x]` before ending the session

---

## Phase 1 — Data Layer
**Scope:** `src/datamodel/` only. No UI changes.
**Goal:** All data models exist, persist to localStorage, sync across tabs.

### Tasks
- [x] Add localStorage + cross-tab sync to `User.js` (keep existing class and CRUD intact)
- [x] Create `Venue.js` with seed data from `home.vue` (Sunset Beach Club + 2 others)
- [x] Create `Environment.js` with seed data from `admin/floor-plan.vue` (env_indoor + env_terrace)
- [x] Create `MenuItem.js` with seed data from `admin/menu.vue` (Truffle Fries, Caesar Salad, etc.)
- [x] Create `Reservation.js` with seed data from `admin/reservations.vue` (RES-102, 105, 108, 111, 114)
- [x] Create `ReservationLog.js` (empty seed, logs written by other phases)

### Playwright verification (`e2e/phase1.spec.js`)
- Call `addUser()` via page.evaluate, reload, verify user persists in localStorage
- Call `addVenue()`, reload, verify venue appears
- Open two tabs, add a reservation in tab 1, verify `storage` event fires and tab 2 reflects it

---

## Phase 2 — Admin: Venue Settings + Floor Plan
**Scope:** `admin/venue-settings.vue`, `admin/floor-plan.vue`
**Goal:** Admin can edit venue info and save floor plan layouts to localStorage.

### Tasks
- [x] Wire `admin/venue-settings.vue` to read/write `VENUE_LIST[0]` (single venue for now)
- [x] Wire `admin/floor-plan.vue`: replace hardcoded `environments` ref with `ENVIRONMENT_LIST`
- [x] `saveLayout` button writes to `ENVIRONMENT_LIST` via CRUD (currently does nothing)
- [x] Delete element constraint check: block delete if element has future reservations in `RESERVATION_LIST`

### Playwright verification (`e2e/phase2.spec.js`)
- Navigate to floor plan, rename a table label, click Save, reload, verify label persists
- Try to delete a table that has an approved reservation, verify warning dialog appears

---

## Phase 3 — Admin: Menu + Reservations
**Scope:** `admin/menu.vue`, `admin/reservations.vue`
**Goal:** Menu items and reservation state changes persist.

### Tasks
- [x] Wire `admin/menu.vue` to read from `MENU_ITEM_LIST` and write on add/edit/delete
- [x] Wire `admin/reservations.vue` to read from `RESERVATION_LIST`
- [x] `approve(res)` / `reject(res)` writes status + appends a `ReservationLog` entry
- [x] Stats cards derive from live `RESERVATION_LIST` (already computed, just swap data source)

### Playwright verification (`e2e/phase3.spec.js`)
- Add a menu item, reload, verify it appears in the list
- Approve a pending reservation, reload, verify status is APPROVED and a log entry exists

---

## Phase 4 — Booking Flow
**Scope:** `booking/environment.vue`, `booking/seats.vue`, `booking/confirm.vue`, `booking/awaiting.vue`
**Goal:** A client can complete a booking that creates a real `Reservation` record.

### Tasks
- [x] `booking/environment.vue`: read environments from `ENVIRONMENT_LIST` (filtered by venueId)
- [x] `booking/seats.vue`: read elements from selected environment; compute seat status from `RESERVATION_LIST` (element is unavailable if it has an APPROVED/REQUESTED reservation overlapping date+time)
- [x] `booking/confirm.vue`: on submit, call `addReservation()` with form data + selected seat/env/venue; write initial `ReservationLog` entry (status: REQUESTED, actor: client)
- [x] `booking/awaiting.vue`: read reservation status from `RESERVATION_LIST` by id; poll via `storage` event for cross-tab updates when admin approves

### Playwright verification (`e2e/phase4.spec.js`)
- Complete full booking flow (env → seat → confirm form), verify reservation appears in localStorage with status REQUESTED
- Verify the booked seat shows as unavailable on a second visit to seats page

---

## Phase 5 — Client + Staff Dashboards
**Scope:** `client/dashboard.vue`, `staff/dashboard.vue`, `components/dialogs/GuestCheckInDialog.vue`
**Goal:** Dashboards show live data; staff can check guests in.

### Tasks
- [x] `client/dashboard.vue`: read reservations from `RESERVATION_LIST` filtered by `userId` (use logged-in user from localStorage session)
- [x] `staff/dashboard.vue`: read today's reservations + compute table states from `RESERVATION_LIST` + `ENVIRONMENT_LIST`
- [x] `GuestCheckInDialog.vue`: on confirm, update reservation status to `CHECKED_IN` and append log entry (actor: staff)
- [x] `admin/dashboard.vue`: replace hardcoded KPI numbers with computed values from `RESERVATION_LIST`

### Playwright verification (`e2e/phase5.spec.js`)
- Check in a reservation from staff dashboard, verify status is CHECKED_IN in localStorage
- Verify client dashboard shows the updated status

---

## Session Notes
*(Update this section at the end of every session)*

**Last session:** Phase 5 complete — client/dashboard.vue reads RESERVATION_LIST filtered by sessionUserId (from spotly_session localStorage), computes upcoming/pastVisits with environment/element name enrichment, confirmCancel calls updateReservationStatus+addReservationLog. staff/dashboard.vue computes tables from ENVIRONMENT_LIST+RESERVATION_LIST (today's date), wires GuestCheckInDialog for check-in (CHECKED_IN) and no-show (NO_SHOW) with log entries (actor: staff); checkOut marks COMPLETED. admin/dashboard.vue KPIs+statusBreakdown+environments+recentReservations all derived from live lists. confirm.vue stamps userId from spotly_session.
**Next session starts at:** All phases complete.
**Blockers / decisions pending:** None.
