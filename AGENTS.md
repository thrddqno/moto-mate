# AGENTS.md

## Scope Order

- Follow direct user instructions first.
- Use `PLAN.md` for product scope and ticket order.
- Trust executable sources over prose when they conflict. In this repo, `PLAN.md` and the codebase do conflict in a few places.

## Repo Shape

- `backend/` is the real app today: Spring Boot API, Flyway migrations, Firebase auth, reminder scheduler, and unit tests all live here.
- Backend Java package names are under `com.thrddqno.motomate`, not `com.motomate` from stale planning docs.
- `web/` exists but is still close to the default Vite React scaffold. Do not assume product features already exist there.
- `mobile/` is an older Expo app. Treat it as reference material only unless the user explicitly asks for native/mobile work.
- If you do work in `mobile/`, read `mobile/AGENTS.md` first; it points to the exact Expo docs version to follow.
- There is no root workspace runner. Run commands inside `backend/`, `web/`, or `mobile/` directly.

## Commands

- Backend setup from repo root: `docker compose up -d postgres`
- Backend run from `backend/`: `./mvnw spring-boot:run`
- Backend tests from `backend/`: `./mvnw test`
- Single backend test from `backend/`: `./mvnw -Dtest=ScheduleServiceTest test`
- Full local backend stack in Docker: `docker compose -f docker-compose.local.yml up --build`
- Web install from `web/`: `npm install`
- Web dev from `web/`: `npm run dev`
- Web build from `web/`: `npm run build`
- Web lint from `web/`: `npm run lint`

## Backend Facts That Matter

- Backend default port is `8081`, not `8080`.
- Health endpoint is `GET /api/health`.
- Product API endpoints are under `/api/v1/**`.
- Swagger is enabled at `/swagger-ui.html`.
- All non-health, non-Swagger routes require a Firebase bearer token via `FirebaseTokenFilter`.
- Controllers use `@CurrentUser UUID userId`; keep user scoping at the service/repository boundary.
- Responses use the shared `ApiResponse<T>` envelope with `success`, `message`, `data`, and optional `errors`.

## Database And Migrations

- PostgreSQL schema is `moto_mate`.
- JPA runs with `ddl-auto: validate`; schema changes belong in Flyway migrations under `backend/src/main/resources/db/migration/`.
- Entities for `User`, `Motorcycle`, `MaintenanceSchedule`, and `ServiceLog` use `@SQLRestriction("deleted_at IS NULL")`. Preserve soft-delete behavior instead of hard-deleting unless the task says otherwise.

## Firebase Quirks

- The code actually loads Firebase Admin credentials from `FIREBASE_SERVICE_ACCOUNT_BASE64`, then `FIREBASE_SERVICE_ACCOUNT_JSON`, then the classpath file `backend/src/main/resources/firebase-service-account.json`.
- `application.yaml` still mentions `FIREBASE_SERVICE_ACCOUNT_PATH`, and `docker-compose.local.yml` still mounts a JSON file. Do not assume the property names in prose/config comments are the ones the app reads; check `FirebaseConfig`.
- Be careful not to overwrite or commit credential changes unless the user explicitly asks.

## Current Product Behavior To Preserve

- `IntervalType.BOTH` means mileage and date are both tracked; due status is whichever threshold is reached first.
- Logging service updates `lastServiceMileage`, `lastServiceDate`, and recalculates next due values from the logged event.
- Reminder scheduling is already implemented as a daily `8 AM` cron in `ReminderScheduler`.
- The current backend includes optional service-log `cost` and user notification threshold fields even though `PLAN.md` contains stale discussion around those areas. Do not remove them as "cleanup" unless asked.

## Testing Guidance

- Existing backend coverage is mostly service-level Mockito tests plus one `@SpringBootTest` smoke test.
- For backend business logic changes, add or update focused service tests first; that matches the existing suite and is the fastest verification path.
- The web app currently has no test setup. Do not assume Vitest or RTL is already wired in.

## Practical Workflow

- Read `PLAN.md` before implementing product changes, but confirm routes, env vars, and behavior from code first.
- Prefer small diffs in the active package instead of cross-cutting cleanup across `backend/`, `web/`, and `mobile/`.
- If you touch API contracts, migrations, or auth flow, verify against the live backend codepaths, not the aspirational root README.
