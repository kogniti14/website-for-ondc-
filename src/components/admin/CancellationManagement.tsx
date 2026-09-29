import React, { useState, useEffect, useMemo } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Building2,
  Package,
  Search,
  Filter,
  ShieldCheck,
  AlertCircle,
  FileText,
  User,
  ExternalLink,
} from 'lucide-react';
import { CancellationRequest, B2COrder, B2BOrder } from '../../types';
import { storageService } from '../../services/storageService';
import { dataSyncBus } from '../../services/dataSyncBus';

interface CancellationManagementProps {
  isSuperAdmin: boolean;
  currentAdminUser: any;
  b2cOrders: B2COrder[];
  b2bOrders: B2BOrder[];
  onRefresh: () => void;
}

export const CancellationManagement: React.FC<CancellationManagementProps> = ({
  isSuperAdmin,
  currentAdminUser,
  b2cOrders,
  b2bOrders,
  onRefresh,
}) => {
  const [requests, setRequests] = useState<CancellationRequest[]>(() =>
    storageService.getCancellationRequests()
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<CancellationRequest | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const unsub = dataSyncBus.subscribe('cancellation_requests', (data) => {
      if (Array.isArray(data)) setRequests(data);
    });
    return () => unsub();
  }, []);

  const refreshRequests = () => {
    setRequests(storageService.getCancellationRequests());
    onRefresh();
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (filterType !== 'all' && r.orderType !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inId = r.id.toLowerCase().includes(q);
        const inOrder = (r.orderNumber || r.orderId).toLowerCase().includes(q);
        const inCust = (r.customerName || '').toLowerCase().includes(q);
        const inEmail = (r.customerEmail || '').toLowerCase().includes(q);
        if (!inId && !inOrder && !inCust && !inEmail) return false;
      }
      return true;
    });
  }, [requests, filterStatus, filterType, searchQuery]);

  const handleAdminApprove = async (r: CancellationRequest) => {
    if (!window.confirm(`Approve cancellation request for Order #${r.orderNumber || r.orderId} as Admin? This will move it to Super Admin approval stage.`)) {
      return;
    }
    const adminUser = {
      username: currentAdminUser?.userId || 'admin',
      name: currentAdminUser?.name || 'Administrator',
      role: currentAdminUser?.role || 'admin',
    };
    const res = await storageService.approveCancellationByAdmin(r.id, adminUser);
    if (res.success) {
      setActionNotice({ type: 'success', message: res.message });
      refreshRequests();
    } else {
      setActionNotice({ type: 'error', message: res.message });
    }
  };

  const handleSuperAdminApprove = async (r: CancellationRequest) => {
    if (!window.confirm(`FINAL CONFIRMATION: As Super Admin, execute final cancellation of Order #${r.orderNumber || r.orderId}? This will cancel the order, restore inventory stock, and initiate refund processing.`)) {
      return;
    }
    const superAdminUser = {
      username: currentAdminUser?.userId || 'kogniti14',
      name: currentAdminUser?.name || 'Super Admin',
      role: 'super_admin',
    };
    const res = await storageService.approveCancellationBySuperAdmin(r.id, superAdminUser);
    if (res.success) {
      setActionNotice({ type: 'success', message: res.message });
      refreshRequests();
    } else {
      setActionNotice({ type: 'error', message: res.message });
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingRequestId) return;
    if (!rejectionReasonText.trim() || rejectionReasonText.trim().length < 3) {
      alert('Please enter a valid rejection reason.');
      return;
    }
    const approver = {
      username: currentAdminUser?.userId || 'admin',
      name: currentAdminUser?.name || 'Administrator',
      role: isSuperAdmin ? 'super_admin' : 'admin',
    };
    const res = await storageService.rejectCancellation(rejectingRequestId, approver, rejectionReasonText.trim());
    setRejectingRequestId(null);
    setRejectionReasonText('');
    if (res.success) {
      setActionNotice({ type: 'success', message: res.message });
      refreshRequests();
    } else {
      setActionNotice({ type: 'error', message: res.message });
    }
  };

  const getStatusBadge = (status: CancellationRequest['status']) => {
    switch (status) {
      case 'pending_admin_approval':
        return { label: 'Pending Admin Approval', color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' };
      case 'pending_super_admin_approval':
        return { label: 'Pending Super Admin Approval', color: '#7C3AED', bg: '#EDE9FE', border: '#DDD6FE' };
      case 'approved':
        return { label: 'Approved & Processed', color: '#15803D', bg: '#DCFCE7', border: '#BBF7D0' };
      case 'rejected':
        return { label: 'Rejected', color: '#DC2626', bg: '#FEE2E2', border: '#FECACA' };
      case 'ineligible':
        return { label: 'Ineligible (>6h or Shipped)', color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1' };
      default:
        return { label: 'Submitted', color: '#0284C7', bg: '#E0F2FE', border: '#BAE6FD' };
    }
  };

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem' }}>
      {/* Title & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <RotateCcw size={20} className="text-amber-500" />
            <span>Order Cancellation Management (B2B & B2C)</span>
          </h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748B' }}>
            Dual-tier approval gate: Admin Review → Super Admin Final Execution (Enforcing 6-hour SLA & Unshipped Rule)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ padding: '0.35rem 0.75rem', background: '#FEF3C7', color: '#B45309', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
            Pending Admin: {requests.filter((r) => r.status === 'pending_admin_approval').length}
          </span>
          <span style={{ padding: '0.35rem 0.75rem', background: '#EDE9FE', color: '#6D28D9', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
            Pending Super Admin: {requests.filter((r) => r.status === 'pending_super_admin_approval').length}
          </span>
        </div>
      </div>

      {actionNotice && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: actionNotice.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            color: actionNotice.type === 'success' ? '#166534' : '#991B1B',
            border: `1px solid ${actionNotice.type === 'success' ? '#BBF7D0' : '#FCA5A5'}`,
          }}
        >
          {actionNotice.message}
        </div>
      )}

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search by Order ID, Customer name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', background: '#FFFFFF' }}
          >
            <option value="all">All Statuses ({requests.length})</option>
            <option value="pending_admin_approval">Pending Admin Approval</option>
            <option value="pending_super_admin_approval">Pending Super Admin Approval</option>
            <option value="approved">Approved & Processed</option>
            <option value="rejected">Rejected</option>
            <option value="ineligible">Ineligible</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', background: '#FFFFFF' }}
          >
            <option value="all">All Types</option>
            <option value="b2c">B2C Retail</option>
            <option value="b2b">B2B Wholesale</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B', fontSize: '0.9rem' }}>
          No cancellation requests match the active filters.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#334155' }}>Order ID & Type</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#334155' }}>Customer & Contact</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#334155' }}>Order Placed / Total</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#334155' }}>Cancellation Reason</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#334155' }}>Approval Status</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#334155', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => {
                const badge = getStatusBadge(req.status);
                const orderTime = new Date(req.orderCreatedAt).getTime();
                const elapsedHours = (Date.now() - orderTime) / (1000 * 60 * 60);
                const isUnder6h = elapsedHours <= 6;

                return (
                  <tr key={req.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <strong style={{ color: '#0F172A', display: 'block' }}>#{req.orderNumber}</strong>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          background: req.orderType === 'b2b' ? '#EFF6FF' : '#F1F5F9',
                          color: req.orderType === 'b2b' ? '#1D4ED8' : '#475569',
                          marginTop: '0.2rem',
                        }}
                      >
                        {req.orderType.toUpperCase()}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{req.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{req.customerEmail}</div>
                      {req.customerPhone && <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{req.customerPhone}</div>}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div>{new Date(req.orderCreatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      <strong style={{ color: '#0F172A', display: 'block', marginTop: '0.2rem' }}>
                        ₹{req.orderTotal.toLocaleString('en-IN')}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: isUnder6h ? '#15803D' : '#DC2626', fontWeight: 600 }}>
                        {isUnder6h ? `≤ 6h SLA (${(6 - elapsedHours).toFixed(1)}h left)` : '> 6h SLA Expired'}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', maxWidth: '200px' }}>
                      <strong style={{ color: '#0F172A', display: 'block' }}>{req.cancellationReason}</strong>
                      {req.additionalExplanation && (
                        <div style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {req.additionalExplanation}
                        </div>
                      )}
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                        Req: {new Date(req.requestedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {badge.label}
                      </span>
                      {req.adminApproval && (
                        <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.25rem' }}>
                          Admin: {req.adminApproval.approvedBy} ({req.adminApproval.action})
                        </div>
                      )}
                      {req.superAdminApproval && (
                        <div style={{ fontSize: '0.7rem', color: '#475569' }}>
                          Super: {req.superAdminApproval.approvedBy} ({req.superAdminApproval.action})
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedRequestForDetail(req)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#334155',
                          }}
                          title="View Order Details & History"
                        >
                          View
                        </button>

                        {/* Admin Approval Button (Stage 1) */}
                        {req.status === 'pending_admin_approval' && (
                          <button
                            type="button"
                            onClick={() => handleAdminApprove(req)}
                            style={{
                              padding: '0.35rem 0.65rem',
                              background: '#D97706',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            Approve (Admin)
                          </button>
                        )}

                        {/* Super Admin Approval Button (Stage 2) */}
                        {req.status === 'pending_super_admin_approval' && isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => handleSuperAdminApprove(req)}
                            style={{
                              padding: '0.35rem 0.65rem',
                              background: '#15803D',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            👑 Super Approve
                          </button>
                        )}

                        {/* Reject Button (Allowed on pending states) */}
                        {(req.status === 'pending_admin_approval' || req.status === 'pending_super_admin_approval') && (
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingRequestId(req.id);
                              setRejectionReasonText('');
                            }}
                            style={{
                              padding: '0.35rem 0.65rem',
                              background: '#FEF2F2',
                              color: '#DC2626',
                              border: '1px solid #FECACA',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequestForDetail && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '1.75rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                Cancellation Request Detail
              </h3>
              <button
                onClick={() => setSelectedRequestForDetail(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div><strong>Order Reference:</strong> #{selectedRequestForDetail.orderNumber} ({selectedRequestForDetail.orderType.toUpperCase()})</div>
              <div><strong>Customer Name:</strong> {selectedRequestForDetail.customerName}</div>
              <div><strong>Customer Email:</strong> {selectedRequestForDetail.customerEmail}</div>
              <div><strong>Order Total:</strong> ₹{selectedRequestForDetail.orderTotal.toLocaleString('en-IN')}</div>
              <div><strong>Order Placed:</strong> {new Date(selectedRequestForDetail.orderCreatedAt).toLocaleString('en-IN')}</div>
              <div><strong>Cancellation Reason:</strong> {selectedRequestForDetail.cancellationReason}</div>
              {selectedRequestForDetail.additionalExplanation && (
                <div><strong>Written Explanation:</strong> {selectedRequestForDetail.additionalExplanation}</div>
              )}
              <div><strong>Request Timestamp:</strong> {new Date(selectedRequestForDetail.requestedAt).toLocaleString('en-IN')}</div>
              <div><strong>Current Status:</strong> {selectedRequestForDetail.status}</div>

              {selectedRequestForDetail.adminApproval && (
                <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <strong>Admin Action:</strong> {selectedRequestForDetail.adminApproval.action.toUpperCase()} by {selectedRequestForDetail.adminApproval.approvedBy} at {new Date(selectedRequestForDetail.adminApproval.approvedAt).toLocaleString('en-IN')}
                </div>
              )}

              {selectedRequestForDetail.superAdminApproval && (
                <div style={{ padding: '0.75rem', background: '#EDE9FE', borderRadius: '8px', border: '1px solid #DDD6FE' }}>
                  <strong>Super Admin Action:</strong> {selectedRequestForDetail.superAdminApproval.action.toUpperCase()} by {selectedRequestForDetail.superAdminApproval.approvedBy} at {new Date(selectedRequestForDetail.superAdminApproval.approvedAt).toLocaleString('en-IN')}
                </div>
              )}

              {selectedRequestForDetail.rejectionReason && (
                <div style={{ padding: '0.75rem', background: '#FEF2F2', color: '#991B1B', borderRadius: '8px', border: '1px solid #FECACA' }}>
                  <strong>Rejection Notice:</strong> {selectedRequestForDetail.rejectionReason}
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedRequestForDetail(null)}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', background: '#0F172A', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingRequestId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '1.75rem',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#DC2626', marginBottom: '0.5rem' }}>
              Reject Cancellation Request
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
              A mandatory rejection reason is required and will be recorded in the order audit log and shown to the customer.
            </p>

            <textarea
              rows={4}
              required
              placeholder="e.g. Order is already packed and dispatched on pallet; 6-hour policy elapsed..."
              value={rejectionReasonText}
              onChange={(e) => setRejectionReasonText(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', marginBottom: '1rem' }}
            />

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setRejectingRequestId(null)}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#F1F5F9', border: '1px solid #CBD5E1', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', background: '#DC2626', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
