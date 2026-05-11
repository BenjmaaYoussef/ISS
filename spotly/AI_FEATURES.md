# AI_FEATURES.md — Spotly AI Features Plan

## Overview

Three AI features powered by **Groq** (free tier, $0). All features are frontend-only — the API key lives in `.env.local` (gitignored, never committed). One session per phase, each must pass testing before being marked complete.

**Add to `.env.local` before starting any AI phase:**
```
VITE_GROQ_API_KEY=gsk_...
```

No other keys needed. Kokoro TTS (Phase AI-2) runs 100% in the browser — no API key, no external calls.

### Why Groq instead of OpenRouter

OpenRouter's free tier proxies to upstream providers that impose their own rate limits, causing unpredictable 429s mid-conversation — especially painful during voice calls where every turn is a request. Groq runs its own inference hardware with first-party rate limits you can actually rely on.

Groq uses an OpenAI-compatible API (`POST /v1/chat/completions`).

### Model: `llama-3.1-8b-instant`

| Property | Value |
|----------|-------|
| Size | 8B parameters |
| Tool calling | Yes (required for Phase AI-2 voice agent) |
| Speed | ~500–750 tokens/sec — critical for low-latency voice turns |
| Free tier | 30 req/min · 14,400 req/day · 6,000 tokens/min |
| Context window | 128k tokens |

The 8B size is intentional: smaller models get higher rate limits on Groq's free tier. For reservation intent extraction and JSON output, 8B is more than sufficient.

**Implementation order (strict):** AI-1 → AI-2 → AI-3 → AI-4

---

## AI Phase 1 — Shared AI Infrastructure

**Scope:** `src/composables/useAI.js` (new), `.env.local`, `CLAUDE.md`
**Prerequisite:** `.env.local` has `VITE_GROQ_API_KEY` set to a real key.
**Goal:** A single composable that wraps OpenRouter. Every AI feature in phases 2–4 calls this and nothing else — no duplicated fetch logic, no duplicated error handling.

### Composable contract

```js
const { callAI, callAIWithHistory, loading, error } = useAI()

// callAI(systemPrompt, userPrompt, options?)
// options: { maxTokens = 1024, json = false }
// Returns: Promise<string>         when json = false
//          Promise<object|array>   when json = true  (strips markdown fences, then JSON.parse)

// callAIWithHistory(messages, options?)
// messages: OpenAI-format array — role/content pairs, including tool results
// options:  { tools = [], maxTokens = 1024 }
// Returns: Promise<{ content: string|null, tool_calls: array|null, finish_reason: string }>
// Used by Phase AI-2 for multi-turn conversation with tool calling

// Both methods: set loading=true while in-flight, loading=false + error on failure
```

### Tasks

- [x] **`src/composables/useAI.js`** — Create with:
  - `loading` ref (bool), `error` ref (string|null)
  - Shared helper `_post(body)`: reads `VITE_GROQ_API_KEY` (throws if missing), POSTs to `https://api.groq.com/openai/v1/chat/completions` with headers `Authorization: Bearer ${key}`, `Content-Type: application/json`. Returns parsed response JSON. Sets `loading = true` before, `loading = false` in finally.
  - `callAI(systemPrompt, userPrompt, { maxTokens = 1024, json = false } = {})`:
    - Calls `_post({ model: 'llama-3.1-8b-instant', messages: [{ role:'system', content: systemPrompt }, { role:'user', content: userPrompt }], max_tokens: maxTokens })`.
    - Returns `data.choices[0].message.content`.
    - When `json: true`: strip ` ```json ` / ` ``` ` fences with regex, then `JSON.parse()`.
  - `callAIWithHistory(messages, { tools = [], maxTokens = 1024 } = {})`:
    - Calls `_post({ model: 'llama-3.1-8b-instant', messages, tools: tools.length ? tools : undefined, max_tokens: maxTokens })`.
    - Returns `{ content: choice.message.content, tool_calls: choice.message.tool_calls ?? null, finish_reason: choice.finish_reason }`.
    - Does NOT parse JSON — caller handles the raw content.
  - Both methods: catch errors, set `error.value = e.message`, re-throw.
  - `export function useAI() { return { callAI, callAIWithHistory, loading, error } }`

- [x] **`.env.local`** — Append `VITE_GROQ_API_KEY=gsk_...`. Document in `CLAUDE.md`.

- [x] **`CLAUDE.md`** — Add under the Image Upload section: `VITE_GROQ_API_KEY` is required for all AI features (phases AI-2, AI-3, AI-4).

### Testing

**Automated — `e2e/ai-phase1.spec.js`:**
```
- Navigate to /home as a logged-in client
- Inject a mock fetch that intercepts api.groq.com and returns a valid choices[0].message.content
- Call the composable via page.evaluate and assert the returned string matches
- Inject a mock that returns invalid JSON, call with json:true, assert the error ref is set
- Remove VITE_GROQ_API_KEY from the env (use page.evaluate to delete the variable),
  call callAI, assert it throws with the missing key message
```

**Manual:**
```
1. Make sure .env.local has a real VITE_GROQ_API_KEY
2. Open browser console on any page
3. There is no direct UI yet — this is verified implicitly when Phase 2 works end-to-end
✅ Mark done after Phase 2 manual test passes (it proves the composable works)
```

---

## AI Phase 2 — Voice Reservation (Conversational Call)

**Scope:** `src/composables/useKokoro.js` (new), `src/components/ai/VoiceCallModal.vue` (new), `src/pages/venue/[id].vue`
**Prerequisite:** AI Phase 1 complete. Chrome or Edge required (Web Speech API).
**Goal:** A logged-in user on a venue's page opens a phone-call-style modal and has a live back-and-forth voice conversation with an AI assistant. The AI acts as an agent — it checks real availability from localStorage, asks follow-up questions, and calls a tool to create the reservation when the user confirms. No forms, no buttons — entirely voice-driven.

---

### TTS: Kokoro.js (100% in-browser, no API key)

```bash
npm i kokoro-js
```

Kokoro runs the ONNX model entirely in the browser via WebAssembly. The model (~82MB) is downloaded from Hugging Face on first use and cached permanently by the browser. Subsequent page loads use the cache — no re-download.

**Voice used:** `af_heart` — Grade A, warm and natural. Full voice list available via `tts.list_voices()`.

**Browser playback** (confirmed from kokoro-js source — `audio.audio` is a Float32Array at `audio.sampling_rate` Hz):
```js
async function playAudio(output) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const buffer = ctx.createBuffer(1, output.audio.length, output.sampling_rate)
  buffer.getChannelData(0).set(output.audio)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  return new Promise(resolve => {
    source.onended = resolve
    source.start(0)
  })
}
```

---

### Exact user journey

**Entry point:** `/venue/[id]` — next to the existing "Make Reservation" button, a second CTA is added: **"Reserve by Call"** (phone icon, gold outlined). Always visible to all users — auth check happens on click.

```
venue/[id].vue — CTA area
  ├── [Make Reservation]      (existing)
  └── [📞 Reserve by Call]   (new — always visible, auth-aware on click)
```

**Auth handling:** The button is shown to everyone (logged-in or not). Clicking it:
- If **not logged in** → `router.push('/auth?redirect=' + encodeURIComponent(route.fullPath))`. After login the router guard returns the user to this exact venue page, where they click again.
- If **logged in, wrong browser** → snackbar "Voice calls require Chrome or Edge"
- If **logged in, Chrome/Edge** → open the modal

The router guard in `router/index.js` already implements the `?redirect` mechanism (line 67) — no changes needed there.

**On first click (logged-in, Chrome):** A loading overlay shows "Loading voice model…" with a progress bar while Kokoro downloads (~82MB, one time only). On repeat visits this is instant from cache.

**Step-by-step conversation:**

1. User clicks "Reserve by Call" (model already cached → instant)
2. Browser asks for microphone permission once
3. Full-screen dark modal opens, styled like a phone call
4. AI speaks (Kokoro TTS): *"Hi, welcome to Noir Lounge. I'm your reservation assistant. How many guests will be joining you?"*
5. Rings pulse → status: "Listening…"
6. User: *"We'll be 4 people"*
7. AI: *"Perfect — 4 guests. What date were you thinking?"*
8. User: *"This Saturday"*
9. **AI silently calls `check_availability` tool** with `date: "2026-05-16"` → reads localStorage → gets available slots
10. AI: *"Saturday the 16th looks good — I can see openings at 7, 8, and 9:30. What time works for you?"*
11. User: *"8pm please"*
12. AI: *"8 PM — great. Any special occasion I should note?"*
13. User: *"It's our anniversary"*
14. AI summarises: *"So that's 4 guests this Saturday the 16th at 8 PM, anniversary dinner. Shall I confirm?"*
15. User: *"Yes, go ahead"*
16. **AI calls `confirm_reservation` tool** → reservation record created in localStorage
17. AI: *"Done! Your reservation at Noir Lounge has been requested. Enjoy your anniversary!"*
18. Modal auto-closes after 2 seconds, app navigates to `/booking/awaiting`

**Hang Up at any point:** modal closes immediately, no reservation created, user stays on venue page.

---

### Agent architecture — tool calling

The AI acts as an agent with two tools. Both are defined in the OpenRouter request as standard OpenAI-format `tools`. The frontend executes them locally against localStorage.

**Tool definitions (sent in every request):**

```js
const tools = [
  {
    type: 'function',
    function: {
      name: 'check_availability',
      description: 'Check which time slots are available on a given date for this venue. Call this as soon as the guest gives a date.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'ISO date YYYY-MM-DD' }
        },
        required: ['date']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'confirm_reservation',
      description: 'Create the reservation. Only call this after the guest has explicitly confirmed all details including their phone number.',
      parameters: {
        type: 'object',
        properties: {
          date:   { type: 'string', description: 'YYYY-MM-DD' },
          time:   { type: 'string', description: 'HH:MM 24h' },
          guests: { type: 'integer' },
          notes:  { type: 'string', description: 'Occasion or special request, empty string if none' },
          phone:  { type: 'string', description: 'Guest phone number as typed by the guest' }
        },
        required: ['date', 'time', 'guests', 'notes', 'phone']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'request_text_input',
      description: 'Show a text input field in the UI when voice input is impractical. Use this for phone numbers. Never ask the guest to speak their phone number.',
      parameters: {
        type: 'object',
        properties: {
          field: { type: 'string', description: 'Internal field name, e.g. "phone"' },
          label: { type: 'string', description: 'Label shown above the input, e.g. "Your phone number"' },
          hint:  { type: 'string', description: 'Placeholder text, e.g. "+33 6 12 34 56 78"' }
        },
        required: ['field', 'label']
      }
    }
  }
]
```

**Frontend tool executor:**

```js
function executeTool(name, argsJson) {
  const args = JSON.parse(argsJson)

  if (name === 'check_availability') {
    const slots = ['18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00']
    const taken = RESERVATION_LIST
      .filter(r => r.venueId === venue.id && r.date === args.date
               && ['REQUESTED','APPROVED','CHECKED_IN'].includes(r.status))
      .map(r => r.time)
    return { available: slots.filter(s => !taken.includes(s)), busy: taken }
  }

  if (name === 'request_text_input') {
    // Signal to the UI to show a text input overlay. Returns the value the user typed.
    // The modal watches pendingTextInput and resolves it when the user submits.
    return new Promise(resolve => {
      pendingTextInput.value = { ...args, resolve }
    })
  }

  if (name === 'confirm_reservation') {
    const res = new Reservation({
      id: Date.now(),
      venueId: venue.id,
      environmentId: null,
      elementId: null,
      userId: session.email,
      name: `${session.first_name} ${session.last_name}`,
      email: session.email,
      phone: args.phone,
      date: args.date,
      time: args.time,
      guests: args.guests,
      notes: args.notes,
      status: 'REQUESTED'
    })
    addReservation(res)
    addReservationLog(new ReservationLog({
      id: Date.now() + 1,
      reservationId: res.id,
      previousStatus: null,
      newStatus: 'REQUESTED',
      timestamp: new Date().toISOString(),
      actorRole: 'client'
    }))
    pendingReservationId.value = res.id
    return { success: true, reservationId: res.id }
  }
}
```

**Conversation loop with tool calls:**

```js
async function sendTurn(userText) {
  if (userText) {
    messages.push({ role: 'user', content: userText })
    liveFeed.push({ role: 'user', text: userText })
  }
  callState.value = 'thinking'

  // Loop handles chained tool calls before reaching a speech response
  while (true) {
    const { content, tool_calls, finish_reason } = await callAIWithHistory(messages, { tools })

    if (finish_reason === 'tool_calls' && tool_calls?.length) {
      // If the model included spoken content alongside tool calls (e.g. "I've opened a
      // field for your phone number" before request_text_input), speak it first.
      if (content) {
        messages.push({ role: 'assistant', content, tool_calls })
        liveFeed.push({ role: 'ai', text: content })
        callState.value = 'speaking'
        await speak(content)
        callState.value = 'thinking'
      } else {
        messages.push({ role: 'assistant', content: null, tool_calls })
      }
      // Execute each tool — must await because request_text_input returns a Promise
      // that only resolves once the user submits the text input overlay.
      for (const tc of tool_calls) {
        const result = await executeTool(tc.function.name, tc.function.arguments)
        messages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) })
      }
      // Loop back — AI will now respond with speech after seeing the tool results
      continue
    }

    // Regular speech response — speak it
    const speech = content
    messages.push({ role: 'assistant', content: speech })
    liveFeed.push({ role: 'ai', text: speech })
    callState.value = 'speaking'
    await speak(speech)

    if (pendingReservationId.value) {
      // confirm_reservation was called in the tool loop above
      callState.value = 'done'
      setTimeout(() => closeAndNavigate(), 2000)
    } else {
      startListening()
    }
    break
  }
}
```

> **Note:** `executeTool` must be declared `async` because `request_text_input` returns a `new Promise(...)` that suspends the loop until the user submits the phone number overlay. Without `await`, the result would be a pending Promise object, and `JSON.stringify(result)` would produce `"{}"` — the AI would receive an empty tool result and never have the phone number.

**System prompt:**
```
You are a warm, professional reservation assistant for {venueName}.
Collect reservation details through a natural voice conversation.
Today is {today}. The guest's name is {session.first_name} {session.last_name}.

Your goal — collect in this order:
1. Number of guests (voice)
2. Date → immediately call check_availability
3. Time from available slots (voice)
4. Occasion/special request — optional, accept "nothing" gracefully (voice)
5. Phone number — call request_text_input, NEVER ask them to speak it
6. Summarise all 5 fields and ask for confirmation
7. Only after explicit "yes/confirm/book it" → call confirm_reservation

Rules:
- Voice call: one short sentence per turn, never more
- Always call check_availability immediately after getting a date
- Always use request_text_input for phone — never ask the guest to say digits aloud
- Say "I've opened a field for your phone number" before calling request_text_input
- Only call confirm_reservation after explicit confirmation AND phone is collected
- If the guest says cancel/stop/hang up: say "Of course, goodbye!" and stop
- Resolve relative dates from today: {today}
```

---

### Call state machine

```
LOADING_MODEL   → Kokoro downloading (first visit only)
IDLE            → user clicks "Reserve by Call"
OPENING         → speak greeting (Kokoro TTS)
LISTENING       → Web Speech API active, waiting for user
THINKING        → message sent to Groq (may include tool calls internally)
SPEAKING        → Kokoro TTS playing AI response
  → if pendingReservationId set  → DONE
  → else                         → LISTENING
DONE            → wait 2s → close modal → navigate to /booking/awaiting
CANCELLED       → hang up tapped OR AI said goodbye → close modal
ERROR           → TTS/API/recognition failure → show message + "Try Again"
```

---

### What this feature CAN do
- Full multi-turn conversation — AI asks follow-ups and handles corrections mid-conversation ("actually make it 6 people")
- Check real availability against localStorage reservation data — tells user which slots are open on their chosen date
- Resolve relative dates ("this Saturday", "in two weeks")
- Create the reservation directly — no form, no confirm page
- Work 100% offline for TTS after the model is cached (API calls still need internet)

### What this feature CANNOT do
- Work in Firefox or Safari — Web Speech API requires Chrome or Edge (button is disabled with tooltip in other browsers)
- Select a specific table or environment — `elementId` is always null, staff assigns
- Handle heavy background noise
- First-visit model load is ~82MB — show a clear loading progress bar

---

### Implementation tasks

- [x] **`npm i kokoro-js`**

- [x] **`src/composables/useKokoro.js`** — Singleton TTS composable. All state is **module-level** (declared outside `useKokoro()`) so the model loads exactly once per browser session and all consumers share the same loading progress.
  - Module-level: `let _tts = null`, `let _currentSource = null`, `const modelReady = ref(false)`, `const modelLoading = ref(false)`, `const loadProgress = ref(0)`
  - `async loadModel()`: if `_tts` exists, return immediately. Sets `modelLoading = true`. Calls:
    ```js
    _tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
      dtype: 'q8',
      device: 'wasm',
      progress_callback: ({ progress }) => {
        if (progress != null) loadProgress.value = Math.round(progress * 100)
      }
    })
    ```
    Sets `modelReady = true`, `modelLoading = false`.
  - `async speak(text, voice = 'af_heart')`: calls `loadModel()` if needed, then `const output = await _tts.generate(text, { voice })`. Plays via Web Audio API:
    ```js
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const buffer = ctx.createBuffer(1, output.audio.length, output.sampling_rate)
    buffer.getChannelData(0).set(output.audio)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    return new Promise(resolve => { source.onended = resolve; source.start(0) })
    ```
    Stores the `source` ref so `stopSpeaking()` can call `source.stop()`.
  - `stopSpeaking()`: calls `currentSource?.stop()` and resolves any pending speak promise.
  - Export: `export function useKokoro() { return { loadModel, speak, stopSpeaking, modelReady, modelLoading, loadProgress } }`

- [x] **`src/components/ai/VoiceCallModal.vue`** — `v-dialog` with `fullscreen`. Props: `modelValue` (v-model), `venue`. Emits: `update:modelValue`.

  **Refs:** `callState` (string, see state machine above), `messages` (array), `liveFeed` (array of `{ role, text }`), `pendingReservationId` (null | number), `pendingTextInput` (null | `{ field, label, hint, resolve }`), `textInputValue` (string), `recognition` (SpeechRecognition instance), `speechSupported` (bool).

  **Text input overlay** (`v-if="pendingTextInput"`): slides up over the live feed. Shows `pendingTextInput.label` as the field label, `pendingTextInput.hint` as placeholder. A "Confirm" button calls `pendingTextInput.resolve({ field, value: textInputValue })` then sets `pendingTextInput = null`, `textInputValue = ''`. The `executeTool` Promise resolves with `{ field, value }` which the tool loop sends back to the AI as the tool result.

  **On mount:** Check `'SpeechRecognition' in window || 'webkitSpeechRecognition' in window` → set `speechSupported`. Create recognition instance: `lang = 'en-US'`, `continuous = false`, `interimResults = false`. Start pre-loading Kokoro model via `loadModel()` (non-blocking — model will be ready by the time user opens modal).

  **`watch(modelValue, open => { if (open) startCall() })`**

  **`startCall()`:**
  - If `!speechSupported`: `callState = 'error'`, error message = "Voice calls require Chrome or Edge."
  - Reset state: `messages = []`, `liveFeed = []`, `pendingReservationId = null`
  - Seed messages: `messages.push({ role: 'system', content: buildSystemPrompt() })`
  - `callState = 'opening'`
  - Greeting text: `"Hi, welcome to ${venue.name}. I'm your reservation assistant. How many guests will be joining you?"`
  - `messages.push({ role: 'assistant', content: greetingText })`
  - `liveFeed.push({ role: 'ai', text: greetingText })`
  - `await speak(greetingText)` then `startListening()`

  **`startListening()`:** `callState = 'listening'`. `recognition.start()`. `recognition.onresult = e => sendTurn(e.results[0][0].transcript)`. `recognition.onerror = e => { if (e.error === 'no-speech') { speak("Sorry, I didn't catch that.").then(startListening) } else { callState = 'error' } }`.

  **`sendTurn(userText)`:** As described in the architecture section above. Uses `callAIWithHistory(messages, { tools })` from `useAI`. Calls `executeTool` locally. After `pendingReservationId` is set and AI farewell is spoken, calls `closeAndNavigate()`.

  **`closeAndNavigate()`:** `emit('update:modelValue', false)` then `router.push('/booking/awaiting?id=' + pendingReservationId.value)`.

  **`hangUp()`:** `stopSpeaking()`, `recognition.abort()`, `callState = 'cancelled'`, `emit('update:modelValue', false)`.

  **UI layout:**
  - Background `#0A0E14`, full-screen
  - **Model loading overlay** (`v-if="modelLoading"`): centered `v-progress-linear` with `loadProgress`, text "Loading voice model… {loadProgress}%"
  - **Top bar:** venue name (Playfair, gold, centered), `mdi-phone-hangup` red icon top-right → `hangUp()`
  - **Center rings** (CSS only): 3 `div` elements with class `ring ring-{1,2,3}` inside a `.rings` wrapper. The wrapper's modifier class is set from `callState`. Keyframes to implement:
    - `rings--speaking`: each ring scales from 1→1.4 and fades out in sequence (staggered 0.15s delay each), gold (`#D4AF37`) border, 1.2s infinite
    - `rings--listening`: rings pulse silver (`#B0BEC5`) inward — scale 1.3→1.0, 1.4s infinite, staggered
    - `rings--thinking`: single slow clockwise border-rotation on the outermost ring, amber (`#FFB300`), 2s linear infinite; inner rings static
    - `rings--idle`: no animation, rings visible at 30% opacity
  - **Status label** below rings (mapped from `callState`): "Speaking…" / "Listening…" / "Processing…" / error text
  - **Live feed** (`v-for` on `liveFeed`, last 5 entries): small muted text, `"You: ..."` / `"Assistant: ..."`. Auto-scrolls to bottom.
  - **Hang Up FAB** bottom center: red `mdi-phone-hangup`, calls `hangUp()`

- [x] **`venue/[id].vue` — "Reserve by Call" button** — Import `VoiceCallModal`. Add `voiceCallOpen = ref(false)`. Add `<VoiceCallModal v-model="voiceCallOpen" :venue="venue" />`. Add CTA button next to "Make Reservation": `prepend-icon="mdi-phone"`, "Reserve by Call", outlined gold. **Always visible** (no `v-if`). On `@mouseenter`: call `loadModel()` to pre-warm Kokoro. On click — `openVoiceCall()`:
  ```js
  function openVoiceCall() {
    if (!_session) {
      router.push(`/auth?redirect=${encodeURIComponent(route.fullPath)}`)
      return
    }
    const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    if (!supported) {
      showSnackbar('Voice calls require Chrome or Edge')
      return
    }
    voiceCallOpen.value = true
  }
  ```
  After login the router guard's existing `?redirect` mechanism (router/index.js line 67) returns the user to this venue page automatically — no changes to the router needed.

### Testing

**Automated — `e2e/ai-phase2.spec.js`:**
```
- Log in as client, navigate to /venue/[seed venue id]
- Assert "Reserve by Call" button is visible
- Log out, navigate to same page — assert button is NOT visible
- Log in, mock window.SpeechRecognition + webkitSpeechRecognition as undefined
  Click the button — assert snackbar appears, modal does NOT open
- With mock SpeechRecognition available, click the button
  Assert the modal opens full-screen
  Assert the hang up icon is visible
  Click hang up — assert modal closes
  Assert RESERVATION_LIST length is unchanged (no reservation created)
- Simulate a full booking: inject a mock for callAIWithHistory that returns
  confirm_reservation tool_call, then a farewell speech response.
  Inject mock executeTool to verify it was called with correct args.
  Assert after farewell TTS: modal closes and router navigates to /booking/awaiting
```

**Manual test required (Chrome only):**
```
1. Log in as client@spotly.com / client123
2. Navigate to any venue page
3. Hover over "Reserve by Call" — model pre-loading starts (watch Network tab)
4. Click "Reserve by Call" — allow microphone when prompted
5. If first visit: loading progress bar appears until model is ready (~82MB)
6. Modal opens, AI greets you in a natural voice (not robotic)
7. Have a full conversation:
   AI asks guests → say "3 people"
   AI asks date → say "next Saturday"
   AI should immediately mention available times (it called check_availability)
   Pick a time → AI asks occasion → say "birthday dinner"
   AI summarises → say "yes confirm"
8. Modal should close automatically, you land on /booking/awaiting
9. Open admin dashboard — verify the reservation appears with correct date/time/guests
10. Test hang up: reopen modal, say one answer, click the red button → modal closes, no new reservation
11. Test unavailable time: seed a reservation for next Saturday at 7pm, try to book 7pm → AI should say that time is taken and offer alternatives
✅ Confirm all steps before marking Phase AI-2 done
```

### Session Notes
- [x] Phase AI-2 complete
- **Completed on:** 2026-05-12
- **Issues found:** Vuetify dialog lazy-mounts content so `watch` needed `{ immediate: true }`. Kokoro TTS blocks model load until first use.

---

## AI Phase 3 — "Describe Your Evening" Venue Match

**Scope:** `src/pages/home.vue`
**Prerequisite:** AI Phase 1 complete. No dependency on Phase 2.
**Goal:** A second discovery mode on the home page. Instead of filtering by keyword or activity tag, the user describes their ideal evening in free text. The AI ranks the venue list by semantic fit and explains each match with one sentence.

---

### Exact user journey

**Entry point:** `/home` — a mode toggle sits above the existing search bar, visible to all users (logged in or not).

```
home.vue search area
  ├── [ Search ]  [ Describe with AI ]   ← new toggle pills (default: Search)
  ├── (Search mode) existing search input + activity filter tags — unchanged
  └── (Describe mode) textarea + "Find Venues" button  ← new
```

**Step-by-step flow:**

1. User sees the toggle: **Search** (active by default) | **Describe with AI**
2. User clicks "Describe with AI"
3. The search input and activity filter chips hide
4. A textarea appears: placeholder *"Describe your ideal evening — occasion, vibe, music, dress code…"*
5. User types: *"Looking for a romantic and intimate spot for a proposal dinner, formal atmosphere, ideally with soft live music"*
6. User clicks **"Find Venues"**
7. The venue grid switches to skeleton loaders (3 cards)
8. Results appear — venues reordered from most to least relevant
9. Each venue card gains a gold sparkle badge with the AI's one-line reason:
   - *"Intimate setting and formal dress code — ideal for a proposal"*
   - *"Upscale ambience with live jazz, romantic atmosphere"*
10. Venues with no good match are either ranked last or excluded entirely (depends on AI response)
11. User clicks a venue → normal `/venue/[id]` detail page, behavior is identical

**Returning to Search mode:**
- User clicks "Search" pill → textarea hides, search input and filters reappear, AI ranking cleared, original venue order restored

---

### What the AI receives and returns

**System prompt:**
```
You are a venue recommendation engine for Spotly.
Match the user's description to the venues listed below.
Return ONLY valid JSON — an array sorted by relevance (best match first):
[{ "venueId": <number>, "reason": "<one sentence, max 12 words, specific to this venue>" }]

Rules:
- Only include venues that genuinely match the description.
- Omit any venue that does not match — do not include it with a weak reason.
- The reason must cite something specific from the venue data (ambience, activities, dressCode).
- Never invent features the venue does not have.
- If no venue matches, return an empty array [].

Venues:
{JSON.stringify(VENUE_LIST.map(v => ({
  id: v.id,
  name: v.name,
  description: v.description,
  ambienceTags: v.ambienceTags,
  activities: v.activities,
  dressCode: v.dressCode
})))}
```

**User message:** the textarea content.

---

### What this feature CAN do
- Understand mood, occasion, formality, and vibe from natural language
- Rank venues even when no keyword matches (e.g., "moody" → matches "dark", "atmospheric")
- Exclude irrelevant venues — the AI is allowed to return fewer venues than the full list
- Work for logged-out users (no session required for discovery)

### What this feature CANNOT do
- Filter by price, availability, or location — none of these are in the data model
- Learn from the user's past choices
- Guarantee results — if venue descriptions are thin, AI matches will be weak
- Respond instantly — expect 2–5 seconds
- Handle very short input (under 10 characters) — guarded with a snackbar

---

### Implementation tasks

- [ ] **`home.vue` — mode toggle** — Add `discoveryMode = ref('search')`. Add two `v-btn` pill/toggle buttons above the search bar: "Search" and "Describe with AI". Active pill is gold-filled, inactive is outlined. `v-show` existing search input and activity filter row only when `discoveryMode === 'search'`.

- [ ] **`home.vue` — describe input** — Add `describeQuery = ref('')` and `aiSearchLoading = ref(false)`. When `discoveryMode === 'describe'`: show a `v-textarea` (rows=2, auto-grow, no resize) with the placeholder text and a "Find Venues" `v-btn` (gold, `append-icon="mdi-creation"`). Button calls `runSemanticSearch()`, disabled when `aiSearchLoading`.

- [ ] **`home.vue` — `runSemanticSearch()`** — Async function:
  1. If `describeQuery.value.trim().length < 10` → snackbar *"Please describe your evening in a bit more detail."* return.
  2. `aiSearchLoading = true`, `aiRankedVenues = null`.
  3. Build venue payload from `VENUE_LIST`.
  4. `callAI(systemPrompt, describeQuery.value, { json: true, maxTokens: 512 })`.
  5. Validate it is an array. Filter out entries where `getVenueById(r.venueId)` is null. Map to `[{ venue, reason }]`.
  6. `aiRankedVenues = result`.
  7. On error: snackbar *"AI matching unavailable — try the search bar instead."*
  8. `aiSearchLoading = false`.

- [ ] **`home.vue` — `displayedVenues` computed** — Add `aiRankedVenues = ref(null)`. Computed `displayedVenues`: if `discoveryMode === 'describe'` and `aiRankedVenues !== null`, return `aiRankedVenues.map(r => r.venue)`. Otherwise return the existing filtered/searched venue list. The `v-for` on venue cards uses `displayedVenues`. Pass a `reason` prop (or use a separate lookup) into each card when in describe mode.

- [ ] **`home.vue` — reason badge on venue cards** — When `discoveryMode === 'describe'` and `aiRankedVenues` is set, overlay a `v-chip` on each venue card: `color="amber-darken-2"`, `prepend-icon="mdi-creation"`, `size="small"`, showing `aiRankedVenues.find(r => r.venue.id === venue.id)?.reason`.

- [ ] **`home.vue` — skeleton + empty state** — When `aiSearchLoading`: replace venue grid with 3 `v-skeleton-loader type="card"`. After search completes with empty array: show centered text *"No venues matched your description — try different words or switch to Search."*

- [ ] **`home.vue` — reset on mode switch** — `watch(discoveryMode, () => { aiRankedVenues = null; describeQuery = '' })` — clears AI state when switching modes.

### Testing

**Automated — `e2e/ai-phase3.spec.js`:**
```
- Navigate to /home
- Assert "Describe with AI" pill is visible; clicking it hides the search input and shows the textarea
- Click "Search" pill — assert textarea hides and search input is visible
- In Describe mode, click "Find Venues" with empty input — assert snackbar about detail appears
- In Describe mode, type fewer than 10 chars and click "Find Venues" — assert same snackbar
- Mock the Groq fetch to return [{ venueId: <real seed id>, reason: "Great match" }]
  Type a long description, click "Find Venues"
  Assert: skeleton loaders appear during fetch, then the venue card for that id appears with a chip containing "Great match"
- Mock the fetch to return [] — assert the empty state message appears
- Mock the fetch to throw — assert the error snackbar appears and venue grid is restored to original
- After getting AI results, click "Search" pill — assert reason chips are gone and all venues are shown
```

**Manual test required:**
```
1. Open http://localhost:3000 (login not required)
2. Click "Describe with AI"
3. Type: "I want a very elegant venue for a proposal dinner, quiet, formal dress code"
4. Click "Find Venues"
5. Verify skeleton loaders appear briefly
6. Verify venue cards reorder and each has a gold reason badge
7. Verify the top result makes sense given the description
8. Click "Search" — verify badges disappear and original order is restored
9. Try a vague description that matches nothing: "I like tacos and karaoke"
   → verify the empty state message appears
✅ Confirm before marking Phase AI-3 done
```

### Session Notes
- [ ] Phase AI-3 complete
- **Completed on:** —
- **Issues found:** —

---

## AI Phase 4 — Admin Natural Language Insights

**Scope:** `src/pages/admin/dashboard.vue`
**Prerequisite:** AI Phase 1 complete. No dependency on phases 2 or 3.
**Goal:** An "AI Insights" card on the admin dashboard that analyses the venue's last 30 days of reservation data and returns 3–5 actionable observations in plain English. Generated on demand (one button click) — never auto-runs on page load.

---

### Exact user journey

**Entry point:** `/admin/dashboard` — the card is placed below the four stat cards, before the reservations table.

```
admin/dashboard.vue
  ├── [stat cards row]
  ├── ── ── ── ── ── ──
  ├── [AI Insights card]   ← new
  └── [reservations table]
```

**Step-by-step flow:**

1. Admin opens the dashboard — the card shows an empty state: sparkle icon, *"Click Generate to get AI insights about your reservations."*, and a **"Generate Insights"** button (gold, outlined)
2. Admin clicks "Generate Insights"
3. Button goes into loading state (spinner inside), 3 skeleton rows appear in the card body
4. After ~3–5 seconds, 3–5 insight bullets render:

   | Icon | Color | Text |
   |------|-------|------|
   | `mdi-trending-up` | green | "Friday 8pm has been fully booked 4 weeks running — consider opening a second seating." |
   | `mdi-alert` | amber | "No-show rate is 16.7% — sending day-of reminders could reduce losses." |
   | `mdi-cake-variant` | blue | "Birthday celebrations appear in 40% of notes — a birthday package could drive bookings." |
   | `mdi-weather-sunny` | blue | "Tuesday evenings are your slowest slot — a happy-hour promotion could fill the gap." |

5. Timestamp beneath the card: *"Last updated just now"*
6. Button changes label to **"Regenerate"** with a `mdi-refresh` icon
7. Admin can click "Regenerate" at any time to re-run with fresh data

---

### What gets sent to the AI (no PII)

The app aggregates before calling the API — raw names/emails are never sent.

```js
{
  period: 'last 30 days',
  total: 42,
  byStatus: { COMPLETED: 18, NO_SHOW: 7, CANCELLED: 5, APPROVED: 8, REQUESTED: 4 },
  noShowRate: '16.7%',
  cancellationRate: '11.9%',
  byDayOfWeek: { Mon: 2, Tue: 3, Wed: 4, Thu: 6, Fri: 12, Sat: 11, Sun: 4 },
  peakHour: '20:00',
  quietestDay: 'Tuesday',
  avgGuests: 3.2,
  topOccasions: ['birthday', 'anniversary', 'business dinner'],
  walkInCount: 3,
  walkInRatio: '7.1%'
}
```

**System prompt:**
```
You are a restaurant analytics assistant. Analyze this venue's reservation data and return
ONLY valid JSON — an array of 3 to 5 insights:
[{ "icon": "<mdi icon name>", "severity": "info|warning|success", "text": "<one actionable sentence, max 20 words, cite a number from the data>" }]

Severity guide: "success" = positive trend to reinforce, "warning" = problem to address, "info" = neutral observation with an opportunity.
Use specific mdi icon names (e.g. mdi-trending-up, mdi-alert, mdi-calendar-check).
Every insight must reference at least one number from the data.
```

---

### What this feature CAN do
- Spot patterns across days of week and time slots
- Flag no-show and cancellation rates
- Identify occasion trends from notes keywords
- Compare peak vs. quiet periods
- Distinguish walk-in vs. booked ratio

### What this feature CANNOT do
- Analyse revenue or financial performance (not in the data model)
- Send notifications or take any action — read-only observations only
- Compare against industry averages (no external benchmark data)
- Detect multi-week trends beyond 30 days
- Generate reliable insights if there are fewer than ~10 reservations in the window (the AI will note the low sample size or return generic bullets)

---

### Implementation tasks

- [ ] **`admin/dashboard.vue` — `computeInsightPayload()`** — Function that reads `RESERVATION_LIST` filtered to `session.venueId`, last 30 days. Computes and returns the stats object (see structure above). `byDayOfWeek` uses `['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(r.date).getDay()]`. `peakHour` = the hour key with the highest count from `byHour`. `quietestDay` = lowest count day. `topOccasions` = scan `r.notes` (lowercased) for `['birthday','anniversary','business','proposal','date night']`, return those that appear in at least 2 reservations. `walkInRatio` = `(walkInCount / total * 100).toFixed(1) + '%'`.

- [ ] **`admin/dashboard.vue` — AI Insights card UI** — Import `useAI`. Add refs: `insights = ref(null)`, `insightsLoading = ref(false)`, `insightsError = ref(null)`, `insightsGeneratedAt = ref(null)`. Add computed `insightsTimestamp`: `null` when `insightsGeneratedAt` is null, `"Just now"` when < 60s ago, `"X min ago"` when < 60m, `"X hours ago"` otherwise (based on `Date.now() - insightsGeneratedAt.getTime()`). Note: timestamp label does not auto-update — it only recomputes when `generateInsights` runs again (static snapshot is fine).

- [ ] **`admin/dashboard.vue` — `generateInsights()`** — Async function:
  1. `insightsLoading = true`, `insightsError = null`
  2. `const payload = computeInsightPayload()`
  3. `const result = await callAI(systemPrompt, JSON.stringify(payload), { json: true, maxTokens: 512 })`
  4. Validate `Array.isArray(result)` — if not, throw `"Unexpected response format"`
  5. `insights.value = result`, `insightsGeneratedAt.value = new Date()`
  6. On catch: `insightsError.value = e.message`
  7. `insightsLoading.value = false`

- [ ] **`admin/dashboard.vue` — card template** — Place a `v-card` below stat cards. Card header row: left side has `mdi-creation` icon + "AI Insights" title + `insightsTimestamp` (muted, small); right side has "Generate" / "Regenerate" `v-btn` (gold outlined, `mdi-refresh` icon, disabled when `insightsLoading`). Card body:
  - `v-if="insightsLoading"`: three `v-skeleton-loader type="list-item-two-line"`
  - `v-else-if="insightsError"`: `v-alert type="error"` showing `insightsError`
  - `v-else-if="insights"`: `v-list` with one `v-list-item` per insight. `prepend-icon` = `insight.icon`, icon color from severity map (`success`→green, `warning`→amber, `info`→blue). Item title = `insight.text`. No subtitles, no avatars.
  - `v-else` (empty state): centered `mdi-creation` (48px, muted) + *"Click Generate to get AI-powered insights about your reservations."*

### Testing

**Automated — `e2e/ai-phase4.spec.js`:**
```
- Log in as admin, navigate to /admin/dashboard
- Assert the AI Insights card is visible with the empty state text
- Assert the "Generate Insights" button is present and enabled
- Mock the Groq fetch to return a valid insights array (3 items with icon/severity/text)
- Click "Generate Insights"
- Assert loading skeletons appear during the mocked delay
- Assert after response: insight list renders with 3 items
- Assert the button label changes to "Regenerate"
- Assert the timestamp "Just now" appears
- Mock the fetch to throw an error
- Click "Regenerate" — assert error alert appears with the error message
- Reload the page — assert empty state is restored (insights are not persisted)
```

**Manual test required:**
```
1. Log in as admin@spotly.com / admin123, navigate to /admin/dashboard
2. Confirm the AI Insights card is visible below the stat cards
3. Click "Generate Insights"
4. Verify loading skeletons appear
5. After ~5 seconds, verify 3–5 insight bullets appear with icons
6. Verify each bullet references a specific number (no vague generic text)
7. Check that severity colors are correct (green/amber/blue)
8. Verify the "Just now" timestamp appears
9. Click "Regenerate" — verify the card refreshes with the same or updated bullets
✅ Confirm before marking Phase AI-4 done
```

### Session Notes
- [ ] Phase AI-4 complete
- **Completed on:** —
- **Issues found:** —

---

## Global Notes

**API cost:** Groq — $0 (free tier). Kokoro TTS — $0 (runs locally, no external calls after model download).
**TTS:** Kokoro.js runs entirely in the browser via WebAssembly. The 82MB ONNX model downloads once and is permanently cached. No API key, no rate limits, no external dependency after first load.
**Browser compatibility:** Web Speech API (Phase AI-2 only) requires Chrome or Edge. The "Reserve by Call" button is disabled in other browsers with a snackbar explaining why.
**Data privacy:** No reservation names, emails, or phone numbers are sent to any external API. Phase 4 sends only aggregated counts and percentages.
**Offline / API down:** Every feature has a graceful error state — the app degrades to its non-AI behavior rather than breaking.
