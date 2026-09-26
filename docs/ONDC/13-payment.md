# 13 - Payment & Settlement Architecture
**Company**: KOGNITI MINDS PRIVATE LIMITED  
**Document**: Payment & Settlement Specification  

---

## 1. Separation of Concerns
The Kogniti Minds platform strictly decouples public web consumer payments (Razorpay) from ONDC protocol payments:

```
                      +-------------------+
                      | Payment Interface |
                      +---------+---------+
                                |
             +------------------+------------------+
             |                                     |
             v                                     v
+------------------------+             +------------------------+
| Website Direct Payment |             |   ONDC BPP Payment     |
| (Razorpay PG / Webhook)|             | (Beckn Settlement Tag) |
+------------------------+             +------------------------+
             |                                     |
             +------------------+------------------+
                                v
                +-------------------------------+
                | Authoritative Audit & Invoice |
                +-------------------------------+
```

---

## 2. ONDC Payment Types
1. **`ON-FULFILLMENT`**: Enterprise buyer settles payment via NEFT/RTGS post-delivery against the tax invoice.
2. **`PRE-PAID`**: Pre-collected by buyer app on the network and remitted via nodal bank settlement.

---

## 3. Reverse Settlement for Returns
When `/update` approves a return, the settlement tags indicate:
```json
{
  "code": "settlement_details",
  "list": [
    { "code": "settlement_phase", "value": "refund" },
    { "code": "settlement_type", "value": "neft" },
    { "code": "settlement_status", "value": "INITIATED" },
    { "code": "beneficiary_name", "value": "Apex Educational Trust" },
    { "code": "settlement_amount", "value": "3224.23" }
  ]
}
```
