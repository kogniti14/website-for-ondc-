import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Star,
  Check,
  X,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { Product, Category } from '../../types';
import { CATEGORIES } from '../../data/mockProducts';
import { CategoryComingSoon } from '../../components/common/CategoryComingSoon';
import { ProductCard } from '../../components/products/ProductCard';

interface ProductListingPageProps {
  products: Product[];
  categories?: Category[];
  initialCategory?: string;
  initialSearch?: string;
  initialSort?: string;
  onlyNewArrivals?: boolean;
  onOpenProduct: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  isShopNowView?: boolean;
}

export const ProductListingPage: React.FC<ProductListingPageProps> = ({
  products,
  categories,
  initialCategory,
  initialSearch = '',
  initialSort,
  onlyNewArrivals: onlyNewArrivalsProp = false,
  onOpenProduct,
  onBuyNow,
  isShopNowView = false,
}) => {
  const categoryList: (Category & { slug?: string })[] = (categories && categories.length > 0 ? categories : CATEGORIES) as (Category & { slug?: string })[];
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [priceRange, setPriceRange] = useState<number>(100000);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyBestSellers, setOnlyBestSellers] = useState<boolean>(false);
  const [onlyNewArrivals, setOnlyNewArrivals] = useState<boolean>(Boolean(onlyNewArrivalsProp));
  const [sortBy, setSortBy] = useState<string>(initialSort || (onlyNewArrivalsProp ? 'newest' : 'recommended'));
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync category selection whenever initialCategory prop changes
  useEffect(() => {
    if (initialCategory) {
      const clean = initialCategory.trim().toLowerCase();
      if (clean === 'all') {
        setSelectedCategory('All');
      } else {
        const found = categoryList.find(
          (c) =>
            c.name.toLowerCase() === clean ||
            c.id.toLowerCase() === clean ||
            (c.slug && c.slug.toLowerCase() === clean)
        );
        setSelectedCategory(found ? found.name : initialCategory);
      }
    }
  }, [initialCategory, categoryList]);

  // Sync search query
  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  // Sync new arrivals filter
  useEffect(() => {
    if (onlyNewArrivalsProp !== undefined) {
      setOnlyNewArrivals(onlyNewArrivalsProp);
      if (onlyNewArrivalsProp) {
        setSortBy('newest');
      }
    }
  }, [onlyNewArrivalsProp]);

  // Flexible category matcher: works by ID, slug, or display name
  const isProductInCategory = (productCategory: string, filterCategory: string) => {
    if (!filterCategory || filterCategory === 'All') return true;
    const cleanFilter = filterCategory.toLowerCase();
    const prodCat = (productCategory || '').toLowerCase();
    if (prodCat === cleanFilter) return true;

    const matchedCat = categoryList.find(
      (c) =>
        c.name.toLowerCase() === cleanFilter ||
        c.id.toLowerCase() === cleanFilter ||
        (c.slug && c.slug.toLowerCase() === cleanFilter)
    );
    if (matchedCat) {
      return (
        prodCat === matchedCat.name.toLowerCase() ||
        prodCat === matchedCat.id.toLowerCase() ||
        (matchedCat.slug && prodCat === matchedCat.slug.toLowerCase())
      );
    }
    return false;
  };

  // Filter and sort products
  const safeProducts = useMemo(() => Array.isArray(products) ? products : [], [products]);

  const filteredProducts = useMemo(() => {
    return safeProducts
      .filter((p) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matches =
            (p.name || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q) ||
            (p.shortDescription || '').toLowerCase().includes(q) ||
            (p.sku || '').toLowerCase().includes(q) ||
            (p.tagline || '').toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Category filter using ID/slug/name
        if (selectedCategory !== 'All' && !isProductInCategory(p.category || '', selectedCategory)) {
          return false;
        }

        // New Arrivals only filter
        if (onlyNewArrivals && !p.isNewArrival) {
          // If product is not flagged as new arrival, skip unless no products have the flag
          const anyFlagged = safeProducts.some((prod) => prod.isNewArrival);
          if (anyFlagged) return false;
        }

        // Price
        const pPrice = Number(p.b2cPrice || 0);
        if (pPrice > priceRange) {
          return false;
        }

        // Rating
        const pRating = typeof p.rating === 'number' && !isNaN(p.rating) ? p.rating : 4.9;
        if (minRating > 0 && pRating < minRating) {
          return false;
        }

        // Stock
        if (onlyInStock) {
          const isOos = p.stockStatus === 'out_of_stock' || (p.stock !== undefined && p.stock <= 0);
          if (isOos) return false;
        }

        // Best Sellers
        if (onlyBestSellers && !p.isBestSeller) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aPrice = Number(a.b2cPrice || 0);
        const bPrice = Number(b.b2cPrice || 0);
        const aRating = typeof a.rating === 'number' && !isNaN(a.rating) ? a.rating : 4.9;
        const bRating = typeof b.rating === 'number' && !isNaN(b.rating) ? b.rating : 4.9;
        if (sortBy === 'price-asc') return aPrice - bPrice;
        if (sortBy === 'price-desc') return bPrice - aPrice;
        if (sortBy === 'rating-desc') return bRating - aRating;
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        if (sortBy === 'bestseller') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
        return 0; // recommended
      });
  }, [safeProducts, search, selectedCategory, priceRange, minRating, onlyInStock, onlyBestSellers, onlyNewArrivals, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setPriceRange(100000);
    setMinRating(0);
    setOnlyInStock(false);
    setOnlyBestSellers(false);
    setOnlyNewArrivals(false);
    setSortBy('recommended');
  };

  const currentCategoryObj = categoryList.find(
    (c) =>
      c.name === selectedCategory ||
      c.id === selectedCategory ||
      (c.slug && c.slug === selectedCategory)
  );
  const selectedCategoryTotalProducts =
    selectedCategory === 'All'
      ? safeProducts.length
      : safeProducts.filter((p) => isProductInCategory(p.category || '', selectedCategory)).length;

  const renderFilterBody = () => (
    <>
      {/* Categories */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" style={{ marginBottom: '0.5rem' }}>Categories</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
          <label className="flex items-center justify-between gap-2" style={{ cursor: 'pointer' }}>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="cat"
                checked={selectedCategory === 'All'}
                onChange={() => setSelectedCategory('All')}
              />
              <span>All Categories</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>({safeProducts.length})</span>
          </label>
          {categoryList.map((c) => {
            const catCount = safeProducts.filter((p) => isProductInCategory(p.category || '', c.name)).length;
            return (
              <label key={c.id} className="flex items-center justify-between gap-2" style={{ cursor: 'pointer' }}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="cat"
                    checked={selectedCategory === c.name}
                    onChange={() => setSelectedCategory(c.name)}
                  />
                  <span>{c.name}</span>
                </div>
                {catCount === 0 ? (
                  <span className="badge badge-amber" style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    Soon
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>({catCount})</span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Max Price Slider */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
          <label className="form-label">Max Price</label>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
            ₹{priceRange.toLocaleString('en-IN')}
          </span>
        </div>
        <input
          type="range"
          min={100}
          max={100000}
          step={500}
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--primary)' }}
        />
        <div className="flex justify-between text-slate-400" style={{ fontSize: '0.7rem' }}>
          <span>₹100</span>
          <span>₹1,00,000</span>
        </div>
      </div>

      {/* Minimum Rating */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" style={{ marginBottom: '0.5rem' }}>Customer Rating</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
          {[4.5, 4.0, 3.5].map((r) => (
            <label key={r} className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                name="rating"
                checked={minRating === r}
                onChange={() => setMinRating(minRating === r ? 0 : r)}
              />
              <span className="flex items-center gap-1 text-amber-500">
                <Star size={13} fill="#D97706" /> {r} & above
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Checkbox Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
        <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => setOnlyInStock(e.target.checked)}
          />
          <span>In Stock Only</span>
        </label>
        <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={onlyBestSellers}
            onChange={(e) => setOnlyBestSellers(e.target.checked)}
          />
          <span>Best Sellers Only</span>
        </label>
        <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={onlyNewArrivals}
            onChange={(e) => setOnlyNewArrivals(e.target.checked)}
          />
          <span className="flex items-center gap-1 text-purple-700 font-semibold">
            <Sparkles size={13} className="text-purple-600" /> New Arrivals & Innovations
          </span>
        </label>
      </div>
    </>
  );

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '2rem' }}>
        {onlyNewArrivals ? (
          <div className="flex items-center gap-2" style={{ marginBottom: '0.4rem' }}>
            <span className="badge badge-purple">✨ State-of-the-Art Technology</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--slate-500)', fontWeight: 500 }}>
              Newly Added Innovations • 100% Tree-Free Agro Paper
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2" style={{ marginBottom: '0.4rem' }}>
            <span className="badge badge-blue">🌱 100% Tree-Free Agro Paper</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--slate-500)', fontWeight: 500 }}>
              Direct Manufacturer Pricing • Verified Pan-India Delivery • GST Billing
            </span>
          </div>
        )}
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {onlyNewArrivals
            ? 'New Arrivals & Smart Innovations'
            : selectedCategory !== 'All'
            ? `${selectedCategory} — Sustainable Catalog`
            : 'Sustainable Paper & Eco-Stationery Catalog'}
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
          {onlyNewArrivals
            ? 'Discover the newest launches in upcycled agricultural residue copier paper, tree-free executive notebooks, and smart desk organizers.'
            : 'Explore our complete catalog of 100% tree-free agricultural residue paper, printing paper reams, executive notebooks, journals, and eco-stationery supplies.'}
        </p>
      </div>

      {/* Top Search & Filter Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          borderRadius: 'var(--radius-lg)',
          background: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--slate-400)' }}
            />
            <input
              type="text"
              placeholder="Search by product name, SKU, HSN, or eco specifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }}
            />
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-2 flex-wrap hide-on-mobile">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`btn btn-sm ${selectedCategory === 'All' ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              All Items
            </button>
            {categoryList.slice(0, 5).map((c) => {
              const catCount = products.filter((p) => p.category === c.name).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.name)}
                  className={`btn btn-sm ${selectedCategory === c.name ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {c.name}
                  {catCount === 0 && (
                    <span style={{ fontSize: '0.65rem', opacity: 0.9, background: 'rgba(245, 158, 11, 0.25)', color: '#B45309', padding: '0.05rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Controls: Filter button on mobile + Sort Dropdown */}
          <div className="flex items-center gap-2" style={{ marginLeft: 'auto' }}>
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="btn btn-outline btn-sm hide-on-desktop-flex items-center gap-1.5"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              aria-label="Open filters"
            >
              <SlidersHorizontal size={15} />
              <span>Filters</span>
              {(selectedCategory !== 'All' || priceRange < 100000 || minRating > 0 || onlyInStock || onlyBestSellers) && (
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
              )}
            </button>

            <span className="hide-on-mobile" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-600)', whiteSpace: 'nowrap' }}>
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', width: 'auto' }}
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="bestseller">Best Selling</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Product Grid */}
      <div className="product-catalog-layout">
        {/* Sidebar Filters (Desktop) */}
        <aside
          className="card hide-on-mobile"
          style={{
            padding: '1.25rem',
            position: 'sticky',
            top: '90px',
            borderRadius: 'var(--radius-lg)',
            background: '#ffffff',
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <div className="flex items-center gap-2" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              <SlidersHorizontal size={16} /> Filters
            </div>
            <button
              onClick={handleResetFilters}
              style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}
            >
              Reset
            </button>
          </div>

          {renderFilterBody()}
        </aside>

        {/* Mobile Filters Drawer Modal */}
        {mobileFilterOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              justifyContent: 'flex-end',
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={() => setMobileFilterOpen(false)}
          >
            <div
              style={{
                width: '85%',
                maxWidth: '340px',
                height: '100%',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between p-4"
                style={{
                  borderBottom: '1px solid var(--border-color)',
                  position: 'sticky',
                  top: 0,
                  background: '#ffffff',
                  zIndex: 2,
                }}
              >
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <SlidersHorizontal size={18} />
                  <span>Filters & Options</span>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '0.25rem' }}
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }}>
                {renderFilterBody()}
              </div>

              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  gap: '0.75rem',
                  background: '#ffffff',
                  position: 'sticky',
                  bottom: 0,
                }}
              >
                <button
                  onClick={handleResetFilters}
                  className="btn btn-outline btn-sm flex-1"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="btn btn-primary btn-sm flex-1"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <div>
          {selectedCategory !== 'All' && selectedCategoryTotalProducts === 0 ? (
            <div>
              <div
                className="card"
                style={{
                  padding: '0.85rem 1.25rem',
                  marginBottom: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  color: '#92400E',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
                <span>No products available in this category.</span>
              </div>
              <CategoryComingSoon
                categoryName={selectedCategory}
                categoryDescription={currentCategoryObj?.description}
                categoryIcon={currentCategoryObj?.icon}
                onResetCategory={handleResetFilters}
              />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                No Products Match Your Criteria
              </h3>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                Try adjusting your search query, price slider, or category filter to discover available paper and stationery products.
              </p>
              <button onClick={handleResetFilters} className="btn btn-secondary btn-sm">
                <RotateCcw size={14} /> Clear All Filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={onOpenProduct}
                  onBuyNow={onBuyNow}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
