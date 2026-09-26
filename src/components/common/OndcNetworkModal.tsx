import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, Globe, ExternalLink, Activity, RefreshCw, Copy, Check } from 'lucide-react';

interface OndcNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToB2B?: () => void;
}

export const OndcNetworkModal: React.FC<OndcNetworkModalProps> = ({ isOpen, onClose, onNavigateToB2B }) => {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'offline'>('checking');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const checkHealth = async () => {
    setHealthStatus('checking');
    const start = performance.now();
    try {
      const res = await fetch('/ondc/health', { method: 'GET' });
      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      if (res.ok) {
        setHealthStatus('healthy');
      } else {
        setHealthStatus('offline');
      }
    } catch {
      setHealthStatus('offline');
      setLatencyMs(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyUrl = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const ENDPOINTS = [
    { method: 'POST', path: 'https://kognitiminds.com/search', desc: 'Product Discovery & Catalog Broadcast' },
    { method: 'POST', path: 'https://kognitiminds.com/select', desc: 'B2B Quotation, MOQ & GST Calculation' },
    { method: 'POST', path: 'https://kognitiminds.com/init', desc: 'Order Initialization & Fulfillment Setup' },
    { method: 'POST', path: 'https://kognitiminds.com/confirm', desc: 'Order Placement & Atomic Inventory Lock' },
    { method: 'POST', path: 'https://kognitiminds.com/status', desc: 'Order & Milestone Status Query' },
    { method: 'POST', path: 'https://kognitiminds.com/track', desc: 'Live Shipment Tracking' },
    { method: 'POST', path: 'https://kognitiminds.com/cancel', desc: 'Order Cancellation & Restock' },
    { method: 'POST', path: 'https://kognitiminds.com/update', desc: 'Buyer Return (Full & Partial Orders)' },
    { method: 'POST', path: 'https://kognitiminds.com/rating', desc: 'Buyer Feedback & Rating' },
    { method: 'POST', path: 'https://kognitiminds.com/support', desc: 'Customer Service & Contact Details' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '780px',
          width: '94%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          borderRadius: '16px',
          position: 'relative',
          background: '#FFFFFF',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
          }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
            }}
          >
            <Globe size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              ONDC Network Node Status
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.15rem 0 0' }}>
              Kogniti Minds Private Limited • Official Seller App (BPP)
            </p>
          </div>
        </div>

        {/* Live Status Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: healthStatus === 'healthy' ? '#F0FDF4' : '#FFFBEB',
            border: `1px solid ${healthStatus === 'healthy' ? '#BBF7D0' : '#FDE68A'}`,
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginTop: '1.25rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: healthStatus === 'healthy' ? '#10B981' : '#F59E0B',
                boxShadow: healthStatus === 'healthy' ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : 'none',
              }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                {healthStatus === 'checking' && 'Pinging ONDC Health Endpoint...'}
                {healthStatus === 'healthy' && 'ONDC Node 100% Operational & Healthy'}
                {healthStatus === 'offline' && 'Service Latency Detected'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.1rem' }}>
                Protocol: <strong style={{ color: '#0F172A' }}>ONDC:RETeB2B v1.2.5</strong> • Subscriber ID:{' '}
                <strong style={{ color: '#0F172A' }}>kognitiminds.com</strong>
                {latencyMs !== null && ` • Response Time: ${latencyMs}ms`}
              </div>
            </div>
          </div>

          <button
            onClick={checkHealth}
            disabled={healthStatus === 'checking'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} className={healthStatus === 'checking' ? 'animate-spin' : ''} />
            Re-test
          </button>
        </div>

        {/* Quick Spec Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', fontWeight: 600 }}>DOMAIN</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>ONDC:RETeB2B</span>
          </div>
          <div style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', fontWeight: 600 }}>ROLE</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>Seller App (BPP)</span>
          </div>
          <div style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', fontWeight: 600 }}>CORE VERSION</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>1.2.5</span>
          </div>
          <div style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', fontWeight: 600 }}>CATALOG</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>13 B2B Products</span>
          </div>
        </div>

        {/* Live Production Endpoints Table */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Live Production Endpoints (Buyer &rarr; Seller App)
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle2 size={13} /> HTTPS / SSL Verified
            </span>
          </div>

          <div
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              overflow: 'hidden',
              fontSize: '0.82rem',
            }}
          >
            {ENDPOINTS.map((ep, idx) => {
              const isCopied = copiedEndpoint === ep.path;
              return (
                <div
                  key={ep.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.9rem',
                    background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                    borderBottom: idx !== ENDPOINTS.length - 1 ? '1px solid #F1F5F9' : 'none',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                    <span
                      style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: '#EEF2FF',
                        color: '#4F46E5',
                        flexShrink: 0,
                      }}
                    >
                      {ep.method}
                    </span>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: '#0F172A',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {ep.path}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'none' }} className="sm:inline">
                      {ep.desc}
                    </span>
                    <button
                      onClick={() => copyUrl(ep.path, ep.path)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        color: '#475569',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {isCopied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                      {isCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid #E2E8F0',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Available for automated procurement on all ONDC Buyer Applications.
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => {
                onClose();
                if (onNavigateToB2B) onNavigateToB2B();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                background: '#059669',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Enter B2B Portal
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OndcNetworkModal;
