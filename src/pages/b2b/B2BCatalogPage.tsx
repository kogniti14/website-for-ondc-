import React, { useState } from 'react';
import {
  Search,
  Lock,
  Building2,
  ShoppingCart,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Product, Category } from '../../types';
import { CATEGORIES } from '../../data/mockProducts';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface B2BCatalogPageProps {
  products: Product[];
  categories?: Category[];
  onOpenProduct: (product: Product) => void;
  openB2BAuthModal: () => void;
  onOpenRfqModal: (product: Product) => void;
}

export const B2BCatalogPage: React.FC<B2BCatalogPageProps> = ({
  products,
  categories,
  onOpenProduct,
  openB2BAuthModal,
  onOpenRfqModal,
}) => {
  const categoryList = categories && categories.length > 0 ? categories : CATEGORIES;
  const { role, b2bBusiness } = useAuth();
  const { addToB2BCart } = useCart();

  const isApproved = role === 'b2b' && b2bBusiness?.status === 'approved';
  const isPending = role === 'b2b' && b2bBusiness?.status === 'pending';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAddToCart = (p: Product) => {
    const res = addToB2BCart(p.id, p.b2bMoq);
    if (res.success) {
      setFeedback(`Added MOQ of ${p.b2bMoq} units of ${p.name} to your B2B Cart.`);
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback(res.message || 'Could not add to cart');
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div style={{ backgroundColor: '#0A0F1D', color: '#E2E8F0', minHeight: '100vh', padding: '3rem 0 6rem' }}>
      <div className="container">
        {/* Banner Alert if Pending or Unauthenticated */}
        {!isApproved && (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: isPending
                ? 'rgba(245, 158, 11, 0.12)'
                : 'rgba(37, 99, 235, 0.12)',
              border: `1.5px solid ${isPending ? 'rgba(245, 158, 11, 0.3)' : 'rgba(37, 99, 235, 0.3)'}`,
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div className="flex items-center gap-3">
              {isPending ? (
                <Clock size={24} className="text-amber-400" style={{ flexShrink: 0 }} />
              ) : (
                <Lock size={24} className="text-blue-400" style={{ flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#FFFFFF' }}>
                  {isPending
                    ? `Account Under Verification: ${b2bBusiness?.companyName}`
                    : 'Wholesale Pricing & MOQ Slabs Protected'}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '0.2rem' }}>
                  {isPending
                    ? 'Your GST registration documents are being verified by our compliance team (SLA: 24h). Wholesale purchasing will unlock once approved.'
                    : 'Confidential B2B prices and tiered slabs are visible only to verified business accounts. Register with GSTIN to unlock wholesale access.'}
                </div>
              </div>
            </div>

            {!isPending && (
              <button
                onClick={openB2BAuthModal}
                className="btn btn-amber btn-sm"
                style={{ flexShrink: 0, borderRadius: 'var(--radius-full)' }}
              >
                Sign In / Register Entity <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}

        {/* Feedback Alert */}
        {feedback && (
          <div
            className="flex items-center gap-2"
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34D399',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{feedback}</span>
          </div>
        )}

        {/* Header Title */}
        <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
          <div>
            <span style={{ color: '#38BDF8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Institutional Sourcing Desk
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF' }}>
              Wholesale Sustainable Paper & Institutional Supplies Catalog
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.92rem', marginTop: '0.2rem' }}>
              Direct manufacturer procurement for schools, offices, universities, corporate enterprises, and resellers.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search sustainable paper, printing paper, notebooks, journals, stationery & more..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFF',
                paddingLeft: '38px',
                fontSize: '0.88rem',
              }}
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('All')}
              className="btn btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                background: selectedCategory === 'All' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
              }}
            >
              All Items
            </button>
            {categoryList.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className="btn btn-sm"
                style={{
                  borderRadius: 'var(--radius-full)',
                  background: selectedCategory === c.name ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Table / Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filtered.map((product) => (
            <div
              key={product.id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '160px 1fr auto',
                gap: '1.5rem',
                alignItems: 'center',
              }}
              className="b2b-catalog-row"
            >
              {/* Image */}
              <div
                style={{
                  width: '160px',
                  height: '140px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  backgroundColor: '#1E293B',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
                onClick={() => onOpenProduct(product)}
              >
                <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Middle Info */}
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.35rem' }}>
                  <span className="badge badge-dark" style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                    {product.category}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>SKU: {product.sku}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>HSN: {product.hsn}</span>
                </div>

                <h3
                  onClick={() => onOpenProduct(product)}
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    marginBottom: '0.4rem',
                    cursor: 'pointer',
                  }}
                >
                  {product.name}
                </h3>

                <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: '1.5', maxWidth: '650px', marginBottom: '0.75rem' }}>
                  {product.shortDescription}
                </p>

                {/* Tier Discount Slabs Pill Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: '0.75rem', color: '#CBD5E1', fontWeight: 600 }}>Volume Discount Slabs:</span>
                  {product.b2bDiscountSlabs.map((slab, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        color: slab.discountPercent > 0 ? '#34D399' : '#CBD5E1',
                      }}
                    >
                      {slab.minQty}{slab.maxQty ? `-${slab.maxQty}` : '+'} units: <strong>{slab.discountPercent}% Off</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Pricing & Actions */}
              <div
                style={{
                  minWidth: '220px',
                  paddingLeft: '1.5rem',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {isApproved ? (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Wholesale Base Price</div>
                    <div className="flex items-baseline gap-1">
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38BDF8' }}>
                        ₹{product.b2bWholesalePrice.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>/ unit</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400" style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '0.2rem' }}>
                      MOQ: {product.b2bMoq} Units
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#34D399', marginTop: '0.1rem' }}>
                      +18% GST (100% ITC Eligible)
                    </div>

                    <div className="flex flex-col gap-2" style={{ marginTop: '0.85rem' }}>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="btn btn-amber btn-sm"
                        style={{ width: '100%' }}
                      >
                        <ShoppingCart size={15} /> Add MOQ ({product.b2bMoq})
                      </button>
                      <button
                        onClick={() => onOpenRfqModal(product)}
                        className="btn btn-sm"
                        style={{
                          width: '100%',
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <FileText size={14} /> Request Quote
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px dashed rgba(255, 255, 255, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.85rem',
                        textAlign: 'center',
                      }}
                    >
                      <Lock size={18} className="text-amber-400" style={{ margin: '0 auto 0.35rem' }} />
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                        Wholesale Locked
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                        Approved business account required
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenRfqModal(product)}
                      className="btn btn-amber btn-sm"
                      style={{ width: '100%', marginTop: '0.75rem' }}
                    >
                      <FileText size={14} /> Request Quote
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
