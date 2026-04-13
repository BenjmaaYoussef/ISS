import { reactive, watch } from 'vue'

// status: 'VISIBLE' | 'HIDDEN'
export class Review {
  constructor ({ id, reservationId, venueId, userId, reviewerName, rating, body = '', createdAt, status = 'VISIBLE' }) {
    this.id           = id
    this.reservationId = reservationId
    this.venueId      = venueId
    this.userId       = userId
    this.reviewerName = reviewerName
    this.rating       = rating
    this.body         = body
    this.createdAt    = createdAt
    this.status       = status
  }
}

const STORAGE_KEY = 'spotly_reviews'
let _initial = []
try {
  const _saved = localStorage.getItem(STORAGE_KEY)
  if (_saved) {
    _initial = JSON.parse(_saved).map(r => new Review(r))
  }
} catch {
  _initial = []
}
export const REVIEW_LIST = reactive(_initial)

watch(REVIEW_LIST, val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  try {
    REVIEW_LIST.splice(0, REVIEW_LIST.length, ...JSON.parse(e.newValue).map(r => new Review(r)))
  } catch { /* ignore corrupted cross-tab data */ }
})

/* ================= CREATE ================= */

export function addReview (review) {
  REVIEW_LIST.push(review)
}

/* ================= READ ================= */

export function getAllReviews () {
  return REVIEW_LIST
}

export function getReviewById (id) {
  return REVIEW_LIST.find(r => r.id === id)
}

export function getReviewsByVenue (venueId) {
  return REVIEW_LIST.filter(r => r.venueId === venueId)
}

export function getReviewsByUser (userId) {
  return REVIEW_LIST.filter(r => r.userId === userId)
}

export function getReviewByReservation (reservationId) {
  return REVIEW_LIST.find(r => r.reservationId === reservationId)
}

/* ================= UPDATE ================= */

export function updateReviewStatus (id, status) {
  const review = getReviewById(id)
  if (!review) return null
  review.status = status
  return review
}

export function updateReview (id, newData) {
  const review = getReviewById(id)
  if (!review) return null
  Object.assign(review, newData)
  return review
}

/* ================= DELETE ================= */

export function deleteReview (id) {
  const index = REVIEW_LIST.findIndex(r => r.id === id)
  if (index === -1) return false
  REVIEW_LIST.splice(index, 1)
  return true
}
