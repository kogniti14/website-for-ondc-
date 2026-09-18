import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  RotateCcw,
  Truck,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Building2,
  Mail,
  History,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { policyNotificationService, POLICY_NAMES } from '../../services/policyNotificationService';
import { storageService } from '../../services/storageService';
import { PolicyUpdateRecord } from '../../types';

export const PolicyManagement: React.FC = () => {
  const [records, setRecords] = useState<PolicyUpdateRecord[]>(() => policyNotificationService.getUpdateRecords());
  const [versions, setVersions] = useState(() => policyNotificationService.getCurrentVersions());

  // Form State
  const [selectedPolicy, setSelectedPolicy] = useState<'terms' | 'privacy' | 'refund' | 'shipping'>('refund');
  const [newVersion, setNewVersion] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // Status & Feedback
  const [actionLoading, setActionLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Test Email State
  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Registered Audience Counts
  const b2cCount = storageService.getB2CUsers().length;
  const b2bCount = storageService.getB2BBusinesses().length;
  const totalAudience = policyNotificationService.getAllRegisteredCustomerEmails().length;

  // Auto-fill suggested version when policy changes
  useEffect(() => {
    const current = versions[selectedPolicy] || '1.0.0';
    const parts = current.split('.');
    if (parts.length === 3 && !isNaN(Number(parts[2]))) {
      setNewVersion(`${parts[0]}.${parts[1]}.${Number(parts[2]) + 1}`);
    } else {
      setNewVersion('1.1.0');
    }
  }, [selectedPolicy, versions]);

  const refreshData = () => {
    setRecords(policyNotificationService.getUpdateRecords());
    setVersions(policyNotificationService.getCurrentVersions());
  };

  const handlePublishUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultMsg(null);

    if (!newVersion.trim()) {
      setResultMsg({ type: 'error', text: 'Please specify the new version number.' });
      return;
    }

    if (!changeSummary.trim()) {
      setResultMsg({ type: 'error', text: 'Please provide a clear summary of the changes made to the policy.' });
      return;
    }

    setActionLoading(true);
    try {
      const res = await policyNotificationService.publishPolicyUpdate({
        policyId: selectedPolicy,
        newVersion: newVersion.trim(),
        changeSummary: changeSummary.trim(),
        isPublished,
      });

      refreshData();
      if (res.success) {
        setResultMsg({
          type: 'success',
          text: res.message,
        });
        setChangeSummary('');
      } else {
        setResultMsg({
          type: 'info',
          text: res.message,
        });
      }
    } catch (err: any) {
      setResultMsg({
        type: 'error',
        text: err.message || 'An error occurred while publishing the policy update.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestResult(null);

    if (!testEmail.trim() || !testEmail.includes('@')) {
      setTestResult({ type: 'error', text: 'Please enter a valid recipient email address for testing.' });
      return;
    }

    setTestLoading(true);
    try {
      const res = await policyNotificationService.sendTestNotification(
        selectedPolicy,
        testEmail.trim(),
        changeSummary.trim() || undefined
      );

      if (res.success) {
        setTestResult({ type: 'success', text: res.message });
      } else {
        setTestResult({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setTestResult({ type: 'error', text: err.message || 'Failed to dispatch test email.' });
    } finally {
      setTestLoading(false);
    }
  };

  const getPolicyIcon = (policyId: string) => {
    switch (policyId) {
      case 'terms':
        return <FileText size={18} className="text-blue-500" />;
      case 'privacy':
        return <ShieldCheck size={18} className="text-emerald-500" />;
      case 'refund':
        return <RotateCcw size={18} className="text-purple-500" />;
      case 'shipping':
        return <Truck size={18} className="text-amber-500" />;
      default:
        return <FileText size={18} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Header Overview Cards */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Notification Audience
            </span>
            <Users size={20} className="text-emerald-600" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>
            {totalAudience}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
            {b2cCount} B2C Customers | {b2bCount} B2B Businesses
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Active Policy Versions
            </span>
            <Sparkles size={20} className="text-blue-600" />
          </div>
          <div style={{ fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
            <div><strong>Terms:</strong> v{versions.terms}</div>
            <div><strong>Privacy:</strong> v{versions.privacy}</div>
            <div><strong>Refund:</strong> v{versions.refund}</div>
            <div><strong>Shipping:</strong> v{versions.shipping}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Statutory Protection
            </span>
            <ShieldCheck size={20} className="text-purple-600" />
          </div>
          <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
            Single Mandatory Checkbox
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
            ✓ Enforced on B2C & B2B Signup
          </div>
        </div>
      </div>

      {/* 2. Publish Policy Update Form */}
      <div
        className="card"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={20} className="text-emerald-600" />
            Publish Policy Update & Dispatch Customer Notification
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '4px' }}>
            Whenever you publish an update to any of the 4 statutory policies, this system will log the version audit record and automatically send an email notification to all registered B2C customers and B2B enterprises.
          </p>
        </div>

        {resultMsg && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.85rem',
              background:
                resultMsg.type === 'success' ? '#F0FDF4' : resultMsg.type === 'error' ? '#FEF2F2' : '#EFF6FF',
              border:
                resultMsg.type === 'success' ? '1px solid #BBF7D0' : resultMsg.type === 'error' ? '1px solid #FECACA' : '1px solid #BFDBFE',
              color:
                resultMsg.type === 'success' ? '#166534' : resultMsg.type === 'error' ? '#991B1B' : '#1E40AF',
            }}
          >
            {resultMsg.type === 'success' && <CheckCircle2 size={18} className="text-emerald-600" />}
            {resultMsg.type === 'error' && <AlertTriangle size={18} className="text-rose-600" />}
            <span>{resultMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePublishUpdate}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Select Policy *</label>
              <select
                value={selectedPolicy}
                onChange={(e) => setSelectedPolicy(e.target.value as any)}
                className="form-select"
                style={{ height: '42px' }}
              >
                <option value="terms">Terms & Conditions (Current: v{versions.terms})</option>
                <option value="privacy">Privacy Policy (Current: v{versions.privacy})</option>
                <option value="refund">Refund & Return Policy (Current: v{versions.refund})</option>
                <option value="shipping">Shipping & Logistics Policy (Current: v{versions.shipping})</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">New Published Version *</label>
              <input
                type="text"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                placeholder="e.g. 1.1.0 or 2.0.0"
                className="form-input"
                style={{ height: '42px' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Brief Summary of Changes (Will be included in the email) *</label>
            <textarea
              rows={3}
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="e.g. Updated Part A strict 2-calendar-day claim period, continuous unboxing video evidence requirements, and B2B bulk freight unloading responsibilities."
              className="form-input"
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <input
              type="checkbox"
              id="is-published-check"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
            />
            <label htmlFor="is-published-check" style={{ fontSize: '0.86rem', color: '#0F172A', cursor: 'pointer', fontWeight: 600 }}>
              Officially Publish & Broadcast Email Notification to all {totalAudience} Registered Customers
            </label>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="submit"
              disabled={actionLoading}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Send size={16} />
              {actionLoading ? 'Publishing & Dispatching...' : 'Publish Update & Notify Customers'}
            </button>

            <a
              href={`#${selectedPolicy}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ExternalLink size={14} /> Preview Live {POLICY_NAMES[selectedPolicy]} Page
            </a>
          </div>
        </form>

        {/* Test Email Dispatch Section */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.5rem' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={16} className="text-amber-500" /> Send Single Test Notification Email
          </h4>
          <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '0.75rem' }}>
            Test what the customer notification email looks like without broadcasting to all registered accounts.
          </p>

          <form onSubmit={handleSendTestEmail} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="email"
              placeholder="recipient@test.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="form-input"
              style={{ maxWidth: '320px', height: '38px', fontSize: '0.84rem' }}
              required
            />
            <button
              type="submit"
              disabled={testLoading}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {testLoading ? 'Sending Test...' : 'Send Test Email'}
            </button>
          </form>

          {testResult && (
            <div
              style={{
                marginTop: '0.75rem',
                fontSize: '0.8rem',
                color: testResult.type === 'success' ? '#059669' : '#DC2626',
                fontWeight: 600,
              }}
            >
              {testResult.text}
            </div>
          )}
        </div>
      </div>

      {/* 3. Version History & Audit Log */}
      <div
        className="card"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} className="text-blue-600" />
            Policy Update & Notification History
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '4px' }}>
            Permanent record of policy versions, change summaries, publication timestamps, and notification delivery statuses.
          </p>
        </div>

        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B', fontSize: '0.88rem' }}>
            No policy updates recorded yet. Baseline versions (v1.0.0) are currently active.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '0.75rem' }}>Policy Name</th>
                  <th style={{ padding: '0.75rem' }}>Version</th>
                  <th style={{ padding: '0.75rem' }}>Date & Time</th>
                  <th style={{ padding: '0.75rem' }}>Summary of Changes</th>
                  <th style={{ padding: '0.75rem' }}>Notification Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getPolicyIcon(rec.policyId)}
                      {rec.policyName}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span style={{ color: '#64748B' }}>v{rec.previousVersion}</span>
                      <span style={{ margin: '0 4px', color: '#94A3B8' }}>&rarr;</span>
                      <span style={{ fontWeight: 700, color: '#059669' }}>v{rec.newVersion}</span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {new Date(rec.updatedAt).toLocaleString('en-GB')}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#334155', maxWidth: '320px', lineHeight: 1.5 }}>
                      {rec.changeSummary}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: rec.notificationStatus === 'sent' ? '#ECFDF5' : '#FEF2F2',
                          color: rec.notificationStatus === 'sent' ? '#065F46' : '#991B1B',
                          border: rec.notificationStatus === 'sent' ? '1px solid #A7F3D0' : '1px solid #FECACA',
                        }}
                      >
                        {rec.notificationStatus === 'sent' && <CheckCircle2 size={12} />}
                        {rec.notificationStatus === 'sent'
                          ? `Sent (${rec.recipientsCount} recipients)`
                          : rec.notificationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
