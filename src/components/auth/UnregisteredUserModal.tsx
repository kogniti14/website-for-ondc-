import React from 'react';
import { UserX, UserPlus, ArrowRight, X, AlertCircle } from 'lucide-react';

interface UnregisteredUserModalProps {
  identifier: string;
  portalName?: string;
  onClose: () => void;
  onCreateAccount: () => void;
  onRegisterNow: () => void;
}

export const UnregisteredUserModal: React.FC<UnregisteredUserModalProps> = ({
  identifier,
  portalName = 'Kogniti Minds',
  onClose,
  onCreateAccount,
  onRegisterNow,
}) => {
  const isEmail = identifier.includes('@');
  const displayLabel = isEmail ? 'Email Address' : 'Mobile Number';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="unregistered-modal-title"
    >
      <div
        style={{
          background: '#FFFFFF',
          color: 'var(--slate-900)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '430px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          position: 'relative',
          animation: 'scaleUp 0.22s ease-out',
        }}
      >
        {/* Top close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'var(--slate-100)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--slate-500)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          aria-label="Close popup"
        >
          <X size={18} />
        </button>

        <div style={{ padding: '2rem 1.75rem 1.5rem', textAlign: 'center' }}>
          {/* Visual Alert Emblem */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              border: '2px solid #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#D97706',
              boxShadow: '0 8px 16px -4px rgba(245, 158, 11, 0.25)',
            }}
          >
            <UserX size={32} />
          </div>

          {/* Heading */}
          <h3
            id="unregistered-modal-title"
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--slate-900)',
              marginBottom: '0.5rem',
              letterSpacing: '-0.01em',
            }}
          >
            Account Not Registered
          </h3>

          {/* Input verification chip */}
          {identifier && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'var(--slate-100)',
                color: 'var(--slate-700)',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                fontWeight: 600,
                marginBottom: '1rem',
                border: '1px solid var(--slate-200)',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: 'var(--slate-400)', fontFamily: 'inherit', fontWeight: 500 }}>
                {displayLabel}:
              </span>
              <span>{identifier}</span>
            </div>
          )}

          {/* User Requested Notification Messages */}
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '0.98rem',
                fontWeight: 700,
                color: '#92400E',
                marginBottom: '0.35rem',
                lineHeight: 1.4,
              }}
            >
              “This mobile number/email address is not registered.”
            </div>
            <div
              style={{
                fontSize: '0.84rem',
                color: '#78350F',
                lineHeight: 1.45,
              }}
            >
              Please register your details or create a new account before signing in.
            </div>
          </div>

          {/* Action Buttons: Create Account, Register Now, Cancel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {/* 1. Create Account */}
            <button
              onClick={onCreateAccount}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.8rem',
                fontWeight: 700,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
              }}
            >
              <UserPlus size={18} />
              <span>Create Account</span>
            </button>

            {/* 2. Register Now */}
            <button
              onClick={onRegisterNow}
              className="btn btn-outline"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontWeight: 700,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderRadius: '10px',
                borderColor: 'var(--slate-300)',
                color: 'var(--slate-800)',
                background: 'var(--slate-50)',
              }}
            >
              <span>Register Now</span>
              <ArrowRight size={16} />
            </button>

            {/* 3. Cancel */}
            <button
              onClick={onClose}
              type="button"
              style={{
                width: '100%',
                padding: '0.65rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--slate-500)',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'all 0.15s ease',
                marginTop: '0.25rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--slate-800)';
                e.currentTarget.style.background = 'var(--slate-100)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--slate-500)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Brand Assurance strip */}
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'var(--slate-50)',
            borderTop: '1px solid var(--slate-100)',
            fontSize: '0.72rem',
            color: 'var(--slate-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
          }}
        >
          <AlertCircle size={13} style={{ color: 'var(--slate-400)' }} />
          <span>Quick registration takes less than 30 seconds on {portalName}</span>
        </div>
      </div>
    </div>
  );
};
