import React from 'react';
import { X, ShieldCheck, FileText, Truck, RotateCcw, ExternalLink } from 'lucide-react';
import { LEGAL_POLICIES } from '../../data/legalPolicies';
import { getWhatsAppDisplayNumber, getTelUrl } from '../../config/whatsappConfig';

interface PolicyModalProps {
  type: 'privacy' | 'terms' | 'shipping' | 'refund';
  onClose: () => void;
  onOpenFullPage?: (type: 'privacy' | 'terms' | 'shipping' | 'refund') => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ type, onClose, onOpenFullPage }) => {
  const policy = LEGAL_POLICIES[type];

  const getIcon = () => {
    switch (type) {
      case 'privacy':
        return <ShieldCheck size={24} className="text-emerald-600" />;
      case 'terms':
        return <FileText size={24} className="text-blue-600" />;
      case 'shipping':
        return <Truck size={24} className="text-amber-600" />;
      case 'refund':
        return <RotateCcw size={24} className="text-purple-600" />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: '750px',
          width: '94%',
          padding: '2rem',
          position: 'relative',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
        }}
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
          aria-label="Close modal"
        >
          <X size={18} className="text-slate-600" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem', paddingRight: '2rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'var(--slate-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {getIcon()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.2 }}>
              {policy.title}
            </h2>
            <div style={{ fontSize: '0.76rem', color: 'var(--slate-500)', marginTop: '2px' }}>
              Effective: {policy.effectiveDate} | KOGNITI MINDS PRIVATE LIMITED
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div
          style={{
            fontSize: '0.86rem',
            color: 'var(--slate-700)',
            overflowY: 'auto',
            paddingRight: '0.5rem',
            flex: '1 1 auto',
            lineHeight: 1.65,
          }}
        >
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              color: '#334155',
            }}
          >
            {policy.summary}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {policy.sections.map((section) => (
              <div key={section.id}>
                {section.partTitle && (
                  <div
                    style={{
                      display: 'inline-block',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#065F46',
                      background: '#ECFDF5',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      marginBottom: '0.35rem',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {section.partTitle}
                  </div>
                )}
                <h4 style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.4rem', fontSize: '0.94rem' }}>
                  {section.title}
                </h4>
                {section.content.map((p, pIdx) => (
                  <p key={pIdx} style={{ marginBottom: '0.5rem', fontSize: '0.84rem' }}>
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul style={{ paddingLeft: '1.2rem', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
                    {section.bullets.map((b, bIdx) => (
                      <li key={bIdx} style={{ marginBottom: '0.25rem' }}>{b}</li>
                    ))}
                  </ul>
                )}
                {section.importantNotice && (
                  <div
                    style={{
                      background: '#FEF2F2',
                      borderLeft: '3px solid #EF4444',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0 6px 6px 0',
                      fontSize: '0.8rem',
                      color: '#991B1B',
                      fontWeight: 600,
                      marginTop: '0.4rem',
                    }}
                  >
                    {section.importantNotice}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Details (No "Officer" anywhere) */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#F1F5F9',
              borderRadius: '8px',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.4rem' }}>
              Policy & Grievance Contact:
            </div>
            <div>{policy.contact.entity}</div>
            <div>
              Email:{' '}
              <a href={`mailto:${policy.contact.email}`} style={{ color: '#0284C7', textDecoration: 'underline' }}>
                {policy.contact.email}
              </a>
            </div>
            <div>
              Phone:{' '}
              <a href={getTelUrl()} style={{ color: '#059669', fontWeight: 600 }}>
                {getWhatsAppDisplayNumber()}
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            marginTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {onOpenFullPage ? (
            <button
              onClick={() => {
                onClose();
                onOpenFullPage(type);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#065F46',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <ExternalLink size={14} /> Open Dedicated Page
            </button>
          ) : <div />}

          <button onClick={onClose} className="btn btn-primary btn-sm">
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};
