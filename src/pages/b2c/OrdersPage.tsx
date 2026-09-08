import React, { useState } from 'react';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  FileText,
  Printer,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  X,
  MapPin,
} from 'lucide-react';
import { B2COrder } from '../../types';
import { storageService } from '../../services/storageService';

interface OrdersPageProps {
  orders: B2COrder[];
  setActiveTab: (tab: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ orders, setActiveTab }) => {
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<B2COrder | null>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<B2COrder | null>(null);

  const handlePrint = () => {
    window.print();
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

      {orders.length === 0 ? (
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
          {orders.map((order) => {
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
                        order.orderStatus === 'delivered'
                          ? 'badge-green'
                          : order.orderStatus === 'shipped'
                          ? 'badge-blue'
                          : 'badge-amber'
                      }`}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      <Truck size={13} /> {order.orderStatus.replace('_', ' ').toUpperCase()}
                    </span>

                    {/* View Invoice Button */}
                    <button
                      onClick={() => setSelectedOrderForInvoice(order)}
                      className="btn btn-outline btn-sm"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    >
                      <FileText size={14} /> Tax Invoice
                    </button>

                    {/* Track Details */}
                    <button
                      onClick={() => setSelectedOrderForTracking(order)}
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    >
                      <Clock size={14} /> Live Tracker
                    </button>
                  </div>
                </div>

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

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--slate-900)' }}>
                          ₹{item.total.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>Total (Incl. Tax)</div>
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
                      backgroundColor: i === selectedOrderForTracking.statusTimeline.length - 1 ? 'var(--primary)' : 'var(--emerald-600)',
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

      {/* 2. Official Printable GST Tax Invoice Modal */}
      {selectedOrderForInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedOrderForInvoice(null)}>
          <div
            className="modal-content"
            style={{
              maxWidth: '820px',
              padding: '2.5rem',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
            }}
            onClick={(e) => e.stopPropagation()}
            id="printable-gst-invoice"
          >
            {/* Top Invoice Actions */}
            <div className="flex justify-between items-center hide-on-print" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                Tax Invoice (Original for Recipient)
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                >
                  <Printer size={15} /> Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedOrderForInvoice(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
            </div>

            {/* Official GST Invoice Document Header */}
            <div className="flex justify-between items-start" style={{ marginBottom: '2rem' }}>
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                  <img src="/logo.svg" alt="" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                    KOGNITI MINDS PRIVATE LIMITED
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', lineHeight: '1.4' }}>
                  Registered Office: 42, 100 Feet Road, Indiranagar, Bengaluru, KA - 560038<br />
                  <strong>GSTIN:</strong> 29AABCK9901M1Z4 | <strong>CIN:</strong> U72900KA2024PTC188219<br />
                  <strong>PAN:</strong> AABCK9901M | <strong>State Code:</strong> 29 (Karnataka)
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>TAX INVOICE</h2>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.2rem' }}>
                  Invoice No: INV-{selectedOrderForInvoice.orderNumber}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                  Date: {new Date(selectedOrderForInvoice.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>

            {/* Buyer Details */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                padding: '1rem',
                backgroundColor: 'var(--slate-50)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                fontSize: '0.82rem',
              }}
            >
              <div>
                <strong style={{ color: 'var(--slate-900)', display: 'block', marginBottom: '0.25rem' }}>Billed To:</strong>
                <div>{selectedOrderForInvoice.customerName}</div>
                <div>{selectedOrderForInvoice.billingAddress.street}</div>
                <div>{selectedOrderForInvoice.billingAddress.city}, {selectedOrderForInvoice.billingAddress.state} - {selectedOrderForInvoice.billingAddress.pincode}</div>
                <div>Phone: {selectedOrderForInvoice.customerPhone}</div>
                {selectedOrderForInvoice.optionalGstin && (
                  <div style={{ color: 'var(--primary)', fontWeight: 700, marginTop: '0.25rem' }}>
                    Buyer GSTIN: {selectedOrderForInvoice.optionalGstin}
                  </div>
                )}
              </div>

              <div>
                <strong style={{ color: 'var(--slate-900)', display: 'block', marginBottom: '0.25rem' }}>Shipped To:</strong>
                <div>{selectedOrderForInvoice.shippingAddress.fullName}</div>
                <div>{selectedOrderForInvoice.shippingAddress.street}</div>
                <div>{selectedOrderForInvoice.shippingAddress.city}, {selectedOrderForInvoice.shippingAddress.state} - {selectedOrderForInvoice.shippingAddress.pincode}</div>
                <div>AWB Tracking: {selectedOrderForInvoice.trackingNumber} ({selectedOrderForInvoice.courierPartner})</div>
              </div>
            </div>

            {/* Itemized Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <thead>
                <tr style={{ background: 'var(--slate-100)', borderBottom: '2px solid var(--slate-300)', textAlign: 'left' }}>
                  <th style={{ padding: '0.6rem' }}>#</th>
                  <th style={{ padding: '0.6rem' }}>Item Description</th>
                  <th style={{ padding: '0.6rem' }}>HSN</th>
                  <th style={{ padding: '0.6rem', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '0.6rem', textAlign: 'right' }}>Taxable Val</th>
                  <th style={{ padding: '0.6rem', textAlign: 'right' }}>GST Rate</th>
                  <th style={{ padding: '0.6rem', textAlign: 'right' }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrderForInvoice.items.map((item, idx) => {
                  const taxable = Math.round((item.total / 1.18) * 100) / 100;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.6rem' }}>{idx + 1}</td>
                      <td style={{ padding: '0.6rem', fontWeight: 600 }}>{item.productName}</td>
                      <td style={{ padding: '0.6rem', color: 'var(--slate-500)' }}>{item.hsn}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'right' }}>₹{taxable.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'right' }}>18%</td>
                      <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 700 }}>₹{item.total.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Total Calculations */}
            <div className="flex justify-end" style={{ marginBottom: '2rem' }}>
              <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Base Value:</span>
                  <span>₹{Math.round((selectedOrderForInvoice.total / 1.18) * 100 / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CGST (9%):</span>
                  <span>₹{Math.round((selectedOrderForInvoice.gstAmount / 2) * 100 / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST (9%):</span>
                  <span>₹{Math.round((selectedOrderForInvoice.gstAmount / 2) * 100 / 100).toLocaleString('en-IN')}</span>
                </div>
                <div
                  className="flex justify-between items-baseline"
                  style={{
                    paddingTop: '0.5rem',
                    borderTop: '2px solid var(--slate-900)',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                  }}
                >
                  <span>Grand Total:</span>
                  <span>₹{selectedOrderForInvoice.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Signatory Footer */}
            <div className="flex justify-between items-end" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--slate-500)' }}>
              <div>
                * This is a computer-generated tax invoice issued by Kogniti Minds Private Limited.<br />
                Goods once sold carry manufacturer replacement warranty against manufacturing defects.
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>For Kogniti Minds Private Limited</div>
                <div style={{ height: '40px' }} />
                <div>Authorized Signatory</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
