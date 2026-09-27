import React from 'react';
import { Printer, X, FileText, Building2, ShieldCheck, Share2, AlertCircle } from 'lucide-react';
import { B2BOrder, B2BQuotation } from '../../types';
import { companyMasterService } from '../../services/companyMasterService';
import { storageService } from '../../services/storageService';
import { getWhatsAppUrl } from '../../config/whatsappConfig';

interface ProformaInvoiceModalProps {
  order?: B2BOrder | null;
  quotation?: B2BQuotation | null;
  onClose: () => void;
}

// Convert numbers into formal Indian Rupee Words
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

export const ProformaInvoiceModal: React.FC<ProformaInvoiceModalProps> = ({
  order,
  quotation,
  onClose,
}) => {
  const company = companyMasterService.getCompanyMaster();
  const siteMedia = storageService.getSiteMedia();
  const companyLogo = siteMedia?.logo || '/logo.png';

  const handlePrint = () => {
    window.print();
  };

  // Derive Proforma Reference & Dates
  const baseNumber = order ? order.orderNumber : quotation ? quotation.rfqNumber : `${Date.now()}`.slice(-6);
  const proformaNumber = `PI-KM-${new Date().getFullYear()}-${baseNumber}`;
  const issueDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const validUntilDate = new Date(Date.now() + 15 * 86400000).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Client Details
  const customerName = order?.businessName || quotation?.businessName || 'Valued Commercial Client';
  const customerEmail = quotation?.email || order?.billingAddress?.fullName || 'procurement@client.com';
  const customerPhone = quotation?.phone || order?.billingAddress?.phone || '+91 99999 00000';
  const customerGstin = order?.gstin || quotation?.gstin || 'Unregistered / Consumer';

  const billingAddress = order?.billingAddress || quotation?.billingAddress || {
    street: 'Corporate Procurement Office',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201306',
  };

  const shippingAddress = order?.shippingAddress || quotation?.shippingAddress || billingAddress;

  const isInterState = billingAddress.state
    ? !billingAddress.state.toLowerCase().includes('uttar') && billingAddress.state.toLowerCase() !== 'up'
    : false;

  // Extract Line Items
  interface DisplayItem {
    name: string;
    sku: string;
    hsn: string;
    qty: number;
    unit: string;
    rate: number;
    taxable: number;
    gstRate: number;
    total: number;
  }

  let items: DisplayItem[] = [];
  let subtotal = 0;
  let taxTotal = 0;
  let shippingFee = 0;
  let grandTotal = 0;

  if (order) {
    items = order.items.map((it: any) => {
      const taxable = it.taxableValue || it.unitPrice * it.quantity;
      const gst = it.gstAmount || taxable * 0.18;
      return {
        name: it.productName,
        sku: it.sku || 'KM-B2B-PROD',
        hsn: it.hsn || '48025610',
        qty: it.quantity,
        unit: it.unit || 'Reams',
        rate: it.unitPrice,
        taxable,
        gstRate: 18,
        total: taxable + gst,
      };
    });
    subtotal = order.taxableAmount || items.reduce((acc, i) => acc + i.taxable, 0);
    taxTotal = (order.cgst || 0) + (order.sgst || 0) + (order.igst || 0) || subtotal * 0.18;
    shippingFee = order.shippingFee || 0;
    grandTotal = order.grandTotal || subtotal + taxTotal + shippingFee;
  } else if (quotation) {
    const adminQ = quotation.adminQuotation;
    const fallbackQty = quotation.requestedQty || 10;
    const fallbackRate = adminQ?.quotedUnitPrice || quotation.targetUnitPrice || 198;
    const taxable = adminQ?.totalTaxable || fallbackQty * fallbackRate;
    const gst = adminQ?.gstAmount || taxable * 0.18;

    items = [
      {
        name: quotation.productName || 'Sustainable Agro-Pulp Eco Copier Paper',
        sku: quotation.sku || 'KM-PAP-AG75',
        hsn: '48025610',
        qty: fallbackQty,
        unit: 'Reams',
        rate: fallbackRate,
        taxable,
        gstRate: 18,
        total: taxable + gst,
      },
    ];
    subtotal = taxable;
    taxTotal = gst;
    shippingFee = adminQ?.shippingCharges || quotation.shippingCharges || 0;
    grandTotal = subtotal + taxTotal + shippingFee;
  } else {
    items = [
      {
        name: 'Kogniti AgroPrint 75 GSM A4 Sustainable Paper (500 Sheets)',
        sku: 'KM-PAP-AG75',
        hsn: '48025610',
        qty: 50,
        unit: 'Reams',
        rate: 182.16,
        taxable: 9108,
        gstRate: 18,
        total: 10747.44,
      },
    ];
    subtotal = 9108;
    taxTotal = 1639.44;
    shippingFee = 0;
    grandTotal = 10747.44;
  }

  const cgst = isInterState ? 0 : Math.round((taxTotal / 2) * 100) / 100;
  const sgst = isInterState ? 0 : Math.round((taxTotal / 2) * 100) / 100;
  const igst = isInterState ? taxTotal : 0;

  const handleShareWhatsApp = () => {
    const msg = `*PROFORMA INVOICE: ${proformaNumber}*\nIssuer: ${company.legal_name}\nCustomer: ${customerName}\nAmount Due: ₹${grandTotal.toLocaleString('en-IN')}\nValid Until: ${validUntilDate}\n\nPlease review advance payment details and wire remittance.`;
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
        id="printable-proforma-invoice"
      >
        {/* Header Action Bar */}
        <div
          className="hide-on-print flex justify-between items-center flex-wrap gap-2"
          style={{ marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="badge"
              style={{
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                fontWeight: 800,
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
              }}
            >
              📄 Commercial Proforma Document
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
              Advance Settlement & Order Approval
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

        {/* Warning Banner: Not a Tax Invoice */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '0.6rem 0.9rem',
            marginBottom: '1.25rem',
            fontSize: '0.75rem',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={15} className="text-amber-600 flex-shrink-0" />
          <span>
            <strong>LEGAL NOTICE:</strong> This is an official <strong>PROFORMA INVOICE</strong> issued for advance remittance, purchase authorization, and customs/commercial clearance. It does <em>not</em> constitute a Tax Invoice under Section 31 of the CGST Act, 2017. Final Tax Invoice will be issued upon physical warehouse dispatch.
          </span>
        </div>

        {/* Proforma Invoice Body */}
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
          {/* Company Brand Header */}
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
                  color: '#1E3A8A',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                PROFORMA INVOICE
              </div>
              <div style={{ fontSize: '0.74rem', color: '#DC2626', fontWeight: 800 }}>
                PROFORMA INVOICE - NOT A TAX INVOICE
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                Ref: {proformaNumber} • Issued for Advance Settlement
              </div>
            </div>
          </div>

          {/* Meta Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '0.85rem',
              padding: '1rem 1.75rem',
              backgroundColor: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              fontSize: '0.8rem',
            }}
          >
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Proforma Number</span>
              <strong style={{ fontSize: '0.92rem', color: '#0F172A', fontFamily: 'monospace' }}>
                {proformaNumber}
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Date of Issue</span>
              <strong style={{ color: '#0F172A' }}>{issueDate}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Offer Validity</span>
              <strong style={{ color: '#D97706' }}>{validUntilDate}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Payment Terms</span>
              <strong style={{ color: '#0F172A' }}>100% Advance Against Proforma</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Place of Supply</span>
              <strong style={{ color: '#0F172A' }}>
                {billingAddress.state || 'Uttar Pradesh'} ({isInterState ? 'Inter-State IGST' : 'Intra-State CGST+SGST'})
              </strong>
            </div>
          </div>

          {/* Buyer & Consignee */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '1.5rem',
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Building2 size={14} className="text-blue-600" /> Billed To (Buyer):
              </div>
              <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>{customerName}</strong>
              <div style={{ color: '#475569' }}>{billingAddress.street}</div>
              <div style={{ color: '#475569' }}>
                {billingAddress.city}, {billingAddress.state || 'Uttar Pradesh'} - {billingAddress.pincode}
              </div>
              <div style={{ color: '#475569' }}>Phone: {customerPhone}</div>
              <div style={{ color: '#475569' }}>Email: {customerEmail}</div>
              <div style={{ marginTop: '0.3rem', color: '#0F172A', fontWeight: 600 }}>
                GSTIN: <code style={{ color: '#0284C7' }}>{customerGstin}</code>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Shipped To (Consignee / Destination):
              </div>
              <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>{customerName}</strong>
              <div style={{ color: '#475569' }}>{shippingAddress.street}</div>
              <div style={{ color: '#475569' }}>
                {shippingAddress.city}, {shippingAddress.state || 'Uttar Pradesh'} - {shippingAddress.pincode}
              </div>
              <div style={{ color: '#475569' }}>Delivery Contact: {customerPhone}</div>
              <div style={{ marginTop: '0.3rem', color: '#64748B', fontSize: '0.74rem' }}>
                Dispatch Method: Factory Direct Surface Logistics
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ padding: '1rem 1.75rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #CBD5E1', color: '#0F172A' }}>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'left', width: '40px' }}>#</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left' }}>Item & Specifications</th>
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
                {items.map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#64748B' }}>{idx + 1}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <strong style={{ color: '#0F172A', display: 'block' }}>{it.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        SKU: {it.sku} • 100% Tree-Free Upcycled Agricultural Residue Pulp
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontFamily: 'monospace', color: '#475569' }}>
                      {it.hsn}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>
                      {it.qty}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: '#64748B' }}>
                      {it.unit}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace' }}>
                      ₹{it.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                      ₹{it.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: '#64748B' }}>
                      {it.gstRate}%
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>
                      ₹{it.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown & Bank Information */}
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
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Total Proforma Amount in Words:</span>
                <strong style={{ color: '#0F172A', fontSize: '0.82rem' }}>{numberToIndianWords(grandTotal)}</strong>
              </div>

              {/* Bank Remittance Details */}
              <div style={{ fontSize: '0.72rem', color: '#64748B', background: '#F1F5F9', padding: '0.75rem', borderRadius: '6px' }}>
                <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.25rem' }}>
                  Official Remittance Bank Details (Advance Wire Transfer / NEFT / RTGS):
                </strong>
                <div>Beneficiary: <strong>{company.bank_details.accountHolder}</strong></div>
                <div>Bank: {company.bank_details.bankName} • Account No: <code>{company.bank_details.accountNumber}</code></div>
                <div>IFSC Code: <code>{company.bank_details.ifsc}</code> • Branch: {company.bank_details.branch}</div>
                <div>Account Type: {company.bank_details.accountType}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem' }}>
              <div className="flex justify-between" style={{ padding: '0.3rem 0', color: '#475569' }}>
                <span>Subtotal (Taxable Value):</span>
                <span style={{ fontWeight: 600, color: '#0F172A', fontFamily: 'monospace' }}>
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                <span>Shipping & Freight:</span>
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
                <span>Total Proforma Value:</span>
                <span style={{ color: '#1D4ED8', fontFamily: 'monospace' }}>
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                Terms of Advance Settlement:
              </strong>
              <div>• Advance wire transfer confirmation required to schedule paper production and logistics reservation.</div>
              <div>• Quoted rates are firm against raw material pulp price fluctuations until {validUntilDate}.</div>
              <div>• Tax Invoice and E-Way Bill will accompany the cargo upon factory dispatch.</div>
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
            #printable-proforma-invoice, #printable-proforma-invoice * {
              visibility: visible;
            }
            #printable-proforma-invoice {
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
