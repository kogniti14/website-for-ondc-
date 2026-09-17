import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  ArrowRight,
  Calendar,
  Tag,
  Share2,
  FolderOpen,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { GalleryStory, GalleryCategory } from '../../types';
import { galleryService } from '../../services/galleryService';

interface SuccessStoriesPageProps {
  onOpenStory: (story: GalleryStory) => void;
  onNavigateHome?: () => void;
}

export const SuccessStoriesPage: React.FC<SuccessStoriesPageProps> = ({
  onOpenStory,
  onNavigateHome,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories: GalleryCategory[] = useMemo(() => {
    return galleryService.getCategories();
  }, []);

  // Filter: strictly published and visible on B2C (b2c or both)
  const stories = useMemo(() => {
    return galleryService.getStories({
      visibility: 'b2c',
      status: 'published',
      category: selectedCategory,
      search: searchQuery,
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* 1. Hero Header Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0A0F1D 0%, #064E3B 50%, #022C22 100%)',
          color: '#FFFFFF',
          padding: '4.5rem 1.25rem 4rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient background blur elements */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(52, 211, 153, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '840px', margin: '0 auto' }}>
          <div
            className="inline-flex items-center gap-2"
            style={{
              background: 'rgba(52, 211, 153, 0.15)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              color: '#6EE7B7',
              padding: '0.35rem 0.95rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={14} className="text-emerald-400" /> Real Impact • Circular Innovations
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.9rem)',
              fontWeight: 900,
              fontFamily: 'var(--font-heading)',
              lineHeight: '1.2',
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            Our Success Stories & Image Gallery
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: '#D1FAE5',
              marginTop: '1rem',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '1rem auto 0',
            }}
          >
            Discover how Kogniti Minds transforms millions of tons of agricultural stubble into circular, tree-free packaging paper while uplifting rural farming communities.
          </p>
        </div>
      </section>

      {/* 2. Controls & Categories Toolbar */}
      <div className="container" style={{ marginTop: '-1.5rem', position: 'relative', zIndex: 10, padding: '0 1.25rem' }}>
        <div
          className="card"
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
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
                  color: 'var(--slate-400)',
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stories by milestone, keyword, or initiative..."
                className="form-input"
                style={{
                  paddingLeft: '2.6rem',
                  fontSize: '0.88rem',
                  borderRadius: '10px',
                }}
              />
            </div>

            <div style={{ fontSize: '0.84rem', color: 'var(--slate-500)', fontWeight: 600 }}>
              Showing <strong>{stories.length}</strong> {stories.length === 1 ? 'published story' : 'published stories'}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div
            className="flex items-center gap-2 flex-wrap"
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1rem',
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--slate-400)', marginRight: '0.25rem' }}>
              CATEGORY:
            </span>

            <button
              onClick={() => setSelectedCategory('All')}
              className={`btn btn-xs ${selectedCategory === 'All' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                borderRadius: '9999px',
                padding: '0.35rem 0.9rem',
                fontSize: '0.8rem',
                fontWeight: selectedCategory === 'All' ? 700 : 500,
                background: selectedCategory === 'All' ? '#10B981' : undefined,
                color: selectedCategory === 'All' ? '#FFFFFF' : 'var(--slate-600)',
              }}
            >
              All Stories
            </button>

            {categories.map((c) => {
              const isSelected = selectedCategory.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.name)}
                  className={`btn btn-xs ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                  style={{
                    borderRadius: '9999px',
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? '#10B981' : undefined,
                    color: isSelected ? '#FFFFFF' : 'var(--slate-600)',
                  }}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Stories Grid */}
      <div className="container" style={{ padding: '2.5rem 1.25rem 0' }}>
        {stories.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              borderRadius: '16px',
              maxWidth: '540px',
              margin: '0 auto',
            }}
          >
            <FolderOpen size={48} style={{ color: 'var(--slate-300)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-800)' }}>
              No Stories Found
            </h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', margin: '0.5rem auto 1.5rem', lineHeight: 1.5 }}>
              We couldn't find any published success stories matching your active filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="btn btn-outline btn-sm"
              style={{ borderRadius: '9999px' }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {stories.map((s) => (
              <article
                key={s.id}
                onClick={() => onOpenStory(s)}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 14px 28px rgba(0, 0, 0, 0.09)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.04)';
                }}
              >
                {/* Media Image Banner */}
                <div
                  style={{
                    position: 'relative',
                    height: '210px',
                    width: '100%',
                    overflow: 'hidden',
                    background: '#E2E8F0',
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
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: '#6EE7B7',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.03em',
                    }}
                  >
                    {s.category}
                  </div>

                  {/* Featured Badge */}
                  {s.featured && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#F59E0B',
                        color: '#FFFFFF',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
                      }}
                    >
                      ★ Featured
                    </div>
                  )}
                </div>

                {/* Content Block */}
                <div style={{ padding: '1.5rem', flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                  <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    <Calendar size={13} />
                    <span>
                      {new Date(s.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span>Kogniti Minds Narrative</span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: 'var(--slate-900)',
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
                      color: 'var(--slate-600)',
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
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '1rem',
                      marginTop: 'auto',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      Read Full Story <ArrowRight size={15} />
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      3 min read
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
