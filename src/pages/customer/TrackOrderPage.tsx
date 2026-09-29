import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Search,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { B2COrder, B2BOrder } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ondcClientService } from '../../services/ondcClientService';

interface TrackOrderPageProps {
  b2cOrders: B2COrder[];
  b2bOrders: B2BOrder[];
  setActiveTab: (tab: string) => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({
  b2cOrders,
  b2bOrders,
  setActiveTab,
}) => {
  const { b2cUser, b2bBusiness } = useAuth();

  const getOrderIdFromUrl = () => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('orderId') || '';
    }
    return '';
  };

  const [orderQuery, setOrderQuery] = useState(getOrderIdFromUrl);
  const [searchedId, setSearchedId] = useState(getOrderIdFromUrl);
  const [liveTrackingInfo, setLiveTrackingInfo] = useState<{ url: string; status: string } | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Authoritative order lookup
  const matchedOrder = useMemo(() => {
    if (!searchedId.trim()) {
      // If user logged in, default to most recent order
      if (b2cOrders.length > 0) return b2cOrders[0];
      if (b2bOrders.length > 0) return b2bOrders[0];
      return null;
    }
    const clean = searchedId.trim().toLowerCase();
    const b2c = b2cOrders.find((o) => o.id.toLowerCase() === clean || (o.orderNumber && o.orderNumber.toLowerCase() === clean));
    if (b2c) return b2c;
    const b2b = b2bOrders.find((o) => o.id.toLowerCase() === clean || (o.orderNumber && o.orderNumber.toLowerCase() === clean));
    if (b2b) return b2b;
    return null;
  }, [searchedId, b2cOrders, b2bOrders]);

  useEffect(() => {
    if (matchedOrder && 'ondcContext' in matchedOrder && (matchedOrder as any).ondcContext?.transactionId) {
      setIsTracking(true);
      ondcClientService
        .trackShipment(matchedOrder.orderNumber, (matchedOrder as any).ondcContext.transactionId)
        .then((res) => {
          if (res.success && res.data) {
            setLiveTrackingInfo(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setIsTracking(false));
    }
  }, [matchedOrder?.id]);

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    setSearchedId(orderQuery.trim());
    window.history.pushState(null, '', `/track?orderId=${encodeURIComponent(orderQuery.trim())}`);
  };

  const getFulfillmentSteps = (order: any) => {
    const status = (order.orderStatus || '').toLowerCase();
    const isConfirmed = ['confirmed', 'processing', 'shipped', 'delivered'].includes(status);
    const isProcessing = ['processing', 'shipped', 'delivered'].includes(status);
    const isShipped = ['shipped', 'delivered'].includes(status);
    const isDelivered = status === 'delivered';
    const isCancelled = status === 'cancelled' || status === 'rejected';

    return [
      { label: 'Order Placed', time: new Date(order.createdAt).toLocaleString('en-IN'), done: true },
      { label: 'Confirmed by Warehouse', time: isConfirmed ? 'Verified & Invoiced' : 'Pending', done: isConfirmed },
      { label: 'Eco-Packaging & Palletizing', time: isProcessing ? 'Completed' : 'Queued', done: isProcessing },
      { label: 'Handed to Logistics Partner', time: isShipped ? (order.shippingDetails?.trackingNumber ? `Waybill #${order.shippingDetails.trackingNumber}` : 'In Transit') : 'Awaiting Dispatch', done: isShipped },
      { label: 'Delivered', time: isDelivered ? 'Successfully Delivered' : 'Estimated 2-4 Days', done: isDelivered },
    ];
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '85vh', padding: '2rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
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
          <span style={{ color: '#0F172A', fontWeight: 700 }}>Real-Time Shipment Tracking</span>
        </div>

        {/* Header Search Bar */}
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
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
            Track Your Order & Logistics Dispatch
          </h1>
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: '#64748B' }}>
            Enter your Kogniti Minds Order Number or ONDC RET transaction reference to view live fulfillment milestones.
          </p>

          <form onSubmit={handleSearchOrder} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 280px' }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. KM-2026-001 or ord_...)"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.75rem',
                borderRadius: '10px',
                background: '#0284C7',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Truck size={18} />
              <span>Track Shipment</span>
            </button>
          </form>
        </div>

        {/* Tracking Details View */}
        {matchedOrder ? (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              border: '1px solid #E2E8F0',
            }}
          >
            {/* Order Summary Strip */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid #E2E8F0',
                marginBottom: '1.75rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block' }}>Order Reference</span>
                <strong style={{ fontSize: '1.25rem', color: '#0F172A' }}>#{matchedOrder.orderNumber || matchedOrder.id}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block' }}>Carrier Partner</span>
                <strong style={{ fontSize: '1rem', color: '#0F172A' }}>
                  {(matchedOrder as any).shippingDetails?.courier || 'Blue Dart Express / Delhivery'}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block' }}>Current Fulfillment Status</span>
                <span
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    background:
                      matchedOrder.orderStatus === 'delivered'
                        ? '#DCFCE7'
                        : matchedOrder.orderStatus === 'cancelled'
                        ? '#FEE2E2'
                        : '#E0F2FE',
                    color:
                      matchedOrder.orderStatus === 'delivered'
                        ? '#15803D'
                        : matchedOrder.orderStatus === 'cancelled'
                        ? '#DC2626'
                        : '#0284C7',
                  }}
                >
                  {matchedOrder.orderStatus.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem' }}>
              Logistics Milestones & Timeline
            </h3>

            <div style={{ position: 'relative', paddingLeft: '2rem', marginBottom: '2rem' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '11px',
                  top: '8px',
                  bottom: '8px',
                  width: '2px',
                  background: '#CBD5E1',
                }}
              />

              {getFulfillmentSteps(matchedOrder).map((step, idx) => (
                <div key={idx} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-2rem',
                      top: '2px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: step.done ? '#10B981' : '#E2E8F0',
                      color: step.done ? '#FFFFFF' : '#94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {step.done ? <CheckCircle2 size={16} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94A3B8' }} />}
                  </div>
                  <div style={{ fontWeight: step.done ? 700 : 500, color: step.done ? '#0F172A' : '#64748B', fontSize: '0.95rem' }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                    {step.time}
                  </div>
                </div>
              ))}
            </div>

            {/* Live Courier External Link if available */}
            {liveTrackingInfo?.url && (
              <div style={{ padding: '1rem', background: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 600 }}>
                  Live GPS Logistics Telemetry Available via Courier Partner
                </span>
                <a
                  href={liveTrackingInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.45rem 1rem',
                    background: '#15803D',
                    color: '#fff',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>Open Carrier GPS</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            )}

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '1.5rem', borderTop: '1px solid #E2E8F0' }}>
              <button
                type="button"
                onClick={() => {
                  window.history.pushState(null, '', `/status?orderId=${matchedOrder.orderNumber || matchedOrder.id}`);
                  setActiveTab('status');
                }}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                View Detailed Status
              </button>

              <button
                type="button"
                onClick={() => {
                  window.history.pushState(null, '', `/cancel?orderId=${matchedOrder.orderNumber || matchedOrder.id}`);
                  setActiveTab('cancel');
                }}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Request Order Cancellation
              </button>

              <button
                type="button"
                onClick={() => {
                  window.history.pushState(null, '', `/support?orderId=${matchedOrder.orderNumber || matchedOrder.id}`);
                  setActiveTab('support');
                }}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1D4ED8',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Contact Logistics Support
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '3rem 2rem',
              textAlign: 'center',
              border: '1px solid #E2E8F0',
            }}
          >
            <Package size={48} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
              No Order Selected for Tracking
            </h3>
            <p style={{ color: '#64748B', maxWidth: '440px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
              Please enter your Order ID in the search box above or browse your order history.
            </p>
            <button
              onClick={() => {
                window.history.pushState(null, '', '/orders');
                setActiveTab('orders');
              }}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                background: '#0284C7',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View Order History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
