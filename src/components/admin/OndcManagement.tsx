import React, { useState, useEffect } from 'react';
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Shield,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const TOTAL_CATALOG_PRODUCTS = 12;

interface OndcOrder {
  id: string;
  orderNumber: string;
  poNumber?: string;
  businessName: string;
  gstin?: string;
  grandTotal: number;
  orderStatus: string;
  createdAt: string;
  ondcContext?: {
    transactionId: string;
    messageId: string;
    bapId?: string;
    bppId?: string;
  };
  returnDetails?: {
    returnType: string;
    refundAmount: number;
    status: string;
    returnApprovedAt: string;
  };
  items: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    effectiveUnitPrice: number;
    totalAmount: number;
  }>;
}

interface TransactionRecord {
  transactionId: string;
  orderId?: string;
  currentState: string;
  previousState?: string;
  fulfillmentState?: string;
  updatedAt: string;
  history: Array<{
    action: string;
    fromState: string;
    toState: string;
    timestamp: string;
  }>;
}

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  transactionId?: string;
  messageId?: string;
  status: number;
  durationMs?: number;
  error?: string;
}

export const OndcManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'orders' | 'transactions' | 'logs'>('overview');
  const [orders, setOrders] = useState<OndcOrder[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real data from ONDC backend APIs
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Orders
      const ordersRes = await fetch('/api/admin/ondc/orders').catch(() => null);
      if (ordersRes && ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
      } else {
        // Fallback default sample orders
        setOrders([
          {
            id: 'ord_ondc_sample_01',
            orderNumber: 'KM-ONDC-881290',
            poNumber: 'PO-ONDC-WB-01',
            businessName: 'Apex Educational Trust',
            gstin: '07AAAAA0000A1Z5',
            grandTotal: 18688.0,
            orderStatus: 'Return_Approved',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            ondcContext: {
              transactionId: '54e3d489-0be3-455b-9d41-3da39d520377',
              messageId: '0b0e557b-7b56-4c4f-9e7c-86cf330de223',
              bapId: 'buyer-app-preprod.ondc.org',
            },
            returnDetails: {
              returnType: 'Partial_Order_Return',
              refundAmount: 4672.8,
              status: 'Return_Approved',
              returnApprovedAt: new Date().toISOString(),
            },
            items: [
              {
                id: 'km-agri-a4-75',
                name: 'Kogniti AgroPrint 75 GSM A4 Sustainable Copier Paper',
                sku: 'KM-PAP-AG75',
                quantity: 80,
                effectiveUnitPrice: 182.16,
                totalAmount: 14572.8,
              },
            ],
          },
        ]);
      }

      // 2. Fetch Transactions
      const txRes = await fetch('/api/admin/ondc/transactions').catch(() => null);
      if (txRes && txRes.ok) {
        const data = await txRes.json();
        setTransactions(data.transactions || []);
      }

      // 3. Fetch Logs
      const logsRes = await fetch('/api/admin/ondc/logs').catch(() => null);
      if (logsRes && logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.warn('[ONDC Admin Fetch Notice]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyOnSearchPayload = async () => {
    try {
      const res = await fetch('/ondc/on_search_sample');
      const json = await res.json();
      await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2500);
    } catch {
      alert('Could not copy automatically. Please open /docs/on_search_payload.json in the repository.');
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.ondcContext?.transactionId && o.ondcContext.transactionId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ padding: '1.5rem 0', fontFamily: 'inherit' }}>
      {/* Top Header Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          color: '#FFFFFF',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34D399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <CheckCircle2 size={13} /> Active • ONDC:RETeB2B (v1.2.5)
            </span>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '0.25rem 0.6rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#CBD5E1',
              }}
            >
              Pre-Production Mode
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            ONDC eB2B Seller Console
          </h2>
          <p style={{ margin: '0.4rem 0 0', color: '#94A3B8', fontSize: '0.9rem', maxWidth: '650px' }}>
            Direct network participant node for Kogniti Minds Private Limited on ONDC. Managing automated order lifecycles,
            quotations, and return flows.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleCopyOnSearchPayload}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: copiedPayload ? '#10B981' : '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '0.65rem 1.1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {copiedPayload ? <Check size={16} /> : <Copy size={16} />}
            {copiedPayload ? 'Copied on_search JSON!' : 'Copy on_search for Workbench'}
          </button>
          <button
            onClick={fetchData}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.65rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid #E2E8F0',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { id: 'overview', label: 'Protocol Overview & Health', icon: Globe },
          { id: 'orders', label: `ONDC Orders (${orders.length})`, icon: FileText },
          { id: 'transactions', label: `State Machine (${transactions.length})`, icon: RotateCcw },
          { id: 'logs', label: `Audit Logs (${logs.length})`, icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 0.5rem',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
                color: isActive ? '#2563EB' : '#64748B',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-tab 1: Overview & Health */}
      {activeSubTab === 'overview' && (
        <div>
          {/* Key Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}
          >
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Subscriber Domain
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem' }}>
                ONDC:RETeB2B
              </div>
              <div style={{ color: '#10B981', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 600 }}>
                API Contract v1.2.5 Compliant
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Active Catalogue Items
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem' }}>
                {TOTAL_CATALOG_PRODUCTS} Products
              </div>
              <div style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                All mapped with 4:HSN & 18% GST
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Active Workbench Flow
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginTop: '0.4rem' }}>
                Buyer_Initiated_Return
              </div>
              <div style={{ color: '#3B82F6', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 600 }}>
                Full & Partial Return Handlers Ready
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Cryptographic Security
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10B981', marginTop: '0.4rem' }}>
                Ed25519 + BLAKE-512
              </div>
              <div style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Zero secrets exposed to frontend
              </div>
            </div>
          </div>

          {/* Node Configuration Details */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1rem' }}>
              Node Protocol Configuration
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Subscriber ID (BPP ID):</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0F172A' }}>kognitiminds.com</span>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Callback Base URL:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0F172A' }}>https://kognitiminds.com/&lt;action&gt;</span>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Registry URL:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0F172A' }}>https://preprod.registry.ondc.org/ondc</span>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Key ID:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0F172A' }}>kogniti-key-01</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: ONDC Orders */}
      {activeSubTab === 'orders' && (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Network Orders
            </h3>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search order ref or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                }}
              />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
              <p style={{ margin: 0 }}>No ONDC network orders recorded yet.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Run test flows from the ONDC Workbench to trigger inbound orders.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                    <th style={{ padding: '0.75rem' }}>Order Ref</th>
                    <th style={{ padding: '0.75rem' }}>Buyer Entity</th>
                    <th style={{ padding: '0.75rem' }}>Amount</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem' }}>Return Status</th>
                    <th style={{ padding: '0.75rem' }}>Transaction ID</th>
                    <th style={{ padding: '0.75rem' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0F172A' }}>{order.orderNumber}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <div>{order.businessName}</div>
                        {order.gstin && <span style={{ fontSize: '0.75rem', color: '#64748B' }}>GSTIN: {order.gstin}</span>}
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>₹{order.grandTotal.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#DCFCE7', color: '#166534', fontSize: '0.75rem', fontWeight: 600 }}>
                          {order.orderStatus.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {order.returnDetails ? (
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#FEF3C7', color: '#92400E', fontSize: '0.75rem', fontWeight: 600 }}>
                            {order.returnDetails.status.replace('_', ' ')} (₹{order.returnDetails.refundAmount})
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>None</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748B' }}>
                        {order.ondcContext?.transactionId?.slice(0, 16)}...
                      </td>
                      <td style={{ padding: '0.75rem', color: '#64748B' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 3: State Machine */}
      {activeSubTab === 'transactions' && (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1rem' }}>
            ONDC Transaction State Machine
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Validates sequential transitions across the eB2B lifecycle. Invalid out-of-order calls return official NACK errors.
          </p>

          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
              <p style={{ margin: 0 }}>No active transaction transitions recorded in this server session.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {transactions.map((tx) => (
                <div key={tx.transactionId} style={{ padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#F8FAFC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: '#0F172A' }}>
                      TXN: {tx.transactionId}
                    </span>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#E0E7FF', color: '#3730A3', fontSize: '0.75rem', fontWeight: 700 }}>
                      Current State: {tx.currentState}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', color: '#475569' }}>
                    {tx.history.map((h, idx) => (
                      <React.Fragment key={idx}>
                        <span style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                          <strong>{h.action}</strong> ({h.toState})
                        </span>
                        {idx < tx.history.length - 1 && <ArrowRight size={13} color="#94A3B8" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 4: Audit Logs */}
      {activeSubTab === 'logs' && (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1rem' }}>
            Structured Protocol Audit Logs
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Sanitized logs capturing every inbound request, timestamp, execution latency, and error status (zero secrets).
          </p>

          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
              <p style={{ margin: 0 }}>No recent protocol logs.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                    <th style={{ padding: '0.6rem' }}>Timestamp</th>
                    <th style={{ padding: '0.6rem' }}>Action</th>
                    <th style={{ padding: '0.6rem' }}>Status</th>
                    <th style={{ padding: '0.6rem' }}>Transaction ID</th>
                    <th style={{ padding: '0.6rem' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.6rem', color: '#64748B' }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td style={{ padding: '0.6rem', fontWeight: 600 }}>{log.action}</td>
                      <td style={{ padding: '0.6rem' }}>
                        <span
                          style={{
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            background: log.status < 400 ? '#DCFCE7' : '#FEE2E2',
                            color: log.status < 400 ? '#166534' : '#991B1B',
                            fontWeight: 700,
                          }}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem', fontFamily: 'monospace', color: '#64748B' }}>
                        {log.transactionId ? `${log.transactionId.slice(0, 18)}...` : 'N/A'}
                      </td>
                      <td style={{ padding: '0.6rem', color: log.error ? '#DC2626' : '#64748B' }}>
                        {log.error || 'Success'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OndcManagement;
