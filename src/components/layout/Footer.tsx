import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
  Building2,
  Tag,
  ExternalLink,
  FileText,
  Sparkles,
  Award,
  Leaf,
  Send,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { dataSyncBus } from '../../services/dataSyncBus';
import { companyMasterService } from '../../services/companyMasterService';
import { SiteMedia } from '../../types';
import { getTelUrl, getWhatsAppUrl, getWhatsAppDisplayNumber } from '../../config/whatsappConfig';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  setB2bTab?: (tab: string) => void;
  openPolicyModal: (type: 'privacy' | 'terms' | 'shipping' | 'refund') => void;
  isB2B?: boolean;
  onNavigateToShop?: () => void;
  onOpenOndcModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  setB2bTab,
  openPolicyModal,
  isB2B = false,
  onNavigateToShop,
  onOpenOndcModal,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');
  const [siteMedia, setSiteMedia] = useState<SiteMedia>(() => storageService.getSiteMedia());
  const [companyMaster, setCompanyMaster] = useState(() => companyMasterService.getCompanyMaster());

  useEffect(() => {
    const unsubMedia = dataSyncBus.subscribe('site_media', (m) => {
      if (m) setSiteMedia(m);
    });
    const unsubMaster = companyMasterService.subscribe((m) => {
      setCompanyMaster(m);
    });
    return () => {
      unsubMedia();
      unsubMaster();
    };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email) return;

    // Standard email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setNewsletterError('Please enter a valid corporate or personal email address.');
      return;
    }

    setNewsletterError('');
    try {
      // Save subscription in localStorage for persistent verified state
      const existing = JSON.parse(localStorage.getItem('km_newsletter_subscribers') || '[]');
      if (!existing.includes(email)) {
        existing.push(email);
        localStorage.setItem('km_newsletter_subscribers', JSON.stringify(existing));
      }
    } catch {
      // Local fallback
    }

    setNewsletterSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSubscribed(false), 6000);
  };

  const navigateTo = (tab: string, b2bSubTab?: string) => {
    if (b2bSubTab && setB2bTab) {
      setB2bTab(b2bSubTab);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        backgroundColor: '#0B2348',
        color: '#94A3B8',
        marginTop: '0',
        position: 'relative',
        borderTop: '1px solid rgba(32, 196, 232, 0.2)',
      }}
    >
      {/* Decorative Brand Accent Line */}
      <div
        style={{
          height: '3px',
          width: '100%',
          background: 'linear-gradient(90deg, #0875E1 0%, #20C4E8 50%, #0875E1 100%)',
        }}
        aria-hidden="true"
      />

      {/* Service Highlights & Value Proposition Banner */}
      <div
        style={{
          borderBottom: '1px solid rgba(213, 231, 245, 0.1)',
          padding: '2.25rem 0',
          background: 'rgba(16, 45, 85, 0.65)',
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
                    background: 'rgba(32, 196, 232, 0.15)',
                    color: '#20C4E8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid rgba(32, 196, 232, 0.3)',
                  }}
                >
                  <Tag size={22} />
                </div>
                <div>
                  <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.92rem' }}>
                    DIRECT MANUFACTURER PRICING
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>
                    Factory-Direct Rates For Institutions
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'rgba(8, 117, 225, 0.15)',
                    color: '#20C4E8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid rgba(8, 117, 225, 0.3)',
                  }}
                >
                  <Truck size={22} />
                </div>
                <div>
                  <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.92rem' }}>
                    FREE PAN-INDIA DELIVERY
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>
                    On Orders Above ₹1,999
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(32, 196, 232, 0.15)',
                  color: '#20C4E8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid rgba(32, 196, 232, 0.3)',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <div>
                <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.92rem' }}>
                  100% GENUINE PRODUCTS
                </div>
                <div style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>
                  GST Invoices with 18% Input Tax Credit
                </div>
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
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                <RotateCcw size={22} />
              </div>
              <div>
                <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.92rem' }}>
                  7-Day Replacement
                </div>
                <div style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>
                  Hassle-free verified customer support
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(8, 117, 225, 0.15)',
                  color: '#60A5FA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid rgba(8, 117, 225, 0.3)',
                }}
              >
                <Building2 size={22} />
              </div>
              <div>
                <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.92rem' }}>
                  B2B & INSTITUTIONAL DESK
                </div>
                <div style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>
                  <a href={getTelUrl()} style={{ color: '#93C5FD', fontWeight: 600 }}>
                    {getWhatsAppDisplayNumber()}
                  </a>{' '}
                  |{' '}
                  <a
                    href={getWhatsAppUrl('Hello Kogniti Minds, I have a B2B & Institutional Enquiry.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#86EFAC', fontWeight: 600 }}
                  >
                    WhatsApp Chat
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 5-Column Navigation Section */}
      <div className="container" style={{ padding: '3.5rem 1.25rem 2.5rem' }}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Column A — Company */}
          <div style={{ maxWidth: '320px' }}>
            <div className="flex items-center gap-3 brand-logo-container" style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '10px',
                  padding: '4px 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                }}
              >
                <img
                  key={siteMedia?.logo || '/logo.png'}
                  src={siteMedia?.logo || '/logo.png'}
                  alt="Kogniti Minds Logo"
                  className="kogniti-brand-logo"
                  style={{ height: '36px', width: 'auto' }}
                />
              </div>
              <div>
                <div style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.01em' }}>
                  KOGNITI MINDS
                </div>
                <div style={{ color: '#20C4E8', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em' }}>
                  PRIVATE LIMITED
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#20C4E8',
                marginBottom: '0.75rem',
                background: 'rgba(32, 196, 232, 0.1)',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                border: '1px solid rgba(32, 196, 232, 0.25)',
              }}
            >
              <Leaf size={13} />
              <span>From Farm Waste to Future-Ready Paper.</span>
            </div>

            <p style={{ fontSize: '0.84rem', lineHeight: '1.6', marginBottom: '1rem', color: '#CBD5E1' }}>
              Kogniti Minds Private Limited is an Indian sustainable paper manufacturing enterprise pioneering the conversion of agricultural waste (crop residue) into premium, 100% tree-free paper products for individuals, businesses, and institutions across India.
            </p>

            {/* Official Business & Government Ecosystem Badges */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
              aria-label="Government and Business Ecosystem Recognition"
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '0.74rem',
                  color: '#FFFFFF',
                  fontWeight: 600,
                }}
              >
                <img
                  src="/official-make-in-india-seal.png?v=20261002"
                  alt="Make in India"
                  style={{ height: '20px', width: 'auto', display: 'block' }}
                />
                <span>Make in India</span>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '0.74rem',
                  color: '#FFFFFF',
                  fontWeight: 600,
                }}
              >
                <img
                  src="/official-msme-gov-logo.png?v=20261002"
                  alt="Ministry of MSME / Udyam"
                  style={{ height: '18px', width: 'auto', display: 'block' }}
                />
                <span>MSME / Udyam</span>
              </div>
            </div>

            {/* Official Social Media & Helpline Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
              <a
                href="https://www.linkedin.com/company/kognitiminds/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#93C5FD',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#20C4E8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#93C5FD')}
              >
                <ExternalLink size={13} /> Official LinkedIn Company Page
              </a>
              <a
                href={getWhatsAppUrl('Hello Kogniti Minds, I would like to connect.')}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#86EFAC',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 600,
                  transition: 'color 0.15s ease',
                }}
              >
                <span>💬</span> WhatsApp Business Desk ({getWhatsAppDisplayNumber()})
              </a>
              <a
                href="mailto:support@kognitiminds.com"
                style={{
                  color: '#CBD5E1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Mail size={13} className="text-blue-400" /> support@kognitiminds.com
              </a>
            </div>
          </div>

          {/* Column B — Quick Links */}
          <div>
            <div
              style={{
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.96rem',
                marginBottom: '1rem',
                letterSpacing: '0.02em',
                borderBottom: '2px solid #20C4E8',
                display: 'inline-block',
                paddingBottom: '0.25rem',
              }}
            >
              Quick Links
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.86rem' }}>
              <li>
                <button
                  onClick={() => navigateTo('home')}
                  style={{ color: '#CBD5E1', textAlign: 'left', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#20C4E8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('products')}
                  style={{ color: '#CBD5E1', textAlign: 'left', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#20C4E8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onNavigateToShop) onNavigateToShop();
                    else navigateTo('shop');
                  }}
                  style={{ color: '#20C4E8', fontWeight: 600, textAlign: 'left', transition: 'color 0.15s ease' }}
                >
                  Shop Now
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('deals')}
                  style={{ color: '#FBBF24', fontWeight: 600, textAlign: 'left', transition: 'color 0.15s ease' }}
                >
                  🔥 Deals & Offers
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('success-stories')}
                  style={{ color: '#34D399', fontWeight: 600, textAlign: 'left', transition: 'color 0.15s ease' }}
                >
                  ✨ Success Stories
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('certifications')}
                  style={{ color: '#6EE7B7', fontWeight: 600, textAlign: 'left', transition: 'color 0.15s ease' }}
                >
                  🏆 Official Certifications
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('track')}
                  style={{ color: '#CBD5E1', textAlign: 'left', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#20C4E8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
                >
                  Track Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('support')}
                  style={{ color: '#CBD5E1', textAlign: 'left', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#20C4E8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
                >
                  Support Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Column C — Business Solutions */}
          <div>
            <div
              style={{
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.96rem',
                marginBottom: '1rem',
                letterSpacing: '0.02em',
                borderBottom: '2px solid #0875E1',
                display: 'inline-block',
                paddingBottom: '0.25rem',
              }}
            >
              Business Solutions
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.86rem' }}>
              <li>
                <button
                  onClick={() => navigateTo('b2b-deals')}
                  style={{ color: '#F59E0B', fontWeight: 600, textAlign: 'left' }}
                >
                  ⚡ B2B Deals & Wholesale
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('gst-input-credit')}
                  style={{ color: '#34D399', fontWeight: 600, textAlign: 'left' }}
                >
                  🧾 GST Input Credit for Businesses
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('rfq', 'rfq')}
                  style={{ color: '#FCD34D', fontWeight: 600, textAlign: 'left' }}
                >
                  📝 Request a Quote (RFQ)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('wholesale-catalog', 'catalog')}
                  style={{ color: '#CBD5E1', textAlign: 'left', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#20C4E8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
                >
                  Wholesale Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('business-login')}
                  style={{ color: '#93C5FD', textAlign: 'left', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#20C4E8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#93C5FD')}
                >
                  Business Login / Register
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('business-dashboard', 'dashboard')}
                  style={{ color: '#CBD5E1', textAlign: 'left', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#20C4E8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
                >
                  Business Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenOndcModal) onOpenOndcModal();
                  }}
                  style={{ color: '#20C4E8', fontWeight: 600, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  🌐 ONDC Live Node Status
                </button>
              </li>
            </ul>
          </div>

          {/* Column D — Company Information */}
          <div>
            <div
              style={{
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.96rem',
                marginBottom: '1rem',
                letterSpacing: '0.02em',
                borderBottom: '2px solid #20C4E8',
                display: 'inline-block',
                paddingBottom: '0.25rem',
              }}
            >
              Company Information
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.86rem', marginBottom: '1.2rem' }}>
              <li>
                <button
                  onClick={() => navigateTo('success-stories')}
                  style={{ color: '#CBD5E1', textAlign: 'left', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#20C4E8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
                >
                  About Us (ESG & Mission)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('support')}
                  style={{ color: '#38BDF8', fontWeight: 600, textAlign: 'left' }}
                >
                  Contact Us (24/7 Desk)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('certifications')}
                  style={{ color: '#CBD5E1', textAlign: 'left', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#20C4E8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
                >
                  Certifications & Standards
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('terms')}
                  style={{ color: '#CBD5E1', textAlign: 'left', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#20C4E8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('privacy')}
                  style={{ color: '#CBD5E1', textAlign: 'left', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#20C4E8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('refund')}
                  style={{ color: '#CBD5E1', textAlign: 'left', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#20C4E8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
                >
                  Refund & Return Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shipping')}
                  style={{ color: '#CBD5E1', textAlign: 'left', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#20C4E8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
                >
                  Shipping Policy
                </button>
              </li>
            </ul>

            {/* Office Locations Summary */}
            <div style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="flex items-start gap-2">
                <MapPin size={13} className="text-amber-400" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <span style={{ color: '#FFFFFF', fontWeight: 600 }}>Registered Office:</span><br />
                  {companyMaster.address_line_1}, {companyMaster.address_line_2}, {companyMaster.city}, {companyMaster.state} - {companyMaster.pincode}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={13} className="text-emerald-400" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <span style={{ color: '#FFFFFF', fontWeight: 600 }}>Branch Office:</span><br />
                  4th Floor, VBSS New Building, Bihiya Chaurasta, Bhojpur (Bihar) - 802154
                </div>
              </div>
            </div>
          </div>

          {/* Column E — Stay Updated (Newsletter) */}
          <div>
            <div
              style={{
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.96rem',
                marginBottom: '0.6rem',
                letterSpacing: '0.02em',
                borderBottom: '2px solid #20C4E8',
                display: 'inline-block',
                paddingBottom: '0.25rem',
              }}
            >
              Stay Updated
            </div>
            <p style={{ fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '1.2rem', lineHeight: '1.5' }}>
              Subscribe for sustainable paper innovations, institutional supply updates, and exclusive bulk discount announcements.
            </p>

            <form onSubmit={handleSubscribe} noValidate>
              <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                <input
                  type="email"
                  placeholder="Enter corporate or personal email"
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (newsletterError) setNewsletterError('');
                  }}
                  required
                  className="form-input"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: newsletterError ? '#F43F5E' : 'rgba(32, 196, 232, 0.3)',
                    color: '#FFFFFF',
                    fontSize: '0.84rem',
                    paddingRight: '48px',
                    borderRadius: '8px',
                  }}
                  aria-label="Corporate or personal email for newsletter subscription"
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    position: 'absolute',
                    right: '3px',
                    top: '3px',
                    bottom: '3px',
                    padding: '0 0.85rem',
                    borderRadius: '6px',
                  }}
                  title="Subscribe to Kogniti Minds Newsletter"
                  aria-label="Subscribe"
                >
                  <Send size={15} />
                </button>
              </div>

              {newsletterError && (
                <div style={{ color: '#FB7185', fontSize: '0.76rem', marginTop: '0.35rem' }}>
                  {newsletterError}
                </div>
              )}

              {newsletterSubscribed && (
                <div
                  className="flex items-center gap-1.5"
                  style={{
                    color: '#34D399',
                    fontSize: '0.8rem',
                    marginTop: '0.6rem',
                    background: 'rgba(16, 185, 129, 0.12)',
                    padding: '0.4rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                  <span>Thank you! You are now subscribed to Kogniti Minds updates.</span>
                </div>
              )}
            </form>

            <div
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 0.85rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.76rem',
                color: '#94A3B8',
              }}
            >
              <div style={{ color: '#FFFFFF', fontWeight: 600, marginBottom: '0.25rem' }}>
                Eco-Friendly Direct Invoicing
              </div>
              <div>
                All deliveries include digital GST e-Invoices with statutory 18% ITC breakdown.
              </div>
            </div>
          </div>
        </div>

        {/* Statutory Corporate Master Identification Strip */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.85rem 1.25rem',
            background: 'rgba(16, 45, 85, 0.5)',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.78rem',
            color: '#CBD5E1',
            border: '1px solid rgba(32, 196, 232, 0.15)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{companyMaster.legal_name}</span>
            <span style={{ color: '#475569' }}>•</span>
            <span>CIN: <code style={{ color: '#93C5FD', fontWeight: 600 }}>{companyMaster.cin}</code></span>
            <span style={{ color: '#475569' }}>•</span>
            <span>PAN: <code style={{ color: '#FDE047', fontWeight: 600 }}>{companyMaster.pan}</code></span>
            <span style={{ color: '#475569' }}>•</span>
            <span>GSTIN: <code style={{ color: '#86EFAC', fontWeight: 600 }}>{companyMaster.gstin}</code> ({companyMaster.gst_state})</span>
            <span style={{ color: '#475569' }}>•</span>
            <span>MSME / Udyam: <code style={{ color: '#38BDF8', fontWeight: 600 }}>Registered MSE</code></span>
          </div>
          <div style={{ color: '#94A3B8', fontSize: '0.74rem' }}>
            Registered Office: {companyMaster.address_line_1}, {companyMaster.address_line_2}, {companyMaster.city}, {companyMaster.state}, {companyMaster.country} - {companyMaster.pincode}
          </div>
        </div>

        {/* Bottom Legal, Highlights & Safe Payments Strip */}
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
            color: '#94A3B8',
          }}
        >
          <div>
            © {new Date().getFullYear()} Kogniti Minds Private Limited. All Rights Reserved. Built for Indian Individuals & Enterprises.
          </div>

          {/* Service Highlights */}
          <div className="flex items-center gap-3" style={{ fontSize: '0.74rem', color: '#CBD5E1' }}>
            <span className="flex items-center gap-1">
              <Leaf size={12} className="text-emerald-400" /> 100% Tree-Free Paper
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Award size={12} className="text-amber-400" /> Make in India &amp; MSME
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FileText size={12} className="text-cyan-400" /> GST Invoices &amp; 18% ITC
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Truck size={12} className="text-blue-400" /> Pan-India Dispatch
            </span>
          </div>

          {/* Secure Indian Payment Badges */}
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginRight: '4px' }}>Secure Payments:</span>
            <span style={{ background: '#102D55', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#E2E8F0', fontWeight: 700, fontSize: '0.72rem', border: '1px solid rgba(255,255,255,0.1)' }}>UPI</span>
            <span style={{ background: '#102D55', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#E2E8F0', fontWeight: 700, fontSize: '0.72rem', border: '1px solid rgba(255,255,255,0.1)' }}>RuPay</span>
            <span style={{ background: '#102D55', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#E2E8F0', fontWeight: 700, fontSize: '0.72rem', border: '1px solid rgba(255,255,255,0.1)' }}>Visa</span>
            <span style={{ background: '#102D55', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#E2E8F0', fontWeight: 700, fontSize: '0.72rem', border: '1px solid rgba(255,255,255,0.1)' }}>Mastercard</span>
            <span style={{ background: '#102D55', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#E2E8F0', fontWeight: 700, fontSize: '0.72rem', border: '1px solid rgba(255,255,255,0.1)' }}>NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
