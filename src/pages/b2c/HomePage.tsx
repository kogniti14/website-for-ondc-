import React from 'react';
import {
  ArrowRight,
  Briefcase,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  CheckCircle2,
  Building,
  Sparkles,
  Award,
  Zap,
  Tag,
  Headphones,
  FileText,
  Building2,
} from 'lucide-react';
import { Product, UserRole, Category } from '../../types';
import { CATEGORIES } from '../../data/mockProducts';
import { ProductCard } from '../../components/products/ProductCard';

interface HomePageProps {
  products: Product[];
  categories?: Category[];
  onSelectCategory: (cat: string) => void;
  onOpenProduct: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  setActiveTab: (tab: string) => void;
  openB2BAuthModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  onSelectCategory,
  onOpenProduct,
  onBuyNow,
  setActiveTab,
  openB2BAuthModal,
}) => {
  const featuredProducts = products.filter((p) => p.isFeatured || p.isBestSeller).slice(0, 4);
  const newArrivals = products.filter((p) => p.isNewArrival || p.stock > 100).slice(0, 4);

  return (
    <div>
      {/* 1. Hero Section */}
      <section
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #0A0F1D 0%, #172554 50%, #0F172A 100%)',
          color: '#FFFFFF',
          padding: '4.5rem 0 5rem',
          overflow: 'hidden',
        }}
      >
        {/* Ambient Glows */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            right: '5%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(37, 99, 235, 0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '10%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            {/* Hero Left Content */}
            <div>
              {/* Trust Pill */}
              <div
                className="inline-flex items-center gap-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  color: '#93C5FD',
                  fontWeight: 600,
                  marginBottom: '1.25rem',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>From Agri-Waste to Sustainable Paper</span>
              </div>

              {/* Main Headline */}
              <h1
                style={{
                  fontSize: 'clamp(2.1rem, 4.5vw, 3.4rem)',
                  fontWeight: 800,
                  lineHeight: '1.15',
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  marginBottom: '1.25rem',
                }}
              >
                From Farm Waste to{' '}
                <span
                  style={{
                    background: 'linear-gradient(90deg, #60A5FA 0%, #34D399 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Future-Ready Paper.
                </span>
              </h1>

              {/* Subheading */}
              <div
                style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.6',
                  color: '#CBD5E1',
                  marginBottom: '2rem',
                  maxWidth: '560px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <p style={{ margin: 0 }}>
                  From agricultural waste to everyday paper — discover sustainable paper solutions created for individuals, businesses, schools, offices, and institutions.
                </p>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#94A3B8' }}>
                  Made with purpose. Designed for performance. Competitive pricing with GST-compliant billing and eligible input tax credit for registered businesses.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center gap-4 flex-wrap" style={{ marginBottom: '2.5rem' }}>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="btn btn-primary btn-lg"
                  style={{
                    borderRadius: 'var(--radius-full)',
                    padding: '0.85rem 2rem',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
                  }}
                >
                  Shop Now <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => setActiveTab('b2b')}
                  className="btn btn-lg"
                  style={{
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1.5px solid rgba(255, 255, 255, 0.25)',
                    color: '#FFFFFF',
                    padding: '0.85rem 1.85rem',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Briefcase size={18} className="text-amber-400" /> Explore B2B Deals
                </button>
              </div>

              {/* Key Trust Metrics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1.5rem',
                  paddingTop: '1.75rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>50,000+</div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.25rem' }}>Units Delivered Pan-India</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#34D399', lineHeight: 1.2 }}>100%</div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.25rem' }}>GST Input Tax Credit</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FBBF24', lineHeight: 1.2 }}>4.8 ★</div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.25rem' }}>Consumer & B2B Rating</div>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Banner */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(15, 23, 42, 0.6)',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=80"
                  alt="Kogniti Minds Flagship Sustainable Agro-Waste Paper"
                  style={{ width: '100%', height: '340px', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(10, 15, 29, 0.95) 0%, rgba(10, 15, 29, 0) 100%)',
                    padding: '2rem 1.5rem 1.25rem',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="badge badge-amber" style={{ fontSize: '0.68rem', marginBottom: '0.25rem' }}>
                        Best Seller Ream
                      </span>
                      <h4 style={{ color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 700 }}>
                        Kogniti AgroPrint 75 GSM Sustainable Paper
                      </h4>
                      <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>100% Tree-Free Indian Agricultural Residue Paper</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38BDF8' }}>₹289</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>₹399</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Floating Stat Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '-15px',
                  background: 'rgba(15, 23, 42, 0.92)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.85rem 1.1rem',
                  boxShadow: 'var(--shadow-xl)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34D399',
                  }}
                >
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>
                    GST Compliant Invoicing
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Automatic 18% Input Tax Benefit</div>
                </div>
              </div>

              {/* Available On Section (Exact match from reference image) */}
              <div
                style={{
                  marginTop: '1.35rem',
                  paddingLeft: '0.25rem',
                }}
              >
                <img
                  src="/available-on-hero.png"
                  alt="Available on GeM — Government e-Marketplace and ONDC — Open Network for Digital Commerce"
                  style={{
                    height: '68px',
                    width: 'auto',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Value Assurance Banner */}
      <div
        style={{
          background: '#0B132B',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '1.1rem 0',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              gap: '1.5rem',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: '#E2E8F0',
            }}
          >
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-emerald-400" />
              <span>FREE PAN-INDIA DELIVERY on Orders Above ₹1,999</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-amber-400" />
              <span>100% GENUINE PRODUCTS | GST Invoice Available</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-blue-400" />
              <span>
                B2B & INSTITUTIONAL ENQUIRIES:{' '}
                <a href="tel:+919931648595" style={{ color: '#93C5FD', fontWeight: 700, textDecoration: 'underline' }}>
                  +91 9931648595
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Featured Categories Section */}
      <section style={{ padding: '4.5rem 0 3.5rem' }}>
        <div className="container">
          <div className="flex items-center justify-between gap-4" style={{ marginBottom: '2rem' }}>
            <div>
              <span className="badge badge-blue" style={{ marginBottom: '0.4rem' }}>
                Catalog Architecture
              </span>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800 }}>Explore Curated Categories</h2>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
                Sustainable paper and eco-stationery engineered from agricultural waste for individuals, schools, offices, and institutions.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('products')}
              className="btn btn-outline hide-on-mobile"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              View All Categories <ArrowRight size={16} />
            </button>
          </div>

          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {(categories && categories.length > 0 ? categories : CATEGORIES).map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.name);
                  setActiveTab('products');
                }}
                className="card"
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '240px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 100%), url(${cat.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'transform 0.4s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(8px)',
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {cat.count}+ Products
                  </span>
                </div>

                <div style={{ position: 'relative', zIndex: 1, color: '#FFFFFF' }}>
                  <h4 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                    {cat.name}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#CBD5E1', lineHeight: '1.4' }}>
                    {cat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Products Grid */}
      <section style={{ padding: '1rem 0 4rem', backgroundColor: '#F8FAFC' }}>
        <div className="container">
          <div className="flex items-center justify-between gap-4" style={{ marginBottom: '2rem' }}>
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: '0.3rem' }}>
                <span className="badge badge-amber">★ Popular Demands</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Direct Manufacturer Pricing</span>
              </div>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800 }}>Featured Products & Top Sellers</h2>
            </div>
            <button
              onClick={() => setActiveTab('shop')}
              className="btn btn-outline"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              Browse All Products <ArrowRight size={16} />
            </button>
          </div>

          <div className="product-grid">
            {featuredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpenDetails={onOpenProduct}
                onBuyNow={onBuyNow}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Dedicated B2B Promotional Bridge Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0A0F1D 0%, #1E293B 100%)',
          color: '#FFFFFF',
          padding: '5rem 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container">
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            {/* Left Col */}
            <div>
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#FBBF24',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '1rem',
                }}
              >
                <Building size={14} /> Dedicated Enterprise & Institutional Procurement
              </span>

              <h2
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                  fontWeight: 800,
                  lineHeight: '1.2',
                  color: '#FFFFFF',
                  marginBottom: '1.25rem',
                }}
              >
                Power Your Business with Better B2B Deals
              </h2>

              <p style={{ fontSize: '0.98rem', color: '#CBD5E1', lineHeight: '1.6', marginBottom: '2rem' }}>
                Equip your offices, colleges, training centers and retail stores at direct wholesale prices. Get GST input tax invoices, tier quantity discount slabs, and flexible payment terms.
              </p>

              <div
                className="grid"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '2.5rem',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(37, 99, 235, 0.2)',
                      color: '#60A5FA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Tag size={18} />
                  </div>
                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem' }}>Tiered Wholesale Slabs</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Up to 28% off based on order volume</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34D399',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={18} />
                  </div>
                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem' }}>Official GST Billing</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Full 18% Input Tax Credit claimable</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#FBBF24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Headphones size={18} />
                  </div>
                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem' }}>Account Manager</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Direct single-point contact & support</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(147, 51, 234, 0.2)',
                      color: '#C084FC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Truck size={18} />
                  </div>
                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem' }}>Heavy Cargo Freight</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Scheduled multi-point campus delivery</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => setActiveTab('b2b')}
                  className="btn btn-amber btn-lg"
                  style={{ borderRadius: 'var(--radius-full)', padding: '0.85rem 2rem' }}
                >
                  <Briefcase size={18} /> Explore B2B Deals
                </button>
                <button
                  onClick={openB2BAuthModal}
                  className="btn btn-outline"
                  style={{
                    borderRadius: 'var(--radius-full)',
                    color: '#FFFFFF',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    background: 'transparent',
                    padding: '0.85rem 1.75rem',
                  }}
                >
                  Become a B2B Customer
                </button>
              </div>
            </div>

            {/* Right Interactive Quotation Preview Card */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Institutional RFQ Simulator
                </span>
                <span className="badge badge-green">Verified B2B Advantage</span>
              </div>

              <h4 style={{ color: '#FFFFFF', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Institutional Agro Copier Paper Pallet (100,000 Sheets)
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1.5rem' }}>
                Simulation for University / Corporate Campus Procurement (40 Cartons / 200 Reams)
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div className="flex justify-between" style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: '#94A3B8' }}>Retail Price (200 Reams):</span>
                  <span style={{ color: '#CBD5E1', textDecoration: 'line-through' }}>₹79,800</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: '#94A3B8' }}>Wholesale Pallet Price:</span>
                  <span style={{ color: '#FFFFFF', fontWeight: 600 }}>₹39,600</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: '#34D399' }}>Volume Tier Discount (12%):</span>
                  <span style={{ color: '#34D399', fontWeight: 700 }}>- ₹4,752</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: '#38BDF8' }}>Input Tax Credit (12% GST):</span>
                  <span style={{ color: '#38BDF8', fontWeight: 700 }}>₹4,181 Claimable</span>
                </div>
                <div
                  className="flex justify-between items-baseline"
                  style={{
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#FFFFFF' }}>Total Net Savings:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FBBF24' }}>
                    Save ₹44,950+
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('b2b')}
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
              >
                Request Custom RFQ for Your Organization
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. New Launches Section */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div className="flex items-center justify-between gap-4" style={{ marginBottom: '2rem' }}>
            <div>
              <span className="badge badge-purple" style={{ marginBottom: '0.3rem' }}>
                State-of-the-Art Technology
              </span>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800 }}>New Arrivals & Smart Innovations</h2>
            </div>
            <button
              onClick={() => setActiveTab('products')}
              className="btn btn-outline"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              Explore All <ArrowRight size={16} />
            </button>
          </div>

          <div className="product-grid">
            {newArrivals.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpenDetails={onOpenProduct}
                onBuyNow={onBuyNow}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Why Choose Kogniti Minds */}
      <section style={{ padding: '4rem 0', backgroundColor: '#F1F5F9' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem' }}>
            <span className="badge badge-blue" style={{ marginBottom: '0.4rem' }}>
              Why Kogniti Minds
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Engineered for Reliability & Scale
            </h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
              We bridge the gap between sustainable material innovation from farm residues and reliable Indian commerce.
            </p>
          </div>

          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div className="card" style={{ padding: '1.75rem', background: '#FFFFFF' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Award size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Certified Tree-Free Excellence
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
                Every ream and notebook is precision-milled from upcycled agricultural crop residue, meeting ISO 9001 and ISO 14001 environmental standards for jam-free printing and smudge-free writing.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem', background: '#FFFFFF' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'var(--emerald-50)',
                  color: 'var(--emerald-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Zap size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Competitive Pricing
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
                Eliminate distributor markups. We deliver straight from our Indian agro-paper manufacturing facilities to your doorstep at direct manufacturer pricing.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem', background: '#FFFFFF' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'var(--amber-50)',
                  color: 'var(--amber-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Secure Indian Payments
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
                Full integration with UPI, RuPay, Visa, Mastercard, Corporate Net Banking, and Purchase Order credit facilities.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem', background: '#FFFFFF' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(147, 51, 234, 0.1)',
                  color: '#9333EA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Truck size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Pan-India Express Logistics
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
                Direct surface and air logistics partnerships with Delhivery and Blue Dart with real-time end-to-end dispatch tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Testimonials */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
            <span className="badge badge-amber" style={{ marginBottom: '0.4rem' }}>
              Client Trust
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Trusted by Learners, Professionals & Leaders</h2>
          </div>

          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div className="card" style={{ padding: '1.5rem' }}>
              <div className="flex items-center gap-1 text-amber-500" style={{ marginBottom: '0.75rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#D97706" />
                ))}
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--slate-700)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                "We transitioned all 5 campuses of our university to Kogniti 75 GSM agro-waste copier paper. Jam-free high-speed printing during semester exams, prompt GST billing, and real carbon reduction for our annual sustainability report."
              </p>
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                  }}
                >
                  VM
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-900)' }}>
                    Vikram Malhotra
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    Head of Procurement, EduTech Solutions Pvt Ltd
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div className="flex items-center gap-1 text-amber-500" style={{ marginBottom: '0.75rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#D97706" />
                ))}
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--slate-700)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                "The AgroLeaf executive notebooks and plantable seed pens are phenomenal. The 80 GSM tree-free paper has an incredible natural texture with zero bleed from fountain pens. Quick delivery to our Bengaluru office."
              </p>
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--emerald-50)',
                    color: 'var(--emerald-600)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                  }}
                >
                  AK
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-900)' }}>
                    Ananya Kulkarni
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    Lead Software Architect, Indiranagar
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div className="flex items-center gap-1 text-amber-500" style={{ marginBottom: '0.75rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#D97706" />
                ))}
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--slate-700)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                "We ordered 500 custom-embossed Agro-Paper employee onboarding hampers for our corporate annual meet. Our team loved the plantable seed pencils and handcrafted journals. Outstanding B2B support!"
              </p>
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--amber-50)',
                    color: 'var(--amber-600)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                  }}
                >
                  PV
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-900)' }}>
                    Pooja Verma
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    Director of Workplace Experience, Innovate Hub
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
