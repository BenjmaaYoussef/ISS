# Master Context Prompt — Spotly: Luxury Venue Booking & Experience Management System

> Copy and paste this entire prompt at the start of every new chat session.

---

## Project Overview

You are assisting with the development of **Spotly**, a luxury venue booking and experience management system. This is an academic ISS project (Sophomore Software Engineering). It is a **frontend-only simulation** of a real-world luxury hospitality operations platform — no backend, no real authentication, no payment processing.

The emphasis is on **realism, domain accuracy, and business logic**. The system models the complete experience flow of luxury hospitality venues: browsing, reserving, seating, menu management, and daily operations.

---

## Tech Stack

| Layer                    | Technology                                                                 |
| ------------------------ | -------------------------------------------------------------------------- |
| **Project name**         | `spotly`                                                                   |
| **Framework**            | Vue 3 + Vuetify 3                                                          |
| **Routing**              | `unplugin-vue-router` (file-based, auto-routes from `src/pages/`)          |
| **Persistence**          | Browser LocalStorage (JSON collections)                                    |
| **Backend**              | None — frontend-only                                                       |
| **Cross-tab reactivity** | Browser `storage` event on LocalStorage                                    |
| **Optional**             | Axios + AI API (e.g., NanoBanana AI) for AI-assisted floor plan generation |

### LocalStorage Collections

`Users`, `Venues`, `Environments`, `Seats/Tables`, `Menus`, `Reservations`, `ChangeLogs`, `callWaiterQueue`

All data access goes through dedicated **repository/service layers** — separation of concerns is strictly enforced (UI / logic / data).

---

## Brand & Design System

### Brand Name

**Spotly** — logo concept: abstract seating layout with precise location marker; minimalist line-work.

### Color Palette

| Token                        | Hex       | Usage                          |
| ---------------------------- | --------- | ------------------------------ |
| `background`                 | `#0A0E14` | Midnight Base — primary bg     |
| `surface`                    | `#13181F` | Elevated surfaces / cards      |
| `primary` / `gold`           | `#D4AF37` | Champagne Gold — luxury/action |
| `secondary` / `status-green` | `#2EBB57` | Available status               |
| `error` / `status-rose`      | `#C71585` | Reserved / pending status      |

### Typography

| Role          | Font             | Usage                                       |
| ------------- | ---------------- | ------------------------------------------- |
| **Headings**  | Playfair Display | All `h1–h6`, card titles, hero text         |
| **Body / UI** | Inter            | All body text, buttons, labels, form fields |

### Buttons

- Primary action (e.g., BOOK NOW, CONFIRM RESERVATION): `v-btn` flat, `color="primary"` (gold bg, dark text)
- Secondary / outlined action (e.g., Add Note, View History, Filter Options): `v-btn` outlined, gold border + gold text, transparent bg — use CSS class `btn-outlined-gold`
- Status chips: use `v-chip` with appropriate color (`secondary` = CHECKED-IN, `error` = REQUESTED, `primary` = APPROVED)
- All button text: Inter, font-weight 600, uppercase, letter-spacing 0.08em

### Vuetify Theme

The custom theme is registered as `spotlyTheme` (dark) in `src/plugins/vuetify.js`. Global component defaults (VBtn, VCard, VTextField, etc.) are set there — do not override per-component unless necessary.

---

## Page Map

| ID  | Route                  | Page Name                                    | Role   |
| --- | ---------------------- | -------------------------------------------- | ------ |
| P1  | `/`                    | Project Landing Page (Sales Page)            | Public |
| P2  | `/auth`                | Global Authentication (Login/Register)       | All    |
| P3  | `/venue/:id`           | Venue Landing Page (Public Business Profile) | Client |
| P4  | `/booking/environment` | Environment Selection — Step 1               | Client |
| P5  | `/booking/seats`       | Visual Seat Selection — Step 2               | Client |
| P6  | `/booking/confirm`     | Reservation Confirmation & Notes — Step 3    | Client |
| P10 | `/admin/floor-plan`    | Environment Floor Plan Builder               | Admin  |
| D1  | _(dialog in P10)_      | Delete Constraint Warning                    | Admin  |
| P11 | `/admin/menu`          | High-End Menu Manager                        | Admin  |
| P12 | `/admin/reservations`  | Reservation Approval Queue                   | Admin  |
| P13 | `/client/dashboard`    | Client Dashboard (My Bookings & History)     | Client |
| P14 | `/staff/dashboard`     | Staff Live Dashboard                         | Staff  |
| D2  | _(dialog in P14)_      | Guest Check-In & Operational Notes           | Staff  |
| P15 | `/menu/:tableId`       | Environment-Aware Digital Menu (QR View)     | Client |

---

## User Roles

Role is determined by the URL path — no real login required.

### Client (`/booking/*`, `/client/*`, `/venue/*`, `/menu/*`)

- Browse venues, explore environments and atmospheres
- Select seating visually on interactive floor plan
- Submit reservation requests with date, time, group size, environment, table, and special notes
- Track reservation history and live status

### Admin (`/admin/*`)

- Create and edit venue profiles (name, description, images, ambience tags, dress code, languages)
- Build floor plans: define environments, set dimensions, place and configure seating elements
- Review, approve, or reject reservation requests
- Manage multi-language menus with per-environment filtering
- View audit logs, analytics dashboard, and export floor plans

### Staff (`/staff/*`)

- View daily reservation list (filterable by environment or status)
- See real-time visual floor plan (Free / Reserved / Occupied)
- Mark guest check-in
- Add operational notes per table
- Receive and clear "Call Waiter" requests reactively via `storage` event

---

## Core Architecture Decisions

### 1. Environment-Based Venue Model

A venue is divided into **distinct physical environments** (Indoor, Outdoor, Terrace, Beach, etc.). Each environment has:

- Name, rectangular dimensions (width × height)
- Optional visual background
- A bounded 2D coordinate system
- Tables/seats placed at (x, y) coordinates with optional rotation

Menus, availability, and seating layouts are **filterable per environment**.

### 2. Approval-Based Reservation Workflow (State Machine)

Reservations are **never auto-confirmed**. Full lifecycle:

```
REQUESTED → APPROVED / REJECTED → CANCELLED / CHECKED_IN → COMPLETED / NO_SHOW
```

### 3. Cross-Tab Multi-Role Simulation

All roles operate simultaneously on the same device using shared LocalStorage. Cross-tab reactivity is handled via the browser `storage` event — e.g., a "Call Waiter" request on the client tab appears instantly on the staff tab.

---

## Key Features

- **Floor Plan Builder** — drag-and-place seating elements within bounded environments; optional AI-assisted layout generation from a sketch/photo
- **Seat & Table Management** — type, capacity, position (x,y), rotation; color-coded availability (green = free, red = reserved/pending)
- **Reservation System** — visual table selection, special notes, status tracking
- **Reservation Notes** — client-added, read-only after approval, included in audit log
- **Change Log / Audit Lite** — all status transitions logged with timestamp and actor role; filterable and exportable (PDF/print)
- **Menu Management** — categories → items with price, allergens, availability tags, images, multi-language, per-environment filtering
- **QR Code Generation** — unique QR per table, links to environment- and language-filtered menu view
- **Staff Operations Interface** — daily reservation list, real-time floor plan, check-in actions
- **Printed Floor Plan Export** — print-friendly layout for offline/daily operations use
- **Analytics Dashboard** — daily reservation count, occupancy rate per environment, no-show count and trends, per-client no-show rate
- **Call Waiter Feature** — client presses button → `callWaiterQueue` in LocalStorage → staff tab reacts instantly via `storage` event
- **Conflict Prevention** — system blocks deletion of a table that has future reservations, with a warning (D1 dialog)

---

## Intentional Out-of-Scope

- Payment processing
- Real authentication or security
- Server-side infrastructure or cloud database
- Multi-device synchronization
- External integrations (except optional AI layout API)

---

## Positioning Statement

> _"Spotly simulates a luxury venue booking and experience management system, focusing on realism, domain-specific workflows, and detailed user interactions using a frontend-only architecture. It demonstrates operational detail, high-end client experience, strong domain modeling, and multi-role simulation using LocalStorage."_

---

## Instructions for the Assistant

- Always treat this as a **Vue 3 + Vuetify 3 frontend-only** project. Use the Spotly design system at all times.
- Use **Playfair Display** for all headings and **Inter** for all body/UI text.
- Use the exact hex colors: gold `#D4AF37`, bg `#0A0E14`, surface `#13181F`, green `#2EBB57`, rose `#C71585`.
- All primary action buttons: `v-btn` flat `color="primary"`. All secondary/outlined buttons: `btn-outlined-gold` class.
- Status chips: `secondary`=available/checked-in, `error`=requested/pending, `primary`=approved.
- Enforce **separation of concerns**: UI components must not access LocalStorage directly — always through service/repository layers.
- Respect the **approval-based reservation state machine** — never auto-confirm reservations.
- Remember that **all roles share the same LocalStorage** and cross-tab reactivity is via the `storage` event.
- All seat/table data must carry `(x, y, rotation, environmentId)` — never treat venues as flat table lists.
- When writing code for a specific page, reference its **Page ID** (P1–P15, D1, D2) in comments.

---

## Project Overview

You are assisting with the development of the **Luxury Venue Booking & Experience Management System**, an academic ISS project (Sophomore Software Engineering). It is a **frontend-only simulation** of a real-world luxury hospitality operations platform — no backend, no authentication, no payment processing.

The emphasis is on **realism, domain accuracy, and business logic**. The system models the complete experience flow of luxury hospitality venues: browsing, reserving, seating, menu management, and daily operations.

---

## Tech Stack

| Layer                    | Technology                                                                 |
| ------------------------ | -------------------------------------------------------------------------- |
| **Framework**            | Vue.js                                                                     |
| **Persistence**          | Browser LocalStorage (JSON collections)                                    |
| **Backend**              | None — frontend-only                                                       |
| **Routing**              | URL-path-based role switching (`/client`, `/admin`, `/staff`)              |
| **Cross-tab reactivity** | Browser `storage` event on LocalStorage                                    |
| **Optional**             | Axios + AI API (e.g., NanoBanana AI) for AI-assisted floor plan generation |

### LocalStorage Collections

`Users`, `Venues`, `Environments`, `Seats/Tables`, `Menus`, `Reservations`, `ChangeLogs`, `callWaiterQueue`

All data access goes through dedicated **repository/service layers** — separation of concerns is strictly enforced (UI / logic / data).

---

## User Roles

Role is determined by the URL path — no login required.

### Client (`/client`)

- Browse venues, explore environments and atmospheres
- Select seating visually on interactive floor plan
- Submit reservation requests with date, time, group size, environment, table, and special notes
- Track reservation history and live status

### Admin / Venue Manager (`/admin`)

- Create and edit venue profiles (name, description, images, ambience tags, dress code, languages)
- Build floor plans: define environments, set dimensions, place and configure seating elements
- Review, approve, or reject reservation requests
- Manage multi-language menus with per-environment filtering
- View audit logs, analytics dashboard, and export floor plans

### Staff / Host (`/staff`)

- View daily reservation list (filterable by environment or status)
- See real-time visual floor plan (Free / Reserved / Occupied)
- Mark guest check-in
- Add operational notes per table
- Receive and clear "Call Waiter" requests reactively via `storage` event

---

## Core Architecture Decisions

### 1. Environment-Based Venue Model

A venue is divided into **distinct physical environments** (Indoor, Outdoor, Terrace, Beach, etc.). Each environment has:

- Name, rectangular dimensions (width × height)
- Optional visual background
- A bounded 2D coordinate system
- Tables/seats placed at (x, y) coordinates with optional rotation

Menus, availability, and seating layouts are **filterable per environment**.

### 2. Approval-Based Reservation Workflow (State Machine)

Reservations are **never auto-confirmed**. Full lifecycle:

```
REQUESTED → APPROVED / REJECTED → CANCELLED / CHECKED_IN → COMPLETED / NO_SHOW
```

### 3. Cross-Tab Multi-Role Simulation

All roles operate simultaneously on the same device using shared LocalStorage. Cross-tab reactivity is handled via the browser `storage` event — e.g., a "Call Waiter" request on the client tab appears instantly on the staff tab.

---

## Key Features

- **Floor Plan Builder** — drag-and-place seating elements within bounded environments; optional AI-assisted layout generation from a sketch/photo
- **Seat & Table Management** — type, capacity, position (x,y), rotation; color-coded availability (green = free, red = reserved/pending)
- **Reservation System** — visual table selection, special notes, status tracking
- **Reservation Notes** — client-added, read-only after approval, included in audit log
- **Change Log / Audit Lite** — all status transitions logged with timestamp and actor role; filterable and exportable (PDF/print)
- **Menu Management** — categories → items with price, allergens, availability tags, images, multi-language, per-environment filtering
- **QR Code Generation** — unique QR per table, links to environment- and language-filtered menu view
- **Staff Operations Interface** — daily reservation list, real-time floor plan, check-in actions
- **Printed Floor Plan Export** — print-friendly layout for offline/daily operations use
- **Analytics Dashboard** — daily reservation count, occupancy rate per environment, no-show count and trends, per-client no-show rate
- **Call Waiter Feature** — client presses button → `callWaiterQueue` in LocalStorage → staff tab reacts instantly via `storage` event
- **Conflict Prevention** — system blocks deletion of a table that has future reservations, with a warning

---

## Venue Types Supported

Luxury restaurants, cafés, beach clubs, beach bars, lounges, and any premium hospitality venue with multi-environment seating.

---

## UX & Design Principles

- Clean, minimalist, premium aesthetic
- Dark mode–friendly color palette
- Clear visual hierarchy
- Visual distinction between environments and seating types

---

## Intentional Out-of-Scope

- Payment processing
- Real authentication or security
- Server-side infrastructure or cloud database
- Multi-device synchronization
- External integrations (except optional AI layout API)

---

## Academic Success Criteria

- Clear domain modeling
- Correct reservation state machine implementation
- Accurate per-venue floor plan rendering
- Proper separation of concerns (UI / logic / data)
- Demonstration-ready scenarios (small café vs. large beach club)
- Working cross-tab multi-role simulation

---

## Positioning Statement

> _"This project simulates a luxury venue booking and experience management system, focusing on realism, domain-specific workflows, and detailed user interactions using a frontend-only architecture. It demonstrates operational detail, high-end client experience, strong domain modeling, and multi-role simulation using LocalStorage."_

---

## Instructions for the Assistant

- Always treat this as a **Vue.js frontend-only** project with LocalStorage as the sole data layer.
- Enforce **separation of concerns**: UI components must not access LocalStorage directly — always through service/repository layers.
- Respect the **approval-based reservation state machine** — never auto-confirm reservations.
- Remember that **all roles share the same LocalStorage** and cross-tab reactivity is via the `storage` event.
- Apply **luxury/premium UX standards** to all UI suggestions.
- When suggesting features or code, consider which **role** (client, admin, staff) it belongs to and which **environment** context it operates in.
- All seat/table data must carry `(x, y, rotation, environmentId)` — never treat venues as flat table lists.
