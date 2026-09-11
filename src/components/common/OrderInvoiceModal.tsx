import React from 'react';
import { Printer, X, ShieldCheck, CreditCard, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { B2COrder, B2BOrder, OrderItemSummary, B2BOrderItemSummary } from '../../types';

interface OrderInvoiceModalProps {
  order: B2COrder | B2BOrder;
  isB2B?: boolean;
  onClose: () => void;
}

// Convert numbers into Indian Rupee Words (Crores, Lakhs, Thousands, Hundreds)
function numberToIndianWords(num: number): string {
  const a = [
    '',
    'One ',
    'Two ',
    'Three ',
    'Four ',
    'Five ',
    'Six ',
    'Seven ',
    'Eight ',
    'Nine ',
    'Ten ',
    'Eleven ',
    'Twelve ',
    'Thirteen ',
    'Fourteen ',
    'Fifteen ',
    'Sixteen ',
    'Seventeen ',
    'Eighteen ',
    'Nineteen ',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    let str = '';
    if (n > 9999999) {
      str += inWords(Math.floor(n / 10000000)) + 'Crore ';
      n %= 10000000;
    }
    if (n > 99999) {
      str += inWords(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (n > 999) {
      str += inWords(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    if (n > 99) {
      str += inWords(Math.floor(n / 100)) + 'Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (str !== '') str += 'and ';
      if (n < 20) {
        str += a[n];
      } else {
        str += b[Math.floor(n / 10)] + (n % 10 > 0 ? '-' + a[n % 10].trim() + ' ' : ' ');
      }
    }
    return str;
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  let result = 'Rupees ' + inWords(rupees).trim();
  if (paise > 0) {
    result += ' and ' + inWords(paise).trim() + ' Paise';
  }
  return result + ' Only';
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({ order, isB2B = false, onClose }) => {
  const b2bOrder = isB2B ? (order as B2BOrder) : null;
  const b2cOrder = !isB2B ? (order as B2COrder) : null;

  const handlePrint = () => {
    window.print();
  };

  const customerName = b2bOrder ? b2bOrder.businessName : b2cOrder?.customerName || 'Customer';
  const customerEmail = b2bOrder ? `${b2bOrder.businessName} Procurement` : b2cOrder?.customerEmail || '';
  const customerPhone = b2bOrder ? b2bOrder.billingAddress?.phone || '' : b2cOrder?.customerPhone || b2cOrder?.shippingAddress?.phone || '';
  const gstin = b2bOrder ? b2bOrder.gstin : b2cOrder?.optionalGstin || null;

  const billingAddress = order.billingAddress || order.shippingAddress;
  const shippingAddress = order.shippingAddress || order.billingAddress;

  const isInterState = billingAddress?.state
    ? !billingAddress.state.toLowerCase().includes('uttar') && billingAddress.state.toLowerCase() !== 'up'
    : false;

  const invoiceDate = order.confirmedAt
    ? new Date(order.confirmedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  // Financial values
  const taxableSubtotal = b2bOrder ? b2bOrder.taxableAmount : Math.round((b2cOrder!.total / 1.18) * 100) / 100;
  const discountVal = b2bOrder ? (b2bOrder.bulkDiscountTotal || 0) : (b2cOrder?.discount || 0);
  const totalGst = b2bOrder ? b2bOrder.totalGst : b2cOrder?.gstAmount || Math.round((b2cOrder!.total - taxableSubtotal) * 100) / 100;
  const cgst = isInterState ? 0 : Math.round((totalGst / 2) * 100) / 100;
  const sgst = isInterState ? 0 : Math.round((totalGst / 2) * 100) / 100;
  const igst = isInterState ? totalGst : 0;
  const shippingFee = b2bOrder ? (b2bOrder.shippingFee || 0) : (b2cOrder?.shippingFee || 0);
  const grandTotal = b2bOrder ? b2bOrder.grandTotal : b2cOrder?.total || 0;

  // Payment information
  const paymentModeDisplay = (() => {
    if (b2cOrder) {
      return b2cOrder.paymentMethod === 'razorpay' ? 'Online Payment – Razorpay' : b2cOrder.paymentMethod.toUpperCase();
    }
    if (b2bOrder) {
      if (b2bOrder.paymentMode === 'razorpay') return 'Online Payment – Razorpay';
      if (b2bOrder.paymentMode === 'bank_transfer') return 'Bank Transfer / NEFT / RTGS / IMPS';
      if (b2bOrder.paymentMode === 'neft') return 'NEFT Bank Transfer';
      if (b2bOrder.paymentMode === 'rtgs') return 'RTGS Bank Transfer';
      if (b2bOrder.paymentMode === 'imps') return 'IMPS Quick Transfer';
      if (b2bOrder.paymentMode === 'cheque') return 'Cheque / Demand Draft';
      if (b2bOrder.paymentMode) return b2bOrder.paymentMode.replace('_', ' ').toUpperCase();
      return b2bOrder.paymentTerms || 'Commercial Invoice';
    }
    return 'Online Payment – Razorpay';
  })();

  const paymentStatus = order.paymentStatus || 'paid';
  const paymentStatusLabel = (() => {
    if (paymentStatus === 'paid') return 'PAID IN FULL';
    if (paymentStatus === 'partially_paid') return 'PARTIALLY PAID';
    if (paymentStatus === 'payment_due') return 'PAYMENT DUE';
    if (paymentStatus === 'failed') return 'PAYMENT FAILED';
    if (paymentStatus === 'refunded') return 'REFUNDED';
    return paymentStatus.toUpperCase();
  })();

  const amountPaid = b2bOrder?.amountPaid !== undefined ? b2bOrder.amountPaid : (paymentStatus === 'paid' ? grandTotal : 0);
  const amountDue = b2bOrder?.amountDue !== undefined ? b2bOrder.amountDue : Math.max(0, grandTotal - amountPaid);
  const isPartiallyPaid = b2bOrder && (paymentStatus === 'partially_paid' || (amountPaid > 0 && amountDue > 0));

  const transactionId = (order as any).paymentDetails?.transactionId || (b2bOrder?.paymentRecords && b2bOrder.paymentRecords[0]?.transactionReference);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(6px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        overflowY: 'auto',
      }}
    >
      <div
        className="modal-content"
        style={{
          maxWidth: '920px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
        id="printable-official-invoice"
      >
        {/* Top Control Bar (Hidden when printed) */}
        <div
          className="hide-on-print flex justify-between items-center flex-wrap gap-2"
          style={{
            marginBottom: '1.5rem',
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '1rem',
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="badge"
              style={{
                backgroundColor: isB2B ? '#EDE9FE' : '#E0F2FE',
                color: isB2B ? '#6D28D9' : '#0369A1',
                fontWeight: 800,
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
              }}
            >
              {isB2B ? 'B2B Commercial Tax Invoice' : 'B2C Retail GST Invoice'}
            </span>
            <span
              className="badge"
              style={{
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
              }}
            >
              ✓ Official Section 31 Tax Invoice
            </span>
            <span
              className={`badge ${
                paymentStatus === 'paid' ? 'badge-green' : isPartiallyPaid ? 'badge-amber' : 'badge-red'
              }`}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              {paymentStatusLabel}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                color: '#FFFFFF',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 600,
              }}
            >
              <Printer size={15} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* --- FORMAL OFFICIAL TAX INVOICE DOCUMENT --- */}
        <div
          style={{
            border: '2px solid #CBD5E1',
            borderRadius: '8px',
            overflow: 'hidden',
            fontFamily: 'var(--font-heading), -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {/* 1. Header Banner */}
          <div
            style={{
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '1.25rem 1.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid #0284C7',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  height: '46px',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="/logo.png"
                  alt="Kogniti Minds Logo"
                  style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.02em', color: '#FFFFFF' }}>
                  KOGNITI MINDS PRIVATE LIMITED
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                  CIN: U74999UP2022PTC168923 • GSTIN: 09AAECK1234F1Z5 • PAN: AAECK1234F
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  color: '#38BDF8',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                TAX INVOICE
              </div>
              <div style={{ fontSize: '0.75rem', color: '#E2E8F0' }}>
                (Original for Recipient)
              </div>
            </div>
          </div>

          {/* 2. Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              padding: '1rem 1.5rem',
              background: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              fontSize: '0.8rem',
            }}
          >
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Invoice Number</span>
              <strong style={{ fontSize: '0.95rem', color: '#0F172A', fontFamily: 'monospace' }}>
                INV-{order.orderNumber}
              </strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Invoice Date</span>
              <strong style={{ color: '#0F172A' }}>{invoiceDate}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Order Reference ID</span>
              <strong style={{ color: '#0F172A' }}>{order.orderNumber}</strong>
              {b2bOrder?.poNumber && (
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#0284C7' }}>
                  PO: {b2bOrder.poNumber}
                </span>
              )}
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Place of Supply</span>
              <strong style={{ color: '#0F172A' }}>
                {billingAddress?.state || 'Uttar Pradesh'} ({isInterState ? 'Inter-State IGST' : 'Intra-State CGST+SGST'})
              </strong>
            </div>
          </div>

          {/* 3. Supplier & Buyer Addresses */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #E2E8F0',
              fontSize: '0.82rem',
              lineHeight: 1.5,
            }}
          >
            {/* Supplier Details */}
            <div style={{ borderRight: '1px solid #E2E8F0', paddingRight: '1.5rem' }}>
              <div style={{ fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Building2 size={14} className="text-sky-600" /> Billed By (Supplier):
              </div>
              <strong style={{ color: '#0F172A' }}>Kogniti Minds Private Limited</strong>
              <div style={{ color: '#475569' }}>A-Block, Sector 63, Commercial Hub</div>
              <div style={{ color: '#475569' }}>Noida, Gautam Buddha Nagar, Uttar Pradesh - 201301</div>
              <div style={{ color: '#475569' }}>State Code: 09 (Uttar Pradesh)</div>
              <div style={{ marginTop: '0.35rem', color: '#334155' }}>
                <strong>GSTIN:</strong> 09AAECK1234F1Z5 • <strong>Email:</strong> support@kognitiminds.com
              </div>
            </div>

            {/* Buyer Details */}
            <div>
              <div style={{ fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={14} className="text-emerald-600" /> Billed To (Recipient / Buyer):
              </div>
              <strong style={{ color: '#0F172A', fontSize: '0.9rem' }}>{customerName}</strong>
              <div style={{ color: '#475569' }}>{billingAddress?.street}</div>
              <div style={{ color: '#475569' }}>
                {billingAddress?.city}, {billingAddress?.state} - {billingAddress?.pincode}
              </div>
              {customerPhone && <div style={{ color: '#475569' }}>Phone: {customerPhone}</div>}
              {customerEmail && <div style={{ color: '#475569' }}>Email: {customerEmail}</div>}
              {gstin && (
                <div style={{ marginTop: '0.35rem', color: '#15803D', fontWeight: 700 }}>
                  Buyer GSTIN: <code style={{ background: '#DCFCE7', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{gstin}</code>
                </div>
              )}
            </div>
          </div>

          {/* 4. Itemized Product Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: '#F1F5F9', borderBottom: '2px solid #CBD5E1', textAlign: 'left' }}>
                <th style={{ padding: '0.65rem 0.85rem' }}>#</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Description of Goods</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>HSN</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>GST Rate</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Unit Rate (₹)</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Taxable Val (₹)</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => {
                const isB2BItem = isB2B;
                const productName = item.productName;
                const unitPrice = isB2BItem
                  ? (item as B2BOrderItemSummary).effectiveUnitPrice || (item as B2BOrderItemSummary).wholesalePrice
                  : (item as OrderItemSummary).unitPrice;
                const hsn = item.hsn || '4802';
                const gstRate = item.gstRate || 18;
                const lineTotal = item.total;
                const lineTaxable = isB2BItem ? lineTotal : Math.round((lineTotal / 1.18) * 100) / 100;

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#64748B' }}>{idx + 1}</td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <strong style={{ color: '#0F172A', display: 'block' }}>{productName}</strong>
                      {item.sku && <span style={{ fontSize: '0.7rem', color: '#64748B' }}>SKU: {item.sku}</span>}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>{hsn}</td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>
                        {gstRate}%
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: 700 }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                      ₹{unitPrice.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 600 }}>
                      ₹{lineTaxable.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                      ₹{lineTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* 5. Financial Summary & Tax Breakdown */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              borderTop: '2px solid #CBD5E1',
              background: '#FFFFFF',
            }}
          >
            {/* Left: Words, Declarations & Bank Account Details */}
            <div style={{ padding: '1.25rem', borderRight: '1px solid #E2E8F0', fontSize: '0.8rem', lineHeight: 1.5 }}>
              <div style={{ marginBottom: '0.85rem' }}>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Total Amount In Words:</span>
                <strong style={{ color: '#0F172A', fontSize: '0.85rem' }}>
                  {numberToIndianWords(grandTotal)}
                </strong>
              </div>

              {/* Payment Mode & Status Summary Box */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CreditCard size={14} className="text-sky-600" /> Payment & Settlement Information:
                </div>
                <div className="flex justify-between" style={{ marginBottom: '0.2rem' }}>
                  <span style={{ color: '#64748B' }}>Payment Mode:</span>
                  <strong style={{ color: '#0F172A' }}>{paymentModeDisplay}</strong>
                </div>
                <div className="flex justify-between" style={{ marginBottom: '0.2rem' }}>
                  <span style={{ color: '#64748B' }}>Payment Status:</span>
                  <span
                    className={`badge ${
                      paymentStatus === 'paid' ? 'badge-green' : isPartiallyPaid ? 'badge-amber' : 'badge-red'
                    }`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    {paymentStatusLabel}
                  </span>
                </div>

                {isPartiallyPaid && (
                  <div style={{ marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px dashed #CBD5E1' }}>
                    <div className="flex justify-between" style={{ color: '#059669', fontWeight: 700 }}>
                      <span>Amount Received / Paid:</span>
                      <span>₹{amountPaid.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between" style={{ color: '#DC2626', fontWeight: 700 }}>
                      <span>Remaining Balance Due:</span>
                      <span>₹{amountDue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                {transactionId && (
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.25rem' }}>
                    Transaction / Gateway Ref: <code style={{ color: '#0F172A' }}>{transactionId}</code>
                  </div>
                )}
              </div>

              {/* Company Bank Account details for B2B Direct Settlements */}
              <div style={{ fontSize: '0.75rem', color: '#64748B', background: '#F1F5F9', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
                <strong style={{ color: '#0F172A' }}>Official Remittance Bank Account:</strong>
                <div>Bank: HDFC Bank Ltd • Branch: Sector 63 Noida</div>
                <div>Account Name: Kogniti Minds Private Limited • A/C No: 50200084729184</div>
                <div>IFSC: HDFC0000128 • Account Type: Current Account</div>
              </div>
            </div>

            {/* Right: Calculations Table */}
            <div style={{ padding: '1.25rem', fontSize: '0.85rem' }}>
              <div className="flex justify-between" style={{ padding: '0.35rem 0', color: '#475569' }}>
                <span>Taxable Value:</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>
                  ₹{taxableSubtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {discountVal > 0 && (
                <div className="flex justify-between" style={{ padding: '0.35rem 0', color: '#059669', fontWeight: 600 }}>
                  <span>Discount Applied:</span>
                  <span>-₹{discountVal.toLocaleString('en-IN')}</span>
                </div>
              )}

              {!isInterState ? (
                <>
                  <div className="flex justify-between" style={{ padding: '0.35rem 0', color: '#475569' }}>
                    <span>CGST (9%):</span>
                    <span>₹{cgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between" style={{ padding: '0.35rem 0', color: '#475569' }}>
                    <span>SGST (9%):</span>
                    <span>₹{sgst.toLocaleString('en-IN')}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between" style={{ padding: '0.35rem 0', color: '#475569' }}>
                  <span>IGST (18%):</span>
                  <span>₹{igst.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between" style={{ padding: '0.35rem 0', color: '#475569' }}>
                <span>Total GST (18%):</span>
                <strong style={{ color: '#0F172A' }}>₹{totalGst.toLocaleString('en-IN')}</strong>
              </div>

              <div className="flex justify-between" style={{ padding: '0.35rem 0', color: '#475569' }}>
                <span>Shipping / Logistics Charges:</span>
                <span>{shippingFee === 0 ? <strong style={{ color: '#059669' }}>FREE</strong> : `₹${shippingFee.toLocaleString('en-IN')}`}</span>
              </div>

              <div
                className="flex justify-between"
                style={{
                  padding: '0.75rem 0',
                  borderTop: '2px solid #0F172A',
                  marginTop: '0.5rem',
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  color: '#0F172A',
                }}
              >
                <span>Grand Total:</span>
                <span style={{ color: '#0284C7' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* 6. Footer Legal & Signatory */}
          <div
            style={{
              padding: '1rem 1.5rem',
              background: '#F8FAFC',
              borderTop: '1px solid #CBD5E1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              fontSize: '0.72rem',
              color: '#64748B',
            }}
          >
            <div style={{ maxWidth: '500px', lineHeight: 1.5 }}>
              <div>* Computer generated statutory invoice under Section 31 of Central Goods and Services Tax Act, 2017.</div>
              <div>* Certified for 100% statutory Input Tax Credit (ITC) claimable by registered recipients under Indian GST laws.</div>
              <div>* Subject to Noida, Uttar Pradesh jurisdiction.</div>
            </div>

            <div style={{ textAlign: 'center', minWidth: '200px' }}>
              <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '1.75rem' }}>
                For Kogniti Minds Private Limited
              </div>
              <div style={{ borderTop: '1px dashed #94A3B8', paddingTop: '0.25rem', fontSize: '0.7rem', color: '#475569' }}>
                Authorized Signatory & Corporate Stamp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
