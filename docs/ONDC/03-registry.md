# 03 - Registry & Subscriber Onboarding
**Company**: KOGNITI MINDS PRIVATE LIMITED  
**Document**: Registry & Subscriber Onboarding Guide  

---

## 1. ONDC Registry Subscription

To participate as a Seller App (`BPP`) on ONDC, Kogniti Minds is registered with the ONDC Registry.

### Subscriber Parameters
- **Subscriber ID**: `kognitiminds.com`
- **Subscriber URI**: `https://kognitiminds.com`
- **Domain**: `ONDC:RETeB2B`
- **Type**: `BPP`
- **Country**: `IND`
- **City**: `std:080` (National serviceability circle)
- **Signing Public Key**: Base64 raw 32-byte Ed25519 public key
- **Encryption Public Key**: Base64 raw 32-byte X25519 public key
- **Unique Key ID**: `kogniti-key-01`

---

## 2. Dynamic Registry Lookup

When incoming requests arrive from Buyer Apps (`BAP`), the Seller App resolves the buyer's public key by querying:

```http
POST https://preprod.registry.ondc.org/ondc/lookup
Content-Type: application/json

{
  "subscriber_id": "buyer-app.ondc.org",
  "ukId": "key-01",
  "domain": "ONDC:RETeB2B"
}
```

The resulting `signing_public_key` is cached in `server/ondc/security/keyManagement.js` with a 24-hour TTL to prevent network overhead during high concurrency.
