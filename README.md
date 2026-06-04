# jPrime 2026 Conference Companion

Browse the jPrime schedule by hall and day. Expand sessions to read descriptions. Save sessions to your personal plan.

## Stack

- Backend: Spring Boot 4.0.6 + Java 21 + PostgreSQL 16
- Frontend: React 19 + MUI + Vite

## Production

```bash
docker compose up --build
```

Wait ~90 seconds for the backend to start and import sessions, then open **http://localhost:3000**.

## Development

Run only Postgres in Docker, then start the backend and frontend natively — no rebuilds needed.

**Terminal 1 — database**
```bash
docker compose up db
```

**Terminal 2 — backend** (Spring Boot DevTools hot-reload)
```bash
cd backend && ./mvnw spring-boot:run
```

**Terminal 3 — frontend** (Vite HMR)
```bash
cd frontend && npm run dev
```

App is at **http://localhost:5173**. Vite proxies `/api/*` to the backend on `:8080`.

## Tests

```bash
cd backend && ./mvnw test
```
