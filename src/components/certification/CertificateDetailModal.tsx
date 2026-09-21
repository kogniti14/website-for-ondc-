import React, { useEffect } from 'react';
import {
  X,
  FileText,
  ExternalLink,
  Download,
  Calendar,
  ShieldCheck,
  Building2,
  Share2,
  Check,
  AlertTriangle,
  Award,
  Lock,
} from 'lucide-react';
import { CompanyCertification } from '../../types';
import { certificationService } from '../../services/certificationService';

interface CertificateDetailModalProps {
  cert: CompanyCertification | null;
  onClose: () => void;
  isB2BMode?: boolean;
}

export const CertificateDetailModal: React.FC<CertificateDetailModalProps> = ({
  cert,
  onClose,
  isB2BMode = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!cert) return null;

  const validity = certificationService.computeValidityStatus(cert);
  const isPdf = cert.fileType === 'application/pdf';

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out ${cert.name} awarded to Kogniti Minds Private Limited by ${cert.issuingAuthority}:\n${cert.verificationUrl || window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const isDark = isB2BMode;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        zIndex: 1000,
        backgroundColor: 'rgba(10, 15, 29, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '20px',
          backgroundColor: isDark ? '#0F172A' : '#ffffff',
          color: isDark ? '#F1F5F9' : '#0F172A',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #E2E8F0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '2rem',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isDark ? '#CBD5E1' : '#475569',
            transition: 'all 0.15s ease',
          }}
          title="Close (Esc)"
        >
          <X size={18} />
        </button>

        {/* Category & Validity Strip */}
        <div className="flex items-center gap-2.5 flex-wrap" style={{ marginBottom: '0.75rem' }}>
          <span
            style={{
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
              color: isDark ? '#93C5FD' : '#1D4ED8',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {cert.category}
          </span>

          {cert.noExpiry ? (
            <span
              style={{
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                color: isDark ? '#34D399' : '#047857',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <ShieldCheck size={13} /> Permanent / Lifetime Validity
            </span>
          ) : validity === 'expired' ? (
            <span
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#F87171',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
              }}
            >
              Expired ({cert.expiryDate})
            </span>
          ) : (
            <span
              style={{
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                color: isDark ? '#34D399' : '#047857',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Check size={13} /> Valid until {cert.expiryDate}
            </span>
          )}

          {cert.featured && (
            <span
              style={{
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
                color: isDark ? '#FCD34D' : '#B45309',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
              }}
            >
              ★ FEATURED TRUST ACCREDITATION
            </span>
          )}
        </div>

        {/* Certificate Title */}
        <h2
          style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            lineHeight: '1.25',
            color: isDark ? '#FFFFFF' : '#0F172A',
            marginBottom: '0.5rem',
            paddingRight: '2.5rem',
          }}
        >
          {cert.name}
        </h2>

        {/* Issuing Authority Subtitle */}
        <div
          className="flex items-center gap-2"
          style={{
            fontSize: '0.9rem',
            color: isDark ? '#94A3B8' : '#64748B',
            marginBottom: '1.5rem',
          }}
        >
          <Building2 size={16} className="text-emerald-500" />
          <span>Issued by <strong>{cert.issuingAuthority}</strong></span>
        </div>

        {/* Document Display Preview Container */}
        <div
          style={{
            borderRadius: '14px',
            overflow: 'hidden',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0',
            backgroundColor: isDark ? '#090D16' : '#F8FAFC',
            marginBottom: '1.5rem',
            minHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            position: 'relative',
          }}
        >
          {isPdf ? (
            <div style={{ textAlign: 'center', maxWidth: '480px' }}>
              <div
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '18px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <FileText size={42} style={{ color: '#EF4444' }} />
              </div>
              <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: isDark ? '#FFFFFF' : '#0F172A' }}>
                Official Document (PDF)
              </h4>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: isDark ? '#94A3B8' : '#64748B',
                  margin: '0.4rem 0 1rem',
                  lineHeight: '1.5',
                }}
              >
                The authentic compliance certification is preserved in high-resolution vector PDF format for verification and procurement audit.
              </p>
              <div style={{ width: '100%', marginBottom: '1rem' }}>
                <iframe
                  src={cert.fileUrl}
                  title={cert.name}
                  style={{
                    width: '100%',
                    height: '48vh',
                    minHeight: '340px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                  }}
                />
              </div>
              <div className="flex justify-center gap-3 flex-wrap">
                <button
                  onClick={() => window.open(cert.fileUrl, '_blank')}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.4rem' }}
                >
                  <ExternalLink size={14} /> View Original Document
                </button>
                {cert.allowDownload && (
                  <a
                    href={cert.fileUrl}
                    download={`${cert.slug}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#CBD5E1',
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      gap: '0.4rem',
                    }}
                  >
                    <Download size={14} /> Download PDF
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <img
                key={cert.fileUrl}
                src={cert.fileUrl}
                alt={cert.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '380px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              />
              <div style={{ marginTop: '0.85rem' }}>
                <button
                  onClick={() => window.open(cert.fileUrl, '_blank')}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.78rem' }}
                >
                  <ExternalLink size={13} /> Open Full High-Res Image
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Key Verification & Registration Metadata Grid */}
        <div
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            fontSize: '0.84rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.76rem', fontWeight: 600 }}>
              Certificate / Reg Number
            </div>
            <div
              style={{
                fontWeight: 800,
                color: isDark ? '#60A5FA' : '#1D4ED8',
                fontFamily: 'monospace',
                fontSize: '0.92rem',
                marginTop: '0.15rem',
              }}
            >
              {cert.certificateNumber || 'Verified Registration on File'}
            </div>
          </div>

          <div>
            <div style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.76rem', fontWeight: 600 }}>
              Issue Date
            </div>
            <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', marginTop: '0.15rem' }}>
              {cert.issueDate}
            </div>
          </div>

          <div>
            <div style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.76rem', fontWeight: 600 }}>
              Validity Period
            </div>
            <div style={{ fontWeight: 700, color: isDark ? '#34D399' : '#047857', marginTop: '0.15rem' }}>
              {cert.noExpiry ? 'Permanent / Lifetime' : cert.expiryDate}
            </div>
          </div>

          <div>
            <div style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.76rem', fontWeight: 600 }}>
              Applicable Portals
            </div>
            <div style={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#334155', marginTop: '0.15rem' }}>
              {cert.visibility === 'both' ? 'B2B Wholesale & B2C Retail' : cert.visibility === 'b2b' ? 'B2B Enterprise Only' : 'B2C Retail Only'}
            </div>
          </div>
        </div>

        {/* Short & Full Descriptions */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.5rem', color: isDark ? '#FFFFFF' : '#0F172A' }}>
            Accreditation Overview
          </h4>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: isDark ? '#CBD5E1' : '#334155', marginBottom: '1rem' }}>
            {cert.shortDescription}
          </p>

          {cert.fullDescription && (
            <div
              style={{
                whiteSpace: 'pre-line',
                fontSize: '0.88rem',
                lineHeight: '1.65',
                color: isDark ? '#94A3B8' : '#475569',
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.25)' : '#F1F5F9',
                padding: '1.25rem',
                borderRadius: '10px',
                borderLeft: '4px solid #10B981',
              }}
            >
              {cert.fullDescription}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className="flex items-center justify-between gap-4 flex-wrap"
          style={{
            borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0',
            paddingTop: '1.25rem',
            marginTop: '1.5rem',
          }}
        >
          {/* Social / Sharing */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="btn btn-outline btn-sm"
              style={{
                fontSize: '0.78rem',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0',
                color: '#22C55E',
              }}
              title="Share on WhatsApp"
            >
              Share WhatsApp
            </button>
            <button
              onClick={handleCopyLink}
              className="btn btn-outline btn-sm"
              style={{
                fontSize: '0.78rem',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0',
                color: isDark ? '#CBD5E1' : '#475569',
              }}
              title="Copy Page Link"
            >
              {copied ? <Check size={13} style={{ color: '#10B981' }} /> : <Share2 size={13} />}
              {copied ? 'Copied' : 'Share'}
            </button>
          </div>

          {/* Primary Actions */}
          <div className="flex items-center gap-3">
            {cert.verificationUrl && (
              <a
                href={cert.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{
                  color: isDark ? '#60A5FA' : '#2563EB',
                  borderColor: isDark ? 'rgba(96, 165, 250, 0.4)' : '#BFDBFE',
                  fontWeight: 700,
                  gap: '0.35rem',
                }}
              >
                <ExternalLink size={14} /> Verify on Authority Portal →
              </a>
            )}

            {cert.allowDownload && (
              <a
                href={cert.fileUrl}
                download={`${cert.slug}.${isPdf ? 'pdf' : 'png'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ gap: '0.4rem' }}
              >
                <Download size={14} /> Download Certificate
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
