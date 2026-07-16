# Moto Mate

Moto Mate is a motorcycle maintenance tracker for odometer, mileage interval, and date-based service schedules. It includes a Spring Boot API, PostgreSQL database, Firebase authentication, and a React/Vite Progressive Web App.

This project was generated and iterated with OpenCode, an AI coding agent platform, together with human review and local verification.

## Stack

- Backend: Spring Boot, Java 21, Flyway, PostgreSQL, Firebase Admin Auth
- Frontend: React, TypeScript, Vite, PWA service worker and manifest
- Local infrastructure: Docker Compose with PostgreSQL, backend, and frontend services

## Run The Full Local Stack

The main `docker-compose.yml` runs the whole local system: PostgreSQL, backend, and the built React PWA served by nginx.

From the repo root, export the required backend secrets:

```bash
export FIREBASE_SERVICE_ACCOUNT_BASE64="$(base64 -w 0 backend/src/main/resources/firebase-service-account.json)"
export DEVICE_TOKEN_ENCRYPTION_KEY_BASE64="$(openssl rand -base64 32)"
export DEVICE_TOKEN_HASH_KEY_BASE64="$(openssl rand -base64 32)"
export DEVICE_TOKEN_KEY_VERSION=v1
```

Export the frontend Firebase Web SDK config before building the frontend image:

```bash
export VITE_API_URL=http://localhost:8081/api/v1
export VITE_FIREBASE_API_KEY=your_firebase_web_api_key
export VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
export VITE_FIREBASE_PROJECT_ID=your_project_id
export VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
export VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
export VITE_FIREBASE_APP_ID=your_firebase_web_app_id
```

Start everything:

```bash
docker compose up --build
```

Local URLs:

- Frontend: `http://localhost:4173`
- Backend health: `http://localhost:8081/api/health`
- PostgreSQL: `localhost:5432`

## LAN Or Phone Testing

When opening the frontend from another device on the same network, build the frontend with your machine's LAN IP so the browser can call the backend.

Example:

```bash
export FIREBASE_SERVICE_ACCOUNT_BASE64="$(base64 -w 0 backend/src/main/resources/firebase-service-account.json)"
export DEVICE_TOKEN_ENCRYPTION_KEY_BASE64="$(openssl rand -base64 32)"
export DEVICE_TOKEN_HASH_KEY_BASE64="$(openssl rand -base64 32)"
export DEVICE_TOKEN_KEY_VERSION=v1
export VITE_API_URL=http://192.168.100.2:8081/api/v1
export VITE_FIREBASE_API_KEY=your_firebase_web_api_key
export VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
export VITE_FIREBASE_PROJECT_ID=your_project_id
export VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
export VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
export VITE_FIREBASE_APP_ID=your_firebase_web_app_id

docker compose up --build
```

Then open `http://192.168.100.2:4173` from the phone.

PWA install prompts and service workers require a secure context. `localhost` is allowed by browsers, but LAN HTTP origins such as `http://192.168.x.x` are not installable PWAs. For phone install testing, use the web HTTPS preview workflow documented in `web/README.md` or a trusted local HTTPS certificate.

## Dev Mode

For faster frontend/backend iteration, run only PostgreSQL in Docker and start the apps directly.

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Run the backend:

```bash
cd backend
./mvnw spring-boot:run
```

Run the frontend:

```bash
cd web
npm install
npm run dev
```

Dev URLs:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:8081/api/health`

## Backend Security Environment

Device push tokens are encrypted before storage. Generate two different 32-byte Base64 keys and provide them to the backend:

```bash
export DEVICE_TOKEN_ENCRYPTION_KEY_BASE64="$(openssl rand -base64 32)"
export DEVICE_TOKEN_HASH_KEY_BASE64="$(openssl rand -base64 32)"
export DEVICE_TOKEN_KEY_VERSION=v1
```

For local web development, allow frontend origins explicitly when running the backend outside Compose:

```bash
export CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
```

For LAN testing from a phone, add the machine IP origin or use local-network origin patterns:

```bash
export CORS_ALLOWED_ORIGIN_PATTERNS=http://192.168.*.*:5173,http://192.168.*.*:4173
```
