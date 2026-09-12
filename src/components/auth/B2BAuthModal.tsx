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
import { UnregisteredUserModal } from './UnregisteredUserModal';
import { ImageUpload } from '../common/ImageUpload';

interface B2BAuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const B2BAuthModal: React.FC<B2BAuthModalProps> = ({ onClose, onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Unregistered Account Check State
  const [showUnregisteredModal, setShowUnregisteredModal] = useState(false);
  const [unregisteredIdentifier, setUnregisteredIdentifier] = useState('');

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
  const [docImage, setDocImage] = useState('');

  // Login Method & OTP
  const [loginMethod, setLoginMethod] = useState<'password' | 'email_otp'>('password');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');
  const [loginCooldown, setLoginCooldown] = useState(0);

  // Registration Password & Email OTP
  const [regPassword, setRegPassword] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtp, setRegOtp] = useState('');
  const [regCooldown, setRegCooldown] = useState(0);

  // Forgot Password via Email OTP State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [firebaseResetSuccess, setFirebaseResetSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    loginB2B,
    loginB2BWithFirebase,
    loginWithGoogle,
    sendFirebasePasswordReset,
    sendEmailOtp,
    loginB2BWithEmailOtp,
    registerB2BWithEmailOtp,
    resetPasswordWithEmailOtp,
    isFirebaseLive,
  } = useAuth();

  // Cooldown timers
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loginCooldown > 0) timer = setTimeout(() => setLoginCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [loginCooldown]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (regCooldown > 0) timer = setTimeout(() => setRegCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [regCooldown]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (forgotCooldown > 0) timer = setTimeout(() => setForgotCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [forgotCooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please enter your registered corporate email or mobile number.');
      return;
    }
    const cleanEmail = email.trim();

    const isRegistered = storageService.isB2BIdentifierRegistered(cleanEmail);
    if (!isRegistered) {
      setUnregisteredIdentifier(cleanEmail);
      setShowUnregisteredModal(true);
      return;
    }

    setLoading(true);

    if (cleanEmail.includes('@') && password) {
      const res = await loginB2BWithFirebase(cleanEmail.toLowerCase(), password);
      setLoading(false);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
        return;
      }
      setError(res.error || 'Authentication failed.');
      return;
    }

    const success = loginB2B(cleanEmail.toLowerCase());
    setLoading(false);
    if (success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError('Incorrect corporate credentials. Please verify your password or use Email OTP.');
    }
  };

  const handleSendB2BLoginEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter your official corporate email address.');
      return;
    }

    const isRegistered = storageService.isB2BIdentifierRegistered(cleanEmail);
    if (!isRegistered) {
      setUnregisteredIdentifier(cleanEmail);
      setShowUnregisteredModal(true);
      return;
    }

    setLoading(true);
    const res = await sendEmailOtp(cleanEmail, 'login');
    setLoading(false);
    if (res.success) {
      setLoginOtpSent(true);
      setLoginCooldown(res.cooldownSeconds || 60);
    } else {
      setError(res.message);
    }
  };

  const handleVerifyB2BLoginEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginOtp || loginOtp.length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }
    setLoading(true);
    const res = await loginB2BWithEmailOtp(email.trim().toLowerCase(), loginOtp.trim());
    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(res.error || 'Invalid OTP code. Please try again.');
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

  const handleSendB2BForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = forgotEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setError('Please enter your registered corporate email.');
      return;
    }
    const isRegistered = storageService.isB2BIdentifierRegistered(clean);
    if (!isRegistered) {
      setUnregisteredIdentifier(clean);
      setShowUnregisteredModal(true);
      return;
    }

    setLoading(true);
    const res = await sendEmailOtp(clean, 'reset');
    setLoading(false);
    if (res.success) {
      setForgotOtpSent(true);
      setForgotCooldown(res.cooldownSeconds || 60);
    } else {
      setError(res.message);
    }
  };

  const handleVerifyB2BForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!forgotOtp || forgotOtp.length !== 6) {
      setError('Please enter the 6-digit verification code received in your email.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await resetPasswordWithEmailOtp(
      forgotEmail.trim().toLowerCase(),
      forgotOtp.trim(),
      forgotNewPassword,
      'b2b'
    );
    setLoading(false);
    if (res.success) {
      setForgotSuccess(res.message);
      setEmail(forgotEmail.trim());
      setPassword('');
      setTimeout(() => {
        setTab('login');
        setForgotSuccess(null);
        setForgotOtpSent(false);
        setForgotOtp('');
      }, 2500);
    } else {
      setError(res.message);
    }
  };

  const handleSendB2BRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!companyName.trim() || !businessEmail.trim() || !mobile.trim() || !gstin.trim() || !regPassword) {
      setError('Please fill in all mandatory corporate fields and enter a password.');
      return;
    }
    if (!businessEmail.includes('@')) {
      setError('Please enter a valid corporate email address.');
      return;
    }
    if (gstin.trim().length !== 15) {
      setError('Please enter a valid 15-character Indian GSTIN.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const cleanEmail = businessEmail.trim().toLowerCase();
    const existing = storageService.isB2BIdentifierRegistered(cleanEmail);
    if (existing) {
      setError('A business account with this email address already exists. Please sign in.');
      return;
    }

    setLoading(true);
    const res = await sendEmailOtp(cleanEmail, 'register');
    setLoading(false);
    if (res.success) {
      setRegOtpSent(true);
      setRegCooldown(res.cooldownSeconds || 60);
    } else {
      setError(res.message);
    }
  };

  const handleVerifyAndRegisterB2B = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regOtp || regOtp.length !== 6) {
      setError('Please enter the 6-digit verification code received in your email.');
      return;
    }

    setLoading(true);
    const res = await registerB2BWithEmailOtp(
      {
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim() || 'Authorized Representative',
        businessEmail: businessEmail.trim().toLowerCase(),
        mobile: mobile.trim(),
        gstin: gstin.trim().toUpperCase(),
        pan: gstin.trim().slice(2, 12).toUpperCase(),
        businessType,
        billingAddress: {
          id: `baddr_${Date.now()}`,
          fullName: companyName.trim(),
          phone: mobile.trim(),
          street: street || 'Commercial Facility',
          city: city || 'Bengaluru',
          state: state || 'Karnataka',
          pincode: pincode || '560001',
          addressType: 'work',
          isDefault: true,
        },
        shippingAddress: {
          id: `saddr_${Date.now()}`,
          fullName: companyName.trim(),
          phone: mobile.trim(),
          street: street || 'Commercial Facility',
          city: city || 'Bengaluru',
          state: state || 'Karnataka',
          pincode: pincode || '560001',
          addressType: 'work',
          isDefault: true,
        },
        documents: docImage
          ? [
              {
                name: 'GST Registration Certificate',
                type: 'image',
                uploadedAt: new Date().toISOString(),
                status: 'pending' as const,
              },
            ]
          : [],
        avatarUrl: docImage || undefined,
      },
      regOtp.trim(),
      regPassword
    );

    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(res.error || 'Corporate registration failed. Please verify the OTP.');
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
            {tab === 'login' ? 'Kogniti Minds B2B Portal' : 'Registered Business'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            {tab === 'login'
              ? 'DIRECT MANUFACTURER PRICING • Bulk tier discounts, RFQs & GST billing'
              : 'DIRECT MANUFACTURER PRICING • Verified institutional procurement'}
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
              Registered Business
            </button>
          </div>
        )}

        {tab === 'login' ? (
          <div>
            {/* Login Method Toggle */}
            <div className="flex justify-center gap-4" style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password');
                  setError(null);
                }}
                style={{
                  color: loginMethod === 'password' ? '#F59E0B' : '#94A3B8',
                  fontWeight: loginMethod === 'password' ? 700 : 500,
                  borderBottom: loginMethod === 'password' ? '2px solid #F59E0B' : 'none',
                  paddingBottom: '4px',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                }}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('email_otp');
                  setError(null);
                }}
                style={{
                  color: loginMethod === 'email_otp' ? '#F59E0B' : '#94A3B8',
                  fontWeight: loginMethod === 'email_otp' ? 700 : 500,
                  borderBottom: loginMethod === 'email_otp' ? '2px solid #F59E0B' : 'none',
                  paddingBottom: '4px',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                }}
              >
                ✉️ Corporate Email OTP
              </button>
            </div>

            {loginMethod === 'password' ? (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#CBD5E1' }}>
                    Registered Corporate Email or Mobile
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                    <input
                      type="text"
                      placeholder="contact@enterprise.com"
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
                        setForgotOtpSent(false);
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

                <button type="submit" disabled={loading} className="btn btn-amber" style={{ width: '100%', marginTop: '0.75rem' }}>
                  <UserCheck size={16} /> {loading ? 'Authenticating...' : 'Sign In to B2B Dashboard'}
                </button>
              </form>
            ) : (
              <div>
                {!loginOtpSent ? (
                  <form onSubmit={handleSendB2BLoginEmailOtp}>
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#CBD5E1' }}>Official Corporate Email</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                        <input
                          type="email"
                          placeholder="contact@enterprise.com"
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
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>
                        A one-time 6-digit corporate verification code will be sent to your inbox.
                      </span>
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-amber" style={{ width: '100%', marginTop: '0.5rem' }}>
                      {loading ? 'Sending OTP...' : 'Send Corporate Login OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyB2BLoginEmailOtp}>
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34D399',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        marginBottom: '1rem',
                      }}
                    >
                      OTP sent to <strong>{email}</strong>. Check inbox or spam folder.
                    </div>
                    <div className="form-group">
                      <div className="flex justify-between items-center">
                        <label className="form-label" style={{ color: '#CBD5E1' }}>Enter 6-Digit Email OTP</label>
                        <button
                          type="button"
                          disabled={loginCooldown > 0 || loading}
                          onClick={handleSendB2BLoginEmailOtp}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: loginCooldown > 0 ? 'not-allowed' : 'pointer',
                            fontSize: '0.75rem',
                            color: loginCooldown > 0 ? '#94A3B8' : '#F59E0B',
                            fontWeight: 600,
                          }}
                        >
                          {loginCooldown > 0 ? `Resend in ${loginCooldown}s` : 'Resend Code'}
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="••••••"
                        maxLength={6}
                        value={loginOtp}
                        onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                        className="form-input"
                        style={{
                          textAlign: 'center',
                          fontSize: '1.25rem',
                          letterSpacing: '0.3em',
                          fontWeight: 800,
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderColor: 'rgba(255, 255, 255, 0.15)',
                          color: '#FFFFFF',
                        }}
                        required
                        autoFocus
                      />
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-amber" style={{ width: '100%' }}>
                      {loading ? 'Verifying...' : 'Verify OTP & Enter B2B Portal'}
                    </button>
                  </form>
                )}
              </div>
            )}

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
                marginTop: '0.85rem',
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
          </div>
        ) : tab === 'forgot' ? (
          /* Forgot Password via Email OTP Form for B2B */
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError(null);
                  setForgotOtpSent(false);
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
            ) : !forgotOtpSent ? (
              <form onSubmit={handleSendB2BForgotOtp}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#CBD5E1' }}>Registered Corporate Email *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                    <input
                      type="email"
                      placeholder="contact@enterprise.com"
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
                    A secure 6-digit verification code will be sent to your corporate email.
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

                <button type="submit" disabled={loading} className="btn btn-amber" style={{ width: '100%', marginTop: '0.5rem' }}>
                  {loading ? 'Dispatching OTP...' : 'Generate & Send Verification OTP'}
                </button>

                {forgotEmail && forgotEmail.includes('@') && (
                  <button
                    type="button"
                    onClick={handleSendB2BFirebaseReset}
                    disabled={loading}
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
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34D399',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    fontSize: '0.8rem',
                  }}
                >
                  Verification code dispatched to <strong>{forgotEmail}</strong>. Please check your inbox or spam folder.
                </div>

                <div className="form-group">
                  <div className="flex justify-between items-center">
                    <label className="form-label" style={{ color: '#CBD5E1' }}>6-Digit Verification OTP *</label>
                    <button
                      type="button"
                      disabled={forgotCooldown > 0 || loading}
                      onClick={handleSendB2BForgotOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: forgotCooldown > 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        color: forgotCooldown > 0 ? '#94A3B8' : '#F59E0B',
                        fontWeight: 600,
                      }}
                    >
                      {forgotCooldown > 0 ? `Resend in ${forgotCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="form-input"
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '1.25rem',
                      letterSpacing: '0.3em',
                      textAlign: 'center',
                      fontWeight: 800,
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

                <button type="submit" disabled={loading} className="btn btn-amber" style={{ width: '100%', marginTop: '0.5rem' }}>
                  {loading ? 'Updating Password...' : 'Verify OTP & Set New Password'}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Business Registration Form with Real Email OTP Verification */
          <div>
            {!regOtpSent ? (
              <form onSubmit={handleSendB2BRegisterOtp}>
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
                    <label className="form-label" style={{ color: '#CBD5E1' }}>Official Business Email * (For OTP)</label>
                    <input
                      type="email"
                      placeholder="contact@enterprise.com"
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
                    <label className="form-label" style={{ color: '#CBD5E1' }}>Create Portal Password * (Min 6 chars)</label>
                    <input
                      type="password"
                      placeholder="Create secure password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="form-input"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
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

                {/* Device Document Upload */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <ImageUpload
                    label="Attach GST Certificate / Incorporation Proof"
                    helperText="Upload official business registration proof directly from device (JPG, PNG, WebP)."
                    variant="dark"
                    value={docImage}
                    onChange={(val) => {
                      const img = typeof val === 'string' ? val : val[0] || '';
                      setDocImage(img);
                      setDocUploaded(!!img);
                    }}
                  />
                </div>

                <button type="submit" disabled={loading} className="btn btn-amber" style={{ width: '100%' }}>
                  {loading ? 'Sending Code...' : 'Send Verification OTP to Corporate Email'}
                </button>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', textAlign: 'center', marginTop: '0.5rem' }}>
                  Registrations undergo compliance check by Kogniti B2B desk within 24 business hours.
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndRegisterB2B}>
                <div
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34D399',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    marginBottom: '1rem',
                  }}
                >
                  Verification code dispatched to <strong>{businessEmail}</strong>. Enter the 6-digit OTP below to verify ownership and submit your compliance application.
                </div>

                <div className="form-group">
                  <div className="flex justify-between items-center">
                    <label className="form-label" style={{ color: '#CBD5E1' }}>Enter 6-Digit Email OTP *</label>
                    <button
                      type="button"
                      disabled={regCooldown > 0 || loading}
                      onClick={handleSendB2BRegisterOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: regCooldown > 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        color: regCooldown > 0 ? '#94A3B8' : '#F59E0B',
                        fontWeight: 600,
                      }}
                    >
                      {regCooldown > 0 ? `Resend in ${regCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={regOtp}
                    onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="form-input"
                    style={{
                      textAlign: 'center',
                      fontSize: '1.25rem',
                      letterSpacing: '0.3em',
                      fontWeight: 800,
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                    }}
                    required
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={loading} className="btn btn-amber" style={{ width: '100%', marginTop: '0.5rem' }}>
                  {loading ? 'Verifying & Submitting...' : 'Verify OTP & Submit Compliance Application'}
                </button>

                <button
                  type="button"
                  onClick={() => setRegOtpSent(false)}
                  className="btn btn-outline-b2b btn-sm"
                  style={{ width: '100%', marginTop: '0.65rem', color: '#FFF' }}
                >
                  ← Edit Entity Details
                </button>
              </form>
            )}
          </div>
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

      {showUnregisteredModal && (
        <UnregisteredUserModal
          identifier={unregisteredIdentifier}
          portalType="b2b"
          onClose={() => setShowUnregisteredModal(false)}
          onRegisterNow={() => {
            setShowUnregisteredModal(false);
            setTab('register');
            if (unregisteredIdentifier.includes('@')) {
              setBusinessEmail(unregisteredIdentifier);
            } else {
              setMobile(unregisteredIdentifier.replace(/\D/g, '').slice(-10));
            }
            setError(null);
          }}
        />
      )}
    </div>
  );
};
