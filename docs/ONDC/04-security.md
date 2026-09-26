# 04 - Cryptography & Security Specification
**Company**: KOGNITI MINDS PRIVATE LIMITED  
**Document**: Cryptography & Security Guide  

---

## 1. Cryptographic Standards

ONDC protocol security is based on the Beckn authorization specification:
- **Hashing**: BLAKE-512 (64 bytes digest)
- **Signature Algorithm**: Ed25519 (RFC 8032)
- **Key Exchange / Encryption**: X25519

---

## 2. Request Signing (Outgoing Callbacks)

For every outgoing asynchronous callback (`/on_search`, `/on_select`, `/on_init`, `/on_confirm`, `/on_status`, `/on_cancel`, `/on_update`), the Seller App generates a Beckn `Authorization` header:

```
Signature keyId="kognitiminds.com|kogniti-key-01|ed25519",algorithm="ed25519",created="1710000000",expires="1710000300",headers="(created) (expires) digest",signature="..."
```

### Signing String Construction
```
(created): 1710000000
(expires): 1710000300
digest: BLAKE-512=<Base64_BLAKE_512_Digest_Of_Raw_Body>
```

---

## 3. Request Verification (Incoming Requests)

The verification middleware (`server/ondc/security/verification.js`) performs four levels of defense:
1. **Header Parsing**: Validates `keyId`, `created`, `expires`, and `signature`.
2. **Replay Protection**: Rejects requests older than 300 seconds (5 minutes) or with future timestamps exceeding clock skew tolerance.
3. **Digest Validation**: Computes `BLAKE-512` over the raw incoming body buffer and confirms match.
4. **Signature Verification**: Verifies the digital signature using the subscriber's public key fetched from the registry or in-memory cache.
