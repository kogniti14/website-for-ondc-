import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  Star,
  Globe,
  Building2,
  ShoppingBag,
  Layers,
  ArrowUpDown,
  Tag,
  Share2,
  Clock,
  Sparkles,
  ShieldAlert,
  Loader2,
  FolderPlus,
  FileText,
} from 'lucide-react';
import { GalleryStory, GalleryCategory, GalleryVisibility, GalleryStatus } from '../../types';
import { galleryService } from '../../services/galleryService';
import { useAuth } from '../../context/AuthContext';

interface GalleryManagementProps {
  onPreviewStory?: (story: GalleryStory) => void;
}

export const GalleryManagement: React.FC<GalleryManagementProps> = ({ onPreviewStory }) => {
  const { currentAdminUser, isSuperAdmin, isAdmin } = useAuth();
  const hasManageStories = isSuperAdmin || isAdmin || Boolean(currentAdminUser?.permissions?.canManageStories);

  // Section Navigation
  const [activeSection, setActiveSection] = useState<'directory' | 'upload' | 'categories'>('directory');

  // Data state
  const [stories, setStories] = useState<GalleryStory[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVisibility, setSelectedVisibility] = useState<'all' | 'both' | 'b2b' | 'b2c'>('all');
  const [selectedStatus, setSelectedStatus] = useState<GalleryStatus | 'all'>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // Modals state
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<GalleryStory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [deleteConfirmStory, setDeleteConfirmStory] = useState<GalleryStory | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  // Story Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('Success Stories');
  const [formVisibility, setFormVisibility] = useState<GalleryVisibility>('both');
  const [formStatus, setFormStatus] = useState<GalleryStatus>('published');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formFullDesc, setFormFullDesc] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDocumentUrl, setFormDocumentUrl] = useState('');
  const [formFileType, setFormFileType] = useState<'image' | 'pdf'>('image');
  const [formImageAlt, setFormImageAlt] = useState('');
  const [formMetaTitle, setFormMetaTitle] = useState('');
  const [formMetaDesc, setFormMetaDesc] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [catError, setCatError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    const list = galleryService.getStories({
      category: selectedCategory,
      visibility: selectedVisibility,
      status: selectedStatus,
      featuredOnly,
      search: searchQuery,
    });
    setStories(list);
    setCategories(galleryService.getCategories());
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedVisibility, selectedStatus, featuredOnly, searchQuery]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingStory(null);
    setFormTitle('');
    setFormSlug('');
    setFormCategory(categories[0]?.name || 'Success Stories');
    setFormVisibility('both');
    setFormStatus('published');
    setFormFeatured(false);
    setFormDisplayOrder(stories.length + 1);
    setFormShortDesc('');
    setFormFullDesc('');
    setFormImageUrl('');
    setFormDocumentUrl('');
    setFormFileType('image');
    setFormImageAlt('');
    setFormMetaTitle('');
    setFormMetaDesc('');
    setFormError(null);
    setStoryModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (story: GalleryStory) => {
    setEditingStory(story);
    setFormTitle(story.title);
    setFormSlug(story.slug);
    setFormCategory(story.category);
    setFormVisibility(story.visibility);
    setFormStatus(story.status);
    setFormFeatured(story.featured);
    setFormDisplayOrder(story.displayOrder);
    setFormShortDesc(story.shortDescription);
    setFormFullDesc(story.fullDescription);
    setFormImageUrl(story.imageUrl);
    setFormDocumentUrl(story.documentUrl || '');
    setFormFileType(story.fileType || (story.imageUrl?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'));
    setFormImageAlt(story.imageAlt || story.title);
    setFormMetaTitle(story.metaTitle || '');
    setFormMetaDesc(story.metaDescription || '');
    setFormError(null);
    setStoryModalOpen(true);
  };

  // Auto-slug update on title change
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingStory || formSlug === galleryService.generateSlug(editingStory.title)) {
      setFormSlug(galleryService.generateSlug(val));
    }
  };

  // Handle Image or PDF File Selection & Validation
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError(null);
    setUploadProgress(true);

    const currentUserRole = currentAdminUser?.role || (isSuperAdmin ? 'super_admin' : 'admin');
    const uploadRes = await galleryService.uploadImage(
      file,
      formCategory,
      currentUserRole
    );

    setUploadProgress(false);

    if (uploadRes.success) {
      setFormImageUrl(uploadRes.imageUrl);
      setFormFileType(uploadRes.fileType || (file.type === 'application/pdf' ? 'pdf' : 'image'));
      if (uploadRes.documentUrl) {
        setFormDocumentUrl(uploadRes.documentUrl);
      }
      if (!formImageAlt) {
        setFormImageAlt(formTitle || file.name.split('.')[0]);
      }
    } else {
      setFormError(uploadRes.message);
    }
  };

  // Save Story Form (Create or Update)
  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError('Please enter a story title.');
      return;
    }
    if (!formImageUrl.trim()) {
      setFormError('Please upload an image/document or provide a media URL.');
      return;
    }
    if (!formShortDesc.trim()) {
      setFormError('Please provide a short description for cards and previews.');
      return;
    }

    setIsSubmitting(true);
    const currentUserRole = currentAdminUser?.role || (isSuperAdmin ? 'super_admin' : 'admin');

    try {
      if (editingStory) {
        // Update existing story
        const res = await galleryService.updateStory(
          editingStory.id,
          {
            title: formTitle.trim(),
            slug: formSlug.trim() || galleryService.generateSlug(formTitle),
            category: formCategory,
            visibility: formVisibility,
            status: formStatus,
            featured: formFeatured,
            displayOrder: Number(formDisplayOrder) || 1,
            shortDescription: formShortDesc.trim(),
            fullDescription: formFullDesc.trim(),
            imageUrl: formImageUrl.trim(),
            documentUrl: formDocumentUrl.trim() || undefined,
            fileType: formFileType,
            imageAlt: formImageAlt.trim() || formTitle.trim(),
            metaTitle: formMetaTitle.trim() || formTitle.trim(),
            metaDescription: formMetaDesc.trim() || formShortDesc.trim(),
          },
          currentUserRole
        );

        if (res.success) {
          setStoryModalOpen(false);
          setStatusMsg({ success: true, text: res.message });
          loadData();
          setTimeout(() => setStatusMsg(null), 4000);
        } else {
          setFormError(res.message);
        }
      } else {
        // Create new story
        const res = await galleryService.createStory(
          {
            title: formTitle.trim(),
            slug: formSlug.trim() || galleryService.generateSlug(formTitle),
            category: formCategory,
            visibility: formVisibility,
            status: formStatus,
            featured: formFeatured,
            displayOrder: Number(formDisplayOrder) || 1,
            shortDescription: formShortDesc.trim(),
            fullDescription: formFullDesc.trim(),
            imageUrl: formImageUrl.trim(),
            documentUrl: formDocumentUrl.trim() || undefined,
            fileType: formFileType,
            imageAlt: formImageAlt.trim() || formTitle.trim(),
            metaTitle: formMetaTitle.trim() || formTitle.trim(),
            metaDescription: formMetaDesc.trim() || formShortDesc.trim(),
            createdBy: currentAdminUser?.name || 'Admin',
          },
          currentUserRole
        );

        if (res.success) {
          setStoryModalOpen(false);
          setStatusMsg({ success: true, text: res.message });
          loadData();
          setTimeout(() => setStatusMsg(null), 4000);
        } else {
          setFormError(res.message);
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Toggle Publish Status
  const handleTogglePublish = async (story: GalleryStory) => {
    const currentUserRole = currentAdminUser?.role || (isSuperAdmin ? 'super_admin' : 'admin');
    const res = await galleryService.togglePublishStatus(story.id, currentUserRole);
    if (res.success) {
      setStatusMsg({ success: true, text: res.message });
      loadData();
      setTimeout(() => setStatusMsg(null), 3000);
    } else {
      setStatusMsg({ success: false, text: res.message });
    }
  };

  // Execute Delete
  const handleExecuteDelete = async () => {
    if (!deleteConfirmStory) return;
    setIsSubmitting(true);
    const currentUserRole = currentAdminUser?.role || (isSuperAdmin ? 'super_admin' : 'admin');
    const res = await galleryService.deleteStory(deleteConfirmStory.id, currentUserRole);
    setIsSubmitting(false);
    setDeleteConfirmStory(null);

    if (res.success) {
      setStatusMsg({ success: true, text: res.message });
      loadData();
      setTimeout(() => setStatusMsg(null), 4000);
    } else {
      setStatusMsg({ success: false, text: res.message });
    }
  };

  // Add Category Submit
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);
    if (!newCatName.trim()) {
      setCatError('Category name cannot be empty.');
      return;
    }
    const currentUserRole = currentAdminUser?.role || (isSuperAdmin ? 'super_admin' : 'admin');
    const res = galleryService.saveCategory(newCatName.trim(), currentUserRole);
    if (res.success) {
      setNewCatName('');
      setCategories(galleryService.getCategories());
      loadData();
      setStatusMsg({ success: true, text: res.message });
      setTimeout(() => setStatusMsg(null), 3000);
    } else {
      setCatError(res.message);
    }
  };

  // Stats calculation
  const allStories = galleryService.getStories({ status: 'all', visibility: 'all' });
  const totalCount = allStories.length;
  const publishedCount = allStories.filter((s) => s.status === 'published').length;
  const draftsCount = allStories.filter((s) => s.status === 'draft').length;
  const featuredCount = allStories.filter((s) => s.featured).length;

  if (!hasManageStories) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <ShieldAlert size={48} style={{ color: '#EF4444', margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          Staff / Admin Privileges Required
        </h3>
        <p style={{ color: 'var(--slate-600)', maxWidth: '480px', margin: '0.5rem auto 1.5rem', fontSize: '0.88rem' }}>
          You do not currently have permissions to upload or manage stories. Please contact the Super Admin to grant you Story & Media CMS rights.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header & Quick Metrics */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0A0F1D 0%, #1E293B 100%)',
          borderRadius: '16px',
          padding: '1.75rem',
          color: '#FFFFFF',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.5rem' }}>
          <div>
            <div className="flex items-center gap-2.5">
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Centralized CMS Module
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>B2B & B2C Unified Engine</span>
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.4rem' }}>
              Image Gallery & Success Stories
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#CBD5E1', marginTop: '0.2rem' }}>
              Publish, organize, and manage company milestones, customer case studies, and industrial photography without code.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCategoryModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ background: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.2)' }}
            >
              <FolderPlus size={16} /> Categories
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="btn btn-primary"
              style={{ background: '#10B981', borderColor: '#10B981', fontWeight: 700, padding: '0.65rem 1.25rem' }}
            >
              <Plus size={18} /> + Add New Story
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '1.25rem',
          }}
        >
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.85rem 1.1rem', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Total Stories & Media</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.15rem' }}>{totalCount}</div>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.85rem 1.1rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <div style={{ fontSize: '0.75rem', color: '#6EE7B7', fontWeight: 600 }}>Active Published</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34D399', marginTop: '0.15rem' }}>{publishedCount}</div>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.85rem 1.1rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
            <div style={{ fontSize: '0.75rem', color: '#FCD34D', fontWeight: 600 }}>Drafts in Review</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.15rem' }}>{draftsCount}</div>
          </div>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.85rem 1.1rem', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
            <div style={{ fontSize: '0.75rem', color: '#93C5FD', fontWeight: 600 }}>Featured Showcase</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#60A5FA', marginTop: '0.15rem' }}>{featuredCount}</div>
          </div>
        </div>
      </div>

      {/* Global Status Banner */}
      {statusMsg && (
        <div
          style={{
            background: statusMsg.success ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${statusMsg.success ? '#A7F3D0' : '#FECACA'}`,
            color: statusMsg.success ? '#065F46' : '#991B1B',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          {statusMsg.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* 2. Search & Filtering Toolbar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by story title, keyword, or category..."
              className="form-input"
              style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
            />
          </div>

          {/* Visibility Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg" style={{ background: 'var(--slate-100)', padding: '0.25rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-500)', padding: '0 0.5rem' }}>VISIBILITY:</span>
            <button
              type="button"
              onClick={() => setSelectedVisibility('all')}
              className={`btn btn-xs ${selectedVisibility === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedVisibility('both')}
              className={`btn btn-xs ${selectedVisibility === 'both' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
            >
              🌐 Both (B2B+B2C)
            </button>
            <button
              type="button"
              onClick={() => setSelectedVisibility('b2b')}
              className={`btn btn-xs ${selectedVisibility === 'b2b' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
            >
              🏢 B2B Only
            </button>
            <button
              type="button"
              onClick={() => setSelectedVisibility('b2c')}
              className={`btn btn-xs ${selectedVisibility === 'b2c' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
            >
              🛍️ B2C Only
            </button>
          </div>

          {/* Featured Toggle */}
          <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-700)' }}>
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              style={{ accentColor: 'var(--primary)' }}
            />
            <Star size={14} style={{ color: featuredOnly ? '#F59E0B' : 'var(--slate-400)', fill: featuredOnly ? '#F59E0B' : 'none' }} />
            Featured Stories Only
          </label>
        </div>

        {/* Row 2 Filters: Category & Status */}
        <div className="flex items-center gap-3 flex-wrap pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-500)' }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', width: 'auto' }}
            >
              <option value="All">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-500)' }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="form-input"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', width: 'auto' }}
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>

          {(searchQuery || selectedCategory !== 'All' || selectedVisibility !== 'all' || selectedStatus !== 'all' || featuredOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedVisibility('all');
                setSelectedStatus('all');
                setFeaturedOnly(false);
              }}
              className="btn btn-link btn-xs"
              style={{ color: 'var(--rose-600)', fontSize: '0.78rem' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Stories Data Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {stories.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <ImageIcon size={48} style={{ color: 'var(--slate-300)', margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-700)' }}>No Stories or Media Found</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', maxWidth: '400px', margin: '0.3rem auto 1.25rem' }}>
              No items match your active filters. Try adjusting your search query or add a brand new success story.
            </p>
            <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm">
              <Plus size={16} /> Add First Story
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.85rem 1rem', width: '90px' }}>Media</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Story Title & Snippet</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Visibility</th>
                  <th style={{ padding: '0.85rem 1rem', width: '80px', textAlign: 'center' }}>Priority</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stories.map((s) => (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Media Thumbnail */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div
                        style={{
                          width: '74px',
                          height: '52px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#E2E8F0',
                          border: '1px solid var(--border-color)',
                          position: 'relative',
                        }}
                      >
                        <img
                          src={s.imageUrl}
                          alt={s.imageAlt || s.title}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {s.featured && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              background: '#F59E0B',
                              color: '#FFFFFF',
                              borderRadius: '4px',
                              padding: '1px 3px',
                              fontSize: '0.6rem',
                              fontWeight: 800,
                            }}
                            title="Featured Story"
                          >
                            ★
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Story Title & Description */}
                    <td style={{ padding: '0.85rem 1rem', maxWidth: '360px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.92rem', lineHeight: 1.3 }}>
                        {s.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--slate-500)',
                          marginTop: '0.2rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {s.shortDescription}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', marginTop: '0.25rem' }}>
                        Slug: <code>/{s.slug}</code> • Date: {new Date(s.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(79, 70, 229, 0.1)',
                          color: '#4F46E5',
                          border: '1px solid rgba(79, 70, 229, 0.2)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {s.category}
                      </span>
                    </td>

                    {/* Visibility */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {s.visibility === 'both' && (
                        <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                          🌐 B2B + B2C
                        </span>
                      )}
                      {s.visibility === 'b2b' && (
                        <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                          🏢 B2B Only
                        </span>
                      )}
                      {s.visibility === 'b2c' && (
                        <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                          🛍️ B2C Only
                        </span>
                      )}
                    </td>

                    {/* Display Order */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          background: 'var(--slate-100)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          color: 'var(--slate-700)',
                        }}
                      >
                        #{s.displayOrder}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <button
                        onClick={() => handleTogglePublish(s)}
                        className={`badge ${
                          s.status === 'published'
                            ? 'badge-green'
                            : s.status === 'draft'
                            ? 'badge-amber'
                            : 'badge-dark'
                        }`}
                        style={{ cursor: 'pointer', border: 'none', fontSize: '0.72rem' }}
                        title="Click to toggle status"
                      >
                        {s.status.toUpperCase()}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-1.5">
                        {onPreviewStory && (
                          <button
                            type="button"
                            onClick={() => onPreviewStory(s)}
                            className="btn btn-ghost btn-xs"
                            title="Preview Public Story"
                            style={{ color: 'var(--slate-600)' }}
                          >
                            <Eye size={15} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(s)}
                          className="btn btn-ghost btn-xs"
                          title="Edit Story"
                          style={{ color: 'var(--primary)' }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmStory(s)}
                          className="btn btn-ghost btn-xs"
                          title="Delete Story"
                          style={{ color: 'var(--rose-600)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT STORY MODAL */}
      {/* ========================================================================= */}
      {storyModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.25rem',
            overflowY: 'auto',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '780px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              borderRadius: '16px',
              background: '#FFFFFF',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {editingStory ? 'Edit Story & Media' : '+ Add New Success Story'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                  Provide complete metadata, image assets, and visibility rules for automatic B2B/B2C publishing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStoryModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', fontSize: '1.25rem' }}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStory} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* 1. Image / PDF Upload & Live Preview */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Story Media * (JPG, PNG, WEBP, or PDF Document up to 10MB)</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>High-res photography or PDF case study</span>
                </label>

                {formImageUrl ? (
                  <div
                    style={{
                      border: '1.5px solid var(--border-color)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#F8FAFC',
                    }}
                  >
                    {formFileType === 'pdf' ? (
                      <div style={{ padding: '2rem', textAlign: 'center', background: '#FEF2F2', borderBottom: '1px solid #FECACA' }}>
                        <FileText size={48} style={{ color: '#DC2626', margin: '0 auto 0.5rem' }} />
                        <div style={{ fontWeight: 800, color: '#991B1B', fontSize: '1rem' }}>PDF Document / Case Study Attached</div>
                        <div style={{ fontSize: '0.8rem', color: '#B91C1C' }}>Original PDF document preserved. Visitors can view and read this story document.</div>
                        {formImageUrl.startsWith('http') && (
                          <a href={formImageUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-xs" style={{ marginTop: '0.75rem', borderColor: '#DC2626', color: '#DC2626' }}>
                            Preview Attached PDF ↗
                          </a>
                        )}
                      </div>
                    ) : (
                      <div style={{ maxHeight: '240px', overflow: 'hidden', position: 'relative' }}>
                        <img
                          src={formImageUrl}
                          alt="Preview"
                          style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div
                      className="flex items-center justify-between"
                      style={{
                        padding: '0.75rem 1rem',
                        background: '#FFFFFF',
                        borderTop: '1px solid var(--border-color)',
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', color: 'var(--slate-600)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '380px' }}>
                        Type: <strong style={{ textTransform: 'uppercase' }}>{formFileType}</strong> • Asset URL: <code>{formImageUrl.slice(0, 40)}...</code>
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="btn btn-outline btn-xs"
                        >
                          Replace File
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormImageUrl('');
                            setFormDocumentUrl('');
                          }}
                          className="btn btn-ghost btn-xs text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--slate-300)',
                      borderRadius: '12px',
                      padding: '2rem 1.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: '#F8FAFC',
                      transition: 'all 0.2s ease',
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        setUploadProgress(true);
                        const currentUserRole = currentAdminUser?.role || (isSuperAdmin ? 'super_admin' : 'admin');
                        const res = await galleryService.uploadImage(file, formCategory, currentUserRole);
                        setUploadProgress(false);
                        if (res.success) {
                          setFormImageUrl(res.imageUrl);
                          setFormFileType(res.fileType || (file.type === 'application/pdf' ? 'pdf' : 'image'));
                          if (res.documentUrl) setFormDocumentUrl(res.documentUrl);
                          if (!formImageAlt) setFormImageAlt(formTitle || file.name.split('.')[0]);
                        } else {
                          setFormError(res.message);
                        }
                      }
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.75rem',
                        color: 'var(--primary)',
                      }}
                    >
                      {uploadProgress ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-800)' }}>
                      {uploadProgress ? 'Processing File (Image / PDF)...' : 'Click to Upload Image or PDF (or Drag & Drop)'}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                      Supports High-Res JPG, PNG, WebP, and PDF documents (up to 10 MB). Stored in Firebase Cloud Storage.
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
                  onChange={handleImageFileChange}
                  style={{ display: 'none' }}
                />

                {/* Direct Image or Document URL input as alternative */}
                <div style={{ marginTop: '0.5rem' }}>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => {
                      setFormImageUrl(e.target.value);
                      if (e.target.value.toLowerCase().endsWith('.pdf')) {
                        setFormFileType('pdf');
                        setFormDocumentUrl(e.target.value);
                      } else {
                        setFormFileType('image');
                      }
                    }}
                    placeholder="Or paste direct media URL (https://...)"
                    className="form-input"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                  />
                </div>
              </div>

              {/* Image Alt Text */}
              <div className="form-group">
                <label className="form-label">
                  Image Alt Text * <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 400 }}>(Crucial for SEO & Accessibility)</span>
                </label>
                <input
                  type="text"
                  value={formImageAlt}
                  onChange={(e) => setFormImageAlt(e.target.value)}
                  placeholder="e.g. Kogniti Minds team demonstrating agro-waste paper pulping technology"
                  className="form-input"
                  required
                />
              </div>

              {/* Title & Slug Grid */}
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Story Title *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Our Journey Towards Sustainable Circular Innovation"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">URL Slug *</label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(galleryService.generateSlug(e.target.value))}
                    placeholder="e.g. sustainable-circular-innovation"
                    className="form-input"
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                    required
                  />
                </div>
              </div>

              {/* Category, Visibility & Order Grid */}
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {/* Category */}
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="form-input"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Visibility */}
                <div className="form-group">
                  <label className="form-label">Display Visibility *</label>
                  <select
                    value={formVisibility}
                    onChange={(e) => setFormVisibility(e.target.value as GalleryVisibility)}
                    className="form-input"
                    required
                  >
                    <option value="both">🌐 B2B + B2C (Default)</option>
                    <option value="b2b">🏢 B2B Only</option>
                    <option value="b2c">🛍️ B2C Only</option>
                  </select>
                </div>

                {/* Priority / Display Order */}
                <div className="form-group">
                  <label className="form-label">Display Order (1 = Top)</label>
                  <input
                    type="number"
                    min={1}
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Math.max(1, parseInt(e.target.value) || 1))}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Status & Featured */}
              <div
                className="flex items-center justify-between flex-wrap gap-4"
                style={{
                  padding: '1rem',
                  background: 'var(--slate-50)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <label className="form-label" style={{ marginBottom: '0.35rem' }}>Publication Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer" style={{ fontSize: '0.85rem' }}>
                      <input
                        type="radio"
                        name="formStatus"
                        value="published"
                        checked={formStatus === 'published'}
                        onChange={() => setFormStatus('published')}
                        style={{ accentColor: '#10B981' }}
                      />
                      <span className="font-semibold text-emerald-700">Published</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer" style={{ fontSize: '0.85rem' }}>
                      <input
                        type="radio"
                        name="formStatus"
                        value="draft"
                        checked={formStatus === 'draft'}
                        onChange={() => setFormStatus('draft')}
                        style={{ accentColor: '#F59E0B' }}
                      />
                      <span className="font-semibold text-amber-700">Draft</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer" style={{ fontSize: '0.85rem' }}>
                      <input
                        type="radio"
                        name="formStatus"
                        value="unpublished"
                        checked={formStatus === 'unpublished'}
                        onChange={() => setFormStatus('unpublished')}
                        style={{ accentColor: '#6B7280' }}
                      />
                      <span className="font-semibold text-slate-600">Unpublished</span>
                    </label>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    style={{ accentColor: '#10B981', width: '18px', height: '18px' }}
                  />
                  <span>Mark as Featured Story (Featured Section on Home)</span>
                </label>
              </div>

              {/* Short Description */}
              <div className="form-group">
                <label className="form-label">
                  Short Description * <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 400 }}>(Card preview summary)</span>
                </label>
                <textarea
                  rows={2}
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  placeholder="A compelling 1-2 sentence overview of this story milestone..."
                  className="form-input"
                  required
                />
              </div>

              {/* Full Rich Story Description */}
              <div className="form-group">
                <label className="form-label">
                  Full Story Content * <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 400 }}>(Detailed article / narrative)</span>
                </label>
                <textarea
                  rows={6}
                  value={formFullDesc}
                  onChange={(e) => setFormFullDesc(e.target.value)}
                  placeholder="Write the complete story with background, achievements, and impact details..."
                  className="form-input"
                  style={{ lineHeight: 1.6 }}
                />
              </div>

              {/* SEO Meta Information (Collapsible) */}
              <details
                style={{
                  background: 'var(--slate-50)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                }}
              >
                <summary style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-700)', cursor: 'pointer' }}>
                  SEO Meta Settings (Optional)
                </summary>
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Meta Title</label>
                    <input
                      type="text"
                      value={formMetaTitle}
                      onChange={(e) => setFormMetaTitle(e.target.value)}
                      placeholder={formTitle || 'SEO Title'}
                      className="form-input"
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Meta Description</label>
                    <textarea
                      rows={2}
                      value={formMetaDesc}
                      onChange={(e) => setFormMetaDesc(e.target.value)}
                      placeholder={formShortDesc || 'SEO Description'}
                      className="form-input"
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </details>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3" style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setStoryModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: '#10B981', borderColor: '#10B981', fontWeight: 700 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving Story...' : editingStory ? 'Save Changes' : 'Publish Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {deleteConfirmStory && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1.25rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '460px',
              padding: '2rem',
              borderRadius: '16px',
              background: '#FFFFFF',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#FEF2F2',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <Trash2 size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Delete Success Story?
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', margin: '0.5rem 0 1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>"{deleteConfirmStory.title}"</strong>? This will permanently remove the story and associated Firebase storage media.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmStory(null)}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="btn btn-danger"
                disabled={isSubmitting}
                style={{ background: '#DC2626', color: '#FFFFFF', fontWeight: 700 }}
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Story'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CATEGORY MANAGEMENT MODAL */}
      {/* ========================================================================= */}
      {categoryModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '1.25rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              borderRadius: '16px',
              background: '#FFFFFF',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                Gallery & Story Categories
              </h3>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', fontSize: '1.25rem' }}
              >
                ✕
              </button>
            </div>

            {catError && (
              <div
                style={{
                  background: '#FEF2F2',
                  color: '#991B1B',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  marginBottom: '1rem',
                }}
              >
                {catError}
              </div>
            )}

            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="flex gap-2" style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New Category (e.g. CSR Milestones)"
                className="form-input"
                style={{ fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-primary" style={{ background: '#10B981', borderColor: '#10B981', whiteSpace: 'nowrap' }}>
                <Plus size={16} /> Add
              </button>
            </form>

            {/* Category List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                Active Categories ({categories.length})
              </div>
              {categories.map((c) => {
                const count = allStories.filter((s) => s.category.toLowerCase() === c.name.toLowerCase()).length;
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between"
                    style={{
                      padding: '0.6rem 0.85rem',
                      background: 'var(--slate-50)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: '0.88rem' }}>{c.name}</div>
                      {c.description && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>{c.description}</div>
                      )}
                    </div>
                    <span className="badge" style={{ background: 'var(--slate-200)', color: 'var(--slate-700)', fontSize: '0.72rem' }}>
                      {count} {count === 1 ? 'story' : 'stories'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end" style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
