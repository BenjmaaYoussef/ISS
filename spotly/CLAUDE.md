# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Lint and auto-fix (eslint . --fix)
```

Playwright tests live in `e2e/` (gitignored — local only). Run them with `npx playwright test`.

## Architecture

**Spotly** is a venue discovery and booking platform built with Vue 3 + Vuetify 3 + Vite. Academic project — frontend-only, localStorage as persistence layer, no backend.

### Routing

File-based routing via `unplugin-vue-router` — files in `src/pages/` auto-generate routes. Dynamic segments use bracket syntax (`[id].vue`, `[tableId].vue`). The router is configured in `src/router/index.js`.

Key route groups:
- `/admin/*` — venue management (dashboard, floor-plan, menu, reservations, venue-settings)
- `/booking/*` — multi-step booking flow (environment → seats → confirm → awaiting)
- `/client/`, `/staff/` — role-specific dashboards
- `/venue/[id]`, `/menu/[tableId]` — dynamic venue/table pages

### State Management

No Pinia — state is managed via:
- **Component-local** `ref()`/`computed()` in `<script setup>`
- **Data layer** in `src/datamodel/` — each file exports a `class`, a `reactive([])` list, and CRUD functions. This structure is required by the professor and must not change.
- **Composables** in `src/composables/` for shared cross-component logic

### Data Layer Pattern (Required Structure)

Every datamodel file follows this exact pattern:

```js
import { reactive, watch } from 'vue'

export class Foo { constructor({ ... }) { ... } }

const STORAGE_KEY = 'spotly_foos'
const saved = localStorage.getItem(STORAGE_KEY)
export const FOO_LIST = reactive(saved ? JSON.parse(saved).map(f => new Foo(f)) : [...seedData])

watch(FOO_LIST, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  FOO_LIST.splice(0, FOO_LIST.length, ...JSON.parse(e.newValue).map(f => new Foo(f)))
})

export function addFoo(foo) { FOO_LIST.push(foo) }
// ... other CRUD functions
```

The `storage` event listener enables cross-tab reactivity (required by PRD).

### Canonical Data Models

All field names across UI and datamodel files must match these exactly:

**`User`** — `first_name, last_name, email, password`
- localStorage key: `spotly_users`

**`Venue`** — `id, name, description, ambienceTags[], activities[], images[], dressCode, supportedLanguages[]`
- localStorage key: `spotly_venues`

**`Environment`** — `id, venueId, name, desc, icon, gradient, canvas: {width, height}, elements[]`
- `elements[]` are seats/decor nested inside the environment (matches floor-plan builder structure)
- Element fields: `id, type, shape, label, capacity, x, y, rotation` — **`status` is computed from reservations, never stored on the element**
- localStorage key: `spotly_environments`

**`MenuItem`** — `id, venueId, category, name, price, desc, tags[], allergens[], available`
- `category`: one of `starters | mains | desserts | drinks`
- localStorage key: `spotly_menu_items`

**`Reservation`** — `id, venueId, environmentId, elementId, userId, name, email, phone, date, time, guests, notes, status`
- `status`: `REQUESTED | APPROVED | REJECTED | CANCELLED | CHECKED_IN | COMPLETED | NO_SHOW`
- UI display aliases: `REQUESTED` → "Pending", `APPROVED` → "Confirmed"
- localStorage key: `spotly_reservations`

**`ReservationLog`** — `id, reservationId, previousStatus, newStatus, timestamp, actorRole`
- `actorRole`: `client | admin | staff`
- localStorage key: `spotly_reservation_logs`

### Composables

| File | Purpose |
|------|---------|
| `useAdminNav.js` | Admin navigation links and router handler |
| `useSnackbar.js` | Toast notification state and helpers |
| `useTableStatus.js` | Status label/icon/color mapping for reservations and floor plan |

### Component Organization

Components in `src/components/` are grouped by feature:
- `layout/` — role-specific navbars (`AppNavbarPublic`, `AppNavbarApp`, `AppNavbarVenue`)
- `ui/` — design system primitives (`SectionHeader`, `StatCard`, `BookingStepIndicator`)
- `feedback/` — snackbar, status chips
- `floor/` — floor plan grid, table cards, detail dialog
- `menu/` — menu item rows, category hero
- `dialogs/` — guest check-in, delete constraint

### Design System

Defined in `src/plugins/vuetify.js` (Vuetify theme) and `src/styles/settings.scss` (CSS tokens):

- **Colors**: Primary `#D4AF37` (champagne gold), Background `#0A0E14` (midnight), Surface `#13181F`
- **Typography**: Playfair Display (headings), Inter (body) — loaded via Google Fonts in `index.html`
- **CSS variables**: `--font-heading`, `--color-gold`, etc. available globally

### Auto-Imports

Vuetify components and project components under `src/components/` are auto-imported via `unplugin-vue-components`. No explicit import needed for Vuetify or local components.

## Current State

The app has full UI built but all data is hardcoded in components. The work-in-progress is making everything dynamic by wiring each page to `src/datamodel/`. See `PLAN.md` for phase status.
