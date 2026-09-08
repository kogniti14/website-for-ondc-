import React, { useState } from 'react';
import { Shield, User, Building2, Clock, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RoleSwitcherProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ activeTab, setActiveTab }) => {
  const { role, b2cUser, b2bBusiness, isAdmin, isSuperAdmin, currentAdminUser, quickSwitch } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const getActiveLabel = () => {
    if (isAdmin) {
      if (isSuperAdmin) {
        return { label: 'Super Admin (@superadmin)', color: '#9333EA', icon: <Shield size={14} /> };
      }
      return {
        label: `Admin Staff (@${currentAdminUser?.userId || 'admin'})`,
        color: '#3B82F6',
        icon: <Shield size={14} />,
      };
    }
    if (role === 'b2b') {
      if (b2bBusiness?.status === 'approved') {
        return { label: 'B2B Verified Partner', color: '#10B981', icon: <CheckCircle2 size={14} /> };
      }
      return { label: 'B2B Pending Verification', color: '#F59E0B', icon: <Clock size={14} /> };
    }
    if (role === 'b2c') return { label: 'B2C Customer', color: '#2563EB', icon: <User size={14} /> };
    return { label: 'Guest Visitor', color: '#64748B', icon: <User size={14} /> };
  };

  const current = getActiveLabel();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        left: '1.25rem',
        zIndex: 9999,
        fontFamily: 'var(--font-heading)',
      }}
    >
      <div
        style={{
          background: 'rgba(10, 15, 29, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: expanded ? '16px' : '9999px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(12px)',
          color: '#ffffff',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: expanded ? '320px' : 'auto',
        }}
      >
        {/* Header Bar */}
        <div
          onClick={() => setExpanded(!expanded)}
          style={{
            padding: '0.5rem 0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: current.color,
              boxShadow: `0 0 8px ${current.color}`,
            }}
          />
          <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Role:</span>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            {current.icon}
            {current.label}
          </span>
          <div style={{ marginLeft: 'auto', color: '#94A3B8' }}>
            {expanded ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </div>
        </div>

        {/* Expanded Quick Switcher Options */}
        {expanded && (
          <div
            style={{
              padding: '0.75rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              One-Click Role Simulation
            </div>

            {/* Guest */}
            <button
              onClick={() => {
                quickSwitch('guest');
                setActiveTab('home');
                setExpanded(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                background: role === 'guest' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: '#E2E8F0',
                border: 'none',
              }}
            >
              <span className="flex items-center gap-2">
                <User size={14} /> Guest Customer
              </span>
              <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Unauthenticated</span>
            </button>

            {/* B2C Customer */}
            <button
              onClick={() => {
                quickSwitch('b2c');
                setActiveTab('home');
                setExpanded(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                background: role === 'b2c' ? 'rgba(37, 99, 235, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                color: '#60A5FA',
                border: 'none',
              }}
            >
              <span className="flex items-center gap-2">
                <User size={14} /> B2C Customer (Utkarsh Sharma)
              </span>
              <span style={{ fontSize: '0.68rem', color: '#93C5FD' }}>Consumer Cart/Orders</span>
            </button>

            {/* B2B Approved */}
            <button
              onClick={() => {
                quickSwitch('b2b_approved');
                setActiveTab('b2b');
                setExpanded(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                background:
                  role === 'b2b' && b2bBusiness?.status === 'approved'
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'rgba(255, 255, 255, 0.05)',
                color: '#34D399',
                border: 'none',
              }}
            >
              <span className="flex items-center gap-2">
                <Building2 size={14} /> Approved B2B (EduTech Sol.)
              </span>
              <span style={{ fontSize: '0.68rem', color: '#6EE7B7' }}>Wholesale + Slabs</span>
            </button>

            {/* B2B Pending */}
            <button
              onClick={() => {
                quickSwitch('b2b_pending');
                setActiveTab('b2b');
                setExpanded(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                background:
                  role === 'b2b' && b2bBusiness?.status === 'pending'
                    ? 'rgba(245, 158, 11, 0.3)'
                    : 'rgba(255, 255, 255, 0.05)',
                color: '#FBBF24',
                border: 'none',
              }}
            >
              <span className="flex items-center gap-2">
                <Clock size={14} /> Pending B2B (Innovate Hub)
              </span>
              <span style={{ fontSize: '0.68rem', color: '#FCD34D' }}>Verification Gate</span>
            </button>

            {/* Super Admin */}
            <button
              onClick={() => {
                quickSwitch('superadmin');
                setActiveTab('admin');
                setExpanded(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                background: isAdmin && isSuperAdmin ? 'rgba(147, 51, 234, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                color: '#C084FC',
                border: 'none',
              }}
            >
              <span className="flex items-center gap-2">
                <Shield size={14} /> 👑 Super Admin (@superadmin)
              </span>
              <span style={{ fontSize: '0.68rem', color: '#D8B4FE' }}>Approvals + Root</span>
            </button>

            {/* Operations Admin */}
            <button
              onClick={() => {
                quickSwitch('ops_admin');
                setActiveTab('admin');
                setExpanded(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                background: isAdmin && !isSuperAdmin ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                color: '#60A5FA',
                border: 'none',
              }}
            >
              <span className="flex items-center gap-2">
                <Shield size={14} /> 📦 Operations Admin (@admin_ops)
              </span>
              <span style={{ fontSize: '0.68rem', color: '#93C5FD' }}>Orders & RFQs</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
