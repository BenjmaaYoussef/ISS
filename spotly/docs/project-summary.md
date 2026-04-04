# Spotly — Project Summary

**Spotly** is a venue discovery and booking platform built with **Vue 3 + Vuetify 3 + Vite**. It is a frontend-only academic project that uses `localStorage` as its persistence layer in place of a backend.

---

## Overview

The project was built in two broad stages:

1. **UI Construction** — all pages built with hardcoded/static data
2. **Dynamification** — all pages wired to a live data layer backed by `localStorage`

The dynamification work was completed in **5 phases**, each targeting a specific area of the app.

---

## Phase 1 — Data Layer

**Scope:** `src/datamodel/` only. No UI changes.

Created and standardized all six data model files. Each file follows the professor's required pattern (described in detail below) extended with `localStorage` persistence and cross-tab synchronization.

| File | localStorage Key | Seed Data |
|---|---|---|
| `User.js` | `spotly_users` | 3 demo users |
| `Venue.js` | `spotly_venues` | Sunset Beach Club + 2 others |
| `Environment.js` | `spotly_environments` | Indoor room + Terrace |
| `MenuItem.js` | `spotly_menu_items` | Starters, mains, desserts, drinks |
| `Reservation.js` | `spotly_reservations` | 5 seed reservations (RES-102 through 114) |
| `ReservationLog.js` | `spotly_reservation_logs` | Empty (populated by later phases) |

**Result:** A fully reactive, persistent, cross-tab-synced data layer that every other phase reads from and writes to.

---

## Phase 2 — Admin: Venue Settings + Floor Plan

**Scope:** `admin/venue-settings.vue`, `admin/floor-plan.vue`

- **Venue Settings** reads and writes `VENUE_LIST[0]` — admin can edit venue name, description, ambience tags, dress code, etc. and changes persist across reloads.
- **Floor Plan** replaced its hardcoded `environments` ref with the live `ENVIRONMENT_LIST`. The `Save Layout` button now writes back to `ENVIRONMENT_LIST` via CRUD, persisting table positions, labels, and shapes.
- **Delete constraint** — deleting a floor element checks `RESERVATION_LIST` for future approved/requested reservations on that element and blocks the delete with a warning dialog if any exist.

---

## Phase 3 — Admin: Menu + Reservations

**Scope:** `admin/menu.vue`, `admin/reservations.vue`

- **Menu** reads items from `MENU_ITEM_LIST`. Add, edit, and delete operations call the corresponding CRUD functions so changes persist.
- **Reservations** reads from `RESERVATION_LIST`. The `Approve` / `Reject` actions update reservation status via `updateReservationStatus()` and append a `ReservationLog` entry (actor: `admin`).
- **KPI stat cards** on the reservations page are now computed from the live list (total, pending, confirmed counts).

---

## Phase 4 — Booking Flow

**Scope:** `booking/environment.vue`, `booking/seats.vue`, `booking/confirm.vue`, `booking/awaiting.vue`

This is the core client-facing flow — a multi-step wizard that creates a real reservation record.

| Step | Page | What it does |
|---|---|---|
| 1 | `environment.vue` | Reads `ENVIRONMENT_LIST` filtered by `venueId` so only real environments appear |
| 2 | `seats.vue` | Reads elements from the selected environment; computes each seat's status live from `RESERVATION_LIST` (a seat is unavailable if it has an `APPROVED` or `REQUESTED` reservation on the same date + time) |
| 3 | `confirm.vue` | On submit, calls `addReservation()` with the form data + selected seat/environment/venue; writes an initial `ReservationLog` entry with `status: REQUESTED` and `actorRole: client`; stamps `userId` from `spotly_session` |
| 4 | `awaiting.vue` | Reads reservation status by ID from `RESERVATION_LIST`; listens to the `storage` event so the page updates in real time when an admin approves or rejects from another tab |

---

## Phase 5 — Client + Staff Dashboards

**Scope:** `client/dashboard.vue`, `staff/dashboard.vue`, `admin/dashboard.vue`, `GuestCheckInDialog.vue`

- **Client Dashboard** filters `RESERVATION_LIST` by `userId` (read from `spotly_session` in localStorage) and enriches each record with environment and element names. The cancel action calls `updateReservationStatus()` + `addReservationLog()`.
- **Staff Dashboard** computes today's table states by joining `ENVIRONMENT_LIST` and `RESERVATION_LIST` on the current date. The `GuestCheckInDialog` sets status to `CHECKED_IN` (or `NO_SHOW`) and logs the action with `actorRole: staff`. Checking out sets status to `COMPLETED`.
- **Admin Dashboard** replaced all hardcoded KPI numbers with values computed live from `RESERVATION_LIST` and `ENVIRONMENT_LIST`.

---

## localStorage Implementation

### Why localStorage?

The project has no backend. `localStorage` acts as the database — data persists across page reloads and browser sessions within the same browser profile, and changes in one tab can be detected by other open tabs via the `storage` event.

### The Required Pattern

Every `src/datamodel/` file follows this exact structure (mandated by the professor):

```js
import { reactive, watch } from 'vue'

// 1. Class definition — plain data shape
export class Foo {
  constructor({ id, name, ... }) {
    this.id = id
    this.name = name
    // ...
  }
}

// 2. Seed data — used only when localStorage is empty
const _seed = [ new Foo({ ... }), ... ]

// 3. Reactive list — source of truth for the whole app
const STORAGE_KEY = 'spotly_foos'
const _saved = localStorage.getItem(STORAGE_KEY)
export const FOO_LIST = reactive(
  _saved ? JSON.parse(_saved).map(f => new Foo(f)) : _seed
)

// 4. Write-back watcher — keeps localStorage in sync
watch(FOO_LIST, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })

// 5. Cross-tab sync — storage event fired by other tabs
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  FOO_LIST.splice(0, FOO_LIST.length, ...JSON.parse(e.newValue).map(f => new Foo(f)))
})

// 6. CRUD exports
export function addFoo(foo) { FOO_LIST.push(foo) }
export function getFooById(id) { return FOO_LIST.find(f => f.id === id) }
export function updateFoo(id, data) { ... }
export function deleteFoo(id) { ... }
```

### How Each Piece Works

#### Class Definition
A plain JS class that normalises the shape of every object. When data is hydrated from JSON (which loses class methods), `JSON.parse(...).map(f => new Foo(f))` restores class instances so field access is consistent throughout the app.

#### Reactive List (`reactive([])`)
Vue's `reactive()` wraps the array so any component that reads from it (via `computed`, `v-for`, etc.) automatically re-renders when the list changes. This means a status change made deep in a CRUD function immediately updates every component that depends on that list — no manual event bus needed.

#### Write-back Watcher (`watch … deep: true`)
A Vue `watch` with `deep: true` monitors every nested property of `FOO_LIST`. Whenever anything changes — a push, a splice, or a field mutation — the entire list is serialised to JSON and written to `localStorage`. This is the single line that makes all data persist across reloads.

#### Cross-tab Sync (`storage` event)
The browser fires a `storage` event on **other** tabs (not the one that wrote) whenever `localStorage` changes. The listener reconstructs the full list from the new JSON value and splices it into the reactive array in-place. Using `splice(0, length, ...newItems)` rather than reassigning the array preserves Vue's reactivity tracking on the same reference.

#### Seed Data
Loaded only when `localStorage` has no saved value for the key yet (first run in a fresh browser). Once any data is written, the saved value takes over and seed data is never used again.

### Session (Authentication State)

A separate key `spotly_session` stores the currently logged-in user:

```js
// On login
localStorage.setItem('spotly_session', JSON.stringify({ userId, email, role }))

// On pages that need identity
const session = JSON.parse(localStorage.getItem('spotly_session') || 'null')
```

This is read by `booking/confirm.vue` (to stamp `userId` on new reservations), `client/dashboard.vue` (to filter reservations), and `staff/dashboard.vue` (to scope the staff view).

### localStorage Keys at a Glance

| Key | Content |
|---|---|
| `spotly_users` | Array of `User` objects |
| `spotly_venues` | Array of `Venue` objects |
| `spotly_environments` | Array of `Environment` objects (with nested `elements[]`) |
| `spotly_menu_items` | Array of `MenuItem` objects |
| `spotly_reservations` | Array of `Reservation` objects |
| `spotly_reservation_logs` | Array of `ReservationLog` objects |
| `spotly_session` | Single session object `{ userId, email, role }` |

### Limitations

- **Same-origin, same-browser only** — data does not sync between different devices or browsers.
- **No real auth** — the session key can be manually set in DevTools; there is no server-side validation.
- **Storage quota** — browsers limit `localStorage` to ~5 MB. For a venue with many reservations this would eventually be a concern, but is fine for an academic prototype.
- **No transactions** — concurrent writes from multiple tabs could theoretically race; the `storage` event mitigates this but does not provide true atomic transactions.
