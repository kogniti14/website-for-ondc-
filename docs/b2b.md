# Kogniti Minds - B2B Wholesale Portal & RFQ Engine

## 1. Overview
The B2B Wholesale Portal is tailored for educational institutions, corporate enterprises, government agencies, and wholesale distributors seeking sustainable paper products in volume.

---

## 2. Key Features

### 1. Minimum Order Quantity (MOQ)
Every sustainable product specifies a distinct B2B MOQ (e.g., 10 reams for A4 copier paper, 50 units for corporate notebooks). The cart enforces MOQ compliance before proceeding.

### 2. Tiered Wholesale Bulk Slabs
Bulk discounts are calculated automatically based on order volume:
- **Tier 1 (Base MOQ 10–24 units):** Base wholesale rate (e.g. ₹198/ream vs ₹320 retail).
- **Tier 2 (25–49 units):** Additional 5% discount (₹188.10/ream).
- **Tier 3 (50–99 units):** Additional 8% discount (₹182.16/ream).
- **Tier 4 (100+ units):** Additional 12% discount (₹174.24/ream).

### 3. Request for Quotation (RFQ) Engine
When an enterprise requires custom paper specifications (custom GSM, watermarking, custom branding, or pallet delivery):
1. User visits `/b2b/rfq` or clicks "Request Custom Quote".
2. Submits specs, expected volume, target delivery date, and sample requests.
3. System creates a `b2b_quotation` record with status `PENDING`.
4. Administrators review the request in the Admin Console, input quoted prices, and issue an official quotation.
5. Client accepts quotation with a single click, converting the RFQ directly into a confirmed order.

### 4. B2B Commercial Invoicing
- Generates B2B GST tax invoices including:
  - Buyer Legal Name and GSTIN
  - Seller Legal Name, GSTIN, PAN, and CIN
  - Purchase Order (PO) reference number
  - Itemized HSN Codes and GST tax breakdown (CGST+SGST or IGST based on state)
