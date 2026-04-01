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
const _seed = [
  new Environment({
    id: 'env_indoor',
    venueId: 1,
    name: 'Indoor Lounge',
    icon: 'mdi-sofa-outline',
    canvas: { width: 1000, height: 660 },
    elements: [
      { id: 'e1', type: 'table_rect_4', shape: 'rect', label: 'Table A1', capacity: 4, x: 100, y: 90, rotation: 0 },
      { id: 'e2', type: 'table_rect_4', shape: 'rect', label: 'Table A2', capacity: 4, x: 240, y: 90, rotation: 0 },
      { id: 'e3', type: 'table_rect_4', shape: 'rect', label: 'Table A3', capacity: 4, x: 100, y: 230, rotation: 0 },
      { id: 'e4', type: 'table_rect_6', shape: 'rect', label: 'Table B1', capacity: 6, x: 80, y: 390, rotation: 0 },
      { id: 'e5', type: 'table_rect_6', shape: 'rect', label: 'Table B2', capacity: 6, x: 270, y: 390, rotation: 0 },
      { id: 'e6', type: 'table_large_8', shape: 'round', label: 'VIP 1', capacity: 8, x: 540, y: 80, rotation: 0 },
      { id: 'e7', type: 'table_round_2', shape: 'round', label: 'VIP 2', capacity: 2, x: 720, y: 80, rotation: 0 },
      { id: 'e8', type: 'table_large_8', shape: 'round', label: 'VIP 3', capacity: 8, x: 540, y: 330, rotation: 0 },
      { id: 'e9', type: 'entrance', label: 'Entrance', capacity: 0, w: 1, h: 1, x: 440, y: 590, rotation: 0 },
      { id: 'e10', type: 'bar_counter', label: 'Bar', capacity: 0, w: 3, h: 1, x: 820, y: 450, rotation: 0 },
      { id: 'e11', type: 'plant', label: 'Plant', capacity: 0, w: 1, h: 1, x: 910, y: 100, rotation: 0 },
    ],
  }),
  new Environment({
    id: 'env_terrace',
    venueId: 1,
    name: 'Outdoor Terrace',
    icon: 'mdi-umbrella-beach-outline',
    canvas: { width: 1000, height: 660 },
    elements: [
      { id: 'et1', type: 'table_rect_4', shape: 'rect', label: 'T1', capacity: 4, x: 120, y: 80, rotation: 0 },
      { id: 'et2', type: 'table_rect_4', shape: 'rect', label: 'T2', capacity: 4, x: 280, y: 80, rotation: 0 },
      { id: 'et3', type: 'table_rect_4', shape: 'rect', label: 'T3', capacity: 4, x: 440, y: 80, rotation: 0 },
      { id: 'et4', type: 'table_rect_6', shape: 'rect', label: 'T4', capacity: 6, x: 120, y: 320, rotation: 0 },
      { id: 'et5', type: 'table_rect_6', shape: 'rect', label: 'T5', capacity: 6, x: 360, y: 320, rotation: 0 },
    ],
  }),
]
const _saved = localStorage.getItem(STORAGE_KEY)
export const ENVIRONMENT_LIST = reactive(
  _saved ? JSON.parse(_saved).map(e => new Environment(e)) : _seed
)

watch(ENVIRONMENT_LIST, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  ENVIRONMENT_LIST.splice(0, ENVIRONMENT_LIST.length, ...JSON.parse(e.newValue).map(e => new Environment(e)))
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
