/**
 * Centralised status helpers shared by reservation, staff-floor, and client views.
 *
 * Reservation statuses : Pending | Approved | Rejected | Cancelled
 * Floor-plan statuses  : free | occupied | reserved | call
 */

/** Human-readable label */
export function statusLabel (status) {
  return ({
    // Canonical datamodel statuses
    REQUESTED: 'Pending',
    APPROVED: 'Confirmed',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
    CHECKED_IN: 'Checked In',
    COMPLETED: 'Completed',
    NO_SHOW: 'No Show',
    // Floor-plan statuses
    free: 'Free',
    occupied: 'Occupied',
    reserved: 'Reserved',
    call: 'Call Waiter',
  })[status] ?? status
}

/** MDI icon name */
export function statusIcon (status) {
  return ({
    // Canonical
    REQUESTED: 'mdi-clock-outline',
    APPROVED: 'mdi-check-circle-outline',
    REJECTED: 'mdi-close-circle-outline',
    CANCELLED: 'mdi-cancel',
    CHECKED_IN: 'mdi-login',
    COMPLETED: 'mdi-flag-checkered',
    NO_SHOW: 'mdi-account-off-outline',
    // Floor
    free: 'mdi-circle-outline',
    occupied: 'mdi-account',
    reserved: 'mdi-bookmark-outline',
    call: 'mdi-room-service',
  })[status] ?? 'mdi-circle'
}

/**
 * Vuetify theme color name for v-chip color prop.
 * Returns undefined for statuses that should use default/muted styling.
 */
export function statusVuetifyColor (status) {
  return ({
    REQUESTED: 'error',
    APPROVED: 'secondary',
    CHECKED_IN: 'secondary',
    // Floor
    occupied: 'primary',
    reserved: 'error',
    call: 'error',
  })[status] ?? undefined
}

/**
 * Raw hex color for inline use (badges, dots, non-chip elements).
 */
export function statusHexColor (status) {
  return ({
    REQUESTED: '#C71585',
    APPROVED: '#2EBB57',
    REJECTED: '#666666',
    CANCELLED: '#555555',
    CHECKED_IN: '#2EBB57',
    COMPLETED: '#888888',
    NO_SHOW: '#555555',
    // Floor
    free: '#6b7a8d',
    occupied: '#D4AF37',
    reserved: '#C71585',
    call: '#C71585',
  })[status] ?? '#6b7a8d'
}

/**
 * Composable wrapper — import this in components for reactive helpers.
 */
export function useTableStatus () {
  return { statusLabel, statusIcon, statusVuetifyColor, statusHexColor }
}
