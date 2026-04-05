import { reactive, watch } from 'vue'

export class Venue {
  constructor({ id, name, description, ambienceTags = [], activities = [], images = [], dressCode = '', supportedLanguages = [], tagline = '', location = '', venueType = '', hours = [], slides = [] }) {
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
    this.slides = slides.map(s => ({
      title: s.title ?? '',
      subtitle: s.subtitle ?? '',
      bgColor: s.bgColor ?? '',
      imageUrl: s.imageUrl ?? '',
    }))
  }
}

const STORAGE_KEY = 'spotly_venues'
const _seed = [
  new Venue({ id: 1, name: 'Sunset Beach Club', description: 'Premium lounge with breathtaking sunset views', ambienceTags: ['Beach', 'Luxury', 'Sunset'], activities: ['Outdoors', 'Beach', 'Party'] }),
  new Venue({ id: 2, name: 'Urban Elegance', description: 'Sophisticated indoor fine-dining experience', ambienceTags: ['Indoor', 'Elegant', 'Modern'], activities: ['Indoors', 'Party'] }),
  new Venue({ id: 3, name: 'Sports Lounge', description: 'Premier sports bar with premium seating', ambienceTags: ['Sports', 'Casual', 'Vibrant'], activities: ['Indoors', 'Football'] }),
  new Venue({ id: 4, name: 'Garden Terrace', description: 'Open-air garden with ambient lighting', ambienceTags: ['Outdoor', 'Natural', 'Romantic'], activities: ['Outdoors', 'Party', 'Beach'] }),
  new Venue({ id: 5, name: 'Rooftop Paradise', description: 'City views with panoramic urban scenery', ambienceTags: ['Modern', 'Urban', 'Chic'], activities: ['Outdoors', 'Indoors', 'Party'] }),
  new Venue({ id: 6, name: 'Coastal Club', description: 'Beachfront venue with exclusive private access', ambienceTags: ['Luxury', 'Beach', 'Exclusive'], activities: ['Beach', 'Outdoors'] }),
]
const _saved = localStorage.getItem(STORAGE_KEY)
export const VENUE_LIST = reactive(_saved ? JSON.parse(_saved).map(v => new Venue(v)) : _seed)
if (!_saved) localStorage.setItem(STORAGE_KEY, JSON.stringify(_seed))

watch(VENUE_LIST, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  VENUE_LIST.splice(0, VENUE_LIST.length, ...JSON.parse(e.newValue).map(v => new Venue(v)))
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
