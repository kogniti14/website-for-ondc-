import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Tag,
  Share2,
  Check,
  Building2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Award,
} from 'lucide-react';
import { GalleryStory } from '../../types';
import { galleryService } from '../../services/galleryService';

interface StoryDetailModalProps {
  story: GalleryStory | null;
  onClose: () => void;
  onSelectStory?: (story: GalleryStory) => void;
  isB2BMode?: boolean;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({
  story,
  onClose,
  onSelectStory,
  isB2BMode = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!story) return null;

  // Get related stories
  const relatedStories = galleryService
    .getStories({
      visibility: isB2BMode ? 'b2b' : 'b2c',
      status: 'published',
    })
    .filter((s) => s.id !== story.id && (s.category === story.category || s.featured))
    .slice(0, 3);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#stories/${story.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Read this inspiring milestone from Kogniti Minds: "${story.title}"\n${window.location.origin}/#stories/${story.slug}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(`${window.location.origin}/#stories/${story.slug}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const bgColor = isB2BMode ? '#0F172A' : '#FFFFFF';
  const textColor = isB2BMode ? '#F8FAFC' : '#0F172A';
  const subtextColor = isB2BMode ? '#94A3B8' : '#64748B';
  const borderColor = isB2BMode ? 'rgba(255, 255, 255, 0.12)' : 'var(--border-color)';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          background: bgColor,
          color: textColor,
          borderRadius: '20px',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
          overflowY: 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Close Button Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            background: isB2BMode ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            padding: '1rem 1.75rem',
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="flex items-center gap-2">
            <span
              style={{
                background: isB2BMode ? 'rgba(217, 119, 6, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                color: isB2BMode ? '#FBBF24' : '#047857',
                padding: '0.25rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {story.category}
            </span>
            <span style={{ fontSize: '0.78rem', color: subtextColor }}>
              {new Date(story.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: isB2BMode ? 'rgba(255, 255, 255, 0.1)' : 'var(--slate-100)',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: textColor,
            }}
            title="Close modal (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hero Image */}
        <div style={{ position: 'relative', width: '100%', maxHeight: '420px', overflow: 'hidden', background: '#0F172A' }}>
          <img
            src={story.imageUrl}
            alt={story.imageAlt || story.title}
            style={{ width: '100%', height: 'auto', maxHeight: '420px', objectFit: 'cover' }}
          />
          {story.imageAlt && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.75))',
                color: '#E2E8F0',
                padding: '1rem 1.75rem 0.65rem',
                fontSize: '0.78rem',
                fontStyle: 'italic',
              }}
            >
              Photo: {story.imageAlt}
            </div>
          )}
        </div>

        {/* Story Body */}
        <div style={{ padding: '2rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
                fontWeight: 900,
                fontFamily: 'var(--font-heading)',
                lineHeight: 1.25,
                color: textColor,
                marginBottom: '1rem',
              }}
            >
              {story.title}
            </h1>

            {/* Short description lead banner */}
            <div
              style={{
                background: isB2BMode ? 'rgba(255, 255, 255, 0.04)' : '#F0FDF4',
                borderLeft: `4px solid ${isB2BMode ? '#D97706' : '#10B981'}`,
                padding: '1rem 1.25rem',
                borderRadius: '0 8px 8px 0',
                fontSize: '0.98rem',
                lineHeight: 1.6,
                fontWeight: 500,
                color: isB2BMode ? '#CBD5E1' : '#065F46',
              }}
            >
              {story.shortDescription}
            </div>
          </div>

          {/* Full Narrative Content */}
          <div
            style={{
              fontSize: '0.98rem',
              lineHeight: 1.8,
              color: isB2BMode ? '#E2E8F0' : 'var(--slate-700)',
              whiteSpace: 'pre-line',
            }}
          >
            {story.fullDescription || story.shortDescription}
          </div>

          {/* Social Share Strip */}
          <div
            style={{
              borderTop: `1px solid ${borderColor}`,
              borderBottom: `1px solid ${borderColor}`,
              padding: '1.25rem 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div className="flex items-center gap-2" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              <Share2 size={16} /> Share This Milestone:
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="btn btn-xs"
                style={{ background: '#25D366', color: '#FFFFFF', fontWeight: 600, borderRadius: '6px' }}
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={handleShareLinkedIn}
                className="btn btn-xs"
                style={{ background: '#0A66C2', color: '#FFFFFF', fontWeight: 600, borderRadius: '6px' }}
              >
                LinkedIn
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn btn-xs btn-outline"
                style={{ borderRadius: '6px', color: textColor, borderColor }}
              >
                {copiedLink ? <Check size={14} className="text-emerald-500" /> : null}
                {copiedLink ? 'Link Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Related Stories Carousel/Grid */}
          {relatedStories.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: textColor, marginBottom: '1rem' }}>
                Related Milestones & Stories
              </h4>

              <div
                className="grid"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                }}
              >
                {relatedStories.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      if (onSelectStory) onSelectStory(rel);
                    }}
                    style={{
                      background: isB2BMode ? '#1E293B' : 'var(--slate-50)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: `1px solid ${borderColor}`,
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <div style={{ height: '110px', width: '100%', overflow: 'hidden' }}>
                      <img
                        src={rel.imageUrl}
                        alt={rel.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '0.85rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isB2BMode ? '#FBBF24' : '#10B981', textTransform: 'uppercase' }}>
                        {rel.category}
                      </span>
                      <div
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: textColor,
                          lineHeight: 1.3,
                          marginTop: '0.2rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {rel.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
