# Moto Mate — Coding Agent Guide

Detailed context, schema, business logic, and conventions for the AI agent building Moto Mate v1. **Read this before writing any code.** PROMPT.md tells you *how* to execute; this file tells you *what* to build.

---

## 1. Project Overview

| Field | Value |
|---|---|
| **App Name** | Moto Mate |
| **Purpose** | Track motorcycle maintenance via mileage/date intervals |
| **Version** | v1 (MVP) |
| **Dev Timeline** | ~60 hours over ~20 days (3 hrs/day) |
| **Primary User** | Manila-based motorcycle riders (commuters) |
| **Scope Boundary** | ❌ No cost/expense tracking, no social features, no multi-currency, no offline mode |
| **Status** | Ready for Phase 1 |

---

## 2. Tech Stack & Conventions

### 2.1 Backend — Spring Boot

| Concern | Decision |
|---|---|
| **Language** | Java 21 |
| **Framework** | Spring Boot 3.4+ |
| **Build** | Maven (default) or Gradle — pick one, stick with it |
| **Database** | PostgreSQL 16 + Flyway for migrations |
| **Auth** | Firebase Admin SDK — verify ID token on every authenticated request |
| **API Base Path** | `/api/v1` |
| **Security** | Custom `FirebaseAuthenticationFilter` extracts Firebase UID into `SecurityContext` |
| **Response Envelope** | `{ "success": true, "message": "…", "data": {}, "errors": [] }` |
| **Error Handling** | `@ControllerAdvice` with domain-specific exception classes (e.g., `MotorcycleNotFoundException`, `ScheduleConflictException`) |
| **Validation** | `@Valid` + Jakarta Bean Validation on all request DTOs |
| **Serialization** | Jackson (default) — use `@JsonInclude(JsonInclude.Include.NON_NULL)` globally |

### 2.2 Frontend — React Native + Expo

| Concern | Decision |
|---|---|
| **SDK** | Expo SDK 52+ |
| **Routing** | Expo Router (file-based) |
| **Auth State** | React Context + `useReducer` for app-wide auth state |
| **Server Data** | TanStack Query (React Query) for fetching, caching, and mutations |
| **Local Storage** | `expo-secure-store` for Firebase ID token; AsyncStorage for preferences (unit, last-viewed bike, onboarding flag) |
| **HTTP Client** | Axios with an interceptor that attaches `Authorization: Bearer <token>` from secure store |
| **Styling** | `StyleSheet.create()` (default) — keep consistent throughout |
| **Navigation** | Expo Router — `(auth)` group for sign-in/sign-up, `(tabs)` group for main app |

### 2.3 General Conventions

- **Enums over strings.** Define Java enums for: `IntervalType` (MILEAGE, DATE, BOTH), `Category` (ENGINE, BRAKES, TIRES, CHAIN, ELECTRICAL, COOLING, GENERAL, REGULATORY), `Platform` (IOS, ANDROID), `NotificationStatus` (SENT, FAILED, READ), `NotificationType` (DIGEST, IMMEDIATE). Same on frontend with TypeScript const enums.
- **Soft deletes** where noted (use a `deleted_at` timestamp column + `WHERE deleted_at IS NULL` in queries).
- **Timestamps** are `TIMESTAMPTZ` in Postgres, `Instant` in Java, ISO 8601 strings in API responses.
- **Dates** (not times) are `DATE` in Postgres, `LocalDate` in Java, `"YYYY-MM-DD"` in API.
- **Time** (digest hour) is `TIME` in Postgres, `LocalTime` in Java, `"HH:mm"` in API.

---

## 3. Database Schema (DBML)

```dbml
Project MotoMate {
  database_type: 'PostgreSQL'
  Note: 'Motorcycle Maintenance Tracker v1 — cost excluded'
}

Table users {
  id uuid [primary key]
  firebase_uid varchar(255) [unique, not null]
  email varchar(255)
  display_name varchar(255)
  unit_preference varchar(10) [default: 'km']
  reminder_digest_time time [default: '08:00']
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table motorcycles {
  id uuid [primary key]
  user_id uuid [not null, ref: > users.id]
  name varchar(255) [not null]
  make varchar(100)
  model varchar(100)
  year int
  license_plate varchar(50)
  initial_mileage int [not null, default: 0]
  current_mileage int [not null]
  is_active boolean [default: true]
  image_url varchar(500)
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]

  indexes {
    (user_id)
  }
}

Table service_templates {
  id uuid [primary key]
  name varchar(255) [not null]
  category varchar(50) [not null]
  // Allowed: Engine, Brakes, Tires, Chain, Electrical, Cooling, General, Regulatory
  description text
  default_interval_mileage int
  default_interval_days int
  is_special boolean [default: false]
  is_public boolean [default: true]
  created_at timestamp [default: `now()`]

  indexes {
    (category)
  }
}

Table service_schedules {
  id uuid [primary key]
  motorcycle_id uuid [not null, ref: > motorcycles.id]
  template_id uuid [not null, ref: > service_templates.id]
  interval_type varchar(10) [not null]
  // Allowed: 'mileage', 'date', 'both'
  interval_mileage int
  interval_days int
  last_service_mileage int [default: 0]
  last_service_date date
  next_due_mileage int
  next_due_date date
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]

  indexes {
    (motorcycle_id)
  }
}

Table service_logs {
  id uuid [primary key]
  schedule_id uuid [not null, ref: > service_schedules.id]
  motorcycle_id uuid [not null, ref: > motorcycles.id]
  template_id uuid [not null, ref: > service_templates.id]
  mileage_at_service int [not null]
  date_of_service date [not null]
  notes text
  created_at timestamp [default: `now()`]
}

Table break_in_tracker {
  id uuid [primary key]
  motorcycle_id uuid [unique, not null, ref: > motorcycles.id]
  initial_mileage int [not null]
  break_in_limit int [not null]
  is_completed boolean [default: false]
  completed_at timestamp
}

Table device_tokens {
  id uuid [primary key]
  user_id uuid [not null, ref: > users.id]
  token text [not null]
  platform varchar(10) [not null]
  // Allowed: 'ios', 'android'
  created_at timestamp [default: `now()`]

  indexes {
    (user_id)
    (token)
  }
}

Table notification_log {
  id uuid [primary key]
  user_id uuid [not null, ref: > users.id]
  schedule_id uuid [ref: > service_schedules.id]
  sent_at timestamp [default: `now()`]
  status varchar(20) [default: 'sent']
  // Allowed: sent, failed, read
  type varchar(50)
  // Allowed: digest, immediate
}
```

### Seed Data — Service Templates

Insert these 10 templates in T005 (Flyway migration):

| name | category | interval_mileage | interval_days | is_special |
|---|---|---|---|---|
| Oil Change | Engine | 3000 | null | false |
| Chain Lube | Chain | 500 | null | false |
| Chain Adjustment | Chain | 1000 | null | false |
| Tire Pressure Check | Tires | null | 14 | false |
| Tire Replacement | Tires | 15000 | null | false |
| Brake Pad Inspection | Brakes | 5000 | null | false |
| Brake Fluid Flush | Brakes | null | 730 | false |
| Coolant Check | Cooling | null | 180 | false |
| Spark Plug Replacement | Engine | 12000 | null | false |
| LTO Registration | Regulatory | null | 365 | true |

---

## 4. Core Business Logic

### 4.1 Interval Resolution — "Whichever Comes First"

When a schedule's `interval_type` is `'both'`, the next due is determined by whichever condition triggers first:

| Interval Type | Due Condition |
|---|---|
| **mileage** | `motorcycle.current_mileage >= schedule.next_due_mileage` |
| **date** | `CURRENT_DATE >= schedule.next_due_date` |
| **both** | **Either** condition triggers. On service, **both** counters reset. |

**After a service is logged:**
```
next_due_mileage = last_service_mileage + interval_mileage
next_due_date    = last_service_date + interval_days
```

Both fields update even if only one triggered — this keeps the schedule synchronized.

### 4.2 Break-in Logic

- **Auto-create** a `break_in_tracker` row when a motorcycle is created with `initial_mileage < 500`.
- `break_in_limit` = 500 (default; user-adjustable later).
- `break_in_remaining = break_in_limit - current_mileage` (computed, not stored).
- Break-in is a **one-time phase**, not a recurring service template.
- **UI must show** "Break-in: X km remaining" prominently until completed.
- **Completion:** automatic when `current_mileage >= break_in_limit`, OR user can mark it complete explicitly.
- Logging a regular service during break-in does **not** auto-complete the break-in period.

### 4.3 LTO Registration (Special Template)

- Interval type: date-only (365 days).
- `is_special: true` → frontend can render a dedicated badge/color.
- When logging this service, the app might accept a "valid until" date or just log the renewal date.
- If a schedule with this template is deleted, the system should confirm: "This is your LTO registration. Are you sure?"

### 4.4 Daily Digest (Push Notifications — 8 AM)

**Backend:** `@Scheduled` with a cron that runs every minute, but only acts at `:00` seconds when `CURRENT_TIME` matches a user's `reminder_digest_time`.

```
1. Query users WHERE reminder_digest_time = CURRENT_TIME
2. For each user, find active schedules WHERE:
     next_due_date BETWEEN CURRENT_DATE - 1 AND CURRENT_DATE + 7
     OR next_due_mileage - motorcycle.current_mileage <= user.reminder_threshold_pct%
3. Build notification payload listing all due/upcoming services
4. Send via Firebase Admin SDK to all device_tokens for that user
5. Log each send in notification_log
```

**No local notifications** in v1 — fully server-driven via FCM.

### 4.5 Mileage Update Cascade

When `current_mileage` is updated on a motorcycle, all active `service_schedules` must be re-evaluated:

```java
@Transactional
public Motorcycle updateMileage(UUID motorcycleId, int newMileage) {
    Motorcycle bike = motorcycleRepository.findById(motorcycleId)...;
    bike.setCurrentMileage(newMileage);
    // Cascade: re-check each schedule's next_due_mileage
    List<ServiceSchedule> schedules = scheduleRepository.findByMotorcycleIdAndIsActiveTrue(motorcycleId);
    for (ServiceSchedule s : schedules) {
        if (s.getNextDueMileage() != null && newMileage >= s.getNextDueMileage()) {
            // schedule is now due — frontend will pick this up on next refresh
        }
    }
    return motorcycleRepository.save(bike);
}
```

---

## 5. API Endpoints

All under `/api/v1`. Authenticated endpoints require `Authorization: Bearer <Firebase ID Token>`.

### Auth (public)

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Create user profile after Firebase sign-up |
| `GET` | `/auth/me` | Get current user profile |

### Motorcycles

| Method | Path | Description |
|---|---|---|
| `GET` | `/motorcycles` | List user's motorcycles |
| `POST` | `/motorcycles` | Create motorcycle (auto-creates break_in_tracker if mileage < 500) |
| `GET` | `/motorcycles/{id}` | Get motorcycle details + break-in status |
| `PUT` | `/motorcycles/{id}` | Update motorcycle (mileage cascade happens here) |
| `DELETE` | `/motorcycles/{id}` | Soft-delete motorcycle |

### Service Templates

| Method | Path | Description |
|---|---|---|
| `GET` | `/templates` | List all public templates (optionally filter by category) |

### Service Schedules

| Method | Path | Description |
|---|---|---|
| `GET` | `/motorcycles/{id}/schedules` | List schedules for a motorcycle |
| `POST` | `/motorcycles/{id}/schedules` | Assign a template as a schedule (with optional interval overrides) |
| `PUT` | `/motorcycles/{id}/schedules/{scheduleId}` | Update schedule (interval, active/inactive) |
| `DELETE` | `/motorcycles/{id}/schedules/{scheduleId}` | Soft-delete schedule |

### Service Logs

| Method | Path | Description |
|---|---|---|
| `GET` | `/motorcycles/{id}/logs` | List service logs (chronological, paginated) |
| `POST` | `/motorcycles/{id}/logs` | Log a service (resets next_due on the schedule) |
| `GET` | `/motorcycles/{id}/logs/{logId}` | Get single log detail |

### Device Tokens

| Method | Path | Description |
|---|---|---|
| `POST` | `/devices/register` | Register/update an FCM token |
| `DELETE` | `/devices/unregister` | Remove an FCM token |

### Notifications

| Method | Path | Description |
|---|---|---|
| `PUT` | `/users/notifications/settings` | Update digest time and per-schedule notification toggle |
| `GET` | `/users/notifications/log` | View recent notification history |

---

## 6. Folder Structure

```
moto-mate/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/motomate/
│   │   │   │   ├── MotoMateApplication.java
│   │   │   │   ├── config/
│   │   │   │   │   ├── FirebaseConfig.java
│   │   │   │   │   ├── SecurityConfig.java
│   │   │   │   │   └── WebConfig.java          # CORS, Jackson config
│   │   │   │   ├── controller/
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── MotorcycleController.java
│   │   │   │   │   ├── ScheduleController.java
│   │   │   │   │   ├── ServiceLogController.java
│   │   │   │   │   ├── TemplateController.java
│   │   │   │   │   ├── DeviceController.java
│   │   │   │   │   └── NotificationController.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── request/                 # CreateMotorcycleRequest, LogServiceRequest, etc.
│   │   │   │   │   └── response/                # ApiResponse<T>, MotorcycleResponse, etc.
│   │   │   │   ├── entity/
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Motorcycle.java
│   │   │   │   │   ├── ServiceTemplate.java
│   │   │   │   │   ├── ServiceSchedule.java
│   │   │   │   │   ├── ServiceLog.java
│   │   │   │   │   ├── BreakInTracker.java
│   │   │   │   │   ├── DeviceToken.java
│   │   │   │   │   └── NotificationLog.java
│   │   │   │   ├── enums/
│   │   │   │   │   ├── IntervalType.java
│   │   │   │   │   ├── ServiceCategory.java
│   │   │   │   │   ├── Platform.java
│   │   │   │   │   ├── NotificationStatus.java
│   │   │   │   │   └── NotificationType.java
│   │   │   │   ├── exception/
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   │   ├── UnauthorizedException.java
│   │   │   │   │   └── ScheduleConflictException.java
│   │   │   │   ├── repository/
│   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   ├── MotorcycleRepository.java
│   │   │   │   │   ├── ServiceTemplateRepository.java
│   │   │   │   │   ├── ServiceScheduleRepository.java
│   │   │   │   │   ├── ServiceLogRepository.java
│   │   │   │   │   ├── BreakInTrackerRepository.java
│   │   │   │   │   ├── DeviceTokenRepository.java
│   │   │   │   │   └── NotificationLogRepository.java
│   │   │   │   ├── security/
│   │   │   │   │   ├── FirebaseAuthenticationFilter.java
│   │   │   │   │   ├── FirebaseTokenHolder.java
│   │   │   │   │   └── FirebaseTokenService.java
│   │   │   │   ├── service/
│   │   │   │   │   ├── AuthService.java
│   │   │   │   │   ├── MotorcycleService.java
│   │   │   │   │   ├── ScheduleService.java
│   │   │   │   │   ├── ServiceLogService.java
│   │   │   │   │   ├── BreakInService.java
│   │   │   │   │   ├── NotificationService.java
│   │   │   │   │   └── DigestScheduler.java
│   │   │   │   └── util/
│   │   │   │       ├── DateUtils.java
│   │   │   │       └── MileageUtils.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-dev.yml
│   │   │       └── db/migration/
│   │   │           ├── V001__create_users_table.sql
│   │   │           ├── V002__create_motorcycles_table.sql
│   │   │           ├── V003__create_service_templates_table.sql
│   │   │           ├── V004__create_service_schedules_table.sql
│   │   │           ├── V005__create_service_logs_table.sql
│   │   │           ├── V006__create_break_in_tracker_table.sql
│   │   │           ├── V007__create_device_tokens_table.sql
│   │   │           ├── V008__create_notification_log_table.sql
│   │   │           └── V009__seed_service_templates.sql
│   │   └── test/java/com/motomate/
│   │       ├── service/
│   │       ├── controller/
│   │       └── repository/
│   ├── pom.xml (or build.gradle)
│   └── Dockerfile
│
├── mobile/
│   ├── app/
│   │   ├── _layout.tsx                 # Root layout (providers, fonts, splash)
│   │   ├── index.tsx                   # Entry redirect
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── sign-in.tsx
│   │   │   └── sign-up.tsx
│   │   └── (tabs)/
│   │       ├── _layout.tsx             # Bottom tab navigator
│   │       ├── index.tsx               # Dashboard (home tab)
│   │       ├── motorcycles/
│   │       │   ├── index.tsx           # List motorcycles
│   │       │   ├── [id].tsx            # Motorcycle detail
│   │       │   ├── new.tsx             # Add motorcycle
│   │       │   └── edit/[id].tsx       # Edit motorcycle
│   │       ├── schedules/
│   │       │   ├── [motorcycleId]/
│   │       │   │   ├── index.tsx       # Schedules list
│   │       │   │   ├── new.tsx         # Assign template
│   │       │   │   └── [scheduleId].tsx # Schedule detail/edit
│   │       ├── logs/
│   │       │   ├── [motorcycleId]/
│   │       │   │   ├── index.tsx       # Service history
│   │       │   │   ├── new.tsx         # Log service
│   │       │   │   └── [logId].tsx     # Log detail
│   │       ├── settings/
│   │       │   └── index.tsx           # Settings screen
│   │       └── notifications/
│   │           └── index.tsx           # Notification history
│   ├── components/
│   │   ├── ui/                         # Reusable: Button, Card, Badge, Input, etc.
│   │   ├── MotorcycleCard.tsx
│   │   ├── ScheduleCard.tsx
│   │   ├── BreakInProgress.tsx
│   │   ├── ServiceLogItem.tsx
│   │   └── EmptyState.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useMotorcycles.ts
│   │   ├── useSchedules.ts
│   │   └── useNotifications.ts
│   ├── services/
│   │   ├── api.ts                      # Axios instance + interceptors
│   │   ├── auth.ts                     # Firebase Auth functions
│   │   └── notifications.ts            # FCM token registration
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── types/
│   │   ├── index.ts                    # Shared TS types matching backend enums
│   │   └── api.ts                      # API response types
│   ├── constants/
│   │   ├── categories.ts               # Service categories + display config
│   │   └── intervals.ts                # Interval types
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
│
├── PLAN.md
├── PROMPT.md
└── AGENTS.md
```

---

## 7. Ticket Sequence (Summary)

| Phase | Tickets | Est. Hours | What You Build |
|---|---|---|---|
| **1 — Foundation** | T001–T005 | 12h | Backend scaffold, frontend scaffold, Firebase Auth (both sides), DB tables + seeds |
| **2 — Core Features** | T006–T010 | 18h | Motorcycle CRUD, schedule setup, dashboard, service log entry, history |
| **3 — Notifications** | T012–T014 | 10h | FCM registration, digest scheduler, notification settings UI |
| **4 — Polish & Ship** | T015–T022 | 16h | LTO handling, settings, error handling, validation, loading states, edge cases, tests, deploy |
| **Post-v1** | T011 | — | Spending/insights (deferred) |

> **Note:** T011 (Spending Overview) is explicitly deferred. Do not build it.

---

## 8. Logged Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | **No cost tracking in v1** | Reduces scope and DB complexity; spending is a nice-to-have |
| D2 | **Break-in as separate table** (one-to-one with motorcycle) | One-time phase, different lifecycle from recurring schedules |
| D3 | **8 AM daily digest** (not immediate per-schedule alerts) | Less noisy, builds a morning check-in habit |
| D4 | **Unit preference: locale auto-detect + settings toggle** | Start with locale, but let the user override |
| D5 | **"Whichever comes first" for `both` interval type** | Earliest deadline wins; both counters reset on service |
| D6 | **LTO Registration included as special template** | Government-mandated, annual, date-based |
| D7 | **8 service categories** | Engine, Brakes, Tires, Chain, Electrical, Cooling, General, Regulatory |

---

## 9. Verification Checklist (per ticket)

Before marking a ticket done, confirm:

- [ ] Backend endpoint returns the standard `{ success, message, data, errors }` envelope
- [ ] All user-facing input is validated (`@Valid` + Jakarta)
- [ ] The Firebase UID in the JWT matches the resource owner (no cross-user data leak)
- [ ] Tests pass (`mvn test` / `npm test`)
- [ ] Frontend handles: loading (spinner/skeleton), empty (illustration + CTA), error (toast/alert), success (navigation + feedback)
- [ ] No console warnings or TypeScript errors
- [ ] The feature works in a fresh app (no stale cache dependency)