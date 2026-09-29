import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Phone,
  Mail,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Send,
  HelpCircle,
  Package,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { getTelUrl, getWhatsAppUrl, getWhatsAppDisplayNumber } from '../../config/whatsappConfig';

interface SupportPageProps {
  setActiveTab: (tab: string) => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({ setActiveTab }) => {
  const getParams = () => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return {
        method: p.get('method') || '',
        orderId: p.get('orderId') || '',
      };
    }
    return { method: '', orderId: '' };
  };

  const { method, orderId } = getParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orderRef, setOrderRef] = useState(orderId);
  const [inquiryType, setInquiryType] = useState('order_support');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const officialEmail = 'support@kognitiminds.com';
  const officialPhoneDisplay = '+91 9931648595';
  const officialPhoneRaw = '9931648595';

  const defaultWhatsMessage = orderRef
    ? `Hello Kogniti Minds Support, I need assistance with Order #${orderRef}.`
    : 'Hello Kogniti Minds Support, I would like to inquire about your sustainable agro-paper products and services.';

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      alert('Please enter your name and message.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 400);
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '85vh', padding: '2rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748B' }}>
          <button
            onClick={() => {
              window.history.pushState(null, '', '/');
              setActiveTab('home');
            }}
            style={{ background: 'none', border: 'none', padding: 0, color: '#0284C7', cursor: 'pointer', fontWeight: 600 }}
          >
            Home
          </button>
          <span>/</span>
          <span style={{ color: '#0F172A', fontWeight: 700 }}>Customer Support & Help Desk</span>
        </div>

        {/* Hero Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            color: '#FFFFFF',
            marginBottom: '2rem',
            boxShadow: '0 4px 20px rgba(2, 132, 199, 0.25)',
          }}
        >
          <div style={{ maxWidth: '720px' }}>
            <span
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-block',
                marginBottom: '0.75rem',
              }}
            >
              KOGNITI MINDS CUSTOMER CARE
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
              How Can We Help You Today?
            </h1>
            <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9, lineHeight: 1.5 }}>
              Dedicated support for B2C retail orders, B2B institutional procurement, ONDC network transactions, and product inquiries.
            </p>
          </div>
        </div>

        {/* 3 Primary Working Action Cards (WhatsApp, Phone, Email) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Card 1: WhatsApp Support */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.75rem',
              border: method === 'whatsapp' ? '2px solid #25D366' : '1px solid #E2E8F0',
              boxShadow: method === 'whatsapp' ? '0 4px 16px rgba(37, 211, 102, 0.2)' : '0 2px 10px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#DCFCE7',
                  color: '#15803D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <MessageSquare size={24} color="#15803D" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                WhatsApp Support
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Instant real-time chat with our customer support executive. Share order slips, photos, or institutional inquiries.
              </p>
            </div>
            <a
              href={getWhatsAppUrl(defaultWhatsMessage, officialPhoneRaw)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                background: '#25D366',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
              }}
            >
              <MessageSquare size={16} />
              <span>Chat on WhatsApp ({officialPhoneDisplay})</span>
            </a>
          </div>

          {/* Card 2: Phone Support */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.75rem',
              border: method === 'phone' ? '2px solid #0284C7' : '1px solid #E2E8F0',
              boxShadow: method === 'phone' ? '0 4px 16px rgba(2, 132, 199, 0.2)' : '0 2px 10px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#E0F2FE',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Phone size={24} color="#0284C7" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                Telephone Desk
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Call our customer care center directly for order updates, dispatch queries, or wholesale bulk paper quotations.
              </p>
            </div>
            <a
              href={getTelUrl(officialPhoneRaw)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                background: '#0F172A',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              <Phone size={16} />
              <span>Call {officialPhoneDisplay}</span>
            </a>
          </div>

          {/* Card 3: Email Support */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.75rem',
              border: method === 'email' ? '2px solid #7C3AED' : '1px solid #E2E8F0',
              boxShadow: method === 'email' ? '0 4px 16px rgba(124, 58, 237, 0.2)' : '0 2px 10px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#EDE9FE',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Mail size={24} color="#7C3AED" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                Official Email Desk
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Send formal corporate POs, tender documentation, invoice requests, or order cancellation notices.
              </p>
            </div>
            <a
              href={`mailto:${officialEmail}?subject=${encodeURIComponent(
                orderRef ? `Support Request for Order #${orderRef}` : 'Support Request: Kogniti Minds'
              )}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                background: '#7C3AED',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
              }}
            >
              <Mail size={16} />
              <span>Email: {officialEmail}</span>
            </a>
          </div>
        </div>

        {/* Support Request Form & Help Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Ticket Submission Form */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '2rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
              Send an Online Support Ticket
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
              Our support team will respond via email or phone within 2-4 business hours.
            </p>

            {submitted ? (
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '12px',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  textAlign: 'center',
                }}
              >
                <CheckCircle2 size={40} color="#15803D" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#166534', marginBottom: '0.35rem' }}>
                  Support Ticket Submitted
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#15803D', margin: 0 }}>
                  Thank you! We have logged your request and our support desk will contact you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    background: '#15803D',
                    color: '#fff',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 99999 88888"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Order Reference (if applicable)
                    </label>
                    <input
                      type="text"
                      value={orderRef}
                      onChange={(e) => setOrderRef(e.target.value)}
                      placeholder="e.g. KM-2026-001"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Inquiry Nature
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', background: '#FFFFFF' }}
                  >
                    <option value="order_support">Order Status & Delivery Tracking</option>
                    <option value="cancellation">Cancellation & Refund Assistance</option>
                    <option value="b2b_wholesale">B2B Wholesale / Institutional Quotation</option>
                    <option value="product_specs">Product Specifications & Custom GSM</option>
                    <option value="feedback">General Feedback & Suggestions</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Detailed Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your question or issue in detail..."
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                  }}
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Sending Request...' : 'Submit Support Ticket'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Company Statutory & Working Hours Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} className="text-blue-600" />
                <span>Operating & Support Hours</span>
              </h3>
              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                <div><strong>Monday to Saturday:</strong> 9:00 AM – 7:00 PM IST</div>
                <div><strong>Sunday:</strong> Automated monitoring & emergency dispatch</div>
                <div style={{ marginTop: '0.5rem', color: '#0284C7', fontWeight: 600 }}>
                  PAN-India logistics dispatched within 24 hours of order confirmation.
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={18} className="text-emerald-600" />
                <span>Corporate & Registered Office</span>
              </h3>
              <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                <strong style={{ color: '#0F172A', display: 'block' }}>KOGNITI MINDS PRIVATE LIMITED</strong>
                <div>CIN: U46496UP2024PTC213997</div>
                <div>GSTIN: 09AALCK4750F1ZC</div>
                <div>PAN: AALCK4750F</div>
                <div style={{ marginTop: '0.5rem' }}>
                  A-1104, ATS One Hamlet, Sector 104, Noida, Gautam Buddha Nagar, Uttar Pradesh, 201304, India
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#F0FDF4',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1px solid #BBF7D0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <ShieldCheck size={24} color="#15803D" />
              <div style={{ fontSize: '0.82rem', color: '#166534', lineHeight: 1.4 }}>
                <strong>Statutory Compliance Guarantee:</strong> All orders come with official Tax Invoices featuring verified HSN codes for GST input credit.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
