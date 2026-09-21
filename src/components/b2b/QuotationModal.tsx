import React from 'react';
import { Printer, X, FileText, Check, Building2, ShieldCheck, CreditCard, Share2 } from 'lucide-react';
import { B2BQuotation } from '../../types';
import { COMPANY_BANK_DETAILS } from '../../config/bankConfig';
import { storageService } from '../../services/storageService';
import { getWhatsAppUrl } from '../../config/whatsappConfig';

interface QuotationModalProps {
  quotation: B2BQuotation;
  onClose: () => void;
  onAcceptAndConvert?: (quotation: B2BQuotation) => void;
  isClientView?: boolean;
}

// Convert numeric amounts into formal Indian Rupee Words
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

export const QuotationModal: React.FC<QuotationModalProps> = ({
  quotation,
  onClose,
  onAcceptAndConvert,
  isClientView = false,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const siteMedia = storageService.getSiteMedia();
  const companyLogo = siteMedia?.logo || '/logo.png';

  const q = quotation;
  const adminQuote = q.adminQuotation;

  // Format Dates
  const rawQuotedAt = (q as any).quotedAt || (adminQuote as any)?.quotedAt || q.submittedAt || q.createdAt;
  const quoteDate = rawQuotedAt
    ? new Date(rawQuotedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const validUntilDate = adminQuote?.validUntil
    ? new Date(adminQuote.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Pricing calculations
  interface QuotationDisplayItem {
    productId?: string;
    productName: string;
    sku: string;
    hsn: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discountPercent: number;
    discountAmount: number;
    taxableAmount: number;
    gstRate: number;
    gstAmount: number;
    totalAmount: number;
  }

  const fallbackQty = q.requestedQty || 1;
  const fallbackUnitPrice = adminQuote?.quotedUnitPrice || q.targetUnitPrice || 198;
  const fallbackTaxable = adminQuote?.totalTaxable || (fallbackQty * fallbackUnitPrice);
  const fallbackGst = adminQuote?.gstAmount || (fallbackTaxable * 0.18);
  const fallbackTotal = adminQuote?.grandTotal || (fallbackTaxable + fallbackGst);

  const items: QuotationDisplayItem[] = (adminQuote as any)?.items && (adminQuote as any).items.length > 0
    ? (adminQuote as any).items.map((it: any) => ({
        productId: it.productId,
        productName: it.productName || 'Agro-Pulp Eco-Grade Paper',
        sku: it.sku || 'KM-B2B-BULK',
        hsn: it.hsn || '48025610',
        quantity: it.quantity || 1,
        unit: it.unit || 'Units',
        unitPrice: it.unitPrice || it.effectiveUnitPrice || fallbackUnitPrice,
        discountPercent: it.discountPercent || 0,
        discountAmount: it.discountAmount || 0,
        taxableAmount: it.taxableAmount || it.taxableValue || ((it.quantity || 1) * (it.unitPrice || fallbackUnitPrice)),
        gstRate: it.gstRate || 18,
        gstAmount: it.gstAmount || ((it.taxableAmount || ((it.quantity || 1) * (it.unitPrice || fallbackUnitPrice))) * 0.18),
        totalAmount: it.totalAmount || it.total || ((it.taxableAmount || ((it.quantity || 1) * (it.unitPrice || fallbackUnitPrice))) * 1.18),
      }))
    : [
        {
          productId: q.productId,
          productName: q.productName || 'Sustainable Agro-Pulp Eco Paper Ream',
          sku: q.sku || 'KM-B2B-BULK',
          hsn: '48025610',
          quantity: fallbackQty,
          unit: 'Units',
          unitPrice: fallbackUnitPrice,
          discountPercent: 0,
          discountAmount: 0,
          taxableAmount: fallbackTaxable,
          gstRate: 18,
          gstAmount: fallbackGst,
          totalAmount: fallbackTotal,
        },
      ];

  const totalTaxable = adminQuote?.totalTaxable ?? items.reduce((acc: number, it: QuotationDisplayItem) => acc + (it.taxableAmount || 0), 0);
  const totalGst = adminQuote?.gstAmount ?? items.reduce((acc: number, it: QuotationDisplayItem) => acc + (it.gstAmount || 0), 0);
  const shippingCharges = adminQuote?.shippingCharges ?? (q.shippingCharges || 0);
  const grandTotal = adminQuote?.grandTotal ?? (totalTaxable + totalGst + shippingCharges);

  const isInterState = q.billingAddress?.state
    ? !q.billingAddress.state.toLowerCase().includes('uttar') && q.billingAddress.state.toLowerCase() !== 'up'
    : false;

  const cgst = isInterState ? 0 : Math.round((totalGst / 2) * 100) / 100;
  const sgst = isInterState ? 0 : Math.round((totalGst / 2) * 100) / 100;
  const igst = isInterState ? totalGst : 0;

  const canAccept = (q.status === 'quoted' || q.status === 'revised_quoted') && onAcceptAndConvert;

  const handleShareWhatsApp = () => {
    const msg = `*Commercial Quotation Ref: ${q.rfqNumber}*\nCompany: Kogniti Minds Private Limited\nClient: ${q.businessName}\nItems: ${items.length} Product(s)\nGrand Total: ₹${grandTotal.toLocaleString('en-IN')}\nValid Until: ${validUntilDate}\n\nPlease review and approve quotation online.`;
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
        id="printable-official-quotation"
      >
        {/* Top Action Bar (Hidden on Print) */}
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
                backgroundColor: '#EDE9FE',
                color: '#6D28D9',
                fontWeight: 800,
                fontSize: '0.8rem',
                padding: '0.35rem 0.75rem',
              }}
            >
              Commercial Price Proposal
            </span>
            <span
              className={`badge ${
                q.status === 'ordered' || q.status === 'converted_to_order'
                  ? 'badge-green'
                  : q.status === 'revised_quoted' || q.status === 'quoted'
                  ? 'badge-amber'
                  : 'badge-purple'
              }`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', fontWeight: 700 }}
            >
              Status: {q.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {canAccept && (
              <button
                onClick={() => onAcceptAndConvert(q)}
                className="btn btn-sm"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 700,
                }}
              >
                <Check size={15} /> Accept & Convert to Order
              </button>
            )}

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

        {/* --- FORMAL CORPORATE QUOTATION SHEET --- */}
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
            {/* Company Branding */}
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
                  A-Block, Sector 63, Commercial Hub, Noida, Uttar Pradesh - 201301
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  CIN: U74999UP2022PTC168923 • GSTIN: 09AAECK1234F1Z5 • PAN: AAECK1234F
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Email: corporate@kognitiminds.com • Phone: +91 99991 44474 • Web: www.kognitiminds.com
                </div>
              </div>
            </div>

            {/* Document Title & Key Details */}
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
                COMMERCIAL QUOTATION
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: 700 }}>
                Formal B2B Price Proposal
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                <span style={{ color: '#64748B' }}>Quote Ref: </span>
                <strong style={{ fontFamily: 'monospace', color: '#0F172A', fontSize: '0.9rem' }}>
                  {q.rfqNumber}
                </strong>
              </div>
            </div>
          </div>

          {/* 2. Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              padding: '1rem 1.75rem',
              backgroundColor: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              fontSize: '0.8rem',
            }}
          >
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Quotation Date</span>
              <strong style={{ color: '#0F172A' }}>{quoteDate}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Proposal Valid Until</span>
              <strong style={{ color: '#D97706' }}>{validUntilDate}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Payment Terms</span>
              <strong style={{ color: '#0F172A' }}>{q.paymentTerms || 'Commercial Credit / 30% Advance'}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Place of Dispatch & Supply</span>
              <strong style={{ color: '#0F172A' }}>
                Noida, Uttar Pradesh ({isInterState ? 'Inter-State IGST' : 'Intra-State CGST+SGST'})
              </strong>
            </div>
          </div>

          {/* 3. Client & Billing Particulars */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '1.5rem',
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            {/* Client Particulars */}
            <div>
              <div style={{ fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Building2 size={14} className="text-sky-600" /> Quotation Prepared For:
              </div>
              <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>{q.businessName}</strong>
              {q.contactPerson && <div style={{ color: '#334155' }}>Attn: {q.contactPerson}</div>}
              {q.email && <div style={{ color: '#475569' }}>Email: {q.email}</div>}
              {q.phone && <div style={{ color: '#475569' }}>Phone: {q.phone}</div>}
              {q.gstin && (
                <div style={{ marginTop: '0.25rem', color: '#0F172A', fontWeight: 600 }}>
                  Client GSTIN: <code style={{ color: '#0284C7' }}>{q.gstin}</code>
                </div>
              )}
            </div>

            {/* Delivery / Shipping Destination */}
            <div>
              <div style={{ fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Delivery Destination:
              </div>
              <div style={{ color: '#475569' }}>
                {(q as any).deliveryLocation || q.shippingAddress?.street || 'Customer Registered Warehouse'}
              </div>
              {q.shippingAddress && (
                <div style={{ color: '#475569' }}>
                  {q.shippingAddress.city}, {q.shippingAddress.state} - {q.shippingAddress.pincode}
                </div>
              )}
              <div style={{ marginTop: '0.35rem', color: '#64748B', fontSize: '0.75rem' }}>
                Freight Basis: {shippingCharges === 0 ? 'Doorstep Delivery Included' : `Extra at Actuals (₹${shippingCharges.toLocaleString('en-IN')})`}
              </div>
            </div>
          </div>

          {/* 4. Itemized Quotation Table */}
          <div style={{ padding: '1rem 1.75rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #CBD5E1', color: '#0F172A' }}>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'left', width: '40px' }}>#</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left' }}>Item Description & Specification</th>
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
                {items.map((it: QuotationDisplayItem, idx: number) => {
                  const unitRate = it.unitPrice || 0;
                  const itemTaxable = it.taxableAmount || (it.quantity * unitRate);
                  const itemGst = it.gstAmount || (itemTaxable * 0.18);
                  const itemTotal = it.totalAmount || (itemTaxable + itemGst);

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#64748B' }}>{idx + 1}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <strong style={{ color: '#0F172A', display: 'block' }}>{it.productName}</strong>
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          SKU: {it.sku || 'KM-B2B'} • Premium Agro-Based Sustainable Paper
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontFamily: 'monospace', color: '#475569' }}>
                        {it.hsn || '48025610'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>
                        {it.quantity}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: '#64748B' }}>
                        {it.unit || 'Units'}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace' }}>
                        ₹{unitRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                        ₹{itemTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: '#64748B' }}>
                        {it.gstRate || 18}%
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>
                        ₹{itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 5. Financial Summary Block */}
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
            {/* Left: Words and Bank Details */}
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Total Amount in Words:</span>
                <strong style={{ color: '#0F172A', fontSize: '0.82rem' }}>
                  {numberToIndianWords(grandTotal)}
                </strong>
              </div>

              {/* Bank Details for Remittance */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  fontSize: '0.74rem',
                }}
              >
                <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CreditCard size={13} className="text-sky-600" /> Banking Details for Purchase Order Remittance:
                </div>
                <div>Beneficiary: <strong>{COMPANY_BANK_DETAILS.accountHolder}</strong></div>
                <div>Bank: <strong>{COMPANY_BANK_DETAILS.bankName}</strong> ({COMPANY_BANK_DETAILS.accountType})</div>
                <div>Account Number: <code style={{ fontWeight: 700, color: '#0F172A' }}>{COMPANY_BANK_DETAILS.accountNumber}</code></div>
                <div>IFSC Code: <code style={{ fontWeight: 700, color: '#0F172A' }}>{COMPANY_BANK_DETAILS.ifsc}</code></div>
              </div>
            </div>

            {/* Right: Calculations */}
            <div style={{ fontSize: '0.85rem' }}>
              <div className="flex justify-between" style={{ padding: '0.3rem 0', color: '#475569' }}>
                <span>Total Taxable Subtotal:</span>
                <span style={{ fontWeight: 600, color: '#0F172A', fontFamily: 'monospace' }}>
                  ₹{totalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

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
                <span>Freight / Logistics Charges:</span>
                <span style={{ fontFamily: 'monospace' }}>
                  {shippingCharges === 0 ? <strong style={{ color: '#059669' }}>FREE</strong> : `₹${shippingCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
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
                <span>Grand Total (INR):</span>
                <span style={{ color: '#0284C7', fontFamily: 'monospace' }}>
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* 6. Commercial Terms & Conditions */}
          <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #E2E8F0', fontSize: '0.74rem', color: '#475569' }}>
            <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Standard Commercial Terms & Conditions:
            </strong>
            <ol style={{ paddingLeft: '1.2rem', margin: 0, lineHeight: 1.6 }}>
              <li><strong>Validity:</strong> This quotation is firm and valid until {validUntilDate}, subject to prevailing pulp raw material prices thereafter.</li>
              <li><strong>Taxes:</strong> GST is charged @ 18% with full Input Tax Credit (ITC) eligibility under Section 16 of the CGST Act, 2017.</li>
              <li><strong>Delivery Timeline:</strong> Dispatch within 3 to 5 business days upon digital acceptance or receipt of official Purchase Order.</li>
              <li><strong>Payment Terms:</strong> Strictly governed by agreed commercial terms. Late payments attract 18% p.a. interest as per MSMED Act, 2006.</li>
              <li><strong>Jurisdiction:</strong> All commercial transactions are subject to Noida, Gautam Buddha Nagar, Uttar Pradesh jurisdiction.</li>
            </ol>
            {adminQuote?.adminNotes && (
              <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.6rem', background: '#FEF3C7', borderRadius: '4px', color: '#92400E' }}>
                <strong>Commercial Desk Remarks:</strong> "{adminQuote.adminNotes}"
              </div>
            )}
          </div>

          {/* 7. Dual Signature & Acceptance Block */}
          <div
            style={{
              padding: '1.5rem 1.75rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              alignItems: 'flex-end',
            }}
          >
            {/* Client Acceptance */}
            <div style={{ border: '1px dashed #CBD5E1', borderRadius: '6px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '2.5rem' }}>
                Client Commercial Acceptance & Purchase Order Authorization:
              </div>
              <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '0.35rem', fontSize: '0.74rem', color: '#0F172A', fontWeight: 700 }}>
                Authorized Client Signatory & Seal
              </div>
            </div>

            {/* Issuer Signature */}
            <div style={{ textAlign: 'center', padding: '1rem' }}>
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
