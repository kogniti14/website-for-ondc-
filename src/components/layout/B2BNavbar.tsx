import React, { useState } from 'react';
import {
  Building2,
  FileText,
  ShoppingCart,
  CheckCircle2,
  Clock,
  ArrowLeft,
  LogOut,
  UserCheck,
  Package,
  Tag,
  ShieldCheck,
  Award,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { storageService } from '../../services/storageService';

interface B2BNavbarProps {
  b2bTab: string;
  setB2bTab: (tab: string) => void;
  onSwitchToB2C: () => void;
  openB2BAuthModal: () => void;
}

export const B2BNavbar: React.FC<B2BNavbarProps> = ({
  b2bTab,
  setB2bTab,
  onSwitchToB2C,
  openB2BAuthModal,
}) => {
  const { role, b2bBusiness, logout } = useAuth();
  const { b2bCount, getB2BCalculations } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const b2bCalculations = getB2BCalculations();

  return (
    <header className="b2b-header-sticky">
      {/* Top Corporate Strip */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.78rem',
          padding: '0.35rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold tracking-wide">
            <Tag size={13} className="text-emerald-400" /> DIRECT MANUFACTURER PRICING
          </span>
          <span className="hide-on-mobile flex items-center gap-1.5 text-slate-300 font-medium">
            <ShieldCheck size={13} className="text-amber-400" /> 100% GENUINE PRODUCTS | GST Invoice Available
          </span>
          <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <Building2 size={13} className="text-amber-400" />
            <span>
              B2B & INSTITUTIONAL ENQUIRIES:{' '}
              <a href="tel:+919931648595" style={{ color: '#FCD34D', textDecoration: 'underline' }}>
                +91 9931648595
              </a>
            </span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onSwitchToB2C}
            className="flex items-center gap-1"
            style={{
              color: '#60A5FA',
              fontWeight: 600,
              fontSize: '0.78rem',
            }}
          >
            <ArrowLeft size={13} /> Switch to Consumer Store (B2C)
          </button>
        </div>
      </div>

      {/* Main Corporate Navigation */}
      <div className="container" style={{ padding: '0.85rem 1.25rem' }}>
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Corporate Tag */}
          <div
            className="flex items-center gap-3 brand-logo-container"
            style={{ cursor: 'pointer' }}
            onClick={() => setB2bTab('overview')}
          >
            <div
              style={{
                height: '44px',
                borderRadius: '10px',
                background: '#FFFFFF',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
            >
              <img
                src={storageService.getSiteMedia()?.logo || '/logo.png'}
                alt="Kogniti Minds"
                className="kogniti-brand-logo"
                style={{ height: '36px', width: 'auto' }}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  lineHeight: '1.1',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                KOGNITI B2B
                <span
                  style={{
                    fontSize: '0.65rem',
                    background: '#D97706',
                    color: '#FFFFFF',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '4px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  ENTERPRISE
                </span>
              </div>
              <div className="hide-on-mobile" style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                Wholesale, Slabs & Institutional Quotations
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6 hide-on-mobile" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            <button
              onClick={() => setB2bTab('overview')}
              style={{
                color: b2bTab === 'overview' ? '#60A5FA' : '#CBD5E1',
                borderBottom: b2bTab === 'overview' ? '2px solid #60A5FA' : '2px solid transparent',
                paddingBottom: '0.3rem',
              }}
            >
              B2B Overview
            </button>
            <button
              onClick={() => setB2bTab('catalog')}
              style={{
                color: b2bTab === 'catalog' ? '#60A5FA' : '#CBD5E1',
                borderBottom: b2bTab === 'catalog' ? '2px solid #60A5FA' : '2px solid transparent',
                paddingBottom: '0.3rem',
              }}
            >
              Wholesale Catalog
            </button>
            <button
              onClick={() => setB2bTab('rfq')}
              style={{
                color: b2bTab === 'rfq' ? '#60A5FA' : '#CBD5E1',
                borderBottom: b2bTab === 'rfq' ? '2px solid #60A5FA' : '2px solid transparent',
                paddingBottom: '0.3rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <FileText size={15} className="text-amber-400" /> Request a Quote (RFQ)
            </button>
            <button
              onClick={() => setB2bTab('dashboard')}
              style={{
                color: b2bTab === 'dashboard' ? '#60A5FA' : '#CBD5E1',
                borderBottom: b2bTab === 'dashboard' ? '2px solid #60A5FA' : '2px solid transparent',
                paddingBottom: '0.3rem',
              }}
            >
              Business Dashboard
            </button>
            <button
              onClick={() => setB2bTab('stories')}
              style={{
                color: b2bTab === 'stories' ? '#60A5FA' : '#CBD5E1',
                borderBottom: b2bTab === 'stories' ? '2px solid #60A5FA' : '2px solid transparent',
                paddingBottom: '0.3rem',
              }}
            >
              Success Stories
            </button>
            <button
              onClick={() => setB2bTab('certifications')}
              style={{
                color: b2bTab === 'certifications' ? '#34D399' : '#CBD5E1',
                borderBottom: b2bTab === 'certifications' ? '2px solid #34D399' : '2px solid transparent',
                paddingBottom: '0.3rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Award size={14} className="text-emerald-400" /> Certifications & Compliance
            </button>
          </div>

          {/* Business Actions */}
          <div className="flex items-center gap-3">
            {/* B2B Cart */}
            <button
              onClick={() => setB2bTab('cart')}
              className="btn btn-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '0.45rem 0.9rem',
              }}
            >
              <div style={{ position: 'relative' }}>
                <ShoppingCart size={17} />
                {b2bCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-7px',
                      right: '-8px',
                      background: '#10B981',
                      color: '#0A0F1D',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #0A0F1D',
                    }}
                  >
                    {b2bCount}
                  </span>
                )}
              </div>
              <span className="hide-on-mobile" style={{ fontSize: '0.82rem' }}>
                {b2bCalculations.total > 0
                  ? `₹${b2bCalculations.total.toLocaleString('en-IN')}`
                  : 'B2B Cart'}
              </span>
            </button>

            {/* Business Authentication Status */}
            {role === 'b2b' && b2bBusiness ? (
              <div className="flex items-center gap-2">
                <div
                  onClick={() => setB2bTab('dashboard')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.35rem 0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {b2bBusiness.avatarUrl && (
                    <img
                      src={b2bBusiness.avatarUrl}
                      alt={b2bBusiness.companyName}
                      style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  )}
                  {b2bBusiness.status === 'approved' ? (
                    <span className="badge badge-green" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                      <CheckCircle2 size={11} /> Verified Partner
                    </span>
                  ) : (
                    <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                      <Clock size={11} /> Pending Review
                    </span>
                  )}
                  <span
                    className="hide-on-mobile"
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {b2bBusiness.companyName}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="btn btn-sm"
                  style={{
                    color: '#F87171',
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(239, 68, 68, 0.1)',
                  }}
                  title="Sign out of B2B Portal"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={openB2BAuthModal}
                className="btn btn-amber btn-sm"
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                <UserCheck size={16} /> <span className="hide-on-mobile">Business Login / Register</span><span className="hide-on-desktop">Login</span>
              </button>
            )}

            {/* Mobile Navigation Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-sm"
              style={{
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '8px',
                padding: '0.45rem',
              }}
              id="mobile-nav-toggle"
              aria-label="Toggle B2B navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation for B2B */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#0F172A',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <button
            onClick={() => {
              onSwitchToB2C();
              setMobileMenuOpen(false);
            }}
            className="btn btn-sm"
            style={{
              justifyContent: 'flex-start',
              background: 'rgba(96, 165, 250, 0.15)',
              color: '#93C5FD',
              border: '1px solid rgba(96, 165, 250, 0.3)',
            }}
          >
            <ArrowLeft size={16} /> Switch to Consumer Store (B2C)
          </button>

          <button
            onClick={() => {
              setB2bTab('overview');
              setMobileMenuOpen(false);
            }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', background: 'rgba(255, 255, 255, 0.08)', color: '#FFFFFF' }}
          >
            B2B Overview
          </button>

          <button
            onClick={() => {
              setB2bTab('catalog');
              setMobileMenuOpen(false);
            }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', background: 'rgba(255, 255, 255, 0.08)', color: '#FFFFFF' }}
          >
            Wholesale Catalog
          </button>

          <button
            onClick={() => {
              setB2bTab('rfq');
              setMobileMenuOpen(false);
            }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', background: 'rgba(255, 255, 255, 0.08)', color: '#FFFFFF' }}
          >
            <FileText size={16} className="text-amber-400" /> Request a Quote (RFQ)
          </button>

          <button
            onClick={() => {
              setB2bTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', background: 'rgba(255, 255, 255, 0.08)', color: '#FFFFFF' }}
          >
            Business Dashboard & Quotations
          </button>

          <button
            onClick={() => {
              setB2bTab('stories');
              setMobileMenuOpen(false);
            }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', background: 'rgba(255, 255, 255, 0.08)', color: '#FFFFFF' }}
          >
            <Sparkles size={16} className="text-amber-400" /> Success Stories
          </button>

          <button
            onClick={() => {
              setB2bTab('certifications');
              setMobileMenuOpen(false);
            }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', background: 'rgba(255, 255, 255, 0.08)', color: '#34D399' }}
          >
            <Award size={16} className="text-emerald-400" /> Certifications & Compliance
          </button>

          <button
            onClick={() => {
              setB2bTab('cart');
              setMobileMenuOpen(false);
            }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', background: 'rgba(255, 255, 255, 0.08)', color: '#FFFFFF' }}
          >
            <ShoppingCart size={16} /> B2B Cart ({b2bCount} items)
          </button>

          {role === 'b2b' && b2bBusiness ? (
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="btn btn-outline"
              style={{ color: '#F87171', borderColor: 'rgba(248, 113, 113, 0.3)', justifyContent: 'flex-start' }}
            >
              <LogOut size={16} /> Sign Out ({b2bBusiness.companyName})
            </button>
          ) : (
            <button
              onClick={() => {
                openB2BAuthModal();
                setMobileMenuOpen(false);
              }}
              className="btn btn-amber"
            >
              <UserCheck size={16} /> Business Login / Register
            </button>
          )}
        </div>
      )}
    </header>
  );
};
