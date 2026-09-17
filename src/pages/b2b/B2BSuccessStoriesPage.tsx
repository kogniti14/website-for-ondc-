import React, { useState, useMemo } from 'react';
import {
  Building2,
  Sparkles,
  Search,
  ArrowRight,
  Calendar,
  Tag,
  ShieldCheck,
  Award,
  Layers,
  FileText,
} from 'lucide-react';
import { GalleryStory, GalleryCategory } from '../../types';
import { galleryService } from '../../services/galleryService';

interface B2BSuccessStoriesPageProps {
  onOpenStory: (story: GalleryStory) => void;
  setB2bTab?: (tab: string) => void;
}

export const B2BSuccessStoriesPage: React.FC<B2BSuccessStoriesPageProps> = ({
  onOpenStory,
  setB2bTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories: GalleryCategory[] = useMemo(() => {
    return galleryService.getCategories();
  }, []);

  // Filter: strictly published and visible on B2B (b2b or both)
  const stories = useMemo(() => {
    return galleryService.getStories({
      visibility: 'b2b',
      status: 'published',
      category: selectedCategory,
      search: searchQuery,
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div style={{ backgroundColor: '#0A0F1D', color: '#E2E8F0', minHeight: '100vh', paddingBottom: '6rem' }}>
      {/* 1. Corporate Header */}
      <section
        style={{
          position: 'relative',
          padding: '4.5rem 1.25rem 3.5rem',
          background: 'radial-gradient(ellipse at top, #1E293B 0%, #0A0F1D 75%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
          <div
            className="inline-flex items-center gap-2"
            style={{
              background: 'rgba(217, 119, 6, 0.15)',
              border: '1px solid rgba(217, 119, 6, 0.35)',
              padding: '0.35rem 0.95rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              color: '#FBBF24',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            <Building2 size={14} className="text-amber-400" /> Enterprise ESG Impact & Industrial Milestones
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: 900,
              fontFamily: 'var(--font-heading)',
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Corporate Success Stories & Milestones
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: '#94A3B8',
              marginTop: '1rem',
              lineHeight: 1.6,
              maxWidth: '700px',
              margin: '1rem auto 0',
            }}
          >
            Examining institutional packaging transformations, closed-loop agro-paper manufacturing achievements, and large-scale ESG carbon mitigation partnerships.
          </p>
        </div>
      </section>

      {/* 2. Controls & Categories Toolbar */}
      <div className="container" style={{ marginTop: '-1.5rem', position: 'relative', zIndex: 10, padding: '0 1.25rem' }}>
        <div
          style={{
            background: '#1E293B',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Search Row */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '460px' }}>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case studies, certifications, or facilities..."
                className="form-input"
                style={{
                  paddingLeft: '2.6rem',
                  fontSize: '0.88rem',
                  borderRadius: '10px',
                  background: '#0F172A',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                }}
              />
            </div>

            <div style={{ fontSize: '0.84rem', color: '#94A3B8', fontWeight: 600 }}>
              Showing <strong>{stories.length}</strong> enterprise case studies
            </div>
          </div>

          {/* Category Filter Pills */}
          <div
            className="flex items-center gap-2 flex-wrap"
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '1rem',
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', marginRight: '0.25rem' }}>
              SECTOR:
            </span>

            <button
              onClick={() => setSelectedCategory('All')}
              className="btn btn-xs"
              style={{
                borderRadius: '9999px',
                padding: '0.35rem 0.9rem',
                fontSize: '0.8rem',
                fontWeight: selectedCategory === 'All' ? 700 : 500,
                background: selectedCategory === 'All' ? '#D97706' : 'rgba(255, 255, 255, 0.06)',
                color: selectedCategory === 'All' ? '#FFFFFF' : '#94A3B8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              All Milestones
            </button>

            {categories.map((c) => {
              const isSelected = selectedCategory.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.name)}
                  className="btn btn-xs"
                  style={{
                    borderRadius: '9999px',
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? '#D97706' : 'rgba(255, 255, 255, 0.06)',
                    color: isSelected ? '#FFFFFF' : '#94A3B8',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Corporate Stories Grid */}
      <div className="container" style={{ padding: '2.5rem 1.25rem 0' }}>
        {stories.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              borderRadius: '16px',
              maxWidth: '540px',
              margin: '0 auto',
              background: '#1E293B',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Layers size={48} style={{ color: '#64748B', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              No B2B Stories Matching Selection
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: '0.5rem auto 1.5rem' }}>
              Try selecting a different category or resetting your query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="btn btn-outline btn-sm"
              style={{ color: '#FBBF24', borderColor: '#FBBF24', borderRadius: '9999px' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
              gap: '2rem',
            }}
          >
            {stories.map((s) => (
              <article
                key={s.id}
                onClick={() => onOpenStory(s)}
                style={{
                  background: '#1E293B',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(217, 119, 6, 0.5)';
                  e.currentTarget.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
                }}
              >
                {/* Media Image Banner */}
                <div
                  style={{
                    position: 'relative',
                    height: '210px',
                    width: '100%',
                    overflow: 'hidden',
                    background: '#0F172A',
                  }}
                >
                  <img
                    src={s.imageUrl}
                    alt={s.imageAlt || s.title}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />

                  {/* Category Pill Tag */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(10, 15, 29, 0.88)',
                      backdropFilter: 'blur(4px)',
                      color: '#FCD34D',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.03em',
                      border: '1px solid rgba(252, 211, 77, 0.3)',
                    }}
                  >
                    {s.category}
                  </div>

                  {s.featured && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#D97706',
                        color: '#FFFFFF',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        boxShadow: '0 2px 8px rgba(217, 119, 6, 0.5)',
                      }}
                    >
                      ★ Featured ESG
                    </div>
                  )}
                </div>

                {/* Content Block */}
                <div style={{ padding: '1.5rem', flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                  <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    <Calendar size={13} className="text-amber-400" />
                    <span>
                      {new Date(s.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span>Corporate Executive Brief</span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      lineHeight: 1.35,
                      marginBottom: '0.65rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {s.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.86rem',
                      color: '#94A3B8',
                      lineHeight: 1.55,
                      marginBottom: '1.25rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: '1 0 auto',
                    }}
                  >
                    {s.shortDescription}
                  </p>

                  <div
                    className="flex items-center justify-between"
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingTop: '1rem',
                      marginTop: 'auto',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        color: '#60A5FA',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      Explore Case Study <ArrowRight size={15} />
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Verified Data
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
