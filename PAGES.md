# Spotly — Page Registry & Build Status

> Single source of truth for all pages, dialogs, and routes.
> Update status as each page is completed.

---

## Status Legend

| Badge          | Meaning                         |
| -------------- | ------------------------------- |
| ✅ Done        | Page fully built and integrated |
| 🚧 In Progress | Currently being developed       |
| ⬜ Pending     | Not yet started                 |

---

## Design System (apply to every page)

| Token             | Value                                       |
| ----------------- | ------------------------------------------- |
| Background        | `#0A0E14`                                   |
| Surface           | `#13181F`                                   |
| Gold / Primary    | `#D4AF37`                                   |
| Green / Available | `#2EBB57`                                   |
| Rose / Reserved   | `#C71585`                                   |
| Heading font      | Playfair Display                            |
| Body / UI font    | Inter                                       |
| Primary button    | `v-btn` flat `color="primary"`              |
| Secondary button  | `v-btn` outlined, class `btn-outlined-gold` |
| Vuetify theme     | `spotlyTheme` (dark)                        |

---

## Existing Pages

### Public

| ID  | Route        | Page Name                                    | Role   | Status  |
| --- | ------------ | -------------------------------------------- | ------ | ------- |
| P1  | `/`          | Project Dev Portal / Page Index              | Public | ✅ Done |
| P2  | `/auth`      | Global Authentication (Login / Register)     | All    | ✅ Done |
| P3  | `/venue/:id` | Venue Landing Page (Public Business Profile) | Client | ✅ Done |

---

### Booking Flow (Client)

| ID  | Route                  | Page Name                                 | Role   | Status  |
| --- | ---------------------- | ----------------------------------------- | ------ | ------- |
| P4  | `/booking/environment` | Environment Selection — Step 1            | Client | ✅ Done |
| P5  | `/booking/seats`       | Visual Seat Selection — Step 2            | Client | ✅ Done |
| P6  | `/booking/confirm`     | Reservation Confirmation & Notes — Step 3 | Client | ✅ Done |
| P19 | `/booking/awaiting`    | Reservation Awaiting Screen — Post-Submit | Client | ✅ Done |

---

### Client Area

| ID  | Route               | Page Name                                     | Role   | Status     |
| --- | ------------------- | --------------------------------------------- | ------ | ---------- |
| P13 | `/client/dashboard` | Client Dashboard (My Bookings & History)      | Client | ✅ Done    |
| P15 | `/menu/:tableId`    | Environment-Aware Digital Menu (QR Scan View) | Client | ✅ Done    |
| P17 | `/profile/edit`     | User Profile Editor                           | All    | ⬜ Pending |

---

### Admin Area

| ID      | Route                   | Page Name                      | Role          | Status     |
| ------- | ----------------------- | ------------------------------ | ------------- | ---------- |
| P_Admin | `/admin/dashboard`      | Admin Dashboard Hub            | Admin         | ✅ Done    |
| P10     | `/admin/floor-plan`     | Environment Floor Plan Builder | Admin         | ✅ Done    |
| P11     | `/admin/menu`           | High-End Menu Manager          | Admin         | ✅ Done    |
| P12     | `/admin/reservations`   | Reservation Approval Queue     | Admin         | ✅ Done    |
| P16     | `/admin/venue-settings` | Venue Identity Studio          | Admin         | ⬜ Pending |
| P18     | `/admin/live`           | Live Venue Command Center      | Admin / Staff | ⬜ Pending |

---

### Staff Area

| ID  | Route              | Page Name                  | Role  | Status  |
| --- | ------------------ | -------------------------- | ----- | ------- |
| P14 | `/staff/dashboard` | Staff Operations Dashboard | Staff | ✅ Done |

---

### Dialogs / Modals

| ID  | Location                       | Dialog Name                        | Role  | Status  |
| --- | ------------------------------ | ---------------------------------- | ----- | ------- |
| D1  | `modals/delete-constraint.vue` | Delete Constraint Warning          | Admin | ✅ Done |
| D2  | `modals/guest-check-in.vue`    | Guest Check-In & Operational Notes | Staff | ✅ Done |

---

## New Pages — To Build

### P16 — Venue Identity Studio

- **Route:** `/admin/venue-settings`
- **Role:** Admin
- **Description:** The admin defines the venue's complete public identity — name, origin story, ambience tags, dress code, gallery order, mood descriptors, languages, opening hours per environment. A live split-screen preview panel on the right updates in real time as the admin types, showing exactly how the venue card looks to a client.
- **Key interactions:** Real-time preview sync, image gallery reordering, per-environment hour overrides.
- **Status:** ⬜ Pending

---

### P17 — User Profile Editor

- **Route:** `/profile/edit`
- **Role:** All roles
- **Description:** The guest manages personal details — name, avatar, preferred language, allergy flags, and dietary preferences. Allergy flags set here automatically surface as warnings when staff view that guest's reservation, creating a seamless safety thread from profile to floor.
- **Key interactions:** Avatar upload (base64 LocalStorage), allergy multi-select, save confirmation with snackbar.
- **Status:** ⬜ Pending

---

### P18 — Live Venue Command Center

- **Route:** `/admin/live`
- **Role:** Admin / Staff
- **Description:** A full-screen cinematic operations view — the entire floor plan fills the viewport with tables breathing via live color state animations (green = available, rose = occupied, gold = waiter call). A real-time reservation ticker runs alongside. When a "Call Waiter" fires via the `storage` event, the corresponding table pulses with a gold ripple animation visible across the room.
- **Key interactions:** Cross-tab `storage` event reactivity, live floor plan render (read-only), waiter call pulse animation, reservation ticker.
- **Status:** ⬜ Pending

---

### P19 — Reservation Awaiting Screen

- **Route:** `/booking/awaiting`
- **Role:** Client
- **Description:** Appears immediately after submitting a reservation. The venue's ambience gradient fills the background and an animated timeline — _Submitted → Under Review → Decision_ — pulses live. The moment the admin approves or rejects from their tab, the `storage` event fires and the timeline animates forward on the client's screen without a refresh — gold glow for approval, a graceful decline card for rejection.
- **Key interactions:** Cross-tab `storage` event listener, animated state machine timeline, auto-redirect to P13 on decision.
- **Status:** ✅ Done

---

## Build Order (Recommended)

1. ~~**P19** — Awaiting Screen~~ ✅ Built
2. **P16** — Venue Identity Studio _(high visual payoff, admin side)_
3. **P18** — Live Command Center _(the showstopper demo page)_
4. **P17** — User Profile _(supporting feature, ties into allergy/staff flow)_
