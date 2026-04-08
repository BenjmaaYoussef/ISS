import { reactive, watch } from 'vue'

export class MenuItem {
  constructor({ id, venueId = 1, category, name, price, desc = '', tags = [], allergens = [], available = true }) {
    this.id = id
    this.venueId = venueId
    this.category = category
    this.name = name
    this.price = price
    this.desc = desc
    this.tags = tags
    this.allergens = allergens
    this.available = available
  }
}

const STORAGE_KEY = 'spotly_menu_items'
const _saved = localStorage.getItem(STORAGE_KEY)
let _initial = []
try { if (_saved) _initial = JSON.parse(_saved).map(m => new MenuItem(m)) } catch { _initial = [] }
export const MENU_ITEM_LIST = reactive(_initial)

watch(MENU_ITEM_LIST, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  try { MENU_ITEM_LIST.splice(0, MENU_ITEM_LIST.length, ...JSON.parse(e.newValue).map(m => new MenuItem(m))) } catch { /* ignore corrupted cross-tab data */ }
})

/* ================= CREATE ================= */

export function addMenuItem(item) {
  MENU_ITEM_LIST.push(item)
}

/* ================= READ ================= */

export function getAllMenuItems() {
  return MENU_ITEM_LIST
}

export function getMenuItemById(id) {
  return MENU_ITEM_LIST.find(m => m.id === id)
}

export function getMenuItemsByVenue(venueId) {
  return MENU_ITEM_LIST.filter(m => m.venueId === venueId)
}

export function getMenuItemsByCategory(venueId, category) {
  return MENU_ITEM_LIST.filter(m => m.venueId === venueId && m.category === category)
}

/* ================= UPDATE ================= */

export function updateMenuItem(id, newData) {
  const item = getMenuItemById(id)
  if (!item) return null
  Object.assign(item, newData)
  return item
}

/* ================= DELETE ================= */

export function deleteMenuItem(id) {
  const index = MENU_ITEM_LIST.findIndex(m => m.id === id)
  if (index === -1) return false
  MENU_ITEM_LIST.splice(index, 1)
  return true
}
