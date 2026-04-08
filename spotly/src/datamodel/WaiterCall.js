import { reactive, watch } from 'vue'

export class WaiterCall {
  constructor({ id, venueId, environmentId, elementId, tableLabel, envName, timestamp, status = 'pending' }) {
    this.id = id
    this.venueId = venueId
    this.environmentId = environmentId
    this.elementId = elementId
    this.tableLabel = tableLabel
    this.envName = envName
    this.timestamp = timestamp
    this.status = status
  }
}

const STORAGE_KEY = 'spotly_waiter_calls'
const _saved = localStorage.getItem(STORAGE_KEY)
let _initial = []
try { if (_saved) _initial = JSON.parse(_saved).map(c => new WaiterCall(c)) } catch { _initial = [] }
export const WAITER_CALL_LIST = reactive(_initial)

watch(WAITER_CALL_LIST, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  try { WAITER_CALL_LIST.splice(0, WAITER_CALL_LIST.length, ...JSON.parse(e.newValue).map(c => new WaiterCall(c))) } catch { /* ignore corrupted cross-tab data */ }
})

/* ================= CREATE ================= */

export function addWaiterCall(call) {
  WAITER_CALL_LIST.push(call)
}

/* ================= UPDATE ================= */

export function acknowledgeWaiterCall(id) {
  const call = WAITER_CALL_LIST.find(c => c.id === id)
  if (call) call.status = 'acknowledged'
}

/* ================= READ ================= */

export function getPendingCallsByVenue(venueId) {
  return WAITER_CALL_LIST.filter(c => c.venueId === venueId && c.status === 'pending')
}
