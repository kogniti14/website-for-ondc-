# 15 - ONDC Workbench Compliance & Verification Guide
**Company**: KOGNITI MINDS PRIVATE LIMITED  
**Workbench URL**: [https://workbench.ondc.tech](https://workbench.ondc.tech)  
**Target Flow**: Retail B2B / RET 1.2.5  

---

## 1. Zero-Mock Workbench Philosophy

Per non-negotiable architectural mandates:
- **No Dummy Payloads**: Responses are generated dynamically from authoritative product and inventory records in `data/storage/products.json`.
- **No Hardcoded Successes**: Workbench tests execute the exact same business logic as live production network traffic.
- **Strict Schema Compliance**: Every payload conforms to RET 1.2.5 schema definitions and Beckn signature requirements.

---

## 2. Step-by-Step Workbench Testing Procedure

### Step 1: Network Configuration
1. Open [ONDC Workbench](https://workbench.ondc.tech).
2. Domain: `ONDC:RETeB2B`
3. Core Version: `1.2.5`
4. Role: `BPP`
5. Subscriber ID: `kognitiminds.com`
6. Subscriber URL: `https://kognitiminds.com` (or staging URL)

### Step 2: Discovery / Search Step
1. Trigger `/search` in Workbench.
2. If using the "Paste on_search" option, retrieve the live dynamically generated payload from:
   ```
   GET https://kognitiminds.com/ondc/on_search_sample
   ```
   or copy directly from the Super Admin Console (`/admin/ondc` -> "Copy on_search for Workbench").
3. Verify that all 13 items pass RET taxonomy checks.

### Step 3: Order Lifecycle Execution
1. Select items (`/select` -> `/on_select`). Verify tiered pricing and GST calculation.
2. Initialize (`/init` -> `/on_init`). Confirm billing address and fulfillment.
3. Confirm (`/confirm` -> `/on_confirm`). Confirm that internal order ID and stock reservation occur.
4. Status (`/status` -> `/on_status`). Confirm tracking status.

### Step 4: Buyer-Initiated Return Flow
1. Execute `/update` with return fulfillment.
2. Confirm reverse fulfillment object (`R_...`), state `Return_Approved`, proportional refund value, and returned inventory restoration.
