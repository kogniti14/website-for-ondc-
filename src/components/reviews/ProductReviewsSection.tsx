import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  ShieldCheck,
  Image as ImageIcon,
  Film,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  ArrowUpDown,
  Lock,
  X,
  Play,
} from 'lucide-react';
import { Product, ProductReview, ReviewMedia } from '../../types';
import { reviewService } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import { dataSyncBus } from '../../services/dataSyncBus';
import { ReviewSubmissionModal } from './ReviewSubmissionModal';

interface ProductReviewsSectionProps {
  product: Product;
  onOpenAuthModal?: () => void;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  product,
  onOpenAuthModal,
}) => {
  const { role, b2cUser, b2bBusiness } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState<boolean>(false);
  const [selectedMediaForLightbox, setSelectedMediaForLightbox] = useState<ReviewMedia | null>(null);

  // Filters & Sorting
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterWithPhotos, setFilterWithPhotos] = useState<boolean>(false);
  const [filterWithVideos, setFilterWithVideos] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');

  // Load reviews and subscribe to changes
  const refreshReviews = () => {
    // Only APPROVED reviews are retrieved for public display
    const approved = reviewService.getApprovedReviews(product.id);
    setReviews(approved);
  };

  useEffect(() => {
    refreshReviews();
    const unsub = dataSyncBus.subscribe('reviews', () => {
      refreshReviews();
    });
    return () => {
      unsub();
    };
  }, [product.id]);

  // Check purchase eligibility for current user
  const eligibility = useMemo(() => {
    return reviewService.checkEligibility(product.id, { role, b2cUser, b2bBusiness });
  }, [product.id, role, b2cUser, b2bBusiness, reviews]);

  // Calculate rating & distribution exclusively from approved reviews
  const stats = useMemo(() => {
    return reviewService.calculateProductRating(product.id, reviews);
  }, [product.id, reviews]);

  // Filtered and sorted reviews
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    if (filterRating !== 'all') {
      list = list.filter((r) => Math.round(r.rating) === filterRating);
    }

    if (filterWithPhotos) {
      list = list.filter((r) => r.media && r.media.some((m) => m.mediaType === 'image'));
    }

    if (filterWithVideos) {
      list = list.filter((r) => r.media && r.media.some((m) => m.mediaType === 'video'));
    }

    list.sort((a, b) => {
      if (sortBy === 'highest') {
        return b.rating - a.rating;
      }
      if (sortBy === 'lowest') {
        return a.rating - b.rating;
      }
      // 'recent'
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [reviews, filterRating, filterWithPhotos, filterWithVideos, sortBy]);

  // Determine reviewer details for form pre-population
  const userDetails = useMemo(() => {
    if (role === 'b2b' && b2bBusiness) {
      return {
        customerType: 'b2b' as const,
        customerId: b2bBusiness.id,
        customerName: b2bBusiness.contactPerson || b2bBusiness.companyName,
        companyName: b2bBusiness.companyName,
      };
    }
    if (b2cUser) {
      return {
        customerType: 'b2c' as const,
        customerId: b2cUser.id,
        customerName: b2cUser.name,
        companyName: undefined,
      };
    }
    return null;
  }, [role, b2cUser, b2bBusiness]);

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Rating Overview Banner */}
      <div
        style={{
          padding: '1.25rem',
          backgroundColor: '#F8FAFC',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center',
        }}
      >
        {/* Left: Big Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--slate-900)', lineHeight: 1 }}>
              {stats.totalReviews > 0 ? stats.averageRating : Number(product.rating || 5.0).toFixed(1)}
            </div>
            <div className="flex items-center justify-center text-amber-500" style={{ marginTop: '0.35rem' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  fill={s <= Math.round(stats.totalReviews > 0 ? stats.averageRating : product.rating || 5) ? '#F59E0B' : 'transparent'}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.3rem', fontWeight: 600 }}>
              {stats.totalReviews > 0 ? `${stats.totalReviews} Verified Reviews` : 'Based on initial ratings'}
            </div>
          </div>

          {/* Star Distribution Progress Bars */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {[5, 4, 3, 2, 1].map((starNum) => {
              const count = stats.distribution[starNum] || 0;
              const percent = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
              return (
                <div key={starNum} className="flex items-center gap-2" style={{ fontSize: '0.75rem' }}>
                  <span style={{ width: '38px', color: 'var(--slate-600)', fontWeight: 600 }}>{starNum} ★</span>
                  <div
                    style={{
                      flex: 1,
                      height: '7px',
                      backgroundColor: '#E2E8F0',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        backgroundColor: '#F59E0B',
                        borderRadius: '999px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <span style={{ width: '28px', color: 'var(--slate-400)', textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Write a Review Gate */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            borderLeft: '1px solid var(--border-subtle)',
            paddingLeft: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
            Have you purchased this product?
          </div>

          {eligibility.eligible && userDetails ? (
            <div>
              <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>
                Share your verified experience, photos, or video to help other customers.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmissionModalOpen(true)}
                className="btn btn-primary flex items-center gap-2"
                style={{
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                }}
              >
                <Star size={16} />
                Write a Review
              </button>
            </div>
          ) : eligibility.alreadyReviewed ? (
            <div className="flex items-center gap-2 text-emerald-700" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              <span>You have submitted a review for this purchase.</span>
            </div>
          ) : role === 'guest' ? (
            <div>
              <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>
                Reviews are available for verified buyers who purchased this product.
              </p>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="btn btn-secondary flex items-center gap-1.5"
                style={{
                  padding: '0.55rem 1rem',
                  fontSize: '0.82rem',
                  borderRadius: '8px',
                }}
              >
                <Lock size={14} />
                Log in to Write a Review
              </button>
            </div>
          ) : (
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--slate-600)',
                backgroundColor: '#F1F5F9',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <ShieldCheck size={16} className="text-slate-500 shrink-0" />
              <span>Reviews are available for verified customers who purchased this product.</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Filters & Sort Controls Bar */}
      <div
        className="flex items-center justify-between flex-wrap gap-3"
        style={{
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterRating('all')}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.78rem',
              borderRadius: '999px',
              border: filterRating === 'all' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              backgroundColor: filterRating === 'all' ? '#EFF6FF' : '#FFFFFF',
              color: filterRating === 'all' ? 'var(--primary)' : 'var(--slate-600)',
              fontWeight: filterRating === 'all' ? 700 : 500,
              cursor: 'pointer',
            }}
          >
            All ({reviews.length})
          </button>

          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterRating(filterRating === s ? 'all' : s)}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                borderRadius: '999px',
                border: filterRating === s ? '1px solid #D97706' : '1px solid var(--border-color)',
                backgroundColor: filterRating === s ? '#FEF3C7' : '#FFFFFF',
                color: filterRating === s ? '#B45309' : 'var(--slate-600)',
                fontWeight: filterRating === s ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {s} ★ ({stats.distribution[s] || 0})
            </button>
          ))}

          <button
            type="button"
            onClick={() => setFilterWithPhotos(!filterWithPhotos)}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.78rem',
              borderRadius: '999px',
              border: filterWithPhotos ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              backgroundColor: filterWithPhotos ? '#EFF6FF' : '#FFFFFF',
              color: filterWithPhotos ? 'var(--primary)' : 'var(--slate-600)',
              fontWeight: filterWithPhotos ? 700 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <ImageIcon size={13} />
            With Photos
          </button>

          <button
            type="button"
            onClick={() => setFilterWithVideos(!filterWithVideos)}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.78rem',
              borderRadius: '999px',
              border: filterWithVideos ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              backgroundColor: filterWithVideos ? '#EFF6FF' : '#FFFFFF',
              color: filterWithVideos ? 'var(--primary)' : 'var(--slate-600)',
              fontWeight: filterWithVideos ? 700 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <Film size={13} />
            With Videos
          </button>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5" style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
          <ArrowUpDown size={14} />
          <span>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '0.3rem 0.6rem',
              fontSize: '0.78rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: '#FFFFFF',
              color: 'var(--slate-800)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* 3. Approved Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredReviews.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px dashed var(--border-color)',
            }}
          >
            <Star size={32} style={{ color: '#CBD5E1', margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.35rem' }}>
              No Reviews Match Filter
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
              Try clearing filters to view all verified customer reviews.
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                padding: '1.15rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              {/* Card Header: Rating + Badge + Date */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= Math.round(rev.rating) ? '#F59E0B' : 'transparent'}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--slate-900)' }}>
                    {rev.rating}.0
                  </span>

                  {rev.isVerifiedPurchase && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: '1px solid #A7F3D0',
                      }}
                    >
                      <ShieldCheck size={12} />
                      Verified Purchase
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-slate-400" style={{ fontSize: '0.75rem' }}>
                  <Calendar size={13} />
                  <span>{formatDate(rev.createdAt)}</span>
                </div>
              </div>

              {/* Review Title */}
              {rev.title && (
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                  "{rev.title}"
                </h4>
              )}

              {/* Review Text */}
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-700)', lineHeight: '1.5', margin: 0 }}>
                {rev.text}
              </p>

              {/* Media Thumbnails (Images & Videos) */}
              {rev.media && rev.media.length > 0 && (
                <div className="flex items-center gap-2.5 flex-wrap" style={{ marginTop: '0.4rem' }}>
                  {rev.media.map((med) => (
                    <div
                      key={med.id}
                      onClick={() => setSelectedMediaForLightbox(med)}
                      style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                        border: '1px solid var(--border-color)',
                        backgroundColor: '#000000',
                      }}
                      className="hover:opacity-90 hover:scale-105 transition"
                      title={med.fileName}
                    >
                      {med.mediaType === 'video' ? (
                        <>
                          <video
                            src={med.url}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            muted
                            playsInline
                          />
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'rgba(0, 0, 0, 0.35)',
                              color: '#FFFFFF',
                            }}
                          >
                            <Play size={20} fill="#FFFFFF" />
                          </div>
                        </>
                      ) : (
                        <img
                          src={med.url}
                          alt={med.fileName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Reviewer Identity Footer (Privacy Preserving) */}
              <div
                className="flex items-center gap-2 text-slate-500"
                style={{
                  fontSize: '0.78rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px dashed var(--border-subtle)',
                  marginTop: '0.25rem',
                }}
              >
                <div className="flex items-center gap-1">
                  <User size={13} className="text-slate-400" />
                  <strong style={{ color: 'var(--slate-800)' }}>{rev.customerName}</strong>
                </div>

                {rev.companyName && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Building2 size={13} className="text-slate-400" />
                      <span style={{ color: 'var(--slate-600)', fontWeight: 600 }}>{rev.companyName}</span>
                    </div>
                  </>
                )}

                {rev.customerType === 'b2b' && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.7rem',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#EFF6FF',
                      color: '#1E40AF',
                      fontWeight: 700,
                    }}
                  >
                    B2B Client
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. Lightbox Modal for Full Image Zoom / Video Playback */}
      {selectedMediaForLightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={() => setSelectedMediaForLightbox(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMediaForLightbox(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Close media preview"
            >
              <X size={20} />
            </button>

            {selectedMediaForLightbox.mediaType === 'video' ? (
              <video
                src={selectedMediaForLightbox.url}
                controls
                autoPlay
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  borderRadius: '12px',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                }}
              />
            ) : (
              <img
                src={selectedMediaForLightbox.url}
                alt={selectedMediaForLightbox.fileName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  borderRadius: '12px',
                  objectFit: 'contain',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* 5. Review Submission Modal */}
      {userDetails && eligibility.orderId && eligibility.orderNumber && (
        <ReviewSubmissionModal
          isOpen={isSubmissionModalOpen}
          onClose={() => setIsSubmissionModalOpen(false)}
          productId={product.id}
          productName={product.name}
          productImage={product.images && product.images[0]}
          productSku={product.sku}
          orderId={eligibility.orderId}
          orderNumber={eligibility.orderNumber}
          customerType={userDetails.customerType}
          customerId={userDetails.customerId}
          customerName={userDetails.customerName}
          companyName={userDetails.companyName}
          onSuccess={() => {
            refreshReviews();
          }}
        />
      )}
    </div>
  );
};
