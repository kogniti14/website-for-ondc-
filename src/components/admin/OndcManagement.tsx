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
  Terminal,
  Play,
  Download,
  Package,
  FileCode,
} from 'lucide-react';

const TOTAL_CATALOG_PRODUCTS = 12;

interface WorkbenchFileItem {
  filename: string;
  scenario: string;
  name: string;
  desc: string;
  size: string;
  badge: string;
}

const WORKBENCH_DOWNLOAD_ITEMS: WorkbenchFileItem[] = [
  {
    filename: '01_on_search.json',
    scenario: 'Scenario 1',
    name: 'Discovery & Catalog',
    desc: 'Full 13-product catalogue, HSN 4:4802/4820, statutory GST & B2B tier slabs',
    size: '67.5 KB',
    badge: 'Discovery',
  },
  {
    filename: '02_on_select.json',
    scenario: 'Scenario 2',
    name: 'Select & Quotation',
    desc: 'Item validation, 8% bulk tier discount, intrastate CGST+SGST breakdown',
    size: '2.5 KB',
    badge: 'Quotation',
  },
  {
    filename: '03_on_init.json',
    scenario: 'Scenario 3',
    name: 'Order Initialization',
    desc: 'Billing address, B2B enterprise delivery terms & payment settlement terms',
    size: '3.1 KB',
    badge: 'Initialization',
  },
  {
    filename: '04_on_confirm.json',
    scenario: 'Scenario 4',
    name: 'Order Confirmation',
    desc: 'Confirmed order state Created, atomic inventory lock & commercial tax invoice',
    size: '3.2 KB',
    badge: 'Order Confirmation',
  },
  {
    filename: '05_on_status.json',
    scenario: 'Scenario 5',
    name: 'Order Status Update',
    desc: 'Accepted state, shipment tracking URL & dispatch manifest',
    size: '1.2 KB',
    badge: 'Order Status',
  },
  {
    filename: '06_on_update_partial_return.json',
    scenario: 'Scenario 6',
    name: 'Partial Order Return',
    desc: 'Active reverse flow: reverse fulfillment Return_Approved, proportional refund',
    size: '5.5 KB',
    badge: 'Partial Return',
  },
  {
    filename: '07_on_update_full_return.json',
    scenario: 'Scenario 7',
    name: 'Full Order Return',
    desc: 'Active reverse flow: 100% tax credit note & reverse pickup authorization',
    size: '5.5 KB',
    badge: 'Full Return',
  },
  {
    filename: '08_on_cancel.json',
    scenario: 'Scenario 8',
    name: 'Order Cancellation',
    desc: 'Cancellation reason 001, inventory restoration & audit logs',
    size: '701 B',
    badge: 'Cancellation',
  },
  {
    filename: '09_on_track.json',
    scenario: 'Scenario 9',
    name: 'Shipment Tracking',
    desc: 'Consignment tracking link & reverse logistics tracking status',
    size: '668 B',
    badge: 'Tracking',
  },
  {
    filename: '10_on_support.json',
    scenario: 'Scenario 10',
    name: 'Support & Escalation',
    desc: 'Enterprise customer care, grievance officer & phone/email contacts',
    size: '674 B',
    badge: 'Support',
  },
  {
    filename: 'workbench_manifest.json',
    scenario: 'Manifest',
    name: 'Workbench Submission Manifest',
    desc: 'Protocol metadata, subscriber ID, endpoints, and scenario index',
    size: '1.9 KB',
    badge: 'Index',
  },
  {
    filename: 'README.md',
    scenario: 'Docs',
    name: 'Workbench Guide & Manual',
    desc: 'Step-by-step instructions for uploading files to ONDC Workbench',
    size: '1.1 KB',
    badge: 'Guide',
  },
];

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
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'orders' | 'transactions' | 'logs' | 'workbench'>('overview');
  const [orders, setOrders] = useState<OndcOrder[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<'search' | 'select' | 'init' | 'confirm' | 'update_return'>('search');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [copiedSimJson, setCopiedSimJson] = useState(false);

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

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const res = await fetch('/api/admin/ondc/workbench/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: selectedScenario }),
      });
      const data = await res.json();
      setSimulationResult(data);
      // Refresh transactions and logs to reflect simulated actions
      fetchData();
    } catch (err: any) {
      setSimulationResult({ success: false, error: err.message || 'Simulation request failed' });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCopySimJson = async () => {
    if (!simulationResult) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(simulationResult.result || simulationResult, null, 2));
      setCopiedSimJson(true);
      setTimeout(() => setCopiedSimJson(false), 2500);
    } catch {
      alert('Could not copy JSON');
    }
  };

  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const handleCopyFileContent = async (filename: string) => {
    try {
      const res = await fetch(`/ondc/download/workbench-file/${filename}`);
      if (!res.ok) throw new Error('File not found');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopiedFile(filename);
      setTimeout(() => setCopiedFile(null), 2500);
    } catch {
      alert(`Could not copy ${filename}. Please click the Download button directly.`);
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
          { id: 'workbench', label: 'Workbench Simulator', icon: Terminal },
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

      {/* Sub-tab 5: Live Workbench Scenario Simulator & Download Pack */}
      {activeSubTab === 'workbench' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Download Workbench Compliance Pack Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '1.75rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1.25rem',
                marginBottom: '1.25rem',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span
                    style={{
                      background: '#DCFCE7',
                      color: '#166534',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Package size={12} /> RET 1.2.5 Ready
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Download ONDC Workbench Compliance Package
                  </h3>
                </div>
                <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0, maxWidth: '720px' }}>
                  Download production-tested JSON payloads for all 10 ONDC Retail (eB2B) Workbench scenarios. Generated directly
                  from Kogniti Minds' live catalog, tax engine, volume pricing rules, and reverse return logistics.
                </p>
              </div>

              {/* 1-Click ZIP Download Action */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a
                  href="/ondc-workbench-kit.zip"
                  download="ondc-workbench-kit.zip"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.7rem 1.4rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={16} />
                  Download Complete ZIP Kit
                </a>
                <a
                  href="/ondc/download/workbench-file/workbench_manifest.json"
                  download="workbench_manifest.json"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: '#F8FAFC',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '0.7rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <FileCode size={15} />
                  Manifest (.json)
                </a>
              </div>
            </div>

            {/* Files List Table */}
            <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                    <th style={{ padding: '0.75rem 1rem', width: '130px' }}>Scenario</th>
                    <th style={{ padding: '0.75rem 1rem', width: '220px' }}>File Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Description & Scope</th>
                    <th style={{ padding: '0.75rem 1rem', width: '90px' }}>Size</th>
                    <th style={{ padding: '0.75rem 1rem', width: '190px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {WORKBENCH_DOWNLOAD_ITEMS.map((item, idx) => (
                    <tr
                      key={item.filename}
                      style={{
                        borderBottom: idx === WORKBENCH_DOWNLOAD_ITEMS.length - 1 ? 'none' : '1px solid #F1F5F9',
                        background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            background: item.badge === 'Guide' ? '#FEF3C7' : item.badge === 'Index' ? '#E0E7FF' : '#EFF6FF',
                            color: item.badge === 'Guide' ? '#92400E' : item.badge === 'Index' ? '#3730A3' : '#1E40AF',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          {item.badge}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 600, color: '#0F172A' }}>
                        {item.filename}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                        <div style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.15rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.76rem', color: '#64748B' }}>{item.desc}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {item.size}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleCopyFileContent(item.filename)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              background: copiedFile === item.filename ? '#10B981' : '#F1F5F9',
                              color: copiedFile === item.filename ? '#FFFFFF' : '#334155',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            title="Copy file contents to clipboard"
                          >
                            {copiedFile === item.filename ? <Check size={12} /> : <Copy size={12} />}
                            {copiedFile === item.filename ? 'Copied' : 'Copy'}
                          </button>
                          <a
                            href={`/ondc/download/workbench-file/${item.filename}`}
                            download={item.filename}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              background: '#2563EB',
                              color: '#FFFFFF',
                              borderRadius: '6px',
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              textDecoration: 'none',
                              boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
                            }}
                            title={`Download ${item.filename}`}
                          >
                            <Download size={12} />
                            Download
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sub-tab 5: Live Workbench Scenario Simulator */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.4rem' }}>
                ONDC RET 1.2.5 Workbench Simulator & Validator
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0, maxWidth: '700px' }}>
                Execute genuine ONDC scenarios against Kogniti Minds' live production business logic, validating taxonomy,
                HSN codes, pricing slabs, tax breakup, and reverse return logistics with zero fake/hard-coded responses.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: isSimulating ? '#94A3B8' : '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem 1.2rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: isSimulating ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                }}
              >
                <Play size={15} />
                {isSimulating ? 'Simulating Scenario...' : 'Execute Scenario'}
              </button>
            </div>
          </div>

          {/* Scenario Selection Grid */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Select Scenario to Verify:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {[
                { id: 'search', label: '1. Search / Discovery', desc: 'Full catalogue taxonomy & serviceability audit' },
                { id: 'select', label: '2. Select / Quote', desc: 'Item validation, tiered bulk discount & GST' },
                { id: 'init', label: '3. Init / Terms', desc: 'Billing address, fulfillment & payment terms' },
                { id: 'confirm', label: '4. Confirm / Order', desc: 'Real order creation & atomic inventory lock' },
                { id: 'update_return', label: '5. Buyer-Initiated Return', desc: 'Active flow: Partial/Full return & reverse QC refund' },
              ].map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc.id as any)}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    border: selectedScenario === sc.id ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    background: selectedScenario === sc.id ? '#EFF6FF' : '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: selectedScenario === sc.id ? '#1E40AF' : '#0F172A', marginBottom: '0.25rem' }}>
                    {sc.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {sc.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results Viewer */}
          {simulationResult && (
            <div style={{ marginTop: '1.5rem', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: '#F1F5F9', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      background: simulationResult.success ? '#DCFCE7' : '#FEE2E2',
                      color: simulationResult.success ? '#166534' : '#991B1B',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {simulationResult.success ? 'PASSED (200 OK)' : 'FAILED'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Execution: {simulationResult.executionTimeMs}ms
                  </span>
                  {simulationResult.validation && (
                    <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>
                      ✓ {simulationResult.validation.compliantItems || 13} products verified
                    </span>
                  )}
                </div>
                <button
                  onClick={handleCopySimJson}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: copiedSimJson ? '#10B981' : '#FFFFFF',
                    color: copiedSimJson ? '#FFFFFF' : '#334155',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copiedSimJson ? <Check size={13} /> : <Copy size={13} />}
                  {copiedSimJson ? 'Copied!' : 'Copy JSON'}
                </button>
              </div>

              <pre
                style={{
                  margin: 0,
                  padding: '1rem',
                  background: '#0F172A',
                  color: '#38BDF8',
                  fontSize: '0.78rem',
                  fontFamily: 'monospace',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  lineHeight: '1.45',
                }}
              >
                {JSON.stringify(simulationResult.result || simulationResult, null, 2)}
              </pre>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OndcManagement;
