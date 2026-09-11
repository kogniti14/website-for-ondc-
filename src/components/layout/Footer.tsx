import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
  Building2,
  Tag,
} from 'lucide-react';
import { storageService } from '../../services/storageService';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  openPolicyModal: (type: 'privacy' | 'terms' | 'shipping' | 'refund') => void;
  isB2B?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, openPolicyModal, isB2B = false }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    }
  };

  return (
    <footer style={{ backgroundColor: 'var(--slate-900)', color: '#94A3B8', marginTop: '4rem' }}>
      {/* Value Proposition Highlights Banner */}
      <div
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '2.5rem 0',
          background: 'rgba(15, 23, 42, 0.7)',
        }}
      >
        <div className="container">
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {isB2B ? (
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34D399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Tag size={24} />
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>
                    DIRECT MANUFACTURER PRICING
                  </div>
                  <div style={{ fontSize: '0.78rem' }}>Factory-Direct Rates For Institutions</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'rgba(37, 99, 235, 0.15)',
                    color: '#60A5FA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Truck size={24} />
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>
                    FREE PAN-INDIA DELIVERY
                  </div>
                  <div style={{ fontSize: '0.78rem' }}>On Orders Above ₹1,999</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34D399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>
                  100% GENUINE PRODUCTS
                </div>
                <div style={{ fontSize: '0.78rem' }}>GST Invoice Available with Input Credit</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#FBBF24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <RotateCcw size={24} />
              </div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>
                  7-Day Replacement
                </div>
                <div style={{ fontSize: '0.78rem' }}>Hassle-free verified support</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(147, 51, 234, 0.15)',
                  color: '#C084FC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Building2 size={24} />
              </div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>
                  B2B & INSTITUTIONAL ENQUIRIES
                </div>
                <div style={{ fontSize: '0.78rem' }}>
                  <a href="tel:+919931648595" style={{ color: '#A5B4FC', fontWeight: 600 }}>
                    +91 9931648595
                  </a>{' '}
                  | sales@kognitiminds.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container" style={{ padding: '3.5rem 1.25rem 2.5rem' }}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand Col */}
          <div style={{ maxWidth: '320px' }}>
            <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                }}
              >
                <img
                  src={storageService.getSiteMedia()?.logo || '/logo.png'}
                  alt="Kogniti Minds"
                  style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
                />
              </div>
              <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.2rem' }}>
                KOGNITI MINDS
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1.2rem', color: '#94A3B8' }}>
              Kogniti Minds Private Limited is an Indian manufacturer pioneering the transformation of agricultural waste into next-generation paper products. We combine material innovation with responsible manufacturing to create quality paper solutions that give agricultural residue a new purpose serving consumers, businesses, institutions, and organizations across India.
            </p>
            <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.6' }}>
              <div><strong>CIN:</strong> U46496UP2024PTC213997</div>
              <div><strong>PAN:</strong> AALCK4750F</div>
              <div style={{ marginTop: '0.25rem' }}>
                <strong>GSTIN (Uttar Pradesh):</strong> 09AALCK4750F1ZC<br />
                <strong>GSTIN (Bihar):</strong> 10AALCK4750F1ZT
              </div>
            </div>

            <div
              style={{
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: '#CBD5E1',
                  marginBottom: '0.5rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Available On Official Platforms
              </div>
              <img
                src="/available-on-hero.png"
                alt="Available on GeM (Government e-Marketplace) and ONDC (Open Network for Digital Commerce)"
                style={{
                  height: '46px',
                  width: 'auto',
                  display: 'block',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>

          {/* Quick Links B2C */}
          <div>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>
              Consumer Store
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li>
                <button onClick={() => setActiveTab('products')} style={{ color: '#94A3B8' }}>
                  All Products
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('shop')} style={{ color: '#94A3B8' }}>
                  Shop Deals & Offers
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('orders')} style={{ color: '#94A3B8' }}>
                  Track Order Status
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('wishlist')} style={{ color: '#94A3B8' }}>
                  Saved Wishlist
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('cart')} style={{ color: '#94A3B8' }}>
                  Shopping Cart
                </button>
              </li>
            </ul>
          </div>

          {/* B2B & Wholesale */}
          <div>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>
              B2B & Institutional
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li>
                <button onClick={() => setActiveTab('b2b')} style={{ color: '#60A5FA', fontWeight: 600 }}>
                  Enter B2B Portal
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('b2b')} style={{ color: '#94A3B8' }}>
                  Wholesale Slabs & Pricing
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('b2b')} style={{ color: '#94A3B8' }}>
                  Request Commercial RFQ
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('b2b')} style={{ color: '#94A3B8' }}>
                  GST Input Tax Credit
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('b2b')} style={{ color: '#94A3B8' }}>
                  Institutional & School Paper Supplies
                </button>
              </li>
            </ul>
          </div>

          {/* Policies & Contact */}
          <div>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>
              Policies & Support
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              <li>
                <button onClick={() => openPolicyModal('privacy')} style={{ color: '#94A3B8' }}>
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => openPolicyModal('terms')} style={{ color: '#94A3B8' }}>
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => openPolicyModal('shipping')} style={{ color: '#94A3B8' }}>
                  Shipping & Logistics Policy
                </button>
              </li>
              <li>
                <button onClick={() => openPolicyModal('refund')} style={{ color: '#94A3B8' }}>
                  Return & Refund Policy
                </button>
              </li>
            </ul>

            <div style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-blue-400" /> <span>Support: <a href="mailto:support@kognitiminds.com" style={{ color: '#E2E8F0', textDecoration: 'underline' }}>support@kognitiminds.com</a></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-amber-400" /> <span>Sales & B2B: <a href="mailto:sales@kognitiminds.com" style={{ color: '#E2E8F0', textDecoration: 'underline' }}>sales@kognitiminds.com</a></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-emerald-400" /> <span>Accounts & Billing: <a href="mailto:accounts@kognitiminds.com" style={{ color: '#E2E8F0', textDecoration: 'underline' }}>accounts@kognitiminds.com</a></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-emerald-400" /> <span>Enquiries / Helpline: <a href="tel:+919931648595" style={{ color: '#F1F5F9', fontWeight: 600 }}>+91 9931648595</a></span>
              </div>
              <div className="flex items-start gap-2" style={{ marginTop: '0.35rem' }}>
                <MapPin size={14} className="text-amber-400" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#CBD5E1', fontWeight: 700 }}>Registered Office (Uttar Pradesh):</div>
                  <span>Panchsheel Greens-2, Sec-16 B, Gr. Noida West, Bisrakh, Bishrakh, Gautam Buddha Nagar, Uttar Pradesh, India - 201306</span>
                </div>
              </div>
              <div className="flex items-start gap-2" style={{ marginTop: '0.35rem' }}>
                <MapPin size={14} className="text-emerald-400" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#CBD5E1', fontWeight: 700 }}>Branch / Operational Office (Bihar):</div>
                  <span>4th Floor, VBSS New Building, Bihiya Chaurasta, Bhojpur (Bihar) - 802154</span>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Box */}
          <div>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              Stay Updated
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1rem' }}>
              Subscribe for sustainable paper innovations, institutional supply updates, and exclusive bulk discount announcements.
            </p>
            <form onSubmit={handleSubscribe}>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  placeholder="Enter corporate or personal email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="form-input"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    paddingRight: '45px',
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    position: 'absolute',
                    right: '3px',
                    top: '3px',
                    bottom: '3px',
                    padding: '0 0.8rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                  title="Subscribe"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
            {newsletterSubscribed && (
              <div
                className="flex items-center gap-1"
                style={{ color: '#34D399', fontSize: '0.78rem', marginTop: '0.5rem' }}
              >
                <CheckCircle2 size={13} /> Thank you! You are now subscribed to Kogniti Minds updates.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Strip */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.78rem',
            color: '#64748B',
          }}
        >
          <div>
            © {new Date().getFullYear()} Kogniti Minds Private Limited. All Rights Reserved. Built for Indian Individuals & Enterprises.
          </div>

          {/* Official Commerce Channels */}
          <div className="flex items-center gap-2" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Available On:</span>
            <img
              src="/gem-ondc-logos.png"
              alt="GeM & ONDC Network"
              style={{ height: '28px', width: 'auto', display: 'block', objectFit: 'contain' }}
            />
          </div>

          {/* Payment Methods */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Secure Indian Payments:</span>
            <span style={{ background: '#1E293B', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#E2E8F0', fontWeight: 700 }}>UPI</span>
            <span style={{ background: '#1E293B', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#E2E8F0', fontWeight: 700 }}>RuPay</span>
            <span style={{ background: '#1E293B', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#E2E8F0', fontWeight: 700 }}>Visa</span>
            <span style={{ background: '#1E293B', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#E2E8F0', fontWeight: 700 }}>Mastercard</span>
            <span style={{ background: '#1E293B', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#E2E8F0', fontWeight: 700 }}>NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
