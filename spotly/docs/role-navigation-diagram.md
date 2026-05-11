# Spotly Role Navigation Analysis

This diagram maps route-level behavior from router guards, page redirects, and role-driven actions.

## Roles covered

- Guest (no session)
- Client (authenticated, non-owner, non-staff)
- Venue Owner/Admin (email matches venue admin)
- Staff (email mapped in venue-staff records)
- System routing layer (guards, 404, route recovery)

## Mermaid Navigation Diagram (Landscape)

```mermaid
flowchart LR
  Start([App Start]) --> Index[Index route]
  Index --> Landing[Landing]

  subgraph Public[Public Surface]
    direction LR
    Landing --> Auth[Auth]
    Landing --> Home[Home]
    Home --> Venue[Venue detail]
    Venue --> Menu[Menu page]
    Venue --> Env[Booking environment]
    Seed[Seed page]:::aux
    NotFound[404 catch-all]:::aux
  end

  subgraph RouterGuards[Router And Guard Layer]
    direction TB
    GuardNoSession{No session and gated path?}
    GuardAdmin{Path starts /admin and is owner?}
    GuardStaff{Path starts /staff and is staff or owner?}
    OnboardGate{Owner accessing /admin/*\nwith incomplete onboarding?}
  end

  subgraph Guest[Guest Scenarios]
    direction TB
    G1[Open public routes\nlanding home venue menu]
    G2[Try gated route\nadmin staff client booking]
    G3[Redirect to /auth?redirect=target]
  end

  subgraph AuthFlow[Auth Scenarios]
    direction TB
    A1[Login with valid credentials]
    A2[Register new user then auto-login]
    A3[Session written in localStorage\nspotly_session]
    A4[Redirect to query redirect or /home]
    A5[Invalid credentials -> stay on auth]
  end

  subgraph Client[Client Role Scenarios]
    direction TB
    C1[Discover venues in /home]
    C2[Open /venue/:id]
    C3[Start booking flow]
    C4[Select environment]
    C5[Pick tables seats date time]
    C6[Confirm and submit reservation]
    C7[Booking awaiting status tracking]
    C8[Approved to client dashboard]
    C9[Rejected to rebook or dashboard]
    C10[Cancel request to client dashboard]
    C11[Client dashboard\nview upcoming and past cancel review]
  end

  subgraph Staff[Staff Role Scenarios]
    direction TB
    S1[Allowed: /staff/*]
    S2[Staff dashboard]
    S3[Manage waiter calls]
    S4[Check-in no-show check-out]
    S5[Create walk-in reservations]
    S6[Logout to auth]
  end

  subgraph Owner[Venue Owner Admin Scenarios]
    direction TB
    O1[Allowed: /admin/*]
    O2[Onboarding required if venue missing\nname or environments]
    O3[Admin onboarding to floor-plan]
    O4[Admin dashboard]
    O5[Admin nav pages\nfloor-plan menu reservations reviews qr-codes venue-settings]
    O6[Manage reservations approve reject]
    O7[Owner previewing own venue\nvenue banner to admin dashboard]
    O8[Open venue CTA from home\ncreate venue to admin onboarding]
    O9[Logout to auth]
  end

  subgraph CrossRole[Cross Role Outcomes]
    direction TB
    X1[Non-owner to admin area]
    X2[Staff hitting admin area goes to staff dashboard]
    X3[Client hitting admin area goes to home]
    X4[Non staff owner to staff area goes to home]
    X5[404 go home route by session\nowner admin dashboard\nstaff staff dashboard\nclient home\nguest landing]
    X6[Booking confirmation guard\nno auth to auth\nempty cart to booking seats]
  end

  Start --> GuardNoSession
  GuardNoSession -- Yes --> G3
  GuardNoSession -- No --> GuardAdmin

  Landing --> G1
  G2 --> G3
  G3 --> Auth

  Auth --> A1
  Auth --> A2
  Auth --> A5
  A1 --> A3 --> A4
  A2 --> A3
  A4 --> Home

  Home --> C1
  C1 --> C2 --> C3
  C3 --> Env --> C4 --> C5 --> C6 --> C7
  C7 --> C8
  C7 --> C9
  C7 --> C10
  C8 --> C11
  C9 --> Env
  C10 --> C11

  GuardAdmin -- Yes --> OnboardGate
  GuardAdmin -- No --> X1
  X1 --> X2
  X1 --> X3

  OnboardGate -- Yes --> O3
  OnboardGate -- No --> O4
  O1 --> O4 --> O5
  O5 --> O6
  Home --> O8
  Venue --> O7

  GuardStaff -- Yes --> S1
  GuardStaff -- No --> X4
  S1 --> S2 --> S3
  S2 --> S4
  S2 --> S5
  S2 --> S6

  NotFound --> X5
  C6 --> X6

  classDef aux fill:#1d2530,stroke:#6b7a8d,color:#dbe3f0,stroke-width:1px;
```
