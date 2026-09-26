# 09 - Order Confirmation Flow (/confirm -> /on_confirm)
**Company**: KOGNITI MINDS PRIVATE LIMITED  
**Protocol Version**: RET 1.2.5  

---

## 1. Flow Overview
`/confirm` is the critical transactional step where the purchase order is finalized, real inventory is locked, and the authoritative internal order record is created.

---

## 2. Inbound `/confirm` Payload
```json
{
  "context": {
    "domain": "ONDC:RETeB2B",
    "action": "confirm",
    "transaction_id": "54e3d489-0be3-455b-9d41-3da39d520377",
    "message_id": "3e9b110a-2f5d-4a11-8260-15ce920e8b23"
  },
  "message": {
    "order": {
      "id": "KM_ONDC_ORD_881290",
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
        "tax_number": "07AAAAA0000A1Z5"
      },
      "payment": {
        "type": "ON-FULFILLMENT",
        "status": "NOT-PAID"
      }
    }
  }
}
```

---

## 3. Atomic Order Creation & Inventory Deduction
1. **Idempotency Check**: If this `(transaction_id, message_id, confirm)` has already been processed, the previous order confirmation is returned immediately with zero duplicate deductions.
2. **Stock Verification & Lock**:
   ```javascript
   const currentStock = Number(prod.stock !== undefined ? prod.stock : 100);
   if (currentStock < count) throw new Error('Insufficient stock');
   prod.stock = currentStock - count;
   persistentStore.save('products', prod);
   ```
3. **Persistence**: Saved to both memory store and disk (`data/storage/ondc_orders.json`).
4. **State Transition**: Order state is set to `Created`, fulfillment state to `Order-picked-up`.
