import React, { useState } from 'react';
import { Printer, X, FileText, Building2, ShieldCheck, Share2, AlertCircle } from 'lucide-react';
import { B2COrder, B2BOrder } from '../../types';
import { companyMasterService } from '../../services/companyMasterService';
import { storageService } from '../../services/storageService';
import { getWhatsAppUrl } from '../../config/whatsappConfig';

export type NoteType = 'credit' | 'debit';

interface CreditDebitNoteModalProps {
  order: B2COrder | B2BOrder;
  noteType?: NoteType;
  initialReason?: string;
  adjustmentAmount?: number;
  onClose: () => void;
}

// Convert numeric amounts into formal Indian Rupee Words
function numberToIndianWords(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen ',
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
        str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
      }
    }
    return str;
  };

  const intPart = Math.floor(num);
  const paise = Math.round((num - intPart) * 100);
  let result = inWords(intPart) + 'Rupees ';
  if (paise > 0) {
    result += 'and ' + inWords(paise) + 'Paise ';
  }
  return result + 'Only';
}

export const CreditDebitNoteModal: React.FC<CreditDebitNoteModalProps> = ({
  order,
  noteType: initialNoteType = 'credit',
  initialReason = 'Goods Returned by Customer / Post-Sale Commercial Adjustment',
  adjustmentAmount: initialAdjustment,
  onClose,
}) => {
  const [noteType, setNoteType] = useState<NoteType>(initialNoteType);
  const [reason, setReason] = useState<string>(initialReason);

  const company = companyMasterService.getCompanyMaster();
  const siteMedia = storageService.getSiteMedia();
  const companyLogo = siteMedia?.logo || '/logo.png';

  const handlePrint = () => {
    window.print();
  };

  // Original Invoice Linkage (Mandatory under Section 34 CGST Act)
  const originalInvoiceNumber = `INV-${order.orderNumber}`;
  const originalInvoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const notePrefix = noteType === 'credit' ? 'CN' : 'DN';
  const noteNumber = `${notePrefix}-KM-${new Date().getFullYear()}-${order.orderNumber}`;
  const noteDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Customer / Buyer Details
  const isB2B = 'businessName' in order;
  const customerName = isB2B ? (order as B2BOrder).businessName : (order as B2COrder).customerName || 'Valued Customer';
  const customerGstin = isB2B ? (order as B2BOrder).gstin || 'Unregistered' : (order as B2COrder).optionalGstin || 'Consumer (Unregistered)';
  const billingAddress = order.billingAddress || order.shippingAddress || {
    street: 'Customer Delivery Address',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201306',
  };

  const isInterState = billingAddress.state
    ? !billingAddress.state.toLowerCase().includes('uttar') && billingAddress.state.toLowerCase() !== 'up'
    : false;

  // Compute Default Adjustment Values
  const defaultAdj = initialAdjustment !== undefined ? initialAdjustment : Math.round(((order as any).grandTotal || (order as any).totalAmount || (order as any).total || 1000) * 0.25 * 100) / 100;
  const [adjAmount, setAdjAmount] = useState<number>(defaultAdj);

  const taxableAdj = Math.round((adjAmount / 1.18) * 100) / 100;
  const totalTaxAdj = Math.round((adjAmount - taxableAdj) * 100) / 100;

  const cgstAdj = isInterState ? 0 : Math.round((totalTaxAdj / 2) * 100) / 100;
  const sgstAdj = isInterState ? 0 : Math.round((totalTaxAdj / 2) * 100) / 100;
  const igstAdj = isInterState ? totalTaxAdj : 0;

  const handleShareWhatsApp = () => {
    const title = noteType === 'credit' ? 'CREDIT NOTE' : 'DEBIT NOTE';
    const msg = `*STATUTORY ${title}: ${noteNumber}*\nIssuer: ${company.legal_name}\nCustomer: ${customerName}\nOriginal Invoice: ${originalInvoiceNumber} (Dated: ${originalInvoiceDate})\nAdjustment Amount: ₹${adjAmount.toLocaleString('en-IN')}\nReason: ${reason}\n\nGST Section 34 Compliance Document issued.`;
    window.open(getWhatsAppUrl(msg), '_blank');
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
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
        id="printable-credit-debit-note"
      >
        {/* Header Action Bar */}
        <div
          className="hide-on-print flex justify-between items-center flex-wrap gap-2"
          style={{ marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem' }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNoteType('credit')}
              className="btn btn-sm"
              style={{
                background: noteType === 'credit' ? '#DC2626' : '#F1F5F9',
                color: noteType === 'credit' ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                borderRadius: '8px',
              }}
            >
              Credit Note (Refund / Return)
            </button>
            <button
              onClick={() => setNoteType('debit')}
              className="btn btn-sm"
              style={{
                background: noteType === 'debit' ? '#2563EB' : '#F1F5F9',
                color: noteType === 'debit' ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                borderRadius: '8px',
              }}
            >
              Debit Note (Supplementary Charge)
            </button>
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

        {/* Note Body */}
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
          {/* Header */}
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
            <div className="flex items-start gap-3">
              <img
                key={companyLogo}
                src={companyLogo}
                alt="Kogniti Minds Logo"
                style={{ height: '48px', width: 'auto', objectFit: 'contain', marginTop: '2px' }}
              />
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.01em' }}>
                  {company.legal_name}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569' }}>
                  {company.address_line_1}, {company.address_line_2}, {company.district}, {company.state}, {company.country} - {company.pincode}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  CIN: {company.cin} • GSTIN: {company.gstin} • PAN: {company.pan} • State Code: {company.gst_state_code} ({company.gst_state})
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Email: {company.support_email} • Phone: {company.support_phone} • Web: {company.website}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  color: noteType === 'credit' ? '#DC2626' : '#2563EB',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {noteType === 'credit' ? 'CREDIT NOTE' : 'DEBIT NOTE'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>
                Under Section 34 of CGST Act, 2017
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0F172A', fontWeight: 800, fontFamily: 'monospace', marginTop: '2px' }}>
                Note Ref: {noteNumber}
              </div>
            </div>
          </div>

          {/* Statutory Reference Linkage Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.85rem',
              padding: '1rem 1.75rem',
              backgroundColor: noteType === 'credit' ? '#FEF2F2' : '#EFF6FF',
              borderBottom: '1px solid #E2E8F0',
              fontSize: '0.8rem',
            }}
          >
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Note Number</span>
              <strong style={{ fontSize: '0.92rem', color: '#0F172A', fontFamily: 'monospace' }}>
                {noteNumber}
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Note Issue Date</span>
              <strong style={{ color: '#0F172A' }}>{noteDate}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Original Tax Invoice No.</span>
              <strong style={{ color: '#0284C7', fontFamily: 'monospace' }}>{originalInvoiceNumber}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Original Invoice Date</span>
              <strong style={{ color: '#0F172A' }}>{originalInvoiceDate}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Place of Supply</span>
              <strong style={{ color: '#0F172A' }}>
                {billingAddress.state || 'Uttar Pradesh'} ({isInterState ? 'IGST' : 'CGST+SGST'})
              </strong>
            </div>
          </div>

          {/* Customer Block & Reason */}
          <div
            style={{
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid #E2E8F0',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Building2 size={14} className="text-sky-600" /> Billed To (Buyer):
              </div>
              <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>{customerName}</strong>
              <div style={{ color: '#475569' }}>{billingAddress.street}</div>
              <div style={{ color: '#475569' }}>
                {billingAddress.city}, {billingAddress.state || 'Uttar Pradesh'} - {billingAddress.pincode}
              </div>
              <div style={{ marginTop: '0.3rem', color: '#0F172A', fontWeight: 600 }}>
                GSTIN / UIN: <code style={{ color: '#0284C7' }}>{customerGstin}</code>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Reason for Issuance:
              </div>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="form-input hide-on-print"
                style={{ width: '100%', fontSize: '0.82rem', marginBottom: '0.5rem' }}
                placeholder="Enter statutory reason"
              />
              <div style={{ background: '#F8FAFC', padding: '0.6rem', borderRadius: '4px', border: '1px solid #E2E8F0', color: '#334155' }}>
                <strong>Statutory Reason:</strong> {reason}
              </div>
            </div>
          </div>

          {/* Adjustment Table */}
          <div style={{ padding: '1rem 1.75rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #CBD5E1', color: '#0F172A' }}>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'left', width: '40px' }}>#</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left' }}>Description of Adjustment</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'center', width: '80px' }}>HSN</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right', width: '120px' }}>Adjusted Taxable (₹)</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'center', width: '65px' }}>GST Rate</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right', width: '110px' }}>GST Amount (₹)</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right', width: '130px' }}>Total Adjustment (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#64748B' }}>1</td>
                  <td style={{ padding: '0.75rem' }}>
                    <strong style={{ color: '#0F172A', display: 'block' }}>
                      {noteType === 'credit' ? 'Commercial Credit Adjustment / Goods Return' : 'Supplemental Debit Charge'}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      Pertaining to Tax Invoice {originalInvoiceNumber} dated {originalInvoiceDate}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontFamily: 'monospace', color: '#475569' }}>
                    48025610
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace' }}>
                    ₹{taxableAdj.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: '#64748B' }}>
                    18%
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace' }}>
                    ₹{totalTaxAdj.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: noteType === 'credit' ? '#DC2626' : '#2563EB' }}>
                    ₹{adjAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
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
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Total Adjustment Value in Words:</span>
              <strong style={{ color: '#0F172A', fontSize: '0.82rem' }}>{numberToIndianWords(adjAmount)}</strong>
            </div>

            <div style={{ fontSize: '0.85rem' }}>
              <div className="flex justify-between" style={{ padding: '0.3rem 0', color: '#475569' }}>
                <span>Adjusted Taxable Amount:</span>
                <span style={{ fontWeight: 600, color: '#0F172A', fontFamily: 'monospace' }}>
                  ₹{taxableAdj.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {!isInterState ? (
                <>
                  <div className="flex justify-between" style={{ padding: '0.3rem 0', color: '#475569' }}>
                    <span>CGST (9%):</span>
                    <span style={{ fontFamily: 'monospace' }}>₹{cgstAdj.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between" style={{ padding: '0.3rem 0', color: '#475569' }}>
                    <span>SGST (9%):</span>
                    <span style={{ fontFamily: 'monospace' }}>₹{sgstAdj.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between" style={{ padding: '0.3rem 0', color: '#475569' }}>
                  <span>IGST (18%):</span>
                  <span style={{ fontFamily: 'monospace' }}>₹{igstAdj.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div
                className="flex justify-between"
                style={{
                  padding: '0.75rem 0 0.25rem 0',
                  borderTop: '2px solid #0F172A',
                  marginTop: '0.5rem',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  color: noteType === 'credit' ? '#DC2626' : '#2563EB',
                }}
              >
                <span>Net {noteType === 'credit' ? 'Credit' : 'Debit'} Amount:</span>
                <span style={{ fontFamily: 'monospace' }}>
                  ₹{adjAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Signatory */}
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
                Statutory GST Declarations:
              </strong>
              <div>• Issued under Section 34 of the Central Goods and Services Tax Act, 2017.</div>
              <div>• Output tax liability and recipient input tax credit (ITC) stand adjusted accordingly.</div>
              <div>• This document must be reflected in GSTR-1 and GSTR-3B filings for the current tax period.</div>
              <div>• Subject to Gautam Buddha Nagar (Uttar Pradesh) jurisdiction.</div>
            </div>

            <div style={{ textAlign: 'center', minWidth: '220px' }}>
              <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '2.5rem' }}>
                For {company.legal_name}
              </div>
              <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '0.35rem', fontSize: '0.74rem', color: '#0F172A', fontWeight: 700 }}>
                Authorized Signatory & Seal
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
            #printable-credit-debit-note, #printable-credit-debit-note * {
              visibility: visible;
            }
            #printable-credit-debit-note {
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
