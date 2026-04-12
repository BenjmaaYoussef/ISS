import { reactive, watch } from 'vue'

export class ReservationLog {
  constructor ({ id, reservationId, previousStatus, newStatus, timestamp, actorRole }) {
    this.id = id
    this.reservationId = reservationId
    this.previousStatus = previousStatus
    this.newStatus = newStatus
    this.timestamp = timestamp
    this.actorRole = actorRole
  }
}

const STORAGE_KEY = 'spotly_reservation_logs'
const _saved = localStorage.getItem(STORAGE_KEY)
let _initial = []
try {
  if (_saved) {
    _initial = JSON.parse(_saved).map(l => new ReservationLog(l))
  }
} catch {
  _initial = []
}
export const RESERVATION_LOG_LIST = reactive(_initial)

watch(RESERVATION_LOG_LIST, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) {
    return
  }
  try {
    RESERVATION_LOG_LIST.splice(0, RESERVATION_LOG_LIST.length, ...JSON.parse(e.newValue).map(l => new ReservationLog(l)))
  } catch { /* ignore corrupted cross-tab data */ }
})

/* ================= CREATE ================= */

export function addReservationLog (log) {
  RESERVATION_LOG_LIST.push(log)
}

/* ================= READ ================= */

export function getAllReservationLogs () {
  return RESERVATION_LOG_LIST
}

export function getLogsByReservation (reservationId) {
  return RESERVATION_LOG_LIST.filter(l => l.reservationId === reservationId)
}

/* ================= UPDATE ================= */

export function updateReservationLog (id, changes) {
  const log = RESERVATION_LOG_LIST.find(l => l.id === id)
  if (!log) {
    return null
  }
  Object.assign(log, changes)
  return log
}

/* ================= DELETE ================= */

export function deleteReservationLog (id) {
  const index = RESERVATION_LOG_LIST.findIndex(l => l.id === id)
  if (index === -1) {
    return false
  }
  RESERVATION_LOG_LIST.splice(index, 1)
  return true
}
