import { reactive, watch } from 'vue'

export class Reservation {
  constructor ({ id, venueId = 1, environmentId = '', elementId = '', userId = '', name, email = '', phone = '', date, time, guests, notes = '', status }) {
    this.id = id
    this.venueId = venueId
    this.environmentId = environmentId
    this.elementId = elementId
    this.userId = userId
    this.name = name
    this.email = email
    this.phone = phone
    this.date = date
    this.time = time
    this.guests = guests
    this.notes = notes
    this.status = status
  }
}

const STORAGE_KEY = 'spotly_reservations'
const _saved = localStorage.getItem(STORAGE_KEY)
let _initial = []
try {
  if (_saved) {
    _initial = JSON.parse(_saved).map(r => new Reservation(r))
  }
} catch {
  _initial = []
}
export const RESERVATION_LIST = reactive(_initial)

watch(RESERVATION_LIST, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) {
    return
  }
  try {
    RESERVATION_LIST.splice(0, RESERVATION_LIST.length, ...JSON.parse(e.newValue).map(r => new Reservation(r)))
  } catch { /* ignore corrupted cross-tab data */ }
})

/* ================= CREATE ================= */

export function addReservation (reservation) {
  RESERVATION_LIST.push(reservation)
}

/* ================= READ ================= */

export function getAllReservations () {
  return RESERVATION_LIST
}

export function getReservationById (id) {
  return RESERVATION_LIST.find(r => r.id === id)
}

export function getReservationsByVenue (venueId) {
  return RESERVATION_LIST.filter(r => r.venueId === venueId)
}

export function getReservationsByUser (userId) {
  return RESERVATION_LIST.filter(r => r.userId === userId)
}

export function getReservationsByElement (environmentId, elementId) {
  return RESERVATION_LIST.filter(r => r.environmentId === environmentId && r.elementId === elementId)
}

/* ================= UPDATE ================= */

export function updateReservationStatus (id, status) {
  const res = getReservationById(id)
  if (!res) {
    return null
  }
  res.status = status
  return res
}

export function updateReservation (id, newData) {
  const res = getReservationById(id)
  if (!res) {
    return null
  }
  Object.assign(res, newData)
  return res
}

/* ================= DELETE ================= */

export function deleteReservation (id) {
  const index = RESERVATION_LIST.findIndex(r => r.id === id)
  if (index === -1) {
    return false
  }
  RESERVATION_LIST.splice(index, 1)
  return true
}
