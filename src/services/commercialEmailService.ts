/**
 * KOGNITI MINDS PRIVATE LIMITED - Commercial & Transactional Email Service
 * 
 * Official Email Templates for:
 * 1. Quotation
 * 2. Quotation Acceptance
 * 3. Order Confirmation
 * 4. Proforma Invoice
 * 5. Tax Invoice
 * 6. Credit Note
 * 7. Debit Note
 * 8. Payment Confirmation
 * 9. Shipping Confirmation
 * 
 * SINGLE SOURCE OF TRUTH: All email documents read corporate credentials from companyMasterService.
 * Official Footer Standard:
 *   KOGNITI MINDS PRIVATE LIMITED
 *   CIN: U46496UP2024PTC213997 | PAN: AALCK4750F | GSTIN: 09AALCK4750F1ZC
 *   Address: Panchsheel Greens-2, Sec-16 B, Greater Noida West, Bisrakh, Bishrakh,
 *            Gautam Buddha Nagar, Uttar Pradesh, India - 201306
 */

import { companyMasterService } from './companyMasterService';
import { CompanyMasterSettings } from '../types';

export interface CommercialEmailItem {
  name: string;
  sku?: string;
  hsn?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discount?: number;
  taxableValue: number;
  gstRate: number;
  total: number;
}

export interface CommercialEmailPayload {
  toEmail: string;
  toName: string;
  documentType:
    | 'quotation'
    | 'quotation_acceptance'
    | 'order_confirmation'
    | 'proforma_invoice'
    | 'tax_invoice'
    | 'credit_note'
    | 'debit_note'
    | 'payment_confirmation'
    | 'shipping_confirmation';
  documentNumber: string;
  documentDate?: string;
  validUntil?: string;
  originalInvoiceNumber?: string; // Required for Credit/Debit Note
  originalInvoiceDate?: string;   // Required for Credit/Debit Note
  reason?: string;                // For Credit/Debit note
  trackingNumber?: string;
  carrierName?: string;
  subtotal: number;
  discount?: number;
  taxableValue: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  grandTotal: number;
  items?: CommercialEmailItem[];
  shippingAddress?: string;
  billingAddress?: string;
  paymentTerms?: string;
  customerGstin?: string;
}

class CommercialEmailService {
  /**
   * Generates the official corporate statutory footer required on all emails
   */
  public generateOfficialEmailFooter(cm: CompanyMasterSettings = companyMasterService.getCompanyMaster()): string {
    return `
      <!-- Official Kogniti Minds Corporate Footer -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px; border-top: 2px solid #E2E8F0; background-color: #F8FAFC; border-radius: 0 0 8px 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <tr>
          <td style="padding: 24px 32px; font-size: 12px; color: #64748B; line-height: 1.6;">
            <div style="font-weight: 800; font-size: 13px; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
              ${cm.legal_name}
            </div>
            <div style="margin-bottom: 8px; color: #334155;">
              <strong>CIN:</strong> <span style="font-family: monospace; color: #2563EB;">${cm.cin}</span> &nbsp;|&nbsp;
              <strong>PAN:</strong> <span style="font-family: monospace; color: #D97706;">${cm.pan}</span> &nbsp;|&nbsp;
              <strong>GSTIN:</strong> <span style="font-family: monospace; color: #059669;">${cm.gstin}</span> (${cm.gst_state})
            </div>
            <div style="margin-bottom: 12px; color: #475569; font-size: 11.5px;">
              <strong>Registered Office:</strong> ${cm.address_line_1}, ${cm.address_line_2}, ${cm.city}, ${cm.district}, ${cm.state}, ${cm.country} - ${cm.pincode}
            </div>
            <div style="padding-top: 10px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8; display: flex; justify-content: space-between; flex-wrap: wrap;">
              <span>Enquiries: <a href="mailto:${cm.support_email}" style="color: #2563EB; text-decoration: none;">${cm.support_email}</a> | Tel: ${cm.support_phone}</span>
              <span>&copy; ${new Date().getFullYear()} ${cm.legal_name}. All rights reserved.</span>
            </div>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Generates a styled transactional email HTML template
   */
  public generateCommercialEmailHtml(payload: CommercialEmailPayload): { subject: string; html: string } {
    const cm = companyMasterService.getCompanyMaster();
    const docTitles: Record<CommercialEmailPayload['documentType'], { title: string; badgeColor: string; subject: string }> = {
      quotation: {
        title: 'B2B COMMERCIAL QUOTATION',
        badgeColor: '#2563EB',
        subject: `[Quotation] ${payload.documentNumber} from ${cm.legal_name}`
      },
      quotation_acceptance: {
        title: 'QUOTATION ACCEPTANCE ACKNOWLEDGEMENT',
        badgeColor: '#059669',
        subject: `[Quotation Accepted] Confirmation for ${payload.documentNumber} - ${cm.legal_name}`
      },
      order_confirmation: {
        title: 'B2B ORDER CONFIRMATION',
        badgeColor: '#059669',
        subject: `[Order Confirmed] #${payload.documentNumber} - ${cm.legal_name}`
      },
      proforma_invoice: {
        title: 'PROFORMA INVOICE',
        badgeColor: '#7C3AED',
        subject: `[Proforma Invoice] ${payload.documentNumber} - ${cm.legal_name}`
      },
      tax_invoice: {
        title: 'TAX INVOICE (Sec 31 CGST Act)',
        badgeColor: '#0D9488',
        subject: `[Tax Invoice] ${payload.documentNumber} from ${cm.legal_name}`
      },
      credit_note: {
        title: 'CREDIT NOTE (Sec 34 CGST Act)',
        badgeColor: '#DC2626',
        subject: `[Credit Note] ${payload.documentNumber} ref: ${payload.originalInvoiceNumber || 'INV'} - ${cm.legal_name}`
      },
      debit_note: {
        title: 'DEBIT NOTE (Sec 34 CGST Act)',
        badgeColor: '#D97706',
        subject: `[Debit Note] ${payload.documentNumber} ref: ${payload.originalInvoiceNumber || 'INV'} - ${cm.legal_name}`
      },
      payment_confirmation: {
        title: 'PAYMENT CONFIRMATION & RECEIPT',
        badgeColor: '#10B981',
        subject: `[Payment Received] Confirmation for ${payload.documentNumber} - ${cm.legal_name}`
      },
      shipping_confirmation: {
        title: 'DISPATCH & SHIPPING CONFIRMATION',
        badgeColor: '#0284C7',
        subject: `[Dispatched] Shipment for Order ${payload.documentNumber} - ${cm.legal_name}`
      }
    };

    const docConfig = docTitles[payload.documentType];

    const itemsRows = (payload.items || []).map((it, idx) => `
      <tr style="border-bottom: 1px solid #F1F5F9; font-size: 12px; color: #334155;">
        <td style="padding: 10px 8px; text-align: center; color: #64748B;">${idx + 1}</td>
        <td style="padding: 10px 8px;">
          <strong style="color: #0F172A;">${it.name}</strong>
          ${it.hsn ? `<br><span style="font-size: 11px; color: #64748B;">HSN: ${it.hsn}</span>` : ''}
          ${it.sku ? `<span style="font-size: 11px; color: #64748B;"> | SKU: ${it.sku}</span>` : ''}
        </td>
        <td style="padding: 10px 8px; text-align: center;">${it.quantity} ${it.unit || 'Units'}</td>
        <td style="padding: 10px 8px; text-align: right;">₹${it.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 10px 8px; text-align: right;">₹${it.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 10px 8px; text-align: center;">${it.gstRate}%</td>
        <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #0F172A;">₹${it.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${docConfig.title} - ${payload.documentNumber}</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table role="presentation" width="680" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 8px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 28px 32px; color: #FFFFFF;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 18px; font-weight: 800; letter-spacing: 0.5px; color: #FFFFFF;">
                      ${cm.legal_name}
                    </div>
                    <div style="font-size: 11px; color: #94A3B8; margin-top: 4px;">
                      Sustainable Agri-Waste Paper & Circular Packaging Technology
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 6px 12px; background-color: ${docConfig.badgeColor}; color: #FFFFFF; font-size: 11px; font-weight: 700; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${docConfig.title}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Document Meta Strip -->
          <tr>
            <td style="background-color: #F8FAFC; border-bottom: 1px solid #E2E8F0; padding: 14px 32px; font-size: 12px; color: #475569;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <strong>Document No:</strong> <span style="font-family: monospace; font-weight: 700; color: #0F172A;">${payload.documentNumber}</span>
                    ${payload.documentDate ? `&nbsp;|&nbsp; <strong>Date:</strong> ${payload.documentDate}` : ''}
                    ${payload.validUntil ? `&nbsp;|&nbsp; <strong>Valid Until:</strong> ${payload.validUntil}` : ''}
                  </td>
                  <td align="right">
                    ${payload.originalInvoiceNumber ? `<span style="color: #DC2626; font-weight: 700;">Ref Invoice: ${payload.originalInvoiceNumber}</span>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 32px;">
              <p style="font-size: 14px; color: #334155; margin-top: 0; margin-bottom: 16px;">
                Dear <strong>${payload.toName}</strong>,
              </p>
              <p style="font-size: 13px; color: #475569; line-height: 1.5; margin-bottom: 20px;">
                Please find below the official details regarding <strong>${docConfig.title}</strong> (Ref: <code>${payload.documentNumber}</code>) from ${cm.legal_name}.
              </p>

              <!-- Buyer & Address Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 14px;">
                <tr>
                  <td width="50%" valign="top" style="font-size: 12px; color: #475569; line-height: 1.5; padding-right: 12px;">
                    <strong style="color: #0F172A; font-size: 12.5px;">Recipient / Buyer Details:</strong><br>
                    <strong>${payload.toName}</strong><br>
                    ${payload.customerGstin ? `GSTIN: <span style="font-family: monospace; font-weight: 600;">${payload.customerGstin}</span><br>` : ''}
                    ${payload.billingAddress ? `Billing: ${payload.billingAddress}<br>` : ''}
                  </td>
                  <td width="50%" valign="top" style="font-size: 12px; color: #475569; line-height: 1.5; padding-left: 12px; border-left: 1px solid #E2E8F0;">
                    <strong style="color: #0F172A; font-size: 12.5px;">Supplier / Issuer Details:</strong><br>
                    <strong>${cm.legal_name}</strong><br>
                    GSTIN: <span style="font-family: monospace; font-weight: 600;">${cm.gstin}</span> (${cm.gst_state})<br>
                    PAN: <span style="font-family: monospace;">${cm.pan}</span> | CIN: <span style="font-family: monospace;">${cm.cin}</span>
                  </td>
                </tr>
              </table>

              ${payload.reason ? `
                <div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 10px 14px; margin-bottom: 20px; font-size: 12px; color: #991B1B;">
                  <strong>Reason for Issuance:</strong> ${payload.reason}
                </div>
              ` : ''}

              <!-- Items Table -->
              ${payload.items && payload.items.length > 0 ? `
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px; border: 1px solid #E2E8F0; border-radius: 6px; overflow: hidden;">
                  <thead>
                    <tr style="background-color: #F1F5F9; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px;">
                      <th style="padding: 10px 8px; text-align: center;">#</th>
                      <th style="padding: 10px 8px; text-align: left;">Item Description</th>
                      <th style="padding: 10px 8px; text-align: center;">Qty</th>
                      <th style="padding: 10px 8px; text-align: right;">Unit Price</th>
                      <th style="padding: 10px 8px; text-align: right;">Taxable</th>
                      <th style="padding: 10px 8px; text-align: center;">GST</th>
                      <th style="padding: 10px 8px; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsRows}
                  </tbody>
                </table>
              ` : ''}

              <!-- Financial Summary Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="55%" valign="top" style="font-size: 11.5px; color: #64748B; padding-right: 16px;">
                    ${payload.paymentTerms ? `<div style="margin-bottom: 8px;"><strong>Payment Terms:</strong> ${payload.paymentTerms}</div>` : ''}
                    <div><strong>Bank Remittance:</strong><br>
                    A/C Name: ${cm.bank_account_name}<br>
                    Bank: ${cm.bank_name} | A/C No: ${cm.bank_account_no}<br>
                    IFSC: ${cm.bank_ifsc}</div>
                  </td>
                  <td width="45%" valign="top">
                    <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 12px; color: #334155; border-collapse: collapse;">
                      <tr>
                        <td style="color: #64748B;">Taxable Value:</td>
                        <td align="right" style="font-family: monospace;">₹${payload.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      ${payload.cgst !== undefined && payload.cgst > 0 ? `
                        <tr>
                          <td style="color: #64748B;">CGST:</td>
                          <td align="right" style="font-family: monospace;">₹${payload.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ` : ''}
                      ${payload.sgst !== undefined && payload.sgst > 0 ? `
                        <tr>
                          <td style="color: #64748B;">SGST:</td>
                          <td align="right" style="font-family: monospace;">₹${payload.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ` : ''}
                      ${payload.igst !== undefined && payload.igst > 0 ? `
                        <tr>
                          <td style="color: #64748B;">IGST:</td>
                          <td align="right" style="font-family: monospace;">₹${payload.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ` : ''}
                      <tr style="border-top: 2px solid #0F172A; font-weight: 800; font-size: 14px; color: #0F172A;">
                        <td style="padding-top: 8px;">Grand Total:</td>
                        <td align="right" style="padding-top: 8px; font-family: monospace;">₹${payload.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12.5px; color: #64748B; margin: 0; line-height: 1.5;">
                For questions regarding this document, please contact our accounts team at <a href="mailto:${cm.accounts_email}" style="color: #2563EB;">${cm.accounts_email}</a> or call ${cm.support_phone}.
              </p>
            </td>
          </tr>

          <!-- Corporate Footer -->
          <tr>
            <td>
              ${this.generateOfficialEmailFooter(cm)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    return { subject: docConfig.subject, html };
  }
}

export const commercialEmailService = new CommercialEmailService();
