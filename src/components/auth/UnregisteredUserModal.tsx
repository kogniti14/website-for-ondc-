import React from 'react';
import { UserX, ArrowRight, X, AlertCircle, Building2, User } from 'lucide-react';

interface UnregisteredUserModalProps {
  identifier: string;
  portalType: 'b2c' | 'b2b';
  onClose: () => void;
  onRegisterNow: () => void;
}

export const UnregisteredUserModal: React.FC<UnregisteredUserModalProps> = ({
  identifier,
  portalType,
  onClose,
  onRegisterNow,
}) => {
  const isEmail = identifier.includes('@');
  const isB2B = portalType === 'b2b';
  const displayLabel = isEmail ? 'Email Address' : 'Mobile Number';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
          background: isB2B ? '#0F172A' : '#FFFFFF',
          color: isB2B ? '#FFFFFF' : 'var(--slate-900)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '430px',
          boxShadow: isB2B
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.15)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
          position: 'relative',
          animation: 'scaleUp 0.22s ease-out',
          border: isB2B ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
        }}
      >
        {/* Top close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: isB2B ? 'rgba(255, 255, 255, 0.1)' : 'var(--slate-100)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isB2B ? '#94A3B8' : 'var(--slate-500)',
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
              background: isB2B
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.3) 100%)'
                : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              border: isB2B ? '2px solid #F59E0B' : '2px solid #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: isB2B ? '#FBBF24' : '#D97706',
              boxShadow: '0 8px 16px -4px rgba(245, 158, 11, 0.25)',
            }}
          >
            {isB2B ? <Building2 size={30} /> : <UserX size={32} />}
          </div>

          {/* Heading */}
          <h3
            id="unregistered-modal-title"
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: isB2B ? '#FFFFFF' : 'var(--slate-900)',
              marginBottom: '0.4rem',
              letterSpacing: '-0.01em',
            }}
          >
            {isB2B ? 'Business Not Registered' : 'Account Not Registered'}
          </h3>

          {/* Input identifier display chip */}
          {identifier && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: isB2B ? 'rgba(255, 255, 255, 0.08)' : 'var(--slate-100)',
                color: isB2B ? '#E2E8F0' : 'var(--slate-700)',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                fontWeight: 600,
                marginBottom: '1rem',
                border: isB2B ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid var(--slate-200)',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: isB2B ? '#94A3B8' : 'var(--slate-400)', fontFamily: 'inherit', fontWeight: 500 }}>
                {displayLabel}:
              </span>
              <span>{identifier}</span>
            </div>
          )}

          {/* User Requested Notification Messages */}
          <div
            style={{
              background: isB2B ? 'rgba(245, 158, 11, 0.12)' : '#FFFBEB',
              border: isB2B ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #FDE68A',
              borderRadius: '12px',
              padding: '1.1rem 1rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '0.98rem',
                fontWeight: 700,
                color: isB2B ? '#FBBF24' : '#92400E',
                marginBottom: '0.4rem',
                lineHeight: 1.4,
              }}
            >
              “This mobile number or email address is not registered.”
            </div>
            <div
              style={{
                fontSize: '0.85rem',
                color: isB2B ? '#E2E8F0' : '#78350F',
                lineHeight: 1.45,
              }}
            >
              {isB2B
                ? '“Please register your business before signing in.”'
                : '“Please register your details before signing in.”'}
            </div>
          </div>

          {/* Single Prominent Action Button: Register Now -> */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button
              onClick={onRegisterNow}
              className={isB2B ? 'btn btn-amber' : 'btn btn-primary'}
              style={{
                width: '100%',
                padding: '0.85rem 1.25rem',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderRadius: '12px',
                boxShadow: isB2B
                  ? '0 4px 14px rgba(245, 158, 11, 0.3)'
                  : '0 4px 14px rgba(15, 23, 42, 0.15)',
                cursor: 'pointer',
              }}
            >
              <span>Register Now</span>
              <ArrowRight size={18} />
            </button>

            {/* Cancel Button */}
            <button
              onClick={onClose}
              type="button"
              style={{
                width: '100%',
                padding: '0.55rem',
                fontWeight: 600,
                fontSize: '0.82rem',
                background: 'transparent',
                border: 'none',
                color: isB2B ? '#94A3B8' : 'var(--slate-500)',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = isB2B ? '#FFFFFF' : 'var(--slate-800)';
                e.currentTarget.style.background = isB2B ? 'rgba(255, 255, 255, 0.06)' : 'var(--slate-100)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = isB2B ? '#94A3B8' : 'var(--slate-500)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Target Redirection Indicator */}
        <div
          style={{
            padding: '0.75rem 1rem',
            background: isB2B ? 'rgba(255, 255, 255, 0.04)' : 'var(--slate-50)',
            borderTop: isB2B ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--slate-100)',
            fontSize: '0.74rem',
            color: isB2B ? '#94A3B8' : 'var(--slate-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
          }}
        >
          {isB2B ? <Building2 size={13} style={{ color: '#F59E0B' }} /> : <User size={13} style={{ color: 'var(--primary)' }} />}
          <span>
            {isB2B
              ? 'Redirecting to “Registered Business” registration desk'
              : 'Redirecting to “New Customer” registration section'}
          </span>
        </div>
      </div>
    </div>
  );
};
