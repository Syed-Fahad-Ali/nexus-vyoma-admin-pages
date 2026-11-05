# Nexus Vyoma — Volunteer Portal

A mobile-first, high-performance Volunteer Management Portal for **Nexus Vyoma** (ISL Engineering College fest, 10–12 Nov 2026).

## Overview

The volunteer portal provides on-ground festival crew with real-time attendee management, QR gate check-ins, duty shift schedules, and a streamlined analytics suite scoped across dedicated operations views.

---

## Authentication & Portal Entry Flow

1. **Root Login (`/`):**
   - The root `/` route serves as the primary sign-in portal with Google authentication branding.
   - `/login` redirects directly to `/`.
   - Upon successful sign-in, authenticated volunteers are routed to `/events`.

2. **Permitted Events Hub (`/events`):**
   - Responsive multi-event / single-event portal displaying the specific tracks the volunteer is permitted to access.
   - **Container Elements:**
     - **Poster:** Event poster visual banner with track category badge.
     - **Event Name:** Bold title.
     - **Venue:** Location & room with semantic coral capsule.
     - **Time:** Festival date & time range with semantic azure capsule.
     - **Participation Limit:** Capacity allowance with semantic emerald capsule.
     - **Participant Type:** Minimal distinct badge (`Squad` vs `Solo`).
     - **CTA:** Clickable container and "Enter Dashboard →" action button sets active event session and navigates to `/volunteer/dashboard`.

3. **Volunteer Operations Suite (`/volunteer/*`):**
   - Includes real-time event switching from sidebar back to `/events`.

## Navigation Architecture

The volunteer portal sidebar provides direct access to 5 operational views:

1. **Dashboard (`/volunteer/dashboard`):**
   - **Clean Analytics Hub:** Focused strictly on live check-in telemetry and crowd analytics without distracting subtexts or cluttered banners.
   - **Core KPI Cards (Numbers Only):**
     - *Total Enrolled*
     - *Checked-in Rate* (with animated progress bar)
     - *Pending Arrivals*
     - *Active Crew Coverage*
   - **Attendance Velocity Graph (Apache ECharts):**
     - Interactive multi-tab area telemetry (*Checked-in*, *Pending*, *Total Capacity*).
     - Smooth gradient area curves comparing live attendance against benchmark targets.
     - **Clean Display:** Axis labels (x, y values) are hidden for a modern, sleek appearance.
   - Instant *Scan QR Pass* trigger button for fast access to gate ticket verification.

2. **Team (`/volunteer/team`):**
   - Clean, dedicated participating teams section.
   - Clean summary badges (*Registered Squads*, *All Checked In*, *Awaiting Verification*).
   - **Clickable Team Cards Grid (`TeamCardGrid`):** Displays *Team name*, *Leader name*, *Team size*, and member check-in badges with real-time search.
   - **Team Details Modal (`TeamDetailsModal`):** Opens on card click to show full team name, track, team ID/number (e.g. `SQ-101`), team leader phone number & email with 1-tap call/email actions, and the complete roster of all team members with individual QR check-in status and timestamps.

3. **Users (`/volunteer/users`):**
   - Full-width festival participant directory with search, filter tabs, and registration verification.

4. **Scan (`/volunteer/scan`):**
   - High-performance camera scanner with permanent video element mounting, dual rear/webcam fallback, 90ms Web Audio API audio confirmation tick, and duplicate scan debounce.

5. **Crew (`/volunteer/team-member`):**
   - Dedicated **Festival Volunteer Crew** directory (`TeamMembersView`).
   - Clean list displaying **only the names of the crew / volunteers** with initial avatars and live search.

---

## Centralized Mock Service Layer (`src/services/`)

Designed for drop-in replacement with a production REST / GraphQL backend:

- `src/services/types/volunteer.ts`: Domain models (`VolunteerEvent`, `Participant`, `FestivalSquad`, `TeamMemberInfo`, `ParticipationType`, `EventStats`).
- `src/services/volunteerService.ts`: Centralized mock repository for events, participants, and squads (`getEventSquads`, `getEventParticipants`, `getEventStats`).
- `src/components/volunteer/context/VolunteerEventContext.tsx`: Context distributing `selectedEvent`, `participationType`, and `setParticipationType` across layout, sidebar, and dashboard components.

---

## Development

```bash
npm run dev
```

Build verification:
```bash
npx next build --webpack
npm run lint
```
