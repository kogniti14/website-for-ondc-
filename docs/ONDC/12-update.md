# 12 - Buyer-Initiated Return Flow (/update -> /on_update)
**Company**: KOGNITI MINDS PRIVATE LIMITED  
**Protocol Version**: RET 1.2.5  
**Active ONDC Workbench Flow**: `Buyer_Initiated_Return_(Full_Order_and_Partial_Order)`  

---

## 1. Flow Overview
In ONDC RET 1.2.5, post-delivery returns are triggered via `POST /update`. The Seller App must handle both **Full Order Returns** and **Partial Order Returns**, compute accurate proportional refunds (taxable + GST), generate reverse logistics fulfillment objects, and attach return status tags.

---

## 2. Inbound `/update` Schema
```json
{
  "context": {
    "domain": "ONDC:RETeB2B",
    "action": "update",
    "transaction_id": "54e3d489-0be3-455b-9d41-3da39d520377",
    "message_id": "bb0e557b-7b56-4c4f-9e7c-86cf330de224"
  },
  "message": {
    "update_target": "fulfillment",
    "order": {
      "id": "KM_ONDC_ORD_881290",
      "fulfillments": [
        {
          "type": "Return",
          "tags": [
            {
              "code": "return_request",
              "list": [
                { "code": "id", "value": "F1" },
                { "code": "item_id", "value": "km-agri-a4-75" },
                { "code": "item_quantity", "value": "15" },
                { "code": "reason_id", "value": "002" }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

---

## 3. Return Processing & Proportional Refund
1. **Quantity Verification**: Validates that returned units (e.g. 15) do not exceed purchased units (50).
2. **Proportional Refund**:
   - Unit wholesale price: `₹182.16`
   - Taxable refund: `15 * 182.16 = ₹2,732.40`
   - GST refund (18%): `₹491.83`
   - Total refund: `₹3,224.23`
3. **Inventory Restoration**: The 15 returned units are immediately added back into `persistentStore.save('products', prod)`.
4. **Reverse Logistics Fulfillment**:
   ```json
   {
     "id": "R_1710000000",
     "type": "Return",
     "state": {
       "descriptor": {
         "code": "Return_Approved",
         "name": "Return Request Approved by Kogniti Minds"
       }
     },
     "start": {
       "instructions": {
         "name": "Reverse Quality Inspection and Mill Return Pickup"
       }
     }
   }
   ```
5. **Item Tags**: Returned items are annotated with:
   ```json
   {
     "code": "return_status",
     "list": [
       { "code": "return_quantity", "value": "15" },
       { "code": "status", "value": "Return_Approved" },
       { "code": "refund_value", "value": "3224.23" }
     ]
   }
   ```
