import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  User,
  Mail,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Clock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminRole } from '../../types';
import { storageService } from '../../services/storageService';

interface AdminAuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'register';
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const { loginAdminWithCredentials, registerAdminUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPendingNotice, setIsPendingNotice] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState('');

  // Forgot Password via OTP State
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotOtpInfo, setForgotOtpInfo] = useState<{ otp: string; expiresAt: string } | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regUserId, setRegUserId] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('Operations & Logistics');
  const [regRole, setRegRole] = useState<AdminRole>('operations_admin');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const fillDemoCredentials = (id: string, pass: string) => {
    setLoginIdentifier(id);
    setLoginPassword(pass);
    setErrorMsg(null);
    setIsPendingNotice(false);
  };

  const handleSendAdminForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!forgotIdentifier.trim()) {
      setErrorMsg('Please enter your Admin User ID or Work Email.');
      return;
    }
    const otpRes = storageService.generatePasswordResetOtp(forgotIdentifier.trim(), 'admin');
    setForgotOtpInfo(otpRes);
    setForgotOtp(otpRes.otp);
  };

  const handleVerifyAdminForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    const res = storageService.resetPasswordWithOtp(
      forgotIdentifier.trim(),
      forgotOtp.trim(),
      forgotNewPassword
    );
    if (res.success) {
      setForgotSuccess(res.message);
      setLoginIdentifier(forgotIdentifier.trim());
      setLoginPassword('');
      setTimeout(() => {
        setMode('login');
        setForgotSuccess(null);
        setForgotOtpInfo(null);
      }, 2500);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsPendingNotice(false);

    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMsg('Please enter both User ID / Email and Password.');
      return;
    }

    const res = loginAdminWithCredentials(loginIdentifier.trim(), loginPassword);
    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg(res.message);
      if (res.isPending) {
        setIsPendingNotice(true);
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regUserId.trim() || !regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const res = registerAdminUser({
      userId: regUserId.trim(),
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole,
      department: regDepartment,
    });

    if (res.success) {
      setRegisteredUserId(regUserId.trim());
      setRegistrationSuccess(true);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#0F172A',
          color: '#F8FAFC',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(30, 41, 59, 0.4) 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                height: '42px',
                borderRadius: '10px',
                background: '#FFFFFF',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
              }}
            >
              <img
                src="/logo.png"
                alt="Kogniti Minds"
                style={{ height: '34px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                Kogniti Minds Admin Access
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                Internal Operations & Governance Console
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#94A3B8',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Switcher */}
        {!registrationSuccess && mode !== 'forgot' && (
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(15, 23, 42, 0.6)',
            }}
          >
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setIsPendingNotice(false);
              }}
              style={{
                flex: 1,
                padding: '0.85rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: mode === 'login' ? '#C084FC' : '#94A3B8',
                borderBottom: mode === 'login' ? '2px solid #C084FC' : '2px solid transparent',
                background: mode === 'login' ? 'rgba(147, 51, 234, 0.08)' : 'transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Admin Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setIsPendingNotice(false);
              }}
              style={{
                flex: 1,
                padding: '0.85rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: mode === 'register' ? '#C084FC' : '#94A3B8',
                borderBottom: mode === 'register' ? '2px solid #C084FC' : '2px solid transparent',
                background: mode === 'register' ? 'rgba(147, 51, 234, 0.08)' : 'transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Register Staff Account
            </button>
          </div>
        )}

        <div style={{ padding: '1.5rem', maxHeight: 'calc(90vh - 140px)', overflowY: 'auto' }}>
          {/* Error / Pending Message Banner */}
          {errorMsg && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                marginBottom: '1.25rem',
                display: 'flex',
                gap: '0.65rem',
                fontSize: '0.82rem',
                lineHeight: '1.4',
                background: isPendingNotice ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: isPendingNotice
                  ? '1px solid rgba(245, 158, 11, 0.4)'
                  : '1px solid rgba(239, 68, 68, 0.4)',
                color: isPendingNotice ? '#FCD34D' : '#FCA5A5',
              }}
            >
              {isPendingNotice ? (
                <Clock size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#F59E0B' }} />
              ) : (
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#EF4444' }} />
              )}
              <div>
                <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                  {isPendingNotice ? 'Super Admin Approval Pending' : 'Authentication Notice'}
                </div>
                <div>{errorMsg}</div>
                {isPendingNotice && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#E2E8F0' }}>
                    💡 <em>Tip: To approve this request, log in using the Super Admin credentials below and visit the <strong>Staff Approvals</strong> tab.</em>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUCCESS SCREEN AFTER REGISTRATION */}
          {registrationSuccess ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '2px solid #F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <Clock size={28} style={{ color: '#F59E0B' }} />
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                Account Request Submitted
              </h3>

              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#FBBF24',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                }}
              >
                STATUS: PENDING SUPER ADMIN APPROVAL
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.82rem',
                  color: '#CBD5E1',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: '#94A3B8' }}>User ID:</span> <strong>{registeredUserId}</strong>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: '#94A3B8' }}>Department:</span> {regDepartment}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: '#94A3B8' }}>Role:</span> {regRole}
                </div>
                <div style={{ color: '#94A3B8', fontSize: '0.78rem', marginTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.75rem' }}>
                  Your request is queued in the Super Admin verification desk. Once reviewed and authorized by the Super Admin, you will be able to log in with your credentials.
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRegistrationSuccess(false);
                    setMode('login');
                    fillDemoCredentials('superadmin', 'SuperAdmin@2026#');
                  }}
                  className="btn btn-purple flex-1"
                  style={{ justifyContent: 'center' }}
                >
                  Log In as Super Admin to Approve
                </button>
                <button
                  onClick={() => {
                    setRegistrationSuccess(false);
                    setMode('login');
                    fillDemoCredentials(registeredUserId, regPassword);
                  }}
                  className="btn btn-outline-b2b"
                  style={{ color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                >
                  Try Login
                </button>
              </div>
            </div>
          ) : mode === 'login' ? (
            /* --- LOGIN TAB --- */
            <div>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                    Admin User ID or Work Email *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="superadmin or admin_ops"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 1rem 0.65rem 2.4rem',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        color: '#FFFFFF',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center" style={{ marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#CBD5E1', margin: 0 }}>
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setForgotIdentifier(loginIdentifier || '');
                        setErrorMsg(null);
                        setForgotSuccess(null);
                        setForgotOtpInfo(null);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        color: '#C084FC',
                        fontWeight: 600,
                      }}
                    >
                      Forgot Staff Password? Reset via OTP
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 2.4rem 0.65rem 2.4rem',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        color: '#FFFFFF',
                        fontSize: '0.88rem',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '10px',
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-purple"
                  style={{
                    padding: '0.75rem',
                    fontWeight: 700,
                    justifyContent: 'center',
                    marginTop: '0.5rem',
                  }}
                >
                  Authenticate & Enter Admin Portal <ArrowRight size={16} />
                </button>
              </form>
            </div>
          ) : mode === 'forgot' ? (
            /* --- FORGOT PASSWORD VIA OTP TAB --- */
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="btn btn-sm btn-outline-b2b"
                  style={{ padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#FFF' }}
                >
                  <ArrowLeft size={14} /> Back to Admin Sign In
                </button>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFF' }}>
                  Administrative Password Recovery
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
                  <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem', color: '#FFF' }}>
                    Password Reset Complete
                  </div>
                  <p style={{ fontSize: '0.82rem' }}>{forgotSuccess}</p>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="btn btn-purple btn-sm"
                    style={{ marginTop: '1rem', width: '100%' }}
                  >
                    Sign In with New Password
                  </button>
                </div>
              ) : !forgotOtpInfo ? (
                <form onSubmit={handleSendAdminForgotOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                      Admin User ID or Work Email *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                      <input
                        type="text"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="e.g. superadmin or admin_ops"
                        required
                        style={{
                          width: '100%',
                          padding: '0.65rem 1rem 0.65rem 2.4rem',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '10px',
                          color: '#FFFFFF',
                          fontSize: '0.88rem',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>
                      A secure 6-digit authentication OTP will be dispatched to verify your identity.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-purple"
                    style={{ padding: '0.75rem', fontWeight: 700, justifyContent: 'center', marginTop: '0.5rem' }}
                  >
                    Generate & Send Verification OTP
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAdminForgotOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Live OTP Notification Simulation Banner */}
                  <div
                    style={{
                      background: 'rgba(147, 51, 234, 0.18)',
                      border: '1.5px solid rgba(147, 51, 234, 0.45)',
                      borderRadius: '10px',
                      padding: '0.85rem',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C084FC', marginBottom: '0.25rem' }}>
                      ✨ Live OTP Dispatch Simulation
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#E9D5FF' }}>
                      OTP generated for <strong>{forgotIdentifier}</strong>:
                    </div>
                    <div className="flex items-center gap-3" style={{ marginTop: '0.4rem' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '1.3rem',
                          fontWeight: 900,
                          letterSpacing: '3px',
                          background: '#0F172A',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          color: '#C084FC',
                          border: '1px solid rgba(147, 51, 234, 0.4)',
                        }}
                      >
                        {forgotOtpInfo.otp}
                      </span>
                      <button
                        type="button"
                        onClick={() => setForgotOtp(forgotOtpInfo.otp)}
                        className="btn btn-sm"
                        style={{ background: '#9333EA', color: '#FFF', fontWeight: 700, fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      >
                        Auto-Fill OTP
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                      6-Digit Verification OTP *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="123456"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        fontFamily: 'monospace',
                        fontSize: '1.1rem',
                        letterSpacing: '2px',
                        textAlign: 'center',
                        fontWeight: 700,
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        color: '#FFFFFF',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                      New Password * (Min. 6 chars)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                      <input
                        type="password"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        style={{
                          width: '100%',
                          padding: '0.65rem 1rem 0.65rem 2.4rem',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '10px',
                          color: '#FFFFFF',
                          fontSize: '0.88rem',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                      Confirm New Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                      <input
                        type="password"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        style={{
                          width: '100%',
                          padding: '0.65rem 1rem 0.65rem 2.4rem',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '10px',
                          color: '#FFFFFF',
                          fontSize: '0.88rem',
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-purple"
                    style={{ padding: '0.75rem', fontWeight: 700, justifyContent: 'center', marginTop: '0.5rem' }}
                  >
                    Verify OTP & Reset Password
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* --- REGISTRATION TAB --- */
            <div>
              <div
                style={{
                  background: 'rgba(147, 51, 234, 0.1)',
                  border: '1px solid rgba(147, 51, 234, 0.25)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.78rem',
                  color: '#D8B4FE',
                  marginBottom: '1.25rem',
                  lineHeight: '1.4',
                }}
              >
                🛡️ <strong>Super Admin Governance Policy:</strong> All admin staff registrations require explicit approval by the Super Admin before portal access is granted.
              </div>

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.3rem' }}>
                      Desired User ID *
                    </label>
                    <input
                      type="text"
                      value={regUserId}
                      onChange={(e) => setRegUserId(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                      placeholder="e.g. rahul_ops"
                      required
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.3rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Rahul Verma"
                      required
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.3rem' }}>
                    Corporate Work Email *
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. rahul.verma@kognitiminds.com"
                    required
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.3rem' }}>
                      Department *
                    </label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        background: '#1E293B',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '0.82rem',
                      }}
                    >
                      <option value="Operations & Logistics">Operations & Logistics</option>
                      <option value="Product Merchandising & Catalog">Product Merchandising & Catalog</option>
                      <option value="Institutional B2B Accounts">Institutional B2B Accounts</option>
                      <option value="Finance & Taxation">Finance & Taxation</option>
                      <option value="Executive Management">Executive Management</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.3rem' }}>
                      Requested Role *
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as AdminRole)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        background: '#1E293B',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '0.82rem',
                      }}
                    >
                      <option value="operations_admin">Operations Admin</option>
                      <option value="catalog_manager">Catalog Manager</option>
                      <option value="finance_admin">Finance Admin</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.3rem' }}>
                      Password *
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.3rem' }}>
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-purple"
                  style={{
                    padding: '0.75rem',
                    fontWeight: 700,
                    justifyContent: 'center',
                    marginTop: '0.75rem',
                  }}
                >
                  Submit Registration Request for Super Admin Approval
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
