# 10 - Order Status Flow (/status -> /on_status)
**Company**: KOGNITI MINDS PRIVATE LIMITED  
**Protocol Version**: RET 1.2.5  

---

## 1. Flow Overview
Buyer Apps query `/status` periodically to monitor fulfillment milestones, dispatch status, and delivery completion.

---

## 2. Status Mapping
Internal Kogniti Minds fulfillment states are mapped to ONDC RET standard descriptor codes:

| Internal Status | ONDC Order State | ONDC Fulfillment Descriptor Code |
| :--- | :--- | :--- |
| `confirmed` | `Accepted` | `Order-picked-up` |
| `packed` | `Accepted` | `Order-packed` |
| `shipped` | `In-transit` | `Out-for-delivery` |
| `delivered` | `Completed` | `Order-delivered` |
| `cancelled` | `Cancelled` | `Order-cancelled` |
| `return_approved` | `Completed` | `Return_Approved` |

---

## 3. Strict Non-Synthetic Rule
If an order ID does not exist in `persistentStore`, the system does NOT synthesize a fake order. It logs a warning and returns an ONDC domain error (`30004` Order Not Found).
