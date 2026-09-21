import React from 'react';
import { Printer, X, ShieldCheck, CreditCard, Building2, Share2, CheckCircle2 } from 'lucide-react';
import { B2COrder, B2BOrder, OrderItemSummary, B2BOrderItemSummary } from '../../types';
import { COMPANY_BANK_DETAILS } from '../../config/bankConfig';
import { storageService } from '../../services/storageService';
import { getWhatsAppUrl } from '../../config/whatsappConfig';

interface OrderInvoiceModalProps {
  order: B2COrder | B2BOrder;
  isB2B?: boolean;
  onClose: () => void;
}

// Convert numbers into formal Indian Rupee Words
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

  const siteMedia = storageService.getSiteMedia();
  const companyLogo = siteMedia?.logo || '/logo.png';

  const customerName = b2bOrder ? b2bOrder.businessName : b2cOrder?.customerName || 'Valued Customer';
  const customerEmail = b2bOrder ? `${b2bOrder.businessName} Procurement` : b2cOrder?.customerEmail || '';
  const customerPhone = b2bOrder
    ? b2bOrder.billingAddress?.phone || (b2bOrder as any).mobile || ''
    : b2cOrder?.customerPhone || b2cOrder?.shippingAddress?.phone || '';
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

  const dueDate = new Date(new Date(order.createdAt).getTime() + 15 * 86400000).toLocaleDateString('en-IN', {
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
      return b2cOrder.paymentMethod === 'razorpay' ? 'Online Payment (Razorpay)' : b2cOrder.paymentMethod.toUpperCase();
    }
    if (b2bOrder) {
      if (b2bOrder.paymentMode === 'razorpay') return 'Online Payment (Razorpay)';
      if (b2bOrder.paymentMode === 'bank_transfer') return 'Bank Transfer (NEFT/RTGS/IMPS)';
      if (b2bOrder.paymentMode === 'neft') return 'NEFT Bank Transfer';
      if (b2bOrder.paymentMode === 'rtgs') return 'RTGS Bank Transfer';
      if (b2bOrder.paymentMode === 'imps') return 'IMPS Quick Transfer';
      if (b2bOrder.paymentMode === 'cheque') return 'Cheque / Demand Draft';
      if (b2bOrder.paymentMode) return b2bOrder.paymentMode.replace('_', ' ').toUpperCase();
      return b2bOrder.paymentTerms || 'Commercial Credit Terms';
    }
    return 'Online Payment (Razorpay)';
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

  const handleShareWhatsApp = () => {
    const msg = `*Statutory Tax Invoice Ref: INV-${order.orderNumber}*\nCompany: Kogniti Minds Private Limited\nCustomer: ${customerName}\nTotal Value: ₹${grandTotal.toLocaleString('en-IN')}\nStatus: ${paymentStatusLabel}\n\nDownload or review your verified tax invoice online.`;
    window.open(getWhatsAppUrl(msg), '_blank');
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
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
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          maxHeight: '94vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
        id="printable-official-invoice"
      >
        {/* Top Control Bar (Hidden on Print) */}
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
              {isB2B ? 'B2B Commercial Tax Invoice' : 'B2C Retail GST Tax Invoice'}
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
              ✓ Section 31 CGST Act Statutory Document
            </span>
            <span
              className={`badge ${
                paymentStatus === 'paid' ? 'badge-green' : isPartiallyPaid ? 'badge-amber' : 'badge-red'
              }`}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', fontWeight: 700 }}
            >
              {paymentStatusLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleShareWhatsApp}
              className="btn btn-sm"
              style={{
                background: '#25D366',
                color: '#FFFFFF',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 600,
              }}
            >
              <Share2 size={14} /> WhatsApp
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-sm"
              style={{
                background: '#0F172A',
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
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B',
              }}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* --- FORMAL CORPORATE TAX INVOICE SHEET --- */}
        <div
          style={{
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            backgroundColor: '#FFFFFF',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: '0.82rem',
            lineHeight: 1.5,
          }}
        >
          {/* 1. Header Banner */}
          <div
            style={{
              padding: '1.5rem 1.75rem',
              borderBottom: '2px solid #0F172A',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            {/* Left: Official Company Header */}
            <div className="flex items-start gap-3">
              <img
                key={companyLogo}
                src={companyLogo}
                alt="Kogniti Minds Logo"
                style={{ height: '48px', width: 'auto', objectFit: 'contain', marginTop: '2px' }}
              />
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.01em' }}>
                  KOGNITI MINDS PRIVATE LIMITED
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569' }}>
                  A-Block, Sector 63, Commercial Hub, Noida, Gautam Buddha Nagar, Uttar Pradesh - 201301
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  CIN: U74999UP2022PTC168923 • GSTIN: 09AAECK1234F1Z5 • PAN: AAECK1234F • State Code: 09 (UP)
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Email: support@kognitiminds.com • Phone: +91 99991 44474 • Web: www.kognitiminds.com
                </div>
              </div>
            </div>

            {/* Right: Document Title */}
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  color: '#0F172A',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                TAX INVOICE
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: 700 }}>
                Original for Recipient
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                Issued u/s 31 of CGST Act, 2017
              </div>
            </div>
          </div>

          {/* 2. Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.85rem',
              padding: '1rem 1.75rem',
              backgroundColor: '#F8FAFC',
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
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Due Date</span>
              <strong style={{ color: '#0F172A' }}>{dueDate}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Order Ref ID</span>
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
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748B' }}>Reverse Charge: No</span>
            </div>
          </div>

          {/* 3. Billed To & Shipped To Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '1.5rem',
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            {/* Billed To */}
            <div>
              <div style={{ fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Building2 size={14} className="text-sky-600" /> Billed To (Buyer):
              </div>
              <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>{customerName}</strong>
              {billingAddress?.street && <div style={{ color: '#475569' }}>{billingAddress.street}</div>}
              {billingAddress?.city && (
                <div style={{ color: '#475569' }}>
                  {billingAddress.city}, {billingAddress.state || 'Uttar Pradesh'} - {billingAddress.pincode}
                </div>
              )}
              {customerPhone && <div style={{ color: '#475569' }}>Phone: {customerPhone}</div>}
              {customerEmail && <div style={{ color: '#475569' }}>Email: {customerEmail}</div>}
              {gstin && (
                <div style={{ marginTop: '0.3rem', color: '#0F172A', fontWeight: 600 }}>
                  GSTIN / UIN: <code style={{ color: '#0284C7' }}>{gstin}</code>
                </div>
              )}
            </div>

            {/* Shipped To */}
            <div>
              <div style={{ fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Shipped To (Consignee):
              </div>
              <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>
                {shippingAddress?.fullName || customerName}
              </strong>
              {shippingAddress?.street && <div style={{ color: '#475569' }}>{shippingAddress.street}</div>}
              {shippingAddress?.city && (
                <div style={{ color: '#475569' }}>
                  {shippingAddress.city}, {shippingAddress.state || 'Uttar Pradesh'} - {shippingAddress.pincode}
                </div>
              )}
              {shippingAddress?.phone && <div style={{ color: '#475569' }}>Delivery Contact: {shippingAddress.phone}</div>}
              <div style={{ marginTop: '0.3rem', color: '#64748B', fontSize: '0.74rem' }}>
                Carrier / Dispatch Mode: Surface Express Cargo
              </div>
            </div>
          </div>

          {/* 4. Itemized Product Table */}
          <div style={{ padding: '1rem 1.75rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #CBD5E1', color: '#0F172A' }}>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'left', width: '40px' }}>#</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left' }}>Product Description & Specification</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'center', width: '80px' }}>HSN</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right', width: '70px' }}>Qty</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'center', width: '60px' }}>Unit</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right', width: '100px' }}>Rate (₹)</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right', width: '100px' }}>Taxable (₹)</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'center', width: '65px' }}>GST</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right', width: '110px' }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => {
                  const b2bItem = isB2B ? (item as B2BOrderItemSummary) : null;
                  const itemUnitPrice = 'unitPrice' in item ? item.unitPrice : ('effectiveUnitPrice' in item ? (item as any).effectiveUnitPrice : 0);
                  const unitRate = b2bItem
                    ? b2bItem.effectiveUnitPrice || b2bItem.wholesalePrice
                    : Math.round((itemUnitPrice / 1.18) * 100) / 100;
                  const itemTaxable = b2bItem ? b2bItem.total : unitRate * item.quantity;
                  const itemGst = Math.round(itemTaxable * 0.18 * 100) / 100;
                  const itemGross = b2bItem ? itemTaxable + itemGst : itemUnitPrice * item.quantity;

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#64748B' }}>{idx + 1}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <strong style={{ color: '#0F172A', display: 'block' }}>{item.productName}</strong>
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          SKU: {item.sku || 'KM-PAP-STD'} • Sustainable Agro-Pulp Eco-Grade
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontFamily: 'monospace', color: '#475569' }}>
                        {item.hsn || '48025610'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: '#64748B' }}>
                        {(b2bItem as any)?.unit || 'Units'}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace' }}>
                        ₹{unitRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                        ₹{itemTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: '#64748B' }}>
                        18%
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>
                        ₹{itemGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 5. Financial Summary & Settlement */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
              gap: '1.5rem',
              padding: '1.25rem 1.75rem',
              borderTop: '2px solid #E2E8F0',
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#FAFAFA',
            }}
          >
            {/* Left: Amount in Words, Payment & Bank Info */}
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Total Invoice Amount in Words:</span>
                <strong style={{ color: '#0F172A', fontSize: '0.82rem' }}>
                  {numberToIndianWords(grandTotal)}
                </strong>
              </div>

              {/* Settlement Summary Box */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  fontSize: '0.74rem',
                  marginBottom: '0.75rem',
                }}
              >
                <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CreditCard size={13} className="text-sky-600" /> Settlement Information:
                </div>
                <div className="flex justify-between" style={{ marginBottom: '0.2rem' }}>
                  <span style={{ color: '#64748B' }}>Payment Mode:</span>
                  <strong>{paymentModeDisplay}</strong>
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
                {transactionId && (
                  <div style={{ marginTop: '0.25rem', color: '#64748B' }}>
                    Reference / UTR: <code style={{ color: '#0F172A', fontWeight: 700 }}>{transactionId}</code>
                  </div>
                )}
                {isPartiallyPaid && (
                  <div style={{ marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px dashed #CBD5E1' }}>
                    <div className="flex justify-between" style={{ color: '#059669', fontWeight: 700 }}>
                      <span>Amount Realized:</span>
                      <span>₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between" style={{ color: '#DC2626', fontWeight: 700 }}>
                      <span>Outstanding Balance Due:</span>
                      <span>₹{amountDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Official Remittance Bank Account */}
              <div style={{ fontSize: '0.72rem', color: '#64748B', background: '#F1F5F9', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
                <strong style={{ color: '#0F172A' }}>Official Remittance Bank Account:</strong>
                <div>Beneficiary: {COMPANY_BANK_DETAILS.accountHolder}</div>
                <div>Bank: {COMPANY_BANK_DETAILS.bankName} • Account No: <code>{COMPANY_BANK_DETAILS.accountNumber}</code></div>
                <div>IFSC: <code>{COMPANY_BANK_DETAILS.ifsc}</code> • Account Type: {COMPANY_BANK_DETAILS.accountType}</div>
              </div>
            </div>

            {/* Right: Detailed Tax Breakdown */}
            <div style={{ fontSize: '0.85rem' }}>
              <div className="flex justify-between" style={{ padding: '0.3rem 0', color: '#475569' }}>
                <span>Total Taxable Amount:</span>
                <span style={{ fontWeight: 600, color: '#0F172A', fontFamily: 'monospace' }}>
                  ₹{taxableSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {discountVal > 0 && (
                <div className="flex justify-between" style={{ padding: '0.3rem 0', color: '#059669', fontWeight: 600 }}>
                  <span>Discount Claimed:</span>
                  <span style={{ fontFamily: 'monospace' }}>-₹{discountVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              {!isInterState ? (
                <>
                  <div className="flex justify-between" style={{ padding: '0.3rem 0', color: '#475569' }}>
                    <span>CGST (9%):</span>
                    <span style={{ fontFamily: 'monospace' }}>₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between" style={{ padding: '0.3rem 0', color: '#475569' }}>
                    <span>SGST (9%):</span>
                    <span style={{ fontFamily: 'monospace' }}>₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between" style={{ padding: '0.3rem 0', color: '#475569' }}>
                  <span>IGST (18%):</span>
                  <span style={{ fontFamily: 'monospace' }}>₹{igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between" style={{ padding: '0.3rem 0', color: '#475569' }}>
                <span>Shipping / Freight:</span>
                <span style={{ fontFamily: 'monospace' }}>
                  {shippingFee === 0 ? <strong style={{ color: '#059669' }}>FREE</strong> : `₹${shippingFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                </span>
              </div>

              <div
                className="flex justify-between"
                style={{
                  padding: '0.75rem 0 0.25rem 0',
                  borderTop: '2px solid #0F172A',
                  marginTop: '0.5rem',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  color: '#0F172A',
                }}
              >
                <span>Total Invoice Value (INR):</span>
                <span style={{ color: '#0284C7', fontFamily: 'monospace' }}>
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* 6. Terms & Execution Block */}
          <div
            style={{
              padding: '1.25rem 1.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '1.5rem',
              fontSize: '0.74rem',
              color: '#475569',
            }}
          >
            <div style={{ maxWidth: '520px', lineHeight: 1.6 }}>
              <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Statutory Declarations & Commercial Terms:
              </strong>
              <div>• Certified that particulars given above are true, complete and correct.</div>
              <div>• Section 31 statutory invoice eligible for 100% Input Tax Credit (ITC) under Section 16 of CGST Act, 2017.</div>
              <div>• Delayed payments beyond agreed terms attract 18% p.a. commercial interest pursuant to MSMED Act, 2006.</div>
              <div>• Goods once dispatched are governed by the company's statutory return and inspection policy.</div>
              <div>• Subject to Noida, Gautam Buddha Nagar (UP) jurisdiction.</div>
            </div>

            <div style={{ textAlign: 'center', minWidth: '220px' }}>
              <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '2.5rem' }}>
                For KOGNITI MINDS PRIVATE LIMITED
              </div>
              <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '0.35rem', fontSize: '0.74rem', color: '#0F172A', fontWeight: 700 }}>
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
