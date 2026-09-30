import React from 'react';
import { ExternalLink, ShieldCheck, Sparkles, Building2 } from 'lucide-react';

interface PartnerItem {
  id: string;
  name: string;
  category: 'AVAILABLE ON OFFICIAL PLATFORMS' | 'INCUBATION PARTNER' | 'STARTUP ECOSYSTEM' | 'BUSINESS & GOVERNMENT ECOSYSTEM';
  categoryBadgeClass: string;
  logoSrc: string;
  altText: string;
  description: string;
  verifiedUrl: string;
  badgeIcon?: React.ReactNode;
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
    id: 'msme-udyam',
    name: 'MSME / Udyam',
    category: 'BUSINESS & GOVERNMENT ECOSYSTEM',
    categoryBadgeClass: 'km-partner-badge-gov',
    logoSrc: '/msme-udyam-logo.png',
    altText: 'MSME / Udyam - Ministry of Micro, Small and Medium Enterprises, Govt. of India',
    description: 'Ministry of MSME & Udyam Registration (Govt. of India)',
    verifiedUrl: 'https://udyamregistration.gov.in/',
  },
  {
    id: 'make-in-india',
    name: 'Make in India',
    category: 'BUSINESS & GOVERNMENT ECOSYSTEM',
    categoryBadgeClass: 'km-partner-badge-gov',
    logoSrc: '/make-in-india-logo.png',
    altText: 'Make in India - National Initiative by DPIIT, Govt. of India',
    description: 'Promoting 100% Indigenous Sustainable Paper Manufacturing',
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
            Connected with recognised national initiatives, Make in India, MSME / Udyam, public procurement platforms, and our incubation ecosystem.
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
            {OFFICIAL_PARTNERS.map((partner) => (
              <a
                key={`primary-${partner.id}`}
                href={partner.verifiedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="km-partner-card"
                title={`Visit verified official portal: ${partner.name} (${partner.verifiedUrl})`}
                aria-label={`${partner.name} - ${partner.category}: ${partner.description}. Opens official portal in a new tab.`}
              >
                <span className={`km-partner-category-badge ${partner.categoryBadgeClass}`}>
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
              </a>
            ))}

            {/* Seamless Infinite Loop Duplicate Set (Hidden from Screen Readers to prevent duplication) */}
            {OFFICIAL_PARTNERS.map((partner) => (
              <a
                key={`loop-${partner.id}`}
                href={partner.verifiedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="km-partner-card"
                aria-hidden="true"
                tabIndex={-1}
              >
                <span className={`km-partner-category-badge ${partner.categoryBadgeClass}`}>
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
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
