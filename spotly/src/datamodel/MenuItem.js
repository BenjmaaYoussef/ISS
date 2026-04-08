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
const _seed = [
  new MenuItem({ id: 1, venueId: 1, category: 'starters', name: 'Truffle Fries', price: 18.0, tags: ['Vegetarian'], allergens: [] }),
  new MenuItem({ id: 2, venueId: 1, category: 'starters', name: 'Caesar Salad', price: 15.0, tags: [], allergens: ['Dairy', 'Eggs'] }),
  new MenuItem({ id: 3, venueId: 1, category: 'mains', name: 'Grilled Salmon', price: 35.0, tags: ['Chef Special'], allergens: ['Fish'] }),
  new MenuItem({ id: 4, venueId: 1, category: 'mains', name: 'Beef Wellington', price: 42.0, tags: ['Popular'], allergens: ['Gluten'] }),
  new MenuItem({ id: 5, venueId: 1, category: 'drinks', name: 'Signature Spritz', price: 16.0, tags: ['Signature'], allergens: [] }),
  new MenuItem({ id: 6, venueId: 1, category: 'drinks', name: 'Gold Rush', price: 18.0, tags: ['Popular'], allergens: [] }),
  new MenuItem({ id: 7, venueId: 1, category: 'drinks', name: 'Virgin Sunrise', price: 12.0, tags: ['Non-Alcoholic'], allergens: [] }),
  new MenuItem({ id: 8, venueId: 1, category: 'desserts', name: 'Crème Brûlée', price: 14.0, tags: ['Classic'], allergens: ['Dairy', 'Eggs'] }),
  new MenuItem({ id: 9, venueId: 1, category: 'desserts', name: 'Chocolate Fondant', price: 16.0, tags: ["Chef's Pick"], allergens: ['Dairy', 'Gluten'] }),
]
const _saved = localStorage.getItem(STORAGE_KEY)
let _initial = _seed
try { if (_saved) _initial = JSON.parse(_saved).map(m => new MenuItem(m)) } catch { _initial = _seed }
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
