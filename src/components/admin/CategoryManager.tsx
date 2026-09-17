import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Layers,
  Search,
  Lock,
  X,
  RefreshCw,
  Award,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GalleryCategory, CertificationCategory } from '../../types';
import { galleryService } from '../../services/galleryService';
import { certificationService } from '../../services/certificationService';

interface CategoryManagerProps {
  type: 'gallery' | 'certification';
  onCategoryChanged?: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  type,
  onCategoryChanged,
}) => {
  const { currentAdminUser, isSuperAdmin } = useAuth();
  const currentUserRole = currentAdminUser?.role || (isSuperAdmin ? 'super_admin' : 'admin');

  // Categories list
  const [categories, setCategories] = useState<Array<GalleryCategory | CertificationCategory>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<GalleryCategory | CertificationCategory | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);

  // Delete / Migration Modal State
  const [deleteTarget, setDeleteTarget] = useState<GalleryCategory | CertificationCategory | null>(null);
  const [deleteContentCount, setDeleteContentCount] = useState(0);
  const [targetReplacementCategory, setTargetReplacementCategory] = useState('');
  const [confirmMigration, setConfirmMigration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Categories
  const loadCategories = () => {
    if (type === 'gallery') {
      const list = galleryService.getCategories();
      setCategories(list);
    } else {
      const list = certificationService.getCategories();
      setCategories(list);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [type]);

  // Helper to count linked items
  const getItemCount = (catName: string): number => {
    if (type === 'gallery') {
      return galleryService.getStoryCountForCategory(catName);
    } else {
      return certificationService.getCertificateCountForCategory(catName);
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    if (!isSuperAdmin) {
      showToast('error', 'Only Super Admin has permission to add categories.');
      return;
    }
    setEditingCat(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormDisplayOrder(categories.length + 1);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (cat: GalleryCategory | CertificationCategory) => {
    if (!isSuperAdmin) {
      showToast('error', 'Only Super Admin has permission to edit categories.');
      return;
    }
    setEditingCat(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || '');
    setFormDisplayOrder(cat.displayOrder);
    setFormIsActive(cat.isActive !== false);
    setIsModalOpen(true);
  };

  // Submit Add / Edit Form
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      showToast('error', 'Unauthorized action.');
      return;
    }

    if (!formName.trim()) {
      showToast('error', 'Category name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCat) {
        // Update
        if (type === 'gallery') {
          const res = galleryService.updateCategory(
            editingCat.id,
            {
              name: formName.trim(),
              slug: formSlug.trim() || undefined,
              description: formDescription.trim(),
              displayOrder: Number(formDisplayOrder),
              isActive: formIsActive,
            },
            currentUserRole
          );
          if (res.success) {
            showToast('success', res.message);
            setIsModalOpen(false);
            loadCategories();
            onCategoryChanged?.();
          } else {
            showToast('error', res.message);
          }
        } else {
          const res = await certificationService.updateCategory(
            editingCat.id,
            {
              name: formName.trim(),
              slug: formSlug.trim() || undefined,
              description: formDescription.trim(),
              displayOrder: Number(formDisplayOrder),
              isActive: formIsActive,
            },
            currentUserRole
          );
          if (res.success) {
            showToast('success', res.message);
            setIsModalOpen(false);
            loadCategories();
            onCategoryChanged?.();
          } else {
            showToast('error', res.message);
          }
        }
      } else {
        // Create
        if (type === 'gallery') {
          const res = galleryService.createCategory(
            {
              name: formName.trim(),
              slug: formSlug.trim() || undefined,
              description: formDescription.trim(),
              displayOrder: Number(formDisplayOrder),
              isActive: formIsActive,
            },
            currentUserRole
          );
          if (res.success) {
            showToast('success', res.message);
            setIsModalOpen(false);
            loadCategories();
            onCategoryChanged?.();
          } else {
            showToast('error', res.message);
          }
        } else {
          const res = await certificationService.createCategory(
            {
              name: formName.trim(),
              slug: formSlug.trim() || undefined,
              description: formDescription.trim(),
              displayOrder: Number(formDisplayOrder),
              isActive: formIsActive,
            },
            currentUserRole
          );
          if (res.success) {
            showToast('success', res.message);
            setIsModalOpen(false);
            loadCategories();
            onCategoryChanged?.();
          } else {
            showToast('error', res.message);
          }
        }
      }
    } catch (err: any) {
      showToast('error', err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Status (Activate / Deactivate)
  const handleToggleStatus = async (cat: GalleryCategory | CertificationCategory) => {
    if (!isSuperAdmin) {
      showToast('error', 'Only Super Admin can change category active status.');
      return;
    }

    if (type === 'gallery') {
      const res = galleryService.toggleCategoryStatus(cat.id, currentUserRole);
      if (res.success) {
        showToast('success', res.message);
        loadCategories();
        onCategoryChanged?.();
      } else {
        showToast('error', res.message);
      }
    } else {
      const res = await certificationService.toggleCategoryStatus(cat.id, currentUserRole);
      if (res.success) {
        showToast('success', res.message);
        loadCategories();
        onCategoryChanged?.();
      } else {
        showToast('error', res.message);
      }
    }
  };

  // Reorder Categories (Move Up / Down)
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (!isSuperAdmin) {
      showToast('error', 'Only Super Admin can reorder categories.');
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newArr = [...categories];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    const orderedIds = newArr.map((c) => c.id);

    if (type === 'gallery') {
      const res = galleryService.reorderCategories(orderedIds, currentUserRole);
      if (res.success) {
        loadCategories();
        onCategoryChanged?.();
      }
    } else {
      const res = await certificationService.reorderCategories(orderedIds, currentUserRole);
      if (res.success) {
        loadCategories();
        onCategoryChanged?.();
      }
    }
  };

  // Initiate Delete Check
  const handleDeleteClick = (cat: GalleryCategory | CertificationCategory) => {
    if (!isSuperAdmin) {
      showToast('error', 'Only Super Admin can delete categories.');
      return;
    }

    const count = getItemCount(cat.name);
    setDeleteTarget(cat);
    setDeleteContentCount(count);
    setConfirmMigration(false);

    // Pick first available replacement category
    const remainingActive = categories.filter(
      (c) => c.id !== cat.id && c.isActive !== false
    );
    setTargetReplacementCategory(remainingActive[0]?.name || '');
  };

  // Execute Delete or Migration
  const handleConfirmDeleteOrMigrate = async () => {
    if (!isSuperAdmin || !deleteTarget) return;

    setIsSubmitting(true);
    try {
      if (deleteContentCount === 0) {
        // Direct Delete
        if (type === 'gallery') {
          const res = galleryService.deleteCategory(deleteTarget.id, currentUserRole);
          if (res.success) {
            showToast('success', res.message);
            setDeleteTarget(null);
            loadCategories();
            onCategoryChanged?.();
          } else {
            showToast('error', res.message);
          }
        } else {
          const res = await certificationService.deleteCategory(deleteTarget.id, currentUserRole);
          if (res.success) {
            showToast('success', res.message);
            setDeleteTarget(null);
            loadCategories();
            onCategoryChanged?.();
          } else {
            showToast('error', res.message);
          }
        }
      } else {
        // Migration Required
        if (!targetReplacementCategory.trim()) {
          showToast('error', 'Please select a replacement destination category.');
          setIsSubmitting(false);
          return;
        }

        if (type === 'gallery') {
          const res = galleryService.migrateCategoryContentAndDelete(
            deleteTarget.id,
            targetReplacementCategory,
            currentUserRole
          );
          if (res.success) {
            showToast('success', res.message);
            setDeleteTarget(null);
            loadCategories();
            onCategoryChanged?.();
          } else {
            showToast('error', res.message);
          }
        } else {
          const res = await certificationService.migrateCategoryContentAndDelete(
            deleteTarget.id,
            targetReplacementCategory,
            currentUserRole
          );
          if (res.success) {
            showToast('success', res.message);
            setDeleteTarget(null);
            loadCategories();
            onCategoryChanged?.();
          } else {
            showToast('error', res.message);
          }
        }
      }
    } catch (err: any) {
      showToast('error', err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q));
  });

  const activeCount = categories.filter((c) => c.isActive !== false).length;
  const inactiveCount = categories.filter((c) => c.isActive === false).length;
  const totalLinkedItems = categories.reduce((sum, c) => sum + getItemCount(c.name), 0);

  const titleText =
    type === 'gallery'
      ? 'Success Stories & Image Gallery Category Governance'
      : 'Company Certifications & Official Document Category Governance';

  const itemNoun = type === 'gallery' ? 'Story' : 'Certificate';
  const itemsNoun = type === 'gallery' ? 'Stories' : 'Certificates';

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 9999,
            backgroundColor: toast.type === 'success' ? '#065F46' : '#991B1B',
            color: '#FFFFFF',
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {toast.text}
        </div>
      )}

      {/* Super Admin Status Banner */}
      {!isSuperAdmin ? (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FCD34D',
            borderRadius: '12px',
            color: '#92400E',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <Lock size={20} style={{ color: '#D97706', flexShrink: 0 }} />
          <div>
            <strong>Super Admin Permission Required:</strong> You are viewing categories in Read-Only mode.
            Only the Super Admin is authorized to add, edit, reorder, activate/deactivate, or delete categories.
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: '#ECFDF5',
            border: '1px solid #6EE7B7',
            borderRadius: '12px',
            color: '#065F46',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.86rem',
            fontWeight: 600,
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1rem' }}>👑</span>
            <span>Super Admin Category Management Mode: You have full administrative governance over categories.</span>
          </div>
          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: '#D1FAE5', color: '#047857', fontWeight: 800 }}>
            PROTECTED
          </span>
        </div>
      )}

      {/* Header & Metrics */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '1.75rem',
          boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
          marginBottom: '1.5rem',
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.5rem' }}>
          <div>
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: type === 'gallery' ? '#ECFDF5' : '#CCFBF1',
                  color: type === 'gallery' ? '#059669' : '#0F766E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {type === 'gallery' ? <Sparkles size={20} /> : <Award size={20} />}
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {titleText}
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
              Add, edit, deactivate, or reorder categories. Existing content in categories is protected from accidental deletion.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadCategories}
              className="btn btn-outline btn-sm"
              title="Refresh categories"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="btn btn-primary btn-sm"
                style={{ fontWeight: 700 }}
              >
                <Plus size={16} /> + Create New Category
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Categories
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.2rem' }}>
              {categories.length}
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#ECFDF5', borderRadius: '10px', border: '1px solid #6EE7B7' }}>
            <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>
              Active (Available for Uploads)
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#065F46', marginTop: '0.2rem' }}>
              {activeCount}
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#FEF3C7', borderRadius: '10px', border: '1px solid #FCD34D' }}>
            <span style={{ fontSize: '0.74rem', color: '#B45309', fontWeight: 700, textTransform: 'uppercase' }}>
              Inactive (Hidden from Uploads)
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#92400E', marginTop: '0.2rem' }}>
              {inactiveCount}
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#EFF6FF', borderRadius: '10px', border: '1px solid #93C5FD' }}>
            <span style={{ fontSize: '0.74rem', color: '#1E40AF', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Linked {itemsNoun}
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1E3A8A', marginTop: '0.2rem' }}>
              {totalLinkedItems}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Directory Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '1.5rem',
          boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
        }}
      >
        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap" style={{ marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '400px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              placeholder="Search category name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
            />
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
            Showing <strong>{filteredCategories.length}</strong> of {categories.length} categories
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-color)', color: 'var(--slate-600)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.85rem 1rem', width: '110px' }}>Order</th>
                <th style={{ padding: '0.85rem 1rem' }}>Category Name & Slug</th>
                <th style={{ padding: '0.85rem 1rem' }}>Description</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center', width: '130px' }}>Linked Content</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center', width: '110px' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right', width: '190px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-400)' }}>
                    No categories found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat, idx) => {
                  const itemCount = getItemCount(cat.name);
                  const isActive = cat.isActive !== false;

                  return (
                    <tr
                      key={cat.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: !isActive ? '#FAFAFA' : '#FFFFFF',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      {/* Display Order & Reorder Arrows */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <div className="flex items-center gap-1.5">
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              padding: '0.15rem 0.4rem',
                              borderRadius: '4px',
                              backgroundColor: '#F1F5F9',
                              color: 'var(--slate-700)',
                            }}
                          >
                            #{cat.displayOrder}
                          </span>
                          {isSuperAdmin && (
                            <div className="flex flex-col" style={{ gap: '2px' }}>
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(idx, 'up')}
                                disabled={idx === 0}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                  padding: 0,
                                  color: idx === 0 ? '#CBD5E1' : '#475569',
                                }}
                                title="Move up"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(idx, 'down')}
                                disabled={idx === categories.length - 1}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: idx === categories.length - 1 ? 'not-allowed' : 'pointer',
                                  padding: 0,
                                  color: idx === categories.length - 1 ? '#CBD5E1' : '#475569',
                                }}
                                title="Move down"
                              >
                                <ArrowDown size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name & Slug */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.92rem' }}>
                          {cat.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)', fontFamily: 'monospace', marginTop: '2px' }}>
                          /{cat.slug}
                        </div>
                      </td>

                      {/* Description */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', color: 'var(--slate-600)', fontSize: '0.82rem' }}>
                        {cat.description || <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>No description</span>}
                      </td>

                      {/* Linked Content */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '999px',
                            backgroundColor: itemCount > 0 ? '#EFF6FF' : '#F1F5F9',
                            color: itemCount > 0 ? '#1E40AF' : '#64748B',
                          }}
                        >
                          {itemCount} {itemCount === 1 ? itemNoun : itemsNoun}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        {isActive ? (
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              backgroundColor: '#ECFDF5',
                              color: '#047857',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <CheckCircle2 size={12} /> Active
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              backgroundColor: '#FEF3C7',
                              color: '#92400E',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <XCircle size={12} /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        {isSuperAdmin ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Activate / Deactivate Toggle Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(cat)}
                              className="btn btn-outline btn-sm"
                              style={{
                                padding: '0.35rem 0.6rem',
                                fontSize: '0.75rem',
                                color: isActive ? '#D97706' : '#059669',
                                borderColor: isActive ? '#FCD34D' : '#6EE7B7',
                              }}
                              title={isActive ? 'Deactivate Category (Hide from new uploads)' : 'Activate Category (Enable for uploads)'}
                            >
                              {isActive ? 'Deactivate' : 'Activate'}
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(cat)}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0.35rem 0.55rem' }}
                              title="Edit Category Details"
                            >
                              <Edit2 size={13} />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(cat)}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0.35rem 0.55rem', color: '#DC2626', borderColor: '#FCA5A5' }}
                              title="Delete Category"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontStyle: 'italic' }}>
                            Read Only
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '520px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {editingCat ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  {type === 'gallery' ? 'Gallery & Success Stories Classification' : 'Official Accreditations Classification'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', padding: '0.35rem' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveForm}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  Category Name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Environmental Accreditations"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  URL Slug (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. environmental-accreditations"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  Display Order Priority
                </label>
                <input
                  type="number"
                  min={1}
                  value={formDisplayOrder}
                  onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the classification standards or scope."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ marginBottom: '1.5rem', backgroundColor: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                  />
                  <span>Category is Active (Available for new content uploads)</span>
                </label>
                <p style={{ fontSize: '0.74rem', color: 'var(--slate-500)', margin: '0.25rem 0 0 1.5rem' }}>
                  If unchecked, this category will be hidden from upload dropdowns, while existing items remain safely linked.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmitting}
                  style={{ fontWeight: 700 }}
                >
                  {isSubmitting ? 'Saving...' : editingCat ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE / CONTENT MIGRATION MODAL --- */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '480px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            {deleteContentCount === 0 ? (
              // Empty category -> Direct Delete
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}
                >
                  <Trash2 size={24} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Delete Empty Category?
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', margin: '0.5rem 0 1.5rem', lineHeight: '1.4' }}>
                  Are you sure you want to permanently delete category <strong>"{deleteTarget.name}"</strong>? This category contains no items and can be safely deleted.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteOrMigrate}
                    className="btn btn-sm"
                    disabled={isSubmitting}
                    style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', padding: '0.6rem 1.25rem', fontWeight: 700 }}
                  >
                    {isSubmitting ? 'Deleting...' : 'Delete Category'}
                  </button>
                </div>
              </div>
            ) : (
              // Non-empty category -> Migration Required
              <div>
                <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: '#FEF3C7',
                      color: '#D97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#92400E' }}>
                      Reassignment Required
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#B45309' }}>
                      Category contains {deleteContentCount} linked {deleteContentCount === 1 ? itemNoun : itemsNoun}
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFBEB', padding: '1rem', borderRadius: '10px', border: '1px solid #FCD34D', marginBottom: '1.25rem', fontSize: '0.84rem', color: '#92400E', lineHeight: '1.45' }}>
                  Direct deletion of <strong>"{deleteTarget.name}"</strong> is prevented to safeguard catalog records.
                  Please select an active destination category below to migrate all <strong>{deleteContentCount}</strong> existing {itemsNoun.toLowerCase()} before deletion.
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    Destination Active Category <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <select
                    value={targetReplacementCategory}
                    onChange={(e) => setTargetReplacementCategory(e.target.value)}
                    className="form-input"
                  >
                    {categories
                      .filter((c) => c.id !== deleteTarget.id && c.isActive !== false)
                      .map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem', backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                    <input
                      type="checkbox"
                      checked={confirmMigration}
                      onChange={(e) => setConfirmMigration(e.target.checked)}
                    />
                    <span>I confirm reassigning all {deleteContentCount} {itemsNoun.toLowerCase()} to "{targetReplacementCategory}" and deleting "{deleteTarget.name}".</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteOrMigrate}
                    className="btn btn-primary btn-sm"
                    disabled={!confirmMigration || !targetReplacementCategory || isSubmitting}
                    style={{ fontWeight: 700 }}
                  >
                    {isSubmitting ? 'Migrating...' : `Migrate & Delete`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
