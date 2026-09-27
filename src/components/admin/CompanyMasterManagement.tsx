import React, { useState, useEffect } from 'react';
import {
  Building2,
  FileCheck,
  ShieldCheck,
  AlertCircle,
  Save,
  RotateCcw,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Receipt,
  FileMinus,
  FilePlus,
  Send,
  Eye,
} from 'lucide-react';
import { companyMasterService } from '../../services/companyMasterService';
import { CompanyMasterSettings } from '../../types';
import { OFFICIAL_COMPANY_MASTER, validateCompanyMaster } from '../../config/companyMaster';
import { QuotationModal } from '../b2b/QuotationModal';
import { ProformaInvoiceModal } from '../b2b/ProformaInvoiceModal';
import { B2BInvoiceModal } from '../b2b/B2BInvoiceModal';
import { CreditDebitNoteModal } from '../common/CreditDebitNoteModal';
import { commercialEmailService } from '../../services/commercialEmailService';

interface CompanyMasterManagementProps {
  onSaveSuccess?: () => void;
}

export const CompanyMasterManagement: React.FC<CompanyMasterManagementProps> = ({ onSaveSuccess }) => {
  const [formData, setFormData] = useState<CompanyMasterSettings>(() => companyMasterService.getCompanyMaster());
  const [validationResult, setValidationResult] = useState(() => validateCompanyMaster(formData));
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Preview Modals State
  const [previewQuotationOpen, setPreviewQuotationOpen] = useState(false);
  const [previewProformaOpen, setPreviewProformaOpen] = useState(false);
  const [previewTaxInvoiceOpen, setPreviewTaxInvoiceOpen] = useState(false);
  const [previewCreditNoteOpen, setPreviewCreditNoteOpen] = useState(false);
  const [previewDebitNoteOpen, setPreviewDebitNoteOpen] = useState(false);
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [activeEmailTab, setActiveEmailTab] = useState<
    'quotation' | 'proforma_invoice' | 'tax_invoice' | 'credit_note' | 'debit_note'
  >('tax_invoice');

  // Listen to company master changes
  useEffect(() => {
    const unsub = companyMasterService.subscribe((updated) => {
      setFormData(updated);
      setValidationResult(validateCompanyMaster(updated));
    });
    return unsub;
  }, []);

  const handleChange = (field: keyof CompanyMasterSettings, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setValidationResult(validateCompanyMaster(updated));
    setSaveErrorMsg(null);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const result = companyMasterService.saveCompanyMaster(formData);
    if (result.success) {
      setSaveSuccessMsg(true);
      setSaveErrorMsg(null);
      setTimeout(() => setSaveSuccessMsg(false), 4000);
      if (onSaveSuccess) onSaveSuccess();
    } else {
      setSaveErrorMsg(result.errors.join(' | '));
    }
  };

  const handleResetToOfficial = () => {
    if (window.confirm('Reset all company legal credentials to the official KOGNITI MINDS statutory master data?')) {
      const reset = companyMasterService.resetToOfficial();
      setFormData(reset);
      setValidationResult(validateCompanyMaster(reset));
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3000);
    }
  };

  // Sample data for document previews
  const sampleItems = [
    {
      id: 'item-1',
      productId: 'prod-001',
      productName: 'Eco Kraft Natural Copier Paper (75 GSM, 500 Sheets, Ream)',
      name: 'Eco Kraft Natural Copier Paper (75 GSM, 500 Sheets, Ream)',
      sku: 'KM-KFT-75-RM',
      hsn: '4802',
      quantity: 50,
      unit: 'Ream',
      unitPrice: 280,
      price: 280,
      discount: 0,
      taxableValue: 14000,
      gstRate: 18,
      total: 16520,
    },
    {
      id: 'item-2',
      productId: 'prod-002',
      productName: 'Unbleached Wheat Straw Printing & Writing Paper (80 GSM)',
      name: 'Unbleached Wheat Straw Printing & Writing Paper (80 GSM)',
      sku: 'KM-WHT-80-RM',
      hsn: '4802',
      quantity: 30,
      unit: 'Ream',
      unitPrice: 320,
      price: 320,
      discount: 0,
      taxableValue: 9600,
      gstRate: 18,
      total: 11328,
    },
  ];

  const sampleEmailPayload = {
    toEmail: 'procurement@enterprise-client.com',
    toName: 'Apex Logistics & Packaging Solutions Pvt Ltd',
    customerGstin: '07AAACA1234Q1Z1',
    billingAddress: 'Plot 44, Okhla Industrial Area Phase-III, New Delhi, Delhi - 110020',
    documentType: activeEmailTab,
    documentNumber:
      activeEmailTab === 'quotation'
        ? 'QT-KM-2026-0042'
        : activeEmailTab === 'proforma_invoice'
        ? 'PI-KM-2026-0089'
        : activeEmailTab === 'credit_note'
        ? 'CRN-KM-2026-0012'
        : activeEmailTab === 'debit_note'
        ? 'DBN-KM-2026-0005'
        : 'INV-KM-2026-1049',
    documentDate: '27 Sep 2026',
    validUntil: '12 Oct 2026',
    originalInvoiceNumber: 'INV-KM-2026-1014',
    originalInvoiceDate: '15 Sep 2026',
    reason:
      activeEmailTab === 'credit_note'
        ? 'Post-sale volume discount rebate on bulk copier paper delivery'
        : activeEmailTab === 'debit_note'
        ? 'Differential freight surcharges for express logistics delivery'
        : undefined,
    subtotal: 23600,
    taxableValue: 23600,
    igst: 4248,
    grandTotal: 27848,
    items: [
      {
        name: 'Eco Kraft Natural Copier Paper (75 GSM, 500 Sheets, Ream)',
        sku: 'KM-KFT-75-RM',
        hsn: '4802',
        quantity: 50,
        unit: 'Ream',
        unitPrice: 280,
        taxableValue: 14000,
        gstRate: 18,
        total: 16520,
      },
      {
        name: 'Unbleached Wheat Straw Printing & Writing Paper (80 GSM)',
        sku: 'KM-WHT-80-RM',
        hsn: '4802',
        quantity: 30,
        unit: 'Ream',
        unitPrice: 320,
        taxableValue: 9600,
        gstRate: 18,
        total: 11328,
      },
    ],
  };

  const renderedEmail = commercialEmailService.generateCommercialEmailHtml(sampleEmailPayload as any);

  return (
    <div style={{ padding: '1.5rem 0' }}>
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '12px',
          padding: '1.75rem 2rem',
          color: '#FFFFFF',
          marginBottom: '2rem',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <Building2 size={24} style={{ color: '#38BDF8' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '0.3px', color: '#FFFFFF' }}>
              Company Master & Statutory Legal Details
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#94A3B8', maxWidth: '680px', lineHeight: 1.5 }}>
            Central single source of truth for KOGNITI MINDS PRIVATE LIMITED. All legal pages, B2B Quotations, Proforma
            Invoices, Tax Invoices, Credit/Debit Notes, and Email Footers dynamically pull from this master configuration.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleResetToOfficial}
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#F1F5F9',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
            }}
            title="Restore canonical KOGNITI MINDS legal credentials"
          >
            <RotateCcw size={15} /> Restore Official Master
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={!validationResult.valid}
            className="btn btn-primary"
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: validationResult.valid ? 'pointer' : 'not-allowed',
              opacity: validationResult.valid ? 1 : 0.6,
            }}
          >
            <Save size={16} /> Save Master Data
          </button>
        </div>
      </div>

      {/* Statutory Validation Status Bar */}
      <div
        style={{
          background: validationResult.valid ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `1px solid ${validationResult.valid ? '#10B981' : '#EF4444'}`,
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {validationResult.valid ? (
            <CheckCircle2 size={22} style={{ color: '#10B981', flexShrink: 0 }} />
          ) : (
            <AlertCircle size={22} style={{ color: '#EF4444', flexShrink: 0 }} />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: validationResult.valid ? '#065F46' : '#991B1B' }}>
              {validationResult.valid
                ? 'Corporate Master Status: Fully Validated & Statutory Compliant'
                : 'Corporate Master Error: Incomplete or Invalid Statutory Data'}
            </div>
            <div style={{ fontSize: '0.8rem', color: validationResult.valid ? '#047857' : '#B91C1C' }}>
              {validationResult.valid
                ? 'All tax documents, invoices, and ONDC B2B payload generators are authorized to issue documents.'
                : validationResult.errors.join(' • ')}
            </div>
          </div>
        </div>

        {/* Real-time statutory chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: validationResult.gstinValid ? '#ECFDF5' : '#FEF2F2',
              color: validationResult.gstinValid ? '#059669' : '#DC2626',
              border: `1px solid ${validationResult.gstinValid ? '#A7F3D0' : '#FECACA'}`,
            }}
          >
            GSTIN: {validationResult.gstinValid ? 'VALID' : 'INVALID'}
          </span>
          <span
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: validationResult.panValid ? '#ECFDF5' : '#FEF2F2',
              color: validationResult.panValid ? '#059669' : '#DC2626',
              border: `1px solid ${validationResult.panValid ? '#A7F3D0' : '#FECACA'}`,
            }}
          >
            PAN: {validationResult.panValid ? 'VALID' : 'INVALID'}
          </span>
          <span
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: validationResult.cinValid ? '#ECFDF5' : '#FEF2F2',
              color: validationResult.cinValid ? '#059669' : '#DC2626',
              border: `1px solid ${validationResult.cinValid ? '#A7F3D0' : '#FECACA'}`,
            }}
          >
            CIN: {validationResult.cinValid ? 'VALID' : 'INVALID'}
          </span>
          <span
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: validationResult.pinValid ? '#ECFDF5' : '#FEF2F2',
              color: validationResult.pinValid ? '#059669' : '#DC2626',
              border: `1px solid ${validationResult.pinValid ? '#A7F3D0' : '#FECACA'}`,
            }}
          >
            PIN: {validationResult.pinValid ? 'VALID' : 'INVALID'}
          </span>
        </div>
      </div>

      {saveSuccessMsg && (
        <div
          style={{
            background: '#F0FDF4',
            border: '1px solid #86EFAC',
            color: '#15803D',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} /> Company Master Data updated successfully and synchronized to database storage!
        </div>
      )}

      {saveErrorMsg && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#B91C1C',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} /> Failed to save: {saveErrorMsg}
        </div>
      )}

      {/* Main Grid: Form Left, Document Generator Suite Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)', gap: '1.75rem' }}>
        {/* Master Form Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem' }}>
            Corporate Identity & Tax Registrations
          </h3>

          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                  Legal Company Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.legal_name}
                  onChange={(e) => handleChange('legal_name', e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                    CIN (Corporate Identity Number) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.cin}
                    onChange={(e) => handleChange('cin', e.target.value.toUpperCase())}
                    placeholder="U46496UP2024PTC213997"
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                    PAN (Permanent Account Number) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.pan}
                    onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
                    placeholder="AALCK4750F"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                    GSTIN (Goods and Services Tax ID) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.gstin}
                    onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                    placeholder="09AALCK4750F1ZC"
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                    GST State <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.gst_state}
                    onChange={(e) => handleChange('gst_state', e.target.value)}
                    placeholder="Uttar Pradesh"
                    required
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.85rem' }}>
                  Registered Office Address
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      Address Line 1 <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.address_line_1}
                      onChange={(e) => handleChange('address_line_1', e.target.value)}
                      placeholder="Panchsheel Greens-2, Sec-16 B"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      Address Line 2 (Locality / Area)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.address_line_2}
                      onChange={(e) => handleChange('address_line_2', e.target.value)}
                      placeholder="Greater Noida West, Bisrakh, Bishrakh"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        District <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.district}
                        onChange={(e) => handleChange('district', e.target.value)}
                        placeholder="Gautam Buddha Nagar"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        PIN Code <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.pincode}
                        onChange={(e) => handleChange('pincode', e.target.value)}
                        placeholder="201306"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        State <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        placeholder="Uttar Pradesh"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        Country <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        placeholder="India"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.85rem' }}>
                  Official Contact & Bank Accounts
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      Support Email
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.support_email}
                      onChange={(e) => handleChange('support_email', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      Accounts / Billing Email
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.accounts_email}
                      onChange={(e) => handleChange('accounts_email', e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '0.85rem' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      Support Phone / Helpline
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.support_phone}
                      onChange={(e) => handleChange('support_phone', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      Bank Account Name
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.bank_account_name}
                      onChange={(e) => handleChange('bank_account_name', e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '0.85rem' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      Bank Name
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.bank_name}
                      onChange={(e) => handleChange('bank_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.bank_account_no}
                      onChange={(e) => handleChange('bank_account_no', e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '0.85rem' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      Bank IFSC
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.bank_ifsc}
                      onChange={(e) => handleChange('bank_ifsc', e.target.value.toUpperCase())}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      Bank Branch
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.bank_branch}
                      onChange={(e) => handleChange('bank_branch', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <button
                  type="submit"
                  disabled={!validationResult.valid}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Save size={18} /> Commit Company Master Data Changes
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Live Document Preview Suite */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Document Verification & Preview Launcher */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <FileCheck size={20} style={{ color: '#2563EB' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Live Document Verification Suite
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              Test and verify that official KOGNITI MINDS supplier credentials, tax calculations, and disclaimers render
              accurately across all commercial business documents:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Quotation Preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>B2B Commercial Quotation</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Auto-numbering, GST breakdown, valid until</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewQuotationOpen(true)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Eye size={14} /> Preview
                </button>
              </div>

              {/* Proforma Invoice Preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>Proforma Invoice (PI)</div>
                  <div style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 600 }}>Labeled PROFORMA • Not a Tax Invoice</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewProformaOpen(true)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Eye size={14} /> Preview
                </button>
              </div>

              {/* Tax Invoice Preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>Tax Invoice (Sec 31 CGST Act)</div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Supplier GSTIN: 09AALCK4750F1ZC</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewTaxInvoiceOpen(true)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Eye size={14} /> Preview
                </button>
              </div>

              {/* Credit Note Preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>Credit Note (Sec 34 CGST Act)</div>
                  <div style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600 }}>Mandatory original invoice linkage</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewCreditNoteOpen(true)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Eye size={14} /> Preview
                </button>
              </div>

              {/* Debit Note Preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>Debit Note (Sec 34 CGST Act)</div>
                  <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600 }}>Upward rate / quantity adjustments</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDebitNoteOpen(true)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Eye size={14} /> Preview
                </button>
              </div>

              {/* Email Templates Preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#166534' }}>Commercial Email Templates</div>
                  <div style={{ fontSize: '0.75rem', color: '#15803D' }}>Official statutory footer on 9 email types</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailPreviewOpen(true)}
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Eye size={14} /> View Emails
                </button>
              </div>
            </div>
          </div>

          {/* ONDC RETeB2B 1.2.5 Supplier Mapping Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={20} style={{ color: '#059669' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                ONDC RETeB2B 1.2.5 Mapping
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1rem', lineHeight: 1.4 }}>
              Active mapping parameters for Open Network for Digital Commerce seller provider records:
            </p>

            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '6px 0', color: '#64748B' }}>Provider ID:</td>
                  <td style={{ padding: '6px 0', fontWeight: 600, color: '#0F172A', textAlign: 'right' }}>
                    <code>KOGNITI-MINDS-PVT-LTD</code>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '6px 0', color: '#64748B' }}>Provider Name:</td>
                  <td style={{ padding: '6px 0', fontWeight: 600, color: '#0F172A', textAlign: 'right' }}>
                    {formData.legal_name}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '6px 0', color: '#64748B' }}>Seller GSTIN:</td>
                  <td style={{ padding: '6px 0', fontWeight: 600, color: '#059669', textAlign: 'right' }}>
                    <code>{formData.gstin}</code>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '6px 0', color: '#64748B' }}>State Code:</td>
                  <td style={{ padding: '6px 0', fontWeight: 600, color: '#0F172A', textAlign: 'right' }}>
                    09 ({formData.gst_state})
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', color: '#64748B' }}>PIN Code:</td>
                  <td style={{ padding: '6px 0', fontWeight: 600, color: '#0F172A', textAlign: 'right' }}>
                    {formData.pincode}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SAMPLE QUOTATION MODAL */}
      {previewQuotationOpen && (
        <QuotationModal
          quotation={{
            id: 'quote-sample-01',
            rfqNumber: 'QT-KM-2026-0042',
            businessId: 'biz-apex',
            businessName: 'Apex Logistics & Packaging Solutions Pvt Ltd',
            contactPerson: 'Mr. Rajesh Verma (Head of Procurement)',
            email: 'procurement@apexlogistics.in',
            phone: '+91 98765 43210',
            billingAddress: {
              id: 'addr-b',
              fullName: 'Mr. Rajesh Verma',
              phone: '+91 98765 43210',
              street: 'Plot 44, Okhla Industrial Area Phase-III',
              city: 'New Delhi',
              state: 'Delhi',
              pincode: '110020',
              addressType: 'work',
            },
            shippingAddress: {
              id: 'addr-s',
              fullName: 'Warehouse Manager',
              phone: '+91 98765 43210',
              street: 'Plot 44, Okhla Industrial Area Phase-III',
              city: 'New Delhi',
              state: 'Delhi',
              pincode: '110020',
              addressType: 'work',
            },
            gstin: '07AAACA1234Q1Z1',
            deliveryPincode: '110020',
            productName: 'Eco Kraft Natural Copier Paper (75 GSM)',
            requestedQty: 80,
            targetUnitPrice: 280,
            status: 'quoted',
            lineItems: sampleItems as any,
            subtotal: 23600,
            taxableAmount: 23600,
            gstAmount: 4248,
            shippingCharges: 1200,
            grandTotal: 29048,
            validUntil: '2026-10-15',
            createdAt: '2026-09-27T08:00:00Z',
          } as any}
          onClose={() => setPreviewQuotationOpen(false)}
        />
      )}

      {/* SAMPLE PROFORMA INVOICE MODAL */}
      {previewProformaOpen && (
        <ProformaInvoiceModal
          quotation={{
            id: 'quote-sample-01',
            rfqNumber: 'PI-KM-2026-0089',
            businessId: 'biz-apex',
            businessName: 'Apex Logistics & Packaging Solutions Pvt Ltd',
            contactPerson: 'Mr. Rajesh Verma (Head of Procurement)',
            email: 'procurement@apexlogistics.in',
            phone: '+91 98765 43210',
            billingAddress: {
              id: 'addr-b',
              fullName: 'Mr. Rajesh Verma',
              phone: '+91 98765 43210',
              street: 'Plot 44, Okhla Industrial Area Phase-III',
              city: 'New Delhi',
              state: 'Delhi',
              pincode: '110020',
              addressType: 'work',
            },
            shippingAddress: {
              id: 'addr-s',
              fullName: 'Warehouse Manager',
              phone: '+91 98765 43210',
              street: 'Plot 44, Okhla Industrial Area Phase-III',
              city: 'New Delhi',
              state: 'Delhi',
              pincode: '110020',
              addressType: 'work',
            },
            gstin: '07AAACA1234Q1Z1',
            deliveryPincode: '110020',
            productName: 'Eco Kraft Natural Copier Paper (75 GSM)',
            requestedQty: 80,
            targetUnitPrice: 280,
            status: 'quoted',
            lineItems: sampleItems as any,
            subtotal: 23600,
            taxableAmount: 23600,
            gstAmount: 4248,
            shippingCharges: 1200,
            grandTotal: 29048,
            validUntil: '2026-10-15',
            createdAt: '2026-09-27T08:00:00Z',
          } as any}
          onClose={() => setPreviewProformaOpen(false)}
        />
      )}

      {/* SAMPLE TAX INVOICE MODAL */}
      {previewTaxInvoiceOpen && (
        <B2BInvoiceModal
          order={{
            id: 'B2B-ORD-2026-1049',
            orderNumber: 'KM-2026-1049',
            userId: 'user-001',
            businessName: 'Apex Logistics & Packaging Solutions Pvt Ltd',
            gstin: '07AAACA1234Q1Z1',
            pan: 'AAACA1234Q',
            contactPerson: 'Mr. Rajesh Verma',
            email: 'procurement@apexlogistics.in',
            phone: '+91 98765 43210',
            billingAddress: {
              street: 'Plot 44, Okhla Industrial Area Phase-III',
              city: 'New Delhi',
              state: 'Delhi',
              pincode: '110020',
              country: 'India',
            },
            shippingAddress: {
              street: 'Warehouse B-12, Sector 8, IMT Manesar',
              city: 'Gurugram',
              state: 'Haryana',
              pincode: '122050',
              country: 'India',
            },
            items: [
              {
                id: 'item-1',
                productId: 'prod-001',
                productName: 'Eco Kraft Natural Copier Paper (75 GSM, 500 Sheets, Ream)',
                name: 'Eco Kraft Natural Copier Paper (75 GSM, 500 Sheets, Ream)',
                quantity: 50,
                price: 280,
                subtotal: 14000,
                sku: 'KM-KFT-75-RM',
                hsn: '4802',
                taxRate: 18,
              },
              {
                id: 'item-2',
                productId: 'prod-002',
                productName: 'Unbleached Wheat Straw Printing & Writing Paper (80 GSM)',
                name: 'Unbleached Wheat Straw Printing & Writing Paper (80 GSM)',
                quantity: 30,
                price: 320,
                subtotal: 9600,
                sku: 'KM-WHT-80-RM',
                hsn: '4802',
                taxRate: 18,
              },
            ],
            subtotal: 23600,
            gstAmount: 4248,
            totalAmount: 27848,
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentMethod: 'Bank Wire / NEFT',
            createdAt: '2026-09-27T08:00:00Z',
          } as any}
          onClose={() => setPreviewTaxInvoiceOpen(false)}
        />
      )}

      {/* SAMPLE CREDIT NOTE MODAL */}
      {previewCreditNoteOpen && (
        <CreditDebitNoteModal
          order={{
            id: 'B2B-ORD-2026-1049',
            orderNumber: 'KM-2026-1049',
            userId: 'user-001',
            businessName: 'Apex Logistics & Packaging Solutions Pvt Ltd',
            gstin: '07AAACA1234Q1Z1',
            pan: 'AAACA1234Q',
            contactPerson: 'Mr. Rajesh Verma',
            email: 'procurement@apexlogistics.in',
            phone: '+91 98765 43210',
            billingAddress: {
              street: 'Plot 44, Okhla Industrial Area Phase-III',
              city: 'New Delhi',
              state: 'Delhi',
              pincode: '110020',
              country: 'India',
            },
            shippingAddress: {
              street: 'Warehouse B-12, Sector 8, IMT Manesar',
              city: 'Gurugram',
              state: 'Haryana',
              pincode: '122050',
              country: 'India',
            },
            items: [],
            subtotal: 23600,
            totalAmount: 27848,
            status: 'confirmed',
            paymentStatus: 'paid',
            createdAt: '2026-09-27T08:00:00Z',
          } as any}
          noteType="credit"
          initialReason="Post-sale volume tier discount rebate on bulk paper consignment"
          adjustmentAmount={3540}
          onClose={() => setPreviewCreditNoteOpen(false)}
        />
      )}

      {/* SAMPLE DEBIT NOTE MODAL */}
      {previewDebitNoteOpen && (
        <CreditDebitNoteModal
          order={{
            id: 'B2B-ORD-2026-1049',
            orderNumber: 'KM-2026-1049',
            userId: 'user-001',
            businessName: 'Apex Logistics & Packaging Solutions Pvt Ltd',
            gstin: '07AAACA1234Q1Z1',
            pan: 'AAACA1234Q',
            contactPerson: 'Mr. Rajesh Verma',
            email: 'procurement@apexlogistics.in',
            phone: '+91 98765 43210',
            billingAddress: {
              street: 'Plot 44, Okhla Industrial Area Phase-III',
              city: 'New Delhi',
              state: 'Delhi',
              pincode: '110020',
              country: 'India',
            },
            shippingAddress: {
              street: 'Warehouse B-12, Sector 8, IMT Manesar',
              city: 'Gurugram',
              state: 'Haryana',
              pincode: '122050',
              country: 'India',
            },
            items: [],
            subtotal: 23600,
            totalAmount: 27848,
            status: 'confirmed',
            paymentStatus: 'paid',
            createdAt: '2026-09-27T08:00:00Z',
          } as any}
          noteType="debit"
          initialReason="Differential freight surcharges for express palletized road transit"
          adjustmentAmount={1770}
          onClose={() => setPreviewDebitNoteOpen(false)}
        />
      )}

      {/* EMAIL TEMPLATES VIEWER MODAL */}
      {emailPreviewOpen && (
        <div className="modal-overlay" onClick={() => setEmailPreviewOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '820px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Commercial Email Templates Preview
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                  Live rendering of official emails generated with dynamic KOGNITI MINDS corporate master footer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailPreviewOpen(false)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                Close
              </button>
            </div>

            {/* Email Type Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
              {(['tax_invoice', 'proforma_invoice', 'quotation', 'credit_note', 'debit_note'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveEmailTab(tab)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeEmailTab === tab ? '#0F172A' : '#F1F5F9',
                    color: activeEmailTab === tab ? '#FFFFFF' : '#475569',
                    textTransform: 'capitalize',
                  }}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.82rem', border: '1px solid #E2E8F0' }}>
              <strong>Subject:</strong> {renderedEmail.subject}
            </div>

            {/* Rendered HTML in iframe */}
            <iframe
              srcDoc={renderedEmail.html}
              style={{
                width: '100%',
                height: '520px',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
              }}
              title="Rendered Email Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};
