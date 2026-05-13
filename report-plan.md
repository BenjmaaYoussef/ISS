# Spotly — Report Plan
> Reference this file before writing any section. Do NOT start writing without consulting it.

---

## Output

- File: `spotly/docs/submissions/06-report.tex`
- Format: LaTeX → compile to PDF, then convert to Word
- Compiler: `pdflatex` (run twice for ToC/LoF)

---

## Cover & Metadata

- **Title**: Spotly — Luxury Venue Discovery and Booking Platform
- **Course**: ISS296 — Spring 2026
- **Supervisor**: Amine Ben Hassouna · amine.benhassouna@medtech.tn
- **Team** (in order):
  1. Cyrine Krichen
  2. Eya Sassi
  3. Lina Khemiri
  4. Youssef Ben Jemaa

---

## Timeline / Task Dates

| Period | Activity |
|--------|----------|
| 12 Jan 2026 | Semester starts |
| 13–25 Jan 2026 | Project idea scoping and team setup |
| 26 Jan 2026 (week of) | Data model design + UML diagrams begin |
| 3–5 Feb 2026 | Initial documents (navigation diagram, features & roles, features grouping, scenarios) — first version |
| 5 Feb 2026 | Sketching session (hand-drawn wireframes) |
| 3 Feb – 22 Feb 2026 | Learning phase: HTML/CSS, JavaScript, Vue.js, Vuetify |
| 3 Mar 2026 | UI code complete (all pages implemented) |
| Mar–early Apr 2026 | Data layer wiring, booking flow, admin/staff dashboards |
| 8 Apr 2026 | AI features begin (Phase AI-1 through AI-3) |
| Apr–May 2026 | AI polish, voice reservation agent, submission documents updated |

For invented sub-dates (individual tasks within each block), use plausible Monday/Wednesday dates inside those windows.

---

## Task Assignment (random — temporary until real data arrives)

Assign features/tasks evenly across 4 members. Suggested split:

- **Cyrine**: UI design system, floor plan builder (F13), venue settings (F18), admin onboarding (F11), sketches
- **Eya**: Authentication (F1), client booking flow (F5–F9), client dashboard (F9)
- **Lina**: Admin dashboard (F12), reservation queue (F15), reviews (F10, F16), QR codes (F17), menu management (F14)
- **Youssef**: Data model, venue discovery (F2–F4), staff dashboard (F19–F20), AI features (F21–F23)

---

## Hardware Environment Table

| Member | Machine | CPU | RAM | OS |
|--------|---------|-----|-----|----|
| Cyrine Krichen | *(placeholder)* | Intel Core i5 | 16 GB | Windows 11 |
| Eya Sassi | Lenovo IdeaPad 3 | Intel Core i3-1115G4 | 8 GB | Windows 11 |
| Lina Khemiri | *(placeholder)* | AMD Ryzen 5 | 8 GB | Windows 10 |
| Youssef Ben Jemaa | MacBook Pro (2020) | Apple M1 | 8 GB | macOS Sequoia |

---

## Software Environment

- OS: macOS Sequoia / Windows 11 / Windows 10
- IDE: Visual Studio Code
- Browser (dev): Google Chrome + Firefox (for cross-browser testing)
- Version control: Git + GitHub
- Package manager: npm
- Build tool: Vite 5

---

## Technology Stack (Ch. 4 — Technological Choices)

Must include logos where possible (use `\includegraphics` or text descriptions).

| Technology | Role |
|-----------|------|
| HTML5 | Markup |
| CSS3 + SCSS | Styling, CSS custom properties (design tokens) |
| JavaScript (ES2022+) | Application logic |
| Vue.js 3 | Reactive component framework, Composition API |
| Vuetify 3 | Material UI component library (theme customised with champagne gold palette) |
| Vite | Dev server and production bundler |
| `unplugin-vue-router` | File-based routing |
| `unplugin-vue-components` | Auto-import of components |
| Cloudinary | Image hosting for venue slideshow photos |
| localStorage | Client-side data persistence (no backend) |
| Groq API | LLM inference provider for all AI features (free tier) |
| ElevenLabs API | Neural text-to-speech for the voice reservation agent (optional, falls back to browser SpeechSynthesis) |
| Web Speech Recognition API | Browser-native speech-to-text for the voice agent (Chrome/Edge only) |

---

## Advanced Technologies Section ⭐ (HIGH PRIORITY)

This section must be rich and technically accurate. Three sub-sections:

### 1. AI Semantic Venue Discovery (F22)
- Uses Groq API with `meta-llama/llama-4-scout-17b-16e-instruct`
- User types a natural-language description of their desired atmosphere
- Full venue list (id, name, description, ambienceTags, activities, dressCode) sent to the model
- Model returns a ranked list of venue IDs with one-line reason per match
- Zero tool calls — single prompt-and-response pattern

### 2. AI Reservation Insights (F23)
- Admin clicks "Generate" on the admin dashboard
- Past-30-day reservation data is aggregated: totals, status breakdown, day-of-week distribution, hour distribution, average guest count
- Aggregated stats sent to the model as structured JSON
- Model returns 3–5 bullet insights with severity levels (info / warning / success)
- No external data — all derived from localStorage

### 3. AI Voice Reservation Agent (F21) — THE STAR FEATURE
**This must be the most detailed section. Explain:**

#### What makes it an agent (not a chatbot)
The voice reservation feature is implemented as a **tool-calling agent**. The LLM (LLaMA 4 via Groq) is given a set of 4 tools and runs in an agentic loop — after each turn, if the model decides to call a tool, the frontend executes it and feeds the result back into the conversation as a `tool` role message. The loop continues until the model emits a plain speech response (no tool calls). This is the standard agentic pattern: **LLM → tool call → tool result → LLM → ...**

#### The 4 tools (explain each):
1. **`check_availability`** — given a date and guest count, queries the `RESERVATION_LIST` in localStorage, filters tables by capacity, and returns per-environment available time slots. The model calls this automatically the moment the guest mentions a date.
2. **`request_text_input`** — triggers a text input overlay in the UI and returns a **Promise** that only resolves when the guest physically types their phone number and taps Confirm. This is a hybrid voice+text interaction — the only thing collected by typing (phone numbers are hard to transcribe reliably from voice).
3. **`confirm_reservation`** — creates a `Reservation` object, validates it client-side (past date guard, working hours check, real-time table availability check against localStorage), and persists it. Passes back an error payload if validation fails so the AI can recover gracefully and ask the guest to choose again.
4. **`end_call`** — signals the call lifecycle to the frontend, triggering either a "cancelled" state or a redirect to the awaiting-decision page.

#### What is non-traditional about this tool use
- Tools are NOT called through a traditional API or backend. The tool execution happens **entirely in the browser**, directly against the localStorage data model.
- The `request_text_input` tool suspends the agentic loop with a `Promise` — the loop is paused until the user types, then resumes with the typed value injected as the tool result. This is a live UI ↔ AI co-operation pattern not commonly seen in simple AI demos.
- The conversation history is maintained in a `messages` array that grows across the full call with proper roles: `system`, `user`, `assistant`, `tool`. The model sees its own previous tool calls and results.
- TTS: ElevenLabs API (primary, `eleven_turbo_v2_5` model) with graceful fallback to Web Speech Synthesis API.
- STT: Web Speech Recognition API (Chrome/Edge only, `continuous: false`, auto-restarts on silence).
- A live transcript feed shows the conversation + tool activity (spinning gear icon) in real time.

---

## Diagrams & Images

| Asset | Source file | Usage in report |
|-------|-------------|----------------|
| Navigation diagram | `submissions/nav.png` | Ch. 3 — Navigation diagram |
| Class diagram | `submissions/class.png` | Ch. 3 — Data model diagram |
| Wireframe screenshots | `e2e/wireframes/screenshots/*.png` | Ch. 3 — Sketching (replaced later by hand-drawn scans) |
| UI screenshots | `e2e/wireframes/screenshots/*.png` | Ch. 4 — User interfaces (replaced later by real screenshots) |

All wireframe PNGs exist at: `e2e/wireframes/screenshots/`
Files: P01_Landing, P02_Auth, P03_Home, P04_VenuePublicProfile, P06_ClientDashboard,
P06_D1_SubmitReview, P06_D2_CancelReservation, P07_BookingEnvironment, P08_BookingSeats,
P09_BookingConfirm, P10_BookingAwaiting, P11_AdminOnboarding, P12_AdminDashboard,
P13_FloorPlanBuilder, P13_D3_AddEnvironment, P13_D4_DeleteConstraint, P13_D5_DeleteEnvironment,
P14_MenuManagement, P14_D6_AddMenuItem, P15_ReservationQueue, P15_D7_RejectReservation,
P16_GuestReviews, P17_QRCodeGenerator, P18_VenueSettings, P19_StaffDashboard,
P19_D8_GuestCheckIn, P19_D9_WalkInGuest, P19_D10_TableDetail, P20_NotFound

---

## Report Structure Checklist

- [ ] Cover page
- [ ] Table of Contents (`\tableofcontents`)
- [ ] List of Figures (`\listoffigures`)
- [ ] Acknowledgement
- [ ] Introduction (course context, web dev domain, luxury venue booking domain)
- [ ] Chapter 1: Analysis and Requirement Specification
  - [ ] 1.1 Introduction
  - [ ] 1.2 Description of the project
  - [ ] 1.3 Objectives
  - [ ] 1.4 Target customers
  - [ ] 1.5 Value proposition
  - [ ] 1.6 System roles (table — 4 roles)
  - [ ] 1.7 Features (F1–F23, grouped Phase 1 / Phase 2)
  - [ ] 1.8 Conclusion
- [ ] Chapter 2: Planning
  - [ ] 2.1 Introduction
  - [ ] 2.2 Team members (table)
  - [ ] 2.3 List of tasks (table with dates + who)
  - [ ] 2.4 Conclusion
- [ ] Chapter 3: Software Design
  - [ ] 3.1 Introduction
  - [ ] 3.2 Navigation diagram (nav.png)
  - [ ] 3.3 Sketching (wireframe PNGs as placeholders)
  - [ ] 3.4 Data model diagram (class.png)
  - [ ] 3.5 Conclusion
- [ ] Chapter 4: Project Implementation
  - [ ] 4.1 Introduction
  - [ ] 4.2 Hardware Environment (table)
  - [ ] 4.3 Software Environment
  - [ ] 4.4 Technological Choices (with logos/descriptions)
  - [ ] 4.5 Advanced Technologies (AI — semantic search, insights, voice agent)
  - [ ] 4.6 User Interfaces (all views, with placeholder screenshots)
  - [ ] 4.7 Conclusion
- [ ] General Conclusion (challenges, goals reached, future work)
- [ ] Appendix: Use Case Scenarios — use `\input{05-scenarios-content}` or copy the scenario bodies directly. Do NOT duplicate the \documentclass wrapper. Extract only the scenario content (from after \begin{document} to before \end{document}).

---

## Feature ID Cross-Reference (must match 03-features-and-roles.tex exactly)

F1 User Authentication · F2 Venue Discovery and Search · F3 Venue Public Profile
F4 Digital Menu · F5 Booking: Environment Selection · F6 Booking: Seat and Table Selection
F7 Reservation Submission · F8 Real-Time Reservation Status Tracking
F9 Client Dashboard and Reservation Management · F10 Guest Review Submission
F11 Admin Venue Onboarding · F12 Admin Dashboard and Overview · F13 Floor Plan Builder
F14 Menu Management · F15 Reservation Queue Management · F16 Guest Review Management
F17 QR Code Generation · F18 Venue Identity and Settings · F19 Staff Operations Dashboard
F20 Waiter Call System · F21 AI Voice Booking · F22 AI Semantic Venue Discovery
F23 AI Reservation Insights

---

## Framing of AI Features (IMPORTANT)

The AI features (F21–F23) were **not part of the original project plan**. After delivering the full core platform, the team identified opportunities to further enhance the user experience through AI. They are presented in the report as an organic evolution of the project — features born from a desire to push the platform further after the core was solid, not as deliverables planned from day one.

In practice this means:
- Chapter 1 (Features): list F21–F23 under a clearly separated "Phase 2 — AI Enhancements" subsection, framed as later additions
- Chapter 2 (Planning): the task table should show AI tasks starting only from 8 April 2026, visually separate from Phase 1 tasks
- Chapter 3 (Design): navigation diagram and class diagram reflect the final state (which includes AI). Mention briefly that the diagram was updated after Phase 2 was added.
- Chapter 4 (Advanced Technologies): frame the AI section as "following the completion of the core platform, the team explored AI integration..." — not as something designed upfront
- General Conclusion: mention AI as an unexpected enrichment of the project, and hint at future directions (e.g. AI table recommendations, predictive no-show detection)

---

## Notes / Constraints

- ReservationLog was removed from the codebase. It does NOT appear in the class diagram. Do not reference it anywhere.
- Roles are derived at runtime, not stored as a field on User (CLAUDE.md constraint). The report must reflect this.
- Working hours for the voice agent are hardcoded: 18:00–22:00 in 30-minute slots.
- Wireframe images in Ch. 3 (Sketching) will be replaced by hand-drawn scans — note this in the LaTeX comment.
- UI screenshots in Ch. 4 will be replaced by real screenshots — note this in the LaTeX comment.
- For the sketching section: include all 29 wireframe views. Each gets a title and 1–2 line description. Group them by area (Public, Booking Flow, Client, Admin, Staff) with a subsection heading per group.
