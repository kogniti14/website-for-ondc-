import React from 'react';
import {
  Cloud,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Save,
  ExternalLink,
  ShieldCheck,
  Layers,
  X,
  RefreshCw,
} from 'lucide-react';

export interface StagedManifestItem {
  label: string;
  count: number | string;
}

export interface PublishSummaryData {
  isOpen: boolean;
  publishedAt: string;
  syncedSections: string[];
  details: StagedManifestItem[];
}

interface AdminPublishHeaderBarProps {
  stagedSections: Set<string>;
  isPublishing: boolean;
  onFinalPublish: () => Promise<void>;
  onDiscardStaged: () => void;
  onForceSyncAll: () => Promise<void>;
}

export const AdminPublishHeaderBar: React.FC<AdminPublishHeaderBarProps> = ({
  stagedSections,
  isPublishing,
  onFinalPublish,
  onDiscardStaged,
  onForceSyncAll,
}) => {
  const hasStaged = stagedSections.size > 0;

  const getSectionFriendlyName = (key: string): string => {
    switch (key) {
      case 'products':
        return 'Products';
      case 'categories':
        return 'Categories';
      case 'media':
        return 'Site Media';
      case 'certifications':
        return 'Certificates';
      case 'cert_categories':
        return 'Cert. Categories';
      case 'testimonials':
        return 'Testimonials & Content';
      case 'coupons':
        return 'Promotions';
      case 'policies':
        return 'Policies';
      case 'razorpay':
        return 'Payment Config';
      case 'gallery':
        return 'Stories & Gallery';
      case 'settings':
        return 'Global Settings';
      default:
        return key.charAt(0).toUpperCase() + key.slice(1);
    }
  };

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        backgroundColor: hasStaged ? '#0F172A' : '#1E293B',
        borderBottom: hasStaged ? '2px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: hasStaged
          ? '0 10px 25px -5px rgba(245, 158, 11, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
        padding: '0.65rem 1rem',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        {/* Left: Real-time Cloud Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: hasStaged ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: hasStaged ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '9999px',
              padding: '0.25rem 0.75rem',
              color: hasStaged ? '#FCD34D' : '#6EE7B7',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: hasStaged ? '#F59E0B' : '#10B981',
                boxShadow: hasStaged ? '0 0 8px #F59E0B' : '0 0 8px #10B981',
                animation: hasStaged ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
              }}
            />
            {hasStaged ? (
              <span>{stagedSections.size} SECTION{stagedSections.size === 1 ? '' : 'S'} STAGED FOR PUBLICATION</span>
            ) : (
              <span>PRODUCTION SYNC ACTIVE & VERIFIED</span>
            )}
          </div>

          {/* Staged Section Tags */}
          {hasStaged ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Pending Live Sync:</span>
              {Array.from(stagedSections).map((secKey) => (
                <span
                  key={secKey}
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    color: '#FEF3C7',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    padding: '0.15rem 0.5rem',
                    fontWeight: 600,
                  }}
                >
                  {getSectionFriendlyName(secKey)}
                </span>
              ))}
            </div>
          ) : (
            <span style={{ color: '#94A3B8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} color="#10B981" />
              Live Hostinger & Firebase Realtime Database in sync
            </span>
          )}
        </div>

        {/* Right: Primary Publish & Secondary Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {hasStaged && (
            <button
              onClick={onDiscardStaged}
              disabled={isPublishing}
              title="Discard staged local changes and reload authoritative state from production"
              style={{
                backgroundColor: 'rgba(100, 116, 139, 0.2)',
                color: '#CBD5E1',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <RotateCcw size={13} />
              Discard Staged
            </button>
          )}

          <button
            onClick={onForceSyncAll}
            disabled={isPublishing}
            title="Force immediate two-way synchronization of all platform entities to live cloud"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#93C5FD',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={13} className={isPublishing ? 'animate-spin' : ''} />
            Force Live Sync
          </button>

          <button
            onClick={onFinalPublish}
            disabled={isPublishing}
            style={{
              background: hasStaged
                ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                : 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '0.45rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: isPublishing ? 'not-allowed' : 'pointer',
              boxShadow: hasStaged
                ? '0 0 15px rgba(16, 185, 129, 0.5)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              opacity: isPublishing ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {isPublishing ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Publishing to Live Production...</span>
              </>
            ) : hasStaged ? (
              <>
                <UploadCloud size={16} />
                <span>Final Save & Publish to Live</span>
              </>
            ) : (
              <>
                <Cloud size={16} />
                <span>Sync All to Live</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface AdminSectionSaveBarProps {
  sectionKey: string;
  sectionTitle: string;
  isStaged: boolean;
  itemCount?: number | string;
  onSaveSection: () => void | Promise<void>;
  primaryAction?: React.ReactNode;
  subtitle?: string;
  feedbackMessage?: { type: 'success' | 'error'; message: string } | null;
}

export const AdminSectionSaveBar: React.FC<AdminSectionSaveBarProps> = ({
  sectionKey,
  sectionTitle,
  isStaged,
  itemCount,
  onSaveSection,
  primaryAction,
  subtitle,
  feedbackMessage,
}) => {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      await onSaveSection();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem 1.25rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: isStaged ? '1.5px solid #F59E0B' : '1px solid var(--border-color)',
          boxShadow: isStaged
            ? '0 4px 14px -2px rgba(245, 158, 11, 0.15)'
            : '0 2px 4px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.2s ease',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--slate-800)' }}>
              {sectionTitle}
            </h2>
            {itemCount !== undefined && (
              <span
                style={{
                  backgroundColor: 'var(--slate-100)',
                  color: 'var(--slate-700)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--slate-200)',
                }}
              >
                {itemCount}
              </span>
            )}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                backgroundColor: isStaged ? '#FEF3C7' : '#ECFDF5',
                color: isStaged ? '#92400E' : '#065F46',
                border: isStaged ? '1px solid #FDE68A' : '1px solid #A7F3D0',
              }}
            >
              {isStaged ? (
                <>
                  <AlertCircle size={12} /> Staged for Publish
                </>
              ) : (
                <>
                  <CheckCircle2 size={12} /> Production Synced
                </>
              )}
            </span>
          </div>
          {subtitle && (
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.825rem', color: 'var(--slate-500)' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            style={{
              backgroundColor: isStaged ? '#D97706' : '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'background 0.2s',
            }}
          >
            <Save size={15} />
            <span>{isSaving ? 'Saving...' : `Save ${sectionTitle} Changes`}</span>
          </button>

          {primaryAction}
        </div>
      </div>

      {/* Inline Feedback Banner */}
      {feedbackMessage && (
        <div
          style={{
            marginTop: '0.65rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: feedbackMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            border: feedbackMessage.type === 'success' ? '1px solid #A7F3D0' : '1px solid #FECACA',
            color: feedbackMessage.type === 'success' ? '#065F46' : '#991B1B',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {feedbackMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{feedbackMessage.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface AdminPublishSummaryModalProps {
  data: PublishSummaryData | null;
  onClose: () => void;
}

export const AdminPublishSummaryModal: React.FC<AdminPublishSummaryModalProps> = ({ data, onClose }) => {
  if (!data || !data.isOpen) return null;

  const formattedDate = new Date(data.publishedAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

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
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '560px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #065F46 0%, #047857 50%, #059669 100%)',
            color: '#FFFFFF',
            padding: '1.5rem',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              Published to Live Production!
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9, lineHeight: 1.4 }}>
            All administrative changes have been securely synchronized to both the production database and live website.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Status Indicators */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '10px',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={18} color="#059669" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Hostinger CDN / LiteSpeed</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065F46' }}>Active & Live</div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '10px',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={18} color="#059669" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Firebase Realtime DB</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065F46' }}>Real-time Synchronized</div>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Synchronized Entities
            </h4>
            <div
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              {data.details.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    backgroundColor: idx % 2 === 0 ? '#FFFFFF' : 'var(--slate-50)',
                    borderBottom: idx === data.details.length - 1 ? 'none' : '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>{item.label}</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: '#047857',
                      backgroundColor: '#ECFDF5',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                    }}
                  >
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timestamp Notice */}
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '1.25rem', textAlign: 'center' }}>
            Published on: <strong>{formattedDate}</strong>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a
              href="https://kognitiminds.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                borderRadius: '10px',
                padding: '0.65rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={16} /> View Live Website
            </a>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                backgroundColor: 'var(--slate-100)',
                color: 'var(--slate-700)',
                border: '1px solid var(--slate-300)',
                borderRadius: '10px',
                padding: '0.65rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Done & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
