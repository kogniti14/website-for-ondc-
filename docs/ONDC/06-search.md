# 06 - Search & Discovery Flow (/search -> /on_search)
**Company**: KOGNITI MINDS PRIVATE LIMITED  
**Protocol Version**: RET 1.2.5  

---

## 1. Flow Overview
When a Buyer App queries the ONDC network for sustainable copier paper, notebooks, or office stationery, the Gateway multicasts the `/search` request to all active BPPs registered under `ONDC:RETeB2B`.

---

## 2. Inbound `/search` Schema
```json
{
  "context": {
    "domain": "ONDC:RETeB2B",
    "country": "IND",
    "city": "std:080",
    "action": "search",
    "core_version": "1.2.5",
    "bap_id": "buyer-app-preprod.ondc.org",
    "bap_uri": "https://buyer-app-preprod.ondc.org/protocol/v1",
    "transaction_id": "54e3d489-0be3-455b-9d41-3da39d520377",
    "message_id": "0b0e557b-7b56-4c4f-9e7c-86cf330de223",
    "timestamp": "2026-09-27T00:00:00.000Z",
    "ttl": "PT30S"
  },
  "message": {
    "intent": {
      "item": {
        "descriptor": {
          "name": "paper"
        }
      }
    }
  }
}
```

---

## 3. Outbound `/on_search` Payload Construction
The catalog mapper (`server/ondc/catalogMapper.js`):
1. Reads products dynamically from `persistentStore.getAll('products')`.
2. Validates each product against RET taxonomy requirements (`catalogValidator.js`):
   - Mandatory statutory HSN with `4:` prefix (e.g. `4:48025610`).
   - Minimum Order Quantity (`b2b/moq` tag).
   - Quantity-based tiered bulk discounts (`bpp/item_discount` tag).
   - Origin country tag (`IND`).
   - Serviceability radius and timing schedules.
3. Dispatches the verified catalog to `context.bap_uri/on_search`.
