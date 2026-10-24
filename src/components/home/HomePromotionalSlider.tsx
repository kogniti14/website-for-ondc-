import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Briefcase,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Tag,
  GraduationCap,
  Layers,
  Award,
  ExternalLink,
} from 'lucide-react';

interface HomePromotionalSliderProps {
  onNavigateToInternships: () => void;
  onNavigateToShop: () => void;
  onNavigateToB2B: () => void;
}

export const HomePromotionalSlider: React.FC<HomePromotionalSliderProps> = ({
  onNavigateToInternships,
  onNavigateToShop,
  onNavigateToB2B,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const totalSlides = 3;

  // Auto-advance slides every 6 seconds, pausing on user hover/touch
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  // Touch Swipe Handlers for mobile & tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const distance = touchStartXRef.current - touchEndXRef.current;
      const isSwipe = Math.abs(distance) > 40;
      if (isSwipe) {
        if (distance > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <section
      aria-label="Promotional Showcase Slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        padding: '1.75rem 0 2rem',
        overflow: 'hidden',
      }}
    >
      <div className="container">
        {/* Slider Container Box */}
        <div
          style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
            minHeight: '360px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* SLIDE 0: SWAYAM PLUS INTERNSHIP OPPORTUNITIES (USER REQUIREMENT - PRIMARY SLIDE) */}
          <div
            style={{
              display: currentSlide === 0 ? 'block' : 'none',
              background: '#FFFFFF',
              color: '#0F172A',
              padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)',
              position: 'relative',
              animation: 'fadeInSlide 0.4s ease-out',
              border: '1px solid #DBEAFE',
              backgroundImage: 'radial-gradient(#0284c7 0.75px, transparent 0.75px)',
              backgroundSize: '24px 24px',
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* Subtle Blue Visual Elements & Accent Lighting */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: '45%',
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.04) 0%, rgba(37, 99, 235, 0.08) 100%)',
                pointerEvents: 'none',
                borderLeft: '1px solid rgba(2, 132, 199, 0.08)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '-40%',
                right: '15%',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(2, 132, 199, 0.12) 0%, rgba(2, 132, 199, 0) 70%)',
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                gap: '2.5rem',
                alignItems: 'center',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {/* Left Column: Official SWAYAM Plus Details */}
              <div>
                {/* Official Logo & Label Strip */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    marginBottom: '1rem',
                  }}
                >
                  {/* Official SWAYAM Plus Logo */}
                  <div
                    style={{
                      background: '#FFFFFF',
                      padding: '0.45rem 0.85rem',
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
                        height: '38px',
                        width: 'auto',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>

                  {/* Required Label: Available on SWAYAM Plus */}
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{
                      background: '#EFF6FF',
                      color: '#0284C7',
                      border: '1px solid #BFDBFE',
                      padding: '0.35rem 0.9rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                    }}
                  >
                    <Briefcase size={14} className="text-blue-600" />
                    Available on SWAYAM Plus
                  </span>
                </div>

                {/* Required Heading: Internship Opportunities at KOGNITI MINDS */}
                <h2
                  style={{
                    fontSize: 'clamp(1.6rem, 3.2vw, 2.35rem)',
                    fontWeight: 800,
                    color: '#0F172A',
                    lineHeight: '1.25',
                    letterSpacing: '-0.025em',
                    marginBottom: '0.75rem',
                  }}
                >
                  Internship Opportunities at KOGNITI MINDS
                </h2>

                {/* Required Supporting Text */}
                <p
                  style={{
                    fontSize: 'clamp(0.95rem, 1.8vw, 1.05rem)',
                    color: '#475569',
                    lineHeight: '1.65',
                    maxWidth: '640px',
                    marginBottom: '1.65rem',
                  }}
                >
                  Explore internship opportunities with KOGNITI MINDS and take the next step towards building your professional career.
                </p>

                {/* Required Call-to-Action Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={onNavigateToInternships}
                    className="btn btn-primary btn-lg"
                    style={{
                      background: 'linear-gradient(135deg, #0284C7 0%, #1D4ED8 100%)',
                      color: '#FFFFFF',
                      borderRadius: '9999px',
                      padding: '0.85rem 2rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Explore Internship Opportunities <ArrowRight size={18} />
                  </button>

                  <a
                    href="https://swayamplus.education.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: '#EFF6FF',
                      color: '#0284C7',
                      border: '1px solid #BFDBFE',
                      padding: '0.82rem 1.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.08)',
                    }}
                  >
                    Visit Official Portal <ExternalLink size={16} />
                  </a>
                </div>
              </div>

              {/* Right Column: Subtle Visual Elements & Highlights */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '1.75rem',
                  border: '1.5px solid #BFDBFE',
                  boxShadow: '0 8px 24px -4px rgba(2, 132, 199, 0.12)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#0369A1',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '1rem',
                  }}
                >
                  <Sparkles size={16} className="text-blue-600" />
                  <span>Program Advantages</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="flex items-start gap-2.5">
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: '#EFF6FF',
                        color: '#0284C7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <Layers size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                        Green Technology &amp; Circular Innovation
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.45 }}>
                        Practical project exposure in agricultural waste valorization and eco-paper manufacturing.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: '#EFF6FF',
                        color: '#0284C7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <GraduationCap size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                        Dedicated Expert Mentorship
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.45 }}>
                        Work directly with domain leaders in product R&amp;D, operations, and digital commerce.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: '#EFF6FF',
                        color: '#0284C7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <Award size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                        Certificate of Completion
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.45 }}>
                        Official completion certificate and performance appraisal for your career portfolio.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 1: Flagship AgroPrint Sustainable Copier Paper */}
          <div
            style={{
              display: currentSlide === 1 ? 'block' : 'none',
              background: 'linear-gradient(135deg, #0A0F1D 0%, #172554 60%, #0F172A 100%)',
              color: '#FFFFFF',
              padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)',
              position: 'relative',
              animation: 'fadeInSlide 0.4s ease-out',
            }}
          >
            {/* Ambient Background Glow */}
            <div
              style={{
                position: 'absolute',
                top: '-30%',
                right: '5%',
                width: '380px',
                height: '380px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0) 70%)',
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                gap: '2rem',
                alignItems: 'center',
                position: 'relative',
                zIndex: 2,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34D399',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    <Sparkles size={14} className="text-emerald-400" />
                    100% Tree-Free Innovation
                  </span>
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#93C5FD',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    Direct Manufacturer Pricing
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: 'clamp(1.6rem, 3.2vw, 2.35rem)',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    lineHeight: '1.25',
                    letterSpacing: '-0.025em',
                    marginBottom: '0.75rem',
                  }}
                >
                  From Agricultural Crop Waste to Everyday Paper
                </h2>

                <p
                  style={{
                    fontSize: 'clamp(0.95rem, 1.8vw, 1.05rem)',
                    color: '#CBD5E1',
                    lineHeight: '1.6',
                    maxWidth: '620px',
                    marginBottom: '1.5rem',
                  }}
                >
                  Discover our flagship 75 GSM copier paper and notebooks milled from upcycled farm crop residue. High opacity, jam-free high-speed printing, and eligible for 18% GST Input Tax Credit.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={onNavigateToShop}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
                      color: '#FFFFFF',
                      borderRadius: '9999px',
                      padding: '0.85rem 2rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    Explore Paper Catalog <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              {/* Slide 1 Right Feature Card */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
                  Why Agro-Waste Paper?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.86rem', color: '#E2E8F0' }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Saves forests by replacing virgin tree pulp with stubble fibers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Reduces crop burning and supports Indian farmers directly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Compliant with ISO 9001 and ISO 14001 mill standards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Seamless high-volume laser, inkjet, and xerox printing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 2: Dedicated B2B & Wholesale Institutional Procurement */}
          <div
            style={{
              display: currentSlide === 2 ? 'block' : 'none',
              background: 'linear-gradient(135deg, #0A0F1D 0%, #1E293B 60%, #0F172A 100%)',
              color: '#FFFFFF',
              padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)',
              position: 'relative',
              animation: 'fadeInSlide 0.4s ease-out',
            }}
          >
            {/* Ambient Accent Glow */}
            <div
              style={{
                position: 'absolute',
                top: '-30%',
                right: '10%',
                width: '380px',
                height: '380px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0) 70%)',
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                gap: '2rem',
                alignItems: 'center',
                position: 'relative',
                zIndex: 2,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#FBBF24',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    <Building2 size={14} className="text-amber-400" />
                    Institutional &amp; Wholesale Division
                  </span>
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34D399',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    Tier Quantity Slabs
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: 'clamp(1.6rem, 3.2vw, 2.35rem)',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    lineHeight: '1.25',
                    letterSpacing: '-0.025em',
                    marginBottom: '0.75rem',
                  }}
                >
                  Direct Manufacturer Pricing for Organizations
                </h2>

                <p
                  style={{
                    fontSize: 'clamp(0.95rem, 1.8vw, 1.05rem)',
                    color: '#CBD5E1',
                    lineHeight: '1.6',
                    maxWidth: '620px',
                    marginBottom: '1.5rem',
                  }}
                >
                  Equip your corporate offices, universities, training hubs, and institutions with custom purchase orders, digital GST e-invoices, and dedicated key account managers.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={onNavigateToB2B}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #D97706 0%, #2563EB 100%)',
                      color: '#FFFFFF',
                      borderRadius: '9999px',
                      padding: '0.85rem 2rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      boxShadow: '0 8px 24px rgba(217, 119, 6, 0.35)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    Explore B2B Wholesale Deals <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              {/* Slide 2 Right Feature Card */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
                  Institutional Advantages
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.86rem', color: '#E2E8F0' }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-400" />
                    <span>Instant Volume Tier Rebates from 10 Reams to Full Pallets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-400" />
                    <span>Statutory 18% GST Input Tax Credit with automated e-invoices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-400" />
                    <span>Custom Request for Quotation (RFQ) with rapid approvals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-400" />
                    <span>Purchase Order (PO) and corporate credit terms supported</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            aria-label="Previous promotional slide"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: currentSlide === 0 ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 23, 42, 0.75)',
              color: currentSlide === 0 ? '#0F172A' : '#FFFFFF',
              border: currentSlide === 0 ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'transform 0.15s ease, background 0.15s ease',
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next promotional slide"
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: currentSlide === 0 ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 23, 42, 0.75)',
              color: currentSlide === 0 ? '#0F172A' : '#FFFFFF',
              border: currentSlide === 0 ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'transform 0.15s ease, background 0.15s ease',
            }}
          >
            <ChevronRight size={20} />
          </button>

          {/* Bottom Indicators & Slide Dots */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              zIndex: 10,
            }}
          >
            {[0, 1, 2].map((idx) => {
              const isActive = currentSlide === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  style={{
                    width: isActive ? '28px' : '9px',
                    height: '9px',
                    borderRadius: '9999px',
                    background: isActive
                      ? currentSlide === 0
                        ? '#0284C7'
                        : '#38BDF8'
                      : currentSlide === 0
                      ? 'rgba(148, 163, 184, 0.4)'
                      : 'rgba(255, 255, 255, 0.35)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    padding: 0,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
