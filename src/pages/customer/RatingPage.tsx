import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  AlertCircle,
  Package,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { Product, B2COrder, B2BOrder } from '../../types';
import { reviewService } from '../../services/reviewService';
import { ondcClientService } from '../../services/ondcClientService';
import { useAuth } from '../../context/AuthContext';

interface RatingPageProps {
  products: Product[];
  b2cOrders: B2COrder[];
  b2bOrders: B2BOrder[];
  setActiveTab: (tab: string) => void;
}

export const RatingPage: React.FC<RatingPageProps> = ({
  products,
  b2cOrders,
  b2bOrders,
  setActiveTab,
}) => {
  const { b2cUser, b2bBusiness, role } = useAuth();

  const getParams = () => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return {
        productId: p.get('productId') || '',
        orderId: p.get('orderId') || '',
      };
    }
    return { productId: '', orderId: '' };
  };

  const { productId: initialProductId, orderId: initialOrderId } = getParams();

  const [selectedProductId, setSelectedProductId] = useState<string>(initialProductId || (products[0]?.id || ''));
  const [selectedOrderId, setSelectedOrderId] = useState<string>(initialOrderId || '');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [customerName, setCustomerName] = useState(b2cUser?.name || b2bBusiness?.contactPerson || '');
  const [companyName, setCompanyName] = useState(b2bBusiness?.companyName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [protocolStatus, setProtocolStatus] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const targetProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!rating || rating < 1 || rating > 5) {
      setErrorMessage('Please select a valid star rating (1 to 5 stars).');
      return;
    }

    if (!text || text.trim().length < 5) {
      setErrorMessage('Please enter a review description of at least 5 characters.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    if (!targetProduct) {
      setErrorMessage('Please select a valid product to review.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit internal verified product review
      const res = await reviewService.submitReview({
        productId: targetProduct.id,
        productName: targetProduct.name,
        productImage: targetProduct.images?.[0] || '',
        productSku: targetProduct.sku,
        orderId: selectedOrderId || 'direct_review',
        orderNumber: selectedOrderId || 'direct_review',
        customerType: role === 'b2b' ? 'b2b' : 'b2c',
        customerId: b2cUser?.id || b2bBusiness?.id || 'guest',
        customerName: customerName.trim(),
        companyName: companyName.trim() || undefined,
        rating,
        title: title.trim() || undefined,
        text: text.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.message);
        setIsSubmitting(false);
        return;
      }

      // 2. If associated with an order, optionally dispatch ONDC protocol rating
      if (selectedOrderId) {
        try {
          const ondcRes = await ondcClientService.submitRating(selectedOrderId, rating, text.trim());
          if (ondcRes.success) {
            setProtocolStatus('ONDC Network ACK: Order rating broadcast to buyer app');
          }
        } catch {
          // Non-blocking network feedback
        }
      }

      setSuccessMessage('Thank you! Your rating and feedback have been submitted successfully.');
      setIsSubmitted(true);
    } catch {
      setErrorMessage('An unexpected error occurred while saving your feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '85vh', padding: '2rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748B' }}>
          <button
            onClick={() => {
              window.history.pushState(null, '', '/');
              setActiveTab('home');
            }}
            style={{ background: 'none', border: 'none', padding: 0, color: '#0284C7', cursor: 'pointer', fontWeight: 600 }}
          >
            Home
          </button>
          <span>/</span>
          <span style={{ color: '#0F172A', fontWeight: 700 }}>Product & Order Feedback</span>
        </div>

        {/* Form Container */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.75rem 2rem',
              borderBottom: '1px solid #E2E8F0',
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              color: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <Star size={24} className="text-amber-400" fill="#FBBF24" />
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                Submit Rating & Experience Feedback
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8' }}>
              Your verified rating helps corporate institutions and eco-conscious buyers choose sustainable paper.
            </p>
          </div>

          <div style={{ padding: '2rem' }}>
            {isSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={56} color="#15803D" style={{ margin: '0 auto 1rem' }} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Feedback Submitted Successfully!
                </h2>
                <p style={{ color: '#64748B', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
                  {successMessage}
                </p>
                {protocolStatus && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 1rem',
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '8px',
                      color: '#15803D',
                      fontSize: '0.85rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <Sparkles size={16} />
                    <span>{protocolStatus}</span>
                  </div>
                )}
                <div>
                  <button
                    onClick={() => {
                      window.history.pushState(null, '', '/search');
                      setActiveTab('search');
                    }}
                    style={{
                      padding: '0.75rem 1.75rem',
                      borderRadius: '10px',
                      background: '#0284C7',
                      color: '#fff',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitRating}>
                {/* Product Selector */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', marginBottom: '0.5rem' }}>
                    Select Product to Rate *
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.95rem',
                      color: '#0F172A',
                      background: '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Order ID Link */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', marginBottom: '0.5rem' }}>
                    Associated Order Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KM-2026-101 (leave blank if general review)"
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.95rem',
                      color: '#0F172A',
                    }}
                  />
                </div>

                {/* Star Rating Selection */}
                <div style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '1.25rem', background: '#F8FAFC', borderRadius: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1E293B', marginBottom: '0.75rem' }}>
                    Your Overall Rating *
                  </label>
                  <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        <Star
                          size={36}
                          color={(hoverRating || rating) >= star ? '#F59E0B' : '#CBD5E1'}
                          fill={(hoverRating || rating) >= star ? '#F59E0B' : 'none'}
                        />
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: '#D97706' }}>
                    {rating === 5 && 'Outstanding - 5 Stars'}
                    {rating === 4 && 'Very Good - 4 Stars'}
                    {rating === 3 && 'Average - 3 Stars'}
                    {rating === 2 && 'Needs Improvement - 2 Stars'}
                    {rating === 1 && 'Unsatisfactory - 1 Star'}
                  </div>
                </div>

                {/* Name & Company */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1E293B', marginBottom: '0.35rem' }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Sen"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1E293B', marginBottom: '0.35rem' }}>
                      Company / College / Institution (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Horizon Public School"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>
                </div>

                {/* Review Headline */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1E293B', marginBottom: '0.35rem' }}>
                    Headline / Summary (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Exceptional smoothness and zero printer jams!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>

                {/* Written Feedback Description */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1E293B', marginBottom: '0.35rem' }}>
                    Written Feedback * (Minimum 5 characters)
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Tell us about the paper quality, ink absorption, packaging, delivery speed, or environmental impact..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {errorMessage && (
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      background: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      color: '#991B1B',
                      marginBottom: '1.25rem',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    }}
                  >
                    {errorMessage}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '0.85rem 2.25rem',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      border: 'none',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Send size={16} />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.history.pushState(null, '', '/');
                      setActiveTab('home');
                    }}
                    style={{
                      padding: '0.85rem 1.5rem',
                      borderRadius: '10px',
                      background: '#F1F5F9',
                      color: '#475569',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      border: '1px solid #CBD5E1',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
