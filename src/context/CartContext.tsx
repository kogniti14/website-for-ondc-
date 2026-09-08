import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon } from '../types';
import { storageService } from '../services/storageService';

interface CartCalculations {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  shippingFee: number;
  total: number;
}

interface CartContextType {
  b2cCart: CartItem[];
  b2bCart: CartItem[];
  appliedCoupon: Coupon | null;
  addToB2CCart: (productId: string, quantity?: number) => void;
  updateB2CQty: (productId: string, quantity: number) => void;
  removeFromB2CCart: (productId: string) => void;
  clearB2CCart: () => void;
  addToB2BCart: (productId: string, quantity?: number) => { success: boolean; message?: string };
  updateB2BQty: (productId: string, quantity: number) => { success: boolean; message?: string };
  removeFromB2BCart: (productId: string) => void;
  clearB2BCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  getB2CCalculations: () => CartCalculations;
  getB2BCalculations: () => CartCalculations;
  b2cCount: number;
  b2bCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [b2cCart, setB2cCart] = useState<CartItem[]>(() => storageService.getB2CCart());
  const [b2bCart, setB2bCart] = useState<CartItem[]>(() => storageService.getB2BCart());
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    storageService.setB2CCart(b2cCart);
  }, [b2cCart]);

  useEffect(() => {
    storageService.setB2BCart(b2bCart);
  }, [b2bCart]);

  // --- B2C Operations ---
  const addToB2CCart = (productId: string, quantity: number = 1) => {
    setB2cCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { productId, quantity, isB2B: false }];
    });
  };

  const updateB2CQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromB2CCart(productId);
      return;
    }
    setB2cCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromB2CCart = (productId: string) => {
    setB2cCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearB2CCart = () => {
    setB2cCart([]);
    setAppliedCoupon(null);
  };

  // --- B2B Operations ---
  const addToB2BCart = (
    productId: string,
    quantity?: number
  ): { success: boolean; message?: string } => {
    const product = storageService.getProductById(productId);
    if (!product) return { success: false, message: 'Product not found' };

    const minQty = product.b2bMoq || 1;
    const requestedQty = quantity !== undefined ? quantity : minQty;

    if (requestedQty < minQty) {
      return {
        success: false,
        message: `Minimum Order Quantity (MOQ) for ${product.name} is ${minQty} units.`,
      };
    }

    setB2bCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + requestedQty }
            : item
        );
      }
      return [...prev, { productId, quantity: requestedQty, isB2B: true }];
    });

    return { success: true };
  };

  const updateB2BQty = (
    productId: string,
    quantity: number
  ): { success: boolean; message?: string } => {
    const product = storageService.getProductById(productId);
    if (!product) return { success: false, message: 'Product not found' };

    if (quantity < product.b2bMoq) {
      return {
        success: false,
        message: `Minimum Order Quantity (MOQ) for this product is ${product.b2bMoq} units.`,
      };
    }

    setB2bCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
    return { success: true };
  };

  const removeFromB2BCart = (productId: string) => {
    setB2bCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearB2BCart = () => {
    setB2bCart([]);
  };

  // --- Coupon Logic ---
  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const coupons = storageService.getCoupons();
    const found = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) {
      return { success: false, message: 'Invalid coupon code. Try WELCOME10 or KOGNITI15.' };
    }

    const b2cTotals = getB2CCalculations();
    if (b2cTotals.subtotal < found.minOrderValue) {
      return {
        success: false,
        message: `Coupon '${found.code}' requires a minimum cart value of ₹${found.minOrderValue.toLocaleString('en-IN')}.`,
      };
    }

    setAppliedCoupon(found);
    return { success: true, message: `Coupon '${found.code}' applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // --- Calculations ---
  const getB2CCalculations = (): CartCalculations => {
    let subtotal = 0;
    b2cCart.forEach((item) => {
      const p = storageService.getProductById(item.productId);
      if (p) {
        subtotal += p.b2cPrice * item.quantity;
      }
    });

    let discount = 0;
    if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
      if (appliedCoupon.discountType === 'percent') {
        discount = Math.round((subtotal * appliedCoupon.value) / 100);
      } else {
        discount = appliedCoupon.value;
      }
    }

    const netAmount = Math.max(0, subtotal - discount);
    // B2C selling prices in India are typically GST-inclusive.
    // Breakdown for tax invoice display: Taxable = Net / 1.18, GST = Net - Taxable
    const taxableAmount = Math.round((netAmount / 1.18) * 100) / 100;
    const totalGst = Math.round((netAmount - taxableAmount) * 100) / 100;
    const cgst = Math.round((totalGst / 2) * 100) / 100;
    const sgst = Math.round((totalGst / 2) * 100) / 100;
    const shippingFee = netAmount > 999 || netAmount === 0 ? 0 : 99;
    const total = netAmount + shippingFee;

    return {
      subtotal,
      discount,
      taxableAmount,
      cgst,
      sgst,
      igst: 0,
      totalGst,
      shippingFee,
      total,
    };
  };

  const getB2BCalculations = (): CartCalculations => {
    let subtotal = 0;
    let bulkDiscountTotal = 0;

    b2bCart.forEach((item) => {
      const p = storageService.getProductById(item.productId);
      if (p) {
        const baseItemTotal = p.b2bWholesalePrice * item.quantity;
        // Determine tier discount slab
        let tierDiscountPercent = 0;
        if (p.b2bDiscountSlabs && p.b2bDiscountSlabs.length > 0) {
          const eligibleSlabs = p.b2bDiscountSlabs.filter((s) => item.quantity >= s.minQty);
          if (eligibleSlabs.length > 0) {
            // Pick highest applicable slab
            const highestSlab = eligibleSlabs.reduce((max, cur) =>
              cur.discountPercent > max.discountPercent ? cur : max
            );
            tierDiscountPercent = highestSlab.discountPercent;
          }
        }
        const itemDiscount = Math.round((baseItemTotal * tierDiscountPercent) / 100);
        bulkDiscountTotal += itemDiscount;
        subtotal += baseItemTotal;
      }
    });

    const taxableAmount = Math.max(0, subtotal - bulkDiscountTotal);
    // B2B prices are exclusive of 18% GST (Input Tax Credit eligible)
    const totalGst = Math.round(taxableAmount * 0.18 * 100) / 100;
    const cgst = Math.round((totalGst / 2) * 100) / 100;
    const sgst = Math.round((totalGst / 2) * 100) / 100;
    const shippingFee = 0; // Free commercial freight for B2B institutional orders
    const total = taxableAmount + totalGst + shippingFee;

    return {
      subtotal,
      discount: bulkDiscountTotal,
      taxableAmount,
      cgst,
      sgst,
      igst: 0,
      totalGst,
      shippingFee,
      total,
    };
  };

  const b2cCount = b2cCart.reduce((sum, i) => sum + i.quantity, 0);
  const b2bCount = b2bCart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        b2cCart,
        b2bCart,
        appliedCoupon,
        addToB2CCart,
        updateB2CQty,
        removeFromB2CCart,
        clearB2CCart,
        addToB2BCart,
        updateB2BQty,
        removeFromB2BCart,
        clearB2BCart,
        applyCoupon,
        removeCoupon,
        getB2CCalculations,
        getB2BCalculations,
        b2cCount,
        b2bCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
