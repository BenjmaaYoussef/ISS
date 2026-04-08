import { reactive, watch } from 'vue'

export class Environment {
  constructor({ id, venueId = 1, name, desc = '', icon, gradient = '', canvas = { width: 1000, height: 660 }, elements = [] }) {
    this.id = id
    this.venueId = venueId
    this.name = name
    this.desc = desc
    this.icon = icon
    this.gradient = gradient
    this.canvas = canvas
    // Strip computed `status` field — it must not be stored
    this.elements = elements.map(({ status: _s, ...el }) => el)
  }
}

const STORAGE_KEY = 'spotly_environments'
const _saved = localStorage.getItem(STORAGE_KEY)
let _initial = []
try { if (_saved) _initial = JSON.parse(_saved).map(e => new Environment(e)) } catch { _initial = [] }
export const ENVIRONMENT_LIST = reactive(_initial)

watch(ENVIRONMENT_LIST, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  try { ENVIRONMENT_LIST.splice(0, ENVIRONMENT_LIST.length, ...JSON.parse(e.newValue).map(e => new Environment(e))) } catch { /* ignore corrupted cross-tab data */ }
})

/* ================= CREATE ================= */

export function addEnvironment(env) {
  ENVIRONMENT_LIST.push(env)
}

/* ================= READ ================= */

export function getAllEnvironments() {
  return ENVIRONMENT_LIST
}

export function getEnvironmentById(id) {
  return ENVIRONMENT_LIST.find(e => e.id === id)
}

export function getEnvironmentsByVenue(venueId) {
  return ENVIRONMENT_LIST.filter(e => e.venueId === venueId)
}

/* ================= UPDATE ================= */

export function updateEnvironment(id, newData) {
  const env = getEnvironmentById(id)
  if (!env) return null
  Object.assign(env, newData)
  return env
}

/* ================= DELETE ================= */

export function deleteEnvironment(id) {
  const index = ENVIRONMENT_LIST.findIndex(e => e.id === id)
  if (index === -1) return false
  ENVIRONMENT_LIST.splice(index, 1)
  return true
}
