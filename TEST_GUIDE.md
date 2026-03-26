# Lensia MVP — Features & Test Guide

**Milestones:** 1 (Frontend) & 2 (Backend)
**Date:** 2026-03-25

---

## Milestone 2 (Backend) — 7 Features

### 1. Quote Expiry Enforcement

Prevents clients from accepting quotes after a request expires. The hourly cron now also bulk-rejects all pending quotes when a request expires.

**How to test:**

1. Login as `cliente@lensia.com` / `password`.
2. Create a new quote request (upload prescription, select preferences).
3. Manually expire the request in the database:
   ```sql
   UPDATE quote_requests SET "expiresAt" = NOW() - INTERVAL '1 hour', status = 'expired' WHERE id = '<request_id>';
   ```
4. Login as `optica@lensia.com` and try to respond to the solicitud.
   - **Expected:** Backend rejects quote creation — request is no longer `open`.
5. If a quote was already sent before expiring, login as cliente and try to accept it.
   - **Expected:** `400 BadRequest: This quote request has expired and quotes can no longer be accepted`.

---

### 2. RequestOptica Status Tracking

The junction table between requests and opticas now reflects real state: `pending` → `responded` when an optica sends a quote, and `pending` → `expired` when the cron runs.

**How to test:**

1. Create a quote request as cliente.
2. Query the database:
   ```sql
   SELECT * FROM request_opticas WHERE "requestId" = '<request_id>';
   ```
   All records should have `status = 'pending'`.
3. Login as optica and send a quote for that request.
4. Query again — the optica's record should now be `status = 'responded'`.
5. Let the request expire (set `expiresAt` to past, wait for cron or trigger manually).
6. Query again — remaining `pending` records should now be `status = 'expired'`.

---

### 3. Dispute Window Enforcement

Clients can only open disputes within the configurable window (default 7 days after delivery). Reads `dispute_window_days` from platform settings.

**How to test:**

1. Create a full order flow: request → quote → accept → pay → mark delivered.
2. As cliente, open a dispute within the window (before 7 days from delivery).
   - **Expected:** Dispute created successfully.
3. Set the delivery date to 8 days ago in the database:
   ```sql
   UPDATE orders SET "deliveredAt" = NOW() - INTERVAL '8 days' WHERE id = '<order_id>';
   ```
4. Try to open a dispute.
   - **Expected:** `400 BadRequest: The dispute window for this order has expired (7 days after delivery)`.

---

### 4. Email Notifications (Nodemailer)

Real SMTP email sending for order status updates and new quote request assignments. HTML-branded templates in Spanish. Falls back to console logging when `SMTP_*` env vars are not set.

**How to test without SMTP (default):**

1. Trigger an order status change (e.g., mark an order as delivered).
2. Check backend console logs for `[EMAIL] To: ... | Subject: ...`.
   - **Expected:** Email content logged to console, no actual send attempt.

**How to test with SMTP:**

1. Set SMTP vars in `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=no-reply@lensia.pro
   ```
2. Restart backend.
3. Trigger an order status change or create a new quote request.
4. Check inbox for Lensia-branded HTML email.
   - **Expected:** Email arrives with status label in Spanish and Lensia branding.

---

### 5. Mercado Pago Escrow

`GET /payments/preference/:orderId` now returns the MP checkout URL (`initPoint`) for frontend redirect. Refunds call `PaymentRefund.total()` via the MP SDK. Both fall back to mock mode when `MP_ACCESS_TOKEN` is unset.

**How to test in mock mode (no MP_ACCESS_TOKEN):**

1. Login as cliente, create a full flow up to order creation.
2. Go to the order detail page — should show blue "Pagar con Mercado Pago" banner.
3. Click the button.
   - **Expected:** Toast message "Modo de prueba: pago simulado correctamente". No redirect.

**How to test in real mode:**

1. Set `MP_ACCESS_TOKEN` in `.env` with a valid Mercado Pago test access token.
2. Restart backend.
3. Create an order and click "Pagar con Mercado Pago".
   - **Expected:** Browser redirects to Mercado Pago checkout page.
4. Complete payment with a test card.
5. Backend webhook updates order to `payment_held`.
6. Check backend logs for `[MP Webhook] Order ... payment approved`.

---

### 6. Catalog Frame Image Upload

`POST /catalog` and `PATCH /catalog/:id` now accept multipart file uploads via `FileInterceptor('image')`. Images stored in `./uploads/catalog/`, max 5 MB, JPG/PNG/WebP/GIF.

**How to test:**

1. Login as `optica@lensia.com`, go to "Mi catalogo de armazones".
2. Click "Agregar armazon".
3. Upload an image (JPG/PNG, under 5 MB) in the upload area at the top of the form.
   - **Expected:** Image preview appears with a remove (X) button.
4. Fill in brand, model, price. Click save.
   - **Expected:** Frame card now shows the uploaded image instead of the gray placeholder.
5. Edit the frame and upload a different image.
   - **Expected:** New image replaces the old one in the card.
6. Try uploading a file > 5 MB.
   - **Expected:** Toast error "La imagen no puede superar 5 MB."

---

### 7. Dispute Photo Upload

`POST /disputes` accepts up to 5 photos via `FilesInterceptor('photos', 5)`. Stored in `./uploads/disputes/`, saved as `DisputePhoto` records linked to the dispute.

**How to test:**

1. Have an order in `delivered` status.
2. As cliente, go to the order detail and click "Abrir disputa".
3. Select a reason, upload a photo, add a comment. Click "Enviar reclamo".
   - **Expected:** Dispute created. Check `dispute_photos` table for the saved record:
     ```sql
     SELECT * FROM dispute_photos WHERE "disputeId" = '<dispute_id>';
     ```
4. Repeat without a photo.
   - **Expected:** Dispute created without photos (JSON mode). No `DisputePhoto` records.

---

## Milestone 1 (Frontend) — 5 Features

### 8. Mercado Pago Checkout Button

Blue "Pagar con Mercado Pago" banner appears on order detail when status is `payment_pending`. Fetches preference from backend, redirects to MP checkout or shows mock toast.

**How to test:**

1. Create an order as cliente (accept a quote).
2. Go to the order detail page (`/cliente/pedidos/:id`).
   - **Expected:** Blue banner with "Tu pedido esta pendiente de pago" and a "Pagar con Mercado Pago" button.
3. Click the button.
   - **Mock mode:** Toast "Modo de prueba: pago simulado correctamente". No redirect.
   - **Real mode:** Browser redirects to Mercado Pago checkout page.

---

### 9. Map Expand/Fullscreen Fix

Control buttons now use `e.stopPropagation()` so clicking zoom/expand doesn't close the overlay. `invalidateSize()` delay increased to 350ms. Overlay click collapses directly (no toggle race).

**How to test:**

1. Open the landing page, scroll to the map section.
2. Click the expand button (arrows icon, bottom-right of map controls).
   - **Expected:** Map expands to full screen with dark overlay behind it. Map redraws correctly (no gray areas or missing tiles).
3. Click zoom in/out buttons while expanded.
   - **Expected:** Zoom works without closing the expanded view.
4. Click the dark overlay outside the map.
   - **Expected:** Map collapses back to normal size and redraws correctly.
5. Click the minimize button (instead of overlay).
   - **Expected:** Same behavior — map collapses.

---

### 10. Browser Geolocation

Removed hardcoded demo data. Uses `navigator.geolocation.getCurrentPosition()` for real position. Fetches actual opticas from `GET /api/opticas/nearby`. Falls back to Buenos Aires if denied. Info card shows real count.

**How to test (location allowed):**

1. Open the landing page (not logged in).
2. Browser asks for location permission — allow it.
   - **Expected:** Map centers on your real location. Blue user marker at your position. Nearby opticas fetched from API and displayed as cyan markers. Info card shows actual count (e.g., "3 opticas encontradas").

**How to test (location denied):**

1. Open the landing page and deny location permission.
   - **Expected:** Map defaults to Buenos Aires Obelisco (-34.6037, -58.3816). Still fetches opticas for that area from the API.

---

### 11. Frame Image Upload in Catalog UI

Modal form now has an image upload area with preview and remove button. Sends `FormData` when image selected, JSON otherwise. Cards display uploaded images. Price field now correctly maps to `priceMin`/`priceMax`.

**How to test:**

1. Login as `optica@lensia.com`, go to "Mi catalogo de armazones".
2. Click "Agregar armazon".
3. In the modal, the image upload area appears at the top.
4. Click it and select an image.
   - **Expected:** Image preview replaces the upload area. An (X) button allows removing it.
5. Fill in brand, model, price. Click save.
   - **Expected:** Frame card shows the uploaded image instead of the gray placeholder icon.
6. Click "Editar" on the frame — the modal shows the current image as preview.
7. Upload a different image and save.
   - **Expected:** Card updates with the new image.
8. Try uploading a file > 5 MB.
   - **Expected:** Toast error "La imagen no puede superar 5 MB."

---

### 12. Dispute Photo Upload (Frontend)

`DisputeModal` now builds `FormData` with the `photos` field when a photo is selected, matching the new backend `FilesInterceptor`.

**How to test:**

1. Have an order in `delivered` status.
2. As cliente, go to the order detail and click "Abrir disputa".
3. Select a reason, upload a photo using the file input, add a comment.
4. Click "Enviar reclamo".
   - **Expected:** Dispute created successfully. Backend receives the file via FormData. `dispute_photos` table has a new record.
5. Repeat the process without uploading a photo.
   - **Expected:** Dispute created via JSON body. No photo records.

---

## Quick Reference Table

| # | Feature | Where to Test | Mock-Safe |
|---|---------|--------------|-----------|
| 1 | Quote expiry | DB + API call | Yes |
| 2 | RequestOptica tracking | DB inspection | Yes |
| 3 | Dispute window | DB + API call | Yes |
| 4 | Email notifications | Backend logs / inbox | Yes (logs only) |
| 5 | MP escrow | Order detail page | Yes (toast) |
| 6 | Frame image upload | Optica catalog page | Yes |
| 7 | Dispute photo upload | Order detail dispute modal | Yes |
| 8 | MP checkout button | Order detail page | Yes (toast) |
| 9 | Map expand fix | Landing page map | Yes |
| 10 | Geolocation | Landing page map | Yes (fallback) |
| 11 | Catalog image UI | Optica catalog page | Yes |
| 12 | Dispute photo UI | Order detail dispute modal | Yes |

All features work in mock mode (no external services needed). Set `MP_ACCESS_TOKEN` and `SMTP_*` env vars to enable real integrations.

---

## Seed Users for Testing

| Email | Password | Role |
|-------|----------|------|
| `admin@lensia.com` | `password` | Administrador |
| `cliente@lensia.com` | `password` | Cliente |
| `optica@lensia.com` | `password` | Optica |
| `medico@lensia.com` | `password` | Medico |

These are auto-seeded on first backend startup.
