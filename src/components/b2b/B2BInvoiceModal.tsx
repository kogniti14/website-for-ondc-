import React from 'react';
import { Printer, X, Building2, CheckCircle2 } from 'lucide-react';
import { B2BOrder } from '../../types';

interface B2BInvoiceModalProps {
  order: B2BOrder;
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

export const B2BInvoiceModal: React.FC<B2BInvoiceModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const isInterState = !order.billingAddress.state.toLowerCase().includes('uttar') && order.billingAddress.state.toLowerCase() !== 'up';
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

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
          maxWidth: '900px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
        id="printable-b2b-invoice"
      >
        {/* Top Control Bar (Hidden when printed) */}
        <div
          className="hide-on-print flex justify-between items-center"
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
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
              }}
            >
              B2B Commercial Tax Invoice
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
              ✓ GSTR-1 / ITC Eligible
            </span>
            <span
              className="badge"
              style={{
                backgroundColor: '#FEF3C7',
                color: '#B45309',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
              }}
            >
              Terms: {order.paymentTerms}
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

        {/* --- FORMAL B2B TAX INVOICE DOCUMENT --- */}
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
              borderBottom: '2px solid #0284C7',
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
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                }}
              >
                <img
                  src="/logo.png"
                  alt="Kogniti Minds"
                  style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '0.02em' }}>
                  KOGNITI MINDS PRIVATE LIMITED
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Enterprise Solutions & Institutional Commerce Division
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38BDF8', letterSpacing: '0.04em' }}>
                TAX INVOICE
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase' }}>
                Under Section 31 of CGST Act, 2017
              </div>
            </div>
          </div>

          {/* 2. Supplier & Invoice Metadata Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              borderBottom: '1px solid #E2E8F0',
              fontSize: '0.82rem',
              lineHeight: '1.5',
            }}
          >
            {/* Supplier Information */}
            <div style={{ padding: '1.25rem', borderRight: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                Supplier (Tax Details):
              </div>
              <div><strong>Kogniti Minds Private Limited</strong></div>
              <div>Registered Office: Panchsheel Greens-2, Sec-16 B, Gr. Noida West, Bisrakh</div>
              <div>Gautam Buddha Nagar, Uttar Pradesh, India - 201306</div>
              <div><strong>GSTIN:</strong> <code style={{ color: '#0284C7', fontWeight: 700 }}>09AALCK4750F1ZC</code></div>
              <div><strong>PAN:</strong> AALCK4750F | <strong>State Code:</strong> 09 (Uttar Pradesh)</div>
              <div><strong>CIN:</strong> U46496UP2024PTC213997</div>
              <div style={{ color: '#64748B' }}>Corporate Desk: enterprise@kognitiminds.com | +91 80 4912 8800</div>
            </div>

            {/* Invoice Reference Metadata */}
            <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC' }}>
              <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ color: '#64748B', padding: '0.2rem 0' }}>Invoice Number:</td>
                    <td style={{ fontWeight: 800, color: '#0F172A', textAlign: 'right' }}>
                      INV-{order.orderNumber}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748B', padding: '0.2rem 0' }}>Invoice Date:</td>
                    <td style={{ fontWeight: 700, textAlign: 'right' }}>{invoiceDate}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748B', padding: '0.2rem 0' }}>Purchase Order (PO) No:</td>
                    <td style={{ fontWeight: 800, color: '#2563EB', textAlign: 'right' }}>
                      {order.poNumber}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748B', padding: '0.2rem 0' }}>Payment Terms:</td>
                    <td style={{ fontWeight: 700, textAlign: 'right', color: '#B45309' }}>
                      {order.paymentTerms} (Approved Credit)
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748B', padding: '0.2rem 0' }}>Place of Supply:</td>
                    <td style={{ fontWeight: 600, textAlign: 'right' }}>
                      {order.billingAddress.state} ({order.gstin ? order.gstin.slice(0, 2) : '29'})
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748B', padding: '0.2rem 0' }}>Reverse Charge Applicable:</td>
                    <td style={{ fontWeight: 600, textAlign: 'right' }}>No</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Billed To & Shipped To Parties */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              borderBottom: '2px solid #E2E8F0',
              fontSize: '0.82rem',
              lineHeight: '1.5',
            }}
          >
            {/* Buyer (Billed To) */}
            <div style={{ padding: '1.25rem', borderRight: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
              <div
                style={{
                  fontWeight: 800,
                  color: '#0F172A',
                  marginBottom: '0.4rem',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Building2 size={16} className="text-blue-600" /> Details of Receiver | Billed To:
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                {order.businessName}
              </div>
              <div>{order.billingAddress.street}</div>
              {order.billingAddress.apartment && <div>{order.billingAddress.apartment}</div>}
              <div>
                {order.billingAddress.city}, {order.billingAddress.state} - {order.billingAddress.pincode}
              </div>
              <div style={{ marginTop: '0.35rem' }}>
                <strong>Buyer GSTIN: </strong>
                <code
                  style={{
                    backgroundColor: '#E0F2FE',
                    color: '#0369A1',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  {order.gstin}
                </code>
              </div>
              <div>
                <strong>PAN: </strong> {order.gstin && order.gstin.length >= 12 ? order.gstin.slice(2, 12) : 'AAACE1234F'} | <strong>State Code:</strong> {order.gstin ? order.gstin.slice(0, 2) : '29'}
              </div>
            </div>

            {/* Consignee (Shipped To) */}
            <div style={{ padding: '1.25rem' }}>
              <div
                style={{
                  fontWeight: 800,
                  color: '#0F172A',
                  marginBottom: '0.4rem',
                  fontSize: '0.88rem',
                }}
              >
                Consignee | Shipped To:
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                {order.shippingAddress.fullName}
              </div>
              <div>{order.shippingAddress.street}</div>
              {order.shippingAddress.apartment && <div>{order.shippingAddress.apartment}</div>}
              <div>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </div>
              <div style={{ marginTop: '0.35rem' }}>
                <strong>Dispatch Logistics:</strong> {order.courierPartner || 'Commercial Freight'}
              </div>
              <div>
                <strong>Carrier AWB Tracking:</strong> {order.trackingNumber || 'BLU-B2B-9810421'}
              </div>
            </div>
          </div>

          {/* 4. Itemized Commercial Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: '#1E293B',
                  color: '#FFFFFF',
                  textAlign: 'left',
                  borderBottom: '2px solid #0F172A',
                }}
              >
                <th style={{ padding: '0.65rem 0.75rem', width: '30px' }}>#</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Description of Goods & Specifications</th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>HSN</th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Wholesale Rate</th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Tier Disc.</th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Taxable Amt (₹)</th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>GST%</th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => {
                const itemTaxable = item.effectiveUnitPrice * item.quantity;
                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #E2E8F0',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                    }}
                  >
                    <td style={{ padding: '0.65rem 0.75rem', color: '#64748B' }}>{idx + 1}</td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{item.productName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        SKU: {item.sku} | Commercial Physical Goods
                      </div>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 600, color: '#475569' }}>
                      {item.hsn}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#64748B' }}>
                      ₹{item.wholesalePrice?.toLocaleString('en-IN') || item.effectiveUnitPrice.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: '#FEF3C7',
                          color: '#B45309',
                          fontSize: '0.7rem',
                        }}
                      >
                        {item.tierDiscountPercent}% OFF
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>
                      ₹{itemTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>
                      18%
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                      ₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* 5. Statutory Tax Computation Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              borderTop: '2px solid #E2E8F0',
              borderBottom: '1px solid #E2E8F0',
              fontSize: '0.82rem',
            }}
          >
            {/* Left: Statutory Amount in Words & Remittance */}
            <div style={{ padding: '1.25rem', borderRight: '1px solid #E2E8F0' }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>
                  INVOICE AMOUNT IN WORDS:
                </span>
                <strong style={{ fontSize: '0.88rem', color: '#0F172A', lineHeight: '1.4' }}>
                  {numberToIndianWords(order.grandTotal)}
                </strong>
              </div>

              {/* Bank Remittance Details */}
              <div
                style={{
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.78rem',
                  lineHeight: '1.5',
                }}
              >
                <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.2rem' }}>
                  Bank Details for NEFT / RTGS / Corporate Wire:
                </div>
                <div><strong>Beneficiary:</strong> KOGNITI MINDS PRIVATE LIMITED</div>
                <div><strong>Bank Name:</strong> HDFC Bank Ltd | <strong>A/C Type:</strong> Current Account</div>
                <div><strong>A/C Number:</strong> <code>50200088991122</code> | <strong>IFSC:</strong> <code>HDFC0001234</code></div>
                <div><strong>Branch:</strong> Greater Noida West, Gautam Buddha Nagar, UP - 201306</div>
                <div style={{ color: '#64748B', fontSize: '0.72rem', marginTop: '0.25rem' }}>
                  * Please mention Invoice Ref <strong>INV-{order.orderNumber}</strong> in the remittance remark.
                </div>
              </div>
            </div>

            {/* Right: Calculations Summary */}
            <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <div className="flex justify-between" style={{ color: '#475569' }}>
                  <span>Gross Taxable Amount:</span>
                  <span>₹{order.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between" style={{ color: '#16A34A', fontSize: '0.78rem' }}>
                  <span>Total Volume Slabs Discount Applied:</span>
                  <span>- ₹{order.bulkDiscountTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {!isInterState ? (
                  <>
                    <div className="flex justify-between" style={{ color: '#475569' }}>
                      <span>Central GST (CGST 9%):</span>
                      <span>₹{(order.totalGst / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between" style={{ color: '#475569' }}>
                      <span>State GST (SGST 9%):</span>
                      <span>₹{(order.totalGst / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between" style={{ color: '#475569' }}>
                    <span>Integrated GST (IGST 18%):</span>
                    <span>₹{order.totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between" style={{ color: '#475569' }}>
                  <span>Commercial Road Freight & Handling:</span>
                  <span>{order.shippingFee === 0 ? 'FREE (Institutional Delivery)' : `₹${order.shippingFee.toLocaleString('en-IN')}`}</span>
                </div>

                <div
                  className="flex justify-between items-baseline"
                  style={{
                    paddingTop: '0.65rem',
                    borderTop: '2px solid #0F172A',
                    fontWeight: 900,
                    fontSize: '1.25rem',
                    color: '#0F172A',
                  }}
                >
                  <span>INVOICE TOTAL:</span>
                  <span style={{ color: '#15803D' }}>
                    ₹{order.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Legal Terms & Signatory Section */}
          <div
            style={{
              padding: '1.25rem 1.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              fontSize: '0.75rem',
              color: '#64748B',
              lineHeight: '1.5',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div style={{ maxWidth: '500px' }}>
              <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>
                Terms & Conditions:
              </div>
              <div>1. All physical goods supplied are covered under manufacturer on-site commercial warranty.</div>
              <div>2. Payment due strictly per agreed credit terms ({order.paymentTerms}). Overdue interest @ 18% p.a.</div>
              <div>3. Certified that the particulars given above are true and correct under the CGST / SGST Act 2017.</div>
              <div>4. Subject to Bengaluru Jurisdiction only.</div>
            </div>

            <div style={{ textAlign: 'right', minWidth: '220px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>
                For KOGNITI MINDS PRIVATE LIMITED
              </div>
              <div
                style={{
                  margin: '0.6rem 0',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'serif',
                    fontStyle: 'italic',
                    fontSize: '1.15rem',
                    color: '#0369A1',
                    fontWeight: 700,
                  }}
                >
                  Kogniti Operations
                </span>
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>
              <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '0.25rem' }}>
                <strong>Authorized Signatory & Digital Seal</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Print Stylesheet Hook */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-b2b-invoice, #printable-b2b-invoice * {
              visibility: visible;
            }
            #printable-b2b-invoice {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              max-width: 100% !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }
            .hide-on-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};
