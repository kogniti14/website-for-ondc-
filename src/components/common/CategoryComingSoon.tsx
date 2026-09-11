import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  Leaf,
  ShieldCheck,
  Truck,
  Bell,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  FileText,
  Mail,
  Building2,
} from 'lucide-react';

interface CategoryComingSoonProps {
  categoryName: string;
  categoryDescription?: string;
  categoryIcon?: string;
  isB2B?: boolean;
  onResetCategory?: () => void;
  onRequestQuote?: (categoryName: string) => void;
}

export const CategoryComingSoon: React.FC<CategoryComingSoonProps> = ({
  categoryName,
  categoryDescription,
  categoryIcon,
  isB2B = false,
  onResetCategory,
  onRequestQuote,
}) => {
  const [notifyContact, setNotifyContact] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyContact.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
    }, 600);
  };

  return (
    <div
      className="category-coming-soon-card"
      style={{
        width: '100%',
        borderRadius: 'var(--radius-2xl, 16px)',
        background: isB2B
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%)'
          : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        border: isB2B
          ? '1px solid rgba(255, 255, 255, 0.12)'
          : '1px solid #E2E8F0',
        boxShadow: isB2B
          ? '0 10px 30px -5px rgba(0, 0, 0, 0.4)'
          : '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        padding: '3.5rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle Background Accent Aura */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '250px',
          background: isB2B
            ? 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px', margin: '0 auto' }}>
        {/* Status Pill Badge with Live Pulse */}
        <div className="flex items-center justify-center gap-2" style={{ marginBottom: '1.25rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.95rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              background: isB2B ? 'rgba(245, 158, 11, 0.15)' : 'rgba(37, 99, 235, 0.08)',
              color: isB2B ? '#FCD34D' : '#1D4ED8',
              border: isB2B ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(37, 99, 235, 0.2)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isB2B ? '#F59E0B' : '#2563EB',
                display: 'inline-block',
                boxShadow: isB2B ? '0 0 8px #F59E0B' : '0 0 8px #2563EB',
                animation: 'pulse 2s infinite',
              }}
            />
            {isB2B ? 'Institutional Production Run Scheduled' : 'Curated Catalog Pipeline'}
          </span>
        </div>

        {/* Category Visual Icon */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: isB2B
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.05) 100%)'
              : 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: isB2B ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #BFDBFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2rem',
            boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.1)',
          }}
        >
          {categoryIcon ? <span>{categoryIcon}</span> : <Sparkles size={34} className={isB2B ? 'text-amber-400' : 'text-blue-600'} />}
        </div>

        {/* Main Title */}
        <h2
          style={{
            fontSize: '2.1rem',
            fontWeight: 800,
            color: isB2B ? '#FFFFFF' : '#0F172A',
            letterSpacing: '-0.02em',
            marginBottom: '0.75rem',
            lineHeight: 1.25,
          }}
        >
          {categoryName}
          <span
            style={{
              display: 'block',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: isB2B ? '#FBBF24' : '#2563EB',
              marginTop: '0.35rem',
            }}
          >
            Coming Soon to Kogniti Minds
          </span>
        </h2>

        {/* Subtitle Description */}
        <p
          style={{
            color: isB2B ? '#CBD5E1' : '#64748B',
            fontSize: '0.98rem',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}
        >
          {categoryDescription ||
            `We are actively manufacturing and curating commercial-grade, agricultural-waste paper & stationery products for "${categoryName}". Factory inventory batches and official catalog SKUs will be available for orders shortly.`}
        </p>

        {/* Value Highlights Cards */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '2.25rem',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              background: isB2B ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF',
              border: isB2B ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1rem',
            }}
          >
            <div className="flex items-center gap-2" style={{ color: isB2B ? '#34D399' : '#059669', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <Leaf size={16} /> 100% Tree-Free
            </div>
            <div style={{ fontSize: '0.76rem', color: isB2B ? '#94A3B8' : '#64748B' }}>
              Crafted from upcycled agro-waste residue without harvesting forestry.
            </div>
          </div>

          <div
            style={{
              background: isB2B ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF',
              border: isB2B ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1rem',
            }}
          >
            <div className="flex items-center gap-2" style={{ color: isB2B ? '#38BDF8' : '#0284C7', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <ShieldCheck size={16} /> Quality Certified
            </div>
            <div style={{ fontSize: '0.76rem', color: isB2B ? '#94A3B8' : '#64748B' }}>
              Undergoing ISO & BIS paper smoothness, GSM, and opacity validation.
            </div>
          </div>

          <div
            style={{
              background: isB2B ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF',
              border: isB2B ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1rem',
            }}
          >
            <div className="flex items-center gap-2" style={{ color: isB2B ? '#FBBF24' : '#D97706', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <Truck size={16} /> Pan-India Dispatch
            </div>
            <div style={{ fontSize: '0.76rem', color: isB2B ? '#94A3B8' : '#64748B' }}>
              Direct mill-gate delivery, GeM & ONDC integration with 100% GST tax invoices.
            </div>
          </div>
        </div>

        {/* Notify Me / Early Access Form */}
        <div
          style={{
            background: isB2B ? 'rgba(255, 255, 255, 0.03)' : '#F1F5F9',
            borderRadius: '14px',
            padding: '1.25rem',
            border: isB2B ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
            marginBottom: '1.5rem',
          }}
        >
          {isSubscribed ? (
            <div
              className="flex items-center justify-center gap-2"
              style={{
                color: '#10B981',
                fontSize: '0.92rem',
                fontWeight: 700,
                padding: '0.5rem',
              }}
            >
              <CheckCircle2 size={18} />
              <span>You're on the priority list! We'll alert you the moment {categoryName} items launch.</span>
            </div>
          ) : (
            <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row items-center gap-2">
              <div style={{ position: 'relative', flex: 1, width: '100%' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: isB2B ? '#94A3B8' : '#64748B',
                  }}
                />
                <input
                  type="text"
                  required
                  placeholder="Enter email or mobile for launch alert..."
                  value={notifyContact}
                  onChange={(e) => setNotifyContact(e.target.value)}
                  className="form-input"
                  style={{
                    width: '100%',
                    paddingLeft: '40px',
                    background: isB2B ? 'rgba(15, 23, 42, 0.6)' : '#FFFFFF',
                    borderColor: isB2B ? 'rgba(255, 255, 255, 0.15)' : '#CBD5E1',
                    color: isB2B ? '#FFFFFF' : '#0F172A',
                    fontSize: '0.88rem',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={isB2B ? 'btn btn-amber' : 'btn btn-primary'}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  width: 'auto',
                }}
              >
                <Bell size={15} />
                {isSubmitting ? 'Saving...' : 'Notify When Available'}
              </button>
            </form>
          )}
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {onResetCategory && (
            <button
              onClick={onResetCategory}
              className="btn btn-secondary btn-sm"
              style={{
                borderRadius: '9999px',
                padding: '0.5rem 1.2rem',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <RotateCcw size={14} /> Explore Available Collections
            </button>
          )}

          {isB2B && onRequestQuote && (
            <button
              onClick={() => onRequestQuote(categoryName)}
              className="btn btn-amber btn-sm"
              style={{
                borderRadius: '9999px',
                padding: '0.5rem 1.2rem',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <FileText size={14} /> Request Advance RFQ Quote <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
