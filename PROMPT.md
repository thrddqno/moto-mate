# Moto Mate — Agent Prompt

You are an AI coding agent building **Moto Mate**, a mobile app for motorcycle maintenance tracking. Read `AGENTS.md` first — it contains the full schema, business logic, and conventions. This file tells you *how* to execute; AGENTS.md tells you *what* to build.

---

## Mission

Build the full-stack MVP (v1) of Moto Mate — a motorcycle maintenance tracker — following the plan, schema, and conventions defined in `AGENTS.md`. The app lets Manila-based riders track services by mileage, date, or both, and sends a daily 8 AM push digest of upcoming due items.

---

## Stack

| Layer | Technology |
|---|---|
| **Mobile** | React Native + Expo SDK 52 + Expo Router |
| **Backend** | Spring Boot 3.4+, Java 21, Gradle/Maven |
| **Database** | PostgreSQL 16 + Flyway migrations |
| **Auth** | Firebase Auth (client) + Firebase Admin SDK (backend) |
| **Notifications** | Firebase Cloud Messaging (daily digest at 8 AM) |
| **API Format** | REST under `/api/v1`, JSON responses |

---

## Execution Rules

1. **Read `AGENTS.md` completely** before writing a single line of code. It contains the exact database schema, business rules, folder structure, and conventions.
2. **Follow the ticket sequence** in `PLAN.md` — one ticket at a time, in order. Do not skip ahead or start Phase 2 while Phase 1 is open.
3. **Stay in v1 scope.** No cost/expense tracking. No spending insights. No social features. No multi-currency. No offline mode.
4. **Write tests alongside code.** JUnit 5 + Mockito for backend; Jest + React Native Testing Library for frontend. Aim for >80% coverage on service/utility layers.
5. **Log each ticket** by updating the plan with `- [x]` when you start and complete it.
6. **Ask me once** if a decision is ambiguous. Do not guess on scope, schema changes, or trade-offs that affect the plan.
7. **Commit convention:** `type(scope): message` — e.g. `feat(api): add motorcycle CRUD endpoints`, `fix(notif): handle null token gracefully`.

---

## Current Phase

**Phase 2 — Core Features** (T006–T010)

### Ticket: T006 Motorcycle CRUD (Backend + Frontend)
- **Priority:** P1
- **Status:** Completed
- **Owner:** AI Agent
- **Scope:** **Backend:** Implement MotorcycleController, MotorcycleService, and MotorcycleRepository with full CRUD. Each motorcycle belongs to a user (scoped by Firebase UID). Fields: make, model, year, license_plate (optional), VIN (optional), current_mileage, notes. **Frontend:** Build a "My Bikes" list screen, an "Add Bike" form, and an "Edit Bike" screen. Wire up API calls.
- **Acceptance Criteria:** User can add, view, edit, and delete their bikes. Deleting soft-deletes. Only the owner's bikes are visible.
- **Validation Steps:** Add a bike → it appears in list. Edit mileage → changes persist. Delete → bike disappears. Another user's bikes are not visible.
- **Notes:** Use optimistic UI updates on the frontend for a snappy feel.

### Ticket: T007 Maintenance Schedule Assignment
- **Priority:** P1
- **Status:** Completed
- **Owner:** AI Agent
- **Scope:** **Backend:** Implement ScheduleController, ScheduleService to create/update/delete maintenance schedules linking a template to a bike. Interval types: `MILEAGE`, `DATE`, `BOTH`. When `BOTH`, the next-due is whichever comes first. Add methods to calculate next-due mileage and next-due date based on last-performed values. **Frontend:** Build a "Set Up Maintenance" screen where the user selects a bike, picks from the template list, sets interval type and value, and saves. Display existing schedules for a bike.
- **Acceptance Criteria:** A schedule can be created with mileage interval, date interval, or both. The backend correctly computes next-due mileage/date. Schedules can be toggled active/inactive.
- **Validation Steps:** Create schedule "Oil Change every 3000 km" → backend returns `nextDueMileage: currentMileage + 3000`. Change interval to 5000 → nextDue recalculates.
- **Notes:** The calculation logic should be a pure utility function unit-tested separately.

### Ticket: T008 Dashboard — Upcoming & Overdue Maintenance
- **Priority:** P1
- **Status:** Completed
- **Owner:** AI Agent
- **Scope:** **Backend:** Implement DashboardController that queries all active schedules for the user's bikes and returns upcoming (due within configurable threshold), due now, and overdue tasks. For mileage-based tasks, compare against each bike's `current_mileage`. For date-based, compare against current date. **Frontend:** Build the main Dashboard screen with categorized sections: Overdue (red), Due Soon (yellow), Upcoming (green). Each item shows task name, bike, interval info, and how overdue/remaining. Include a quick "Log Service" button per item.
- **Acceptance Criteria:** Dashboard correctly reflects the state of all schedules across all bikes. Updating mileage on a bike or logging a service immediately refreshes the dashboard.
- **Validation Steps:** Create a bike with 1000km. Set oil change every 3000km. Dashboard shows "Due in 2000km". Log an oil change. Dashboard shows "Due in 3000km". Change bike mileage to 5000km. Oil change shows as overdue.
- **Notes:** Use pull-to-refresh. Consider a small summary card at the top (total bikes, tasks due this week, total spent).

### Ticket: T009 Service Log Entry
- **Priority:** P1
- **Status:** Completed
- **Owner:** AI Agent
- **Scope:** **Backend:** Implement ServiceLogController to record a maintenance event. Fields: schedule_id, motorcycle_id, performed_at (date), mileage (int), cost (decimal), notes (text), and optionally multiple parts (name, cost, qty). On creation, update the `last_performed_at` and `last_performed_mileage` on the associated schedule. **Frontend:** Build a "Log Service" screen accessible from the dashboard (quick-log) and from the bike detail screen (full form). Include a date picker, mileage input, cost input, notes field, and an optional "Add Parts" inline section.
- **Acceptance Criteria:** Service log is saved, schedule's last-performed values update, and the dashboard recalculates correctly. Parts can be optionally recorded.
- **Validation Steps:** Log oil change at 5000km, $25, "Used Motul 10W-40". Schedule shows last performed at 5000km. Dashboard recalcs next due.
- **Notes:** Cost is optional. The schedule_id association allows future "did you mean to reset this schedule?" UX.

---

## What a Good Solution Looks Like

- Each ticket produces a **single, reviewable diff** (one PR / one commit).
- Backend endpoints return consistent `{ success, message, data, errors }` envelopes.
- Frontend screens handle **loading, empty, error, and success states**.
- No hardcoded strings for categories, interval types, or platforms — use enums or constants.
- Notifications are **non-blocking** (schedule evaluation runs in a background thread pool).