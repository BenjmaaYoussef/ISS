import { reactive, watch } from 'vue'

export class ReservationLog {
  constructor({ id, reservationId, previousStatus, newStatus, timestamp, actorRole }) {
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
export const RESERVATION_LOG_LIST = reactive(_saved ? JSON.parse(_saved).map(l => new ReservationLog(l)) : [])

watch(RESERVATION_LOG_LIST, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  RESERVATION_LOG_LIST.splice(0, RESERVATION_LOG_LIST.length, ...JSON.parse(e.newValue).map(l => new ReservationLog(l)))
})

/* ================= CREATE ================= */

export function addReservationLog(log) {
  RESERVATION_LOG_LIST.push(log)
}

/* ================= READ ================= */

export function getAllReservationLogs() {
  return RESERVATION_LOG_LIST
}

export function getLogsByReservation(reservationId) {
  return RESERVATION_LOG_LIST.filter(l => l.reservationId === reservationId)
}
