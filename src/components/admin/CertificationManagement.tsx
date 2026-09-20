import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Download,
  Clock,
  ShieldCheck,
  Building2,
  Users,
  Calendar,
  X,
  RefreshCw,
  Sparkles,
  Layers,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  CompanyCertification,
  CertificationCategory,
  CertificationVisibility,
  CertificationStatus,
  ValidityStatus,
} from '../../types';
import {
  certificationService,
  INITIAL_CERTIFICATION_CATEGORIES,
} from '../../services/certificationService';
import { dataSyncBus } from '../../services/dataSyncBus';
import { CategoryManager } from './CategoryManager';
import { BulkActionBar } from './BulkActionBar';

export const CertificationManagement: React.FC = () => {
  const { currentAdminUser, isSuperAdmin, isAdmin } = useAuth();
  const currentUserRole = currentAdminUser?.role || (isSuperAdmin ? 'super_admin' : 'admin');

  // Rights breakdown
  const hasUploadRights = isSuperAdmin || isAdmin || Boolean(currentAdminUser?.permissions?.canUploadCertifications);
  const hasEditRights = isSuperAdmin || isAdmin || Boolean(currentAdminUser?.permissions?.canEditCertifications);
  const hasDeleteRights = isSuperAdmin || isAdmin || Boolean(currentAdminUser?.permissions?.canDeleteCertifications);
  const hasAnyCertAccess = hasUploadRights || hasEditRights || hasDeleteRights;

  // Dedicated Sections
  const [activeSection, setActiveSection] = useState<'directory' | 'upload' | 'expiring' | 'categories'>('directory');

  // List & Filter States
  const [certifications, setCertifications] = useState<CompanyCertification[]>([]);
  const [categories, setCategories] = useState<CertificationCategory[]>([]);
  const [activeCategories, setActiveCategories] = useState<CertificationCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVisibility, setSelectedVisibility] = useState<CertificationVisibility | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<CertificationStatus | 'all'>('all');

  // Bulk Selection State
  const [selectedCertIds, setSelectedCertIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Loading & Toast States
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CompanyCertification | null>(null);
  const [deleteCertTarget, setDeleteCertTarget] = useState<CompanyCertification | null>(null);
  const [previewCertTarget, setPreviewCertTarget] = useState<CompanyCertification | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Form State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dedicatedFileInputRef = useRef<HTMLInputElement | null>(null);
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'expiring' | 'expired' | 'lifetime'>('all');
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formIssuingAuthority, setFormIssuingAuthority] = useState('');
  const [formCertificateNumber, setFormCertificateNumber] = useState('');
  const [formIssueDate, setFormIssueDate] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formNoExpiry, setFormNoExpiry] = useState(false);
  const [formVerificationUrl, setFormVerificationUrl] = useState('');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formStoragePath, setFormStoragePath] = useState('');
  const [formFileType, setFormFileType] = useState('application/pdf');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formVisibility, setFormVisibility] = useState<CertificationVisibility>('both');
  const [formStatus, setFormStatus] = useState<CertificationStatus>('published');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formAllowDownload, setFormAllowDownload] = useState(true);
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formFullDescription, setFormFullDescription] = useState('');
  const [formMetaTitle, setFormMetaTitle] = useState('');
  const [formMetaDescription, setFormMetaDescription] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');

  // Refresh data
  const loadData = () => {
    const list = certificationService.getCertificates({
      category: selectedCategory,
      visibility: selectedVisibility,
      status: selectedStatus,
      search: searchQuery,
    });
    setCertifications(list);
    setCategories(certificationService.getCategories());
  };

  useEffect(() => {
    loadData();
    setSelectedCertIds([]);
  }, [selectedCategory, selectedVisibility, selectedStatus, searchQuery]);

  useEffect(() => {
    const unsubCerts = dataSyncBus.subscribe('certifications', () => {
      loadData();
    });
    const unsubCats = dataSyncBus.subscribe('certification_categories', () => {
      loadData();
    });
    return () => {
      unsubCerts();
      unsubCats();
    };
  }, []);

  const handleBulkDeleteCertificates = async () => {
    if (selectedCertIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await certificationService.deleteMultipleCertificates(selectedCertIds, currentUserRole);
      if (res.success) {
        showToast('success', res.message);
        setSelectedCertIds([]);
        loadData();
      } else {
        showToast('error', res.message);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Bulk delete failed.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Metrics
  const allCerts = certificationService.getCertificates({ status: 'all' });
  const totalCount = allCerts.length;
  const publishedCount = allCerts.filter((c) => c.status === 'published').length;
  const draftCount = allCerts.filter((c) => c.status === 'draft').length;
  const featuredCount = allCerts.filter((c) => c.featured).length;
  const expiringSoonList = certificationService.getExpiringCertificates(60);

  // Form Reset
  const resetForm = () => {
    setEditingCert(null);
    setFormName('');
    setFormSlug('');
    setFormCategory(categories[0]?.name || 'Government Registration');
    setFormIssuingAuthority('');
    setFormCertificateNumber('');
    setFormIssueDate(new Date().toISOString().split('T')[0]);
    setFormExpiryDate('');
    setFormNoExpiry(false);
    setFormVerificationUrl('');
    setFormFileUrl('');
    setFormStoragePath('');
    setFormFileType('application/pdf');
    setFormThumbnailUrl('');
    setFormVisibility('both');
    setFormStatus('published');
    setFormFeatured(false);
    setFormAllowDownload(true);
    setFormDisplayOrder(allCerts.length + 1);
    setFormShortDescription('');
    setFormFullDescription('');
    setFormMetaTitle('');
    setFormMetaDescription('');
    setSelectedFileName('');
  };

  const handleOpenAddModal = () => {
    if (!hasUploadRights) {
      showToast('error', 'You do not have permission to upload certifications.');
      return;
    }
    resetForm();
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (cert: CompanyCertification) => {
    if (!hasEditRights) {
      showToast('error', 'You do not have permission to edit certifications.');
      return;
    }
    setEditingCert(cert);
    setFormName(cert.name);
    setFormSlug(cert.slug);
    setFormCategory(cert.category);
    setFormIssuingAuthority(cert.issuingAuthority);
    setFormCertificateNumber(cert.certificateNumber || '');
    setFormIssueDate(cert.issueDate || '');
    setFormExpiryDate(cert.expiryDate || '');
    setFormNoExpiry(cert.noExpiry);
    setFormVerificationUrl(cert.verificationUrl || '');
    setFormFileUrl(cert.fileUrl);
    setFormStoragePath(cert.storagePath || '');
    setFormFileType(cert.fileType);
    setFormThumbnailUrl(cert.thumbnailUrl || '');
    setFormVisibility(cert.visibility);
    setFormStatus(cert.status);
    setFormFeatured(cert.featured);
    setFormAllowDownload(cert.allowDownload);
    setFormDisplayOrder(cert.displayOrder);
    setFormShortDescription(cert.shortDescription);
    setFormFullDescription(cert.fullDescription || '');
    setFormMetaTitle(cert.metaTitle || '');
    setFormMetaDescription(cert.metaDescription || '');
    setSelectedFileName(cert.fileType === 'application/pdf' ? 'Original Document (PDF)' : 'Certificate Image');
    setIsFormModalOpen(true);
  };

  // File Upload Handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!hasUploadRights && !hasEditRights) {
      showToast('error', 'Upload rights required.');
      return;
    }

    // Size validation
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`);
      return;
    }

    // MIME format check
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type.toLowerCase())) {
      showToast('error', 'Invalid format. Supported: PDF, JPG, JPEG, PNG, WEBP.');
      return;
    }

    setIsUploading(true);
    setSelectedFileName(file.name);

    try {
      const res = await certificationService.uploadCertificateFile(
        file,
        formCategory || 'General',
        currentUserRole
      );

      if (res.success) {
        setFormFileUrl(res.fileUrl);
        setFormFileType(res.fileType);
        setFormStoragePath(res.storagePath || '');
        setFormThumbnailUrl(res.thumbnailUrl || '');
        showToast('success', 'Document uploaded successfully.');
      } else {
        showToast('error', res.message);
      }
    } catch (err: any) {
      showToast('error', err.message || 'File upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  // Save Certification
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCert && !hasEditRights) {
      showToast('error', 'You do not have permission to edit certifications.');
      return;
    }
    if (!editingCert && !hasUploadRights) {
      showToast('error', 'You do not have permission to upload certifications.');
      return;
    }

    if (!formName.trim()) {
      showToast('error', 'Certificate Name is required.');
      return;
    }
    if (!formFileUrl.trim()) {
      showToast('error', 'Please upload a valid certificate document or image.');
      return;
    }
    if (!formCategory.trim()) {
      showToast('error', 'Please select a Category.');
      return;
    }
    if (!formIssuingAuthority.trim()) {
      showToast('error', 'Issuing Authority is required.');
      return;
    }
    if (!formIssueDate.trim()) {
      showToast('error', 'Issue Date is required.');
      return;
    }

    const payload = {
      name: formName.trim(),
      slug: formSlug.trim() || certificationService.generateSlug(formName),
      category: formCategory,
      issuingAuthority: formIssuingAuthority.trim(),
      certificateNumber: formCertificateNumber.trim() || undefined,
      issueDate: formIssueDate,
      expiryDate: formNoExpiry ? null : formExpiryDate || null,
      noExpiry: formNoExpiry,
      verificationUrl: formVerificationUrl.trim() || undefined,
      fileUrl: formFileUrl,
      storagePath: formStoragePath || undefined,
      fileType: formFileType,
      thumbnailUrl: formThumbnailUrl || undefined,
      visibility: formVisibility,
      status: formStatus,
      featured: formFeatured,
      allowDownload: formAllowDownload,
      displayOrder: Number(formDisplayOrder) || 1,
      shortDescription: formShortDescription.trim(),
      fullDescription: formFullDescription.trim() || undefined,
      metaTitle: formMetaTitle.trim() || undefined,
      metaDescription: formMetaDescription.trim() || undefined,
      createdBy: currentAdminUser?.name || 'Super Admin',
    };

    if (editingCert) {
      const res = await certificationService.updateCertificate(editingCert.id, payload, currentUserRole);
      if (res.success) {
        showToast('success', res.message);
        setIsFormModalOpen(false);
        resetForm();
        loadData();
      } else {
        showToast('error', res.message);
      }
    } else {
      const res = await certificationService.createCertificate(payload, currentUserRole);
      if (res.success) {
        showToast('success', res.message);
        setIsFormModalOpen(false);
        resetForm();
        loadData();
        if (activeSection === 'upload') {
          setActiveSection('directory');
        }
      } else {
        showToast('error', res.message);
      }
    }
  };

  // Quick Toggle Publish Status
  const handleTogglePublish = async (cert: CompanyCertification) => {
    if (!hasEditRights) {
      showToast('error', 'You do not have permission to change status.');
      return;
    }
    const res = await certificationService.togglePublishStatus(cert.id, currentUserRole);
    if (res.success) {
      showToast('success', res.message);
      loadData();
    } else {
      showToast('error', res.message);
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!deleteCertTarget) return;
    if (!hasDeleteRights) {
      showToast('error', 'You do not have permission to delete certifications.');
      return;
    }

    const res = await certificationService.deleteCertificate(deleteCertTarget.id, currentUserRole);
    if (res.success) {
      showToast('success', res.message);
      setDeleteCertTarget(null);
      loadData();
    } else {
      showToast('error', res.message);
    }
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: CertificationCategory = {
      id: `cat_${Date.now()}`,
      name: newCatName.trim(),
      slug: certificationService.generateSlug(newCatName),
      description: newCatDescription.trim() || undefined,
      displayOrder: categories.length + 1,
    };

    const res = await certificationService.saveCategory(newCat, currentUserRole);
    if (res.success) {
      showToast('success', 'New category created successfully.');
      setCategories(certificationService.getCategories());
      setNewCatName('');
      setNewCatDescription('');
      setIsCategoryModalOpen(false);
    } else {
      showToast('error', res.message);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            backgroundColor: toastMessage.type === 'success' ? '#059669' : '#DC2626',
            color: '#ffffff',
            padding: '0.85rem 1.4rem',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {toastMessage.text}
        </div>
      )}

      {/* RBAC Rights Status Banner */}
      {!hasAnyCertAccess ? (
        <div
          style={{
            backgroundColor: '#FEF3C7',
            border: '1px solid #F59E0B',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <Lock size={20} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 800, color: '#92400E', fontSize: '0.92rem' }}>
              Staff / Admin Permissions Required
            </div>
            <div style={{ color: '#B45309', fontSize: '0.82rem', marginTop: '0.2rem', lineHeight: '1.4' }}>
              You currently have read-only audit mode for certifications. Please request the Super Admin to grant you Certification Upload, Edit, or Delete permissions in Staff Management.
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '12px',
            padding: '0.75rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={20} style={{ color: '#16A34A' }} />
            <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
              <strong>Your Active Rights:</strong>{' '}
              {hasUploadRights ? <span style={{ color: '#15803D', fontWeight: 700 }}>• Upload Documents (PDF/Images) ✅</span> : <span style={{ color: '#9CA3AF' }}>• Upload (Locked)</span>}{' '}
              {hasEditRights ? <span style={{ color: '#0369A1', fontWeight: 700 }}>• Edit & Publish ✅</span> : <span style={{ color: '#9CA3AF' }}>• Edit (Locked)</span>}{' '}
              {hasDeleteRights ? <span style={{ color: '#DC2626', fontWeight: 700 }}>• Delete Rights ✅</span> : <span style={{ color: '#9CA3AF' }}>• Delete (Locked)</span>}
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 700, background: '#DCFCE7', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
            Access: {currentUserRole.toUpperCase()}
          </div>
        </div>
      )}

      {/* Top Header & Metrics */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem',
          marginBottom: '1.75rem',
          boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.3)',
        }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.35rem' }}>
              <span
                style={{
                  backgroundColor: 'rgba(52, 211, 153, 0.2)',
                  color: '#34D399',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                }}
              >
                COMPLIANCE & RECOGNITION CMS
              </span>
              <span style={{ color: '#94A3B8', fontSize: '0.78rem' }}>• Centralized Certification Hub</span>
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Company Certifications & Official Documents
            </h2>
            <p style={{ color: '#CBD5E1', fontSize: '0.86rem', maxWidth: '650px', marginTop: '0.25rem' }}>
              Manage official MSME, DPIIT Startup India, ISO, UPPCB green licenses, GeM approvals, and laboratory product test certifications for B2B and B2C portals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="btn btn-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '0.6rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <Layers size={15} /> Categories ({categories.length})
            </button>
            <button
              onClick={() => {
                resetForm();
                setActiveSection('upload');
              }}
              disabled={!hasUploadRights}
              className="btn btn-sm"
              style={{
                backgroundColor: hasUploadRights ? '#10B981' : 'var(--slate-600)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.65rem 1.25rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                boxShadow: hasUploadRights ? '0 4px 12px rgba(16, 185, 129, 0.4)' : 'none',
                cursor: hasUploadRights ? 'pointer' : 'not-allowed',
              }}
            >
              <Plus size={16} /> + Upload New Certificate
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '0.85rem 1rem', borderRadius: '10px' }}>
            <div style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Certificates
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.2rem' }}>
              {totalCount}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '0.85rem 1rem', borderRadius: '10px' }}>
            <div style={{ color: '#34D399', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Published Active
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34D399', marginTop: '0.2rem' }}>
              {publishedCount}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '0.85rem 1rem', borderRadius: '10px' }}>
            <div style={{ color: '#FCD34D', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Drafts / Hidden
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FCD34D', marginTop: '0.2rem' }}>
              {draftCount}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '0.85rem 1rem', borderRadius: '10px' }}>
            <div style={{ color: '#60A5FA', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Featured Trust Badges
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60A5FA', marginTop: '0.2rem' }}>
              {featuredCount}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '0.85rem 1rem', borderRadius: '10px' }}>
            <div style={{ color: '#F87171', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Expiring Soon (&lt;60d)
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: expiringSoonList.length > 0 ? '#F87171' : '#CBD5E1', marginTop: '0.2rem' }}>
              {expiringSoonList.length}
            </div>
          </div>
        </div>
      </div>

      {/* Expiry Warning Proactive Alert Banner */}
      {expiringSoonList.length > 0 && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #F87171',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div className="flex items-center gap-2" style={{ fontWeight: 800, color: '#991B1B', fontSize: '0.92rem' }}>
            <AlertTriangle size={18} style={{ color: '#DC2626' }} />
            <span>Attention: {expiringSoonList.length} Certificate(s) Expiring Soon</span>
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {expiringSoonList.map(({ cert, daysRemaining }) => (
              <div
                key={cert.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontWeight: 700, color: '#1F2937' }}>{cert.name}</span>
                <span style={{ color: '#6B7280' }}>•</span>
                <span style={{ color: '#DC2626', fontWeight: 700 }}>
                  Expires in {daysRemaining} days ({cert.expiryDate})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Section Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.75rem',
        }}
      >
        <button
          onClick={() => setActiveSection('directory')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.15rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: 700,
            backgroundColor: activeSection === 'directory' ? '#064E3B' : '#F1F5F9',
            color: activeSection === 'directory' ? '#FFFFFF' : 'var(--slate-700)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <FileText size={16} /> All Certifications Directory ({certifications.length})
        </button>

        <button
          onClick={() => {
            resetForm();
            setActiveSection('upload');
          }}
          disabled={!hasUploadRights}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.15rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: 700,
            backgroundColor: activeSection === 'upload' ? '#10B981' : '#ECFDF5',
            color: activeSection === 'upload' ? '#FFFFFF' : '#047857',
            border: 'none',
            cursor: hasUploadRights ? 'pointer' : 'not-allowed',
            opacity: hasUploadRights ? 1 : 0.6,
            transition: 'all 0.2s',
          }}
        >
          <UploadCloud size={16} /> + Upload Certificate (PDF / Image)
        </button>

        <button
          onClick={() => setActiveSection('expiring')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.15rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: 700,
            backgroundColor: activeSection === 'expiring' ? '#D97706' : '#FEF3C7',
            color: activeSection === 'expiring' ? '#FFFFFF' : '#B45309',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Clock size={16} /> Expiry & Renewal Center ({expiringSoonList.length})
        </button>

        <button
          onClick={() => setActiveSection('categories')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.15rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: 700,
            backgroundColor: activeSection === 'categories' ? '#0F766E' : '#CCFBF1',
            color: activeSection === 'categories' ? '#FFFFFF' : '#0F766E',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Layers size={16} /> Categories & Classifications ({categories.length})
        </button>
      </div>

      {/* SECTION 1: DIRECTORY VIEW */}
      {activeSection === 'directory' && (
        <>
          {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--slate-400)',
              }}
            />
            <input
              type="text"
              placeholder="Search by Certificate Name, Number, or Authority..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.85rem', width: 'auto' }}
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Visibility */}
            <select
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value as any)}
              className="form-input"
              style={{ fontSize: '0.85rem', width: 'auto' }}
            >
              <option value="all">All Visibility</option>
              <option value="both">B2B + B2C (Both)</option>
              <option value="b2b">B2B Only</option>
              <option value="b2c">B2C Only</option>
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="form-input"
              style={{ fontSize: '0.85rem', width: 'auto' }}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="unpublished">Unpublished</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedVisibility('all');
                setSelectedStatus('all');
              }}
              className="btn btn-outline btn-sm"
              title="Reset Filters"
            >
              <RefreshCw size={14} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Certifications Table */}
      <div
        className="card"
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '0',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border-color)', color: 'var(--slate-700)' }}>
                {hasDeleteRights && (
                  <th style={{ padding: '0.85rem 0.6rem', width: '44px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      checked={certifications.length > 0 && selectedCertIds.length === certifications.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCertIds(certifications.map((c) => c.id));
                        } else {
                          setSelectedCertIds([]);
                        }
                      }}
                      title="Select All Certificates"
                    />
                  </th>
                )}
                <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Document</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Certificate Details</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Category</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Validity Status</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Portal</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certifications.length === 0 ? (
                <tr>
                  <td colSpan={hasDeleteRights ? 8 : 7} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--slate-500)' }}>
                    <FileText size={36} style={{ color: 'var(--slate-300)', margin: '0 auto 0.75rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-700)' }}>
                      No certificates found
                    </div>
                    <div style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>
                      Try adjusting your search query or filter selections.
                    </div>
                  </td>
                </tr>
              ) : (
                certifications.map((cert) => {
                  const validity = certificationService.computeValidityStatus(cert);
                  const isPdf = cert.fileType === 'application/pdf';

                  return (
                    <tr
                      key={cert.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-50)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {hasDeleteRights && (
                        <td style={{ padding: '0.85rem 0.6rem', width: '44px', textAlign: 'center', verticalAlign: 'middle' }}>
                          <input
                            type="checkbox"
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            checked={selectedCertIds.includes(cert.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCertIds((prev) => [...prev, cert.id]);
                              } else {
                                setSelectedCertIds((prev) => prev.filter((id) => id !== cert.id));
                              }
                            }}
                          />
                        </td>
                      )}
                      {/* Thumbnail / Document Preview Icon */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', width: '90px' }}>
                        <div
                          style={{
                            width: '58px',
                            height: '58px',
                            borderRadius: '8px',
                            background: isPdf ? 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)' : '#F1F5F9',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            position: 'relative',
                            cursor: 'pointer',
                          }}
                          onClick={() => setPreviewCertTarget(cert)}
                          title="Click to preview"
                        >
                          {isPdf ? (
                            <>
                              <FileText size={22} style={{ color: '#DC2626' }} />
                              <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#B91C1C', marginTop: '2px' }}>
                                PDF
                              </span>
                            </>
                          ) : (
                            <img
                              src={cert.fileUrl}
                              alt={cert.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                          {cert.featured && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: '#3B82F6',
                                border: '1.5px solid #ffffff',
                              }}
                              title="Featured Certificate"
                            />
                          )}
                        </div>
                      </td>

                      {/* Name & Authority */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <div className="flex items-center gap-2">
                          <span style={{ fontWeight: 800, color: 'var(--slate-900)', fontSize: '0.92rem' }}>
                            {cert.name}
                          </span>
                          {cert.featured && (
                            <span
                              style={{
                                backgroundColor: '#EFF6FF',
                                color: '#1D4ED8',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                              }}
                            >
                              ★ FEATURED
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                          <span style={{ fontWeight: 600 }}>By:</span> {cert.issuingAuthority}
                        </div>

                        {cert.certificateNumber && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>#{cert.certificateNumber}</span>
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <span
                          style={{
                            backgroundColor: '#F1F5F9',
                            color: 'var(--slate-700)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                          }}
                        >
                          {cert.category}
                        </span>
                      </td>

                      {/* Validity Status */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        {cert.noExpiry ? (
                          <span
                            style={{
                              backgroundColor: '#EFF6FF',
                              color: '#1E40AF',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <ShieldCheck size={12} /> Lifetime / No Expiry
                          </span>
                        ) : validity === 'expired' ? (
                          <span
                            style={{
                              backgroundColor: '#FEE2E2',
                              color: '#991B1B',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                            }}
                          >
                            Expired ({cert.expiryDate})
                          </span>
                        ) : (
                          <div>
                            <span
                              style={{
                                backgroundColor: '#ECFDF5',
                                color: '#065F46',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                              }}
                            >
                              Active
                            </span>
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                              Exp: {cert.expiryDate}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Visibility */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        {cert.visibility === 'both' && (
                          <span
                            style={{
                              backgroundColor: '#F3E8FF',
                              color: '#6B21A8',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                            }}
                          >
                            B2B + B2C
                          </span>
                        )}
                        {cert.visibility === 'b2b' && (
                          <span
                            style={{
                              backgroundColor: '#DBEAFE',
                              color: '#1E40AF',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                            }}
                          >
                            B2B Only
                          </span>
                        )}
                        {cert.visibility === 'b2c' && (
                          <span
                            style={{
                              backgroundColor: '#D1FAE5',
                              color: '#065F46',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                            }}
                          >
                            B2C Only
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <button
                          onClick={() => handleTogglePublish(cert)}
                          disabled={!hasEditRights}
                          style={{
                            backgroundColor: cert.status === 'published' ? '#DEF7EC' : '#F3F4F6',
                            color: cert.status === 'published' ? '#03543F' : '#4B5563',
                            border: '1px solid',
                            borderColor: cert.status === 'published' ? '#BCF0DA' : '#E5E7EB',
                            borderRadius: '20px',
                            padding: '0.25rem 0.65rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: hasEditRights ? 'pointer' : 'default',
                          }}
                          title={hasEditRights ? 'Click to toggle status' : 'Read-only'}
                        >
                          {cert.status === 'published' ? '● Published' : '○ ' + cert.status.toUpperCase()}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPreviewCertTarget(cert)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.55rem' }}
                            title="Preview Certificate"
                          >
                            <Eye size={14} />
                          </button>

                          {hasEditRights && (
                            <button
                              onClick={() => handleOpenEditModal(cert)}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0.35rem 0.55rem' }}
                              title="Edit Certificate"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}

                          {hasDeleteRights && (
                            <button
                              onClick={() => setDeleteCertTarget(cert)}
                              className="btn btn-sm"
                              style={{
                                padding: '0.35rem 0.55rem',
                                color: '#DC2626',
                                backgroundColor: '#FEE2E2',
                                border: 'none',
                              }}
                              title="Delete Certificate"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {hasDeleteRights && (
        <BulkActionBar
          selectedCount={selectedCertIds.length}
          totalCount={certifications.length}
          onSelectAll={() => setSelectedCertIds(certifications.map((c) => c.id))}
          onDeselectAll={() => setSelectedCertIds([])}
          onBulkDelete={handleBulkDeleteCertificates}
          isProcessing={isBulkDeleting}
          label="certificates"
        />
      )}
    </>
  )}

      {/* ========================================================================= */}
      {/* SECTION 2: DEDICATED UPLOAD CERTIFICATE WORKSPACE (PDF & IMAGE)          */}
      {/* ========================================================================= */}
      {activeSection === 'upload' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          {!hasUploadRights ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FCA5A5' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#DC2626' }}>
                <Lock size={32} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#991B1B', marginBottom: '0.5rem' }}>
                Certificate Upload Rights Required
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#7F1D1D', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                Your current account permissions do not grant document upload rights for company certifications.
                Please contact the Super Admin to enable the <strong>"Upload Certifications"</strong> right in Staff Management.
              </p>
              <button onClick={() => setActiveSection('directory')} className="btn btn-primary btn-sm">
                View Certificate Directory
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                    Upload Official Certificate (PDF / Image)
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
                    Upload authorized government registration, quality, or compliance documents. Choose visibility between B2B and B2C portals.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => resetForm()}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.82rem' }}
                >
                  <RefreshCw size={14} /> Clear Form
                </button>
              </div>

              <form onSubmit={handleSubmitForm}>
                {/* File Upload Zone */}
                <div
                  style={{
                    border: '2px dashed #CBD5E1',
                    borderRadius: '12px',
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: '#F8FAFC',
                    marginBottom: '1.75rem',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    type="file"
                    ref={dedicatedFileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                    style={{ display: 'none' }}
                  />

                  {formFileUrl ? (
                    <div className="flex items-center justify-between gap-4 flex-wrap" style={{ maxWidth: '650px', margin: '0 auto', backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '10px',
                            background: formFileType === 'application/pdf' ? '#FEE2E2' : '#EFF6FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <FileText
                            size={30}
                            style={{ color: formFileType === 'application/pdf' ? '#DC2626' : '#2563EB' }}
                          />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                            {selectedFileName || 'Certificate Document Attached'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                            ✓ Ready for Publication ({formFileType === 'application/pdf' ? 'PDF Document' : 'High-Res Image'})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => window.open(formFileUrl, '_blank')}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.8rem' }}
                        >
                          <Eye size={14} /> Preview File
                        </button>
                        <button
                          type="button"
                          onClick={() => dedicatedFileInputRef.current?.click()}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.8rem' }}
                          disabled={isUploading}
                        >
                          Change Document
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          backgroundColor: '#E0F2FE',
                          color: '#0284C7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 1rem',
                        }}
                      >
                        <UploadCloud size={32} />
                      </div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.35rem' }}>
                        Choose Certificate Document or Image to Upload
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>
                        Supports official <strong>PDF documents</strong> or clear scans in <strong>PNG, JPG, WEBP</strong> (up to 10 MB).
                      </p>
                      <button
                        type="button"
                        onClick={() => dedicatedFileInputRef.current?.click()}
                        className="btn btn-primary"
                        disabled={isUploading}
                        style={{ padding: '0.65rem 1.5rem', fontWeight: 600 }}
                      >
                        {isUploading ? 'Uploading Document...' : 'Browse Computer / Select File'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Metadata Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Certificate Title / Name <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ISO 9001:2015 Quality Management System"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Issuing Authority / Agency <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ministry of MSME, Govt. of India"
                      value={formIssuingAuthority}
                      onChange={(e) => setFormIssuingAuthority(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Category Classification <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="form-input"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Registration / License Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UDYAM-DL-03-0012345"
                      value={formCertificateNumber}
                      onChange={(e) => setFormCertificateNumber(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Issue Date <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formIssueDate}
                      onChange={(e) => setFormIssueDate(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>
                        Expiry Date
                      </label>
                      <label className="flex items-center gap-1.5" style={{ fontSize: '0.78rem', color: '#2563EB', cursor: 'pointer', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={formNoExpiry}
                          onChange={(e) => setFormNoExpiry(e.target.checked)}
                        />
                        Lifetime / No Expiry
                      </label>
                    </div>
                    <input
                      type="date"
                      disabled={formNoExpiry}
                      value={formExpiryDate}
                      onChange={(e) => setFormExpiryDate(e.target.value)}
                      className="form-input"
                      style={{
                        backgroundColor: formNoExpiry ? '#F1F5F9' : '#FFFFFF',
                        cursor: formNoExpiry ? 'not-allowed' : 'text',
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Portal Visibility <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <select
                      value={formVisibility}
                      onChange={(e) => setFormVisibility(e.target.value as CertificationVisibility)}
                      className="form-input"
                    >
                      <option value="both">B2B + B2C (Universal)</option>
                      <option value="b2b">B2B Portal Only</option>
                      <option value="b2c">B2C Storefront Only</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Publication Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as CertificationStatus)}
                      className="form-input"
                    >
                      <option value="published">Published (Visible Publicly)</option>
                      <option value="draft">Draft (Admin Only)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Official Authority Verification / Registry URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://udyamregistration.gov.in/verify"
                      value={formVerificationUrl}
                      onChange={(e) => setFormVerificationUrl(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Accreditation Scope / Short Summary
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief description of the certification coverage, standards compliant with, or authorized operations."
                      value={formShortDescription}
                      onChange={(e) => setFormShortDescription(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Additional Flags */}
                <div className="flex items-center gap-6 flex-wrap" style={{ backgroundColor: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.75rem', border: '1px solid #E2E8F0' }}>
                  <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                    <input
                      type="checkbox"
                      checked={formAllowDownload}
                      onChange={(e) => setFormAllowDownload(e.target.checked)}
                    />
                    Allow Visitors to Download Document (PDF / Image)
                  </label>

                  <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                    />
                    Highlight as Featured Certificate on Trust Banner
                  </label>
                </div>

                {/* Submit Controls */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => resetForm()}
                    className="btn btn-secondary"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      setFormStatus('draft');
                      handleSubmitForm(e);
                    }}
                    className="btn btn-outline"
                    disabled={isUploading}
                  >
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isUploading}
                    style={{ padding: '0.65rem 1.75rem', fontWeight: 700 }}
                  >
                    <UploadCloud size={16} /> Publish Certificate
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: EXPIRY & RENEWAL CENTER                                       */}
      {/* ========================================================================= */}
      {activeSection === 'expiring' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                Certification Validity & Renewal Center
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
                Track document validity timelines, renew expiring accreditations, and keep government compliances up to date.
              </p>
            </div>
            {hasUploadRights && (
              <button
                onClick={() => {
                  resetForm();
                  setActiveSection('upload');
                }}
                className="btn btn-primary btn-sm"
              >
                <Plus size={14} /> Upload New Certificate
              </button>
            )}
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#FEF3C7', padding: '1.25rem', borderRadius: '12px', border: '1px solid #FCD34D' }}>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#B45309' }}>EXPIRING SOON (&lt;60d)</span>
                <Clock size={18} style={{ color: '#D97706' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#92400E', marginTop: '0.35rem' }}>
                {expiringSoonList.length}
              </div>
              <p style={{ fontSize: '0.74rem', color: '#B45309', margin: '0.2rem 0 0' }}>Needs review or re-filing</p>
            </div>

            <div style={{ backgroundColor: '#FEE2E2', padding: '1.25rem', borderRadius: '12px', border: '1px solid #FCA5A5' }}>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#B91C1C' }}>EXPIRED DOCUMENTS</span>
                <AlertTriangle size={18} style={{ color: '#DC2626' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#991B1B', marginTop: '0.35rem' }}>
                {allCerts.filter((c) => {
                  if (c.noExpiry || !c.expiryDate) return false;
                  return certificationService.computeValidityStatus(c) === 'expired';
                }).length}
              </div>
              <p style={{ fontSize: '0.74rem', color: '#B91C1C', margin: '0.2rem 0 0' }}>Expired & requires immediate renewal</p>
            </div>

            <div style={{ backgroundColor: '#ECFDF5', padding: '1.25rem', borderRadius: '12px', border: '1px solid #6EE7B7' }}>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#047857' }}>LIFETIME / NO EXPIRY</span>
                <ShieldCheck size={18} style={{ color: '#059669' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#065F46', marginTop: '0.35rem' }}>
                {allCerts.filter((c) => c.noExpiry).length}
              </div>
              <p style={{ fontSize: '0.74rem', color: '#047857', margin: '0.2rem 0 0' }}>Permanent registrations</p>
            </div>

            <div style={{ backgroundColor: '#EFF6FF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #93C5FD' }}>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E40AF' }}>ALL CERTIFICATES</span>
                <Award size={18} style={{ color: '#2563EB' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E3A8A', marginTop: '0.35rem' }}>
                {allCerts.length}
              </div>
              <p style={{ fontSize: '0.74rem', color: '#1E40AF', margin: '0.2rem 0 0' }}>Across B2B and B2C channels</p>
            </div>
          </div>

          {/* Expiry Sub-filter Tabs */}
          <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setExpiryFilter('all')}
              className="btn btn-sm"
              style={{
                backgroundColor: expiryFilter === 'all' ? '#0F172A' : '#F1F5F9',
                color: expiryFilter === 'all' ? '#FFFFFF' : 'var(--slate-700)',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}
            >
              All Documents ({allCerts.length})
            </button>
            <button
              onClick={() => setExpiryFilter('expiring')}
              className="btn btn-sm"
              style={{
                backgroundColor: expiryFilter === 'expiring' ? '#D97706' : '#FEF3C7',
                color: expiryFilter === 'expiring' ? '#FFFFFF' : '#B45309',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}
            >
              Expiring &lt;60 Days ({expiringSoonList.length})
            </button>
            <button
              onClick={() => setExpiryFilter('expired')}
              className="btn btn-sm"
              style={{
                backgroundColor: expiryFilter === 'expired' ? '#DC2626' : '#FEE2E2',
                color: expiryFilter === 'expired' ? '#FFFFFF' : '#991B1B',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}
            >
              Expired Documents
            </button>
            <button
              onClick={() => setExpiryFilter('lifetime')}
              className="btn btn-sm"
              style={{
                backgroundColor: expiryFilter === 'lifetime' ? '#059669' : '#ECFDF5',
                color: expiryFilter === 'lifetime' ? '#FFFFFF' : '#047857',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}
            >
              Lifetime Registrations
            </button>
          </div>

          {/* List / Table */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--border-color)', color: 'var(--slate-600)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Document</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Issuing Authority</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Validity Timeline</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allCerts
                  .filter((cert) => {
                    const status = certificationService.computeValidityStatus(cert);
                    const days = certificationService.getDaysUntilExpiry(cert);
                    if (expiryFilter === 'expiring') {
                      return days !== null && days >= 0 && days <= 60 && !cert.noExpiry;
                    }
                    if (expiryFilter === 'expired') {
                      return status === 'expired';
                    }
                    if (expiryFilter === 'lifetime') {
                      return cert.noExpiry;
                    }
                    return true;
                  })
                  .map((cert) => {
                    const isPdf = cert.fileType === 'application/pdf';
                    const validityStatus = certificationService.computeValidityStatus(cert);
                    const daysRemaining = certificationService.getDaysUntilExpiry(cert);

                    return (
                      <tr key={cert.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div className="flex items-center gap-3">
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '6px',
                                backgroundColor: isPdf ? '#FEE2E2' : '#EFF6FF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <FileText size={20} style={{ color: isPdf ? '#DC2626' : '#2563EB' }} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{cert.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontFamily: 'monospace' }}>
                                {cert.certificateNumber || 'No Ref #'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--slate-700)', fontWeight: 500 }}>
                          {cert.issuingAuthority}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '999px', backgroundColor: '#F1F5F9', color: 'var(--slate-700)', fontWeight: 600 }}>
                            {cert.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {cert.noExpiry ? (
                            <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.8rem' }}>
                              Lifetime / No Expiry
                            </span>
                          ) : (
                            <div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--slate-800)', fontWeight: 600 }}>
                                Exp: {cert.expiryDate || 'N/A'}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                                Issued: {cert.issueDate}
                              </div>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {cert.noExpiry ? (
                            <span style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', borderRadius: '6px', backgroundColor: '#ECFDF5', color: '#047857', fontWeight: 700 }}>
                              ✓ Permanent
                            </span>
                          ) : validityStatus === 'expired' ? (
                            <span style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', borderRadius: '6px', backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 700 }}>
                              ⚠ Expired {daysRemaining !== null ? `${Math.abs(daysRemaining)}d ago` : ''}
                            </span>
                          ) : daysRemaining !== null && daysRemaining <= 60 ? (
                            <span style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', borderRadius: '6px', backgroundColor: '#FEF3C7', color: '#B45309', fontWeight: 700 }}>
                              ⏰ Expires in {daysRemaining} days
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', borderRadius: '6px', backgroundColor: '#ECFDF5', color: '#047857', fontWeight: 700 }}>
                              ✓ Valid ({daysRemaining}d)
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewCertTarget(cert)}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                              title="Preview Document"
                            >
                              <Eye size={13} /> View
                            </button>
                            {hasEditRights && (
                              <button
                                onClick={() => handleOpenEditModal(cert)}
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                                title="Renew or Edit Document"
                              >
                                <Edit2 size={13} /> Renew / Edit
                              </button>
                            )}
                            {hasDeleteRights && (
                              <button
                                onClick={() => setDeleteCertTarget(cert)}
                                className="btn btn-outline btn-sm"
                                style={{ padding: '0.35rem 0.5rem', color: '#DC2626', borderColor: '#FCA5A5' }}
                                title="Delete Certificate"
                              >
                                <Trash2 size={13} />
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: CATEGORIES & CLASSIFICATIONS                                   */}
      {/* ========================================================================= */}
      {activeSection === 'categories' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                Certification Categories & Classifications
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
                Organize company accreditations by industry standards, statutory registrations, and quality compliance frameworks.
              </p>
            </div>
            <button
              onClick={() => setActiveSection('directory')}
              className="btn btn-outline btn-sm"
            >
              Back to Directory
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: hasUploadRights ? '3fr 2fr' : '1fr', gap: '2rem' }}>
            {/* Categories List */}
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
                Active Categories ({categories.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {categories.map((cat) => {
                  const certCount = allCerts.filter((c) => c.category === cat.name).length;
                  return (
                    <div
                      key={cat.id}
                      style={{
                        padding: '1.1rem 1.25rem',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: '#F8FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                            {cat.name}
                          </span>
                          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '999px', backgroundColor: '#E0F2FE', color: '#0369A1', fontWeight: 700 }}>
                            {certCount} Document{certCount === 1 ? '' : 's'}
                          </span>
                        </div>
                        {cat.description && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                            {cat.description}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setActiveSection('directory');
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                      >
                        View in Directory →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Category Card */}
            {hasUploadRights && (
              <div style={{ backgroundColor: '#F8FAFC', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
                  Create New Category
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>
                  Add a new accreditation grouping to display on public filters and admin upload lists.
                </p>

                <form onSubmit={handleAddCategory}>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Category Name <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Export License / Halal / FDA"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Description (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Short description of what accreditations fall into this classification."
                      value={newCatDescription}
                      onChange={(e) => setNewCatDescription(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', fontWeight: 700 }}>
                    <Plus size={16} /> Save Category
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- ADD / EDIT CERTIFICATE MODAL --- */}
      {isFormModalOpen && (
        <div className="modal-overlay" onClick={() => setIsFormModalOpen(false)}>
          <div
            className="modal-content"
            style={{
              maxWidth: '750px',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {editingCert ? 'Edit Certification' : 'Upload New Certification'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Provide complete accreditation details, upload original PDF or image, and configure portal visibility.
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', padding: '0.35rem' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              {/* File Upload Zone */}
              <div
                style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  backgroundColor: '#F8FAFC',
                  marginBottom: '1.5rem',
                  position: 'relative',
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                  style={{ display: 'none' }}
                />

                {formFileUrl ? (
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '8px',
                          background: formFileType === 'application/pdf' ? '#FEE2E2' : '#EFF6FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FileText
                          size={28}
                          style={{ color: formFileType === 'application/pdf' ? '#DC2626' : '#2563EB' }}
                        />
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-900)' }}>
                          {selectedFileName || 'Certificate Document Attached'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                          ✓ Format: {formFileType === 'application/pdf' ? 'PDF Document' : 'High-Res Image'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.open(formFileUrl, '_blank')}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <ExternalLink size={13} /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.78rem' }}
                      >
                        Replace Document
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <UploadCloud size={40} style={{ color: '#0D9488', margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: '0.95rem' }}>
                      Drag & Drop Certificate or Click to Browse
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                      Supported formats: <strong>PDF (Preferred)</strong>, JPG, JPEG, PNG, WEBP (Max 10 MB)
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '0.85rem' }}
                    >
                      {isUploading ? 'Uploading...' : 'Choose File'}
                    </button>
                  </div>
                )}
              </div>

              {/* Form Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {/* Certificate Name */}
                <div className="form-group">
                  <label className="form-label">
                    Certificate Name <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MSME Registration Certificate"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (!editingCert) {
                        setFormSlug(certificationService.generateSlug(e.target.value));
                      }
                    }}
                    className="form-input"
                  />
                </div>

                {/* Category */}
                <div className="form-group">
                  <label className="form-label">
                    Category <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <select
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="form-input"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Issuing Authority */}
                <div className="form-group">
                  <label className="form-label">
                    Issuing Authority <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ministry of MSME, Govt. of India"
                    value={formIssuingAuthority}
                    onChange={(e) => setFormIssuingAuthority(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* Certificate Number */}
                <div className="form-group">
                  <label className="form-label">Certificate / Registration Number</label>
                  <input
                    type="text"
                    placeholder="e.g. UDYAM-UP-06-0034981"
                    value={formCertificateNumber}
                    onChange={(e) => setFormCertificateNumber(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* Issue Date */}
                <div className="form-group">
                  <label className="form-label">
                    Issue Date <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formIssueDate}
                    onChange={(e) => setFormIssueDate(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* Expiry Date with No Expiry Checkbox */}
                <div className="form-group">
                  <div className="flex items-center justify-between">
                    <label className="form-label">Expiry Date</label>
                    <label style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formNoExpiry}
                        onChange={(e) => {
                          setFormNoExpiry(e.target.checked);
                          if (e.target.checked) setFormExpiryDate('');
                        }}
                        style={{ marginRight: '0.35rem' }}
                      />
                      No Expiry / Lifetime
                    </label>
                  </div>
                  <input
                    type="date"
                    disabled={formNoExpiry}
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="form-input"
                    style={{ backgroundColor: formNoExpiry ? '#F3F4F6' : '#FFFFFF' }}
                  />
                </div>
              </div>

              {/* Verification URL */}
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">Official Verification Portal URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://udyamregistration.gov.in/Udyam_Verify.aspx"
                  value={formVerificationUrl}
                  onChange={(e) => setFormVerificationUrl(e.target.value)}
                  className="form-input"
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Visitors can click "Verify Certificate →" to open the issuing authority's live verification portal.
                </div>
              </div>

              {/* Visibility Options Cards */}
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Display On (Portal Visibility) *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <label
                    style={{
                      border: '2px solid',
                      borderColor: formVisibility === 'both' ? '#7C3AED' : '#E2E8F0',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      backgroundColor: formVisibility === 'both' ? '#FAF5FF' : '#ffffff',
                    }}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="both"
                      checked={formVisibility === 'both'}
                      onChange={() => setFormVisibility('both')}
                      style={{ marginRight: '0.4rem' }}
                    />
                    <strong style={{ fontSize: '0.85rem' }}>B2B + B2C</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                      Both consumer and enterprise portals.
                    </div>
                  </label>

                  <label
                    style={{
                      border: '2px solid',
                      borderColor: formVisibility === 'b2b' ? '#2563EB' : '#E2E8F0',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      backgroundColor: formVisibility === 'b2b' ? '#EFF6FF' : '#ffffff',
                    }}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="b2b"
                      checked={formVisibility === 'b2b'}
                      onChange={() => setFormVisibility('b2b')}
                      style={{ marginRight: '0.4rem' }}
                    />
                    <strong style={{ fontSize: '0.85rem' }}>B2B Only</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                      Wholesale compliance & tenders.
                    </div>
                  </label>

                  <label
                    style={{
                      border: '2px solid',
                      borderColor: formVisibility === 'b2c' ? '#059669' : '#E2E8F0',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      backgroundColor: formVisibility === 'b2c' ? '#ECFDF5' : '#ffffff',
                    }}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="b2c"
                      checked={formVisibility === 'b2c'}
                      onChange={() => setFormVisibility('b2c')}
                      style={{ marginRight: '0.4rem' }}
                    />
                    <strong style={{ fontSize: '0.85rem' }}>B2C Only</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                      Consumer retail credibility.
                    </div>
                  </label>
                </div>
              </div>

              {/* Status, Display Order, Featured & Download Toggles */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#F8FAFC',
                  borderRadius: '10px',
                }}
              >
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>
                    Publish Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="form-input"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="unpublished">Unpublished</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="form-input"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                <div className="flex items-center" style={{ marginTop: '1.25rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      style={{ marginRight: '0.4rem' }}
                    />
                    Mark as Featured
                  </label>
                </div>

                <div className="flex items-center" style={{ marginTop: '1.25rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formAllowDownload}
                      onChange={(e) => setFormAllowDownload(e.target.checked)}
                      style={{ marginRight: '0.4rem' }}
                    />
                    Allow Public Download
                  </label>
                </div>
              </div>

              {/* Descriptions */}
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Short Summary (Displayed on Cards)</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of what this certification accredits..."
                  value={formShortDescription}
                  onChange={(e) => setFormShortDescription(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Compliance Description & Scope (Optional)</label>
                <textarea
                  rows={4}
                  placeholder="Detailed background, standards audited, testing benchmarks..."
                  value={formFullDescription}
                  onChange={(e) => setFormFullDescription(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3" style={{ marginTop: '1.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>
                  {editingCert ? 'Update Certificate' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PREVIEW MODAL --- */}
      {previewCertTarget && (
        <div className="modal-overlay" onClick={() => setPreviewCertTarget(null)}>
          <div
            className="modal-content"
            style={{
              maxWidth: '650px',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div>
                <span
                  style={{
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {previewCertTarget.category}
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--slate-900)' }}>
                  {previewCertTarget.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewCertTarget(null)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', padding: '0.35rem' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Document Viewer Preview Container */}
            <div
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                backgroundColor: '#F8FAFC',
                marginBottom: '1.25rem',
                minHeight: '260px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
              }}
            >
              {previewCertTarget.fileType === 'application/pdf' ? (
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '16px',
                      backgroundColor: '#FEE2E2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                    }}
                  >
                    <FileText size={38} style={{ color: '#DC2626' }} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--slate-900)' }}>
                    Original Document (PDF)
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', margin: '0.3rem 0 1rem' }}>
                    Authentic vector document available for full-resolution view.
                  </div>
                  <button
                    onClick={() => window.open(previewCertTarget.fileUrl, '_blank')}
                    className="btn btn-primary btn-sm"
                  >
                    <ExternalLink size={14} /> Open Original PDF in New Window
                  </button>
                </div>
              ) : (
                <img
                  src={previewCertTarget.fileUrl}
                  alt={previewCertTarget.name}
                  style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain', borderRadius: '8px' }}
                />
              )}
            </div>

            {/* Metadata Summary */}
            <div
              style={{
                background: '#F1F5F9',
                borderRadius: '10px',
                padding: '1rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                fontSize: '0.82rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--slate-500)' }}>Issued By:</span>
                <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{previewCertTarget.issuingAuthority}</div>
              </div>
              <div>
                <span style={{ color: 'var(--slate-500)' }}>Registration / Ref #:</span>
                <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--slate-900)' }}>
                  {previewCertTarget.certificateNumber || 'N/A'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--slate-500)' }}>Issue Date:</span>
                <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{previewCertTarget.issueDate}</div>
              </div>
              <div>
                <span style={{ color: 'var(--slate-500)' }}>Expiry Date:</span>
                <div style={{ fontWeight: 700, color: previewCertTarget.noExpiry ? '#1E40AF' : 'var(--slate-900)' }}>
                  {previewCertTarget.noExpiry ? 'Lifetime / Permanent' : previewCertTarget.expiryDate}
                </div>
              </div>
            </div>

            {previewCertTarget.shortDescription && (
              <p style={{ fontSize: '0.86rem', color: 'var(--slate-700)', lineHeight: '1.5' }}>
                {previewCertTarget.shortDescription}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3" style={{ marginTop: '1.5rem' }}>
              {previewCertTarget.verificationUrl && (
                <a
                  href={previewCertTarget.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <ExternalLink size={14} /> Verify on Authority Portal
                </a>
              )}
              {previewCertTarget.allowDownload && (
                <a
                  href={previewCertTarget.fileUrl}
                  download={`${previewCertTarget.slug}.${previewCertTarget.fileType === 'application/pdf' ? 'pdf' : 'png'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  <Download size={14} /> Download Certificate
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deleteCertTarget && (
        <div className="modal-overlay" onClick={() => setDeleteCertTarget(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '440px', padding: '2rem', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <Trash2 size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Delete Certificate?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', margin: '0.5rem 0 1.5rem', lineHeight: '1.4' }}>
              Are you sure you want to permanently delete <strong>{deleteCertTarget.name}</strong>? The document file will also be removed from Cloud Storage.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteCertTarget(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn btn-sm"
                style={{ backgroundColor: '#DC2626', color: '#ffffff', border: 'none', padding: '0.6rem 1.25rem' }}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CATEGORY MANAGER MODAL --- */}
      {isCategoryModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCategoryModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '520px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                Certification Categories
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', padding: '0.35rem' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '1.5rem' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {categories.map((c) => (
                  <li
                    key={c.id}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.86rem',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--slate-800)' }}>{c.name}</span>
                      {c.description && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>{c.description}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {isSuperAdmin && (
              <form onSubmit={handleAddCategory} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--slate-800)' }}>
                  Add New Category
                </h4>
                <div className="form-group">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Export License / Halal / FDA"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Category description (optional)"
                    value={newCatDescription}
                    onChange={(e) => setNewCatDescription(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="flex justify-end gap-2" style={{ marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary btn-sm">
                    + Add Category
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
