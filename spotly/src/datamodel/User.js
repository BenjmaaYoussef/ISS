import { reactive, watch } from 'vue'

export class User {
  constructor({ first_name, last_name, email, password, role = 'client' }) {
    this.first_name = first_name
    this.last_name = last_name
    this.email = email
    this.password = password
    this.role = role
  }
}

const STORAGE_KEY = 'spotly_users'
const _seed = [
  new User({ first_name: 'Admin', last_name: 'User', email: 'admin@spotly.com', password: 'admin123', role: 'admin' }),
  new User({ first_name: 'Staff', last_name: 'User', email: 'staff@spotly.com', password: 'staff123', role: 'staff' }),
  new User({ first_name: 'John', last_name: 'Doe', email: 'client@spotly.com', password: 'client123', role: 'client' }),
  new User({ first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', password: 'password456', role: 'client' }),
  new User({ first_name: 'Alice', last_name: 'Johnson', email: 'alice.johnson@example.com', password: 'password789', role: 'client' }),
]
const _saved = localStorage.getItem(STORAGE_KEY)
// Migrate existing saved users: ensure all have a role field
const _parsed = _saved ? JSON.parse(_saved).map(u => new User({ role: 'client', ...u })) : _seed
// Ensure seed admin/staff accounts always exist (add if missing)
const _emails = _parsed.map(u => u.email)
for (const seedUser of _seed.slice(0, 2)) {
  if (!_emails.includes(seedUser.email)) _parsed.push(seedUser)
}
export const USER_LIST = reactive(_parsed)

watch(USER_LIST, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  USER_LIST.splice(0, USER_LIST.length, ...JSON.parse(e.newValue).map(u => new User(u)))
})

/* ================= CREATE ================= */

export function addUser(user) {
  USER_LIST.push(user)
}

/* ================= READ ================= */

export function getAllUsers() {
  return USER_LIST
}

export function getUserByEmail(email) {
  return USER_LIST.find(user => user.email === email)
}

export function getUserByEmailAndPassword(email, password) {
  return USER_LIST.find(user => user.email === email && user.password === password)
}

/* ================= UPDATE ================= */

export function updateUserByEmail(email, newData) {
  const user = getUserByEmail(email)
  if (!user) return null
  if (newData.first_name !== undefined) user.first_name = newData.first_name
  if (newData.last_name !== undefined) user.last_name = newData.last_name
  if (newData.password !== undefined) user.password = newData.password
  if (newData.role !== undefined) user.role = newData.role
  return user
}

/* ================= DELETE ================= */

export function deleteUserByEmail(email) {
  const index = USER_LIST.findIndex(user => user.email === email)
  if (index === -1) return false
  USER_LIST.splice(index, 1)
  return true
}

/* ================= EXTRA ================= */

export function userExists(email) {
  return USER_LIST.some(user => user.email === email)
}
