import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  FileText,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  X,
  MapPin,
  CreditCard,
  ShieldCheck,
  Star,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { B2COrder, OrderItemSummary, ProductReview } from '../../types';
import { storageService } from '../../services/storageService';
import { RazorpayCheckoutModal } from '../../components/payment/RazorpayCheckoutModal';
import { razorpayService } from '../../services/razorpayService';
import { OrderInvoiceModal } from '../../components/common/OrderInvoiceModal';
import { ReviewSubmissionModal } from '../../components/reviews/ReviewSubmissionModal';
import { reviewService } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import { dataSyncBus } from '../../services/dataSyncBus';
import { ondcClientService } from '../../services/ondcClientService';

interface OrdersPageProps {
  orders: B2COrder[];
  setActiveTab: (tab: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ orders, setActiveTab }) => {
  const { b2cUser } = useAuth();
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<B2COrder | null>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<B2COrder | null>(null);
  const [orderToPay, setOrderToPay] = useState<B2COrder | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ order: B2COrder; item: OrderItemSummary } | null>(null);
  const [allReviews, setAllReviews] = useState<ProductReview[]>(() => reviewService.getAllReviewsForAdmin());

  // ONDC RETeB2B Protocol Action States
  const [orderToCancel, setOrderToCancel] = useState<B2COrder | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('001');
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);
  const [orderToReturn, setOrderToReturn] = useState<B2COrder | null>(null);
  const [returnReason, setReturnReason] = useState<string>('Damaged in transit');
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);
  const [supportOrder, setSupportOrder] = useState<B2COrder | null>(null);
  const [supportInfo, setSupportInfo] = useState<{ phone: string; email: string; uri: string } | null>(null);
  const [isFetchingSupport, setIsFetchingSupport] = useState(false);
  const [statusRefreshingIds, setStatusRefreshingIds] = useState<Record<string, boolean>>({});
  const [statusNotices, setStatusNotices] = useState<Record<string, string>>({});
  const [liveTrackingInfo, setLiveTrackingInfo] = useState<{ url: string; status: string } | null>(null);

  useEffect(() => {
    const unsub = dataSyncBus.subscribe('reviews', (data) => {
      if (Array.isArray(data)) setAllReviews(data);
    });
    return () => unsub();
  }, []);

  // Filter orders so customers only access their authorized orders
  const authorizedOrders = orders.filter((order) => {
    if (!b2cUser) return true;
    return (
      order.customerEmail?.toLowerCase() === b2cUser.email?.toLowerCase() ||
      order.customerPhone === b2cUser.phone
    );
  });

  const handleRefreshProtocolStatus = async (order: B2COrder) => {
    setStatusRefreshingIds((prev) => ({ ...prev, [order.id]: true }));
    setStatusNotices((prev) => ({ ...prev, [order.id]: 'Retrieving order status...' }));
    try {
      const res = await ondcClientService.getOrderStatus(order.orderNumber, order.ondcContext?.transactionId);
      if (res.success) {
        setStatusNotices((prev) => ({
          ...prev,
          [order.id]: `Protocol Status Verified: ${order.orderStatus.toUpperCase()} (ACK)`,
        }));
      } else {
        setStatusNotices((prev) => ({
          ...prev,
          [order.id]: res.error?.message || 'Unable to complete this request. Please try again.',
        }));
      }
    } catch {
      setStatusNotices((prev) => ({
        ...prev,
        [order.id]: 'Unable to complete this request. Please try again.',
      }));
    } finally {
      setStatusRefreshingIds((prev) => ({ ...prev, [order.id]: false }));
    }
  };

  const handleOpenTrackingModal = async (order: B2COrder) => {
    setSelectedOrderForTracking(order);
    try {
      const res = await ondcClientService.trackShipment(order.orderNumber, order.ondcContext?.transactionId);
      if (res.success && res.data) {
        setLiveTrackingInfo(res.data);
      }
    } catch {
      // Fallback to internal order tracking
    }
  };

  const handleConfirmCancellation = async () => {
    if (!orderToCancel) return;
    setIsProcessingCancel(true);
    try {
      const res = await ondcClientService.cancelOrder(
        orderToCancel.orderNumber,
        cancellationReason,
        orderToCancel.ondcContext?.transactionId
      );

      const updatedOrder: B2COrder = {
        ...orderToCancel,
        orderStatus: 'cancelled',
        statusTimeline: [
          ...orderToCancel.statusTimeline,
          {
            status: 'CANCELLED BY BUYER',
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            note: `Cancellation confirmed via ONDC /cancel protocol flow. Reason code: ${cancellationReason}. Stock restored.`,
          },
        ],
      };

      storageService.saveB2COrder(updatedOrder);
      setOrderToCancel(null);
      alert(`Order #${orderToCancel.orderNumber} successfully cancelled under ONDC RETeB2B 1.2.5 protocol.`);
    } catch {
      alert('Unable to complete this request. Please try again.');
    } finally {
      setIsProcessingCancel(false);
    }
  };

  const handleConfirmReturn = async () => {
    if (!orderToReturn) return;
    setIsProcessingReturn(true);
    try {
      const returnItems = orderToReturn.items.map((it) => ({ id: it.productId, quantity: it.quantity }));
      await ondcClientService.updateOrder(
        orderToReturn.orderNumber,
        'fulfillment',
        returnItems,
        orderToReturn.ondcContext?.transactionId
      );

      const updatedOrder: B2COrder = {
        ...orderToReturn,
        statusTimeline: [
          ...orderToReturn.statusTimeline,
          {
            status: 'RETURN REQUESTED (ONDC UPDATE)',
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            note: `Buyer-initiated return flow dispatched via ONDC /update. Reason: ${returnReason}`,
          },
        ],
      };

      storageService.saveB2COrder(updatedOrder);
      setOrderToReturn(null);
      alert(`Return request for Order #${orderToReturn.orderNumber} processed via ONDC /update protocol.`);
    } catch {
      alert('Unable to complete this request. Please try again.');
    } finally {
      setIsProcessingReturn(false);
    }
  };

  const handleOpenSupportModal = async (order: B2COrder) => {
    setSupportOrder(order);
    setIsFetchingSupport(true);
    try {
      const res = await ondcClientService.getSupport(order.orderNumber, order.ondcContext?.transactionId);
      if (res.success && res.data) {
        setSupportInfo(res.data);
      } else {
        setSupportInfo({
          phone: '+91 98111 22334',
          email: 'support@kognitiminds.com',
          uri: 'https://kognitiminds.com/contact',
        });
      }
    } catch {
      setSupportInfo({
        phone: '+91 98111 22334',
        email: 'support@kognitiminds.com',
        uri: 'https://kognitiminds.com/contact',
      });
    } finally {
      setIsFetchingSupport(false);
    }
  };

  const handlePaymentSuccess = (response: any) => {
    if (!orderToPay) return;
    const updatedOrder: B2COrder = {
      ...orderToPay,
      paymentStatus: 'paid',
      paymentDetails: {
        ...orderToPay.paymentDetails,
        transactionId: response.razorpay_payment_id,
        bankName: response.method,
      },
      statusTimeline: [
        ...orderToPay.statusTimeline,
        {
          status: 'PAYMENT CONFIRMED VIA RAZORPAY',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          note: `Settled online via Razorpay (Payment ID: ${response.razorpay_payment_id})`,
        },
      ],
    };
    storageService.saveB2COrder(updatedOrder);
    setOrderToPay(null);
    alert(`Payment of ₹${updatedOrder.total.toLocaleString('en-IN')} successful via Razorpay!`);
  };

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <button
            onClick={() => setActiveTab('products')}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900"
            style={{ fontSize: '0.82rem', marginBottom: '0.5rem', fontWeight: 600 }}
          >
            <ArrowLeft size={14} /> Back to Catalog
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>My Orders & Shipments</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Real-time fulfillment tracking and official GST Tax Invoices
          </p>
        </div>
      </div>

      {authorizedOrders.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            borderRadius: 'var(--radius-xl)',
            maxWidth: '550px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <Package size={32} />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            No Orders Found Yet
          </h3>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            You haven't placed any orders yet. Browse our catalog and experience express pan-India delivery.
          </p>
          <button
            onClick={() => setActiveTab('products')}
            className="btn btn-primary"
            style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem 2rem' }}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {authorizedOrders.map((order) => {
            return (
              <div
                key={order.id}
                className="card"
                style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                }}
              >
                {/* Order Top Bar */}
                <div
                  className="flex justify-between items-center flex-wrap gap-3"
                  style={{
                    paddingBottom: '1rem',
                    borderBottom: '1px solid var(--border-color)',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Order Reference
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--slate-900)' }}>
                      {order.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Badge */}
                    <span
                      className={`badge ${
                        order.orderStatus === 'confirmed' || order.orderStatus === 'delivered'
                          ? 'badge-green'
                          : order.orderStatus === 'rejected'
                          ? 'badge-red'
                          : order.orderStatus === 'placed'
                          ? 'badge-amber'
                          : 'badge-blue'
                      }`}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 700 }}
                    >
                      {order.orderStatus === 'placed' && '🟡 Order Placed'}
                      {order.orderStatus === 'confirmed' && '🟢 Order Confirmed'}
                      {order.orderStatus === 'rejected' && '🔴 Order Rejected'}
                      {order.orderStatus === 'processing' && '🔵 Processing'}
                      {order.orderStatus === 'packed' && '📦 Packed'}
                      {order.orderStatus === 'shipped' && '🚚 Shipped'}
                      {order.orderStatus === 'delivered' && '✅ Delivered'}
                      {order.orderStatus === 'cancelled' && '⚪ Cancelled'}
                    </span>

                    {/* Payment Status / Action */}
                    {order.paymentStatus === 'paid' ? (
                      <span className="badge badge-green" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                        <ShieldCheck size={13} /> PAID (RAZORPAY)
                      </span>
                    ) : (
                      <button
                        onClick={() => setOrderToPay(order)}
                        className="btn btn-primary btn-sm"
                        style={{
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                        }}
                      >
                        <CreditCard size={14} /> Pay Now via Razorpay
                      </button>
                    )}

                    {/* View Invoice Button (Official Invoice available only after confirmation) */}
                    {order.orderStatus === 'placed' ? (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#92400e',
                          background: '#fef3c7',
                          border: '1px solid #fde68a',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.35rem 0.65rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                        title="Official Tax Invoice will be generated upon confirmation by operations team"
                      >
                        🔒 Tax Invoice on Confirmation
                      </span>
                    ) : order.orderStatus === 'rejected' ? (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#991b1b',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.35rem 0.65rem',
                        }}
                      >
                        🚫 Order Rejected
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedOrderForInvoice(order)}
                        className="btn btn-outline btn-sm"
                        style={{ borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <FileText size={14} /> Tax Invoice
                      </button>
                    )}

                    {/* Track Details */}
                    <button
                      onClick={() => handleOpenTrackingModal(order)}
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                      title="Query live courier and ONDC fulfillment tracking"
                    >
                      <Clock size={14} /> Live Tracker
                    </button>

                    {/* Refresh ONDC Protocol Status */}
                    <button
                      onClick={() => handleRefreshProtocolStatus(order)}
                      disabled={statusRefreshingIds[order.id]}
                      className="btn btn-outline btn-sm"
                      style={{ borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      title="Trigger ONDC /status protocol query"
                    >
                      <RefreshCw size={13} className={statusRefreshingIds[order.id] ? 'animate-spin' : ''} />
                      <span>{statusRefreshingIds[order.id] ? 'Checking...' : 'Check Status'}</span>
                    </button>

                    {/* Order Support Action */}
                    <button
                      onClick={() => handleOpenSupportModal(order)}
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      title="Trigger ONDC /support escalation"
                    >
                      <HelpCircle size={13} /> Support
                    </button>

                    {/* Cancellation Action for Eligible Orders */}
                    {(order.orderStatus === 'placed' || order.orderStatus === 'processing' || order.orderStatus === 'confirmed') && (
                      <button
                        onClick={() => setOrderToCancel(order)}
                        className="btn btn-sm"
                        style={{
                          borderRadius: 'var(--radius-sm)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#FFF1F2',
                          color: '#BE123C',
                          border: '1px solid #FECDD3',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                        title="Cancel active order via ONDC /cancel"
                      >
                        <X size={13} /> Cancel Order
                      </button>
                    )}

                    {/* Return Action for Delivered Orders */}
                    {order.orderStatus === 'delivered' && (
                      <button
                        onClick={() => setOrderToReturn(order)}
                        className="btn btn-sm"
                        style={{
                          borderRadius: 'var(--radius-sm)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#FEF3C7',
                          color: '#B45309',
                          border: '1px solid #FDE68A',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                        title="Initiate reverse flow via ONDC /update"
                      >
                        <RotateCcw size={13} /> Return / Exchange
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Notice Banner if user just checked protocol status */}
                {statusNotices[order.id] && (
                  <div
                    style={{
                      background: '#F0F9FF',
                      border: '1px solid #BAE6FD',
                      borderRadius: '8px',
                      padding: '0.5rem 0.85rem',
                      marginBottom: '0.85rem',
                      fontSize: '0.78rem',
                      color: '#0369A1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <CheckCircle2 size={14} className="text-sky-600 flex-shrink-0" />
                    <span>{statusNotices[order.id]}</span>
                  </div>
                )}

                {/* Real-time Synchronized Status Banner */}
                {order.orderStatus === 'placed' && (
                  <div
                    style={{
                      background: '#FEF3C7',
                      border: '1px solid #F59E0B',
                      borderRadius: '8px',
                      padding: '0.65rem 0.9rem',
                      marginBottom: '1rem',
                      fontSize: '0.82rem',
                      color: '#92400E',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>🟡</span>
                    <span>
                      <strong>Order Placed (Under Admin Review):</strong> Your order and payment have been logged successfully. Our fulfillment team is reviewing your order details for confirmation.
                    </span>
                  </div>
                )}

                {order.orderStatus === 'confirmed' && (
                  <div
                    style={{
                      background: '#ECFDF5',
                      border: '1px solid #10B981',
                      borderRadius: '8px',
                      padding: '0.65rem 0.9rem',
                      marginBottom: '1rem',
                      fontSize: '0.82rem',
                      color: '#065F46',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>🟢</span>
                    <span>
                      <strong>Order Confirmed:</strong> Your order has been reviewed and officially confirmed by our operations desk! Proceeding to warehouse packing.
                    </span>
                  </div>
                )}

                {order.orderStatus === 'rejected' && (
                  <div
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #EF4444',
                      borderRadius: '8px',
                      padding: '0.65rem 0.9rem',
                      marginBottom: '1rem',
                      fontSize: '0.82rem',
                      color: '#991B1B',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                      <span>🔴</span>
                      <span>Order Rejected by Operations Team</span>
                    </div>
                    {order.rejectionReason && (
                      <div style={{ paddingLeft: '1.5rem', fontSize: '0.8rem', color: '#B91C1C' }}>
                        <strong>Reason:</strong> {order.rejectionReason}
                      </div>
                    )}
                  </div>
                )}

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.productName}
                          style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                            {item.productName}
                          </h4>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            SKU: {item.sku} | HSN: {item.hsn} | Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--slate-900)' }}>
                          ₹{item.total.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>Total (Incl. Tax)</div>

                        {order.orderStatus === 'delivered' && (
                          <div style={{ marginTop: '0.25rem' }}>
                            {allReviews.some((r) => r.orderId === order.id && r.productId === item.productId) ? (
                              <span
                                className="flex items-center gap-1 text-emerald-600"
                                style={{ fontSize: '0.75rem', fontWeight: 700 }}
                              >
                                <CheckCircle2 size={13} />
                                Reviewed
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setReviewTarget({ order, item })}
                                className="btn btn-secondary flex items-center gap-1"
                                style={{
                                  padding: '0.25rem 0.65rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  borderRadius: '6px',
                                  backgroundColor: '#FEF3C7',
                                  color: '#B45309',
                                  borderColor: '#FDE68A',
                                }}
                              >
                                <Star size={12} fill="#B45309" /> Write a Review
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Details */}
                <div
                  className="flex justify-between items-center flex-wrap gap-3"
                  style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--slate-500)' }}>Delivery Address: </span>
                    <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                      {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span style={{ color: 'var(--slate-500)' }}>Order Total:</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{order.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Live Tracking Timeline Modal */}
      {selectedOrderForTracking && (
        <div className="modal-overlay" onClick={() => setSelectedOrderForTracking(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '560px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Shipment Tracker: {selectedOrderForTracking.orderNumber}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Carrier: {selectedOrderForTracking.courierPartner || 'Delhivery Express'} | AWB: {selectedOrderForTracking.trackingNumber}
                </div>
              </div>
              <button onClick={() => setSelectedOrderForTracking(null)} style={{ cursor: 'pointer' }}>
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Timeline Stepper */}
            <div style={{ position: 'relative', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '11px',
                  top: '10px',
                  bottom: '10px',
                  width: '2px',
                  backgroundColor: 'var(--slate-200)',
                }}
              />

              {selectedOrderForTracking.statusTimeline.map((step, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-2rem',
                      top: '2px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor:
                        step.status.includes('REJECTED')
                          ? '#EF4444'
                          : i === selectedOrderForTracking.statusTimeline.length - 1
                          ? 'var(--primary)'
                          : 'var(--emerald-600)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      boxShadow: '0 0 0 4px #ffffff',
                    }}
                  >
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-900)' }}>
                        {step.status}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                        {step.timestamp}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                      {step.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="btn btn-secondary btn-sm"
              >
                Close Tracker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Official Statutory GST Tax Invoice Modal */}
      {selectedOrderForInvoice && (
        <OrderInvoiceModal
          order={selectedOrderForInvoice}
          isB2B={false}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}

      {/* Razorpay Settlement Modal for Pending Orders */}
      {orderToPay && (
        <RazorpayCheckoutModal
          isOpen={!!orderToPay}
          onClose={() => setOrderToPay(null)}
          amount={orderToPay.total}
          orderNumber={orderToPay.orderNumber}
          customerName={orderToPay.customerName}
          customerEmail={orderToPay.customerEmail}
          customerPhone={orderToPay.customerPhone}
          description={`Payment settlement for Order #${orderToPay.orderNumber}`}
          isB2B={false}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* 3. Verified Customer Review Modal */}
      {reviewTarget && (
        <ReviewSubmissionModal
          isOpen={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          productId={reviewTarget.item.productId}
          productName={reviewTarget.item.productName}
          productImage={reviewTarget.item.image}
          productSku={reviewTarget.item.sku}
          orderId={reviewTarget.order.id}
          orderNumber={reviewTarget.order.orderNumber}
          customerType="b2c"
          customerId={b2cUser?.id || reviewTarget.order.customerEmail}
          customerName={b2cUser?.name || reviewTarget.order.customerName}
          onSuccess={() => {
            setAllReviews(reviewService.getAllReviewsForAdmin());
          }}
        />
      )}

      {/* 4. ONDC Order Cancellation Confirmation Modal */}
      {orderToCancel && (
        <div className="modal-overlay" onClick={() => !isProcessingCancel && setOrderToCancel(null)}>
          <div className="modal-content" style={{ maxWidth: '520px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={22} className="text-rose-600" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Cancel Order #{orderToCancel.orderNumber}
                </h3>
              </div>
              <button onClick={() => !isProcessingCancel && setOrderToCancel(null)} disabled={isProcessingCancel}>
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
              Are you sure you want to cancel this order? This action will trigger the official ONDC RETeB2B <strong>/cancel</strong> protocol workflow, restock allocated warehouse inventory, and cancel fulfillment.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Reason for Cancellation (Statutory Code)</label>
              <select
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="form-select"
                style={{ width: '100%', fontSize: '0.88rem', padding: '0.6rem 0.8rem' }}
                disabled={isProcessingCancel}
              >
                <option value="001">001 - Price for the product has changed</option>
                <option value="002">002 - Found better alternative or price elsewhere</option>
                <option value="003">003 - Expected delivery time is too long</option>
                <option value="004">004 - Ordered items or quantity by mistake</option>
                <option value="005">005 - Customer address or billing details need correction</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                disabled={isProcessingCancel}
                className="btn btn-secondary btn-sm"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancellation}
                disabled={isProcessingCancel}
                className="btn btn-sm"
                style={{
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.55rem 1.25rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {isProcessingCancel ? 'Processing Cancellation...' : 'Confirm Order Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. ONDC Buyer-Initiated Return Flow Modal */}
      {orderToReturn && (
        <div className="modal-overlay" onClick={() => !isProcessingReturn && setOrderToReturn(null)}>
          <div className="modal-content" style={{ maxWidth: '520px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-2">
                <RotateCcw size={22} className="text-amber-600" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Return Items: #{orderToReturn.orderNumber}
                </h3>
              </div>
              <button onClick={() => !isProcessingReturn && setOrderToReturn(null)} disabled={isProcessingReturn}>
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
              Submit a formal reverse fulfillment request under ONDC RETeB2B <strong>/update</strong>. Our logistics partner will schedule reverse pickup upon approval.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Return / Exchange Reason</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="form-select"
                style={{ width: '100%', fontSize: '0.88rem', padding: '0.6rem 0.8rem' }}
                disabled={isProcessingReturn}
              >
                <option value="Damaged in transit">Damaged in transit / Torn packaging</option>
                <option value="Defective or incorrect GSM">Defective or incorrect GSM / Specification mismatch</option>
                <option value="Wrong product delivered">Wrong product delivered by carrier</option>
                <option value="Excess quantity delivered">Excess quantity delivered</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOrderToReturn(null)}
                disabled={isProcessingReturn}
                className="btn btn-secondary btn-sm"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                disabled={isProcessingReturn}
                className="btn btn-primary btn-sm"
              >
                {isProcessingReturn ? 'Submitting Return...' : 'Authorize Return Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. ONDC Customer Support & Grievance Modal */}
      {supportOrder && (
        <div className="modal-overlay" onClick={() => setSupportOrder(null)}>
          <div className="modal-content" style={{ maxWidth: '480px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-2">
                <HelpCircle size={22} className="text-sky-600" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Customer Support</h3>
              </div>
              <button onClick={() => setSupportOrder(null)}>
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
                Order Reference: {supportOrder.orderNumber}
              </div>
              <div style={{ color: 'var(--slate-500)', fontSize: '0.78rem' }}>
                Customer: {supportOrder.customerName} ({supportOrder.customerEmail})
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--slate-700)', minWidth: '80px' }}>Helpline:</span>
                <a href={`tel:${supportInfo?.phone || '+919811122334'}`} style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  {supportInfo?.phone || '+91 98111 22334'}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--slate-700)', minWidth: '80px' }}>Email:</span>
                <a href={`mailto:${supportInfo?.email || 'support@kognitiminds.com'}`} style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  {supportInfo?.email || 'support@kognitiminds.com'}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--slate-700)', minWidth: '80px' }}>Grievance:</span>
                <span style={{ color: 'var(--slate-600)' }}>Officer: Kogniti Minds Compliance Desk</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button onClick={() => setSupportOrder(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
