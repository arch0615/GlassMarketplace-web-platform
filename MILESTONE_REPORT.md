# Lensia MVP — Milestone 1 & 2 Completion Report

**Date:** 2026-03-25
**Status:** Complete — Backend 0 TS errors, Frontend builds clean

---

## Overview

This report covers all changes made to complete **Milestone 1 (Frontend)** and **Milestone 2 (Backend)** of the Lensia MVP. Work includes bug fixes, new features, and integrations across 15 files.

---

## Milestone 2 — Backend Changes

### 1. Bug Fixes

#### 1.1 Quote Expiry Enforcement

**Problem:** Clients could accept quotes even after the parent quote request had expired via the hourly cron job.

**Fix:**
- `backend/src/modules/quotes/quotes.service.ts` — Added check in `accept()`: if `quote.request.status === 'expired'`, throw `BadRequestException`.
- `backend/src/modules/requests/requests.service.ts` — In `expireRequests()` cron: now also rejects all pending quotes for each expired request using a bulk update query.
- `backend/src/modules/requests/requests.module.ts` — Added `Quote` entity to `TypeOrmModule.forFeature()`.

#### 1.2 RequestOptica Status Tracking

**Problem:** `RequestOptica` junction records were always stuck at `pending` status, never reflecting whether the optica responded or the request expired.

**Fix:**
- `backend/src/modules/quotes/quotes.service.ts` — In `create()`: after saving quote, updates `RequestOptica.status` to `'responded'` for the corresponding optica.
- `backend/src/modules/requests/requests.service.ts` — In `expireRequests()` cron: updates all `RequestOptica` records with `status='pending'` to `status='expired'` for each expired request.
- `backend/src/modules/quotes/quotes.module.ts` — Added `RequestOptica` entity to `TypeOrmModule.forFeature()`.

#### 1.3 Dispute Window Enforcement

**Problem:** Clients could open disputes at any time, even long after the configurable dispute window had passed.

**Fix:**
- `backend/src/modules/disputes/disputes.service.ts` — In `create()`: reads `dispute_window_days` from `SettingsService` (default 7), computes deadline from `order.deliveredAt`, and throws `BadRequestException` if the window has expired.
- `backend/src/modules/disputes/disputes.module.ts` — Added `SettingsModule` to imports.

---

### 2. Email Notifications (Nodemailer)

**Problem:** `NotificationsService` only logged to console. No real emails were sent for order updates or new request assignments.

**Changes:**
- Installed `nodemailer` + `@types/nodemailer` dependencies.
- `backend/src/modules/notifications/notifications.service.ts` — Complete rewrite:
  - Creates a nodemailer SMTP transport from env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).
  - Falls back to console logging when SMTP is not configured.
  - `notifyOrderStatus()` — Sends branded HTML email with Spanish status labels (Pago pendiente, En proceso, Entregado, etc.).
  - `notifyOpticaNewRequest()` — Sends branded HTML email notifying the optica of a new quote request.
  - All sends are wrapped in try/catch — email failures never crash the request.
- `backend/.env.example` — Added SMTP configuration variables.

---

### 3. Mercado Pago Escrow

**Problem:** `createPaymentPreference()` returned only a preference ID string. `releasePayment()` and `refundPayment()` were stubs that only logged.

**Changes:**
- `backend/src/modules/payments/payments.service.ts`:
  - `createPaymentPreference()` now returns `{ preferenceId, initPoint }` — the `initPoint` is the MP hosted checkout URL for frontend redirect.
  - `refundPayment()` — Now loads the order, retrieves `mpPaymentId`, and calls `PaymentRefund.total()` via the MP SDK. Falls back to logging in mock mode.
  - `releasePayment()` — Documented: with `binary_mode: true`, funds are captured immediately on approval; release is tracked via order status transitions.
- `backend/src/modules/payments/payments.controller.ts`:
  - `GET /payments/preference/:orderId` — Now creates a fresh MP preference and returns `{ preferenceId, initPoint }`. Added `JwtAuthGuard`.
- `backend/src/modules/orders/orders.service.ts` — Updated to destructure the new return type from `createPaymentPreference()`.

---

### 4. File Upload Endpoints

#### 4.1 Catalog Frame Images

**Problem:** Opticas had no way to upload frame images. The `imageUrl` field existed but there was no upload handler.

**Changes:**
- `backend/src/modules/catalog/catalog.controller.ts`:
  - Added `FileInterceptor('image')` to `POST /catalog` and `PATCH /catalog/:id` routes.
  - Storage: `./uploads/catalog/` directory (auto-created on startup).
  - Max file size: 5 MB. Accepted formats: JPG, PNG, WebP, GIF.
  - When a file is uploaded, sets `dto.imageUrl = '/uploads/catalog/{filename}'`.

#### 4.2 Dispute Evidence Photos

**Problem:** `DisputePhoto` entity existed but there was no upload handler. The frontend dispute form captured a file but sent only JSON.

**Changes:**
- `backend/src/modules/disputes/disputes.controller.ts`:
  - Added `FilesInterceptor('photos', 5)` to `POST /disputes` route.
  - Storage: `./uploads/disputes/` directory (auto-created on startup).
  - Max 5 photos, 5 MB each. Accepted formats: JPG, PNG, WebP, GIF.
  - Passes photo URLs to the service.
- `backend/src/modules/disputes/disputes.service.ts`:
  - `create()` now accepts optional `photoUrls: string[]` parameter.
  - After saving the dispute, creates `DisputePhoto` records for each uploaded file.
  - Injected `DisputePhoto` repository.

---

## Milestone 1 — Frontend Changes

### 5. Mercado Pago Checkout Button

**Problem:** No payment flow existed in the frontend. After order creation, there was no way for the client to pay.

**Changes:**
- `frontend/src/pages/cliente/PedidoDetalle.jsx`:
  - Added blue payment banner when `order.status === 'payment_pending'`.
  - "Pagar con Mercado Pago" button fetches `GET /payments/preference/:orderId` from the backend.
  - If `initPoint` URL is returned, redirects the browser to MP hosted checkout.
  - If `initPoint` is empty (mock mode), shows a toast "Modo de prueba: pago simulado correctamente" and reloads the order.
  - Shows loading spinner during redirect.

### 6. Map Expand/Fullscreen Fix

**Problem:** Clicking the expand button on the landing page map resulted in display issues — controls could propagate clicks to the overlay, and `invalidateSize()` timing was unreliable.

**Changes:**
- `frontend/src/pages/Landing.jsx`:
  - Added `e.stopPropagation()` on all control buttons (zoom in, zoom out, expand) to prevent click bubbling to the overlay.
  - Increased `invalidateSize()` delay from 300ms to 350ms for more reliable CSS transition completion.
  - Overlay `onClick` uses `() => setExpanded(false)` directly instead of toggle, preventing accidental double-toggle.

### 7. Browser Geolocation

**Problem:** The landing page map was hardcoded with Buenos Aires Obelisco coordinates and 5 fake optica markers. No real geolocation was used.

**Changes:**
- `frontend/src/pages/Landing.jsx`:
  - Removed hardcoded `OPTICAS` array.
  - On mount, calls `navigator.geolocation.getCurrentPosition()` to get the user's real location.
  - On success: centers the map on the user's location and fetches real opticas from `GET /api/opticas/nearby?lat=X&lng=Y&radius=10`.
  - On denied/error: falls back to Buenos Aires center (-34.6037, -58.3816) and still fetches opticas.
  - Markers are dynamically created from API response data, showing `businessName` and `address`.
  - Info card overlay now shows the real count: `"N opticas encontradas"`.

### 8. Frame Image Upload in Catalog

**Problem:** Optica catalog had no image upload in the UI. Frame cards showed a gray placeholder. The form sent JSON, not FormData.

**Changes:**
- `frontend/src/pages/optica/Catalogo.jsx`:
  - Added image upload area at the top of the add/edit modal with drag-and-drop style.
  - Image preview with a remove button.
  - Max file size: 5 MB. Accepted formats: JPEG, PNG, WebP, GIF.
  - `handleSave()` now builds `FormData` when an image is selected (includes `image` field + all form fields as strings). Sends JSON when no image.
  - Fixed price field mapping: now sends `priceMin`/`priceMax` matching the backend DTO (was sending `price` which didn't map to any entity column).
  - Frame cards now show the uploaded image via `<img>` tag. Falls back to an `ImageIcon` placeholder when no image exists.

### 9. Dispute Photo Upload

**Problem:** The dispute modal captured a file via state but `handleSubmit()` sent only JSON, ignoring the photo.

**Changes:**
- `frontend/src/pages/cliente/PedidoDetalle.jsx`:
  - `handleSubmit()` in `DisputeModal` now checks if `photoFile` is set.
  - If photo exists: builds `FormData` with `photos` file field + `orderId`, `reason`, `comment` as text fields.
  - If no photo: sends JSON as before.
  - The `api()` wrapper already handles FormData (skips Content-Type header).

---

## Files Modified Summary

### Backend (10 files)

| File | Type of Change |
|------|---------------|
| `backend/src/modules/quotes/quotes.service.ts` | Bug fix: expiry check + RequestOptica status update |
| `backend/src/modules/quotes/quotes.module.ts` | Added `RequestOptica` to TypeORM imports |
| `backend/src/modules/requests/requests.service.ts` | Bug fix: reject quotes + expire RequestOptica in cron |
| `backend/src/modules/requests/requests.module.ts` | Added `Quote` entity to TypeORM imports |
| `backend/src/modules/disputes/disputes.service.ts` | Bug fix: window enforcement + photo saving |
| `backend/src/modules/disputes/disputes.module.ts` | Added `SettingsModule` import |
| `backend/src/modules/disputes/disputes.controller.ts` | Added `FilesInterceptor` for photo upload |
| `backend/src/modules/notifications/notifications.service.ts` | Rewritten: Nodemailer SMTP integration |
| `backend/src/modules/payments/payments.service.ts` | Returns `initPoint` + real MP refund |
| `backend/src/modules/payments/payments.controller.ts` | Fixed preference endpoint + JWT guard |
| `backend/src/modules/catalog/catalog.controller.ts` | Added `FileInterceptor` for image upload |
| `backend/src/modules/orders/orders.service.ts` | Destructured new preference return type |
| `backend/.env.example` | Added SMTP configuration variables |

### Frontend (3 files)

| File | Type of Change |
|------|---------------|
| `frontend/src/pages/cliente/PedidoDetalle.jsx` | MP pay button + dispute FormData |
| `frontend/src/pages/Landing.jsx` | Browser geolocation + map expand fix |
| `frontend/src/pages/optica/Catalogo.jsx` | Image upload + preview + price field fix |

### Dependencies Added

| Package | Location | Purpose |
|---------|----------|---------|
| `nodemailer` | backend | SMTP email sending |
| `@types/nodemailer` | backend (dev) | TypeScript types |
| `@types/multer` | backend (dev) | TypeScript types for file upload |

---

## Environment Variables

The following new variables were added to `backend/.env.example`:

```env
SMTP_HOST=          # SMTP server hostname (e.g., smtp.gmail.com)
SMTP_PORT=587       # SMTP port (587 for TLS, 465 for SSL)
SMTP_USER=          # SMTP username/email
SMTP_PASS=          # SMTP password or app password
SMTP_FROM=no-reply@lensia.pro  # From address for outgoing emails
```

When these are not set, notifications fall back to console logging only. Existing variables are unchanged.

---

## Build Verification

| Check | Result |
|-------|--------|
| Backend TypeScript (`npx tsc --noEmit`) | 0 errors |
| Frontend Vite build (`npx vite build`) | Success (28.53s) |

---

## Test Guide

### Prerequisites

1. Backend running on port 5000 with PostgreSQL connected.
2. Frontend running on port 5173 (or built and served).
3. Seed users available (run backend once to auto-seed):
   - `admin@lensia.com` / `password` (admin)
   - `cliente@lensia.com` / `password` (cliente)
   - `optica@lensia.com` / `password` (optica)
   - `medico@lensia.com` / `password` (medico)

### Test 1: Quote Expiry Enforcement

1. Login as `cliente@lensia.com`.
2. Create a new quote request (upload prescription, select preferences).
3. In the database, manually set the request's `expiresAt` to a past date:
   ```sql
   UPDATE quote_requests SET "expiresAt" = NOW() - INTERVAL '1 hour', status = 'expired' WHERE id = '<request_id>';
   ```
4. Login as `optica@lensia.com` and try to respond to the solicitud.
   - **Expected:** The backend should reject the quote creation because the request is no longer `open`.
5. If a quote was already sent before expiring, login as `cliente@lensia.com` and try to accept it.
   - **Expected:** `BadRequestException: This quote request has expired and quotes can no longer be accepted`.

### Test 2: RequestOptica Status Tracking

1. Create a quote request as cliente.
2. Check the `request_opticas` table — all records should have `status = 'pending'`.
3. Login as optica and send a quote for that request.
4. Check `request_opticas` — the optica's record should now be `status = 'responded'`.
5. Let the request expire (set `expiresAt` to past, wait for cron or trigger manually).
6. Check `request_opticas` — remaining `pending` records should now be `status = 'expired'`.

### Test 3: Dispute Window Enforcement

1. Create a full order flow: request -> quote -> accept -> pay -> mark delivered.
2. As cliente, open a dispute within the window (before 7 days from delivery).
   - **Expected:** Dispute created successfully.
3. In the database, set `deliveredAt` to 8 days ago:
   ```sql
   UPDATE orders SET "deliveredAt" = NOW() - INTERVAL '8 days' WHERE id = '<order_id>';
   ```
4. Try to open a dispute.
   - **Expected:** `BadRequestException: The dispute window for this order has expired (7 days after delivery)`.

### Test 4: Email Notifications

#### Without SMTP (default):
1. Trigger an order status change.
2. Check backend console logs for `[EMAIL] To: ... | Subject: ...`.
   - **Expected:** Email content logged, no send attempt.

#### With SMTP:
1. Set SMTP vars in `.env` (use a test Gmail account with app password or Mailtrap).
2. Restart backend.
3. Trigger an order status change or create a new quote request.
4. Check inbox for Lensia-branded HTML email.
   - **Expected:** Email arrives with status label in Spanish and Lensia branding.

### Test 5: Mercado Pago Payment Flow

#### Mock mode (no MP_ACCESS_TOKEN):
1. Login as cliente, create a full flow up to order creation.
2. Go to the order detail page — should show blue "Pagar con Mercado Pago" banner.
3. Click the button.
   - **Expected:** Toast message "Modo de prueba: pago simulado correctamente". No redirect.

#### Real mode (MP_ACCESS_TOKEN set):
1. Set `MP_ACCESS_TOKEN` in `.env` with a valid Mercado Pago test access token.
2. Restart backend.
3. Create an order and click "Pagar con Mercado Pago".
   - **Expected:** Browser redirects to Mercado Pago checkout page.
4. Complete payment with a test card.
5. Backend webhook updates order to `payment_held`.
6. Check backend logs for `[MP Webhook] Order ... payment approved`.

### Test 6: Frame Image Upload

1. Login as `optica@lensia.com`, go to "Mi catalogo de armazones".
2. Click "Agregar armazon".
3. Upload an image (JPG/PNG, under 5 MB) in the new upload area at the top of the form.
   - **Expected:** Image preview appears with a remove (X) button.
4. Fill in brand, model, price. Click save.
   - **Expected:** Frame card now shows the uploaded image instead of the gray placeholder.
5. Edit the frame and upload a different image.
   - **Expected:** New image replaces the old one in the card.
6. Try uploading a file > 5 MB.
   - **Expected:** Toast error "La imagen no puede superar 5 MB."

### Test 7: Dispute Photo Upload

1. Have an order in `delivered` status.
2. As cliente, go to the order detail and click "Abrir disputa".
3. Select a reason, upload a photo, add a comment.
4. Click "Enviar reclamo".
   - **Expected:** Dispute created. Check `dispute_photos` table for the saved record.
5. Repeat without a photo.
   - **Expected:** Dispute created without photos (JSON mode).

### Test 8: Map Geolocation

1. Open the landing page (not logged in).
2. Browser should ask for location permission.

#### If allowed:
- **Expected:** Map centers on your real location. Blue user marker at your position. Nearby opticas fetched from API and displayed as cyan markers. Info card shows actual count.

#### If denied:
- **Expected:** Map defaults to Buenos Aires Obelisco. Still fetches opticas for that area from the API.

### Test 9: Map Expand/Fullscreen

1. On the landing page, scroll to the map section.
2. Click the expand button (arrows icon, bottom-right of map controls).
   - **Expected:** Map expands to full screen with dark overlay behind it. Map redraws correctly (no gray areas).
3. Click zoom in/out buttons while expanded.
   - **Expected:** Zoom works without closing the expanded view.
4. Click the dark overlay outside the map.
   - **Expected:** Map collapses back to normal size and redraws correctly.
5. Click the minimize button.
   - **Expected:** Same as clicking overlay — map collapses.

### Test 10: MP Refund (Admin Dispute Resolution)

1. Have an order in `dispute` status with a valid `mpPaymentId`.
2. Login as `admin@lensia.com`, go to Disputas.
3. Resolve the dispute with "Reembolsar al cliente".
   - **Expected (mock mode):** Log `[MP] Mock: refund for payment ...`. Order status -> `refunded`.
   - **Expected (real mode):** MP API refund call. Log `[MP] Refund processed for payment ...`. Order status -> `refunded`.

---

## What Remains for Milestone 3

These items were explicitly scoped out of Milestones 1 & 2:

- [ ] AWS S3 file storage migration (currently local disk)
- [ ] Full end-to-end testing suite (unit, integration, e2e)
- [ ] Docker containerization and deployment setup
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Rate limiting and throttling
- [ ] Password reset flow
- [ ] In-app notification center UI
- [ ] Doctor appointment scheduling
- [ ] Commission tracking and ledger
- [ ] Real-time WebSocket chat
