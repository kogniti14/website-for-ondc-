# Kogniti Minds - B2C E-Commerce Marketplace

## 1. Overview
The B2C Marketplace serves individual consumers, home offices, and small teams purchasing retail sustainable paper goods and eco-stationery.

---

## 2. Core Modules

### 1. Catalog & Product Discovery
- **Categories:** Sustainable Paper, Eco Notebooks, Office Organizers, Corporate Gifting, Pallets.
- **Filters & Search:** Real-time keyword search, category pill navigation, GSM filtering.
- **Product Details:** High-resolution image galleries, eco-impact metrics (trees saved, carbon offset), certifications, and bulk discount previews.

### 2. Shopping Cart & Wishlist
- **Cart Context (`src/context/CartContext.tsx`):**
  - Manages items, quantities, subtotal, GST (18%), and shipping calculations.
  - Free shipping threshold applied for orders above ₹500.
- **Wishlist Context (`src/context/WishlistContext.tsx`):**
  - Allows customers to save items for future purchases.

### 3. Promotional Coupon Engine
- Supports percentage discounts (e.g. `ECO10` - 10% off) and flat currency discounts (e.g. `FIRST100` - ₹100 off).
- Minimum order value validation enforced automatically.

### 4. Checkout & Order Tracking
- Multi-step customer checkout: Contact info, shipping address, policy acceptance, and payment method.
- Customers can track live fulfillment status (`PENDING` ➔ `CONFIRMED` ➔ `DISPATCHED` ➔ `DELIVERED`) with AWB courier tracking numbers.
