import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode = 'login', onClose }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'otp' | 'forgot'>(initialMode);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password via OTP State
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotOtpInfo, setForgotOtpInfo] = useState<{ otp: string; expiresAt: string } | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [firebaseResetSuccess, setFirebaseResetSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    loginB2C,
    loginB2CWithFirebase,
    registerB2CWithFirebase,
    loginWithGoogle,
    sendFirebasePasswordReset,
    isFirebaseLive,
  } = useAuth();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please enter your registered email address or mobile number');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    setLoading(true);

    // If email format and password entered, authenticate via Firebase
    if (cleanEmail.includes('@') && password) {
      const res = await loginB2CWithFirebase(cleanEmail, password);
      setLoading(false);
      if (res.success) {
        onClose();
        return;
      }
      setError(res.error || 'Invalid credentials.');
      return;
    }

    // Local / Mobile fallback
    const success = loginB2C(email);
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName || !email || !phone) {
      setError('Please fill in all required registration fields');
      return;
    }
    setLoading(true);
    const res = await registerB2CWithFirebase(
      {
        name: fullName,
        email: email.trim().toLowerCase(),
        phone,
      },
      password || 'Customer@123'
    );
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Registration failed.');
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

  const handleSendForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!forgotIdentifier.trim()) {
      setError('Please enter your registered email address or mobile number.');
      return;
    }
    const otpRes = storageService.generatePasswordResetOtp(forgotIdentifier.trim(), 'b2c');
    setForgotOtpInfo(otpRes);
    setForgotOtp(otpRes.otp);
  };

  const handleVerifyForgotOtp = (e: React.FormEvent) => {
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
      forgotIdentifier.trim(),
      forgotOtp.trim(),
      forgotNewPassword
    );
    if (res.success) {
      setForgotSuccess(res.message);
      setEmail(forgotIdentifier.trim());
      setPassword('');
      setTimeout(() => {
        setMode('login');
        setForgotSuccess(null);
        setForgotOtpInfo(null);
      }, 2500);
    } else {
      setError(res.message);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    setOtpSent(true);
    setError(null);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '123456' || otp.length === 6) {
      loginB2C(`user_${phone.slice(-4)}@kognitiminds.com`);
      onClose();
    } else {
      setError('Invalid OTP. For demo testing, enter 123456');
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
            {mode === 'login' ? 'Welcome to Kogniti Minds' : 'Create Your Account'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
            {mode === 'login'
              ? 'Access your orders, saved wishlist and fast checkout'
              : 'Join thousands of individuals & offices shopping smart'}
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
          /* Forgot Password via OTP Form */
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
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
            ) : !forgotOtpInfo ? (
              <form onSubmit={handleSendForgotOtp}>
                <div className="form-group">
                  <label className="form-label">Registered Email or Mobile Number</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--slate-400)' }} />
                    <input
                      type="text"
                      placeholder="customer@kognitiminds.com"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      required
                    />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '0.2rem', display: 'block' }}>
                    We will dispatch a secure 6-digit authentication OTP to verify ownership.
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

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  Generate & Send Verification OTP
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
                {/* Live OTP Notification Simulation Banner */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #ECFDF5 0%, #E0F2FE 100%)',
                    border: '1.5px solid #10B981',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', marginBottom: '0.25rem' }}>
                    ✨ Live OTP Dispatch Simulation
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#065F46' }}>
                    OTP sent to <strong>{forgotIdentifier}</strong>:
                  </div>
                  <div className="flex items-center gap-3" style={{ marginTop: '0.4rem' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '1.3rem',
                        fontWeight: 900,
                        letterSpacing: '3px',
                        background: '#FFFFFF',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        color: '#047857',
                        border: '1px solid #A7F3D0',
                      }}
                    >
                      {forgotOtpInfo.otp}
                    </span>
                    <button
                      type="button"
                      onClick={() => setForgotOtp(forgotOtpInfo.otp)}
                      className="btn btn-sm"
                      style={{ background: '#10B981', color: '#FFFFFF', fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      Auto-Fill OTP
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">6-Digit Verification OTP *</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="123456"
                    className="form-input"
                    style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '2px', textAlign: 'center', fontWeight: 700 }}
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

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  Verify OTP & Set New Password
                </button>
              </form>
            )}
          </div>
        ) : mode === 'login' ? (
          <div>
            {/* Login Method Toggle */}
            <div className="flex justify-center gap-4" style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
              <button
                type="button"
                onClick={() => setLoginMethod('password')}
                style={{
                  color: loginMethod === 'password' ? 'var(--primary)' : 'var(--slate-500)',
                  fontWeight: loginMethod === 'password' ? 700 : 500,
                  borderBottom: loginMethod === 'password' ? '2px solid var(--primary)' : 'none',
                  paddingBottom: '2px',
                }}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('otp')}
                style={{
                  color: loginMethod === 'otp' ? 'var(--primary)' : 'var(--slate-500)',
                  fontWeight: loginMethod === 'otp' ? 700 : 500,
                  borderBottom: loginMethod === 'otp' ? '2px solid var(--primary)' : 'none',
                  paddingBottom: '2px',
                }}
              >
                Mobile OTP Login
              </button>
            </div>

            {loginMethod === 'password' ? (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">Email or Mobile Number</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--slate-400)' }} />
                    <input
                      type="text"
                      placeholder="customer@kognitiminds.com"
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
                        setForgotOtpInfo(null);
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

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  Sign In to Account
                </button>

                <div style={{ marginTop: '0.85rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('customer@kognitiminds.com');
                      setPassword('demo123');
                    }}
                    style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'underline' }}
                  >
                    Use Demo B2C Credentials (customer@kognitiminds.com)
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {!otpSent ? (
                  <form onSubmit={handleSendOtp}>
                    <div className="form-group">
                      <label className="form-label">10-Digit Mobile Number</label>
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
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                      Send OTP via SMS
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp}>
                    <div
                      style={{
                        padding: '0.6rem',
                        background: 'var(--emerald-50)',
                        border: '1px solid var(--emerald-100)',
                        color: 'var(--emerald-800)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        marginBottom: '1rem',
                      }}
                    >
                      OTP sent to +91 {phone}. Demo OTP is <strong>123456</strong>.
                    </div>
                    <div className="form-group">
                      <label className="form-label">Enter 6-Digit OTP</label>
                      <input
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="form-input"
                        style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.3em' }}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                      Verify & Sign In
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
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
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--slate-400)' }} />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
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
              <label className="form-label">Account Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--slate-400)' }} />
                <input
                  type="password"
                  placeholder="Create secure password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              Create B2C Account
            </button>
          </form>
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
    </div>
  );
};
