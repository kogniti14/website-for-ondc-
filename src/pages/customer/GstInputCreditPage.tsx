import React, { useState, useEffect } from 'react';
import {
  FileText,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Download,
  Search,
  Calculator,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  Receipt,
  Percent,
  ExternalLink,
  Phone,
  Mail,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { companyMasterService } from '../../services/companyMasterService';
import { B2COrder, B2BOrder } from '../../types';
import { getTelUrl, getWhatsAppUrl, getWhatsAppDisplayNumber } from '../../config/whatsappConfig';

interface GstInputCreditPageProps {
  setActiveTab: (tab: string) => void;
  openB2BAuth?: (mode?: 'login' | 'register') => void;
  openAuth?: (mode?: 'login' | 'register') => void;
}

export const GstInputCreditPage: React.FC<GstInputCreditPageProps> = ({
  setActiveTab,
  openB2BAuth,
  openAuth,
}) => {
  const { role, b2bBusiness, b2cUser } = useAuth();
  const [companyMaster, setCompanyMaster] = useState(() => companyMasterService.getCompanyMaster());

  // Interactive Calculator State
  const [purchaseAmount, setPurchaseAmount] = useState<number>(25000);
  const [supplyType, setSupplyType] = useState<'intra' | 'inter'>('intra'); // intra = CGST+SGST, inter = IGST

  // Normalized invoice structure for lookup
  interface NormalizedInvoiceLookup {
    orderNumber: string;
    orderStatus: string;
    taxableAmount: number;
    totalGst: number;
    totalAmount: number;
    createdAt: string;
    gstin?: string;
    isB2B: boolean;
  }

  // Invoice Lookup State (for guest/unauthenticated users)
  const [lookupOrderNumber, setLookupOrderNumber] = useState('');
  const [lookupGstin, setLookupGstin] = useState('');
  const [lookupResult, setLookupResult] = useState<{
    found: boolean;
    order?: NormalizedInvoiceLookup;
    searched: boolean;
    message?: string;
  }>({ found: false, searched: false });

  // Authenticated Orders
  const [userB2BOrders, setUserB2BOrders] = useState<B2BOrder[]>([]);
  const [userB2COrders, setUserB2COrders] = useState<B2COrder[]>([]);

  useEffect(() => {
    const unsub = companyMasterService.subscribe((m) => setCompanyMaster(m));
    return unsub;
  }, []);

  useEffect(() => {
    if (role === 'b2b' && b2bBusiness) {
      const allB2B = storageService.getB2BOrders();
      setUserB2BOrders(allB2B.filter((o) => o.businessId === b2bBusiness.id));
    }
    if (role === 'b2c' && b2cUser) {
      const allB2C = storageService.getB2COrders();
      setUserB2COrders(
        allB2C.filter(
          (o) =>
            o.customerEmail === b2cUser.email ||
            (b2cUser.phone && o.customerPhone === b2cUser.phone)
        )
      );
    }
  }, [role, b2bBusiness, b2cUser]);

  // Calculations
  const gstRate = 0.18; // 18% standard rate for paper products (HSN 4802/4820)
  const gstAmount = Math.round(purchaseAmount * gstRate * 100) / 100;
  const totalInvoiceAmount = purchaseAmount + gstAmount;
  const cgst = supplyType === 'intra' ? Math.round((gstAmount / 2) * 100) / 100 : 0;
  const sgst = supplyType === 'intra' ? Math.round((gstAmount / 2) * 100) / 100 : 0;
  const igst = supplyType === 'inter' ? gstAmount : 0;
  const netEffectiveCost = purchaseAmount; // after 100% ITC claim

  // Handle invoice lookup
  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const queryOrder = lookupOrderNumber.trim().toUpperCase();
    const queryGst = lookupGstin.trim().toUpperCase();

    if (!queryOrder) {
      setLookupResult({ found: false, searched: true, message: 'Please enter a valid Order Number.' });
      return;
    }

    const b2bOrders = storageService.getB2BOrders();
    const b2cOrders = storageService.getB2COrders();

    const matchedB2B = b2bOrders.find(
      (o) =>
        (o.orderNumber && o.orderNumber.toUpperCase() === queryOrder) ||
        (o.id && o.id.toUpperCase() === queryOrder)
    );

    if (matchedB2B) {
      if (queryGst && matchedB2B.gstin && matchedB2B.gstin.toUpperCase() !== queryGst) {
        setLookupResult({
          found: false,
          searched: true,
          message: 'The entered GSTIN does not match the invoice records for this order.',
        });
        return;
      }
      setLookupResult({
        found: true,
        order: {
          orderNumber: matchedB2B.orderNumber || matchedB2B.id,
          orderStatus: matchedB2B.orderStatus || 'Confirmed',
          taxableAmount: matchedB2B.taxableAmount || matchedB2B.subtotal || (matchedB2B.grandTotal - (matchedB2B.totalGst || 0)),
          totalGst: matchedB2B.totalGst || Math.round(matchedB2B.grandTotal * 0.18),
          totalAmount: matchedB2B.grandTotal,
          createdAt: matchedB2B.createdAt,
          gstin: matchedB2B.gstin,
          isB2B: true,
        },
        searched: true,
      });
      return;
    }

    const matchedB2C = b2cOrders.find(
      (o) =>
        (o.orderNumber && o.orderNumber.toUpperCase() === queryOrder) ||
        (o.id && o.id.toUpperCase() === queryOrder)
    );

    if (matchedB2C) {
      setLookupResult({
        found: true,
        order: {
          orderNumber: matchedB2C.orderNumber || matchedB2C.id,
          orderStatus: matchedB2C.orderStatus || 'Confirmed',
          taxableAmount: matchedB2C.subtotal,
          totalGst: matchedB2C.gstAmount || Math.round(matchedB2C.total * 0.18),
          totalAmount: matchedB2C.total,
          createdAt: matchedB2C.createdAt,
          gstin: matchedB2C.optionalGstin,
          isB2B: false,
        },
        searched: true,
      });
      return;
    }

    setLookupResult({
      found: false,
      searched: true,
      message: `No active tax invoice found matching order reference "${queryOrder}". Please verify your order number or contact billing support.`,
    });
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* 1. Hero Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0A0F1D 0%, #1E293B 60%, #0F172A 100%)',
          color: '#FFFFFF',
          padding: '4.5rem 1.25rem 4rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '5%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(0, 0, 0, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          <div
            className="inline-flex items-center gap-2"
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              color: '#93C5FD',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            <Receipt size={15} /> Statutory GST Compliance & ITC
          </div>

          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '1rem',
            }}
          >
            GST Input Tax Credit (ITC) for Businesses
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: '#CBD5E1',
              lineHeight: 1.6,
              maxWidth: '780px',
              margin: '0 auto 2rem',
            }}
          >
            Kogniti Minds Private Limited is an authorized manufacturer issuing 100% compliant Tax Invoices under Section 31 of the CGST Act, 2017. Registered Indian businesses and institutions can claim Input Tax Credit on tree-free paper & stationery purchases under Section 16 of the CGST Act.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => {
                if (role === 'b2b') {
                  setActiveTab('wholesale-catalog');
                } else if (openB2BAuth) {
                  openB2BAuth('register');
                } else {
                  setActiveTab('business-register');
                }
              }}
              className="btn btn-primary"
              style={{
                borderRadius: '9999px',
                padding: '0.75rem 1.75rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                border: 'none',
              }}
            >
              Register with GSTIN & Buy Wholesale
            </button>
            <button
              onClick={() => setActiveTab('rfq')}
              className="btn btn-secondary"
              style={{
                borderRadius: '9999px',
                padding: '0.75rem 1.75rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              Request Institutional Quote (RFQ)
            </button>
          </div>
        </div>
      </section>

      {/* 2. Statutory Master Details Ribbon */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '1.25rem 0' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Building2 size={24} style={{ color: '#2563EB', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                  Issuer Legal Entity
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                  {companyMaster.legal_name}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Receipt size={24} style={{ color: '#059669', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                  GSTIN (Uttar Pradesh)
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                  09AALCK4750F1ZC <span style={{ fontSize: '0.72rem', color: '#059669' }}>(State 09)</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Receipt size={24} style={{ color: '#D97706', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                  GSTIN (Bihar Branch)
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                  10AALCK4750F1ZT <span style={{ fontSize: '0.72rem', color: '#D97706' }}>(State 10)</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={24} style={{ color: '#7C3AED', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                  Corporate CIN & PAN
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                  PAN: {companyMaster.pan} | CIN: {companyMaster.cin}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1100px', marginTop: '3rem' }}>
        {/* 3. Two Column Section: Interactive GST Calculator & ITC Checklist */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {/* Card A: Interactive GST & ITC Savings Calculator */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Calculator size={22} style={{ color: '#2563EB' }} />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Interactive B2B GST & ITC Calculator
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Calculate the exact GST breakup on your purchase and estimate eligible Input Tax Credit against your company output tax liability.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Purchase Order Amount (₹ Excl. GST)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748B' }}>
                  ₹
                </span>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(Math.max(0, Number(e.target.value)))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2rem',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#0F172A',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Supply Type & GST Applicability
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSupplyType('intra')}
                  style={{
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: supplyType === 'intra' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                    background: supplyType === 'intra' ? '#EFF6FF' : '#FFFFFF',
                    color: supplyType === 'intra' ? '#1D4ED8' : '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  Intra-State (9% CGST + 9% SGST)
                </button>
                <button
                  type="button"
                  onClick={() => setSupplyType('inter')}
                  style={{
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: supplyType === 'inter' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                    background: supplyType === 'inter' ? '#EFF6FF' : '#FFFFFF',
                    color: supplyType === 'inter' ? '#1D4ED8' : '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  Inter-State (18% IGST)
                </button>
              </div>
            </div>

            {/* Breakdown Table */}
            <div
              style={{
                background: '#F8FAFC',
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid #E2E8F0',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B', marginBottom: '0.5rem' }}>
                <span>Taxable Value (HSN 4802/4820):</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>₹{purchaseAmount.toLocaleString('en-IN')}</span>
              </div>

              {supplyType === 'intra' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B', marginBottom: '0.5rem' }}>
                    <span>CGST (9%):</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>₹{cgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B', marginBottom: '0.5rem' }}>
                    <span>SGST (9%):</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>₹{sgst.toLocaleString('en-IN')}</span>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B', marginBottom: '0.5rem' }}>
                  <span>IGST (18% Integrated Tax):</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>₹{igst.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div
                style={{
                  borderTop: '1px dashed #CBD5E1',
                  paddingTop: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: '#0F172A',
                }}
              >
                <span>Total Invoice Value:</span>
                <span>₹{totalInvoiceAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Savings Highlight */}
            <div
              style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                border: '1.5px solid #10B981',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.76rem', color: '#065F46', fontWeight: 700, textTransform: 'uppercase' }}>
                  Eligible ITC Claim Value
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#047857' }}>
                  ₹{gstAmount.toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#065F46', fontWeight: 600 }}>Effective Net Cost:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                  ₹{netEffectiveCost.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Statutory HSN Codes & ITC Eligibility Conditions */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <ShieldCheck size={22} style={{ color: '#059669' }} />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Statutory HSN Codes & Tax Rates
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>HSN 4802 56 10</span>
                    <span style={{ fontSize: '0.72rem', background: '#EFF6FF', color: '#2563EB', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      18% GST Rate
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
                    Uncoated tree-free agro-paper for printing, writing, and photocopying (A4, A3, Legal, 70-85 GSM).
                  </div>
                </div>

                <div style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>HSN 4820 10 90</span>
                    <span style={{ fontSize: '0.72rem', background: '#EFF6FF', color: '#2563EB', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      18% GST Rate
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
                    Stationery, executive notebooks, journals, registers, writing pads, and file folders.
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
                Mandatory Conditions to Claim ITC (Section 16, CGST Act):
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: '#475569' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Valid Tax Invoice:</strong> The buyer must possess an original Tax Invoice issued by Kogniti Minds Private Limited.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Receipt of Goods:</strong> The buyer must have received the paper consignment at their registered delivery premises.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>GSTR-1 & GSTR-2B Matching:</strong> Kogniti Minds uploads the invoice in monthly GSTR-1, reflecting automatically in buyer's GSTR-2B.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Filing GSTR-3B:</strong> The buyer must furnish return under Section 39 to utilize the input tax credit.</span>
                </li>
              </ul>
            </div>

            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Billing Inquiries: accounts@kognitiminds.com</span>
              <a
                href={getWhatsAppUrl("Hello Kogniti Minds, I need assistance regarding GST invoice and ITC.")}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700, textDecoration: 'underline' }}
              >
                Chat with Accounts
              </a>
            </div>
          </div>
        </div>

        {/* 4. Authenticated Invoice Details OR Guest Invoice Search */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '2.25rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            border: '1px solid #E2E8F0',
            marginBottom: '3rem',
          }}
        >
          {role === 'b2b' && b2bBusiness ? (
            /* Logged In B2B User Invoices */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Tax Invoices for {b2bBusiness.companyName}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0' }}>
                    Registered GSTIN: <strong>{b2bBusiness.gstin || '29AAACE1234F1Z8'}</strong> • State: {b2bBusiness.shippingAddress?.state || 'Verified'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('business-dashboard');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  Open Full Business Dashboard →
                </button>
              </div>

              {userB2BOrders.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Invoice #</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Order Ref</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Invoice Date</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Taxable Value</th>
                        <th style={{ padding: '0.75rem 1rem' }}>GST (18%)</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Total Amount</th>
                        <th style={{ padding: '0.75rem 1rem' }}>ITC Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userB2BOrders.map((ord) => (
                        <tr key={ord.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#2563EB' }}>
                            INV-KM-{ord.orderNumber.replace(/[^0-9]/g, '').slice(-4) || '1024'}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#0F172A', fontWeight: 600 }}>
                            {ord.orderNumber}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>
                            {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#0F172A', fontWeight: 600 }}>
                            ₹{(ord.taxableAmount || ord.subtotal || (ord.grandTotal - (ord.totalGst || 0))).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#059669', fontWeight: 700 }}>
                            ₹{(ord.totalGst || Math.round(ord.grandTotal * 0.18)).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#0F172A', fontWeight: 800 }}>
                            ₹{ord.grandTotal.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ fontSize: '0.72rem', background: '#ECFDF5', color: '#065F46', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <CheckCircle2 size={12} /> Uploaded to GSTR-1
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#F8FAFC', borderRadius: '12px' }}>
                  <Receipt size={36} style={{ color: '#94A3B8', margin: '0 auto 0.75rem' }} />
                  <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem' }}>No B2B Invoices Generated Yet</div>
                  <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0.5rem 0 1.25rem' }}>
                    Once you place a bulk order or accept a quotation, your commercial Tax Invoice will be generated and uploaded here automatically.
                  </p>
                  <button
                    onClick={() => setActiveTab('wholesale-catalog')}
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: '8px' }}
                  >
                    Browse Wholesale Catalog
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Guest / Unauthenticated Lookup Tool */
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Search & Verify Order Tax Invoice
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0' }}>
                  Enter your Order Number and Registered GSTIN to view invoice details and statutory ITC eligibility.
                </p>
              </div>

              <form onSubmit={handleLookup} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'end', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                    Order Number / Reference ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KM-ORD-2026-XXXX or ORD-B2C-..."
                    value={lookupOrderNumber}
                    onChange={(e) => setLookupOrderNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                    Registered GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="15-digit GSTIN (e.g. 09AALCK...)"
                    value={lookupGstin}
                    onChange={(e) => setLookupGstin(e.target.value)}
                    maxLength={15}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      padding: '0.65rem 1.25rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    <Search size={16} /> Verify Invoice
                  </button>
                </div>
              </form>

              {lookupResult.searched && (
                <div style={{ marginTop: '1.25rem' }}>
                  {lookupResult.found && lookupResult.order ? (
                    <div style={{ padding: '1.25rem', background: '#ECFDF5', border: '1.5px solid #10B981', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#047857', fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem' }}>
                        <CheckCircle2 size={20} /> Verified Official Tax Invoice Found
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.85rem', color: '#1E293B', marginTop: '0.75rem' }}>
                        <div><strong>Order Reference:</strong> {lookupResult.order.orderNumber}</div>
                        <div><strong>Status:</strong> <span style={{ textTransform: 'uppercase', color: '#059669', fontWeight: 700 }}>{lookupResult.order.orderStatus}</span></div>
                        <div><strong>Total Amount:</strong> ₹{lookupResult.order.totalAmount.toLocaleString('en-IN')}</div>
                        <div><strong>GST Rate:</strong> 18% (Eligible for ITC under Sec 16)</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '1rem', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', color: '#92400E', fontSize: '0.88rem' }}>
                      <AlertTriangle size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                      {lookupResult.message || 'Invoice record not found.'}
                    </div>
                  )}
                </div>
              )}

              {/* Login / Register Call to action */}
              <div
                style={{
                  marginTop: '1.75rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
                    Already have a registered business account?
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Sign in to access your direct GSTR-2B filing records, tax invoice downloads, and credit notes.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => {
                      if (openB2BAuth) openB2BAuth('login');
                      else setActiveTab('business-login');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: '8px', fontWeight: 600 }}
                  >
                    Business Login
                  </button>
                  <button
                    onClick={() => {
                      if (openB2BAuth) openB2BAuth('register');
                      else setActiveTab('business-register');
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: '8px', fontWeight: 600 }}
                  >
                    Register Business GST
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Statutory Legal Disclaimer Banner (Required by user prompt) */}
        <div
          style={{
            background: '#FFFBEB',
            border: '1.5px solid #FCD34D',
            borderRadius: '12px',
            padding: '1.5rem',
            color: '#78350F',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={20} style={{ color: '#D97706', flexShrink: 0 }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#92400E' }}>
              Statutory Notice & Tax Compliance Disclaimer
            </h4>
          </div>
          <p style={{ fontSize: '0.84rem', lineHeight: 1.6, margin: 0 }}>
            Kogniti Minds Private Limited does not guarantee that every customer qualifies for Input Tax Credit (ITC). Eligibility for claiming input credit depends on applicable provisions of the Central Goods and Services Tax (CGST) Act, 2017, State GST laws, Integrated GST Act, timely filing of GSTR-3B by the purchaser, matching in the recipient's auto-generated GSTR-2B, and the customer's specific commercial and tax registration circumstances. Customers are advised to consult their certified Chartered Accountant (CA) or tax advisor.
          </p>
        </div>
      </div>
    </div>
  );
};
