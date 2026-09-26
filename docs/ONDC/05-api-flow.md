# 05 - End-to-End API Flow Architecture
**Company**: KOGNITI MINDS PRIVATE LIMITED  
**Document**: API Flow Architecture Guide  

---

## 1. Asynchronous Protocol Pattern

ONDC uses an asynchronous request-callback paradigm.
The Seller App does not process long-running commerce tasks before responding.
Instead, it returns a synchronous `ACK` immediately, then delivers the result payload to `context.bap_uri/<action>` in the background.

```
Buyer App (BAP)                    Seller App (BPP)
     |                                    |
     |--------- POST /search ------------>|
     |<-------- HTTP 200 { ACK } ---------| (Sync, <100ms)
     |                                    |
     |                              [Query Catalog]
     |                              [Sign Callback]
     |                                    |
     |<-------- POST /on_search ----------| (Async Callback)
     |--------- HTTP 200 { ACK } -------->|
     |                                    |
```

---

## 2. Supported Protocol Endpoints

| BAP Outbound Trigger | BPP Synchronous | BPP Asynchronous Callback | Callback Action |
| :--- | :--- | :--- | :--- |
| `POST /search` | `ACK` | `POST context.bap_uri/on_search` | Publishes full or filtered catalog |
| `POST /select` | `ACK` | `POST context.bap_uri/on_select` | Returns item quote, tax, and delivery quote |
| `POST /init` | `ACK` | `POST context.bap_uri/on_init` | Returns billing, terms, and payment terms |
| `POST /confirm` | `ACK` | `POST context.bap_uri/on_confirm` | Creates order & reserves inventory |
| `POST /status` | `ACK` | `POST context.bap_uri/on_status` | Returns real-time order & tracking status |
| `POST /track` | `ACK` | `POST context.bap_uri/on_track` | Returns live GPS / tracking URL |
| `POST /cancel` | `ACK` | `POST context.bap_uri/on_cancel` | Cancels order & restores inventory |
| `POST /update` | `ACK` | `POST context.bap_uri/on_update` | Processes buyer-initiated return & refund |
| `POST /rating` | `ACK` | `POST context.bap_uri/on_rating` | Submits feedback |
| `POST /support` | `ACK` | `POST context.bap_uri/on_support` | Returns contact email & phone |
