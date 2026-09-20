# Kogniti Minds - API Specification & Endpoint Reference

This document provides complete technical specifications for all production APIs operating on **https://kognitiminds.com**.

---

## 1. Production Health Check

### `GET /api/health` (or `/api/health.php`)
Returns operational health status across web server, PHP runtime, Resend transactional email, and persistent data storage.

- **Authentication:** None (Public diagnostic check)
- **Response Headers:** `Content-Type: application/json`
- **Success Status:** `HTTP 200 OK`

#### Response Body:
```json
{
    "status": "ok",
    "timestamp": "2026-09-20T04:40:58+00:00",
    "environment": "production",
    "services": {
        "server": "running",
        "php_version": "8.3.33",
        "email": {
            "configured": true,
            "provider": "Resend Server Dispatcher"
        },
        "payment": {
            "configured": true,
            "provider": "Razorpay"
        },
        "storage": {
            "status": "active",
            "counts": {
                "products": 12,
                "categories": 5,
                "b2c_users": 15,
                "b2b_businesses": 4,
                "b2c_orders": 8
            }
        }
    }
}
```

---

## 2. Authentication & Email OTP

### `POST /api/auth/send-otp` (or `/api/send-email.php`)
Dispatches a 6-digit verification code to the specified email address using server-side Resend credentials.

- **Authentication:** None (Public endpoint protected by rate-limiting)
- **Request Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "email": "customer@example.com",
  "otp": "748291",
  "purpose": "register",
  "subject": "Your Kogniti Minds Verification Code: 748291",
  "html": "<div>Optional custom styled HTML body</div>"
}
```

#### Success Response (`HTTP 200 OK`):
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

#### Error Responses:
- **`HTTP 400 Bad Request`**: `{ "success": false, "error": "Recipient email is required" }`
- **`HTTP 500 Internal Server Error`**: `{ "success": false, "error": "Server configuration error: RESEND_API_KEY is not configured on the production server." }`
- **`HTTP 502 Bad Gateway`**: `{ "success": false, "error": "cURL dispatch failed: <details>" }`

---

## 3. Data Persistence Engine

### `GET /api/data.php?collection={collection}&id={id}`
Retrieves one or all items from the server-side atomic JSON store.

- **Supported Collections:** `products`, `categories`, `b2c_users`, `b2b_businesses`, `b2c_orders`, `b2b_orders`, `b2b_quotations`, `admin_users`, `coupons`, `settings`.
- **Query Parameters:**
  - `collection` (Required): Name of the data collection.
  - `id` (Optional): ID of the specific item.

#### Success Response (`HTTP 200 OK`):
```json
[
  {
    "id": "usr_1726801234567",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "createdAt": "2026-09-20T04:10:00Z"
  }
]
```

### `POST /api/data.php?collection={collection}`
Creates or updates a record in the specified collection atomically.

#### Request Body:
```json
{
  "id": "usr_1726801234567",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "9876543210"
}
```

#### Success Response (`HTTP 200 OK`):
```json
{
  "success": true,
  "item": { ... }
}
```

---

## 4. Payment Gateway APIs

### `POST /api/payment/create-order`
Creates a Razorpay server-side order with amount in paise.

#### Request Body:
```json
{
  "amount": 1499,
  "orderNumber": "KM-20260920-4821",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "customerPhone": "9876543210",
  "isB2B": false
}
```

#### Success Response (`HTTP 200 OK`):
```json
{
  "success": true,
  "orderId": "order_EKfLsu8PUmFTeE",
  "amount": 149900,
  "currency": "INR"
}
```

### `POST /api/payment/verify`
Validates Razorpay payment signature using HMAC-SHA256.

#### Request Body:
```json
{
  "razorpay_order_id": "order_EKfLsu8PUmFTeE",
  "razorpay_payment_id": "pay_29QQoUBcx1R23",
  "razorpay_signature": "9ef4b472506e30b0b8c459...",
  "orderNumber": "KM-20260920-4821",
  "amount": 1499
}
```

#### Success Response (`HTTP 200 OK`):
```json
{
  "success": true,
  "verified": true,
  "message": "Payment cryptographically verified"
}
```

---

## 5. ONDC Protocol Endpoints (`ONDC:RETeB2B` v1.2.0)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/search` | Handles buyer search broadcast; dispatches `on_search` with signed catalog |
| `POST` | `/select` | Handles item selection; dispatches `on_select` with itemized GST quote |
| `POST` | `/init` | Initializes terms; dispatches `on_init` with settlement specification |
| `POST` | `/confirm` | Creates order; dispatches `on_confirm` to lock order |
| `POST` | `/status` | Handles order status query; dispatches `on_status` with tracking updates |
| `POST` | `/update` | Handles buyer-initiated returns; dispatches `on_update` with refund quote |
| `POST` | `/cancel` | Handles order cancellation requests |
