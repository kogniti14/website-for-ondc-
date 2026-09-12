import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { UnregisteredUserModal } from './UnregisteredUserModal';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode = 'login', onClose }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'otp' | 'forgot'>(initialMode);
  const [loginMethod, setLoginMethod] = useState<'password' | 'email_otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Email OTP States for Login
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');
  const [loginCooldown, setLoginCooldown] = useState(0);

  // Email OTP States for Registration
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtp, setRegOtp] = useState('');
  const [regCooldown, setRegCooldown] = useState(0);

  // Email OTP States for Forgot Password
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [firebaseResetSuccess, setFirebaseResetSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Unregistered Account Check State
  const [showUnregisteredModal, setShowUnregisteredModal] = useState(false);
  const [unregisteredIdentifier, setUnregisteredIdentifier] = useState('');

  const {
    loginB2C,
    loginB2CWithFirebase,
    registerB2CWithFirebase,
    loginWithGoogle,
    sendFirebasePasswordReset,
    sendEmailOtp,
    loginB2CWithEmailOtp,
    registerB2CWithEmailOtp,
    resetPasswordWithEmailOtp,
    isFirebaseLive,
  } = useAuth();

  // Cooldown timers
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loginCooldown > 0) {
      timer = setTimeout(() => setLoginCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [loginCooldown]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (regCooldown > 0) {
      timer = setTimeout(() => setRegCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [regCooldown]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (forgotCooldown > 0) {
      timer = setTimeout(() => setForgotCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [forgotCooldown]);

  // Handlers
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please enter your registered email address or mobile number.');
      return;
    }
    const cleanEmail = email.trim();

    const isRegistered = storageService.isB2CIdentifierRegistered(cleanEmail);
    if (!isRegistered) {
      setUnregisteredIdentifier(cleanEmail);
      setShowUnregisteredModal(true);
      return;
    }

    setLoading(true);

    if (cleanEmail.includes('@') && password) {
      const res = await loginB2CWithFirebase(cleanEmail.toLowerCase(), password);
      setLoading(false);
      if (res.success) {
        onClose();
        return;
      }
      setError(res.error || 'Invalid credentials.');
      return;
    }

    const success = loginB2C(cleanEmail);
    setLoading(false);
    if (success) {
      onClose();
    } else {
      setError('Incorrect credentials. Please verify or use Email OTP / Reset.');
    }
  };

  const handleSendLoginEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address to receive your verification OTP.');
      return;
    }

    const isRegistered = storageService.isB2CIdentifierRegistered(cleanEmail);
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

  const handleVerifyLoginEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginOtp || loginOtp.length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }
    setLoading(true);
    const res = await loginB2CWithEmailOtp(email.trim().toLowerCase(), loginOtp.trim());
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Invalid OTP code. Please try again.');
    }
  };

  const handleSendRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill in all registration fields first.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = storageService.getB2CUserByIdentifier(cleanEmail);
    if (existing) {
      setError('An account with this email address already exists. Please sign in instead.');
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

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regOtp || regOtp.length !== 6) {
      setError('Please enter the 6-digit verification code received in your email.');
      return;
    }

    setLoading(true);
    const res = await registerB2CWithEmailOtp(
      {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      },
      regOtp.trim(),
      password
    );
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Registration failed. Please check the code and try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const res = await loginWithGoogle('b2c');
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Google Sign-In failed.');
    }
  };

  const handleSendFirebaseReset = async () => {
    if (!forgotIdentifier || !forgotIdentifier.includes('@')) {
      setError('Please enter a valid email address to receive Firebase password reset instructions.');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await sendFirebasePasswordReset(forgotIdentifier.trim());
    setLoading(false);
    if (res.success) {
      setFirebaseResetSuccess(res.message);
    } else {
      setError(res.message);
    }
  };

  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = forgotIdentifier.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setError('Please enter your registered email address.');
      return;
    }
    const isRegistered = storageService.isB2CIdentifierRegistered(clean);
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

  const handleVerifyForgotOtp = async (e: React.FormEvent) => {
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
      forgotIdentifier.trim().toLowerCase(),
      forgotOtp.trim(),
      forgotNewPassword,
      'b2c'
    );
    setLoading(false);
    if (res.success) {
      setForgotSuccess(res.message);
      setEmail(forgotIdentifier.trim());
      setPassword('');
      setTimeout(() => {
        setMode('login');
        setForgotSuccess(null);
        setForgotOtpSent(false);
        setForgotOtp('');
      }, 2500);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '440px', padding: '2rem', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <X size={20} className="text-slate-500" />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img
            src="/logo.png"
            alt="Kogniti Minds"
            style={{ height: '56px', width: 'auto', margin: '0 auto 0.5rem', objectFit: 'contain' }}
          />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {mode === 'login' ? 'Welcome to Kogniti Minds' : 'New Customer Registration'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
            {mode === 'login'
              ? 'Access your orders, saved wishlist and fast checkout'
              : 'Register your details to enjoy instant orders, tracking & fast checkout'}
          </p>
        </div>

        {error && (
          <div
            className="flex items-center gap-2"
            style={{
              background: 'var(--rose-50)',
              border: '1px solid var(--rose-100)',
              color: 'var(--rose-600)',
              padding: '0.6rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Tabs for Login vs Register */}
        {mode !== 'forgot' && (
          <div
            style={{
              display: 'flex',
              background: 'var(--slate-100)',
              padding: '3px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
            }}
          >
            <button
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              style={{
                flex: 1,
                padding: '0.45rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '6px',
                background: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? 'var(--slate-900)' : 'var(--slate-500)',
                boxShadow: mode === 'login' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              style={{
                flex: 1,
                padding: '0.45rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '6px',
                background: mode === 'register' ? '#ffffff' : 'transparent',
                color: mode === 'register' ? 'var(--slate-900)' : 'var(--slate-500)',
                boxShadow: mode === 'register' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              New Customer
            </button>
          </div>
        )}

        {mode === 'forgot' ? (
          /* Forgot Password via Email OTP */
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setForgotOtpSent(false);
                }}
                className="btn btn-sm btn-outline"
                style={{ padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-800)' }}>
                Reset Account Password
              </span>
            </div>

            {forgotSuccess ? (
              <div
                style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                }}
              >
                <CheckCircle2 size={32} className="text-emerald-600" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem' }}>Password Reset Complete</div>
                <p style={{ fontSize: '0.82rem' }}>{forgotSuccess}</p>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  Sign In with New Password
                </button>
              </div>
            ) : !forgotOtpSent ? (
              <form onSubmit={handleSendForgotOtp}>
                <div className="form-group">
                  <label className="form-label">Registered Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--slate-400)' }} />
                    <input
                      type="email"
                      placeholder="yourname@domain.com"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      required
                    />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '0.2rem', display: 'block' }}>
                    We will send a cryptographically secure 6-digit OTP code directly to your email inbox.
                  </span>
                </div>

                {firebaseResetSuccess && (
                  <div
                    style={{
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      color: '#065F46',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                      marginTop: '0.75rem',
                      textAlign: 'center',
                    }}
                  >
                    <CheckCircle2 size={18} className="text-emerald-600" style={{ display: 'inline', marginRight: '4px' }} />
                    {firebaseResetSuccess}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  {loading ? 'Dispatching OTP...' : 'Send 6-Digit Verification Code'}
                </button>

                {forgotIdentifier && forgotIdentifier.includes('@') && (
                  <button
                    type="button"
                    onClick={handleSendFirebaseReset}
                    disabled={loading}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', marginTop: '0.65rem', fontSize: '0.8rem' }}
                  >
                    {loading ? 'Sending link...' : '✉️ Send Firebase Password Reset Link to Email'}
                  </button>
                )}
              </form>
            ) : (
              <form onSubmit={handleVerifyForgotOtp}>
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    fontSize: '0.8rem',
                    color: '#166534',
                  }}
                >
                  Verification code dispatched to <strong>{forgotIdentifier}</strong>. Please check your inbox (or spam folder).
                </div>

                <div className="form-group">
                  <div className="flex justify-between items-center">
                    <label className="form-label">Enter 6-Digit Email OTP *</label>
                    <button
                      type="button"
                      disabled={forgotCooldown > 0 || loading}
                      onClick={handleSendForgotOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: forgotCooldown > 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        color: forgotCooldown > 0 ? 'var(--slate-400)' : 'var(--primary)',
                        fontWeight: 600,
                      }}
                    >
                      {forgotCooldown > 0 ? `Resend code in ${forgotCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="form-input"
                    style={{ fontFamily: 'monospace', fontSize: '1.25rem', letterSpacing: '0.3em', textAlign: 'center', fontWeight: 800 }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password * (Min. 6 chars)</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--slate-400)' }} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--slate-400)' }} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  {loading ? 'Updating Password...' : 'Verify OTP & Set New Password'}
                </button>
              </form>
            )}
          </div>
        ) : mode === 'login' ? (
          <div>
            {/* Login Method Toggle: Password vs Email OTP */}
            <div className="flex justify-center gap-4" style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password');
                  setError(null);
                }}
                style={{
                  color: loginMethod === 'password' ? 'var(--primary)' : 'var(--slate-500)',
                  fontWeight: loginMethod === 'password' ? 700 : 500,
                  borderBottom: loginMethod === 'password' ? '2px solid var(--primary)' : 'none',
                  paddingBottom: '4px',
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
                  color: loginMethod === 'email_otp' ? 'var(--primary)' : 'var(--slate-500)',
                  fontWeight: loginMethod === 'email_otp' ? 700 : 500,
                  borderBottom: loginMethod === 'email_otp' ? '2px solid var(--primary)' : 'none',
                  paddingBottom: '4px',
                }}
              >
                ✉️ Email OTP Login
              </button>
            </div>

            {loginMethod === 'password' ? (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address or Mobile</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--slate-400)' }} />
                    <input
                      type="text"
                      placeholder="yourname@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="flex justify-between items-center">
                    <label className="form-label">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setForgotIdentifier(email || '');
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
                        color: 'var(--primary)',
                        fontWeight: 600,
                      }}
                    >
                      Forgot Password? Reset via OTP
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--slate-400)' }} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  {loading ? 'Authenticating...' : 'Sign In to Account'}
                </button>
              </form>
            ) : (
              <div>
                {!loginOtpSent ? (
                  <form onSubmit={handleSendLoginEmailOtp}>
                    <div className="form-group">
                      <label className="form-label">Registered Email Address</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--slate-400)' }} />
                        <input
                          type="email"
                          placeholder="yourname@domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="form-input"
                          style={{ paddingLeft: '38px' }}
                          required
                        />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '0.2rem', display: 'block' }}>
                        A one-time 6-digit login password will be delivered to this email inbox.
                      </span>
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                      {loading ? 'Sending OTP...' : 'Send Login OTP to Email'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyLoginEmailOtp}>
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        color: '#166534',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        marginBottom: '1rem',
                      }}
                    >
                      OTP sent to <strong>{email}</strong>. Check inbox or spam folder.
                    </div>
                    <div className="form-group">
                      <div className="flex justify-between items-center">
                        <label className="form-label">Enter 6-Digit Email OTP</label>
                        <button
                          type="button"
                          disabled={loginCooldown > 0 || loading}
                          onClick={handleSendLoginEmailOtp}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: loginCooldown > 0 ? 'not-allowed' : 'pointer',
                            fontSize: '0.75rem',
                            color: loginCooldown > 0 ? 'var(--slate-400)' : 'var(--primary)',
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
                        style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.3em', fontWeight: 800 }}
                        required
                        autoFocus
                      />
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                      {loading ? 'Verifying...' : 'Verify OTP & Sign In'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Register Form with Real Email OTP Verification */
          <div>
            {!regOtpSent ? (
              <form onSubmit={handleSendRegisterOtp}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--slate-400)' }} />
                    <input
                      type="text"
                      placeholder="e.g. Utkarsh Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address * (For OTP Verification)</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--slate-400)' }} />
                    <input
                      type="email"
                      placeholder="yourname@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--slate-400)' }} />
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Create Password * (Min 6 chars)</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--slate-400)' }} />
                    <input
                      type="password"
                      placeholder="Create secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  {loading ? 'Sending Code...' : 'Send Verification OTP to Email'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndRegister}>
                <div
                  style={{
                    padding: '0.75rem',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: '#166534',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    marginBottom: '1rem',
                  }}
                >
                  A 6-digit verification OTP was sent to <strong>{email}</strong>. Enter it below to activate your account.
                </div>

                <div className="form-group">
                  <div className="flex justify-between items-center">
                    <label className="form-label">Enter 6-Digit Email OTP *</label>
                    <button
                      type="button"
                      disabled={regCooldown > 0 || loading}
                      onClick={handleSendRegisterOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: regCooldown > 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        color: regCooldown > 0 ? 'var(--slate-400)' : 'var(--primary)',
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
                    style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.3em', fontWeight: 800 }}
                    required
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  {loading ? 'Verifying & Registering...' : 'Verify OTP & Complete Registration'}
                </button>

                <button
                  type="button"
                  onClick={() => setRegOtpSent(false)}
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', marginTop: '0.65rem' }}
                >
                  ← Edit Registration Details
                </button>
              </form>
            )}
          </div>
        )}

        {/* Social / Google Sign-in */}
        <div style={{ margin: '1.25rem 0', textAlign: 'center', position: 'relative' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)' }} />
          <span
            style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#ffffff',
              padding: '0 0.75rem',
              fontSize: '0.75rem',
              color: 'var(--slate-400)',
            }}
          >
            Or continue with
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn btn-outline"
          style={{
            width: '100%',
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            padding: '0.7rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ffffff',
            borderColor: '#E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{loading ? 'Authenticating with Google...' : 'Continue with Google'}</span>
        </button>

        {/* Firebase Authentication Trust Badge */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            fontSize: '0.72rem',
            color: 'var(--slate-500)',
          }}
        >
          <span style={{ fontSize: '0.9rem' }}>🔒</span>
          <span>
            Secured with <strong>Firebase Authentication</strong> {isFirebaseLive ? '• Live' : '• Ready'}
          </span>
        </div>

        <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.72rem', color: 'var(--slate-400)' }}>
          By continuing, you agree to Kogniti Minds' Terms of Service & Privacy Policy.
        </div>
      </div>

      {showUnregisteredModal && (
        <UnregisteredUserModal
          identifier={unregisteredIdentifier}
          portalType="b2c"
          onClose={() => setShowUnregisteredModal(false)}
          onRegisterNow={() => {
            setShowUnregisteredModal(false);
            setMode('register');
            if (unregisteredIdentifier.includes('@')) {
              setEmail(unregisteredIdentifier);
            } else {
              setPhone(unregisteredIdentifier.replace(/\D/g, '').slice(-10));
            }
            setError(null);
          }}
        />
      )}
    </div>
  );
};
