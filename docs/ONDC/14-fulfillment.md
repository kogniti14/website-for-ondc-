# 14 - Fulfillment & Logistics Specification
**Company**: KOGNITI MINDS PRIVATE LIMITED  
**Document**: Fulfillment & Logistics Specification  

---

## 1. Fulfillment Model
Kogniti Minds operates as a manufacturer and primary distributor:
- **Location ID**: `L1` (Noida Central Mill & Warehouse, GPS: `28.6280,77.3750`)
- **Serviceability Radius**: 3,000 km (Pan-India)
- **Fulfillment Types**:
  - `Delivery` (Standard Surface Freight via logistics partners)
  - `Return` (Reverse Logistics with Quality Inspection)

---

## 2. Weight & Dimensional Calculations
Copier paper is dense and heavy (approx. 2.35 kg to 2.50 kg per ream, 11.8 kg per carton, 475 kg per pallet).
The delivery engine in `server/ondc/priceEngine.js` dynamically computes:
- Aggregate order weight
- Local UP/NCR vs Interstate surface freight
- Subsidized freight for institutional bulk orders
