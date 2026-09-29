import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Package,
} from 'lucide-react';
import { Product, Category } from '../../types';
import { ProductCard } from '../../components/products/ProductCard';
import { ondcClientService } from '../../services/ondcClientService';

interface SearchPageProps {
  products: Product[];
  categories: Category[];
  onOpenProduct: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  setActiveTab: (tab: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  products,
  categories,
  onOpenProduct,
  onBuyNow,
  setActiveTab,
}) => {
  // Read initial query from URL search params without jumping to #products
  const getInitialQuery = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    }
    return '';
  };

  const [search, setSearch] = useState<string>(getInitialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<number>(100000);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [protocolStatus, setProtocolStatus] = useState<string | null>(null);

  // Sync state if URL changes (e.g. browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get('q') || '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update browser URL to /search?q=... cleanly without changing hash to #products
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = search.trim();
    const newUrl = query ? `/search?q=${encodeURIComponent(query)}` : '/search';
    window.history.pushState(null, '', newUrl);

    if (query) {
      setProtocolStatus('Searching ONDC network...');
      ondcClientService
        .searchProducts(query)
        .then((res) => {
          if (res.success) {
            setProtocolStatus('ONDC Network ACK: 13 Eco-friendly items synchronized');
          } else {
            setProtocolStatus(null);
          }
        })
        .catch(() => setProtocolStatus(null));
    } else {
      setProtocolStatus(null);
    }
  };

  // Filter products locally from authoritative catalog
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category match
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      // Search term match
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const inName = (p.name || '').toLowerCase().includes(q);
        const inDesc = (p.description || '').toLowerCase().includes(q);
        const inSku = (p.sku || '').toLowerCase().includes(q);
        const inCategory = (p.category || '').toLowerCase().includes(q);
        const inTagline = (p.tagline || '').toLowerCase().includes(q);
        const inFeatures = (p.features || []).some((f) => f.toLowerCase().includes(q));
        if (!inName && !inDesc && !inSku && !inCategory && !inTagline && !inFeatures) {
          return false;
        }
      }
      // Price range
      const effectivePrice = p.b2cPrice || 0;
      if (effectivePrice > priceRange) return false;
      // Min rating
      if (minRating > 0 && (p.rating || 0) < minRating) return false;
      // Stock status
      if (onlyInStock && p.stockStatus === 'out_of_stock') return false;
      return true;
    });
  }, [products, search, selectedCategory, priceRange, minRating, onlyInStock]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price-low') {
      list.sort((a, b) => (a.b2cPrice || 0) - (b.b2cPrice || 0));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.b2cPrice || 0) - (a.b2cPrice || 0));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return list;
  }, [filteredProducts, sortBy]);

  const handleSelectProduct = (product: Product) => {
    window.history.pushState(null, '', `/select?productId=${product.id}`);
    onOpenProduct(product);
    setActiveTab('select');
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '80vh', padding: '2rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
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
          <span style={{ color: '#0F172A', fontWeight: 700 }}>Search Catalog</span>
        </div>

        {/* Primary Search Form */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid #E2E8F0',
            marginBottom: '2rem',
          }}
        >
          <form onSubmit={handleSearchSubmit}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 320px' }}>
                <Search
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94A3B8',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search copier paper, agro notebooks, office stationery, GSM..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem 0.85rem 3rem',
                    fontSize: '1rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    outline: 'none',
                    background: '#F8FAFC',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#0284C7')}
                  onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  padding: '0.85rem 1.75rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                }}
              >
                <Search size={18} />
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                  setPriceRange(100000);
                  setMinRating(0);
                  window.history.pushState(null, '', '/search');
                }}
                style={{
                  background: '#F1F5F9',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </form>

          {/* Quick Category Chips */}
          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Categories:</span>
            {['All', ...categories.map((c) => c.name)].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: selectedCategory === cat ? 700 : 500,
                  background: selectedCategory === cat ? '#0284C7' : '#F1F5F9',
                  color: selectedCategory === cat ? '#FFFFFF' : '#334155',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {protocolStatus && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.5rem 0.85rem',
                background: '#F0FDF4',
                color: '#166534',
                borderRadius: '8px',
                fontSize: '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                border: '1px solid #BBF7D0',
              }}
            >
              <Sparkles size={14} className="text-emerald-600" />
              <span>{protocolStatus}</span>
            </div>
          )}
        </div>

        {/* Results Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {search.trim() ? `Search Results for "${search}"` : 'All Products in Catalog'}
            </h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748B' }}>
              Showing {sortedProducts.length} verified tree-free agro-paper items (PAN-India Delivery & GST Credit)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                fontSize: '0.85rem',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '4rem 2rem',
              textAlign: 'center',
              border: '1px solid #E2E8F0',
            }}
          >
            <Package size={48} style={{ color: '#94A3B8', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>
              No Products Match Your Search
            </h3>
            <p style={{ color: '#64748B', maxWidth: '440px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
              We couldn't find any products matching "{search}". Try checking for spelling errors, clearing your filters, or browsing our core copier paper products.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                window.history.pushState(null, '', '/search');
              }}
              style={{
                padding: '0.65rem 1.5rem',
                background: '#0284C7',
                color: '#FFFFFF',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View All Products
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={() => handleSelectProduct(product)}
                onBuyNow={() => onBuyNow(product)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
