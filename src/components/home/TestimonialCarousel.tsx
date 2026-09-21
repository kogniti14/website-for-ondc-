import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Testimonial } from '../../types';
import { testimonialService } from '../../services/testimonialService';
import { dataSyncBus } from '../../services/dataSyncBus';

const AUTOPLAY_INTERVAL = 2000; // Exact 2000ms (2 seconds)
const TRANSITION_DURATION = 500; // 500ms smooth transition

// Curated avatar background palettes for initial badges
const AVATAR_PALETTES = [
  { bg: 'var(--primary-light, #EFF6FF)', color: 'var(--primary, #2563EB)' },
  { bg: '#ECFDF5', color: '#059669' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

function getInitials(name: string): string {
  if (!name) return 'KM';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export const TestimonialCarousel: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() =>
    testimonialService.getTestimonials({ onlyPublished: true })
  );

  // Responsive visible cards count: Desktop = 3, Tablet = 2, Mobile = 1
  const [visibleCards, setVisibleCards] = useState<number>(() => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  });

  // Responsive window resize listener
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setVisibleCards(1);
      } else if (width < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync with database/Admin Panel via dataSyncBus
  useEffect(() => {
    const unsub = dataSyncBus.subscribe('testimonials', () => {
      setTestimonials(testimonialService.getTestimonials({ onlyPublished: true }));
    });
    return unsub;
  }, []);

  const total = testimonials.length;

  // Ensure we have enough items for infinite looping if total < 3
  const effectiveTestimonials = React.useMemo(() => {
    if (total === 0) return [];
    if (total >= 4) return testimonials;
    // If only 1-3 testimonials, duplicate to build a robust loop
    let duplicated = [...testimonials];
    while (duplicated.length < 6) {
      duplicated = [...duplicated, ...testimonials];
    }
    return duplicated;
  }, [testimonials, total]);

  const effTotal = effectiveTestimonials.length;

  // Build extended slides for seamless infinite loop:
  // [clones from end (visibleCards)] + [effectiveTestimonials] + [clones from start (visibleCards)]
  const extendedSlides = React.useMemo(() => {
    if (effTotal === 0) return [];
    const clonesBefore = effectiveTestimonials.slice(-visibleCards);
    const clonesAfter = effectiveTestimonials.slice(0, visibleCards);
    return [...clonesBefore, ...effectiveTestimonials, ...clonesAfter];
  }, [effectiveTestimonials, effTotal, visibleCards]);

  // Index in extendedSlides: base index is visibleCards (first original item)
  const [currentIndex, setCurrentIndex] = useState<number>(visibleCards);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Sync index when visibleCards changes
  useEffect(() => {
    setCurrentIndex(visibleCards);
  }, [visibleCards]);

  // Autoplay timer ref
  const timerRef = useRef<number | null>(null);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (effTotal === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [effTotal]);

  const handlePrev = useCallback(() => {
    if (effTotal === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [effTotal]);

  // Reset autoplay timer
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!isPaused && effTotal > 0) {
      timerRef.current = window.setInterval(() => {
        handleNext();
      }, AUTOPLAY_INTERVAL);
    }
  }, [isPaused, effTotal, handleNext]);

  // Autoplay management
  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [resetTimer]);

  // Smooth infinite loop boundary wrap without any visual jump
  const handleTransitionEnd = () => {
    if (effTotal === 0) return;

    // Passed the end of original items -> wrap to start
    if (currentIndex >= effTotal + visibleCards) {
      setIsTransitioning(false);
      setCurrentIndex(visibleCards);
    }
    // Passed before the start of original items -> wrap to end
    else if (currentIndex < visibleCards) {
      setIsTransitioning(false);
      setCurrentIndex(effTotal + currentIndex);
    }
  };

  // Re-enable CSS transitions right after instantaneous repositioning
  useEffect(() => {
    if (!isTransitioning) {
      const raf = requestAnimationFrame(() => {
        setIsTransitioning(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitioning]);

  // Active original item index for pagination dots (0 to total - 1)
  const activeDotIndex = React.useMemo(() => {
    if (total === 0) return 0;
    const normalized = ((currentIndex - visibleCards) % effTotal + effTotal) % effTotal;
    return normalized % total;
  }, [currentIndex, visibleCards, effTotal, total]);

  // Jump to specific dot
  const handleDotClick = (dotIdx: number) => {
    setIsTransitioning(true);
    setCurrentIndex(visibleCards + dotIdx);
    resetTimer();
  };

  // Touch swipe support for Mobile
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null) {
      touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
    }
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null) {
      const deltaX = touchDeltaXRef.current;
      if (deltaX < -40) {
        handleNext();
      } else if (deltaX > 40) {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
    setIsPaused(false);
  };

  // Keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
      resetTimer();
    } else if (e.key === 'ArrowRight') {
      handleNext();
      resetTimer();
    }
  };

  // Empty state fallback
  if (total === 0) {
    return null;
  }

  // Calculate percentage shift for track
  const slideWidthPercent = 100 / visibleCards;
  const translateX = -(currentIndex * slideWidthPercent);

  return (
    <section
      style={{
        padding: '4.5rem 0',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-roledescription="carousel"
      aria-label="Client Trust Testimonials"
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
          <span className="badge badge-amber" style={{ marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
            CLIENT TRUST
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
              fontWeight: 800,
              color: 'var(--slate-900)',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Trusted by Learners, Professionals & Leaders
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            Genuine experiences from universities, corporate enterprises, and eco-conscious innovators across India.
          </p>
        </div>

        {/* Carousel Outer Viewport */}
        <div
          style={{
            position: 'relative',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Testimonial carousel slider"
        >
          {/* Previous Button */}
          <button
            onClick={() => {
              handlePrev();
              resetTimer();
            }}
            className="btn btn-outline"
            style={{
              position: 'absolute',
              top: '50%',
              left: '-18px',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
              borderColor: 'var(--border-color)',
              color: 'var(--slate-700)',
              cursor: 'pointer',
            }}
            aria-label="Previous testimonials"
            title="Previous testimonial"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Next Button */}
          <button
            onClick={() => {
              handleNext();
              resetTimer();
            }}
            className="btn btn-outline"
            style={{
              position: 'absolute',
              top: '50%',
              right: '-18px',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
              borderColor: 'var(--border-color)',
              color: 'var(--slate-700)',
              cursor: 'pointer',
            }}
            aria-label="Next testimonials"
            title="Next testimonial"
          >
            <ChevronRight size={22} />
          </button>

          {/* Carousel Viewport Overflow Wrapper */}
          <div
            style={{
              overflow: 'hidden',
              padding: '0.75rem 0.25rem',
              touchAction: 'pan-y',
            }}
          >
            {/* Sliding Track */}
            <div
              onTransitionEnd={handleTransitionEnd}
              style={{
                display: 'flex',
                transform: `translate3d(${translateX}%, 0, 0)`,
                transition: isTransitioning
                  ? `transform ${TRANSITION_DURATION}ms cubic-bezier(0.25, 1, 0.5, 1)`
                  : 'none',
                willChange: 'transform',
              }}
            >
              {extendedSlides.map((testimonial, idx) => {
                const palette = AVATAR_PALETTES[idx % AVATAR_PALETTES.length];
                const ratingCount = Math.min(5, Math.max(1, testimonial.rating || 5));

                return (
                  <div
                    key={`${testimonial.id}_${idx}`}
                    style={{
                      flex: `0 0 ${slideWidthPercent}%`,
                      maxWidth: `${slideWidthPercent}%`,
                      padding: '0 0.75rem',
                      boxSizing: 'border-box',
                      display: 'flex',
                    }}
                  >
                    <div
                      className="card"
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                        padding: '1.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        width: '100%',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 10px 24px rgba(0, 0, 0, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.04)';
                      }}
                    >
                      {/* Top: Star Rating */}
                      <div>
                        {testimonial.rating !== undefined && testimonial.rating > 0 && (
                          <div
                            className="flex items-center gap-1 text-amber-500"
                            style={{ marginBottom: '1rem' }}
                            aria-label={`${ratingCount} out of 5 stars`}
                          >
                            {[...Array(ratingCount)].map((_, i) => (
                              <Star key={i} size={16} fill="#D97706" color="#D97706" />
                            ))}
                          </div>
                        )}

                        {/* Testimonial Quote */}
                        <p
                          style={{
                            fontSize: '0.92rem',
                            color: 'var(--slate-700)',
                            lineHeight: '1.65',
                            marginBottom: '1.5rem',
                            fontStyle: 'normal',
                          }}
                        >
                          "{testimonial.text}"
                        </p>
                      </div>

                      {/* Bottom: Client Profile */}
                      <div
                        className="flex items-center gap-3"
                        style={{
                          borderTop: '1px solid var(--border-subtle)',
                          paddingTop: '1rem',
                          marginTop: 'auto',
                        }}
                      >
                        {testimonial.avatarUrl ? (
                          <img
                            src={testimonial.avatarUrl}
                            alt={testimonial.name}
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1.5px solid var(--border-color)',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              background: palette.bg,
                              color: palette.color,
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.95rem',
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(testimonial.name)}
                          </div>
                        )}

                        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: '0.92rem',
                              color: 'var(--slate-900)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {testimonial.name}
                          </div>
                          {(testimonial.role || testimonial.designation || testimonial.company || testimonial.organization) && (
                            <div
                              style={{
                                fontSize: '0.78rem',
                                color: 'var(--slate-500)',
                                lineHeight: '1.4',
                                marginTop: '0.1rem',
                              }}
                            >
                              {[
                                testimonial.role || testimonial.designation,
                                testimonial.company || testimonial.organization,
                              ]
                                .filter(Boolean)
                                .join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination Indicators (Dots) */}
          <div
            className="flex items-center justify-center gap-2"
            style={{ marginTop: '2rem' }}
            role="tablist"
            aria-label="Testimonial pagination"
          >
            {testimonials.map((_, dotIdx) => {
              const isActive = dotIdx === activeDotIndex;
              return (
                <button
                  key={dotIdx}
                  onClick={() => handleDotClick(dotIdx)}
                  style={{
                    width: isActive ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: isActive ? 'var(--primary, #2563EB)' : 'var(--slate-300, #CBD5E1)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                  }}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to testimonial slide ${dotIdx + 1}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
