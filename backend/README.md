# Lensia Backend API

NestJS 10 backend for the Lensia optical marketplace MVP.

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

---

## Setup

1. Copy the environment file and fill in your values:

   ```bash
   cp .env.example .env
   ```

   Key variables to configure:

   | Variable | Description |
   |---|---|
   | `DB_HOST` | PostgreSQL host |
   | `DB_PORT` | PostgreSQL port (default 5432) |
   | `DB_USER` | Database user |
   | `DB_PASSWORD` | Database password |
   | `DB_NAME` | Database name |
   | `JWT_SECRET` | Secret for signing JWTs |
   | `JWT_EXPIRY` | Token expiry (e.g. `7d`) |
   | `AWS_REGION` | AWS region for S3 |
   | `AWS_ACCESS_KEY_ID` | AWS key for S3 uploads |
   | `AWS_SECRET_ACCESS_KEY` | AWS secret for S3 uploads |
   | `AWS_BUCKET_NAME` | S3 bucket for prescription images |
   | `MP_ACCESS_TOKEN` | Mercado Pago access token |
   | `MP_PUBLIC_KEY` | Mercado Pago public key |
   | `APP_URL` | Backend public URL |
   | `FRONTEND_URL` | Frontend origin for CORS |

2. Create the PostgreSQL database:

   ```sql
   CREATE DATABASE lensia_db;
   CREATE USER lensia WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE lensia_db TO lensia;
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start in development mode (hot reload, schema auto-sync):

   ```bash
   npm run start:dev
   ```

   The API will be available at `http://localhost:3000`.

---

## Module Structure

```
src/
├── app.module.ts                 Root module — wires all feature modules
├── main.ts                       Bootstrap: ValidationPipe, CORS, ExceptionFilter
│
├── common/
│   ├── decorators/
│   │   ├── roles.decorator.ts         @Roles(...roles) metadata setter
│   │   └── current-user.decorator.ts  @CurrentUser() param decorator
│   ├── guards/
│   │   ├── jwt-auth.guard.ts          Extends AuthGuard('jwt')
│   │   └── roles.guard.ts             Checks req.user.role against @Roles metadata
│   └── filters/
│       └── http-exception.filter.ts   Returns { statusCode, message, timestamp, path }
│
├── config/
│   └── database.config.ts        Standalone DataSource (for TypeORM CLI / migrations)
│
└── modules/
    ├── auth/           JWT + Local strategy, register / login / me
    ├── users/          User entity, CRUD, role filtering
    ├── settings/       platform_settings key-value table, seeded on startup
    ├── opticas/        Optica profiles, geolocation nearby search, referral codes
    ├── medicos/        Doctor directory, locations, ratings
    ├── prescriptions/  Client prescription image uploads (S3 placeholder)
    ├── catalog/        Per-optica frame catalog with AR-ready flags
    ├── notifications/  Email placeholder service (console.log)
    ├── requests/       Quote request broadcast + smart optica selection algorithm
    ├── quotes/         Optica quote responses with up to 5 frame selections
    ├── payments/       Mercado Pago escrow placeholder
    ├── orders/         Order state machine + 48h auto-release cron job
    ├── disputes/       3-party dispute messages + admin resolution
    └── admin/          Admin health endpoint
```

---

## Key Flows

### Authentication
- `POST /auth/register` — create account (`role`: cliente / optica / medico)
- `POST /auth/login` — returns `{ access_token, user }`
- `GET /auth/me` — returns authenticated user (Bearer token required)

### Prescription Upload
- `POST /prescriptions` — multipart form (`file` field + optional `notes`)
- `GET /prescriptions/mine` — client's own prescriptions

### Quote Request Flow
1. Client: `POST /requests` — broadcasts to scored nearby opticas
2. Optica: `GET /requests/assigned` — sees incoming requests
3. Optica: `POST /quotes` — responds with price + up to 5 frames
4. Client: `GET /quotes/request/:requestId` — views all quotes
5. Client: `PATCH /quotes/:id/accept` — accepts one quote

### Order State Machine
```
payment_pending -> payment_held -> in_process -> delivered -> completed
                                                           -> dispute -> resolved / refunded
```
- `PATCH /orders/:id/deliver` (optica) — sets deliveredAt + 48h verificationDeadline
- `PATCH /orders/:id/confirm` (client) — completes order, releases payment
- Cron job runs every hour to auto-complete orders past the verification deadline

### Disputes
- `POST /disputes` (cliente) — opens dispute for an order
- `GET /disputes/:id` — dispute detail with all messages
- `POST /disputes/:id/messages` — any party sends a message
- `PATCH /disputes/:id/resolve` (admin) — body `{ decision: 'release'|'refund'|'correction', adminDecision }`

### Platform Settings (admin only)
- `GET /settings` — all key-value settings
- `PATCH /settings` — update a setting `{ key, value }`

---

## Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Development mode with hot reload |
| `npm run build` | Compile TypeScript to dist/ |
| `npm run start:prod` | Run compiled build |
| `npm run lint` | ESLint check + auto-fix |
| `npm run test` | Unit tests |
| `npm run test:cov` | Coverage report |
