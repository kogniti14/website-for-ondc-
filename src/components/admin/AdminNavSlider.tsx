import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminNavSliderProps {
  activeTab?: string;
  children: React.ReactNode;
  className?: string;
}

export const AdminNavSlider: React.FC<AdminNavSliderProps> = ({
  activeTab,
  children,
  className = '',
}) => {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Check scroll position and determine arrow visibility
  const checkScrollability = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  // Update on scroll, wheel, resize, and DOM mutations
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    checkScrollability();

    const handleScroll = () => {
      checkScrollability();
    };

    el.addEventListener('scroll', handleScroll, { passive: true });

    // Handle horizontal mouse wheel scrolling over the nav bar
    const handleWheel = (e: WheelEvent) => {
      if (el.scrollWidth > el.clientWidth) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });

    // ResizeObserver to detect layout / screen size changes
    const resizeObserver = new ResizeObserver(() => {
      checkScrollability();
    });
    resizeObserver.observe(el);

    // MutationObserver to detect dynamically added/removed children or badges
    const mutationObserver = new MutationObserver(() => {
      checkScrollability();
    });
    mutationObserver.observe(el, { childList: true, subtree: true, characterData: true });

    window.addEventListener('resize', checkScrollability);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      el.removeEventListener('wheel', handleWheel);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', checkScrollability);
    };
  }, [checkScrollability]);

  // Auto-scroll active tab into view when activeTab changes
  useEffect(() => {
    if (!sliderRef.current || !activeTab) return;

    // Small delay to ensure DOM and badges are measured accurately
    const timer = setTimeout(() => {
      const container = sliderRef.current;
      if (!container) return;

      // Find active tab element
      const activeEl =
        container.querySelector<HTMLElement>(`[data-tab="${activeTab}"]`) ||
        container.querySelector<HTMLElement>('[data-active="true"]') ||
        container.querySelector<HTMLElement>(`[data-tab-id="${activeTab}"]`);

      if (activeEl) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();

        const offsetLeft =
          container.scrollLeft +
          (activeRect.left - containerRect.left) -
          containerRect.width / 2 +
          activeRect.width / 2;

        container.scrollTo({
          left: Math.max(0, offsetLeft),
          behavior: 'smooth',
        });
      }
      checkScrollability();
    }, 50);

    return () => clearTimeout(timer);
  }, [activeTab, checkScrollability]);

  // Scroll smoothly left or right via buttons
  const handleScrollClick = (direction: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    const distance = Math.min(340, el.clientWidth * 0.7);
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  // Mouse Drag to Scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !sliderRef.current) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftStartRef.current = sliderRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    sliderRef.current.scrollLeft = scrollLeftStartRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDraggedRef.current = false;
    }
  };

  return (
    <div
      className={`admin-nav-slider-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        background: '#FFFFFF',
      }}
    >
      {/* Left Slider Control Arrow */}
      <button
        type="button"
        onClick={() => handleScrollClick('left')}
        aria-label="Scroll navigation left"
        disabled={!canScrollLeft}
        style={{
          position: 'absolute',
          left: '0.35rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: canScrollLeft ? 'pointer' : 'default',
          opacity: canScrollLeft ? 1 : 0,
          pointerEvents: canScrollLeft ? 'auto' : 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          color: 'var(--slate-700)',
        }}
        onMouseEnter={(e) => {
          if (canScrollLeft) {
            e.currentTarget.style.backgroundColor = '#F8FAFC';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
        title="Scroll navigation left"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Left Edge Subtle Gradient Mask */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '48px',
          background: 'linear-gradient(to right, #FFFFFF 30%, rgba(255, 255, 255, 0))',
          pointerEvents: 'none',
          zIndex: 5,
          opacity: canScrollLeft ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Scrollable Track */}
      <div
        ref={sliderRef}
        className="hide-scrollbar"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onClickCapture={handleClickCapture}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
          userSelect: isDragging ? 'none' : 'auto',
          cursor: isDragging ? 'grabbing' : 'auto',
          padding: '0 2.25rem',
        }}
      >
        {children}
      </div>

      {/* Right Edge Subtle Gradient Mask */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '48px',
          background: 'linear-gradient(to left, #FFFFFF 30%, rgba(255, 255, 255, 0))',
          pointerEvents: 'none',
          zIndex: 5,
          opacity: canScrollRight ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Right Slider Control Arrow */}
      <button
        type="button"
        onClick={() => handleScrollClick('right')}
        aria-label="Scroll navigation right"
        disabled={!canScrollRight}
        style={{
          position: 'absolute',
          right: '0.35rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: canScrollRight ? 'pointer' : 'default',
          opacity: canScrollRight ? 1 : 0,
          pointerEvents: canScrollRight ? 'auto' : 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          color: 'var(--slate-700)',
        }}
        onMouseEnter={(e) => {
          if (canScrollRight) {
            e.currentTarget.style.backgroundColor = '#F8FAFC';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
        title="Scroll navigation right"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
