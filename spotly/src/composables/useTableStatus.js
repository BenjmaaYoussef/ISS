/**
 * Centralised status helpers shared by reservation, staff-floor, and client views.
 *
 * Reservation statuses : Pending | Approved | Rejected | Cancelled
 * Floor-plan statuses  : free | occupied | reserved | call
 */

/** Human-readable label */
export const statusLabel = (status) =>
  ({
    // Reservation
    Pending: "Pending",
    Approved: "Approved",
    Rejected: "Rejected",
    Cancelled: "Cancelled",
    // Floor
    free: "Free",
    occupied: "Occupied",
    reserved: "Reserved",
    call: "Call Waiter",
  })[status] ?? status;

/** MDI icon name */
export const statusIcon = (status) =>
  ({
    Pending: "mdi-clock-outline",
    Approved: "mdi-check-circle-outline",
    Rejected: "mdi-close-circle-outline",
    Cancelled: "mdi-cancel",
    free: "mdi-circle-outline",
    occupied: "mdi-account",
    reserved: "mdi-bookmark-outline",
    call: "mdi-room-service",
  })[status] ?? "mdi-circle";

/**
 * Vuetify theme color name for v-chip color prop.
 * Returns undefined for statuses that should use default/muted styling.
 */
export const statusVuetifyColor = (status) =>
  ({
    Pending: "error", // rose
    Approved: "secondary", // green
    occupied: "primary", // gold
    reserved: "error", // rose
    call: "error", // rose (urgent)
  })[status] ?? undefined;

/**
 * Raw hex color for inline use (badges, dots, non-chip elements).
 */
export const statusHexColor = (status) =>
  ({
    Pending: "#C71585",
    Approved: "#2EBB57",
    Rejected: "#666666",
    Cancelled: "#555555",
    free: "#6b7a8d",
    occupied: "#D4AF37",
    reserved: "#C71585",
    call: "#C71585",
  })[status] ?? "#6b7a8d";

/**
 * Composable wrapper — import this in components for reactive helpers.
 */
export function useTableStatus() {
  return { statusLabel, statusIcon, statusVuetifyColor, statusHexColor };
}
