import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  FileText,
  ExternalLink,
  Download,
  Search,
  CheckCircle2,
  Award,
  ArrowRight,
  Sparkles,
  Lock,
  Tag,
} from 'lucide-react';
import { CompanyCertification } from '../../types';
import { certificationService } from '../../services/certificationService';

interface B2BCertificationsPageProps {
  onOpenCertificate: (cert: CompanyCertification) => void;
}

export const B2BCertificationsPage: React.FC<B2BCertificationsPageProps> = ({
  onOpenCertificate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Query published certificates visible on B2B portal
  const allB2BCerts = certificationService.getCertificates({
    visibility: 'b2b',
    status: 'published',
  });

  const categories = certificationService.getCategories();

  const filteredCerts = allB2BCerts.filter((cert) => {
    const matchesCat = selectedCategory === 'All' || cert.category.toLowerCase() === selectedCategory.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      cert.name.toLowerCase().includes(q) ||
      cert.issuingAuthority.toLowerCase().includes(q) ||
      (cert.certificateNumber && cert.certificateNumber.toLowerCase().includes(q)) ||
      cert.shortDescription.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ backgroundColor: '#090D16', color: '#F1F5F9', minHeight: '85vh', paddingBottom: '5rem' }}>
      {/* Hero Corporate Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0A0F1D 0%, #064E3B 60%, #0F172A 100%)',
          padding: '4rem 1.25rem 3.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
        }}
      >
        <div className="container" style={{ maxWidth: '900px', textAlign: 'center' }}>
          <div
            className="flex items-center justify-center gap-2"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34D399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '0.35rem 0.9rem',
              borderRadius: '999px',
              fontSize: '0.76rem',
              fontWeight: 800,
              display: 'inline-flex',
              marginBottom: '1rem',
              letterSpacing: '0.04em',
            }}
          >
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>ENTERPRISE COMPLIANCE & REGULATORY ASSURANCE</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 2.85rem)',
              fontWeight: 900,
              lineHeight: '1.2',
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}
          >
            Certifications & Statutory Compliance
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              color: '#94A3B8',
              lineHeight: '1.6',
              maxWidth: '720px',
              margin: '0 auto',
            }}
          >
            Streamlined procurement credibility for institutional buyers, educational boards, and government tender authorities. Verified MSME, ISO 9001/14001, GeM OEM, and UPPCB consent filings.
          </p>

          {/* Corporate Trust Badges Ribbon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              marginTop: '2rem',
              flexWrap: 'wrap',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#CBD5E1',
            }}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-400" /> GeM OEM Registered
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-400" /> ISO 9001:2015 QMS
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-400" /> DPIIT Recognized Cleantech
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-400" /> GST Input Credit Ready
            </span>
          </div>
        </div>
      </section>

      {/* Main Filter & Listing Section */}
      <div className="container" style={{ marginTop: '-1.5rem', position: 'relative', zIndex: 10 }}>
        {/* Search & Category Filter Controls */}
        <div
          style={{
            backgroundColor: '#0F172A',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div style={{ position: 'relative', flex: '1 1 280px' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748B',
                }}
              />
              <input
                type="text"
                placeholder="Search by statutory name, tender registration #, or issuing body..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 42px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '0.88rem',
                }}
              />
            </div>

            <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>
              {filteredCerts.length} Corporate Accreditations Listed
            </div>
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingTop: '1rem',
              marginTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              onClick={() => setSelectedCategory('All')}
              style={{
                padding: '0.4rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedCategory === 'All' ? '#10B981' : 'rgba(255, 255, 255, 0.06)',
                color: selectedCategory === 'All' ? '#FFFFFF' : '#CBD5E1',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              All Accreditations ({allB2BCerts.length})
            </button>

            {categories.map((cat) => {
              const count = allB2BCerts.filter((c) => c.category.toLowerCase() === cat.name.toLowerCase()).length;
              if (count === 0) return null;

              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  style={{
                    padding: '0.4rem 0.95rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#10B981' : 'rgba(255, 255, 255, 0.06)',
                    color: isSelected ? '#FFFFFF' : '#CBD5E1',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Certifications Card Grid */}
        {filteredCerts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              backgroundColor: '#0F172A',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <FileText size={48} style={{ color: '#475569', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              No B2B Certifications Found
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: '0.4rem 0 1.5rem' }}>
              Try adjusting your search terms or selecting another category.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="btn btn-primary btn-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {filteredCerts.map((cert) => {
              const isPdf = cert.fileType === 'application/pdf';

              return (
                <div
                  key={cert.id}
                  style={{
                    backgroundColor: '#0F172A',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Top Preview */}
                  <div
                    style={{
                      height: '190px',
                      backgroundColor: isPdf ? 'rgba(239, 68, 68, 0.08)' : '#1E293B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => onOpenCertificate(cert)}
                  >
                    {isPdf ? (
                      <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div
                          style={{
                            width: '58px',
                            height: '58px',
                            borderRadius: '14px',
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.5rem',
                          }}
                        >
                          <FileText size={32} style={{ color: '#F87171' }} />
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#FCA5A5' }}>
                          Official Document (PDF)
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                          Preserved original vector file
                        </div>
                      </div>
                    ) : (
                      <img
                        src={cert.fileUrl}
                        alt={cert.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}

                    {/* Category Tag */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        color: '#34D399',
                        backdropFilter: 'blur(6px)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(52, 211, 153, 0.2)',
                      }}
                    >
                      {cert.category}
                    </div>

                    {/* Featured Pill */}
                    {cert.featured && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          backgroundColor: '#D97706',
                          color: '#FFFFFF',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                        }}
                      >
                        <Sparkles size={11} /> FEATURED
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ padding: '1.35rem', flex: '1', display: 'flex', flexDirection: 'column' }}>
                    <div className="flex items-center justify-between gap-2" style={{ marginBottom: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          color: '#94A3B8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <Building2 size={13} className="text-emerald-400" />
                        <span style={{ maxWidth: '190px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cert.issuingAuthority}
                        </span>
                      </span>

                      {/* Lifetime or Active pill */}
                      {cert.noExpiry ? (
                        <span
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.15)',
                            color: '#93C5FD',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                          }}
                        >
                          LIFETIME
                        </span>
                      ) : (
                        <span
                          style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            color: '#34D399',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                          }}
                        >
                          VALID
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => onOpenCertificate(cert)}
                      style={{
                        fontSize: '1.08rem',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        lineHeight: '1.3',
                        marginBottom: '0.6rem',
                        cursor: 'pointer',
                      }}
                    >
                      {cert.name}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.84rem',
                        color: '#94A3B8',
                        lineHeight: '1.5',
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {cert.shortDescription}
                    </p>

                    {cert.certificateNumber && (
                      <div
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '6px',
                          padding: '0.35rem 0.6rem',
                          fontSize: '0.74rem',
                          fontFamily: 'monospace',
                          color: '#60A5FA',
                          fontWeight: 700,
                          marginBottom: '1rem',
                        }}
                      >
                        REG #: {cert.certificateNumber}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div
                      className="flex items-center justify-between gap-2"
                      style={{
                        marginTop: 'auto',
                        paddingTop: '0.85rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <button
                        onClick={() => onOpenCertificate(cert)}
                        className="btn btn-outline btn-sm"
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#34D399',
                          borderColor: 'rgba(52, 211, 153, 0.3)',
                          flex: '1',
                          justifyContent: 'center',
                        }}
                      >
                        Inspect Credential <ArrowRight size={13} />
                      </button>

                      {cert.verificationUrl && (
                        <a
                          href={cert.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm"
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.15)',
                            color: '#60A5FA',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            padding: '0.4rem 0.65rem',
                          }}
                          title="Verify on Authority Portal"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}

                      {cert.allowDownload && (
                        <a
                          href={cert.fileUrl}
                          download={`${cert.slug}.${isPdf ? 'pdf' : 'png'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: '#FFFFFF',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            padding: '0.4rem 0.65rem',
                          }}
                          title="Download Certificate"
                        >
                          <Download size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
