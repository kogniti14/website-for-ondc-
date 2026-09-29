import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Package,
  AlertCircle,
  CheckCircle2,
  Truck,
  ArrowLeft,
  FileText,
  ShieldAlert,
  Send,
} from 'lucide-react';
import { B2COrder, B2BOrder } from '../../types';
import { storageService } from '../../services/storageService';
import { ondcClientService } from '../../services/ondcClientService';

interface OrderUpdatePageProps {
  b2cOrders: B2COrder[];
  b2bOrders: B2BOrder[];
  setActiveTab: (tab: string) => void;
}

export const OrderUpdatePage: React.FC<OrderUpdatePageProps> = ({
  b2cOrders,
  b2bOrders,
  setActiveTab,
}) => {
  const getOrderIdFromUrl = () => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('orderId') || '';
    }
    return '';
  };

  const [orderQuery, setOrderQuery] = useState(getOrderIdFromUrl);
  const [searchedId, setSearchedId] = useState(getOrderIdFromUrl);
  const [updateType, setUpdateType] = useState<'return' | 'address_change' | 'quantity_correction'>('return');
  const [reason, setReason] = useState('Damaged in transit');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const matchedOrder = useMemo(() => {
    if (!searchedId.trim()) {
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

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedOrder) {
      setErrorMessage('Please select a valid order to update.');
      return;
    }

    const currentStatus = (matchedOrder.orderStatus || '').toLowerCase();

    // Validate update permissions
    if (updateType === 'address_change' && ['shipped', 'delivered', 'out_for_delivery'].includes(currentStatus)) {
      setErrorMessage('Delivery address cannot be modified after the order has been handed to the logistics carrier.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const returnItems = (matchedOrder.items || []).map((it: any) => ({
        id: it.productId,
        quantity: it.quantity,
      }));

      // Dispatch ONDC /update protocol request if transaction context exists
      if ('ondcContext' in matchedOrder && (matchedOrder as any).ondcContext?.transactionId) {
        await ondcClientService.updateOrder(
          matchedOrder.orderNumber || matchedOrder.id,
          'fulfillment',
          returnItems,
          (matchedOrder as any).ondcContext.transactionId
        );
      }

      // Record update timeline
      const updatedOrder = {
        ...matchedOrder,
        statusTimeline: [
          ...(matchedOrder.statusTimeline || []),
          {
            status: `ORDER UPDATE: ${updateType.toUpperCase()}`,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            note: `Buyer requested ${updateType}. Reason: ${reason}. Details: ${comments || 'Standard'}.`,
          },
        ],
      };

      if ('businessId' in matchedOrder) {
        storageService.saveB2BOrder(updatedOrder as B2BOrder);
      } else {
        storageService.saveB2COrder(updatedOrder as B2COrder);
      }

      setStatusMessage('Your order update request has been successfully recorded and dispatched to fulfillment.');
    } catch {
      setErrorMessage('Unable to process order update request. Please contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '85vh', padding: '2rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
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
          <span style={{ color: '#0F172A', fontWeight: 700 }}>Order Update & Returns</span>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.75rem 2rem',
              borderBottom: '1px solid #E2E8F0',
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              color: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <RotateCcw size={24} className="text-blue-400" />
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                Order Modification & Return Authorization
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8' }}>
              Connected to ONDC RETeB2B 1.2.5 buyer-initiated update & reverse logistics workflow.
            </p>
          </div>

          <div style={{ padding: '2rem' }}>
            {matchedOrder ? (
              <form onSubmit={handleSubmitUpdate}>
                {/* Current Order Summary */}
                <div style={{ padding: '1rem 1.25rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Target Order</span>
                    <strong style={{ fontSize: '1rem', color: '#0F172A' }}>
                      #{matchedOrder.orderNumber || matchedOrder.id}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Status</span>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, background: '#E2E8F0', color: '#0F172A' }}>
                      {matchedOrder.orderStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Update Nature */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', marginBottom: '0.5rem' }}>
                    Type of Order Update *
                  </label>
                  <select
                    value={updateType}
                    onChange={(e) => setUpdateType(e.target.value as any)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem' }}
                  >
                    <option value="return">Initiate Product Return (ONDC Reverse Fulfillment)</option>
                    <option value="address_change">Update Delivery Address (Allowed Before Shipment)</option>
                    <option value="quantity_correction">Quantity / Invoice Modification</option>
                  </select>
                </div>

                {/* Reason Dropdown */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', marginBottom: '0.5rem' }}>
                    Reason for Request *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem' }}
                  >
                    <option value="Damaged in transit">Damaged in transit (Transit Insurance Claim)</option>
                    <option value="Quality not as expected">Quality issue / Defective sheets</option>
                    <option value="Wrong product delivered">Incorrect SKU / GSM delivered</option>
                    <option value="Delivery address incorrect">Delivery address update required</option>
                    <option value="Other modification">Other business reason</option>
                  </select>
                </div>

                {/* Additional Details */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', marginBottom: '0.5rem' }}>
                    Additional Instructions or Notes
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter any specific batch numbers, package condition, or new shipping address..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                </div>

                {errorMessage && (
                  <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: 600 }}>
                    {errorMessage}
                  </div>
                )}

                {statusMessage && (
                  <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: 600 }}>
                    {statusMessage}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '0.85rem 2rem',
                      borderRadius: '10px',
                      background: '#0284C7',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      border: 'none',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Send size={16} />
                    <span>{isSubmitting ? 'Processing...' : 'Submit Update Request'}</span>
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
                      border: '1px solid #CBD5E1',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Back to Orders
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <Package size={48} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                  No Order Selected
                </h3>
                <p style={{ color: '#64748B', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
                  Please select an existing order to submit a return or update request.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
