import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  ShieldAlert,
  FileText,
  Building2,
  Package,
  ChevronRight,
} from 'lucide-react';
import { B2COrder, B2BOrder, CancellationRequest, CANCELLATION_REASONS } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { dataSyncBus } from '../../services/dataSyncBus';

interface CancellationPageProps {
  b2cOrders: B2COrder[];
  b2bOrders: B2BOrder[];
  setActiveTab: (tab: string) => void;
}

export const CancellationPage: React.FC<CancellationPageProps> = ({
  b2cOrders,
  b2bOrders,
  setActiveTab,
}) => {
  const { b2cUser, b2bBusiness, role } = useAuth();

  // Resolve target orderId from query parameter
  const getOrderIdFromUrl = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('orderId') || '';
    }
    return '';
  };

  const [selectedOrderId, setSelectedOrderId] = useState<string>(getOrderIdFromUrl);
  const [reasonCode, setReasonCode] = useState<string>('001');
  const [additionalExplanation, setAdditionalExplanation] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancellationRequests, setCancellationRequests] = useState<CancellationRequest[]>(() =>
    storageService.getCancellationRequests()
  );

  useEffect(() => {
    const unsub = dataSyncBus.subscribe('cancellation_requests', (data) => {
      if (Array.isArray(data)) setCancellationRequests(data);
    });
    return () => unsub();
  }, []);

  // Filter orders accessible to the current user
  const userOrders = useMemo(() => {
    const combined: Array<{
      id: string;
      orderNumber: string;
      createdAt: string;
      type: 'b2c' | 'b2b';
      status: string;
      total: number;
      itemsCount: number;
    }> = [];

    // B2C orders
    b2cOrders.forEach((o) => {
      const isOwner =
        !b2cUser ||
        o.customerEmail?.toLowerCase() === b2cUser.email?.toLowerCase() ||
        o.customerPhone === b2cUser.phone;
      if (isOwner) {
        combined.push({
          id: o.id,
          orderNumber: o.orderNumber || o.id,
          createdAt: o.createdAt,
          type: 'b2c',
          status: o.orderStatus,
          total: o.total,
          itemsCount: o.items?.length || 1,
        });
      }
    });

    // B2B orders
    b2bOrders.forEach((o) => {
      const isOwner =
        !b2bBusiness ||
        o.businessId === b2bBusiness.id ||
        o.businessName?.toLowerCase() === b2bBusiness.companyName?.toLowerCase();
      if (isOwner) {
        combined.push({
          id: o.id,
          orderNumber: o.orderNumber || o.id,
          createdAt: o.createdAt,
          type: 'b2b',
          status: o.orderStatus,
          total: o.grandTotal || 0,
          itemsCount: o.items?.length || 1,
        });
      }
    });

    return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [b2cOrders, b2bOrders, b2cUser, b2bBusiness]);

  // Selected Order Object
  const currentOrder = useMemo(() => {
    if (!selectedOrderId) {
      return userOrders.length > 0 ? userOrders[0] : null;
    }
    return userOrders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId) || null;
  }, [selectedOrderId, userOrders]);

  // Check if there is an existing cancellation request for the current order
  const existingRequest = useMemo(() => {
    if (!currentOrder) return undefined;
    return cancellationRequests.find((r) => r.orderId === currentOrder.id);
  }, [currentOrder, cancellationRequests]);

  // Eligibility evaluation
  const eligibility = useMemo(() => {
    if (!currentOrder) {
      return { eligible: false, reason: 'No order selected.' };
    }

    const orderTime = new Date(currentOrder.createdAt).getTime();
    const now = Date.now();
    const elapsedMs = now - orderTime;
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    const hoursRemaining = Math.max(0, 6 - elapsedHours);
    const minutesRemaining = Math.max(0, Math.floor((6 * 60) - (elapsedMs / (1000 * 60))));

    // 1. Shipped check
    const normalizedStatus = (currentOrder.status || '').toLowerCase();
    if (['shipped', 'delivered', 'out_for_delivery', 'dispatched'].includes(normalizedStatus)) {
      return {
        eligible: false,
        reason: 'This order has already been shipped. In accordance with platform policy, shipped orders cannot be cancelled.',
        isShipped: true,
        hoursRemaining: 0,
      };
    }

    // 2. Already cancelled
    if (['cancelled', 'rejected'].includes(normalizedStatus)) {
      return {
        eligible: false,
        reason: 'This order has already been cancelled or closed.',
        isCancelled: true,
        hoursRemaining: 0,
      };
    }

    // 3. 6-hour limit check
    if (elapsedHours > 6) {
      return {
        eligible: false,
        reason: 'The 6-hour cancellation window has expired. Orders placed more than 6 hours ago cannot be cancelled through the self-service flow. Please contact customer support.',
        expired: true,
        hoursRemaining: 0,
      };
    }

    return {
      eligible: true,
      hoursRemaining,
      minutesRemaining,
      orderTime: new Date(currentOrder.createdAt),
    };
  }, [currentOrder]);

  const handleSubmitCancellation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentOrder) {
      setErrorMessage('Please select a valid order to cancel.');
      return;
    }

    const selectedReasonObj = CANCELLATION_REASONS.find((r) => r.code === reasonCode);
    const reasonText = selectedReasonObj ? selectedReasonObj.label : '';

    // Validate reason requirement per section B
    if (!reasonCode || !reasonText || reasonText.trim().length === 0) {
      setErrorMessage('Please provide a cancellation reason before submitting your cancellation request.');
      return;
    }

    if (reasonCode === 'other' && (!additionalExplanation || additionalExplanation.trim().length < 5)) {
      setErrorMessage('Please provide a written explanation for your cancellation reason.');
      return;
    }

    setIsSubmitting(true);
    const customerInfo = {
      id: b2cUser?.id || b2bBusiness?.id || 'guest',
      name: b2cUser?.name || b2bBusiness?.contactPerson || 'Customer',
      email: b2cUser?.email || b2bBusiness?.businessEmail || '',
      phone: b2cUser?.phone || b2bBusiness?.mobile || '',
    };

    const res = storageService.submitCancellationRequest({
      orderId: currentOrder.id,
      orderType: currentOrder.type,
      reasonCode,
      reasonText,
      explanation: additionalExplanation,
      customer: customerInfo,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage(res.message);
      setCancellationRequests(storageService.getCancellationRequests());
    } else {
      setErrorMessage(res.message);
    }
  };

  const getStatusBadge = (status: CancellationRequest['status']) => {
    switch (status) {
      case 'pending_admin_approval':
        return { label: 'Pending Admin Approval', color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' };
      case 'pending_super_admin_approval':
        return { label: 'Pending Super Admin Approval', color: '#7C3AED', bg: '#EDE9FE', border: '#DDD6FE' };
      case 'approved':
        return { label: 'Cancellation Approved & Processed', color: '#15803D', bg: '#DCFCE7', border: '#BBF7D0' };
      case 'rejected':
        return { label: 'Cancellation Rejected', color: '#DC2626', bg: '#FEE2E2', border: '#FECACA' };
      case 'ineligible':
        return { label: 'Cancellation No Longer Eligible', color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1' };
      default:
        return { label: 'Cancellation Request Submitted', color: '#0284C7', bg: '#E0F2FE', border: '#BAE6FD' };
    }
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '85vh', padding: '2rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Header Breadcrumbs */}
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
          <button
            onClick={() => {
              window.history.pushState(null, '', '/orders');
              setActiveTab('orders');
            }}
            style={{ background: 'none', border: 'none', padding: 0, color: '#0284C7', cursor: 'pointer', fontWeight: 600 }}
          >
            Orders
          </button>
          <span>/</span>
          <span style={{ color: '#0F172A', fontWeight: 700 }}>Order Cancellation Request</span>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          }}
        >
          {/* Title Header */}
          <div
            style={{
              padding: '1.75rem 2rem',
              borderBottom: '1px solid #E2E8F0',
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              color: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <ShieldAlert size={24} className="text-amber-400" />
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                Order Cancellation System (B2B & B2C)
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8' }}>
              Authoritative order cancellation with pre-shipment validation, 6-hour SLA countdown, and mandatory two-level administrative approval.
            </p>
          </div>

          <div style={{ padding: '2rem' }}>
            {/* Order Selector */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', marginBottom: '0.5rem' }}>
                Select Order to Cancel:
              </label>
              {userOrders.length > 0 ? (
                <select
                  value={currentOrder?.id || ''}
                  onChange={(e) => {
                    setSelectedOrderId(e.target.value);
                    window.history.replaceState(null, '', `/cancel?orderId=${e.target.value}`);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.95rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  {userOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      #{o.orderNumber} • ₹{o.total.toLocaleString('en-IN')} • Placed: {new Date(o.createdAt).toLocaleString('en-IN')} • Status: {o.status.toUpperCase()} ({o.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ padding: '1rem', background: '#F1F5F9', borderRadius: '10px', color: '#64748B', fontSize: '0.9rem' }}>
                  No recent orders found on your account. If you placed an order as a guest, please check your confirmation email or contact support.
                </div>
              )}
            </div>

            {currentOrder && (
              <>
                {/* Order Summary Strip */}
                <div
                  style={{
                    padding: '1.25rem',
                    background: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    marginBottom: '1.75rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Order ID</span>
                    <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>#{currentOrder.orderNumber}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Order Timestamp</span>
                    <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>
                      {new Date(currentOrder.createdAt).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Order Total</span>
                    <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>
                      ₹{currentOrder.total.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Current Status</span>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: '#E2E8F0',
                        color: '#1E293B',
                      }}
                    >
                      {currentOrder.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Existing Cancellation Request Status Display (Section F) */}
                {existingRequest ? (
                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      border: '1.5px solid #CBD5E1',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                        Cancellation Request Status
                      </h3>
                      {(() => {
                        const badge = getStatusBadge(existingRequest.status);
                        return (
                          <span
                            style={{
                              padding: '0.35rem 0.85rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                            }}
                          >
                            {badge.label}
                          </span>
                        );
                      })()}
                    </div>

                    <div style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                      <div><strong>Reason Submitted:</strong> {existingRequest.cancellationReason}</div>
                      {existingRequest.additionalExplanation && (
                        <div><strong>Explanation:</strong> {existingRequest.additionalExplanation}</div>
                      )}
                      <div><strong>Requested At:</strong> {new Date(existingRequest.requestedAt).toLocaleString('en-IN')}</div>
                      {existingRequest.rejectionReason && (
                        <div style={{ color: '#DC2626', marginTop: '0.5rem' }}>
                          <strong>Rejection Notice:</strong> {existingRequest.rejectionReason}
                        </div>
                      )}
                    </div>

                    {/* Step Timeline Indicator */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                      <div
                        style={{
                          padding: '0.65rem 0.25rem',
                          borderRadius: '8px',
                          background: '#DCFCE7',
                          color: '#15803D',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        1. Submitted
                      </div>
                      <div
                        style={{
                          padding: '0.65rem 0.25rem',
                          borderRadius: '8px',
                          background: existingRequest.adminApproval?.action === 'approved' ? '#DCFCE7' : existingRequest.status === 'pending_admin_approval' ? '#FEF3C7' : '#F1F5F9',
                          color: existingRequest.adminApproval?.action === 'approved' ? '#15803D' : existingRequest.status === 'pending_admin_approval' ? '#B45309' : '#64748B',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        2. Admin Review
                      </div>
                      <div
                        style={{
                          padding: '0.65rem 0.25rem',
                          borderRadius: '8px',
                          background: existingRequest.superAdminApproval?.action === 'approved' ? '#DCFCE7' : existingRequest.status === 'pending_super_admin_approval' ? '#EDE9FE' : '#F1F5F9',
                          color: existingRequest.superAdminApproval?.action === 'approved' ? '#15803D' : existingRequest.status === 'pending_super_admin_approval' ? '#7C3AED' : '#64748B',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        3. Super Admin
                      </div>
                      <div
                        style={{
                          padding: '0.65rem 0.25rem',
                          borderRadius: '8px',
                          background: existingRequest.status === 'approved' ? '#DCFCE7' : existingRequest.status === 'rejected' ? '#FEE2E2' : '#F1F5F9',
                          color: existingRequest.status === 'approved' ? '#15803D' : existingRequest.status === 'rejected' ? '#DC2626' : '#64748B',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        4. Final Execution
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* If no existing request, evaluate eligibility and show submission form */}
                {!existingRequest && (
                  <div>
                    {/* Eligibility Banner */}
                    {!eligibility.eligible ? (
                      <div
                        style={{
                          padding: '1.25rem',
                          borderRadius: '12px',
                          background: '#FEF2F2',
                          border: '1.5px solid #FCA5A5',
                          color: '#991B1B',
                          marginBottom: '1.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                          <XCircle size={18} />
                          <span>Order Ineligible for Cancellation</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
                          {eligibility.reason}
                        </p>
                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              window.history.pushState(null, '', '/support');
                              setActiveTab('support');
                            }}
                            style={{
                              padding: '0.45rem 1rem',
                              background: '#991B1B',
                              color: '#FFFFFF',
                              borderRadius: '6px',
                              border: 'none',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Contact Customer Support
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: '1rem 1.25rem',
                          borderRadius: '12px',
                          background: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#065F46',
                          marginBottom: '1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={18} className="text-emerald-600" />
                          <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                            Cancellation Window Active: {Math.floor(eligibility.hoursRemaining || 0)}h {(eligibility.minutesRemaining || 0) % 60}m remaining
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#047857' }}>
                          Status: Unshipped • Eligible for Dual Admin Review
                        </span>
                      </div>
                    )}

                    {/* Cancellation Form */}
                    {eligibility.eligible && (
                      <form onSubmit={handleSubmitCancellation}>
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', marginBottom: '0.5rem' }}>
                            Cancellation Reason <span style={{ color: '#EF4444' }}>* (Compulsory)</span>:
                          </label>
                          <select
                            value={reasonCode}
                            onChange={(e) => setReasonCode(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              borderRadius: '10px',
                              border: '1.5px solid #CBD5E1',
                              fontSize: '0.95rem',
                              color: '#0F172A',
                              background: '#FFFFFF',
                              cursor: 'pointer',
                            }}
                          >
                            {CANCELLATION_REASONS.map((r) => (
                              <option key={r.code} value={r.code}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {reasonCode === 'other' && (
                          <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', marginBottom: '0.5rem' }}>
                              Written Explanation <span style={{ color: '#EF4444' }}>* (Required for Other reason)</span>:
                            </label>
                            <textarea
                              rows={4}
                              placeholder="Please provide specific details explaining why this order must be cancelled..."
                              value={additionalExplanation}
                              onChange={(e) => setAdditionalExplanation(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                border: '1.5px solid #CBD5E1',
                                fontSize: '0.95rem',
                                color: '#0F172A',
                                outline: 'none',
                              }}
                            />
                          </div>
                        )}

                        {errorMessage && (
                          <div
                            style={{
                              padding: '0.85rem 1rem',
                              borderRadius: '8px',
                              background: '#FEF2F2',
                              border: '1px solid #FCA5A5',
                              color: '#991B1B',
                              marginBottom: '1.25rem',
                              fontSize: '0.88rem',
                              fontWeight: 600,
                            }}
                          >
                            {errorMessage}
                          </div>
                        )}

                        {successMessage && (
                          <div
                            style={{
                              padding: '0.85rem 1rem',
                              borderRadius: '8px',
                              background: '#F0FDF4',
                              border: '1px solid #BBF7D0',
                              color: '#166534',
                              marginBottom: '1.25rem',
                              fontSize: '0.88rem',
                              fontWeight: 600,
                            }}
                          >
                            {successMessage}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                              padding: '0.85rem 2rem',
                              borderRadius: '10px',
                              background: '#DC2626',
                              color: '#FFFFFF',
                              fontWeight: 800,
                              fontSize: '0.95rem',
                              border: 'none',
                              cursor: isSubmitting ? 'not-allowed' : 'pointer',
                              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                            }}
                          >
                            {isSubmitting ? 'Submitting Request...' : 'Submit Cancellation Request'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              window.history.pushState(null, '', '/orders');
                              setActiveTab('orders');
                            }}
                            style={{
                              padding: '0.85rem 1.5rem',
                              borderRadius: '10px',
                              background: '#F1F5F9',
                              color: '#475569',
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              border: '1px solid #CBD5E1',
                              cursor: 'pointer',
                            }}
                          >
                            Back to Orders
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
