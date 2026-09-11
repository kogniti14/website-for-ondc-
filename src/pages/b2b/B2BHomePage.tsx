import React from 'react';
import {
  Building2,
  FileText,
  ShieldCheck,
  Truck,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Layers,
  Sparkles,
  PhoneCall,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';

interface B2BHomePageProps {
  products: Product[];
  setB2bTab: (tab: string) => void;
  openB2BAuthModal: () => void;
  onOpenProduct: (product: Product) => void;
}

export const B2BHomePage: React.FC<B2BHomePageProps> = ({
  products,
  setB2bTab,
  openB2BAuthModal,
  onOpenProduct,
}) => {
  const { role, b2bBusiness } = useAuth();
  const isApproved = role === 'b2b' && b2bBusiness?.status === 'approved';

  return (
    <div style={{ backgroundColor: '#0A0F1D', color: '#E2E8F0', minHeight: '100vh' }}>
      {/* 1. B2B Corporate Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '5rem 0 5.5rem',
          background: 'radial-gradient(ellipse at top, #1E293B 0%, #0A0F1D 70%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <div
              className="inline-flex items-center gap-2"
              style={{
                background: 'rgba(217, 119, 6, 0.15)',
                border: '1px solid rgba(217, 119, 6, 0.3)',
                padding: '0.35rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                color: '#FBBF24',
                fontWeight: 700,
                marginBottom: '1.25rem',
              }}
            >
              <Building2 size={14} /> Institutional & Wholesale Division
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.3rem, 5vw, 3.8rem)',
                fontWeight: 800,
                lineHeight: '1.15',
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                marginBottom: '1.25rem',
              }}
            >
              Exclusive B2B Deals for Businesses
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                lineHeight: '1.6',
                color: '#94A3B8',
                marginBottom: '2.5rem',
                maxWidth: '680px',
                margin: '0 auto 2.5rem',
              }}
            >
              Bulk purchasing made simple, transparent and efficient. Direct manufacturer wholesale pricing, tiered volume discount slabs, and 100% GST input tax credit for institutions.
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-4 flex-wrap" style={{ marginBottom: '3rem' }}>
              {isApproved ? (
                <button
                  onClick={() => setB2bTab('catalog')}
                  className="btn btn-amber btn-lg"
                  style={{ borderRadius: 'var(--radius-full)', padding: '0.85rem 2rem' }}
                >
                  Browse Wholesale Catalog <ArrowRight size={18} />
                </button>
              ) : (
                <>
                  <button
                    onClick={openB2BAuthModal}
                    className="btn btn-amber btn-lg"
                    style={{ borderRadius: 'var(--radius-full)', padding: '0.85rem 2rem' }}
                  >
                    Register as a Business <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={openB2BAuthModal}
                    className="btn btn-outline"
                    style={{
                      borderRadius: 'var(--radius-full)',
                      color: '#FFFFFF',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      background: 'transparent',
                      padding: '0.85rem 1.75rem',
                    }}
                  >
                    Login to B2B Portal
                  </button>
                </>
              )}

              <button
                onClick={() => setB2bTab('rfq')}
                className="btn btn-lg"
                style={{
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1.5px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  padding: '0.85rem 1.75rem',
                }}
              >
                <FileText size={18} className="text-amber-400" /> Request a Custom Quote
              </button>
            </div>

            {/* Pillar Grid Strip */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.25rem',
                paddingTop: '2.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'left',
              }}
            >
              <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                <div style={{ color: '#38BDF8', fontWeight: 800, fontSize: '1.25rem' }}>Wholesale Slabs</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Tiered volume pricing up to 28% off</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                <div style={{ color: '#34D399', fontWeight: 800, fontSize: '1.25rem' }}>100% GST Credit</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Official invoices with buyer GSTIN</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                <div style={{ color: '#FBBF24', fontWeight: 800, fontSize: '1.25rem' }}>Net 30 Terms</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Approved credit lines against PO</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                <div style={{ color: '#C084FC', fontWeight: 800, fontSize: '1.25rem' }}>Key Account Mgr</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Dedicated single point of contact</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Institutional Client Segments */}
      <section style={{ padding: '4.5rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem' }}>
            <span
              style={{
                color: '#60A5FA',
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Who We Serve
            </span>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.35rem' }}>
              Tailored Solutions for Every Sector
            </h2>
          </div>

          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(37, 99, 235, 0.2)',
                  color: '#60A5FA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Building2 size={22} />
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Corporate Offices & IT
              </h4>
              <p style={{ color: '#94A3B8', fontSize: '0.82rem', lineHeight: '1.6' }}>
                Eco-friendly printing paper reams, executive notebooks, document files, letterheads, and customized corporate stationery.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Award size={22} />
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Schools, Colleges & EdTech
              </h4>
              <p style={{ color: '#94A3B8', fontSize: '0.82rem', lineHeight: '1.6' }}>
                Annual bulk exam answer booklets, project paper, student notebooks, laboratory record sheets, and sustainable classroom supplies.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#FBBF24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Layers size={22} />
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Co-Working & Real Estate
              </h4>
              <p style={{ color: '#94A3B8', fontSize: '0.82rem', lineHeight: '1.6' }}>
                High-capacity eco-paper reams, branded onboarding hampers, sustainable desk caddies, and recycled kraft presentation folders.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(147, 51, 234, 0.2)',
                  color: '#C084FC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Users size={22} />
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Bulk Resellers & Distributors
              </h4>
              <p style={{ color: '#94A3B8', fontSize: '0.82rem', lineHeight: '1.6' }}>
                Tiered distribution discounts, neutral drop-shipping options, high margins, and priority inventory allocation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Wholesale Catalog Preview */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div className="flex items-center justify-between gap-4" style={{ marginBottom: '2.5rem' }}>
            <div>
              <span style={{ color: '#FBBF24', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Wholesale Showcase
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.25rem' }}>
                Sustainable Paper & Supplies Ready for Bulk Dispatch
              </h2>
            </div>

            <button
              onClick={() => setB2bTab('catalog')}
              className="btn btn-outline-b2b hide-on-mobile"
              style={{
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Full Wholesale Catalog <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {products.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => onOpenProduct(p)}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    backgroundColor: '#1E293B',
                    marginBottom: '1rem',
                  }}
                >
                  <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <span style={{ fontSize: '0.72rem', color: '#60A5FA', fontWeight: 700, marginBottom: '0.3rem' }}>
                  {p.category}
                </span>
                <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: '1.3' }}>
                  {p.name}
                </h4>

                <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  {isApproved ? (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38BDF8' }}>
                          ₹{p.b2bWholesalePrice.toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>/ unit (excl. GST)</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#FBBF24', marginTop: '0.2rem' }}>
                        MOQ: {p.b2bMoq} units • Slabs up to {p.b2bDiscountSlabs[p.b2bDiscountSlabs.length - 1]?.discountPercent}% off
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Lock size={13} className="text-amber-400" />
                      <span>Wholesale Pricing Locked</span>
                    </div>
                  )}

                  <div className="flex gap-2" style={{ marginTop: '0.75rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setB2bTab('rfq');
                      }}
                      className="btn btn-amber btn-sm flex-1"
                      style={{ fontSize: '0.78rem' }}
                    >
                      Request Quote
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProduct(p);
                      }}
                      className="btn btn-sm"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#FFF',
                        fontSize: '0.78rem',
                      }}
                    >
                      Specs
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Verification Workflow Infographic */}
      <section style={{ padding: '4rem 0 6rem', background: '#0F172A', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
            <span style={{ color: '#34D399', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Simple 3-Step Onboarding
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.25rem' }}>
              How Institutional Accounts Work
            </h2>
          </div>

          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '2rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'rgba(37, 99, 235, 0.2)',
                  color: '#60A5FA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  border: '1px solid rgba(37, 99, 235, 0.4)',
                }}
              >
                1
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Register with GSTIN
              </h4>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Provide your 15-digit GST number, organization name, and authorized contact details.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#FBBF24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                }}
              >
                2
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                24-Hour Desk Verification
              </h4>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Our corporate team verifies GST active status and assigns your dedicated Key Account Manager.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                }}
              >
                3
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Order with Net Credit & Slabs
              </h4>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Unlock wholesale volume discounts, submit RFQs, upload POs, and claim 100% GST Input Tax Credit.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
