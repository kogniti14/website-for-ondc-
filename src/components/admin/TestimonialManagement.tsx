import React, { useState, useEffect } from 'react';
import {
  Star,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  X,
  User,
  Building,
  Quote,
  MessageSquare,
} from 'lucide-react';
import { Testimonial, TestimonialStatus } from '../../types';
import { testimonialService } from '../../services/testimonialService';
import { dataSyncBus } from '../../services/dataSyncBus';

export const TestimonialManagement: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() =>
    testimonialService.getAllTestimonials()
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [status, setStatus] = useState<TestimonialStatus>('published');
  const [isFeatured, setIsFeatured] = useState(true);

  // Refresh on sync
  useEffect(() => {
    const unsub = dataSyncBus.subscribe('testimonials', (updated: Testimonial[]) => {
      if (Array.isArray(updated)) {
        setTestimonials(updated);
      }
    });
    return unsub;
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setRole('');
    setCompany('');
    setText('');
    setRating(5);
    setAvatarUrl('');
    setStatus('published');
    setIsFeatured(true);
    setModalOpen(true);
  };

  const openEditModal = (item: Testimonial) => {
    setEditingItem(item);
    setName(item.name);
    setRole(item.role || item.designation || '');
    setCompany(item.company || item.organization || '');
    setText(item.text);
    setRating(item.rating || 5);
    setAvatarUrl(item.avatarUrl || item.imageUrl || '');
    setStatus(item.status);
    setIsFeatured(item.isFeatured ?? true);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Customer name and testimonial quote are required.' });
      return;
    }

    setIsSaving(true);
    try {
      await testimonialService.saveTestimonial({
        id: editingItem?.id,
        name: name.trim(),
        role: role.trim(),
        designation: role.trim(),
        company: company.trim(),
        organization: company.trim(),
        text: text.trim(),
        rating,
        avatarUrl: avatarUrl.trim(),
        status,
        isFeatured,
      });

      setTestimonials(testimonialService.getAllTestimonials());
      setModalOpen(false);
      setFeedbackMsg({
        type: 'success',
        text: editingItem ? 'Testimonial updated successfully.' : 'New testimonial added successfully.',
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Failed to save testimonial.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await testimonialService.deleteTestimonial(id);
      setTestimonials(testimonialService.getAllTestimonials());
      setDeleteConfirmId(null);
      setFeedbackMsg({ type: 'success', text: 'Testimonial deleted successfully.' });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Failed to delete testimonial.' });
    }
  };

  const handleToggleStatus = async (item: Testimonial) => {
    const nextStatus: TestimonialStatus = item.status === 'published' ? 'draft' : 'published';
    await testimonialService.saveTestimonial({
      ...item,
      status: nextStatus,
    });
    setTestimonials(testimonialService.getAllTestimonials());
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= testimonials.length) return;

    const list = [...testimonials];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    await testimonialService.reorderTestimonials(list);
    setTestimonials(list);
  };

  const filtered = testimonials.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  return (
    <div style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={22} className="text-amber-500" /> Client Trust Testimonials CMS
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
            Manage client testimonials displayed in the automatic carousel on the Homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input"
            style={{ width: 'auto', fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
          >
            <option value="all">All Statuses ({testimonials.length})</option>
            <option value="published">Published ({testimonials.filter((t) => t.status === 'published').length})</option>
            <option value="draft">Drafts ({testimonials.filter((t) => t.status === 'draft').length})</option>
            <option value="archived">Archived ({testimonials.filter((t) => t.status === 'archived').length})</option>
          </select>

          <button onClick={openAddModal} className="btn btn-primary btn-sm" style={{ gap: '0.4rem', borderRadius: '8px' }}>
            <Plus size={16} /> Add Testimonial
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`alert ${feedbackMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}
          style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* Testimonials Table */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '0.75rem 1rem', width: '50px' }}>Order</th>
              <th style={{ padding: '0.75rem 1rem' }}>Client / Customer</th>
              <th style={{ padding: '0.75rem 1rem' }}>Organization</th>
              <th style={{ padding: '0.75rem 1rem', width: '90px' }}>Rating</th>
              <th style={{ padding: '0.75rem 1rem' }}>Testimonial Quote</th>
              <th style={{ padding: '0.75rem 1rem', width: '100px' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', width: '130px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--slate-400)' }}>
                  No testimonials found for the selected filter.
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: idx === 0 ? 'not-allowed' : 'pointer',
                          color: idx === 0 ? 'var(--slate-300)' : 'var(--slate-600)',
                          padding: '2px',
                        }}
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === filtered.length - 1}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: idx === filtered.length - 1 ? 'not-allowed' : 'pointer',
                          color: idx === filtered.length - 1 ? 'var(--slate-300)' : 'var(--slate-600)',
                          padding: '2px',
                        }}
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div className="flex items-center gap-2.5">
                      {item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt={item.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                          }}
                        >
                          {item.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{item.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>{item.role || item.designation || 'Verified Client'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--slate-700)' }}>
                    {item.company || item.organization || '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} size={13} fill="#D97706" color="#D97706" />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', maxWidth: '300px' }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.82rem',
                        color: 'var(--slate-600)',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                      title={item.text}
                    >
                      "{item.text}"
                    </p>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`badge ${item.status === 'published' ? 'badge-green' : 'badge-slate'}`}
                      style={{ border: 'none', cursor: 'pointer', fontSize: '0.72rem' }}
                      title="Click to toggle status"
                    >
                      {item.status === 'published' ? '✓ Published' : 'Draft'}
                    </button>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="btn btn-outline btn-xs"
                        style={{ padding: '0.3rem 0.5rem', borderRadius: '4px' }}
                        title="Edit Testimonial"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="btn btn-outline btn-xs text-rose-600"
                        style={{ padding: '0.3rem 0.5rem', borderRadius: '4px', borderColor: 'var(--rose-200)' }}
                        title="Delete Testimonial"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="card"
            style={{
              background: '#FFFFFF',
              width: '100%',
              maxWidth: '560px',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18)',
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--slate-900)' }}>
                {editingItem ? 'Edit Client Testimonial' : 'Add New Client Testimonial'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Role / Designation
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Head of Procurement"
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. EduTech Solutions Pvt Ltd"
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Rating (1 - 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                    >
                      <Star
                        size={22}
                        fill={s <= rating ? '#D97706' : 'none'}
                        color={s <= rating ? '#D97706' : '#CBD5E1'}
                      />
                    </button>
                  ))}
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#D97706', marginLeft: '0.5rem' }}>
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Testimonial Quote Text *
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  placeholder="Share the customer's genuine experience with Kogniti Minds agro-paper..."
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Avatar / Profile Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://... (Leave empty to use automatic initial badge)"
                  className="form-input"
                />
              </div>

              <div className="flex items-center justify-between" style={{ marginTop: '0.5rem' }}>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={status === 'published'}
                      onChange={(e) => setStatus(e.target.checked ? 'published' : 'draft')}
                    />
                    <span>Publish Immediately</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn btn-outline btn-sm"
                    style={{ borderRadius: '8px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: '8px' }}
                  >
                    {isSaving ? 'Saving...' : editingItem ? 'Update Testimonial' : 'Add Testimonial'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              background: '#FFFFFF',
              width: '100%',
              maxWidth: '420px',
              borderRadius: '16px',
              padding: '1.75rem',
              textAlign: 'center',
            }}
          >
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--slate-900)' }}>
              Confirm Testimonial Deletion
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
              Are you sure you want to permanently delete this testimonial from the homepage carousel?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '8px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="btn btn-primary btn-sm"
                style={{ background: 'var(--rose-600)', borderColor: 'var(--rose-600)', borderRadius: '8px' }}
              >
                Delete Testimonial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
