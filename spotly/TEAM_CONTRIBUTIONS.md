# Spotly — Team Work Distribution

## Overview

This document outlines how the Spotly project was divided among team members. Each person owned specific phases and implemented key features across the booking, admin, and public-facing parts of the app.

---

## 👤 Cyrine — Navigation Layer

**Primary Focus:** Landing page design, navigation polish, and public-facing user experience

### Phase 11 — Landing Page & Public Onboarding

The public-facing entry point and user journey setup.

**Routes handled:**

- `/` → Redirects to landing page
- `/landing` → Main landing page with hero, sections, CTAs
- `/auth` → Registration & login (navbar integration)

**Key contributions:**

- Redesigned `index.vue` as a redirect to real landing page
- Added "How It Works" 3-step visual section to landing
- Implemented dual CTAs: "Get Started" (login) + "Explore Venues" (public browse)
- Fixed `AppNavbarPublic.vue`: wired logo, nav links, and new Sign Up button
- Fixed dead footer links with proper anchor navigation
- Cleaned up test page visibility

### Phase 10 — Admin & Client Polish

Dashboard UI refinements and user experience improvements.

**Routes handled:**

- `/admin/reservations` → Reservation management with filters
- `/admin/menu` → Menu item editor
- `/client/dashboard` → User's reservation history and quick booking

**Key contributions:**

- Added "Cancelled" filter to admin reservations page
- Added confirmation dialog for reservation rejection
- Implemented menu item availability toggle
- Added date validation (no past dates) in booking form
- Built loyalty tier display (Bronze/Silver/Gold based on completed bookings)
- Added double-submit guard on reservation button
- Fixed info leaks on empty sessions (client dashboard)
- Dynamic greeting in admin dashboard (morning/afternoon/evening)

---

## 👤 Lina — Authentication & Menu Logic

**Primary Focus:** Authentication system, session management, and menu scoping

### Phase 6 — Auth & Session (CRITICAL)

The foundational security and permission layer.

**Routes handled:**

- `/auth` → Login & registration endpoint
- `router.beforeEach()` guards → Protects `/admin/*`, `/staff/*`, `/client/*`, `/booking/*`

**Key contributions:**

- Extended `User` class with role field (`admin | staff | client`)
- Implemented real credential validation in login form
- Added session persistence to localStorage (`spotly_session`)
- Created `useAuth.js` composable for session management across app
- Implemented role-based route guards and redirects
- Added logout functionality to navbar
- Updated page greetings to use session name dynamically
- Seeded test credentials (admin@spotly.com, staff@spotly.com, client@spotly.com)

**Seed Credentials:**
| Email | Password | Role |
|-------|----------|------|
| admin@spotly.com | admin123 | admin |
| staff@spotly.com | staff123 | staff |
| client@spotly.com | client123 | client |

### Phase 12 — Per-Environment Menus (In Progress)

Menu item scoping to specific environments.

**Routes handled:**

- `/menu/[tableId]` → Dynamic menu display (reads environment context)

**Key contributions:**

- Added `environmentId` field to MenuItem class
- Implemented venue-wide vs. environment-specific menu filtering
- Updated menu/menu editor to support environment scope selector
- Backward-compatible (existing items default to all environments)

---

## 👤 Eya — Booking Flow & Media Management

**Primary Focus:** End-to-end reservation journey and venue imagery

### Phase 7 — Venue Discovery & Booking Flow (CRITICAL)

The complete user booking experience.

**Routes handled:**

- `/home` → Venue discovery with search/filters
- `/venue/[id]` → Individual venue detail page
- `/booking/environment` → Environment selection
- `/booking/seats` → Seat/table selection
- `/booking/confirm` → Reservation confirmation
- `/booking/awaiting` → Real-time reservation status tracking

**Key contributions:**

- Wired home page to real VENUE_LIST data
- Implemented dynamic venue details from database
- Fixed navigation between booking steps
- Corrected date format (ISO strings instead of display text)
- Added cart validation (prevents empty reservations)
- Implemented real-time status updates via storage event listener
- Added cancel button for pending reservations
- Hid demo controls behind dev flag

### Phase 9.5 — Gallery & Image Upload

Photo management for venue presentations.

**Routes handled:**

- `/admin/venue-settings` → Upload section (Section 5 Gallery)
- `/venue/[id]` → Hero slideshow display

**Key contributions:**

- Created `uploadImage.js` utility with Cloudinary integration
- Added image upload UI to venue settings (per-slide upload buttons)
- Implemented loading states and error handling
- Integrated uploaded images into hero slideshow
- Added fallback gradient display when images are missing
- Documented `.env.local` setup in CLAUDE.md

---

## 👤 Youssef — Admin Features & Venue Management

**Primary Focus:** Staff operations, venue configuration, and admin tooling

### Phase 8 — Staff Page Full Redesign & Menu

Real-time table status and staff operations.

**Routes handled:**

- `/staff/dashboard` → Staff floor map and operations center
- `/menu/[tableId]` → Menu display from floor

**Key contributions:**

- Created `useFloorTables.js` composable for table UI data
- Built `VenueFloorMap.vue` component with live table status display
- Completely rewrote staff dashboard with:
  - Date & environment selector
  - Live floor map with table statuses
  - Reservation list with search/filters
  - Table click handlers for check-in/check-out
  - ReservationLog tracking for staff actions
  - Staff notes persistence
- Cleaned up floor plan design (removed dead code)
- Fixed menu page to use real MENU_ITEM_LIST
- Aligned category keys to canonical names (starters/mains/desserts/drinks)
- Fixed venue label computation in menu navbar

### Phase 9 — Venue Settings & Configuration

Venue data persistence and infrastructure.

**Routes handled:**

- `/admin/venue-settings` → Venue configuration panel
- `/admin/floor-plan` → Floor plan builder
- `/404` (catch-all) → Not found page

**Key contributions:**

- Extended Venue class with: tagline, location, venueType, hours, slides
- Added all fields to venue-settings form persistence
- Fixed crash when VENUE_LIST is empty
- Fixed hardcoded environment ID in floor plan
- Completed ReservationLog CRUD (updateReservationLog, deleteReservationLog)
- Created branded 404 page with "Go Home" button
- Seeded current-date reservations (replaces old Feb dates)
- Added error handling for corrupted localStorage data

---

## 📊 Feature Ownership Summary

| Phase               | Lead    | Features                                   | Status      |
| ------------------- | ------- | ------------------------------------------ | ----------- |
| 6 — Auth & Session  | Lina    | Credentials, session, route guards, logout | ✅ Complete |
| 7 — Booking Flow    | Eya     | Venue search → seats → confirm → awaiting  | ✅ Complete |
| 8 — Staff Dashboard | Youssef | Floor map, table ops, check-in/out         | ✅ Complete |
| 9 — Venue Settings  | Youssef | Persistence, hours, slides, 404            | ✅ Complete |
| 9.5 — Image Upload  | Eya     | Cloudinary integration, gallery            | ✅ Complete |
| 10 — Dashboards     | Cyrine  | Admin/client polish, filters, tier logic   | ✅ Complete |
| 11 — Landing        | Cyrine  | Public landing, navigation, onboarding     | ✅ Complete |
| 12 — Menu Scoping   | Lina    | Per-environment menus (in progress)        | 🔄 Active   |

---

## 🚀 Getting Started

To test locally:

```bash
npm install
npm run dev
```

Test with these credentials:

- **Admin:** admin@spotly.com / admin123
- **Staff:** staff@spotly.com / staff123
- **Client:** client@spotly.com / client123

For image uploads (Phase 9.5), ensure `.env.local` exists in the project root:

```
VITE_CLOUDINARY_CLOUD_NAME=dwgzoyuyq
VITE_CLOUDINARY_UPLOAD_PRESET=spotly_uploads
```
