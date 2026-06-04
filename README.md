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

## Using for another conference

All conference-specific values live in `backend/src/main/resources/application.yml`. Edit the `app` block:

```yaml
app:
  import:
    base-url: https://your-conference.io          # root URL of the conference site
    conference-name: "Your Conference"
    conference-year: 2027
    logo-url: "https://your-conference.io/images/logo.png"
    halls:
      - "Main Hall"
      - "Track 2"
      - "Workshops"
  conference:
    venue-name: "Your Venue Name"
    venue-address: "Street, City"
    venue-map-url: "https://maps.google.com/maps?q=Your+Venue&output=embed"
```

Then rebuild and start:

```bash
docker compose up --build
```

Or, if the app is already running, trigger a re-import without restarting:

```bash
curl -X POST http://localhost:8080/api/import
```

### Data source compatibility

The import client (`JprimeClient.java`) fetches sessions from `/pwa/findSessionsByHall` and scrapes speaker data from
`/speakers` and `/speaker/{id}`. These endpoints match the CMS used by jprime.io.

If your conference runs the same API, changing `base-url` is all you need. If the data is in a different format or comes
from a different API, you'll need to reimplement `JprimeClient.java` to match - the rest of the app (database schema,
REST API, frontend) is generic.
