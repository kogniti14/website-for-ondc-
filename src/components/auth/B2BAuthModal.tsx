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
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { B2BBusiness } from '../../types';
import { storageService } from '../../services/storageService';

interface B2BAuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const B2BAuthModal: React.FC<B2BAuthModalProps> = ({ onClose, onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
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

  // Forgot Password via OTP State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotOtpInfo, setForgotOtpInfo] = useState<{ otp: string; expiresAt: string } | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [firebaseResetSuccess, setFirebaseResetSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    loginB2B,
    registerB2B,
    loginB2BWithFirebase,
    registerB2BWithFirebase,
    loginWithGoogle,
    sendFirebasePasswordReset,
    isFirebaseLive,
  } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    if (password) {
      const res = await loginB2BWithFirebase(cleanEmail, password);
      setLoading(false);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
        return;
      }
      setError(res.error || 'Authentication failed.');
      return;
    }

    const success = loginB2B(cleanEmail);
    setLoading(false);
    if (success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError('No business account found with this corporate email. Please register your company or use demo accounts.');
    }
  };

  const handleGoogleB2BSignIn = async () => {
    setError(null);
    setLoading(true);
    const res = await loginWithGoogle('b2b');
    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(res.error || 'Google Workspace sign-in failed.');
    }
  };

  const handleSendB2BFirebaseReset = async () => {
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setError('Please enter a valid corporate email to receive the Firebase reset link.');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await sendFirebasePasswordReset(forgotEmail.trim());
    setLoading(false);
    if (res.success) {
      setFirebaseResetSuccess(res.message);
    } else {
      setError(res.message);
    }
  };

  const handleSendB2BForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!forgotEmail.trim()) {
      setError('Please enter your registered corporate email.');
      return;
    }
    const otpRes = storageService.generatePasswordResetOtp(forgotEmail.trim(), 'b2b');
    setForgotOtpInfo(otpRes);
    setForgotOtp(otpRes.otp);
  };

  const handleVerifyB2BForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const res = storageService.resetPasswordWithOtp(
      forgotEmail.trim(),
      forgotOtp.trim(),
      forgotNewPassword
    );
    if (res.success) {
      setForgotSuccess(res.message);
      setEmail(forgotEmail.trim());
      setPassword('');
      setTimeout(() => {
        setTab('login');
        setForgotSuccess(null);
        setForgotOtpInfo(null);
      }, 2500);
    } else {
      setError(res.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!companyName || !businessEmail || !mobile || !gstin) {
      setError('Please fill in all mandatory corporate fields (marked with *).');
      return;
    }

    if (gstin.length !== 15) {
      setError('Please enter a valid 15-character Indian GSTIN.');
      return;
    }

    setLoading(true);
    const res = await registerB2BWithFirebase(
      {
        companyName,
        contactPerson: contactPerson || 'Authorized Representative',
        businessEmail: businessEmail.trim().toLowerCase(),
        mobile,
        gstin: gstin.toUpperCase(),
        pan: gstin.slice(2, 12).toUpperCase(),
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
      },
      password || 'B2bEdu@123'
    );

    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(res.error || 'Registration failed.');
    }
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
              height: '52px',
              borderRadius: '12px',
              background: '#FFFFFF',
              padding: '4px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <img
              src="/logo.png"
              alt="Kogniti Minds"
              style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
            />
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
        {tab !== 'forgot' && (
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
        )}

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
                <div className="flex justify-between items-center" style={{ marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ color: '#CBD5E1', margin: 0 }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setForgotEmail(email || '');
                      setError(null);
                      setForgotSuccess(null);
                      setForgotOtpInfo(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      color: '#F59E0B',
                      fontWeight: 600,
                    }}
                  >
                    Forgot Password? Reset via OTP
                  </button>
                </div>
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
                <UserCheck size={16} /> {loading ? 'Authenticating...' : 'Sign In to B2B Dashboard'}
              </button>

              <button
                type="button"
                onClick={handleGoogleB2BSignIn}
                disabled={loading}
                style={{
                  width: '100%',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  marginTop: '0.65rem',
                  cursor: 'pointer',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign in with Google Workspace</span>
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
        ) : tab === 'forgot' ? (
          /* Forgot Password via OTP Form for B2B */
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError(null);
                }}
                className="btn btn-sm btn-outline-b2b"
                style={{ padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#FFF' }}
              >
                <ArrowLeft size={14} /> Back to B2B Sign In
              </button>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFF' }}>
                Corporate Password Recovery
              </span>
            </div>

            {forgotSuccess ? (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34D399',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                }}
              >
                <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem', color: '#FFF' }}>Password Reset Complete</div>
                <p style={{ fontSize: '0.82rem' }}>{forgotSuccess}</p>
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="btn btn-amber btn-sm"
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  Sign In with New Password
                </button>
              </div>
            ) : !forgotOtpInfo ? (
              <form onSubmit={handleSendB2BForgotOtp}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#CBD5E1' }}>Registered Corporate Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                    <input
                      type="email"
                      placeholder="procurement@company.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
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
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>
                    A 6-digit authentication OTP will be generated to authenticate corporate recovery.
                  </span>
                </div>

                {firebaseResetSuccess && (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#34D399',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                      marginBottom: '0.75rem',
                      textAlign: 'center',
                    }}
                  >
                    <CheckCircle2 size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    {firebaseResetSuccess}
                  </div>
                )}

                <button type="submit" className="btn btn-amber" style={{ width: '100%', marginTop: '0.5rem' }}>
                  Generate & Send Verification OTP
                </button>

                {forgotEmail && forgotEmail.includes('@') && (
                  <button
                    type="button"
                    onClick={handleSendB2BFirebaseReset}
                    className="btn btn-sm btn-outline-b2b"
                    style={{
                      width: '100%',
                      marginTop: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      color: '#FFFFFF',
                      borderColor: 'rgba(255, 255, 255, 0.25)',
                    }}
                  >
                    <KeyRound size={14} /> Send Official Firebase Reset Link
                  </button>
                )}
              </form>
            ) : (
              <form onSubmit={handleVerifyB2BForgotOtp}>
                {/* Live OTP Notification Simulation Banner */}
                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1.5px solid rgba(245, 158, 11, 0.4)',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FBBF24', marginBottom: '0.25rem' }}>
                    ✨ Live OTP Dispatch Simulation
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#E2E8F0' }}>
                    OTP sent to <strong>{forgotEmail}</strong>:
                  </div>
                  <div className="flex items-center gap-3" style={{ marginTop: '0.4rem' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '1.3rem',
                        fontWeight: 900,
                        letterSpacing: '3px',
                        background: '#1E293B',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        color: '#F59E0B',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                      }}
                    >
                      {forgotOtpInfo.otp}
                    </span>
                    <button
                      type="button"
                      onClick={() => setForgotOtp(forgotOtpInfo.otp)}
                      className="btn btn-sm"
                      style={{ background: '#F59E0B', color: '#000', fontWeight: 700, fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      Auto-Fill OTP
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#CBD5E1' }}>6-Digit Verification OTP *</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="123456"
                    className="form-input"
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '1.1rem',
                      letterSpacing: '2px',
                      textAlign: 'center',
                      fontWeight: 700,
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#CBD5E1' }}>New Password * (Min. 6 chars)</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
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
                  <label className="form-label" style={{ color: '#CBD5E1' }}>Confirm New Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
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

                <button type="submit" className="btn btn-amber" style={{ width: '100%', marginTop: '0.5rem' }}>
                  Verify OTP & Set New Password
                </button>
              </form>
            )}
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

        {/* Firebase Authentication Security Badge */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            fontSize: '0.72rem',
            color: '#94A3B8',
          }}
        >
          <span>🔒</span>
          <span>
            Enterprise Security Powered by <strong>Firebase Authentication</strong> {isFirebaseLive ? '• Live' : '• Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};
