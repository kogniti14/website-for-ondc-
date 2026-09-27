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
  ArrowLeft,
  TrendingUp,
  Terminal,
  Play,
  Download,
  Package,
  FileCode,
  CheckCircle,
  XCircle,
  ChevronRight,
  HelpCircle,
  Layers,
  Database,
  Lock,
  Key,
  Activity,
  Send,
  Server,
  UserCheck,
} from 'lucide-react';
import {
  SELLER_API_CONTRACTS,
  SellerApiContract,
  OndcSellerDashboardStats,
} from './ondcContracts';

const TOTAL_CATALOG_PRODUCTS = 13;

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

interface LiveEndpoint {
  action: string;
  method: string;
  path: string;
  fullUrl: string;
  name: string;
  desc: string;
}

const LIVE_ENDPOINTS_LIST: LiveEndpoint[] = [
  { action: 'health', method: 'GET', path: '/ondc/health', fullUrl: 'https://kognitiminds.com/ondc/health', name: 'Health & Heartbeat Check', desc: 'Validates service health and production environment readiness' },
  { action: 'search', method: 'POST', path: '/search', fullUrl: 'https://kognitiminds.com/search', name: 'Catalog Discovery', desc: 'B2B Catalog broadcast with HSN (4: prefix) and volume discount slabs' },
  { action: 'select', method: 'POST', path: '/select', fullUrl: 'https://kognitiminds.com/select', name: 'Quote & MOQ Selection', desc: 'Computes B2B wholesale pricing, MOQ & 18% GST (CGST+SGST / IGST)' },
  { action: 'init', method: 'POST', path: '/init', fullUrl: 'https://kognitiminds.com/init', name: 'Order Initialization', desc: 'Accepts buyer billing, delivery logistics, terms and fulfillments' },
  { action: 'confirm', method: 'POST', path: '/confirm', fullUrl: 'https://kognitiminds.com/confirm', name: 'Order Confirmation', desc: 'Persists order, generates order ID and locks inventory atomically' },
  { action: 'status', method: 'POST', path: '/status', fullUrl: 'https://kognitiminds.com/status', name: 'Order Status Query', desc: 'Returns current order fulfillment status and milestones' },
  { action: 'track', method: 'POST', path: '/track', fullUrl: 'https://kognitiminds.com/track', name: 'Live Courier Tracking', desc: 'Generates active tracking URL and delivery TAT' },
  { action: 'cancel', method: 'POST', path: '/cancel', fullUrl: 'https://kognitiminds.com/cancel', name: 'Order Cancellation', desc: 'Cancels active order and restocks inventory' },
  { action: 'update', method: 'POST', path: '/update', fullUrl: 'https://kognitiminds.com/update', name: 'Buyer-Initiated Return', desc: 'Handles partial and full order reverse logistics per RETeB2B 1.2.5' },
  { action: 'rating', method: 'POST', path: '/rating', fullUrl: 'https://kognitiminds.com/rating', name: 'Feedback & Rating', desc: 'Accepts buyer feedback and satisfaction ratings' },
  { action: 'support', method: 'POST', path: '/support', fullUrl: 'https://kognitiminds.com/support', name: 'Customer Support', desc: 'Returns official contact channels (phone, email, web)' },
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
  const [selectedApiAction, setSelectedApiAction] = useState<string | null>(null);
  const [activePayloadTab, setActivePayloadTab] = useState<'request' | 'sync' | 'callback' | 'state'>('request');

  const [stats, setStats] = useState<OndcSellerDashboardStats>({
    role: 'SELLER',
    domain: 'ONDC:RETeB2B',
    version: '1.2.5',
    environment: 'Production',
    bppId: 'kogniti-minds-bpp',
    bppUri: 'https://kognitiminds.com',
    gatewayStatus: 'Connected',
    signatureStatus: 'Ed25519 Active',
    databaseStatus: 'Operational',
    callbackStatus: 'Active (10 Callbacks Ready)',
    lastTransaction: 'Active',
    failedTransactions: 0,
    pendingTransactions: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [orders, setOrders] = useState<OndcOrder[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedSectionJson, setCopiedSectionJson] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<'search' | 'select' | 'init' | 'confirm' | 'update_return'>('search');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [copiedSimJson, setCopiedSimJson] = useState(false);

  // Live Production Endpoint Diagnostics State
  const [endpointTestingState, setEndpointTestingState] = useState<Record<string, { status: 'idle' | 'testing' | 'success' | 'error'; statusCode?: number; latencyMs?: number; error?: string }>>({});
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [copiedEndpointUrl, setCopiedEndpointUrl] = useState<string | null>(null);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // Synchronize URL path with active API Section (/admin/ondc/:apiAction)
  useEffect(() => {
    const handleUrlCheck = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname.toLowerCase();
      const match = path.match(/^\/admin\/ondc\/([a-z_]+)$/);
      if (match && match[1]) {
        const contract = SELLER_API_CONTRACTS.find((c) => c.action === match[1]);
        if (contract) {
          setSelectedApiAction(contract.action);
          return;
        }
      }
      setSelectedApiAction(null);
    };
    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    return () => window.removeEventListener('popstate', handleUrlCheck);
  }, []);

  const handleOpenApiSection = (actionKey: string) => {
    setSelectedApiAction(actionKey);
    setActivePayloadTab('request');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/admin/ondc/${actionKey}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToDashboard = () => {
    setSelectedApiAction(null);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/admin/ondc');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const testEndpoint = async (actionKey: string, method: string, path: string) => {
    setEndpointTestingState((prev) => ({
      ...prev,
      [actionKey]: { status: 'testing' },
    }));

    const start = performance.now();
    try {
      let res;
      if (method === 'GET') {
        res = await fetch(path);
      } else {
        res = await fetch(path, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Signature keyId="kognitiminds.com|kogniti-key-01|ed25519",algorithm="ed25519",created="1700000000",expires="1700003600",headers="(request-target) host date digest",signature="vJp..."',
          },
          body: JSON.stringify({
            context: {
              domain: 'ONDC:RETeB2B',
              country: 'IND',
              city: 'std:080',
              action: actionKey,
              core_version: '1.2.5',
              bap_id: 'workbench.ondc.tech',
              bap_uri: 'https://workbench.ondc.tech/api-service/ONDC:RETeB2B/1.2.5/buyer',
              transaction_id: `diag_txn_${Date.now()}`,
              message_id: `diag_msg_${Date.now()}`,
              timestamp: new Date().toISOString(),
              ttl: 'PT30S',
            },
            message:
              actionKey === 'search'
                ? { intent: { item: { descriptor: { name: 'paper' } } } }
                : actionKey === 'select'
                ? { order: { items: [{ id: 'km-agri-a4-75', quantity: { count: 10 } }] } }
                : actionKey === 'init'
                ? { order: { items: [{ id: 'km-agri-a4-75', quantity: { count: 10 } }], billing: { name: 'Acme School', address: { city: 'Noida', state: 'Uttar Pradesh' } } } }
                : actionKey === 'confirm'
                ? { order: { id: `ord_diag_${Date.now()}`, items: [{ id: 'km-agri-a4-75', quantity: { count: 10 } }] } }
                : actionKey === 'status'
                ? { order_id: 'ord_sample_01' }
                : actionKey === 'track'
                ? { order_id: 'ord_sample_01' }
                : actionKey === 'cancel'
                ? { order_id: 'ord_sample_01', cancellation_reason_id: '001' }
                : actionKey === 'update'
                ? { update_target: 'fulfillment', order: { id: 'ord_sample_01', items: [{ id: 'km-agri-a4-75', quantity: { count: 5 } }] } }
                : actionKey === 'rating'
                ? { rating_category: 'Order', id: 'ord_sample_01', value: 5 }
                : actionKey === 'support'
                ? { ref_id: 'ord_sample_01' }
                : {},
          }),
        });
      }
      const elapsed = Math.round(performance.now() - start);
      if (res.ok) {
        setEndpointTestingState((prev) => ({
          ...prev,
          [actionKey]: { status: 'success', statusCode: res.status, latencyMs: elapsed },
        }));
      } else {
        setEndpointTestingState((prev) => ({
          ...prev,
          [actionKey]: { status: 'error', statusCode: res.status, latencyMs: elapsed, error: `HTTP ${res.status}` },
        }));
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setEndpointTestingState((prev) => ({
        ...prev,
        [actionKey]: { status: 'error', latencyMs: elapsed, error: err.message || 'Network error' },
      }));
    }
  };

  const testAllEndpoints = async () => {
    setIsTestingAll(true);
    for (const ep of LIVE_ENDPOINTS_LIST) {
      await testEndpoint(ep.action, ep.method, ep.path);
    }
    setIsTestingAll(false);
  };

  const copyEndpointUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedEndpointUrl(id);
    setTimeout(() => setCopiedEndpointUrl(null), 2000);
  };

  // Fetch real data from ONDC backend APIs
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 0. Fetch Stats
      const statsRes = await fetch('/api/admin/ondc/stats').catch(() => null);
      if (statsRes && statsRes.ok) {
        const s = await statsRes.json();
        setStats((prev) => ({
          ...prev,
          role: s.role || 'SELLER',
          domain: s.domain || 'ONDC:RETeB2B',
          version: s.version || '1.2.5',
          environment: s.environment || 'Production',
          bppId: s.bppId || 'kogniti-minds-bpp',
          bppUri: s.bppUri || 'https://kognitiminds.com',
          gatewayStatus: s.gatewayStatus || 'Connected',
          signatureStatus: s.signatureStatus || 'Ed25519 Active',
          databaseStatus: s.databaseStatus || 'Operational',
          callbackStatus: s.callbackStatus || 'Active (10 Callbacks Ready)',
          lastTransaction: s.lastTransaction || 'Active',
          failedTransactions: s.failedTransactions || 0,
          pendingTransactions: s.pendingTransactions || 0,
          totalOrders: s.totalOrders || 0,
          totalRevenue: s.totalRevenue || 0,
        }));
      }

      // 1. Fetch Orders
      const ordersRes = await fetch('/api/admin/ondc/orders').catch(() => null);
      if (ordersRes && ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
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
      alert('Could not copy automatically. Please open /ondc-workbench/01_on_search.json in the repository.');
    }
  };

  const handleCopySectionJson = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedSectionJson(true);
    setTimeout(() => setCopiedSectionJson(false), 2000);
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

  const currentContract = selectedApiAction
    ? SELLER_API_CONTRACTS.find((c) => c.action === selectedApiAction) || null
    : null;

  const currentContractIndex = currentContract
    ? SELLER_API_CONTRACTS.findIndex((c) => c.action === currentContract.action)
    : -1;

  const prevContract = currentContractIndex > 0 ? SELLER_API_CONTRACTS[currentContractIndex - 1] : null;
  const nextContract = currentContractIndex >= 0 && currentContractIndex < SELLER_API_CONTRACTS.length - 1 ? SELLER_API_CONTRACTS[currentContractIndex + 1] : null;

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.ondcContext?.transactionId && o.ondcContext.transactionId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ padding: '1.5rem 0', fontFamily: 'inherit' }}>
      {/* 1. Official Canonical Seller Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          color: '#FFFFFF',
          marginBottom: '1.75rem',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(16, 185, 129, 0.25)',
                color: '#34D399',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                padding: '0.3rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <CheckCircle2 size={14} /> ROLE: {stats.role} (BPP)
            </span>
            <span
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#93C5FD',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              Domain: {stats.domain}
            </span>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '0.3rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#CBD5E1',
              }}
            >
              Version: {stats.version}
            </span>
            <span
              style={{
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#FCD34D',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                padding: '0.3rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              {stats.environment}
            </span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            ONDC Seller-Side (BPP) API Dashboard
          </h2>
          <p style={{ margin: '0.4rem 0 0', color: '#94A3B8', fontSize: '0.92rem', maxWidth: '720px' }}>
            KOGNITI MINDS PRIVATE LIMITED operates exclusively as the Seller / BPP participant node on the Open Network for Digital Commerce under RETeB2B 1.2.5. Connected to real product inventory, dynamic pricing, and warehouse logistics.
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
            {copiedPayload ? 'Copied on_search JSON!' : 'Copy on_search Payload'}
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
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards: Gateway, Signatures, DB, Callbacks & Transactions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ background: '#FFFFFF', padding: '1.1rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            BPP / Seller ID
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem', fontFamily: 'monospace' }}>
            {stats.bppId}
          </div>
          <div style={{ color: '#2563EB', fontSize: '0.72rem', marginTop: '0.2rem', fontFamily: 'monospace' }}>
            {stats.bppUri}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1.1rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Gateway Status
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10B981', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            {stats.gatewayStatus}
          </div>
          <div style={{ color: '#64748B', fontSize: '0.72rem', marginTop: '0.2rem' }}>
            Direct Hostinger Native Sync
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1.1rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Signature Status
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem' }}>
            {stats.signatureStatus}
          </div>
          <div style={{ color: '#10B981', fontSize: '0.72rem', marginTop: '0.2rem', fontWeight: 600 }}>
            Ed25519 + BLAKE-512 Body Digest
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1.1rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Database Status
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem' }}>
            {stats.databaseStatus}
          </div>
          <div style={{ color: '#64748B', fontSize: '0.72rem', marginTop: '0.2rem' }}>
            {TOTAL_CATALOG_PRODUCTS} Genuine Products Connected
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1.1rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Callback Status
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563EB', marginTop: '0.35rem' }}>
            {stats.callbackStatus}
          </div>
          <div style={{ color: '#64748B', fontSize: '0.72rem', marginTop: '0.2rem' }}>
            Signed Inbound & Outbound Ready
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1.1rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Last Transaction
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {stats.lastTransaction}
          </div>
          <div style={{ color: '#64748B', fontSize: '0.72rem', marginTop: '0.2rem' }}>
            Audit state machine verified
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1.1rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Failed / Pending
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: stats.failedTransactions > 0 ? '#EF4444' : '#10B981', marginTop: '0.35rem' }}>
            {stats.failedTransactions} <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>/ {stats.pendingTransactions} pending</span>
          </div>
          <div style={{ color: stats.failedTransactions > 0 ? '#EF4444' : '#10B981', fontSize: '0.72rem', marginTop: '0.2rem', fontWeight: 600 }}>
            {stats.failedTransactions === 0 ? '✓ Zero failed transactions' : `${stats.failedTransactions} need inspection`}
          </div>
        </div>
      </div>

      {/* 3. Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid #E2E8F0',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
        }}
      >
        {[
          { id: 'overview', label: 'Seller API Contracts (10)', icon: Layers },
          { id: 'orders', label: `ONDC Orders (${orders.length})`, icon: FileText },
          { id: 'transactions', label: `State Machine (${transactions.length})`, icon: RotateCcw },
          { id: 'logs', label: `Audit Logs (${logs.length})`, icon: Shield },
          { id: 'workbench', label: 'Workbench Simulator', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id && selectedApiAction === null;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedApiAction(null);
                setActiveSubTab(tab.id as any);
              }}
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

      {/* =========================================================================
          VIEW A: Dedicated Single API Section (When an API Card is Clicked)
          ========================================================================= */}
      {selectedApiAction && currentContract && (
        <div style={{ marginBottom: '2rem' }}>
          {/* Breadcrumb & Navigation Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#FFFFFF',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={handleBackToDashboard}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={15} /> All APIs
              </button>
              <div style={{ fontSize: '0.9rem', color: '#64748B' }}>
                <span style={{ color: '#0F172A', fontWeight: 700 }}>/admin/ondc</span> /{' '}
                <span style={{ color: '#2563EB', fontWeight: 700 }}>{currentContract.action}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {prevContract && (
                <button
                  onClick={() => handleOpenApiSection(prevContract.action)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.8rem',
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  <ArrowLeft size={13} /> Prev ({prevContract.action})
                </button>
              )}
              {nextContract && (
                <button
                  onClick={() => handleOpenApiSection(nextContract.action)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.8rem',
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Next ({nextContract.action}) <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Section Hero Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '1.75rem',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      background: currentContract.badgeColor,
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      fontFamily: 'monospace',
                    }}
                  >
                    POST /{currentContract.action}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                    Category: {currentContract.category}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {currentContract.name}
                </h3>
                <p style={{ margin: '0.4rem 0 0', color: '#475569', fontSize: '0.92rem', maxWidth: '750px' }}>
                  {currentContract.description}
                </p>
              </div>

              {/* Live Test Trigger Button */}
              <div>
                <button
                  onClick={() => testEndpoint(currentContract.action, 'POST', currentContract.backendEndpoint)}
                  disabled={endpointTestingState[currentContract.action]?.status === 'testing'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.7rem 1.25rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: endpointTestingState[currentContract.action]?.status === 'testing' ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  <RefreshCw
                    size={16}
                    className={endpointTestingState[currentContract.action]?.status === 'testing' ? 'animate-spin' : ''}
                  />
                  {endpointTestingState[currentContract.action]?.status === 'testing'
                    ? 'Verifying Endpoint...'
                    : `Run Live Test on POST /${currentContract.action}`}
                </button>
                {endpointTestingState[currentContract.action] && endpointTestingState[currentContract.action].status !== 'idle' && (
                  <div style={{ marginTop: '0.5rem', textAlign: 'right', fontSize: '0.82rem' }}>
                    {endpointTestingState[currentContract.action].status === 'success' && (
                      <span style={{ color: '#10B981', fontWeight: 700 }}>
                        ✓ HTTP {endpointTestingState[currentContract.action].statusCode} OK ({endpointTestingState[currentContract.action].latencyMs}ms)
                      </span>
                    )}
                    {endpointTestingState[currentContract.action].status === 'error' && (
                      <span style={{ color: '#EF4444', fontWeight: 700 }}>
                        ✕ {endpointTestingState[currentContract.action].error} ({endpointTestingState[currentContract.action].latencyMs}ms)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Endpoint Paths Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1rem',
                marginTop: '1.25rem',
                background: '#F8FAFC',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>
                  INBOUND ENDPOINT (KOGNITI MINDS EXPOSES):
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>
                  {currentContract.backendEndpoint}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>
                  OUTBOUND ASYNCHRONOUS CALLBACK GENERATED:
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563EB' }}>
                  {currentContract.callbackEndpoint}
                </span>
              </div>
            </div>
          </div>

          {/* THE 6 MANDATORY ARCHITECTURAL QUESTIONS & ANSWERS PANEL */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '1.75rem',
              marginBottom: '1.75rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            }}
          >
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} style={{ color: '#2563EB' }} />
              RETeB2B 1.2.5 Seller / BPP Contract Audit (6 Mandates)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {/* Question 1 */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ color: '#2563EB', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  1. Who sends the request?
                </div>
                <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.9rem' }}>
                  {currentContract.questions.whoSends}
                </div>
                <div style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                  Direction: <span style={{ color: '#D97706', fontWeight: 600 }}>Buyer ➔ Seller Node</span>
                </div>
              </div>

              {/* Question 2 */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ color: '#2563EB', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  2. Who receives the request?
                </div>
                <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.9rem' }}>
                  {currentContract.questions.whoReceives}
                </div>
                <div style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                  Role: <span style={{ color: '#10B981', fontWeight: 700 }}>SELLER / BPP ONLY</span>
                </div>
              </div>

              {/* Question 3 */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ color: '#2563EB', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  3. Which callback is generated?
                </div>
                <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  {currentContract.questions.callbackGenerated}
                </div>
                <div style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                  Signature: <span style={{ color: '#10B981', fontWeight: 600 }}>Ed25519 Signed by Seller</span>
                </div>
              </div>

              {/* Question 4 */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ color: '#2563EB', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  4. Which endpoint KOGNITI MINDS must expose?
                </div>
                <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  {currentContract.questions.endpointExposed}
                </div>
                <div style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                  HTTP Method: <span style={{ color: '#2563EB', fontWeight: 700 }}>POST</span>
                </div>
              </div>

              {/* Question 5 */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ color: '#2563EB', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  5. Which response schema is required?
                </div>
                <div style={{ color: '#0F172A', fontWeight: 500, fontSize: '0.88rem', lineHeight: '1.4' }}>
                  {currentContract.questions.responseSchemaRequired}
                </div>
              </div>

              {/* Question 6 */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ color: '#2563EB', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  6. Which transaction state must be stored?
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.84rem', color: '#334155' }}>
                  {currentContract.questions.transactionStateStored.map((stateItem, sIdx) => (
                    <li key={sIdx} style={{ marginBottom: '0.2rem' }}>
                      {stateItem}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Interactive Payload Inspector with Tabs */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1.25rem',
                background: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { id: 'request', label: `Expected Request Payload (${currentContract.action})` },
                  { id: 'sync', label: 'Synchronous Response (ACK)' },
                  { id: 'callback', label: `Generated Callback (/on_${currentContract.action})` },
                  { id: 'state', label: 'Transaction State & Audit' },
                ].map((pt) => (
                  <button
                    key={pt.id}
                    onClick={() => setActivePayloadTab(pt.id as any)}
                    style={{
                      background: activePayloadTab === pt.id ? '#2563EB' : '#FFFFFF',
                      color: activePayloadTab === pt.id ? '#FFFFFF' : '#475569',
                      border: activePayloadTab === pt.id ? '1px solid #2563EB' : '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  handleCopySectionJson(
                    activePayloadTab === 'request'
                      ? currentContract.sampleRequest
                      : activePayloadTab === 'sync'
                      ? currentContract.sampleSyncResponse
                      : activePayloadTab === 'callback'
                      ? currentContract.sampleCallback
                      : currentContract.questions.transactionStateStored
                  )
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: copiedSectionJson ? '#10B981' : '#FFFFFF',
                  color: copiedSectionJson ? '#FFFFFF' : '#334155',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {copiedSectionJson ? <Check size={14} /> : <Copy size={14} />}
                {copiedSectionJson ? 'Copied to Clipboard!' : 'Copy Active JSON'}
              </button>
            </div>

            <pre
              style={{
                margin: 0,
                padding: '1.25rem',
                background: '#0F172A',
                color: '#38BDF8',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                maxHeight: '450px',
                overflowY: 'auto',
                lineHeight: '1.5',
              }}
            >
              {JSON.stringify(
                activePayloadTab === 'request'
                  ? currentContract.sampleRequest
                  : activePayloadTab === 'sync'
                  ? currentContract.sampleSyncResponse
                  : activePayloadTab === 'callback'
                  ? currentContract.sampleCallback
                  : {
                      stored_states: currentContract.questions.transactionStateStored,
                      node_subscriber_id: 'kognitiminds.com',
                      node_bpp_id: 'kogniti-minds-bpp',
                      timestamp: new Date().toISOString(),
                    },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW B: 10 Clickable API Cards Grid (When on /admin/ondc Overview)
          ========================================================================= */}
      {selectedApiAction === null && activeSubTab === 'overview' && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                RETeB2B 1.2.5 Seller / BPP Endpoints & Contracts
              </h3>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.88rem', color: '#64748B' }}>
                Click any API card below to open its dedicated section, review contract directionality, and execute live test calls.
              </p>
            </div>

            <button
              onClick={testAllEndpoints}
              disabled={isTestingAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: isTestingAll ? 'not-allowed' : 'pointer',
              }}
            >
              <RefreshCw size={14} className={isTestingAll ? 'animate-spin' : ''} />
              {isTestingAll ? 'Verifying Endpoints...' : 'Test All 10 Live Endpoints'}
            </button>
          </div>

          {/* 10 Clickable API Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {SELLER_API_CONTRACTS.map((api) => {
              const testState = endpointTestingState[api.action] || { status: 'idle' };
              return (
                <div
                  key={api.action}
                  onClick={() => handleOpenApiSection(api.action)}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid #E2E8F0',
                    padding: '1.35rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px -3px rgba(37, 99, 235, 0.12)';
                    e.currentTarget.style.borderColor = '#93C5FD';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.03)';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <div>
                    {/* Top Row: Action tag & Test status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span
                        style={{
                          background: api.badgeColor,
                          color: '#FFFFFF',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          fontFamily: 'monospace',
                        }}
                      >
                        POST /{api.action}
                      </span>
                      {testState.status === 'success' && (
                        <span style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle size={13} /> {testState.statusCode} OK ({testState.latencyMs}ms)
                        </span>
                      )}
                      {testState.status === 'error' && (
                        <span style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <XCircle size={13} /> Error
                        </span>
                      )}
                      {testState.status === 'testing' && (
                        <span style={{ color: '#2563EB', fontSize: '0.75rem', fontWeight: 600 }}>
                          Testing...
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>
                      {api.name}
                    </h4>

                    <p style={{ margin: '0 0 0.75rem', color: '#64748B', fontSize: '0.82rem', lineHeight: '1.4' }}>
                      {api.description}
                    </p>

                    {/* Request & Callback direction indicators */}
                    <div style={{ background: '#F8FAFC', padding: '0.6rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', marginBottom: '0.75rem', border: '1px solid #F1F5F9' }}>
                      <div style={{ color: '#334155', fontWeight: 600, marginBottom: '0.2rem' }}>
                        ➔ Request: <span style={{ color: '#2563EB' }}>{api.sender}</span>
                      </div>
                      <div style={{ color: '#334155', fontWeight: 600 }}>
                        ➔ Callback: <span style={{ color: '#10B981' }}>{api.callbackEndpoint}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'monospace' }}>
                      /admin/ondc/{api.action}
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: '#2563EB',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      Open API Section <ChevronRight size={15} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW C: Orders Sub-tab
          ========================================================================= */}
      {selectedApiAction === null && activeSubTab === 'orders' && (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              ONDC B2B Orders ({filteredOrders.length})
            </h3>
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search orders, buyers, or txn ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Order Number</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Buyer Entity</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Grand Total</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Transaction ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                      No ONDC orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0F172A' }}>{o.orderNumber}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{o.businessName}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>₹{o.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ background: '#DCFCE7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748B' }}>
                        {o.ondcContext?.transactionId || 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontSize: '0.75rem' }}>
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW D: State Machine Sub-tab
          ========================================================================= */}
      {selectedApiAction === null && activeSubTab === 'transactions' && (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1rem' }}>
            ONDC State Machine Transitions ({transactions.length})
          </h3>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Transaction ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Current State</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Updated At</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                      No active transitions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 600 }}>{tx.transactionId}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748B' }}>{tx.orderId || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ background: '#EFF6FF', color: '#1E40AF', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {tx.currentState}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontSize: '0.75rem' }}>
                        {new Date(tx.updatedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW E: Audit Logs Sub-tab
          ========================================================================= */}
      {selectedApiAction === null && activeSubTab === 'logs' && (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1rem' }}>
            ONDC Protocol Audit Logs ({logs.length})
          </h3>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                  <th style={{ padding: '0.75rem 1rem' }}>HTTP Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                      No audit logs captured yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748B' }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{log.action}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            background: log.status < 400 ? '#DCFCE7' : '#FEE2E2',
                            color: log.status < 400 ? '#166534' : '#991B1B',
                            padding: '0.2rem 0.4rem',
                            borderRadius: '4px',
                            fontWeight: 700,
                          }}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748B' }}>{log.durationMs || 0} ms</td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>{log.transactionId || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW F: Workbench Simulator Sub-tab
          ========================================================================= */}
      {selectedApiAction === null && activeSubTab === 'workbench' && (
        <div>
          {/* Workbench Kit Download Bar */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              borderRadius: '12px',
              padding: '1.5rem',
              color: '#FFFFFF',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Package size={18} style={{ color: '#38BDF8' }} />
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                  Official ONDC RETeB2B 1.2.5 Workbench Kit
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8' }}>
                Download all 10 verified JSON artifacts mapped directly to Kogniti Minds real paper catalogue.
              </p>
            </div>

            <a
              href="/ondc-workbench-kit.zip"
              download="ondc-workbench-kit.zip"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#2563EB',
                color: '#FFFFFF',
                textDecoration: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
              }}
            >
              <Download size={15} /> Download Full Workbench Kit (.zip)
            </a>
          </div>

          {/* Workbench Simulator Runner */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                  Interactive Scenario Simulator
                </h4>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                  Executes genuine seller business logic against active inventory and taxes.
                </p>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  background: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: isSimulating ? 'not-allowed' : 'pointer',
                }}
              >
                <Play size={14} />
                {isSimulating ? 'Simulating...' : 'Execute Scenario'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {[
                { id: 'search', label: '1. Search / Discovery', desc: 'Authoritative 13-product catalogue' },
                { id: 'select', label: '2. Select / Quote', desc: 'Item validation, 8% bulk discount & GST' },
                { id: 'init', label: '3. Init / Terms', desc: 'Billing address, fulfillment & payment terms' },
                { id: 'confirm', label: '4. Confirm / Order', desc: 'Atomic inventory deduction & order creation' },
                { id: 'update_return', label: '5. Buyer-Initiated Return', desc: 'Active reverse flow: Partial/Full return & refund' },
              ].map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc.id as any)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: selectedScenario === sc.id ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    background: selectedScenario === sc.id ? '#EFF6FF' : '#F8FAFC',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: selectedScenario === sc.id ? '#1E40AF' : '#0F172A' }}>
                    {sc.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
                    {sc.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Simulation Results */}
            {simulationResult && (
              <div style={{ marginTop: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#F1F5F9', padding: '0.65rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  </div>
                  <button
                    onClick={handleCopySimJson}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
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
                    maxHeight: '350px',
                    overflowY: 'auto',
                  }}
                >
                  {JSON.stringify(simulationResult.result || simulationResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Workbench Files Download Table */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
              Individual Artifact Downloads
            </h4>
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '0.65rem 1rem' }}>Filename</th>
                    <th style={{ padding: '0.65rem 1rem' }}>Scenario</th>
                    <th style={{ padding: '0.65rem 1rem' }}>Size</th>
                    <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {WORKBENCH_DOWNLOAD_ITEMS.map((item, idx) => (
                    <tr key={item.filename} style={{ borderBottom: idx !== WORKBENCH_DOWNLOAD_ITEMS.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'monospace', fontWeight: 600 }}>{item.filename}</td>
                      <td style={{ padding: '0.65rem 1rem' }}>{item.name}</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#64748B' }}>{item.size}</td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleCopyFileContent(item.filename)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              background: copiedFile === item.filename ? '#10B981' : '#F1F5F9',
                              color: copiedFile === item.filename ? '#FFFFFF' : '#334155',
                              border: '1px solid #CBD5E1',
                              borderRadius: '4px',
                              padding: '0.25rem 0.55rem',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {copiedFile === item.filename ? <Check size={11} /> : <Copy size={11} />}
                            {copiedFile === item.filename ? 'Copied' : 'Copy'}
                          </button>
                          <a
                            href={`/ondc/download/workbench-file/${item.filename}`}
                            download={item.filename}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              background: '#2563EB',
                              color: '#FFFFFF',
                              textDecoration: 'none',
                              borderRadius: '4px',
                              padding: '0.25rem 0.55rem',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                            }}
                          >
                            <Download size={11} /> Download
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OndcManagement;
