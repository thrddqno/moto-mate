# Moto Mate — Coding Agent Guide

Essential context for building Moto Mate v1. Read before writing code.

---

## Quick Start

### Prerequisites
- Java 21
- Docker (for PostgreSQL)
- Firebase service account JSON (place at `backend/src/main/resources/firebase-service-account.json`)

### Start Database
```bash
docker compose up -d postgres
```

### Run Backend
```bash
cd backend
./mvnw spring-boot:run
```
API runs at `http://localhost:8081`

### Run Tests
```bash
cd backend
./mvnw test
```

---

## Verified Project Structure

```
moto-mate/
├── backend/
│   ├── src/main/java/com/thrddqno/motomate/
│   │   ├── MotomateApplication.java
│   │   ├── config/FirebaseConfig.java
│   │   ├── controller/HealthController.java  # /api/health
│   │   ├── dto/                              # (empty)
│   │   ├── entity/                           # (empty)
│   │   ├── exception/                        # (empty)
│   │   ├── repository/                       # (empty)
│   │   ├── service/                          # (empty)
│   │   └── util/                             # (empty)
│   ├── src/main/resources/
│   │   ├── application.yaml
│   │   ├── firebase-service-account.json     # gitignored
│   │   └── db/migration/                     # (empty)
│   └── pom.xml
├── docker-compose.yml
└── AGENTS.md
```

**Package:** `com.thrddqno.motomate` (not `com.motomate`)

---

## Tech Stack (Verified)

| Layer | Technology | Version |
|---|---|---|
| Backend | Spring Boot | 4.1.0 |
| Java | JDK | 21 |
| Build | Maven | (wrapper included) |
| Database | PostgreSQL | 16 (via Docker) |
| Auth | Firebase Admin SDK | 9.4.1 |
| ORM | Spring Data JPA | (via starter) |
| Migrations | Flyway | (via starter) |

---

## Key Configuration

### `application.yaml`
```yaml
server:
  port: 8081

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/motomate_dev
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
  flyway:
    enabled: true
    locations: classpath:db/migration

firebase:
  service-account: ${FIREBASE_SERVICE_ACCOUNT_PATH}
```

### Docker Compose
```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: motomate_postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: motomate_dev
      POSTGRES_USER: motomate_admin
      POSTGRES_PASSWORD: motomate_password
```

---

## API Conventions

- Base path: `/api/v1`
- Response envelope: `{ "success": true, "message": "...", "data": {}, "errors": [] }`
- Auth: `Authorization: Bearer <Firebase ID Token>` header
- Validation: Jakarta Bean Validation with `@Valid`

---

## Database Schema (Planned)

See the full DBML schema in the original AGENTS.md design. Key tables:
- `users` (firebase_uid, unit_preference, reminder_digest_time)
- `motorcycles` (user_id, current_mileage, is_active)
- `service_templates` (name, category, default intervals)
- `service_schedules` (motorcycle_id, template_id, interval_type, next_due_*)
- `service_logs` (schedule_id, mileage_at_service, date_of_service)
- `break_in_tracker` (motorcycle_id, initial_mileage, break_in_limit)
- `device_tokens` (user_id, token, platform)
- `notification_log` (user_id, schedule_id, status, type)

---

## Business Rules

### Interval Resolution
- **mileage**: due when `current_mileage >= next_due_mileage`
- **date**: due when `CURRENT_DATE >= next_due_date`
- **both**: either triggers; both counters reset on service

### Break-in Logic
- Auto-create when motorcycle created with `initial_mileage < 500`
- `break_in_limit` = 500 (default)
- One-time phase, not recurring

### LTO Registration
- Special template: date-only (365 days), `is_special: true`

---

## Development Workflow

1. Start database: `docker compose up -d postgres`
2. Create migrations in `backend/src/main/resources/db/migration/`
3. Follow ticket sequence from PROMPT.md
4. Backend endpoints must return standard envelope
5. Frontend handles loading/empty/error/success states

---

## Scope (v1)

**Include:** Mileage/date interval tracking, daily 8 AM push digest, LTO registration, break-in tracking

**Exclude:** Cost tracking, social features, multi-currency, offline mode

---

## Common Pitfalls

- **Wrong package name:** Use `com.thrddqno.motomate`, not `com.motomate`
- **Port mismatch:** Backend runs on 8081, not 8080
- **Firebase config:** Service account JSON must be at `backend/src/main/resources/firebase-service-account.json`
- **Database credentials:** Use `motomate_admin`/`motomate_password` from docker-compose
