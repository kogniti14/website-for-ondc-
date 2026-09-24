import React, { useState, useRef } from 'react';
import {
  X,
  Star,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Film,
} from 'lucide-react';
import { ReviewMedia } from '../../types';
import { reviewService } from '../../services/reviewService';

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage?: string;
  productSku?: string;
  orderId: string;
  orderNumber: string;
  customerType: 'b2c' | 'b2b';
  customerId: string;
  customerName: string;
  companyName?: string;
  onSuccess?: () => void;
}

export const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
  productSku,
  orderId,
  orderNumber,
  customerType,
  customerId,
  customerName,
  companyName,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [media, setMedia] = useState<ReviewMedia[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const starLabels: Record<number, string> = {
    1: '1 Star - Poor',
    2: '2 Stars - Fair',
    3: '3 Stars - Good',
    4: '4 Stars - Very Good',
    5: '5 Stars - Excellent',
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    setIsUploading(true);

    try {
      const uploadPromises: Promise<ReviewMedia>[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        uploadPromises.push(reviewService.uploadReviewMedia(file));
      }

      const results = await Promise.all(uploadPromises);
      setMedia((prev) => [...prev, ...results]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading media file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveMedia = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setErrorMsg('Please select a star rating between 1 and 5.');
      return;
    }
    if (!text.trim() || text.trim().length < 5) {
      setErrorMsg('Please write a review with at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await reviewService.submitReview({
        productId,
        productName,
        productImage,
        productSku,
        orderId,
        orderNumber,
        customerType,
        customerId,
        customerName,
        companyName,
        rating,
        title: title.trim() || undefined,
        text: text.trim(),
        media,
      });

      if (res.success) {
        setSubmittedSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message || 'Failed to submit review.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred while submitting review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state and close
    setRating(5);
    setTitle('');
    setText('');
    setMedia([]);
    setErrorMsg(null);
    setSubmittedSuccess(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting && !isUploading) {
          handleClose();
        }
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#EFF6FF',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Star size={20} fill="currentColor" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                Write a Verified Review
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                Order #{orderNumber} • {customerType.toUpperCase()} Verified Purchase
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-700 transition"
            style={{ padding: '0.4rem', borderRadius: '8px' }}
            aria-label="Close review modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {submittedSuccess ? (
            /* CRITICAL UX: Silent Confirmation Screen */
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
                Thank you!
              </h4>
              <p style={{ fontSize: '1.05rem', color: 'var(--slate-700)', fontWeight: 600, marginBottom: '0.4rem' }}>
                Your review has been submitted successfully.
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', maxWidth: '420px', margin: '0 auto 2rem' }}>
                We appreciate you taking the time to share your genuine experience with{' '}
                <strong>{productName}</strong>.
              </p>

              <button
                type="button"
                onClick={handleClose}
                className="btn btn-primary"
                style={{
                  padding: '0.75rem 2.5rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                }}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Product Info Strip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.85rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {productImage && (
                  <img
                    src={productImage}
                    alt={productName}
                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: 'var(--slate-900)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {productName}
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    <ShieldCheck size={14} />
                    Verified Purchase by {customerName} {companyName ? `(${companyName})` : ''}
                  </div>
                </div>
              </div>

              {/* Star Rating Picker */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
                  Overall Rating <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                            color: isActive ? '#F59E0B' : '#CBD5E1',
                            transition: 'transform 0.15s ease, color 0.15s ease',
                          }}
                          className="hover:scale-110 focus:outline-none"
                          aria-label={`${star} star rating`}
                        >
                          <Star size={30} fill={isActive ? '#F59E0B' : 'transparent'} strokeWidth={1.5} />
                        </button>
                      );
                    })}
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#D97706', marginLeft: '0.5rem' }}>
                    {starLabels[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Review Title (Optional) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.35rem' }}>
                  Review Headline <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--slate-400)' }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Excellent paper quality, fast delivery"
                  maxLength={100}
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              {/* Review Text (Required) */}
              <div>
                <div className="flex justify-between items-center" style={{ marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                    Written Review <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                    {text.length} / 1000 characters
                  </span>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What did you like or dislike about this product? How was the performance, finish, and packaging?"
                  rows={4}
                  maxLength={1000}
                  required
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    lineHeight: '1.45',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Media Upload (Images & Videos) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.2rem' }}>
                  Add Photos & Videos <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--slate-400)' }}>(Optional)</span>
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
                  Allowed photos: <strong>JPG, PNG, WEBP (Max 5MB)</strong> • Allowed videos: <strong>MP4, WEBM (Max 25MB)</strong>
                </p>

                {/* Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                  multiple
                  style={{ display: 'none' }}
                />

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isSubmitting}
                    className="btn btn-secondary flex items-center gap-2"
                    style={{
                      padding: '0.55rem 1rem',
                      fontSize: '0.85rem',
                      borderRadius: '8px',
                      border: '1px dashed var(--primary-300)',
                      backgroundColor: '#F0F9FF',
                      color: 'var(--primary-700)',
                    }}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Uploading media...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Upload Photos or Video
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                    <span className="flex items-center gap-1"><ImageIcon size={13} /> Photos</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><VideoIcon size={13} /> Videos</span>
                  </div>
                </div>

                {/* Media Preview Gallery */}
                {media.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                      gap: '0.75rem',
                      marginTop: '0.85rem',
                      padding: '0.75rem',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '10px',
                    }}
                  >
                    {media.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          position: 'relative',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid var(--border-color)',
                          backgroundColor: '#000000',
                          aspectRatio: '1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.mediaType === 'video' ? (
                          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            <video
                              src={item.url}
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
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                              }}
                            >
                              <Film size={22} color="#FFFFFF" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.fileName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(item.id)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(239, 68, 68, 0.9)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                          }}
                          title="Remove media"
                          aria-label="Remove media"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div
                  className="flex items-center gap-2"
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '8px',
                    color: '#B91C1C',
                    fontSize: '0.82rem',
                  }}
                >
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="btn btn-primary flex items-center gap-2"
                  style={{
                    padding: '0.65rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting Review...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
