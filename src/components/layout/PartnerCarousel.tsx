import React from 'react';
import { ExternalLink, ShieldCheck, Sparkles, Building2, Briefcase, ArrowRight } from 'lucide-react';
import { navigateTo } from '../../utils/urlRouting';

interface PartnerItem {
  id: string;
  name: string;
  category: string;
  categoryBadgeClass: string;
  logoSrc: string;
  altText: string;
  description: string;
  verifiedUrl: string;
  badgeIcon?: React.ReactNode;
  ctaText?: string;
  isInternal?: boolean;
}

const OFFICIAL_PARTNERS: PartnerItem[] = [
  {
    id: 'gem',
    name: 'Government e-Marketplace',
    category: 'AVAILABLE ON OFFICIAL PLATFORMS',
    categoryBadgeClass: 'km-partner-badge-platform',
    logoSrc: '/gem-logo.png',
    altText: 'GeM - Government e-Marketplace Official Procurement Portal',
    description: 'National Public Procurement Portal (Govt. of India)',
    verifiedUrl: 'https://gem.gov.in/',
  },
  {
    id: 'ondc',
    name: 'ONDC Network',
    category: 'AVAILABLE ON OFFICIAL PLATFORMS',
    categoryBadgeClass: 'km-partner-badge-platform',
    logoSrc: '/ondc-logo.png',
    altText: 'ONDC - Open Network for Digital Commerce Official Protocol',
    description: 'Open Network for Digital Commerce (Node: kogniti-minds-bpp)',
    verifiedUrl: 'https://ondc.org/',
  },
  {
    id: 'swayam-plus',
    name: 'Internship Opportunities at KOGNITI MINDS',
    category: 'Available on SWAYAM Plus',
    categoryBadgeClass: 'km-partner-badge-swayam',
    logoSrc: '/swayam-plus-logo.png',
    altText: 'SWAYAM Plus — Internship Opportunities at KOGNITI MINDS',
    description: 'Explore internship opportunities with KOGNITI MINDS and take the next step towards building your professional career.',
    verifiedUrl: 'https://swayamplus.education.gov.in/',
    ctaText: 'Explore Internship Opportunities',
  },
  {
    id: 'msme-udyam',
    name: 'Ministry of MSME',
    category: 'BUSINESS & GOVERNMENT ECOSYSTEM',
    categoryBadgeClass: 'km-partner-badge-gov',
    logoSrc: '/official-msme-gov-logo.png?v=20261002',
    altText: 'Ministry of Micro, Small and Medium Enterprises, Govt. of India',
    description: 'सूक्ष्म, लघु और मध्यम उद्यम मंत्रालय (Govt. of India)',
    verifiedUrl: 'https://msme.gov.in/',
  },
  {
    id: 'make-in-india',
    name: 'Make in India',
    category: 'BUSINESS & GOVERNMENT ECOSYSTEM',
    categoryBadgeClass: 'km-partner-badge-gov',
    logoSrc: '/official-make-in-india-seal.png?v=20261002',
    altText: 'Make in India - Atmanirbhar Bharat, Self-Reliant India Initiative',
    description: 'आत्मनिर्भर भारत • Self-Reliant India Initiative (Govt. of India)',
    verifiedUrl: 'https://www.makeinindia.com/',
  },
  {
    id: 'gic-rise',
    name: 'GIC RISE',
    category: 'INCUBATION PARTNER',
    categoryBadgeClass: 'km-partner-badge-incubation',
    logoSrc: '/gic-rise-logo.png',
    altText: 'GIC RISE - Galgotias Incubation Centre for Research Innovation Start-up & Entrepreneurship',
    description: 'Research Innovation Start-up & Entrepreneurship Incubation Hub',
    verifiedUrl: 'https://gicrise.in/',
  },
  {
    id: 'startup-india',
    name: 'Startup India',
    category: 'STARTUP ECOSYSTEM',
    categoryBadgeClass: 'km-partner-badge-ecosystem',
    logoSrc: '/startup-india-logo.png',
    altText: 'Startup India - DPIIT Ministry of Commerce and Industry',
    description: 'DPIIT, Ministry of Commerce & Industry, Govt. of India',
    verifiedUrl: 'https://www.startupindia.gov.in/',
  },
  {
    id: 'startinup',
    name: 'StartInUP',
    category: 'STARTUP ECOSYSTEM',
    categoryBadgeClass: 'km-partner-badge-ecosystem',
    logoSrc: '/startinup-logo.png',
    altText: 'StartInUP - Startup in Uttar Pradesh, Invest UP Initiative',
    description: 'Invest UP, Dept. of IT & Electronics, Govt. of Uttar Pradesh',
    verifiedUrl: 'https://startinup.up.gov.in/',
  },
];

export const PartnerCarousel: React.FC = () => {
  return (
    <section
      className="km-partner-carousel-section"
      aria-labelledby="km-partner-section-title"
    >
      <div className="km-partner-carousel-container">
        {/* Section Header */}
        <div className="km-partner-header">
          <h2 id="km-partner-section-title" className="km-partner-title">
            OUR OFFICIAL PLATFORMS, BUSINESS &amp; GOVERNMENT ECOSYSTEM
          </h2>
          <p className="km-partner-subtitle">
            Connected with recognised national initiatives, Make in India, MSME / Udyam, public procurement platforms, SWAYAM Plus internship opportunities, and our incubation ecosystem.
          </p>
          <div className="km-partner-divider" aria-hidden="true" />
        </div>

        {/* Automatic Continuous Scrolling Marquee */}
        <div
          className="km-partner-marquee"
          tabIndex={0}
          role="region"
          aria-label="Official Partners and Platforms Carousel"
        >
          <div className="km-partner-track">
            {/* Primary Interactive Set (Screen reader accessible & keyboard navigable) */}
            {OFFICIAL_PARTNERS.map((partner) => {
              const isSwayam = partner.id === 'swayam-plus';
              return (
                <a
                  key={`primary-${partner.id}`}
                  href={partner.verifiedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`km-partner-card ${isSwayam ? 'km-partner-card-swayam' : ''}`}
                  title={`Visit verified official portal: ${partner.name} (${partner.verifiedUrl})`}
                  aria-label={`${partner.name} - ${partner.category}: ${partner.description}.`}
                >
                  <span className={`km-partner-category-badge ${partner.categoryBadgeClass}`}>
                    {isSwayam && <Briefcase size={12} style={{ marginRight: '4px' }} />}
                    {partner.category}
                  </span>

                  <div className="km-partner-logo-box">
                    <img
                      src={partner.logoSrc}
                      alt={partner.altText}
                      className="km-partner-logo-img"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="km-partner-name">
                    <span>{partner.name}</span>
                    <ExternalLink size={13} style={{ color: 'var(--km-cyan)', flexShrink: 0 }} />
                  </div>

                  <div className="km-partner-desc">
                    {partner.description}
                  </div>

                  {partner.ctaText && (
                    <div style={{ marginTop: '0.75rem', width: '100%' }}>
                      <span
                        className="btn btn-sm btn-primary"
                        style={{
                          width: '100%',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          padding: '0.45rem 0.65rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          background: 'linear-gradient(135deg, #0284C7 0%, #1D4ED8 100%)',
                          border: 'none',
                          color: '#FFFFFF',
                          boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                        }}
                      >
                        {partner.ctaText} <ArrowRight size={13} />
                      </span>
                    </div>
                  )}
                </a>
              );
            })}

            {/* Seamless Infinite Loop Duplicate Set (Hidden from Screen Readers to prevent duplication) */}
            {OFFICIAL_PARTNERS.map((partner) => {
              const isSwayam = partner.id === 'swayam-plus';
              return (
                <a
                  key={`loop-${partner.id}`}
                  href={partner.verifiedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`km-partner-card ${isSwayam ? 'km-partner-card-swayam' : ''}`}
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  <span className={`km-partner-category-badge ${partner.categoryBadgeClass}`}>
                    {isSwayam && <Briefcase size={12} style={{ marginRight: '4px' }} />}
                    {partner.category}
                  </span>

                  <div className="km-partner-logo-box">
                    <img
                      src={partner.logoSrc}
                      alt=""
                      className="km-partner-logo-img"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="km-partner-name">
                    <span>{partner.name}</span>
                    <ExternalLink size={13} style={{ color: 'var(--km-cyan)', flexShrink: 0 }} />
                  </div>

                  <div className="km-partner-desc">
                    {partner.description}
                  </div>

                  {partner.ctaText && (
                    <div style={{ marginTop: '0.75rem', width: '100%' }}>
                      <span
                        className="btn btn-sm btn-primary"
                        style={{
                          width: '100%',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          padding: '0.45rem 0.65rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          background: 'linear-gradient(135deg, #0284C7 0%, #1D4ED8 100%)',
                          border: 'none',
                          color: '#FFFFFF',
                          boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                        }}
                      >
                        {partner.ctaText} <ArrowRight size={13} />
                      </span>
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
