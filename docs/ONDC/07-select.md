# 07 - Select & Quotation Flow (/select -> /on_select)
**Company**: KOGNITI MINDS PRIVATE LIMITED  
**Protocol Version**: RET 1.2.5  

---

## 1. Flow Overview
When a buyer selects specific paper items and quantities from the catalog, the Buyer App sends a `/select` request to obtain an authoritative quotation.

---

## 2. Inbound `/select` Schema
```json
{
  "context": {
    "domain": "ONDC:RETeB2B",
    "action": "select",
    "transaction_id": "54e3d489-0be3-455b-9d41-3da39d520377",
    "message_id": "95a703d1-4db8-406e-8219-482a5c0b1154",
    "bap_id": "buyer-app-preprod.ondc.org",
    "bap_uri": "https://buyer-app-preprod.ondc.org/protocol/v1"
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
      "fulfillments": [
        {
          "end": {
            "location": {
              "address": {
                "state": "Uttar Pradesh",
                "city": "Noida",
                "area_code": "201301"
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

## 3. Pricing & Tax Calculation (`priceEngine.js`)
The central price engine executes:
1. **Tiered Bulk Discount**: At 50 units, the 8% volume tier applies (₹198 -> ₹182.16).
2. **Taxable Amount**: `50 * 182.16 = ₹9,108.00`.
3. **Statutory GST**:
   - Destination: Uttar Pradesh (Intrastate with Kogniti Minds).
   - Rate: 18% (9% CGST + 9% SGST).
   - CGST: `₹819.72`, SGST: `₹819.72`. Total GST: `₹1,639.44`.
4. **Freight / Delivery**: Calculated based on aggregate weight.
5. **Quote Breakdown**: Sent in standard Beckn `@ondc/org/title_type` breakdown.
