import { reactive, watch } from 'vue'

export class Reservation {
  constructor({ id, venueId = 1, environmentId = '', elementId = '', userId = '', name, email = '', phone = '', date, time, guests, notes = '', status }) {
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
const _today = new Date().toISOString().split('T')[0]
const _seed = [
  new Reservation({ id: 102, venueId: 1, environmentId: 'env_indoor', elementId: 'e6', name: 'John Doe', date: '2026-02-15', time: '19:00', guests: 5, notes: 'Allergy: nuts', status: 'REQUESTED' }),
  new Reservation({ id: 105, venueId: 1, environmentId: 'env_indoor', elementId: 'e1', name: 'Sarah Smith', date: '2026-02-16', time: '20:00', guests: 4, notes: '', status: 'REQUESTED' }),
  new Reservation({ id: 108, venueId: 1, environmentId: 'env_indoor', elementId: 'e3', name: 'Marcus Lee', date: '2026-02-17', time: '18:30', guests: 2, notes: 'Anniversary', status: 'APPROVED' }),
  new Reservation({ id: 111, venueId: 1, environmentId: 'env_indoor', elementId: 'e8', name: 'Layla Hassan', date: '2026-02-17', time: '21:00', guests: 6, notes: 'Corporate event', status: 'REQUESTED' }),
  new Reservation({ id: 114, venueId: 1, environmentId: 'env_terrace', elementId: 'et1', name: 'Tom Rivera', date: '2026-02-18', time: '19:30', guests: 3, notes: '', status: 'REJECTED' }),
  // Today's reservations — keeps staff floor non-empty on first run
  new Reservation({ id: 201, venueId: 1, environmentId: 'env_indoor', elementId: 'e1', name: 'Alex Morgan', date: _today, time: '19:00', guests: 3, notes: 'Birthday dinner', status: 'REQUESTED' }),
  new Reservation({ id: 202, venueId: 1, environmentId: 'env_indoor', elementId: 'e6', name: 'Priya Patel', date: _today, time: '20:00', guests: 7, notes: '', status: 'APPROVED' }),
  new Reservation({ id: 203, venueId: 1, environmentId: 'env_terrace', elementId: 'et2', name: 'James Wilson', date: _today, time: '18:30', guests: 4, notes: 'Window seat please', status: 'CHECKED_IN' }),
]
const _saved = localStorage.getItem(STORAGE_KEY)
export const RESERVATION_LIST = reactive(_saved ? JSON.parse(_saved).map(r => new Reservation(r)) : _seed)
if (!_saved) localStorage.setItem(STORAGE_KEY, JSON.stringify(_seed))

watch(RESERVATION_LIST, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  RESERVATION_LIST.splice(0, RESERVATION_LIST.length, ...JSON.parse(e.newValue).map(r => new Reservation(r)))
})

/* ================= CREATE ================= */

export function addReservation(reservation) {
  RESERVATION_LIST.push(reservation)
}

/* ================= READ ================= */

export function getAllReservations() {
  return RESERVATION_LIST
}

export function getReservationById(id) {
  return RESERVATION_LIST.find(r => r.id === id)
}

export function getReservationsByVenue(venueId) {
  return RESERVATION_LIST.filter(r => r.venueId === venueId)
}

export function getReservationsByUser(userId) {
  return RESERVATION_LIST.filter(r => r.userId === userId)
}

export function getReservationsByElement(environmentId, elementId) {
  return RESERVATION_LIST.filter(r => r.environmentId === environmentId && r.elementId === elementId)
}

/* ================= UPDATE ================= */

export function updateReservationStatus(id, status) {
  const res = getReservationById(id)
  if (!res) return null
  res.status = status
  return res
}

export function updateReservation(id, newData) {
  const res = getReservationById(id)
  if (!res) return null
  Object.assign(res, newData)
  return res
}

/* ================= DELETE ================= */

export function deleteReservation(id) {
  const index = RESERVATION_LIST.findIndex(r => r.id === id)
  if (index === -1) return false
  RESERVATION_LIST.splice(index, 1)
  return true
}
