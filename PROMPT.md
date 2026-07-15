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

## What a Good Solution Looks Like

- Each ticket produces a **single, reviewable diff** (one PR / one commit).
- Backend endpoints return consistent `{ success, message, data, errors }` envelopes.
- Frontend screens handle **loading, empty, error, and success states**.
- No hardcoded strings for categories, interval types, or platforms — use enums or constants.
- Notifications are **non-blocking** (schedule evaluation runs in a background thread pool).