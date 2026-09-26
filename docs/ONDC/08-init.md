# 08 - Initialization Flow (/init -> /on_init)
**Company**: KOGNITI MINDS PRIVATE LIMITED  
**Protocol Version**: RET 1.2.5  

---

## 1. Flow Overview
In `/init`, the buyer submits formal business billing details, statutory tax numbers (GSTIN/PAN), and delivery location. The Seller App responds with payment terms and delivery fulfillment specifications.

---

## 2. Inbound `/init` Payload
```json
{
  "context": {
    "domain": "ONDC:RETeB2B",
    "action": "init",
    "transaction_id": "54e3d489-0be3-455b-9d41-3da39d520377",
    "message_id": "e2e858db-bfd7-4ee4-9b27-c10ce5cda195"
  },
  "message": {
    "order": {
      "items": [
        {
          "id": "km-agri-a4-75",
          "quantity": {
            "count": 50
          }
        }
      ],
      "billing": {
        "name": "Apex Educational Trust",
        "address": {
          "street": "Knowledge Park II",
          "city": "Greater Noida",
          "state": "Uttar Pradesh",
          "area_code": "201310"
        },
        "tax_number": "07AAAAA0000A1Z5"
      },
      "fulfillments": [
        {
          "id": "F1",
          "type": "Delivery",
          "end": {
            "location": {
              "address": {
                "street": "Knowledge Park II",
                "city": "Greater Noida",
                "state": "Uttar Pradesh",
                "area_code": "201310"
              }
            }
          }
        }
      ]
    }
  }
}
```

---

## 3. Business Rule Enforcement
1. **Order State Check**: Transition from `SELECTED` to `INITIALIZED` is recorded in `stateManager`.
2. **Payment Terms**: Sets payment terms (`ON-FULFILLMENT` or `PRE-PAID`) without finalizing the order or deducting inventory prematurely.
