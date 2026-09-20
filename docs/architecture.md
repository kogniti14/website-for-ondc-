# Kogniti Minds - System Architecture & Technical Specification

This document provides the full architectural blueprint of the **Kogniti Minds** digital commerce and ONDC platform.

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph Client Tier (Browser)
        UI[React 18 Single Page Application]
        AuthCtx[AuthContext - Role & State Management]
        CartCtx[CartContext - Pricing & Tax Calculation]
        LocalStorage[(Browser LocalStorage Cache)]
        UI <--> AuthCtx
        UI <--> CartCtx
        AuthCtx <--> LocalStorage
        CartCtx <--> LocalStorage
    end

    subgraph Hostinger Production Server (LiteSpeed / Apache)
        Apache[Apache / LiteSpeed Web Server]
        PHPHealth[api/health.php - Health Endpoint]
        PHPEmail[api/send-email.php - Transactional Dispatcher]
        PHPData[api/data.php - Persistence Engine]
        JSONStore[(data/storage/*.json - Atomic Store)]
        
        Apache -->|GET /api/health| PHPHealth
        Apache -->|POST /api/auth/send-otp| PHPEmail
        Apache -->|GET/POST /api/data/*| PHPData
        PHPData <--> JSONStore
    end

    subgraph External Infrastructure
        Resend[Resend Transactional API]
        Razorpay[Razorpay Payment Gateway]
        ONDCNetwork[Government of India ONDC B2B Network]
    end

    subgraph ONDC Daemon (Node.js Express on Port 3000)
        Express[server.js - Express 5 Application]
        ONDCRouter[server/ondc/ondcRouter.js]
        Crypto[server/ondc/crypto.js - Ed25519 Signatures]
        Mapper[server/ondc/catalogMapper.js]
        
        Apache -.->|Reverse Proxy ondc routes| Express
        Express --> ONDCRouter
        ONDCRouter <--> Crypto
        ONDCRouter <--> Mapper
    end

    PHPEmail -->|HTTPS + Server Key| Resend
    UI -->|Client SDK| Razorpay
    ONDCRouter <-->|Beckn Protocol Callbacks| ONDCNetwork
```

---

## 2. Authentication & OTP Verification Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Customer / Corporate Buyer
    participant Client as Frontend (AuthModal / useAuth)
    participant Server as Hostinger Server (send-email.php)
    participant Resend as Resend Transactional API
    participant Mail as Customer Email Inbox

    User->>Client: Enters Email & clicks "Send OTP"
    Client->>Client: Generates secure 6-digit OTP (crypto.getRandomValues)
    Client->>Client: Starts 10-second real-time countdown timer
    Client->>Server: POST /api/auth/send-otp { email, otp, purpose }
    Server->>Server: Reads RESEND_API_KEY from Hostinger environment
    Server->>Resend: HTTPS POST /emails { from, to, subject, html }
    Resend->>Mail: Delivers verification email with 6-digit code
    Resend-->>Server: HTTP 200 OK (id: resend_id)
    Server-->>Client: HTTP 200 { success: true, message: "OTP sent successfully" }
    User->>Client: Types 6-digit OTP & clicks "Verify"
    Client->>Client: Validates OTP match, expiration (10 min), and attempt limit
    Client->>Client: Invalidates OTP token (prevents replay attacks)
    Client->>User: Grants authenticated session & updates UI role
```

---

## 3. Order & Payment Processing Flow

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Buyer (B2C or B2B)
    participant Checkout as Checkout Page
    participant Service as razorpayService.ts
    participant Gateway as Razorpay Checkout Modal
    participant Backend as Payment Verification Endpoint
    participant Storage as Storage Service (data.php)

    Buyer->>Checkout: Reviews cart items, address, and selects Razorpay
    Checkout->>Service: initiateRazorpayCheckout(options)
    Service->>Gateway: Launches Razorpay Checkout SDK
    Gateway->>Buyer: Displays UPI, Card, Netbanking options
    Buyer->>Gateway: Completes financial transaction
    Gateway-->>Service: Returns { razorpay_payment_id, razorpay_order_id, razorpay_signature }
    Service->>Backend: POST /api/payment/verify { paymentId, orderId, signature }
    Backend->>Backend: Verifies HMAC-SHA256 signature using RAZORPAY_KEY_SECRET
    Backend-->>Service: { verified: true }
    Service->>Storage: Records transaction in accounting ledger
    Checkout->>Storage: Creates Order record (status: 'CONFIRMED', payment: 'PAID')
    Checkout->>Buyer: Displays Order Confirmation & Downloadable GST Invoice
```

---

## 4. ONDC B2B Buyer-Seller Flow

```mermaid
sequenceDiagram
    autonumber
    participant BAP as ONDC Commercial Buyer App (BAP)
    participant Gateway as ONDC Registry & Gateway
    participant BPP as Kogniti Minds BPP Node (server.js)

    BAP->>Gateway: Broadcasts search intent (e.g. "paper", "notebooks")
    Gateway->>BPP: POST /search { context, message: { intent } }
    BPP-->>BAP: Synchronous ACK { message: { ack: { status: "ACK" } } }
    BPP->>BAP: Asynchronous POST /on_search with signed catalog & tiered B2B slabs
    BAP->>BPP: POST /select { items: [{ id, quantity }] }
    BPP-->>BAP: Synchronous ACK
    BPP->>BAP: Asynchronous POST /on_select with itemized GST quote
    BAP->>BPP: POST /init { billing, fulfillment }
    BPP->>BAP: Asynchronous POST /on_init with terms & settlement details
    BAP->>BPP: POST /confirm { order: { id, state, payment } }
    BPP->>BAP: Asynchronous POST /on_confirm (Order locked in production)
```
