import React from 'react';
import { X, ShieldCheck, FileText, Truck, RotateCcw } from 'lucide-react';

interface PolicyModalProps {
  type: 'privacy' | 'terms' | 'shipping' | 'refund';
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ type, onClose }) => {
  const getPolicyContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: <ShieldCheck size={24} className="text-emerald-600" />,
          content: (
            <div>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                Kogniti Minds Private Limited ("we", "us", "our") is committed to protecting your privacy in compliance with the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 and applicable Indian laws.
              </p>
              <h4 style={{ fontWeight: 700, margin: '1rem 0 0.5rem' }}>1. Data Collection</h4>
              <p style={{ lineHeight: '1.6', marginBottom: '0.75rem' }}>
                We collect personal information such as name, shipping address, billing address, phone number, email address, and (for business accounts) organization name, GSTIN, PAN, and corporate documents for tax compliance and order fulfillment.
              </p>
              <h4 style={{ fontWeight: 700, margin: '1rem 0 0.5rem' }}>2. Use of Information</h4>
              <p style={{ lineHeight: '1.6', marginBottom: '0.75rem' }}>
                Information is strictly used for order processing, logistics coordination with courier partners (Delhivery, Blue Dart), issuing statutory GST tax invoices, and providing post-delivery warranty support. We never sell customer or corporate transaction records to third parties.
              </p>
              <h4 style={{ fontWeight: 700, margin: '1rem 0 0.5rem' }}>3. Data Security</h4>
              <p style={{ lineHeight: '1.6' }}>
                All payment transactions are encrypted using 256-bit SSL protocols. We do not store complete credit card or debit card numbers on our servers; payments are processed directly through licensed Indian payment aggregators.
              </p>
            </div>
          ),
        };
      case 'terms':
        return {
          title: 'Terms & Conditions',
          icon: <FileText size={24} className="text-blue-600" />,
          content: (
            <div>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                Welcome to Kogniti Minds Private Limited. By accessing our B2C store or B2B enterprise portal, you agree to be bound by these Terms of Service and all applicable Indian statutory guidelines.
              </p>
              <h4 style={{ fontWeight: 700, margin: '1rem 0 0.5rem' }}>1. Contract of Sale</h4>
              <p style={{ lineHeight: '1.6', marginBottom: '0.75rem' }}>
                Placement of an order constitutes an offer to purchase. Acceptance occurs when we dispatch the physical goods and transmit the statutory GST invoice containing carrier tracking numbers.
              </p>
              <h4 style={{ fontWeight: 700, margin: '1rem 0 0.5rem' }}>2. B2B Commercial Orders & Quotations</h4>
              <p style={{ lineHeight: '1.6', marginBottom: '0.75rem' }}>
                B2B accounts require verified GSTIN identification. Accepted quotations and Purchase Orders (POs) represent legally binding commercial contracts under the Indian Contract Act, 1872. Net credit payment terms are strictly subject to compliance verification.
              </p>
              <h4 style={{ fontWeight: 700, margin: '1rem 0 0.5rem' }}>3. Jurisdiction</h4>
              <p style={{ lineHeight: '1.6' }}>
                Any legal disputes arising from transactions on this platform shall be subject to the exclusive jurisdiction of the competent courts in Gautam Buddha Nagar, Uttar Pradesh, India.
              </p>
            </div>
          ),
        };
      case 'shipping':
        return {
          title: 'Shipping & Logistics Policy',
          icon: <Truck size={24} className="text-amber-600" />,
          content: (
            <div>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                Kogniti Minds Private Limited operates an integrated surface and express freight logistics network covering over 19,000 PIN codes across all Indian states and Union Territories.
              </p>
              <h4 style={{ fontWeight: 700, margin: '1rem 0 0.5rem' }}>1. Delivery Timelines</h4>
              <p style={{ lineHeight: '1.6', marginBottom: '0.75rem' }}>
                • Metro cities (Bengaluru, Delhi NCR, Mumbai, Hyderabad, Chennai, Kolkata): 2 to 4 business days.<br />
                • Tier 2 & Tier 3 cities: 3 to 6 business days.<br />
                • Institutional heavy freight (commercial standing desks, 75" flat panels): Scheduled delivery with lift gate within 5 to 7 business days.
              </p>
              <h4 style={{ fontWeight: 700, margin: '1rem 0 0.5rem' }}>2. Free Shipping & Institutional Support</h4>
              <p style={{ lineHeight: '1.6', marginBottom: '0.75rem' }}>
                FREE PAN-INDIA DELIVERY on Orders Above ₹1,999. All retail consumer orders with net value exceeding ₹1,999 qualify for complimentary zero-fee delivery. 100% GENUINE PRODUCTS | GST Invoice Available with input credit. For bulk corporate procurement or B2B & INSTITUTIONAL ENQUIRIES, please contact: +91 9931648595 or sales@kognitiminds.com.
              </p>
              <h4 style={{ fontWeight: 700, margin: '1rem 0 0.5rem' }}>3. Transit Tracking</h4>
              <p style={{ lineHeight: '1.6' }}>
                Every dispatched consignment is allocated a live Air Waybill (AWB) number through Delhivery or Blue Dart, trackable in real-time under your My Orders tab.
              </p>
            </div>
          ),
        };
      case 'refund':
        return {
          title: 'Return & Refund Policy',
          icon: <RotateCcw size={24} className="text-purple-600" />,
          content: (
            <div>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                We stand behind the engineering of every physical product manufactured and distributed by Kogniti Minds Private Limited.
              </p>
              <h4 style={{ fontWeight: 700, margin: '1rem 0 0.5rem' }}>1. 7-Day Replacement Guarantee</h4>
              <p style={{ lineHeight: '1.6', marginBottom: '0.75rem' }}>
                If any hardware arrives physically damaged in transit, with defective mechanical parts, or mismatching specifications, report it within 7 calendar days of delivery for a 100% free doorstep replacement.
              </p>
              <h4 style={{ fontWeight: 700, margin: '1rem 0 0.5rem' }}>2. Refunds Processing</h4>
              <p style={{ lineHeight: '1.6', marginBottom: '0.75rem' }}>
                If a replacement cannot be fulfilled due to inventory constraints, a complete refund will be credited back to your original payment source (UPI account or Card) within 3 to 5 banking days.
              </p>
              <h4 style={{ fontWeight: 700, margin: '1rem 0 0.5rem' }}>3. Manufacturer Warranty</h4>
              <p style={{ lineHeight: '1.6' }}>
                Products are protected by long-term manufacturer warranty (ranging from 1 to 5 years). On-site technician support is provided for interactive displays and motorized desks in major metros.
              </p>
            </div>
          ),
        };
    }
  };

  const policy = getPolicyContent();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '650px', padding: '2.5rem', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'var(--slate-100)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} className="text-slate-600" />
        </button>

        <div className="flex items-center gap-3" style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'var(--slate-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {policy.icon}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              {policy.title}
            </h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
              Kogniti Minds Private Limited Compliance & Legal Disclosures
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.88rem', color: 'var(--slate-700)', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {policy.content}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'right', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};
