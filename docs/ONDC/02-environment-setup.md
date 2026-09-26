# 02 - Environment Setup & Configuration
**Company**: KOGNITI MINDS PRIVATE LIMITED  
**Document**: Environment Setup & Configuration Guide  

---

## 1. Environment Isolation

Kogniti Minds supports three strictly isolated environments:

| Parameter | Local Development | Staging / Pre-Production | Production |
| :--- | :--- | :--- | :--- |
| `ONDC_ENV` | `local` | `preprod` | `prod` |
| `ONDC_SUBSCRIBER_ID` | `localhost:3000` | `kognitiminds.com` | `kognitiminds.com` |
| `ONDC_SUBSCRIBER_URI` | `http://localhost:3000` | `https://kognitiminds.com` | `https://kognitiminds.com` |
| `ONDC_REGISTRY_URL` | N/A (local test keys) | `https://preprod.registry.ondc.org/ondc` | `https://prod.registry.ondc.org/ondc` |
| `ONDC_BUYER_BASE_URL` | Local mock port `3088` | `https://workbench.ondc.tech/api-service/ONDC:RETeB2B/1.2.5/buyer` | Dynamic per BAP |
| `ONDC_ENFORCE_AUTH` | `false` | `true` | `true` (Mandatory) |

---

## 2. Environment Variables (.env)

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# ONDC Network Identity
ONDC_ENV=preprod
ONDC_SUBSCRIBER_ID=kognitiminds.com
ONDC_SUBSCRIBER_URI=https://kognitiminds.com
ONDC_REGISTRY_DOMAIN=ONDC:RETeB2B
ONDC_CORE_VERSION=1.2.5
ONDC_CITY=std:080
ONDC_COUNTRY=IND

# ONDC Gateway & Registry
ONDC_REGISTRY_URL=https://preprod.registry.ondc.org/ondc
ONDC_BUYER_BASE_URL=https://workbench.ondc.tech/api-service/ONDC:RETeB2B/1.2.5/buyer

# Cryptographic Keys (Ed25519 Signing)
ONDC_KEY_ID=kogniti-key-01
ONDC_PRIVATE_KEY=<base64-encoded-ed25519-private-key>
ONDC_PUBLIC_KEY=<base64-encoded-ed25519-public-key>

# Cryptographic Keys (X25519 Encryption)
ONDC_ENCRYPTION_PRIVATE_KEY=<base64-encoded-x25519-private-key>
ONDC_ENCRYPTION_PUBLIC_KEY=<base64-encoded-x25519-public-key>

# Statutory Seller Attributes
SELLER_GSTIN=07AABCK1234F1Z5
SELLER_PAN=AABCK1234F

# Security Enforcement
ONDC_ENFORCE_AUTH=true
```

> [!CAUTION]
> Never commit `.env` or production private keys to Git. Use environment secrets in Hostinger cPanel or Cloudflare dashboard.
