import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Star,
  Check,
  X,
  RotateCcw,
  Sparkles,
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
  onOpenProduct: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  isShopNowView?: boolean;
}

export const ProductListingPage: React.FC<ProductListingPageProps> = ({
  products,
  categories,
  initialCategory,
  initialSearch = '',
  onOpenProduct,
  onBuyNow,
  isShopNowView = false,
}) => {
  const categoryList = categories && categories.length > 0 ? categories : CATEGORIES;
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [priceRange, setPriceRange] = useState<number>(100000);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyBestSellers, setOnlyBestSellers] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matches =
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Category
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Price
        if (p.b2cPrice > priceRange) {
          return false;
        }

        // Rating
        if (minRating > 0 && p.rating < minRating) {
          return false;
        }

        // Stock
        if (onlyInStock && p.stock <= 0) {
          return false;
        }

        // Best Sellers
        if (onlyBestSellers && !p.isBestSeller) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.b2cPrice - b.b2cPrice;
        if (sortBy === 'price-desc') return b.b2cPrice - a.b2cPrice;
        if (sortBy === 'rating-desc') return b.rating - a.rating;
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        if (sortBy === 'bestseller') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
        return 0; // recommended
      });
  }, [products, search, selectedCategory, priceRange, minRating, onlyInStock, onlyBestSellers, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setPriceRange(100000);
    setMinRating(0);
    setOnlyInStock(false);
    setOnlyBestSellers(false);
    setSortBy('recommended');
  };

  const currentCategoryObj = categoryList.find((c) => c.name === selectedCategory);
  const selectedCategoryTotalProducts =
    selectedCategory === 'All'
      ? products.length
      : products.filter((p) => p.category === selectedCategory).length;

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Sustainable Paper & Eco-Stationery Catalog
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
          100% Tree-Free Agro-Waste Copier Paper, Executive Notebooks, Artisan Journals & Office Supplies
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
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
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

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-600)', whiteSpace: 'nowrap' }}>
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
      <div
        className="grid"
        style={{
          gridTemplateColumns: '260px 1fr',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Sidebar Filters */}
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
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>({products.length})</span>
              </label>
              {categoryList.map((c) => {
                const catCount = products.filter((p) => p.category === c.name).length;
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
          </div>
        </aside>

        {/* Product Grid Area */}
        <div>
          {selectedCategory !== 'All' && selectedCategoryTotalProducts === 0 ? (
            <CategoryComingSoon
              categoryName={selectedCategory}
              categoryDescription={currentCategoryObj?.description}
              categoryIcon={currentCategoryObj?.icon}
              onResetCategory={handleResetFilters}
            />
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
