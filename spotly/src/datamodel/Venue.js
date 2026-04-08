import { reactive, watch } from 'vue'

export class Venue {
  constructor({ id, name, description, ambienceTags = [], activities = [], images = [], dressCode = '', supportedLanguages = [], tagline = '', location = '', venueType = '', hours = [], slides = [], adminEmail = '' }) {
    this.id = id
    this.name = name
    this.description = description
    this.ambienceTags = ambienceTags
    this.activities = activities
    this.images = images
    this.dressCode = dressCode
    this.supportedLanguages = supportedLanguages
    this.tagline = tagline
    this.location = location
    this.venueType = venueType
    this.hours = hours
    this.adminEmail = adminEmail
    this.slides = slides.map(s => ({
      title: s.title ?? '',
      subtitle: s.subtitle ?? '',
      bgColor: s.bgColor ?? '',
      imageUrl: s.imageUrl ?? '',
    }))
  }
}

const STORAGE_KEY = 'spotly_venues'
const _saved = localStorage.getItem(STORAGE_KEY)
let _initial = []
try { if (_saved) _initial = JSON.parse(_saved).map(v => new Venue(v)) } catch { _initial = [] }
export const VENUE_LIST = reactive(_initial)

watch(VENUE_LIST, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  try { VENUE_LIST.splice(0, VENUE_LIST.length, ...JSON.parse(e.newValue).map(v => new Venue(v))) } catch { /* ignore corrupted cross-tab data */ }
})

/* ================= CREATE ================= */

export function addVenue(venue) {
  VENUE_LIST.push(venue)
}

/* ================= READ ================= */

export function getAllVenues() {
  return VENUE_LIST
}

export function getVenueById(id) {
  return VENUE_LIST.find(v => v.id === id)
}

export function getVenueByAdminEmail(email) {
  return VENUE_LIST.find(v => v.adminEmail === email) ?? null
}

/* ================= UPDATE ================= */

export function updateVenue(id, newData) {
  const venue = getVenueById(id)
  if (!venue) return null
  Object.assign(venue, newData)
  return venue
}

/* ================= DELETE ================= */

export function deleteVenue(id) {
  const index = VENUE_LIST.findIndex(v => v.id === id)
  if (index === -1) return false
  VENUE_LIST.splice(index, 1)
  return true
}
