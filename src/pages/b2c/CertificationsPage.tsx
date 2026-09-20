import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  CheckCircle2,
  ShieldCheck,
  Building2,
  FileText,
  ExternalLink,
  Download,
  Filter,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { CompanyCertification } from '../../types';
import { certificationService } from '../../services/certificationService';
import { dataSyncBus } from '../../services/dataSyncBus';

interface CertificationsPageProps {
  onOpenCertificate: (cert: CompanyCertification) => void;
}

export const CertificationsPage: React.FC<CertificationsPageProps> = ({
  onOpenCertificate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [allB2CCerts, setAllB2CCerts] = useState<CompanyCertification[]>(() =>
    certificationService.getCertificates({
      visibility: 'b2c',
      status: 'published',
    })
  );
  const [categories, setCategories] = useState(() => certificationService.getCategories());

  useEffect(() => {
    const refresh = () => {
      setAllB2CCerts(
        certificationService.getCertificates({
          visibility: 'b2c',
          status: 'published',
        })
      );
      setCategories(certificationService.getCategories());
    };

    const unsubCerts = dataSyncBus.subscribe('certifications', refresh);
    const unsubCats = dataSyncBus.subscribe('certification_categories', refresh);
    return () => {
      unsubCerts();
      unsubCats();
    };
  }, []);

  // Filtered by category and search
  const filteredCerts = allB2CCerts.filter((cert) => {
    const matchesCat = activeCategory === 'All' || cert.category.toLowerCase() === activeCategory.toLowerCase();
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
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '80vh', paddingBottom: '4rem' }}>
      {/* Hero Header Strip */}
      <section
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #065F46 60%, #047857 100%)',
          color: '#ffffff',
          padding: '4rem 1.25rem 3.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(52, 211, 153, 0.15) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ maxWidth: '850px', position: 'relative', zIndex: 2 }}>
          <div
            className="flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#A7F3D0',
              padding: '0.35rem 0.9rem',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'inline-flex',
              marginBottom: '1rem',
              letterSpacing: '0.04em',
            }}
          >
            <ShieldCheck size={15} className="text-emerald-300" />
            <span>OFFICIAL COMPANY ACCREDITATIONS</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              fontWeight: 900,
              lineHeight: '1.2',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}
          >
            Our Certifications & Recognitions
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              color: '#D1FAE5',
              lineHeight: '1.6',
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            Trust backed by official recognition. Explore Government of India statutory registrations, ISO quality management standards, and zero-plastic eco certifications.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container" style={{ marginTop: '-1.75rem', position: 'relative', zIndex: 10 }}>
        {/* Search & Filter Bar */}
        <div
          className="card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06)',
            marginBottom: '2rem',
          }}
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 280px' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--slate-400)',
                }}
              />
              <input
                type="text"
                placeholder="Search certifications by name, registration #, or authority..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{
                  paddingLeft: '42px',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Total Results */}
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontWeight: 600 }}>
              Showing {filteredCerts.length} of {allB2CCerts.length} Certifications
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
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <button
              onClick={() => setActiveCategory('All')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeCategory === 'All' ? 'var(--primary)' : 'var(--slate-100)',
                color: activeCategory === 'All' ? '#ffffff' : 'var(--slate-700)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              All Categories ({allB2CCerts.length})
            </button>

            {categories.map((cat) => {
              const count = allB2CCerts.filter((c) => c.category.toLowerCase() === cat.name.toLowerCase()).length;
              if (count === 0) return null;

              const isSelected = activeCategory.toLowerCase() === cat.name.toLowerCase();

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.name)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '999px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--primary)' : 'var(--slate-100)',
                    color: isSelected ? '#ffffff' : 'var(--slate-700)',
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

        {/* Certifications Grid */}
        {filteredCerts.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
            }}
          >
            <FileText size={48} style={{ color: 'var(--slate-300)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-800)' }}>
              No Certifications Found
            </h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.88rem', margin: '0.4rem 0 1.5rem' }}>
              We could not find any active certificates matching your query.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="btn btn-primary btn-sm"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {filteredCerts.map((cert) => {
              const validity = certificationService.computeValidityStatus(cert);
              const isPdf = cert.fileType === 'application/pdf';

              return (
                <div
                  key={cert.id}
                  className="card"
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  {/* Top Preview Card */}
                  <div
                    style={{
                      height: '190px',
                      backgroundColor: isPdf ? '#FEF2F2' : '#F1F5F9',
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
                            backgroundColor: '#FEE2E2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.5rem',
                          }}
                        >
                          <FileText size={32} style={{ color: '#DC2626' }} />
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#991B1B' }}>
                          Official Document (PDF)
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>
                          Click to inspect credential
                        </div>
                      </div>
                    ) : (
                      <img
                        src={cert.fileUrl}
                        alt={cert.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}

                    {/* Category Overlay Tag */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(15, 23, 42, 0.85)',
                        color: '#ffffff',
                        backdropFilter: 'blur(4px)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                      }}
                    >
                      {cert.category}
                    </div>

                    {/* Featured Star */}
                    {cert.featured && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          backgroundColor: '#F59E0B',
                          color: '#ffffff',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        <Sparkles size={11} /> FEATURED
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '1.25rem', flex: '1', display: 'flex', flexDirection: 'column' }}>
                    <div className="flex items-center justify-between gap-2" style={{ marginBottom: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          color: 'var(--slate-500)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Building2 size={13} className="text-emerald-600" />
                        <span style={{ maxWidth: '190px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cert.issuingAuthority}
                        </span>
                      </span>

                      {/* Validity Pill */}
                      {cert.noExpiry ? (
                        <span
                          style={{
                            backgroundColor: '#EFF6FF',
                            color: '#1E40AF',
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
                            backgroundColor: '#ECFDF5',
                            color: '#065F46',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => onOpenCertificate(cert)}
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        color: 'var(--slate-900)',
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
                        color: 'var(--slate-600)',
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
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '0.35rem 0.6rem',
                          fontSize: '0.74rem',
                          fontFamily: 'monospace',
                          color: '#475569',
                          fontWeight: 700,
                          marginBottom: '1rem',
                        }}
                      >
                        ID: {cert.certificateNumber}
                      </div>
                    )}

                    {/* Card Footer Actions */}
                    <div
                      className="flex items-center justify-between gap-2"
                      style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}
                    >
                      <button
                        onClick={() => onOpenCertificate(cert)}
                        className="btn btn-outline btn-sm"
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          borderColor: 'var(--primary-light)',
                          flex: '1',
                          justifyContent: 'center',
                        }}
                      >
                        View Details <ArrowRight size={13} />
                      </button>

                      {cert.allowDownload && (
                        <a
                          href={cert.fileUrl}
                          download={`${cert.slug}.${isPdf ? 'pdf' : 'png'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.4rem 0.65rem' }}
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
