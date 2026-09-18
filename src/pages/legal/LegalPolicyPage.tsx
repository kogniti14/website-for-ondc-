import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  RotateCcw,
  Truck,
  Printer,
  Copy,
  Check,
  Clock,
  Building2,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  AlertTriangle,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { LEGAL_POLICIES, LegalPolicy } from '../../data/legalPolicies';
import { getWhatsAppUrl, getWhatsAppDisplayNumber, getTelUrl } from '../../config/whatsappConfig';

interface LegalPolicyPageProps {
  initialPolicy?: 'terms' | 'privacy' | 'refund' | 'shipping';
  onBackHome?: () => void;
  onNavigatePolicy?: (policyId: 'terms' | 'privacy' | 'refund' | 'shipping') => void;
}

export const LegalPolicyPage: React.FC<LegalPolicyPageProps> = ({
  initialPolicy = 'terms',
  onBackHome,
  onNavigatePolicy,
}) => {
  const [activePolicyId, setActivePolicyId] = useState<'terms' | 'privacy' | 'refund' | 'shipping'>(initialPolicy);
  const [copiedLink, setCopiedLink] = useState(false);

  // Synchronize if initialPolicy prop changes
  useEffect(() => {
    if (initialPolicy) {
      setActivePolicyId(initialPolicy);
    }
  }, [initialPolicy]);

  // Read URL hash on mount if present (e.g. #refund, #privacy)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash === 'terms' || hash === 'privacy' || hash === 'refund' || hash === 'shipping') {
      setActivePolicyId(hash);
    }
  }, []);

  const currentPolicy: LegalPolicy = LEGAL_POLICIES[activePolicyId];

  const handleSelectPolicy = (id: 'terms' | 'privacy' | 'refund' | 'shipping') => {
    setActivePolicyId(id);
    if (onNavigatePolicy) {
      onNavigatePolicy(id);
    }
    // Update hash smoothly without full reload
    window.history.replaceState(null, '', `#${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#${activePolicyId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getPolicyIcon = (id: string, size = 20) => {
    switch (id) {
      case 'terms':
        return <FileText size={size} />;
      case 'privacy':
        return <ShieldCheck size={size} />;
      case 'refund':
        return <RotateCcw size={size} />;
      case 'shipping':
        return <Truck size={size} />;
      default:
        return <FileText size={size} />;
    }
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* 1. Header Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0A0F1D 0%, #064E3B 50%, #022C22 100%)',
          color: '#FFFFFF',
          padding: '3.5rem 1.25rem 3rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '5%',
            width: '380px',
            height: '380px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0) 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.82rem',
              color: '#94A3B8',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={onBackHome}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.82rem',
              }}
            >
              Home
            </button>
            <ChevronRight size={14} />
            <span style={{ color: '#CBD5E1' }}>Legal & Policies</span>
            <ChevronRight size={14} />
            <span style={{ color: '#34D399', fontWeight: 600 }}>{currentPolicy.shortTitle}</span>
          </nav>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '0.85rem' }}>
            <span
              style={{
                background: 'rgba(52, 211, 153, 0.15)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                color: '#34D399',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Official Statutory Policy
            </span>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#E2E8F0',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.74rem',
                fontWeight: 600,
              }}
            >
              Applies to B2C & B2B Transactions
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#94A3B8',
                fontSize: '0.76rem',
              }}
            >
              <Clock size={13} /> Effective: {currentPolicy.effectiveDate}
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '0.75rem',
              lineHeight: 1.2,
            }}
          >
            {currentPolicy.title}
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
              color: '#CBD5E1',
              maxWidth: '850px',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            {currentPolicy.summary}
          </p>

          {/* Action Row */}
          <div className="flex items-center gap-3 flex-wrap" style={{ paddingTop: '0.5rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
              }}
              title="Print or Save as PDF"
            >
              <Printer size={15} /> Print / Save PDF
            </button>

            <button
              onClick={handleCopyLink}
              className="btn btn-sm"
              style={{
                backgroundColor: copiedLink ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.12)',
                color: copiedLink ? '#34D399' : '#FFFFFF',
                border: copiedLink ? '1px solid #34D399' : '1px solid rgba(255, 255, 255, 0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
                transition: 'all 0.2s ease',
              }}
              title="Copy shareable link"
            >
              {copiedLink ? <Check size={15} /> : <Copy size={15} />}
              {copiedLink ? 'Link Copied!' : 'Copy Direct Link'}
            </button>

            <a
              href={getWhatsAppUrl(`Hello Kogniti Minds, I have a query regarding the ${currentPolicy.shortTitle}.`)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#25D366',
                color: '#0A0F1D',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                textDecoration: 'none',
              }}
            >
              <MessageCircle size={15} /> WhatsApp Support
            </a>
          </div>
        </div>
      </section>

      {/* 2. Policy Switcher Navigation Bar (Sticky) */}
      <div
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              padding: '0.75rem 0',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {(Object.keys(LEGAL_POLICIES) as Array<'terms' | 'privacy' | 'refund' | 'shipping'>).map((key) => {
              const pol = LEGAL_POLICIES[key];
              const isActive = activePolicyId === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectPolicy(key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.55rem 1.1rem',
                    borderRadius: '8px',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    background: isActive ? '#064E3B' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#475569',
                    boxShadow: isActive ? '0 2px 6px rgba(6, 78, 59, 0.25)' : 'none',
                  }}
                >
                  <span style={{ display: 'inline-flex', color: isActive ? '#34D399' : '#64748B' }}>
                    {getPolicyIcon(key, 16)}
                  </span>
                  {pol.shortTitle}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Main Policy Content Layout */}
      <div className="container" style={{ maxWidth: '1200px', margin: '2rem auto 0', padding: '0 1.25rem' }}>
        {/* Critical Notice Callout Banners for High-Impact Policies */}
        {activePolicyId === 'refund' && (
          <div
            style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#991B1B', marginBottom: '0.35rem' }}>
                CRITICAL NOTICE: STRICT 2-CALENDAR-DAY CLAIM WINDOW & UNBOXING VIDEO
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#7F1D1D', lineHeight: 1.55 }}>
                All claims regarding visible package damage, shortages, missing components, wrong SKUs, or tampering must be formally submitted within <strong>2 calendar days</strong> from recorded carrier delivery. To ensure valid verification, customers must record a <strong>continuous, unedited unboxing/unloading video</strong> showing intact shipping labels, sealed outer tape, and the full unboxing process.
              </p>
            </div>
          </div>
        )}

        {activePolicyId === 'shipping' && (
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Truck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#92400E', marginBottom: '0.35rem' }}>
                B2B, BULK FREIGHT & PALLET SHIPMENT UNLOADING TERMS
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#78350F', lineHeight: 1.55 }}>
                Institutional and wholesale orders shipped via surface freight (LTL/FTL) require destination-site unloading facilities. Unless explicitly agreed otherwise in writing, B2B buyers are responsible for forklifts, trolleys, labor, and authorized receiving personnel at the delivery premises.
              </p>
            </div>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: '2rem',
          }}
        >
          {/* Main Legal Document Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: 'clamp(1.5rem, 3vw, 2.75rem)',
              boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Document Meta Header */}
            <div
              style={{
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  KOGNITI MINDS PRIVATE LIMITED
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  {currentPolicy.title}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#64748B' }}>
                <div><strong>Effective Date:</strong> {currentPolicy.effectiveDate}</div>
                <div><strong>Last Updated:</strong> {currentPolicy.lastUpdated}</div>
              </div>
            </div>

            {/* Structured Sections Loop */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {currentPolicy.sections.map((section, idx) => (
                <div
                  key={section.id}
                  id={section.id}
                  style={{
                    borderBottom: idx < currentPolicy.sections.length - 1 ? '1px solid #F1F5F9' : 'none',
                    paddingBottom: idx < currentPolicy.sections.length - 1 ? '1.75rem' : '0',
                  }}
                >
                  {section.partTitle && (
                    <div
                      style={{
                        display: 'inline-block',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#065F46',
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        marginBottom: '0.6rem',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {section.partTitle}
                    </div>
                  )}

                  <h2
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      marginBottom: '0.85rem',
                      lineHeight: 1.35,
                    }}
                  >
                    {section.title}
                  </h2>

                  {section.content.map((paragraph, pIdx) => (
                    <p
                      key={pIdx}
                      style={{
                        fontSize: '0.9rem',
                        color: '#334155',
                        lineHeight: 1.7,
                        marginBottom: pIdx < section.content.length - 1 ? '0.75rem' : '0',
                      }}
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets && section.bullets.length > 0 && (
                    <ul
                      style={{
                        marginTop: '0.75rem',
                        marginBottom: '0.5rem',
                        paddingLeft: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      {section.bullets.map((bullet, bIdx) => (
                        <li
                          key={bIdx}
                          style={{
                            fontSize: '0.88rem',
                            color: '#475569',
                            lineHeight: 1.6,
                          }}
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.importantNotice && (
                    <div
                      style={{
                        marginTop: '1rem',
                        background: '#F0FDF4',
                        borderLeft: '4px solid #10B981',
                        padding: '0.85rem 1rem',
                        borderRadius: '0 8px 8px 0',
                        fontSize: '0.84rem',
                        color: '#065F46',
                        fontWeight: 600,
                        lineHeight: 1.5,
                      }}
                    >
                      {section.importantNotice}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Official Contact Section (No "Officer" anywhere) */}
            <div
              style={{
                marginTop: '3rem',
                borderTop: '2px solid #E2E8F0',
                paddingTop: '2rem',
                background: '#F8FAFC',
                borderRadius: '12px',
                padding: '1.75rem',
                border: '1px solid #E2E8F0',
              }}
            >
              <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                <Building2 size={20} className="text-emerald-600" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                  Policy, Support & Grievance Contact
                </h3>
              </div>

              <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                For any formal claims, return authorizations, data privacy requests, commercial disputes, or statutory enquiries relating to this Policy, please direct your communication with complete documentation to:
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>COMPANY ENTITY</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                    {currentPolicy.contact.entity}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>
                    CIN: U46496UP2024PTC213997 | PAN: AALCK4750F
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>DIRECT ASSISTANCE</div>
                  <div className="flex items-center gap-2" style={{ marginTop: '4px', fontSize: '0.86rem' }}>
                    <Mail size={14} className="text-blue-600" />
                    <a href={`mailto:${currentPolicy.contact.email}`} style={{ color: '#0284C7', fontWeight: 600, textDecoration: 'underline' }}>
                      {currentPolicy.contact.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2" style={{ marginTop: '4px', fontSize: '0.86rem' }}>
                    <Phone size={14} className="text-emerald-600" />
                    <a href={getTelUrl()} style={{ color: '#059669', fontWeight: 700 }}>
                      {currentPolicy.contact.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.82rem',
                  color: '#475569',
                }}
              >
                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-amber-600" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>Registered Office (Uttar Pradesh):</div>
                      <div>{currentPolicy.contact.addressUP}</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-emerald-600" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>Operational Office (Bihar):</div>
                      <div>{currentPolicy.contact.addressBihar}</div>
                    </div>
                  </div>
                </div>
              </div>

              {currentPolicy.contact.guidance && (
                <div style={{ fontSize: '0.78rem', color: '#64748B', background: '#FFFFFF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <strong>Mandatory details to include with your communication:</strong>
                  <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {currentPolicy.contact.guidance.map((item, gIdx) => (
                      <li key={gIdx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
