# 11 - Cancellation Flow (/cancel -> /on_cancel)
**Company**: KOGNITI MINDS PRIVATE LIMITED  
**Protocol Version**: RET 1.2.5  

---

## 1. Flow Overview
ONDC allows cancellations before fulfillment delivery. Once an order is delivered (`Completed`), cancellation is prohibited and the buyer must initiate a return via `/update`.

---

## 2. Inbound `/cancel` Schema
```json
{
  "context": {
    "domain": "ONDC:RETeB2B",
    "action": "cancel",
    "transaction_id": "54e3d489-0be3-455b-9d41-3da39d520377",
    "message_id": "87af1209-4ce1-4fa1-8451-b841e57cda01"
  },
  "message": {
    "order_id": "KM_ONDC_ORD_881290",
    "cancellation_reason_id": "001"
  }
}
```

---

## 3. Atomic Inventory Rollback
When an order cancellation is approved:
1. **Inventory Restoration**: Each purchased item's quantity is restored into `persistentStore.save('products', prod)`.
2. **Order Update**: Order status is marked as `cancelled`, with timeline record:
   ```json
   {
     "status": "CANCELLED",
     "timestamp": "2026-09-27T00:00:00.000Z",
     "note": "Order cancelled by buyer with reason code: 001. Inventory restored."
   }
   ```
3. **State Machine Guard**: Trying to cancel an already completed order returns ONDC code `40003`.
