import { reactive, watch } from 'vue'

export class User {
  constructor ({ first_name, last_name, email, password }) {
    this.first_name = first_name
    this.last_name = last_name
    this.email = email
    this.password = password
  }
}

const STORAGE_KEY = 'spotly_users'
const _saved = localStorage.getItem(STORAGE_KEY)
let _initial = []
try {
  if (_saved) {
    _initial = JSON.parse(_saved).map(u => new User(u))
  }
} catch {
  _initial = []
}
export const USER_LIST = reactive(_initial)

watch(USER_LIST, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) {
    return
  }
  try {
    USER_LIST.splice(0, USER_LIST.length, ...JSON.parse(e.newValue).map(u => new User(u)))
  } catch { /* ignore corrupted cross-tab data */ }
})

/* ================= CREATE ================= */

export function addUser (user) {
  USER_LIST.push(user)
}

/* ================= READ ================= */

export function getAllUsers () {
  return USER_LIST
}

export function getUserByEmail (email) {
  return USER_LIST.find(user => user.email === email)
}

export function getUserByEmailAndPassword (email, password) {
  return USER_LIST.find(user => user.email === email && user.password === password)
}

/* ================= UPDATE ================= */

export function updateUserByEmail (email, newData) {
  const user = getUserByEmail(email)
  if (!user) {
    return null
  }
  if (newData.first_name !== undefined) {
    user.first_name = newData.first_name
  }
  if (newData.last_name !== undefined) {
    user.last_name = newData.last_name
  }
  if (newData.password !== undefined) {
    user.password = newData.password
  }
  return user
}

/* ================= DELETE ================= */

export function deleteUserByEmail (email) {
  const index = USER_LIST.findIndex(user => user.email === email)
  if (index === -1) {
    return false
  }
  USER_LIST.splice(index, 1)
  return true
}

/* ================= EXTRA ================= */

export function userExists (email) {
  return USER_LIST.some(user => user.email === email)
}
