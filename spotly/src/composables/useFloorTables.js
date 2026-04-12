import { computed } from 'vue'
import { ENVIRONMENT_LIST } from '@/datamodel/Environment.js'
import { RESERVATION_LIST } from '@/datamodel/Reservation.js'

/**
 * Returns a computed array of UI table objects for the given environment and date.
 *
 * Each object shape:
 *   { id, env, envId, elementId, x, y, rotation, seats, status, guest, time, note, reservationId }
 *
 * status: 'free' | 'reserved' | 'occupied'
 *   free     — no active reservation
 *   reserved — REQUESTED or APPROVED reservation exists
 *   occupied — CHECKED_IN reservation exists
 *
 * @param {import('vue').Ref<string>} environmentId
 * @param {import('vue').Ref<string>} date — ISO date string (YYYY-MM-DD)
 */
export function useFloorTables (environmentId, date) {
  return computed(() => {
    const env = ENVIRONMENT_LIST.find(e => e.id === environmentId.value)
    if (!env) {
      return []
    }

    return env.elements
      .filter(el => el.capacity > 0)
      .map(el => {
        // Collect all active reservations for this element today, then pick
        // the most "urgent" one: CHECKED_IN wins over APPROVED over REQUESTED.
        // This handles the case where a walk-in is seated while a future
        // approved reservation also exists on the same table.
        const allRes = RESERVATION_LIST.filter(r =>
          r.environmentId === env.id
          && r.elementId === el.id
          && r.date === date.value
          && ['REQUESTED', 'APPROVED', 'CHECKED_IN'].includes(r.status),
        )
        const res
          = allRes.find(r => r.status === 'CHECKED_IN')
            ?? allRes.find(r => r.status === 'APPROVED')
            ?? allRes.find(r => r.status === 'REQUESTED')
            ?? null

        let status = 'free'
        if (res?.status === 'CHECKED_IN') {
          status = 'occupied'
        } else if (res?.status === 'APPROVED' || res?.status === 'REQUESTED') {
          status = 'reserved'
        }

        return {
          id: el.label,
          env: env.name,
          envId: env.id,
          elementId: el.id,
          x: el.x,
          y: el.y,
          rotation: el.rotation || 0,
          seats: el.capacity,
          status,
          guest: res?.name || '',
          time: res?.time || '',
          note: res?.notes || '',
          reservationId: res?.id ?? null,
        }
      })
  })
}
