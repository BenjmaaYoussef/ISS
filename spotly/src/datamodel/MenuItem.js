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
]
const _saved = localStorage.getItem(STORAGE_KEY)
export const MENU_ITEM_LIST = reactive(_saved ? JSON.parse(_saved).map(m => new MenuItem(m)) : _seed)

watch(MENU_ITEM_LIST, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  MENU_ITEM_LIST.splice(0, MENU_ITEM_LIST.length, ...JSON.parse(e.newValue).map(m => new MenuItem(m)))
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
