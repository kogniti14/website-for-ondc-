import React, { useState } from 'react';
import {
  X,
  Building2,
  Mail,
  Lock,
  Phone,
  UserCheck,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  FileText,
  Upload,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { B2BBusiness } from '../../types';

interface B2BAuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const B2BAuthModal: React.FC<B2BAuthModalProps> = ({ onClose, onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Registration Fields
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [gstin, setGstin] = useState('');
  const [businessType, setBusinessType] = useState<B2BBusiness['businessType']>('Corporate Office');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [docUploaded, setDocUploaded] = useState(false);

  const { loginB2B, registerB2B } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = loginB2B(email);
    if (success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError('No business account found with this corporate email. Please register your company or use demo accounts.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate GSTIN format if provided (Indian 15-char GSTIN format)
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
    if (!gstinRegex.test(gstin.trim())) {
      setError('Please enter a valid 15-digit Indian GSTIN (e.g. 29AAACE1234F1Z8)');
      return;
    }

    if (!companyName || !contactPerson || !businessEmail || !mobile) {
      setError('Please provide all mandatory corporate contact information.');
      return;
    }

    const created = registerB2B({
      companyName,
      contactPerson,
      businessEmail,
      mobile,
      gstin: gstin.trim().toUpperCase(),
      pan: gstin.trim().slice(2, 12).toUpperCase(),
      businessType,
      billingAddress: {
        id: `baddr_${Date.now()}`,
        fullName: companyName,
        phone: mobile,
        street: street || 'Commercial Tower',
        city: city || 'Bengaluru',
        state: state || 'Karnataka',
        pincode: pincode || '560001',
        addressType: 'work',
        isDefault: true,
      },
      shippingAddress: {
        id: `saddr_${Date.now()}`,
        fullName: companyName,
        phone: mobile,
        street: street || 'Commercial Facility',
        city: city || 'Bengaluru',
        state: state || 'Karnataka',
        pincode: pincode || '560001',
        addressType: 'work',
        isDefault: true,
      },
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: tab === 'register' ? '640px' : '440px',
          padding: '2rem',
          position: 'relative',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.1)',
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
          <X size={18} className="text-slate-300" />
        </button>

        {/* Corporate Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.5rem',
            }}
          >
            <Building2 size={24} className="text-amber-400" />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>
            {tab === 'login' ? 'Kogniti Minds B2B Portal' : 'Register Corporate Entity'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            {tab === 'login'
              ? 'Wholesale pricing, bulk tier discounts, RFQs & GST billing'
              : 'Unlock institutional procurement with verified GSTIN'}
          </p>
        </div>

        {error && (
          <div
            className="flex items-center gap-2"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
          }}
        >
          <button
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: '6px',
              background: tab === 'login' ? 'var(--primary)' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            B2B Login
          </button>
          <button
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: '6px',
              background: tab === 'register' ? 'var(--primary)' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Register Business
          </button>
        </div>

        {tab === 'login' ? (
          <div>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#CBD5E1' }}>
                  Registered Corporate Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                  <input
                    type="email"
                    placeholder="procurement@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    style={{
                      paddingLeft: '38px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                    }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#CBD5E1' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    style={{
                      paddingLeft: '38px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                    }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-amber" style={{ width: '100%', marginTop: '0.75rem' }}>
                <UserCheck size={16} /> Sign In to B2B Dashboard
              </button>
            </form>

            {/* Quick Demo Pre-fill Links */}
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>
                Instant Demo Business Logins
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('procurement@edutech.in');
                    setPassword('b2b123');
                  }}
                  className="flex items-center justify-between"
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#34D399',
                    fontSize: '0.78rem',
                    textAlign: 'left',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <span>1. Approved Account: <strong>procurement@edutech.in</strong></span>
                  <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>Verified</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@innovatetech.co');
                    setPassword('b2b123');
                  }}
                  className="flex items-center justify-between"
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#FBBF24',
                    fontSize: '0.78rem',
                    textAlign: 'left',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                  }}
                >
                  <span>2. Pending Verification: <strong>admin@innovatetech.co</strong></span>
                  <span className="badge badge-amber" style={{ fontSize: '0.62rem' }}>Pending</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Business Registration Form */
          <form onSubmit={handleRegister}>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ color: '#CBD5E1' }}>Company / Entity Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global Technologies Pvt Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="form-input"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ color: '#CBD5E1' }}>Authorized Contact Person *</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Khurana (Procurement Head)"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="form-input"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ color: '#CBD5E1' }}>Official Business Email *</label>
                <input
                  type="email"
                  placeholder="procurement@apex.in"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  className="form-input"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ color: '#CBD5E1' }}>Direct Contact Mobile *</label>
                <input
                  type="tel"
                  placeholder="98123 45678"
                  value={mobile}
                  maxLength={10}
                  onChange={(e) => setMobile(e.target.value)}
                  className="form-input"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ color: '#CBD5E1' }}>15-Digit Indian GSTIN *</label>
                <input
                  type="text"
                  placeholder="29AAACE1234F1Z8"
                  value={gstin}
                  maxLength={15}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="form-input"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF', letterSpacing: '0.05em', fontWeight: 600 }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ color: '#CBD5E1' }}>Business Classification *</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as any)}
                  className="form-select"
                  style={{ background: '#1E293B', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                >
                  <option value="Education / School">Education / School / University</option>
                  <option value="Corporate Office">Corporate Office / IT Enterprise</option>
                  <option value="Retailer / Reseller">Retailer / Bulk Reseller</option>
                  <option value="Healthcare / Hospital">Healthcare / Hospital / Clinic</option>
                  <option value="Co-Working & Real Estate">Co-Working & Real Estate Hub</option>
                  <option value="Government / PSU">Government / PSU / NGO</option>
                  <option value="Other">Other Institutional Buyer</option>
                </select>
              </div>
            </div>

            {/* Address Row */}
            <div style={{ marginTop: '0.5rem' }}>
              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ color: '#CBD5E1' }}>Corporate Facility Street Address</label>
                <input
                  type="text"
                  placeholder="Building 4, Tech Park, Outer Ring Road"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="form-input"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                />
              </div>

              <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#CBD5E1' }}>City</label>
                  <input
                    type="text"
                    placeholder="Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="form-input"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#CBD5E1' }}>State</label>
                  <input
                    type="text"
                    placeholder="Karnataka"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="form-input"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#CBD5E1' }}>Pincode</label>
                  <input
                    type="text"
                    placeholder="560103"
                    value={pincode}
                    maxLength={6}
                    onChange={(e) => setPincode(e.target.value)}
                    className="form-input"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                  />
                </div>
              </div>
            </div>

            {/* Document Upload Simulation */}
            <div
              style={{
                border: '1.5px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                marginBottom: '1.25rem',
                cursor: 'pointer',
              }}
              onClick={() => setDocUploaded(true)}
            >
              <Upload size={20} className="text-amber-400" style={{ margin: '0 auto 0.25rem' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#E2E8F0' }}>
                {docUploaded ? '✓ GST Registration Certificate Attached (Simulated)' : 'Attach GST Certificate / Incorporation Proof (PDF/JPG)'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                Click to attach compliance verification documents
              </div>
            </div>

            <button type="submit" className="btn btn-amber" style={{ width: '100%' }}>
              Submit Business Registration for Compliance Review
            </button>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', textAlign: 'center', marginTop: '0.5rem' }}>
              Registrations undergo compliance check by Kogniti B2B desk within 24 business hours.
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
