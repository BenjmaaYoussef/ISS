<template>
  <v-dialog :model-value="modelValue" fullscreen persistent @update:model-value="emit('update:modelValue', $event)">
    <div class="call-screen">

      <!-- ── Header ── -->
      <div class="call-header">
        <div class="call-header__badge">
          <v-icon color="#D4AF37" size="13">mdi-phone-in-talk</v-icon>
          AI Reservation
        </div>
        <div class="call-header__venue">{{ venue?.name }}</div>
      </div>

      <!-- ── Rings + Status ── -->
      <div class="call-center">
        <div class="rings-wrap" :class="`rings--${callState}`">
          <div class="ring ring--3" />
          <div class="ring ring--2" />
          <div class="ring ring--1" />
          <div class="call-avatar">
            <v-icon color="#D4AF37" size="38">mdi-robot-excited-outline</v-icon>
          </div>
        </div>
        <div class="call-status-label">{{ STATUS_LABELS[callState] ?? '…' }}</div>
      </div>

      <!-- ── Live transcript ── -->
      <div ref="feedRef" class="live-feed">
        <div
          v-for="(msg, i) in liveFeed"
          :key="i"
          class="feed-msg"
          :class="`feed-msg--${msg.role}`"
        >
          <!-- Tool activity row -->
          <template v-if="msg.role === 'tool-activity'">
            <span class="feed-tool__icon">⚙</span>
            <span class="feed-tool__text">{{ msg.text }}</span>
          </template>
          <!-- AI / user rows -->
          <template v-else>
            <span class="feed-msg__who">{{ msg.role === 'ai' ? 'AI' : 'You' }}</span>
            <span class="feed-msg__text">{{ msg.text }}</span>
          </template>
        </div>
      </div>

      <!-- ── Phone number text overlay ── -->
      <Transition name="slide-up">
        <div v-if="pendingTextInput" class="phone-overlay">
          <div class="phone-card">
            <div class="phone-card__label">{{ pendingTextInput.label }}</div>
            <input
              ref="phoneInputRef"
              :value="textInputValue"
              class="phone-card__input"
              placeholder="XX XXX XXX"
              type="text"
              inputmode="numeric"
              @input="onPhoneInput"
              @keyup.enter="submitTextInput"
            />
            <button
              class="phone-card__confirm"
              :disabled="textInputValue.replace(/\D/g, '').length < 8"
              @click="submitTextInput"
            >
              Confirm
            </button>
          </div>
        </div>
      </Transition>

      <!-- ── Error message ── -->
      <div v-if="callState === 'error'" class="call-error">
        <v-icon color="#ef5350" size="16">mdi-alert-circle-outline</v-icon>
        {{ errorMessage }}
      </div>

      <!-- ── Hang up FAB ── -->
      <div class="call-footer">
        <button class="hangup-fab" @click="hangUp">
          <v-icon color="white" size="26">mdi-phone-hangup</v-icon>
        </button>
      </div>

    </div>
  </v-dialog>
</template>

<script setup>
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAI } from '@/composables/useAI.js'
import { addReservation, Reservation, RESERVATION_LIST } from '@/datamodel/Reservation.js'
import { addReservationLog, ReservationLog } from '@/datamodel/ReservationLog.js'
import { getEnvironmentsByVenue } from '@/datamodel/Environment.js'

// ── Props / emits ─────────────────────────────────────────────────────────────
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  venue:      { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue'])

// ── Session ───────────────────────────────────────────────────────────────────
let session = null
try { session = JSON.parse(localStorage.getItem('spotly_session') || 'null') } catch {}

// ── AI composable ─────────────────────────────────────────────────────────────
const { callAIWithHistory } = useAI()
const router = useRouter()

// ── State ─────────────────────────────────────────────────────────────────────
const callState         = ref('idle')   // idle | opening | listening | thinking | speaking | done | cancelled | error
const messages          = ref([])       // full conversation history sent to AI
const liveFeed          = ref([])       // display-only transcript
const pendingTextInput  = ref(null)     // { label, placeholder, resolve } — set by request_text_input tool
const textInputValue    = ref('')
const completedResId    = ref(null)     // set after confirm_reservation
const callEnded         = ref(null)     // 'user_cancelled' | 'reservation_complete'
const errorMessage      = ref('')

const feedRef       = ref(null)
const phoneInputRef = ref(null)

// Plain bool — not reactive. Flipped to false in hangUp() so the async loop
// can bail out at every await point instead of continuing after the call ends.
let isActive = false

// ── Status labels ─────────────────────────────────────────────────────────────
const STATUS_LABELS = {
  idle:      'Connecting…',
  opening:   'Speaking…',
  listening: 'Listening…',
  thinking:  'Processing…',
  speaking:  'Speaking…',
  done:      'Reservation confirmed!',
  cancelled: 'Call ended',
  error:     'Something went wrong',
}

// ── Tools ─────────────────────────────────────────────────────────────────────
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'check_availability',
      description: 'Check available time slots per environment for a given date and party size. Call immediately when the guest mentions any date. Only returns slots where a table with sufficient capacity exists. Returns each environment with available slots, or an error if the date is in the past.',
      parameters: {
        type: 'object',
        properties: {
          date:   { type: 'string', description: 'ISO date YYYY-MM-DD — resolve relative dates using today\'s date from the system prompt' },
          guests: { type: 'string', description: 'Number of guests — used to filter tables by capacity' },
        },
        required: ['date', 'guests'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'request_text_input',
      description: 'Show a text input field in the UI. Use ONLY for the phone number, ONLY after you have collected: guests, date, time, and occasion/notes.',
      parameters: {
        type: 'object',
        properties: {
          label:       { type: 'string', description: 'Label shown above the input, e.g. "Your phone number"' },
          placeholder: { type: 'string', description: 'Placeholder text, e.g. "XX XXX XXX"' },
        },
        required: ['label'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'confirm_reservation',
      description: 'Create the reservation. Only call after the guest has confirmed all details AND the phone number has been collected via request_text_input.',
      parameters: {
        type: 'object',
        properties: {
          date:          { type: 'string', description: 'YYYY-MM-DD' },
          time:          { type: 'string', description: 'HH:MM 24-hour format' },
          guests:        { type: 'string', description: 'Number of guests, e.g. "4"' },
          notes:         { type: 'string', description: 'Occasion or special request, empty string if none' },
          phone:         { type: 'string', description: 'The phone number the guest typed in the text field' },
          environmentId: { type: 'string', description: 'The id of the environment the guest chose, from check_availability results' },
        },
        required: ['date', 'time', 'guests', 'notes', 'phone', 'environmentId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'end_call',
      description: 'End the call. Call this AFTER saying a brief farewell when the guest cancels, or AFTER confirm_reservation succeeds.',
      parameters: {
        type: 'object',
        properties: {
          reason: { type: 'string', enum: ['user_cancelled', 'reservation_complete'] },
        },
        required: ['reason'],
      },
    },
  },
]

// ── System prompt ─────────────────────────────────────────────────────────────
function buildSystemPrompt () {
  const now       = new Date()
  const today     = now.toISOString().split('T')[0]
  const todayLong = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const tomorrow  = new Date(now.getTime() + 86_400_000).toISOString().split('T')[0]
  const guestName = session ? `${session.first_name} ${session.last_name}` : 'the guest'

  const envs = getEnvironmentsByVenue(props.venue?.id)
  const envList = envs.map(e => `  - ${e.name} (id: ${e.id})`).join('\n')

  return `You are a warm, professional reservation assistant for ${props.venue?.name ?? 'this venue'}.
Today is ${todayLong} (${today}). Tomorrow is ${tomorrow}. The guest's name is ${guestName}.

VENUE ENVIRONMENTS (seating areas available at this venue):
${envList || '  - Main area'}

Collect reservation details through a natural voice conversation.

TOOL RULES — follow these exactly, no exceptions:
1. check_availability  → call immediately when the guest mentions any date. Pass the guest count you already collected. Resolve relative dates to YYYY-MM-DD using today: ${today} and tomorrow: ${tomorrow}. The result includes per-environment available slots filtered to tables that fit the party, plus an unavailableReason field ("fully_booked" or "no_table_large_enough") when an environment has no slots.
2. request_text_input  → call ONLY after you have confirmed: guests count, date, environment, time slot, AND occasion/notes. Never before.
3. confirm_reservation → call ONLY after guest says yes/confirm AND phone number was collected via request_text_input. Always pass environmentId. The tool re-validates everything server-side and returns an error field if something is wrong — relay the error naturally and ask the guest to choose again.
4. end_call            → call with reason "user_cancelled" after saying a brief goodbye when the guest wants to cancel/stop/hang up. Call with reason "reservation_complete" after confirm_reservation succeeds.

COLLECTION ORDER:
1. Number of guests (voice)
2. Date (voice) → immediately call check_availability(date, guests)
3. Environment — present environments that have availability; if only one has slots, select it automatically without asking. Use the environment id from results.
4. Time slot from that environment's availableSlots list (voice) — never suggest a time not in the list
5. Occasion or special notes — optional, accept "no special occasion" (voice)
6. Phone number → CALL request_text_input immediately. Do NOT say you opened a field — just call the tool. The UI handles it.
7. Read back a summary (guests, date, environment name, time, notes), ask the guest to confirm
8. On confirmation → call confirm_reservation (include environmentId), then end_call(reservation_complete)

STYLE:
- One short sentence per turn, never more
- Warm and natural, not robotic
- If the guest corrects something (e.g. "actually make it 6 people"), re-call check_availability with the updated count
- If check_availability returns error "past_date", apologise and ask for a future date
- If an environment has unavailableReason "no_table_large_enough", tell the guest there's no table big enough for their party in that area
- If an environment has unavailableReason "fully_booked", tell the guest it's fully booked and suggest another date or environment`
}

// ── TTS — ElevenLabs (primary) + browser SpeechSynthesis (fallback) ──────────

let currentAudio = null  // active ElevenLabs <audio> element, for mid-speech stop

async function speakElevenLabs (text) {
  const key = import.meta.env.VITE_ELEVENLABS_API_KEY
  if (!key) return false

  const voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key':   key,
        'Content-Type': 'application/json',
        'Accept':       'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id:      'eleven_turbo_v2_5',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    })

    if (!res.ok) return false

    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)

    await new Promise((resolve) => {
      const audio = new Audio(url)
      currentAudio = audio
      const finish = () => { URL.revokeObjectURL(url); currentAudio = null; resolve() }
      audio.onended = finish
      audio.onerror = finish
      audio.play().catch(finish)
    })
    return true
  } catch {
    return false
  }
}

// Voices load async in Chrome — wait for them before first speak
function loadVoices () {
  return new Promise(resolve => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) { resolve(voices); return }
    const handler = () => resolve(window.speechSynthesis.getVoices())
    window.speechSynthesis.addEventListener('voiceschanged', handler, { once: true })
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 2000)
  })
}

async function speakBrowser (text) {
  return new Promise(async (resolve) => {
    if (window.speechSynthesis.paused) window.speechSynthesis.resume()
    window.speechSynthesis.cancel()
    await new Promise(r => setTimeout(r, 80))

    const voices = await loadVoices()
    const utter  = new SpeechSynthesisUtterance(text)

    const voice =
      voices.find(v => v.lang === 'en-US' && v.name.includes('Samantha')) ||
      voices.find(v => v.lang === 'en-US' && !v.localService)             ||
      voices.find(v => v.lang.startsWith('en-') && !v.localService)       ||
      voices.find(v => v.lang.startsWith('en-'))

    if (voice) utter.voice = voice
    utter.rate   = 0.95
    utter.pitch  = 1.0
    utter.volume = 1

    let done = false
    const finish = () => { if (!done) { done = true; resolve() } }
    utter.onend   = finish
    utter.onerror = (e) => { console.warn('[TTS error]', e.error); finish() }
    setTimeout(finish, Math.max(5000, text.length * 85))

    window.speechSynthesis.speak(utter)
  })
}

async function speak (text) {
  const ok = await speakElevenLabs(text)
  if (!ok) await speakBrowser(text)
}

function stopSpeaking () {
  if (currentAudio) { currentAudio.pause(); currentAudio = null }
  window.speechSynthesis.cancel()
}

// ── Speech Recognition ────────────────────────────────────────────────────────
let recognition = null
const speechSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition)

function setupRecognition () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SR()
  recognition.lang             = 'en-US'
  recognition.continuous       = false
  recognition.interimResults   = false
  recognition.maxAlternatives  = 1

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript.trim()
    if (transcript) sendTurn(transcript)
  }

  recognition.onerror = (e) => {
    if (!isActive) return
    if (e.error === 'aborted') return
    if (e.error === 'no-speech') {
      if (isActive) try { recognition.start() } catch {}
      return
    }
    callState.value    = 'error'
    errorMessage.value = `Microphone error: ${e.error}`
  }

  recognition.onend = () => {
    if (isActive && callState.value === 'listening') {
      try { recognition.start() } catch {}
    }
  }
}

function startListening () {
  if (!recognition) return
  callState.value = 'listening'
  try { recognition.start() } catch {}
}

function stopListening () {
  try { recognition?.abort() } catch {}
}

// ── Tool activity feed ────────────────────────────────────────────────────────
function formatDate (iso) {
  try {
    return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    })
  } catch { return iso }
}

function pushToolActivity (name, args) {
  const text = {
    check_availability:  `Checking availability for ${formatDate(args.date)}…`,
    confirm_reservation: 'Creating your reservation…',
    request_text_input:  'Requesting phone number…',
    end_call:            args.reason === 'reservation_complete' ? 'Finalizing booking…' : 'Ending call…',
  }[name] ?? `Running ${name}…`
  liveFeed.value.push({ role: 'tool-activity', text })
  scrollFeed()
}

// ── Tool executor ─────────────────────────────────────────────────────────────
const WORKING_HOURS = ['18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00']

async function executeTool (name, args) {
  if (name === 'check_availability') {
    // Guard: past dates
    const today = new Date().toISOString().split('T')[0]
    if (args.date < today) {
      return { error: 'past_date', message: 'That date is in the past. Please choose a future date.' }
    }

    const guestCount = parseInt(args.guests, 10) || 1
    const venueEnvs  = getEnvironmentsByVenue(props.venue?.id)

    const environments = venueEnvs.map(env => {
      // Only tables that can seat the party
      const eligibleTables = env.elements.filter(
        el => el.type?.startsWith('table_') && (el.capacity ?? 0) >= guestCount,
      )

      const availableSlots = WORKING_HOURS.filter(slot =>
        eligibleTables.some(table => !RESERVATION_LIST.some(r =>
          r.venueId       === props.venue?.id &&
          r.environmentId === env.id &&
          r.elementId     === table.id &&
          r.date          === args.date &&
          r.time          === slot &&
          ['REQUESTED', 'APPROVED', 'CHECKED_IN'].includes(r.status),
        )),
      )

      // Distinguish "fully booked" from "no table big enough"
      const allTables = env.elements.filter(el => el.type?.startsWith('table_'))
      const hasCapacity = allTables.some(el => (el.capacity ?? 0) >= guestCount)

      return {
        id:             env.id,
        name:           env.name,
        availableSlots,
        unavailableReason: availableSlots.length === 0
          ? (hasCapacity ? 'fully_booked' : 'no_table_large_enough')
          : null,
      }
    })

    return { date: args.date, guests: guestCount, environments }
  }

  if (name === 'request_text_input') {
    return new Promise(resolve => {
      pendingTextInput.value = {
        label:       args.label       ?? 'Your phone number',
        placeholder: args.placeholder ?? 'XX XXX XXX',
        resolve,
      }
      nextTick(() => phoneInputRef.value?.focus())
    })
  }

  if (name === 'confirm_reservation') {
    const guestCount = parseInt(args.guests, 10) || 1

    // Guard: past date
    const today = new Date().toISOString().split('T')[0]
    if (args.date < today) {
      return { error: 'past_date', message: 'Cannot book a reservation in the past.' }
    }

    // Guard: working hours
    if (!WORKING_HOURS.includes(args.time)) {
      return { error: 'invalid_time', message: `${args.time} is outside working hours (18:00–22:00).` }
    }

    // Find a free table with sufficient capacity
    let elementId     = null
    let environmentId = args.environmentId ?? null

    if (environmentId) {
      const venueEnvs = getEnvironmentsByVenue(props.venue?.id)
      const env = venueEnvs.find(e => String(e.id) === String(environmentId))
      if (env) {
        const eligible = env.elements.filter(
          el => el.type?.startsWith('table_') && (el.capacity ?? 0) >= guestCount,
        )
        const freeTable = eligible.find(table => !RESERVATION_LIST.some(r =>
          r.venueId       === props.venue?.id &&
          r.environmentId === env.id &&
          r.elementId     === table.id &&
          r.date          === args.date &&
          r.time          === args.time &&
          ['REQUESTED', 'APPROVED', 'CHECKED_IN'].includes(r.status),
        ))
        if (!freeTable) {
          return { error: 'no_availability', message: 'No suitable table available for that slot. Please choose another time.' }
        }
        elementId = freeTable.id
      }
    }

    const res = new Reservation({
      id:            Date.now(),
      venueId:       props.venue.id,
      environmentId,
      elementId,
      userId:        session.email,
      name:          `${session.first_name} ${session.last_name}`,
      email:         session.email,
      phone:         args.phone,
      date:          args.date,
      time:          args.time,
      guests:        guestCount,
      notes:         args.notes ?? '',
      status:        'REQUESTED',
    })
    addReservation(res)
    addReservationLog(new ReservationLog({
      id:              Date.now() + 1,
      reservationId:   res.id,
      previousStatus:  null,
      newStatus:       'REQUESTED',
      timestamp:       new Date().toISOString(),
      actorRole:       'client',
    }))
    completedResId.value = res.id
    return { success: true, reservationId: res.id }
  }

  if (name === 'end_call') {
    callEnded.value = args.reason
    return { success: true }
  }

  return { error: `Unknown tool: ${name}` }
}

// ── Agentic loop ──────────────────────────────────────────────────────────────
async function sendTurn (userText) {
  if (!isActive) return

  if (userText) {
    messages.value.push({ role: 'user', content: userText })
    liveFeed.value.push({ role: 'user', text: userText })
    scrollFeed()
  }
  callState.value = 'thinking'

  // Loop until we get a speech response (tool calls may chain multiple times)
  while (true) {
    if (!isActive) return

    let response
    try {
      response = await callAIWithHistory(messages.value, { tools: TOOLS })
    } catch (e) {
      if (!isActive) return
      if (e.message?.includes('tool_use_failed')) {
        // Model generated malformed tool args — retry once with the same tools
        liveFeed.value.push({ role: 'tool-activity', text: 'Retrying…' })
        scrollFeed()
        try {
          response = await callAIWithHistory(messages.value, { tools: TOOLS })
        } catch {
          if (!isActive) return
          // Still failing — speak a recovery line and let the user try again
          const recovery = "Sorry, I had a technical issue. Could you repeat that?"
          liveFeed.value.push({ role: 'ai', text: recovery })
          scrollFeed()
          callState.value = 'speaking'
          await speak(recovery)
          if (!isActive) return
          startListening()
          return
        }
      } else {
        callState.value    = 'error'
        errorMessage.value = 'Could not reach Groq — check your API key and network.'
        return
      }
    }

    if (!isActive) return

    const { content, tool_calls } = response

    // ── Tool call branch ───────────────────────────────────────────────────
    if (tool_calls?.length) {
      if (content) {
        messages.value.push({ role: 'assistant', content, tool_calls })
        liveFeed.value.push({ role: 'ai', text: content })
        scrollFeed()
        callState.value = 'speaking'
        await speak(content)
        if (!isActive) return
        callState.value = 'thinking'
      } else {
        messages.value.push({ role: 'assistant', content: null, tool_calls })
      }

      for (const tc of tool_calls) {
        if (!isActive) return
        const args = typeof tc.function.arguments === 'string'
          ? JSON.parse(tc.function.arguments)
          : tc.function.arguments

        // Show tool activity in transcript
        pushToolActivity(tc.function.name, args)

        // If model didn't say anything before requesting the phone, speak a fallback
        if (tc.function.name === 'request_text_input' && !content) {
          const phrase = "I've opened a field for your phone number — please type it below."
          liveFeed.value.push({ role: 'ai', text: phrase })
          scrollFeed()
          callState.value = 'speaking'
          await speak(phrase)
          if (!isActive) return
          callState.value = 'thinking'
        }

        const result = await executeTool(tc.function.name, args)
        if (!isActive) return
        messages.value.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) })
      }
      continue // Let AI respond to tool results
    }

    // ── Speech response branch ─────────────────────────────────────────────
    const speech = content ?? ''
    if (speech) {
      messages.value.push({ role: 'assistant', content: speech })
      liveFeed.value.push({ role: 'ai', text: speech })
      scrollFeed()
      callState.value = 'speaking'
      await speak(speech)
      if (!isActive) return
    }

    // ── Post-speech routing ────────────────────────────────────────────────
    if (callEnded.value === 'reservation_complete' || completedResId.value) {
      callState.value = 'done'
      setTimeout(() => {
        emit('update:modelValue', false)
        router.push(`/booking/awaiting?id=${completedResId.value}`)
      }, 2000)
      return
    }

    if (callEnded.value === 'user_cancelled') {
      callState.value = 'cancelled'
      setTimeout(() => emit('update:modelValue', false), 1800)
      return
    }

    // Fallback: detect farewell if model said goodbye without calling end_call
    const FAREWELLS = ['goodbye', 'bye!', 'safe travels', 'take care', 'have a great']
    if (FAREWELLS.some(f => speech.toLowerCase().includes(f)) && !completedResId.value) {
      callState.value = 'cancelled'
      setTimeout(() => emit('update:modelValue', false), 1800)
      return
    }

    startListening()
    break
  }
}

// ── Call lifecycle ────────────────────────────────────────────────────────────
async function startCall () {
  if (!speechSupported) {
    callState.value    = 'error'
    errorMessage.value = 'Voice calls require Chrome or Edge.'
    return
  }

  isActive = true

  // Reset everything
  messages.value         = []
  liveFeed.value         = []
  pendingTextInput.value = null
  textInputValue.value   = ''
  completedResId.value   = null
  callEnded.value        = null
  errorMessage.value     = ''
  callState.value        = 'opening'

  setupRecognition()

  // Seed system prompt
  messages.value.push({ role: 'system', content: buildSystemPrompt() })

  // Hardcoded greeting for instant start — no extra API call
  const greeting = `Hi, welcome to ${props.venue?.name ?? 'our venue'}. I'm your AI reservation assistant. How many guests will be joining you?`
  messages.value.push({ role: 'assistant', content: greeting })
  liveFeed.value.push({ role: 'ai', text: greeting })
  scrollFeed()

  callState.value = 'speaking'
  await speak(greeting)
  startListening()
}

function hangUp () {
  isActive = false          // kills the loop at every await checkpoint
  stopSpeaking()
  stopListening()
  if (pendingTextInput.value?.resolve) {
    pendingTextInput.value.resolve({ cancelled: true })
  }
  pendingTextInput.value = null
  callState.value        = 'cancelled'
  emit('update:modelValue', false)
}

// ── Phone formatting (Tunisian: XX XXX XXX, 8 digits) ────────────────────────
function formatTunisianPhone (raw) {
  const d = raw.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`
  return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`
}

function onPhoneInput (e) {
  textInputValue.value = formatTunisianPhone(e.target.value)
}

// ── Text input submission ─────────────────────────────────────────────────────
async function submitTextInput () {
  if (textInputValue.value.replace(/\D/g, '').length < 8 || !pendingTextInput.value) return
  const phone    = textInputValue.value.trim()
  const resolver = pendingTextInput.value.resolve
  pendingTextInput.value = null
  textInputValue.value   = ''
  resolver({ field: 'phone', value: phone })
  // The agentic loop receives the phone value as the tool result and continues
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function scrollFeed () {
  nextTick(() => {
    if (feedRef.value) feedRef.value.scrollTop = feedRef.value.scrollHeight
  })
}

// ── Watchers ──────────────────────────────────────────────────────────────────
watch(() => props.modelValue, (val) => {
  if (val) startCall()
  else {
    stopSpeaking()
    stopListening()
  }
})

onUnmounted(() => {
  stopSpeaking()
  stopListening()
})
</script>

<style scoped>
/* ── Layout ── */
.call-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100dvh;
  background: #0a0e14;
  position: relative;
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom);
}

/* ── Header ── */
.call-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 24px 12px;
  position: relative;
}

.call-header__badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.75);
}

.call-header__venue {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
  margin-left: 12px;
}

/* ── Center ── */
.call-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
}

/* ── Rings ── */
.rings-wrap {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid transparent;
}

.ring--1 { width: 88px;  height: 88px; }
.ring--2 { width: 124px; height: 124px; }
.ring--3 { width: 162px; height: 162px; }

/* Idle */
.rings--idle .ring {
  border-color: rgba(212, 175, 55, 0.12);
}

/* Speaking — gold rings pulse outward */
.rings--speaking .ring--1,
.rings--opening  .ring--1 { animation: speak-pulse 1.2s ease-out infinite; border-color: rgba(212, 175, 55, 0.7); }
.rings--speaking .ring--2,
.rings--opening  .ring--2 { animation: speak-pulse 1.2s ease-out 0.15s infinite; border-color: rgba(212, 175, 55, 0.45); }
.rings--speaking .ring--3,
.rings--opening  .ring--3 { animation: speak-pulse 1.2s ease-out 0.3s infinite; border-color: rgba(212, 175, 55, 0.25); }

@keyframes speak-pulse {
  0%   { transform: scale(1);    opacity: 1; }
  100% { transform: scale(1.35); opacity: 0; }
}

/* Listening — silver breathing rings */
.rings--listening .ring--1 { animation: listen-breathe 1.4s ease-in-out infinite; border-color: rgba(176, 190, 197, 0.6); }
.rings--listening .ring--2 { animation: listen-breathe 1.4s ease-in-out 0.18s infinite; border-color: rgba(176, 190, 197, 0.38); }
.rings--listening .ring--3 { animation: listen-breathe 1.4s ease-in-out 0.36s infinite; border-color: rgba(176, 190, 197, 0.2); }

@keyframes listen-breathe {
  0%, 100% { transform: scale(1);    opacity: 1; }
  50%       { transform: scale(1.12); opacity: 0.65; }
}

/* Thinking — slow amber spin on outer ring */
.rings--thinking .ring--3 { animation: think-spin 2s linear infinite; border-color: rgba(255, 179, 0, 0.55); border-top-color: transparent; }
.rings--thinking .ring--2 { border-color: rgba(255, 179, 0, 0.2); }
.rings--thinking .ring--1 { border-color: rgba(255, 179, 0, 0.12); }

@keyframes think-spin {
  to { transform: rotate(360deg); }
}

/* Done */
.rings--done .ring { border-color: rgba(102, 187, 106, 0.45); animation: none; }

/* Cancelled / error */
.rings--cancelled .ring,
.rings--error     .ring { border-color: rgba(239, 83, 80, 0.3); animation: none; }

/* Avatar */
.call-avatar {
  position: relative;
  z-index: 2;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.07);
  border: 1px solid rgba(212, 175, 55, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Status label */
.call-status-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

/* ── Live feed ── */
.live-feed {
  width: 100%;
  max-width: 480px;
  max-height: 140px;
  overflow-y: auto;
  padding: 0 24px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  scrollbar-width: none;
}

.live-feed::-webkit-scrollbar { display: none; }

.feed-msg {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.feed-msg__who {
  font-family: 'Inter', sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  flex-shrink: 0;
  padding-top: 2px;
}

.feed-msg--ai   .feed-msg__who { color: #d4af37; }
.feed-msg--user .feed-msg__who { color: rgba(255,255,255,0.35); }

.feed-msg__text {
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.65);
}

.feed-msg--user .feed-msg__text { color: rgba(255,255,255,0.45); }

/* Tool activity row */
.feed-msg--tool-activity {
  align-items: center;
  gap: 6px;
  opacity: 0.7;
}

.feed-tool__icon {
  font-size: 0.65rem;
  color: #ffb300;
  flex-shrink: 0;
  animation: spin-slow 2s linear infinite;
}

.feed-tool__text {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-style: italic;
  color: #ffb300;
  letter-spacing: 0.2px;
}

@keyframes spin-slow {
  to { transform: rotate(360deg); }
}

/* ── Phone number overlay ── */
.phone-overlay {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 48px);
  max-width: 400px;
  z-index: 10;
}

.phone-card {
  background: rgba(19, 24, 31, 0.96);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.phone-card__label {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(212, 175, 55, 0.8);
}

.phone-card__input {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 12px 14px;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.phone-card__input:focus {
  border-color: rgba(212, 175, 55, 0.5);
}

.phone-card__input::placeholder { color: rgba(255,255,255,0.25); }

.phone-card__confirm {
  background: #d4af37;
  color: #0a0e14;
  border: none;
  border-radius: 6px;
  padding: 11px 20px;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s;
}

.phone-card__confirm:hover:not(:disabled) { background: #e8c84a; }
.phone-card__confirm:disabled { opacity: 0.4; cursor: not-allowed; }

/* Slide-up transition for phone overlay */
.slide-up-enter-active { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease; }
.slide-up-leave-active { transition: transform 0.2s ease-in, opacity 0.2s ease; }
.slide-up-enter-from  { transform: translateX(-50%) translateY(20px); opacity: 0; }
.slide-up-leave-to    { transform: translateX(-50%) translateY(20px); opacity: 0; }

/* ── Error ── */
.call-error {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: #ef5350;
  padding: 0 24px;
  text-align: center;
  max-width: 360px;
}

/* ── Footer / hang-up FAB ── */
.call-footer {
  padding: 20px 0 32px;
}

.hangup-fab {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #c62828;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 24px rgba(198, 40, 40, 0.45);
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
}

.hangup-fab:hover {
  background: #e53935;
  transform: scale(1.06);
  box-shadow: 0 6px 32px rgba(198, 40, 40, 0.6);
}

.hangup-fab:active { transform: scale(0.97); }

@media (prefers-reduced-motion: reduce) {
  .ring { animation: none !important; }
}
</style>
