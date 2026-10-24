import React from 'react';
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Mail,
  ExternalLink,
  ChevronRight,
  Building2,
  Award,
  Layers,
  FileText,
  Clock,
  Compass,
} from 'lucide-react';
import { OFFICIAL_COMPANY_MASTER } from '../../config/companyMaster';

interface InternshipsPageProps {
  setActiveTab: (tab: string) => void;
}

export const InternshipsPage: React.FC<InternshipsPageProps> = ({ setActiveTab }) => {
  const opportunityTracks = [
    {
      id: 'rnd-materials',
      title: 'Research & Sustainable Material Engineering',
      department: 'R&D & Product Innovation',
      location: 'Greater Noida West / Hybrid',
      duration: '3 to 6 Months',
      type: 'Structured Internship',
      description:
        'Hands-on research exploring the optimization of agro-waste fiber pulp, tensile strength analysis, sizing, and chemical-free bleaching processes for circular paper manufacturing.',
      keySkills: ['Material Science', 'Biomass Valorization', 'Pulp Testing', 'Quality Control'],
      icon: <Layers size={22} className="text-blue-600" />,
    },
    {
      id: 'supply-chain',
      title: 'Sustainable Supply Chain & Farmer Sourcing',
      department: 'Operations & Procurement',
      location: 'Greater Noida West / Regional Hubs',
      duration: '3 to 6 Months',
      type: 'Structured Internship',
      description:
        'Learn firsthand how agricultural crop residues are ethically aggregated from farm gates, transported with minimal carbon footprint, and routed through industrial supply chains.',
      keySkills: ['Supply Chain Logistics', 'Farmer Aggregation', 'Carbon Tracking', 'Inventory Management'],
      icon: <Compass size={22} className="text-emerald-600" />,
    },
    {
      id: 'b2b-commerce',
      title: 'B2B Enterprise Outreach & Institutional Sales',
      department: 'Commercial & Growth',
      location: 'Hybrid / Corporate Office',
      duration: '3 to 6 Months',
      type: 'Structured Internship',
      description:
        'Engage with institutional buyers, schools, universities, and corporate offices transitioning to tree-free stationery. Gain exposure to RFQ negotiations, GST invoicing, and B2B contracts.',
      keySkills: ['B2B Communications', 'Client Outreach', 'Tender Analysis', 'CRM Operations'],
      icon: <Building2 size={22} className="text-amber-600" />,
    },
    {
      id: 'digital-commerce',
      title: 'Software Engineering & Digital Commerce Integration',
      department: 'Technology & ONDC Architecture',
      location: 'Remote / Hybrid',
      duration: '3 to 6 Months',
      type: 'Structured Internship',
      description:
        'Participate in building modern e-commerce systems, open protocol commerce integrations (ONDC RETeB2B), headless shopping interfaces, and real-time order synchronization engines.',
      keySkills: ['TypeScript / React', 'API Integrations', 'Commerce Protocols', 'System Architecture'],
      icon: <GraduationCap size={22} className="text-purple-600" />,
    },
  ];

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Breadcrumb Bar */}
      <div
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '0.85rem 0',
        }}
      >
        <div className="container">
          <nav
            aria-label="Breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.82rem',
              color: '#64748B',
            }}
          >
            <button
              onClick={() => setActiveTab('home')}
              style={{
                color: '#0284C7',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Home
            </button>
            <ChevronRight size={14} />
            <span style={{ color: '#0F172A', fontWeight: 600 }}>Internship Opportunities</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0A0F1D 0%, #172554 50%, #0F172A 100%)',
          color: '#FFFFFF',
          padding: '3.5rem 0 4rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(2, 132, 199, 0.25) 0%, rgba(2, 132, 199, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2.5rem 2rem',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#0F172A',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            {/* Left Content */}
            <div>
              {/* SWAYAM Plus Official Logo Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    background: '#FFFFFF',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src="/swayam-plus-logo.png"
                    alt="SWAYAM Plus"
                    style={{
                      height: '36px',
                      width: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: '#EFF6FF',
                    color: '#0284C7',
                    border: '1px solid #BFDBFE',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  <Briefcase size={14} className="text-blue-600" />
                  Available on SWAYAM Plus
                </span>
              </div>

              {/* Main Heading */}
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  fontWeight: 800,
                  color: '#0F172A',
                  lineHeight: '1.2',
                  letterSpacing: '-0.025em',
                  marginBottom: '0.85rem',
                }}
              >
                Internship Opportunities at KOGNITI MINDS
              </h1>

              {/* Supporting Text */}
              <p
                style={{
                  fontSize: '1.02rem',
                  color: '#475569',
                  lineHeight: '1.65',
                  marginBottom: '1.75rem',
                }}
              >
                Explore internship opportunities with KOGNITI MINDS and take the next step towards building your professional career.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                <a
                  href="https://swayam-plus.ac.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-lg"
                  style={{
                    background: 'linear-gradient(135deg, #0284C7 0%, #1D4ED8 100%)',
                    color: '#FFFFFF',
                    borderRadius: '9999px',
                    padding: '0.85rem 1.85rem',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                  }}
                >
                  Apply on SWAYAM Plus <ExternalLink size={16} />
                </a>

                <a
                  href={`mailto:careers@kognitiminds.com?subject=${encodeURIComponent(
                    'Application for Internship Opportunity - SWAYAM Plus Candidate'
                  )}`}
                  className="btn btn-lg"
                  style={{
                    background: '#F8FAFC',
                    color: '#0F172A',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '9999px',
                    padding: '0.85rem 1.75rem',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                  }}
                >
                  <Mail size={16} className="text-blue-600" /> Contact Talent Desk
                </a>
              </div>
            </div>

            {/* Right Feature Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                borderRadius: '12px',
                padding: '1.75rem',
                border: '1px solid #BAE6FD',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#0369A1',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '1rem',
                }}
              >
                <Sparkles size={16} />
                <span>Internship Experience Highlights</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.88rem', color: '#1E293B', lineHeight: 1.5 }}>
                    <strong>Pioneering Circular Green Tech:</strong> Work at the forefront of upcycling agricultural crop residues into tree-free paper.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.88rem', color: '#1E293B', lineHeight: 1.5 }}>
                    <strong>Direct Mentorship & Practice:</strong> Work closely with founders, technical engineers, and supply chain specialists.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.88rem', color: '#1E293B', lineHeight: 1.5 }}>
                    <strong>Recognized Certification:</strong> Certificate of Completion and industry recommendation letter upon successful performance.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.88rem', color: '#1E293B', lineHeight: 1.5 }}>
                    <strong>SWAYAM Plus Listing:</strong> Verified internship curriculum aligned with national digital skilling standards.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Internship Tracks */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 2.5rem' }}>
            <span
              className="badge"
              style={{
                background: '#E0F2FE',
                color: '#0369A1',
                border: '1px solid #BAE6FD',
                marginBottom: '0.5rem',
                fontWeight: 700,
              }}
            >
              Active Internship Domains
            </span>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Explore Available Roles &amp; Learning Paths
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Select a domain matching your academic specialization and professional aspirations.
            </p>
          </div>

          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '1.5rem',
            }}
          >
            {opportunityTracks.map((track) => (
              <div
                key={track.id}
                className="card"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '1.75rem',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        background: '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {track.icon}
                    </div>

                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#0284C7',
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                      }}
                    >
                      {track.duration}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.18rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
                    {track.title}
                  </h3>

                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '0.75rem' }}>
                    {track.department} • {track.location}
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                    {track.description}
                  </p>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      Key Focus Areas:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {track.keySkills.map((skill) => (
                        <span
                          key={skill}
                          style={{
                            fontSize: '0.75rem',
                            background: '#F8FAFC',
                            color: '#334155',
                            border: '1px solid #E2E8F0',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontWeight: 500,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                  <a
                    href="https://swayam-plus.ac.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#0284C7',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      textDecoration: 'none',
                    }}
                  >
                    View on SWAYAM Plus <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Structured Application Process */}
      <section style={{ padding: '0 0 3.5rem' }}>
        <div className="container">
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2.5rem 2rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
            }}
          >
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.5rem', textAlign: 'center' }}>
              How to Apply via SWAYAM Plus
            </h3>

            <div
              className="grid"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
                gap: '1.5rem',
              }}
            >
              <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284C7', marginBottom: '0.5rem' }}>01</div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
                  Browse Opportunities
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  Search for <strong>KOGNITI MINDS PRIVATE LIMITED</strong> on the official SWAYAM Plus platform.
                </p>
              </div>

              <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284C7', marginBottom: '0.5rem' }}>02</div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
                  Submit Profile
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  Submit your candidate application with academic records and interest statement on the portal.
                </p>
              </div>

              <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284C7', marginBottom: '0.5rem' }}>03</div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
                  Interview &amp; Onboarding
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  Shortlisted candidates participate in an interactive technical discussion followed by orientation.
                </p>
              </div>

              <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284C7', marginBottom: '0.5rem' }}>04</div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
                  Certification
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  Complete assigned projects and receive an industry certification of completion and career support.
                </p>
              </div>
            </div>

            {/* Direct Helpdesk */}
            <div
              style={{
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                fontSize: '0.86rem',
                color: '#64748B',
              }}
            >
              <div>
                <strong>Questions regarding internships?</strong> Email our talent desk at{' '}
                <a href="mailto:careers@kognitiminds.com" style={{ color: '#0284C7', fontWeight: 600 }}>
                  careers@kognitiminds.com
                </a>{' '}
                or{' '}
                <a href={`mailto:${OFFICIAL_COMPANY_MASTER.support_email}`} style={{ color: '#0284C7', fontWeight: 600 }}>
                  {OFFICIAL_COMPANY_MASTER.support_email}
                </a>
              </div>

              <button
                onClick={() => setActiveTab('home')}
                className="btn"
                style={{
                  background: '#F1F5F9',
                  color: '#0F172A',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  padding: '0.45rem 1rem',
                }}
              >
                ← Back to Homepage
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
