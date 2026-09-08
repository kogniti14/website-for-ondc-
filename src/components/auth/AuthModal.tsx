import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode = 'login', onClose }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'otp'>(initialMode);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { loginB2C, registerB2C } = useAuth();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please enter your registered email address or mobile number');
      return;
    }
    const success = loginB2C(email);
    if (success) {
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName || !email || !phone) {
      setError('Please fill in all required registration fields');
      return;
    }
    registerB2C({
      name: fullName,
      email,
      phone,
    });
    onClose();
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
            src="/logo.svg"
            alt="Kogniti Minds"
            style={{ width: '44px', height: '44px', borderRadius: '10px', margin: '0 auto 0.5rem' }}
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

        {mode === 'login' ? (
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
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo reset link sent to registered email.'); }} style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                      Forgot Password?
                    </a>
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
          onClick={() => {
            loginB2C('google.user@kognitiminds.com');
            onClose();
          }}
          className="btn btn-outline"
          style={{ width: '100%', fontSize: '0.85rem' }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
          Sign in with Google
        </button>

        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
          By continuing, you agree to Kogniti Minds' Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
};
