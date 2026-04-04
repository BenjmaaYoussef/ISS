# Spotly — Demo Guide

**Dev server:** `npm run dev` → http://localhost:3000

---

## Pages Reference

| URL                              | Page                                  |
| -------------------------------- | ------------------------------------- |
| `/`                              | Landing / splash                      |
| `/home`                          | Venue discovery (browse venues)       |
| `/venue/1`                       | Venue detail page                     |
| `/auth`                          | Login / register                      |
| `/booking/environment?venueId=1` | Booking step 1 — pick environment     |
| `/booking/seats`                 | Booking step 2 — pick a seat          |
| `/booking/confirm`               | Booking step 3 — fill in details      |
| `/booking/awaiting`              | Booking step 4 — waiting for approval |
| `/client/dashboard`              | Client — my reservations              |
| `/staff/dashboard`               | Staff — today's floor + check-in      |
| `/admin/dashboard`               | Admin — KPIs overview                 |
| `/admin/reservations`            | Admin — approve / reject reservations |
| `/admin/menu`                    | Admin — manage menu items             |
| `/admin/floor-plan`              | Admin — edit floor layout             |
| `/admin/venue-settings`          | Admin — edit venue info               |

---

## Demo Scenarios

### Scenario 1 — Complete a Booking (end-to-end)

> Shows: booking flow creates a real record in localStorage.

1. Go to `/booking/environment?venueId=1` — two environments appear (Indoor, Terrace)
2. Click one → goes to `/booking/seats` — seats are shown with live availability
3. Click a free seat → goes to `/booking/confirm` — fill in name, email, date, time, guests → **Confirm**
4. Open **DevTools → Application → localStorage → `spotly_reservations`** — the new record is there with `status: REQUESTED`

---

### Scenario 2 — Admin Approves a Reservation

> Shows: status change persists and is logged.

1. Go to `/admin/reservations` — pending reservations are listed
2. Click **Approve** on any pending row
3. Check **`spotly_reservations`** in DevTools — status is now `APPROVED`
4. Check **`spotly_reservation_logs`** — a log entry exists with `actorRole: admin`

---

### Scenario 3 — Cross-tab Reactivity

> Shows: the `storage` event syncs state between tabs without a page reload.

1. Open `/booking/awaiting?id=102` in **Tab A** (status shows "Pending")
2. Open `/admin/reservations` in **Tab B**
3. In Tab B, approve reservation 102
4. Switch back to **Tab A** — status updates to "Confirmed" automatically (no reload)

---

### Scenario 4 — Persistence Across Reload

> Shows: localStorage survives a hard refresh.

1. Go to `/admin/menu` — note the current items
2. Click **Add Item**, fill in the form, save
3. **Hard refresh** (Cmd+Shift+R / Ctrl+Shift+R)
4. The new item is still there

---

### Scenario 5 — Floor Plan Save

> Shows: layout changes persist.

1. Go to `/admin/floor-plan`
2. Select an environment, rename a table label, move a table
3. Click **Save Layout**
4. Reload — positions and labels are preserved

---

### Scenario 6 — Delete Constraint

> Shows: business rule enforcement using live reservation data.

1. Go to `/admin/floor-plan`
2. Try to delete a table that has an active reservation (e.g. table E1 or E3 in Indoor)
3. A warning dialog blocks the deletion and lists the conflicting reservation

---

### Scenario 7 — Staff Check-in

> Shows: staff can update reservation status from the floor view.

1. Go to `/staff/dashboard`
2. Find a reservation with status "Confirmed" — click **Check In**
3. Confirm in the dialog
4. Check **`spotly_reservations`** in DevTools — status is now `CHECKED_IN`
5. A log entry with `actorRole: staff` is in `spotly_reservation_logs`

---

### Scenario 8 — Client Dashboard Filters by User

> Shows: reservations are scoped to the logged-in user.

1. Open DevTools console and run:
   ```js
   localStorage.setItem(
     "spotly_session",
     JSON.stringify({
       userId: "john.doe@example.com",
       email: "john.doe@example.com",
       role: "client",
     }),
   );
   ```
2. Go to `/client/dashboard` — only reservations for that user are shown
3. Cancel one — status flips to `CANCELLED` and a log entry is written

---

## Quick DevTools Checks

Open **DevTools → Application → Local Storage → http://localhost:3000**

| Key to inspect            | What to verify                                         |
| ------------------------- | ------------------------------------------------------ |
| `spotly_reservations`     | New bookings appear, statuses update                   |
| `spotly_reservation_logs` | Every status change is logged with actor and timestamp |
| `spotly_menu_items`       | Add/edit/delete actions persist                        |
| `spotly_environments`     | Floor plan saves persist                               |
| `spotly_venues`           | Venue settings edits persist                           |
| `spotly_session`          | Currently logged-in user identity                      |
