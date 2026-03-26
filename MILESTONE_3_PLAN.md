# Lensia MVP — Milestone 3 Plan

**Milestone:** 3 — API Integration, Payments & Testing
**Budget:** 30% of total ($600 USD)
**Duration:** 1 week
**Depends on:** Milestones 1 & 2 complete

---

## Agreed Deliverables (from Job Description)

1. Integration with Mercado Pago API for payments
2. Integration with Google Maps API for future geolocation
3. File storage setup (AWS S3 or equivalent)
4. Full testing (frontend + backend)
5. Documentation and deployment

---

## What Needs To Be Done

### 1. AWS S3 File Storage Migration

**Current state:** All files (prescriptions, catalog images, dispute photos) are stored on local disk at `./uploads/`. This is lost on server restart/redeploy and doesn't scale.

**What to do:**

- Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` in the backend.
- Create a shared `StorageService` module with two implementations:
  - `LocalStorageStrategy` — current behavior (fallback when AWS vars not set).
  - `S3StorageStrategy` — uploads to S3 bucket, returns public URL.
- Update the three upload points to use `StorageService`:
  - `backend/src/modules/prescriptions/prescriptions.controller.ts` — prescription images
  - `backend/src/modules/catalog/catalog.controller.ts` — frame images
  - `backend/src/modules/disputes/disputes.controller.ts` — dispute photos
- Configure the S3 bucket with proper CORS and public read policy for image serving.
- Environment variables already exist in `.env.example`:
  ```env
  AWS_REGION=us-east-1
  AWS_ACCESS_KEY_ID=
  AWS_SECRET_ACCESS_KEY=
  AWS_BUCKET_NAME=lensia-files
  ```
- When AWS vars are set, use S3. When not set, fall back to local disk.

**Files to create/modify:**
- `backend/src/modules/storage/storage.module.ts` (new)
- `backend/src/modules/storage/storage.service.ts` (new)
- `backend/src/modules/prescriptions/prescriptions.controller.ts` (modify)
- `backend/src/modules/catalog/catalog.controller.ts` (modify)
- `backend/src/modules/disputes/disputes.controller.ts` (modify)
- `backend/src/app.module.ts` (import StorageModule)

---

### 2. Mercado Pago End-to-End Flow

**Current state:** Preference creation and webhook handler work. Refunds work. But the full end-to-end cycle hasn't been tested with real credentials, and marketplace split payments aren't configured.

**What to do:**

- Set up a Mercado Pago test account (sandbox) with test access token.
- Test the full payment cycle:
  1. Client creates order → backend creates MP preference
  2. Client clicks "Pagar con Mercado Pago" → redirected to MP checkout
  3. Client pays with test card → MP sends webhook to backend
  4. Backend receives webhook → updates order to `payment_held`
  5. Optica marks delivered → 48h verification
  6. Auto-release or client confirms → order `completed`
  7. Dispute → admin refunds → `PaymentRefund.total()` called
- Configure `back_urls` for production domain (lensia.pro).
- Configure the webhook notification URL for the production server.
- Decide on marketplace split payments vs. standard:
  - **Standard (current):** Lensia collects full payment, manually transfers to optica minus commission. Simpler but requires manual payout.
  - **Marketplace split:** Requires MP Marketplace account. Payment auto-splits between Lensia and optica. More complex but fully automated.
  - **Recommendation for MVP:** Keep standard. Add marketplace split in a future iteration.
- Implement commission calculation in order creation (currently `commissionAmount` column exists but is never set):
  - Read `commission_rate_pct` from platform settings (currently 0% for launch).
  - Calculate: `commissionAmount = amount * commissionRate / 100`.
  - Store on the order for future reporting.

**Files to modify:**
- `backend/src/modules/payments/payments.service.ts` (production URLs)
- `backend/src/modules/payments/payments.controller.ts` (webhook validation)
- `backend/src/modules/orders/orders.service.ts` (commission calculation)
- `backend/.env` (real MP credentials)

---

### 3. Google Maps API Integration

**Current state:** The landing page uses Leaflet + OpenStreetMap (free). Backend geolocation uses Haversine formula in-memory. No Google Maps integration.

**What to do:**

- The job description says "Integration with Google Maps API for future geolocation." This was agreed to be preparatory architecture, not full implementation.
- **Option A (recommended for MVP):** Keep Leaflet/OSM. It works, it's free, and the backend geo already handles nearby search. Add a `MAPS_PROVIDER` env var that defaults to `osm` but can be switched to `google` later.
- **Option B:** Replace Leaflet with Google Maps JavaScript API on the landing page. Requires:
  - Google Cloud project + Maps JavaScript API key
  - `@react-google-maps/api` or `@vis.gl/react-google-maps` npm package
  - Replace `MapIllustration` component to use Google Maps
  - Add Places API for address autocomplete in optica registration
  - Add Geocoding API for converting addresses to lat/lng
  - Monthly cost: ~$200/month at moderate usage after $200 free credit
- **Recommendation:** Keep Leaflet/OSM for now. Document the Google Maps migration path. The architecture already supports swapping — the backend geo service is map-agnostic.

**Files to create/modify (if Option B chosen):**
- `frontend/src/pages/Landing.jsx` (replace map component)
- `frontend/src/components/GoogleMap.jsx` (new)
- `frontend/.env` (VITE_GOOGLE_MAPS_API_KEY)

---

### 4. Testing

**Current state:** Zero tests. No unit, integration, or e2e tests exist anywhere.

**What to do:**

#### 4.1 Backend Unit Tests (Jest + NestJS Testing)

NestJS already includes `@nestjs/testing` and Jest in devDependencies. Create tests for critical business logic:

| Test file | What to test |
|-----------|-------------|
| `quotes.service.spec.ts` | Quote creation, acceptance, rejection, expiry check |
| `requests.service.spec.ts` | Smart distribution scoring, request creation, expiry cron |
| `orders.service.spec.ts` | Order creation, status transitions, 48h auto-release |
| `disputes.service.spec.ts` | Dispute creation, window enforcement, resolution |
| `payments.service.spec.ts` | Preference creation (mock), refund (mock) |
| `notifications.service.spec.ts` | Email sending (mock transport) |

Each service test should mock the TypeORM repositories and external services.

#### 4.2 Backend Integration Tests

Test the API endpoints with a real database (test DB):

| Test file | What to test |
|-----------|-------------|
| `auth.e2e-spec.ts` | Register, login, JWT token, role-based access |
| `orders.e2e-spec.ts` | Full flow: request → quote → accept → order → deliver → confirm |
| `disputes.e2e-spec.ts` | Open dispute, add messages, admin resolve |
| `catalog.e2e-spec.ts` | CRUD frames with image upload |
| `payments.e2e-spec.ts` | Preference creation, webhook handling |

Use `supertest` with `@nestjs/testing` to create the app and send HTTP requests.

#### 4.3 Frontend Tests (Optional for MVP)

- Component smoke tests with Vitest + React Testing Library.
- Priority: auth flow, order creation, dispute submission.
- Not strictly required for MVP delivery but recommended.

**Files to create:**
- `backend/src/modules/quotes/quotes.service.spec.ts`
- `backend/src/modules/requests/requests.service.spec.ts`
- `backend/src/modules/orders/orders.service.spec.ts`
- `backend/src/modules/disputes/disputes.service.spec.ts`
- `backend/src/modules/payments/payments.service.spec.ts`
- `backend/src/modules/notifications/notifications.service.spec.ts`
- `backend/test/auth.e2e-spec.ts`
- `backend/test/orders.e2e-spec.ts`

---

### 5. Documentation

**Current state:** No API documentation. No deployment guide. Only `.env.example` exists.

**What to do:**

#### 5.1 API Documentation (Swagger)

- Install `@nestjs/swagger` and `swagger-ui-express`.
- Add `SwaggerModule.setup()` in `main.ts`.
- Add `@ApiTags()`, `@ApiOperation()`, and `@ApiResponse()` decorators to all controllers.
- Swagger UI available at `/api/docs` in development.

#### 5.2 Deployment Guide

Create a `DEPLOYMENT.md` covering:

- System requirements (Node 18+, PostgreSQL 15+, npm)
- Environment variable setup (copy `.env.example` → `.env`)
- Database setup (create DB, TypeORM auto-syncs tables)
- Backend: `npm run build && npm run start:prod`
- Frontend: `npm run build` → serve `dist/` with Nginx
- Domain setup: connect `lensia.pro` to the VPS
- SSL: Let's Encrypt with Certbot
- Process manager: PM2 for the backend
- Nginx config: reverse proxy `/api` to port 5000, serve frontend static files

#### 5.3 Docker Setup

Create containerization files:

- `backend/Dockerfile` — Node 18 Alpine, build & run
- `frontend/Dockerfile` — Node 18 Alpine build stage + Nginx serve stage
- `docker-compose.yml` — Backend + Frontend + PostgreSQL
- `.dockerignore` files

**Files to create:**
- `backend/Dockerfile` (new)
- `frontend/Dockerfile` (new)
- `docker-compose.yml` (new)
- `DEPLOYMENT.md` (new)

---

### 6. Additional Items (From Analysis)

These were identified during the Milestone 1 & 2 analysis as important gaps. Include what time allows:

#### 6.1 Password Reset Flow (High Priority)

- Backend: `POST /auth/forgot-password` — generates reset token, sends email with link.
- Backend: `POST /auth/reset-password` — validates token, updates password.
- Frontend: "Forgot password" page at `/forgot-password`.
- Frontend: "Reset password" page at `/reset-password?token=...`.
- The "Olvidaste tu contrasena?" link already exists on the login page but goes nowhere.

#### 6.2 Rate Limiting (High Priority)

- Install `@nestjs/throttler`.
- Apply global rate limit (e.g., 100 requests/minute per IP).
- Stricter limits on auth endpoints (10/minute) to prevent brute force.
- Stricter limits on file upload endpoints (20/minute).

#### 6.3 Commission Tracking (Medium Priority)

- Calculate commission on order creation using `commission_rate_pct` setting.
- Store in `order.commissionAmount` (column already exists).
- Admin dashboard: add total revenue and commission stats.
- Future: generate invoice records for opticas.

#### 6.4 In-App Notification Center (Low Priority — defer if time-constrained)

- Backend: `Notification` entity (userId, type, title, body, read, createdAt).
- Backend: `GET /notifications/mine`, `PATCH /notifications/:id/read`.
- Frontend: Bell icon in layout header with unread count badge.
- Frontend: Dropdown or page showing notification history.

---

## Suggested Timeline (1 Week)

| Day | Tasks |
|-----|-------|
| Day 1 | AWS S3 storage service + migration of 3 upload points |
| Day 2 | Mercado Pago E2E testing with sandbox + commission calculation |
| Day 3 | Backend unit tests (6 service spec files) |
| Day 4 | Backend integration tests (e2e) + password reset flow |
| Day 5 | Swagger API docs + rate limiting |
| Day 6 | Docker setup + deployment guide |
| Day 7 | Final testing, bug fixes, production deployment to VPS |

---

## Deliverables Checklist

- [ ] AWS S3 file storage with local fallback
- [ ] Mercado Pago full payment cycle tested (sandbox)
- [ ] Commission calculation stored on orders
- [ ] Google Maps migration path documented (or implemented)
- [ ] Backend unit tests (6+ spec files)
- [ ] Backend integration tests (2+ e2e files)
- [ ] Swagger API documentation at `/api/docs`
- [ ] Password reset flow (backend + frontend)
- [ ] Rate limiting on all endpoints
- [ ] Dockerfile for backend and frontend
- [ ] docker-compose.yml with PostgreSQL
- [ ] DEPLOYMENT.md with full setup instructions
- [ ] Production deployment to VPS with domain connected

---

## Risk Notes

| Risk | Mitigation |
|------|-----------|
| S3 bucket misconfiguration | Test with a throwaway bucket first. Use IAM role with minimal permissions (PutObject, GetObject). |
| MP webhook not reaching VPS | Use ngrok during development. In production, ensure port 5000 is proxied correctly by Nginx. |
| Google Maps API cost | Stick with Leaflet/OSM for MVP. Document migration path only. |
| Test flakiness with real DB | Use a separate `lensia_test` database. Truncate tables before each test suite. |
| Docker build size | Use multi-stage builds. Node 18 Alpine base. Frontend builds to static files served by Nginx. |
