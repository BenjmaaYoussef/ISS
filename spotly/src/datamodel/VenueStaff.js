import { reactive, watch } from 'vue'

export class VenueStaff {
  constructor({ id, venueId, userEmail }) {
    this.id = id
    this.venueId = venueId
    this.userEmail = userEmail
  }
}

const STORAGE_KEY = 'spotly_venue_staff'
const _saved = localStorage.getItem(STORAGE_KEY)
let _initial = []
try { if (_saved) _initial = JSON.parse(_saved).map(r => new VenueStaff(r)) } catch { _initial = [] }
export const VENUE_STAFF_LIST = reactive(_initial)

watch(VENUE_STAFF_LIST, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  try { VENUE_STAFF_LIST.splice(0, VENUE_STAFF_LIST.length, ...JSON.parse(e.newValue).map(r => new VenueStaff(r))) } catch { /* ignore */ }
})

export function addVenueStaff(record) {
  if (VENUE_STAFF_LIST.some(r => r.userEmail === record.userEmail)) return false
  VENUE_STAFF_LIST.push(record)
  return true
}

export function removeVenueStaff(id) {
  const idx = VENUE_STAFF_LIST.findIndex(r => r.id === id)
  if (idx !== -1) VENUE_STAFF_LIST.splice(idx, 1)
}

export function getStaffByVenue(venueId) {
  return VENUE_STAFF_LIST.filter(r => r.venueId === venueId)
}

export function getVenuesByStaff(userEmail) {
  return VENUE_STAFF_LIST.filter(r => r.userEmail === userEmail)
}

export function isVenueStaff(userEmail) {
  return VENUE_STAFF_LIST.some(r => r.userEmail === userEmail)
}
