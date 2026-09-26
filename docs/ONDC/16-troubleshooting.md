# 16 - Troubleshooting & Common Errors Guide
**Company**: KOGNITI MINDS PRIVATE LIMITED  
**Document**: Troubleshooting & Error Resolution Guide  

---

## 1. Common ONDC Protocol Error Codes

| Code | Type | Description | Root Cause & Resolution |
| :--- | :--- | :--- | :--- |
| `10000` | `CORE-ERROR` | Missing Context Attributes | Request payload missing `transaction_id`, `message_id`, or `domain`. Ensure client formats standard Beckn context. |
| `10001` | `CORE-ERROR` | Invalid Domain | Expected `ONDC:RETeB2B`. Verify domain in request header and context. |
| `20001` | `AUTH-ERROR` | Unauthorized Request | Signature mismatch, expired timestamp (>300s), or missing key. Check clock sync and public key registration. |
| `30000` | `DOMAIN-ERROR`| Invalid State Transition | Confirming without prior Init, or cancelling after delivery. Follow standard state machine lifecycle. |
| `30004` | `DOMAIN-ERROR`| Order Not Found | Target order ID does not exist in `persistentStore`. |
| `30006` | `DOMAIN-ERROR`| Insufficient Stock | Requested count exceeds available inventory in `data/storage/products.json`. |
| `40002` | `DOMAIN-ERROR`| Return On Cancelled Order | Returns can only be initiated on delivered orders (`Completed`). |
| `40003` | `DOMAIN-ERROR`| Cancellation of Delivered Order | Once order state is `Completed`, use `/update` to process returns. |
| `40004` | `DOMAIN-ERROR`| Return Quantity Exceeded | Requested return units exceed original purchased count. |

---

## 2. Cryptographic Signature Debugging

When testing in Pre-Production:
1. Verify the `(created)` and `(expires)` timestamps in the `Authorization` header. Clock drift must be under 300 seconds.
2. Confirm the raw body is unaltered between digest generation and transmission (UTF-8 encoding).
3. If testing locally without registry connectivity, set `ONDC_ENFORCE_AUTH=false` in `.env`.
