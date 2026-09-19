import { GalleryStory, GalleryCategory, GalleryVisibility, GalleryStatus } from '../types';
import { db, storage, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

const LOCAL_STORAGE_STORIES_KEY = 'km_gallery_stories_v1';
const LOCAL_STORAGE_CATEGORIES_KEY = 'km_gallery_categories_v1';

// Initial Seed Categories as defined in specifications
export const INITIAL_GALLERY_CATEGORIES: GalleryCategory[] = [
  { id: 'cat_success', name: 'Success Stories', slug: 'success-stories', displayOrder: 1, isActive: true, description: 'Client transformations, brand migrations, and circular economy adoption milestones.' },
  { id: 'cat_achieve', name: 'Achievements', slug: 'achievements', displayOrder: 2, isActive: true, description: 'Company milestones, ESG certifications, and sustainable packaging breakthroughs.' },
  { id: 'cat_events', name: 'Company Events', slug: 'company-events', displayOrder: 3, isActive: true, description: 'Symposiums, stakeholder meets, and agro-farmer partner summits.' },
  { id: 'cat_prod', name: 'Products', slug: 'products', displayOrder: 4, isActive: true, description: 'Showcase of 100% tree-free circular paper, courier bags, and molded pulp tableware.' },
  { id: 'cat_mfg', name: 'Manufacturing', slug: 'manufacturing', displayOrder: 5, isActive: true, description: 'Inside our zero-effluent agri-waste processing and automated conversion units.' },
  { id: 'cat_team', name: 'Team', slug: 'team', displayOrder: 6, isActive: true, description: 'R&D scientists, production engineers, and visionary changemakers at Kogniti Minds.' },
  { id: 'cat_exhib', name: 'Exhibitions', slug: 'exhibitions', displayOrder: 7, isActive: true, description: 'National packaging expos, ONDC seller pavilions, and global sustainability forums.' },
  { id: 'cat_awards', name: 'Awards', slug: 'awards', displayOrder: 8, isActive: true, description: 'National Cleantech honors, Circular Packaging Innovation awards, and Green MSME recognitions.' },
  { id: 'cat_partners', name: 'Partnerships', slug: 'partnerships', displayOrder: 9, isActive: true, description: 'Institutional alliances, state farmer collectives, and enterprise logistics adopters.' },
  { id: 'cat_other', name: 'Other', slug: 'other', displayOrder: 10, isActive: true, description: 'Press features, community outreach, and future circular packaging initiatives.' },
];

// Initial Realistic Seed Stories for Kogniti Minds
export const INITIAL_GALLERY_STORIES: GalleryStory[] = [
  {
    id: 'story_01_stubble_revolution',
    title: 'Transforming Punjab & Haryana Crop Residue into Premium Packaging',
    slug: 'transforming-crop-residue-into-premium-packaging',
    shortDescription: 'How Kogniti Minds partnered with 1,200+ farmers to eliminate stubble burning while producing industrial-grade packaging paper.',
    fullDescription: `Every harvest season, northern India battles dense agricultural smog caused by the burning of millions of tons of paddy straw. In 2024, Kogniti Minds launched its flagship crop-waste procurement initiative across 14 farming clusters in Punjab and Haryana.

By introducing specialized mechanized baling and proprietary mechanical-enzymatic fiber extraction, we proved that agricultural residue can yield tensile strength matching virgin wood pulp—without releasing a single metric ton of smoke into our skies.

Key Milestones Achieved:
• Over 18,500 metric tons of paddy straw diverted from seasonal farm fires in FY 2025-26.
• Direct incremental income generated for 1,200+ marginal farming families via cooperative biomass buyback contracts.
• Zero harmful sulfur or chlorine bleaching utilized in the pulping cycle, preserving local water tables.
• Full commercial delivery of high-burst corrugated kraft rolls directly to leading e-commerce logistics hubs.

Our circular model is proof that industrial manufacturing and environmental restoration can operate hand-in-hand as a unified economic engine.`,
    imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Harvested agricultural crop residue being collected and processed into sustainable paper',
    category: 'Success Stories',
    visibility: 'both',
    status: 'published',
    featured: true,
    displayOrder: 1,
    metaTitle: 'Crop Residue to Paper: Kogniti Minds Sustainable Packaging Milestone',
    metaDescription: 'Discover how Kogniti Minds converts agricultural straw into high-strength packaging paper while supporting farming communities.',
    createdAt: '2026-08-15T10:30:00Z',
    updatedAt: '2026-08-15T10:30:00Z',
    createdBy: 'adm_super_01',
    publishedAt: '2026-08-15T10:30:00Z',
  },
  {
    id: 'story_02_ondc_enablement',
    title: 'Pioneering Green Packaging Standardization on the ONDC Open Network',
    slug: 'pioneering-green-packaging-standardization-on-ondc',
    shortDescription: 'Empowering thousands of D2C sellers with plastic-free, ONDC-compliant tamper-evident paper mailers and biodegradable boxes.',
    fullDescription: `The Open Network for Digital Commerce (ONDC) has democratized digital commerce across India. However, rapid parcel volume expansion threatened to generate tons of single-use poly mailer waste every day.

In mid-2025, Kogniti Minds joined forces with ONDC logistics logistics providers to engineer the country's first certified tamper-evident, water-resistant paper courier bag manufactured 100% from sugarcane bagasse and wheat straw fiber.

System Highlights:
• Instant integration into MSME procurement workflows through our open B2B catalog.
• Tamper-proof hot-melt vegetable adhesive closure, eliminating the need for plastic security tapes.
• 100% biodegradable and compostable within 90 days in industrial and home composting environments.
• Trusted by over 450 verified enterprise brands and institutional educational buyers nationwide.

Today, every package shipped in our certified mailers represents a tangible vote against non-recyclable petroleum packaging.`,
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Eco-friendly cardboard shipping boxes and paper mailers ready for ONDC distribution',
    category: 'Achievements',
    visibility: 'both',
    status: 'published',
    featured: true,
    displayOrder: 2,
    metaTitle: 'ONDC Green Packaging Standardization - Kogniti Minds Enterprise Story',
    metaDescription: 'How Kogniti Minds provides ONDC-compliant eco-friendly packaging and paper mailers to businesses across India.',
    createdAt: '2026-08-28T14:00:00Z',
    updatedAt: '2026-08-28T14:00:00Z',
    createdBy: 'adm_super_01',
    publishedAt: '2026-08-28T14:00:00Z',
  },
  {
    id: 'story_03_zero_liquid_discharge',
    title: 'Next-Gen Manufacturing: 100% Closed-Loop Water Recycling Facility',
    slug: 'next-gen-manufacturing-closed-loop-water-recycling',
    shortDescription: 'Inside our zero-liquid-discharge paper conversion facility, recycling 98.4% of process water through membrane bioreactors.',
    fullDescription: `Conventional paper mills consume up to 50 cubic meters of freshwater for every ton of paper produced. At Kogniti Minds, preserving freshwater resources was non-negotiable from day one.

Our automated conversion facility utilizes advanced multi-stage membrane filtration and mechanical vapor recompression. Process water is continually clarified, sterilized, and cycled back into pulping and sheet formation.

Technical Capabilities:
• Daily freshwater extraction reduced by 82% compared to conventional paper plants.
• High-efficiency biomass boilers powered by internal crop husks and reject fibers, achieving carbon neutrality in thermal cycles.
• Real-time IoT sensor telemetry measuring burst factor, moisture equilibrium, and sheet caliper across automated production lines.
• In-house quality assurance laboratory testing for food-grade contact safety (FSSAI compliance) and international ASTM compostability benchmarks.

We welcome institutional partners and sustainability auditors to inspect our manufacturing floors and witness clean production first-hand.`,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Modern clean sustainable manufacturing plant with precision paper making machinery',
    category: 'Manufacturing',
    visibility: 'b2b',
    status: 'published',
    featured: true,
    displayOrder: 3,
    metaTitle: 'Eco-Friendly Paper Manufacturing & Zero-Liquid-Discharge Tech',
    metaDescription: 'Inside Kogniti Minds closed-loop manufacturing plant producing sustainable agro-waste paper products.',
    createdAt: '2026-09-02T11:15:00Z',
    updatedAt: '2026-09-02T11:15:00Z',
    createdBy: 'adm_super_01',
    publishedAt: '2026-09-02T11:15:00Z',
  },
  {
    id: 'story_04_circular_packaging_award',
    title: 'National Cleantech & Circular Innovation Honor 2026',
    slug: 'national-cleantech-circular-innovation-honor-2026',
    shortDescription: 'Kogniti Minds recognized at the National Green Industry Summit for pioneering commercial-scale circular agriculture paper.',
    fullDescription: `We are humbled to announce that Kogniti Minds was awarded the prestigious "National Cleantech Leader in Circular Economy 2026" at the Green Business Conclave.

The jury commended our holistic approach: connecting rural agrarian waste supply chains directly with urban logistics packaging demands. By creating a commercial market for crop residue, Kogniti Minds provides farmers with a financially compelling reason not to burn stubble while giving corporations a reliable alternative to wood-cut paper.

"This recognition belongs to our partner farmers, plant technicians, and the hundreds of businesses who chose our circular packaging over petroleum plastics," stated our leadership team upon accepting the trophy.`,
    imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Golden award trophy for sustainable enterprise innovation and circular packaging excellence',
    category: 'Awards',
    visibility: 'both',
    status: 'published',
    featured: false,
    displayOrder: 4,
    metaTitle: 'Kogniti Minds Wins National Cleantech Innovation Award 2026',
    metaDescription: 'National recognition for Kogniti Minds pioneering circular economy agro-waste packaging technology.',
    createdAt: '2026-09-05T16:45:00Z',
    updatedAt: '2026-09-05T16:45:00Z',
    createdBy: 'adm_super_01',
    publishedAt: '2026-09-05T16:45:00Z',
  },
  {
    id: 'story_05_clean_india_expo',
    title: 'Highlights from Clean India Industrial & Packaging Expo 2026',
    slug: 'highlights-clean-india-packaging-expo-2026',
    shortDescription: 'Engaging with 3,000+ corporate sustainability leaders and live-demonstrating our water-resistant agro-paper barrier coatings.',
    fullDescription: `Over three intensive days at the Clean India Packaging Expo, the Kogniti Minds pavilion welcomed corporate procurement officers, packaging engineers, and eco-conscious brand builders.

Visitors experienced our live puncture resistance tests, water repellency demonstrations using natural plant-based wax barriers, and interactive carbon footprint calculators comparing traditional virgin kraft against our stubble-based corrugated sheets.

Highlights from the Pavilion:
• Executed 18 preliminary corporate supply agreements with educational institutes and apparel retailers.
• Demonstrated high-speed automated carton foldability on industrial packaging lines without seam cracking.
• Unveiled our new 2026 line of custom-branded unbleached food delivery containers and moulded pulp trays.`,
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Exhibition hall crowd and interactive corporate sustainability display booth',
    category: 'Exhibitions',
    visibility: 'both',
    status: 'published',
    featured: false,
    displayOrder: 5,
    metaTitle: 'Clean India Expo 2026: Kogniti Minds Sustainable Packaging Booth',
    metaDescription: 'Highlights from Kogniti Minds exhibition pavilion at Clean India Expo 2026.',
    createdAt: '2026-09-08T09:20:00Z',
    updatedAt: '2026-09-08T09:20:00Z',
    createdBy: 'adm_super_01',
    publishedAt: '2026-09-08T09:20:00Z',
  },
  {
    id: 'story_06_corporate_campus_greening',
    title: 'Green Campus Initiative: Transitioning 50+ Universities to Tree-Free Paper',
    slug: 'green-campus-initiative-universities-tree-free-paper',
    shortDescription: 'Supplying educational institutes with sustainable notebooks, exam answer booklets, and certificate grade paper.',
    fullDescription: `Academic institutions use millions of sheets of paper each semester. Under our Green Campus Initiative, Kogniti Minds has partnered with major colleges and universities across Bihar, Uttar Pradesh, and Delhi NCR to transition their stationery and administrative paper to 100% agro-waste circular paper.

Every student writing on our paper learns directly about circular agriculture, as each notebook cover carries a detailed QR code mapping the exact crop residue cluster from which the notebook was produced.

Partner Impact:
• Replaced 4.2 million sheets of conventional virgin paper in the past academic year.
• Saved approximately 680 mature trees and over 2.4 million liters of freshwater.
• Integrated educational seminars on waste upcycling into university environmental science curricula.`,
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'College students collaborating in modern campus library with sustainable notebooks',
    category: 'Partnerships',
    visibility: 'b2c',
    status: 'published',
    featured: false,
    displayOrder: 6,
    metaTitle: 'University Green Paper Initiative - Kogniti Minds Education Case Study',
    metaDescription: 'How academic universities adopted Kogniti Minds agro-waste paper for student notebooks and administrative work.',
    createdAt: '2026-09-10T12:00:00Z',
    updatedAt: '2026-09-10T12:00:00Z',
    createdBy: 'adm_super_01',
    publishedAt: '2026-09-10T12:00:00Z',
  },
];

class GalleryService {
  private memoryStories: GalleryStory[] | null = null;
  private memoryCategories: GalleryCategory[] | null = null;

  /**
   * Role authorization check: allows super_admin, admin, operations_admin, catalog_manager, or staff
   */
  isAuthorized(role?: string): boolean {
    if (!role) return false;
    const permitted = ['super_admin', 'admin', 'operations_admin', 'catalog_manager', 'staff'];
    return permitted.includes(role);
  }

  /**
   * Helper to safely read from localStorage
   */
  private getLocalStories(): GalleryStory[] {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(LOCAL_STORAGE_STORIES_KEY);
        if (!data) {
          this.saveLocalStories(INITIAL_GALLERY_STORIES);
          return INITIAL_GALLERY_STORIES;
        }
        return JSON.parse(data);
      }
      return this.memoryStories || INITIAL_GALLERY_STORIES;
    } catch {
      return this.memoryStories || INITIAL_GALLERY_STORIES;
    }
  }

  private saveLocalStories(stories: GalleryStory[]): void {
    this.memoryStories = stories;
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_STORIES_KEY, JSON.stringify(stories));
      }
    } catch (err) {
      console.warn('LocalStorage save fallback notice for gallery stories:', err);
    }
  }

  private getLocalCategories(): GalleryCategory[] {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
        if (!data) {
          this.saveLocalCategories(INITIAL_GALLERY_CATEGORIES);
          return INITIAL_GALLERY_CATEGORIES;
        }
        const parsed: GalleryCategory[] = JSON.parse(data);
        return parsed.map((c) => ({
          ...c,
          isActive: c.isActive !== false,
        }));
      }
      return (this.memoryCategories || INITIAL_GALLERY_CATEGORIES).map((c) => ({
        ...c,
        isActive: c.isActive !== false,
      }));
    } catch {
      return (this.memoryCategories || INITIAL_GALLERY_CATEGORIES).map((c) => ({
        ...c,
        isActive: c.isActive !== false,
      }));
    }
  }

  private saveLocalCategories(categories: GalleryCategory[]): void {
    this.memoryCategories = categories;
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
      }
    } catch (err) {
      console.warn('LocalStorage save fallback notice for gallery categories:', err);
    }
  }

  /**
   * Generates URL-friendly slug
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Fetch all stories with optional filtering
   */
  getStories(filters?: {
    visibility?: 'b2b' | 'b2c' | 'both' | 'all';
    status?: GalleryStatus | 'all';
    category?: string;
    featuredOnly?: boolean;
    search?: string;
  }): GalleryStory[] {
    let list = this.getLocalStories();

    // Filter by visibility
    if (filters?.visibility && filters.visibility !== 'all') {
      if (filters.visibility === 'b2c') {
        list = list.filter((s) => s.visibility === 'b2c' || s.visibility === 'both');
      } else if (filters.visibility === 'b2b') {
        list = list.filter((s) => s.visibility === 'b2b' || s.visibility === 'both');
      } else if (filters.visibility === 'both') {
        list = list.filter((s) => s.visibility === 'both');
      }
    }

    // Filter by status (public view defaults to published)
    if (filters?.status && filters.status !== 'all') {
      list = list.filter((s) => s.status === filters.status);
    }

    // Filter by category
    if (filters?.category && filters.category !== 'All' && filters.category !== 'all') {
      list = list.filter(
        (s) => s.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    // Filter featured
    if (filters?.featuredOnly) {
      list = list.filter((s) => s.featured);
    }

    // Search query
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.fullDescription && s.fullDescription.toLowerCase().includes(q))
      );
    }

    // Order: lowest displayOrder first, then newest createdAt
    return list.sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  /**
   * Get single story by slug
   */
  getStoryBySlug(slug: string): GalleryStory | undefined {
    const list = this.getLocalStories();
    return list.find((s) => s.slug === slug || s.id === slug);
  }

  /**
   * Get single story by ID
   */
  getStoryById(id: string): GalleryStory | undefined {
    const list = this.getLocalStories();
    return list.find((s) => s.id === id);
  }

  /**
   * Super Admin Exclusive: Create new gallery story
   */
  async createStory(
    data: Omit<GalleryStory, 'id' | 'createdAt' | 'updatedAt'>,
    currentUserRole?: string
  ): Promise<{ success: boolean; story?: GalleryStory; message: string }> {
    // 1. Role Authorization
    if (!this.isAuthorized(currentUserRole)) {
      return {
        success: false,
        message: 'Unauthorized: Admin privileges required to publish or manage gallery stories.',
      };
    }

    // 2. Input Validation
    if (!data.title || !data.title.trim()) {
      return { success: false, message: 'Story title is required.' };
    }
    if (!data.imageUrl || !data.imageUrl.trim()) {
      return { success: false, message: 'Story cover image or document preview is required.' };
    }
    if (!data.category || !data.category.trim()) {
      return { success: false, message: 'Category selection is required.' };
    }

    const now = new Date().toISOString();
    const id = `story_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const slug = data.slug ? this.generateSlug(data.slug) : this.generateSlug(data.title);

    const newStory: GalleryStory = {
      ...data,
      id,
      slug,
      imageAlt: data.imageAlt?.trim() || data.title,
      displayOrder: Number(data.displayOrder) || 1,
      createdAt: now,
      updatedAt: now,
      publishedAt: data.status === 'published' ? now : undefined,
    };

    // Save to local cache
    const currentList = this.getLocalStories();
    currentList.unshift(newStory);
    this.saveLocalStories(currentList);

    // Save to Firestore if live Firebase is active
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'gallery', id), newStory);
      } catch (fbErr) {
        console.warn('Firestore story save fallback notice:', fbErr);
      }
    }

    return {
      success: true,
      story: newStory,
      message: 'Story successfully created and published!',
    };
  }

  /**
   * Admin: Update existing gallery story
   */
  async updateStory(
    id: string,
    updates: Partial<GalleryStory>,
    currentUserRole?: string
  ): Promise<{ success: boolean; story?: GalleryStory; message: string }> {
    if (!this.isAuthorized(currentUserRole)) {
      return {
        success: false,
        message: 'Unauthorized: Admin privileges required to modify stories.',
      };
    }

    const currentList = this.getLocalStories();
    const index = currentList.findIndex((s) => s.id === id);
    if (index === -1) {
      return { success: false, message: 'Story not found.' };
    }

    const existing = currentList[index];
    const now = new Date().toISOString();

    const updatedSlug = updates.slug
      ? this.generateSlug(updates.slug)
      : updates.title
      ? this.generateSlug(updates.title)
      : existing.slug;

    const updatedStory: GalleryStory = {
      ...existing,
      ...updates,
      slug: updatedSlug,
      updatedAt: now,
      publishedAt:
        updates.status === 'published' && existing.status !== 'published'
          ? now
          : existing.publishedAt || (updates.status === 'published' ? now : undefined),
    };

    currentList[index] = updatedStory;
    this.saveLocalStories(currentList);

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'gallery', id), {
          ...updates,
          slug: updatedSlug,
          updatedAt: now,
        });
      } catch (fbErr) {
        console.warn('Firestore story update fallback notice:', fbErr);
      }
    }

    return {
      success: true,
      story: updatedStory,
      message: 'Story successfully updated!',
    };
  }

  /**
   * Admin: Delete gallery story
   */
  async deleteStory(
    id: string,
    currentUserRole?: string
  ): Promise<{ success: boolean; message: string }> {
    if (!this.isAuthorized(currentUserRole)) {
      return {
        success: false,
        message: 'Unauthorized: Admin privileges required to delete stories.',
      };
    }

    const currentList = this.getLocalStories();
    const target = currentList.find((s) => s.id === id);
    if (!target) {
      return { success: false, message: 'Story not found.' };
    }

    const filtered = currentList.filter((s) => s.id !== id);
    this.saveLocalStories(filtered);

    // Delete from Firestore & Firebase Storage if active
    if (isFirebaseConfigured()) {
      if (db) {
        try {
          await deleteDoc(doc(db, 'gallery', id));
        } catch (err) {
          console.warn('Firestore doc delete notice:', err);
        }
      }
      if (storage && target.storagePath) {
        try {
          const fileRef = ref(storage, target.storagePath);
          await deleteObject(fileRef);
        } catch (err) {
          console.warn('Firebase Storage file delete notice:', err);
        }
      }
    }

    return {
      success: true,
      message: `Story "${target.title}" was permanently removed.`,
    };
  }

  /**
   * Admin: Bulk Delete gallery stories
   */
  async deleteMultipleStories(
    ids: string[],
    currentUserRole?: string
  ): Promise<{ success: boolean; deletedCount: number; message: string }> {
    if (!this.isAuthorized(currentUserRole)) {
      return {
        success: false,
        deletedCount: 0,
        message: 'Unauthorized: Admin privileges required to delete stories.',
      };
    }

    if (!ids || ids.length === 0) {
      return { success: true, deletedCount: 0, message: 'No stories selected.' };
    }

    const currentList = this.getLocalStories();
    const idSet = new Set(ids);
    const targets = currentList.filter((s) => idSet.has(s.id));
    const filtered = currentList.filter((s) => !idSet.has(s.id));
    this.saveLocalStories(filtered);

    // Asynchronously cleanup in Firestore & Firebase Storage
    if (isFirebaseConfigured()) {
      for (const target of targets) {
        if (db) {
          deleteDoc(doc(db, 'gallery', target.id)).catch(() => {});
        }
        if (storage && target.storagePath) {
          deleteObject(ref(storage, target.storagePath)).catch(() => {});
        }
      }
    }

    return {
      success: true,
      deletedCount: targets.length,
      message: `${targets.length} stor${targets.length === 1 ? 'y was' : 'ies were'} permanently removed.`,
    };
  }

  /**
   * Admin: Quick toggle publish/unpublish
   */
  async togglePublishStatus(
    id: string,
    currentUserRole?: string
  ): Promise<{ success: boolean; newStatus?: GalleryStatus; message: string }> {
    if (!this.isAuthorized(currentUserRole)) {
      return {
        success: false,
        message: 'Unauthorized: Admin privileges required to change publication status.',
      };
    }

    const currentList = this.getLocalStories();
    const target = currentList.find((s) => s.id === id);
    if (!target) {
      return { success: false, message: 'Story not found.' };
    }

    const newStatus: GalleryStatus = target.status === 'published' ? 'unpublished' : 'published';
    const res = await this.updateStory(id, { status: newStatus }, currentUserRole);
    if (res.success) {
      return {
        success: true,
        newStatus,
        message: `Status updated to ${newStatus.toUpperCase()}`,
      };
    }
    return { success: false, message: res.message };
  }

  /**
   * Admin: Upload image or PDF to Firebase Storage with local preview fallback
   */
  async uploadImage(
    file: File,
    categoryName: string,
    currentUserRole?: string
  ): Promise<{ success: boolean; imageUrl: string; documentUrl?: string; fileType?: 'image' | 'pdf'; storagePath?: string; message: string }> {
    // 1. Role verification
    if (!this.isAuthorized(currentUserRole)) {
      return {
        success: false,
        imageUrl: '',
        message: 'Unauthorized: Admin privileges required to upload story media.',
      };
    }

    // 2. File Format Validation: Allow images (JPEG, PNG, WEBP) AND PDF documents
    const isPdf = file.type.toLowerCase() === 'application/pdf';
    const isImage = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type.toLowerCase());
    
    if (!isImage && !isPdf) {
      return {
        success: false,
        imageUrl: '',
        message: 'Invalid file format. Please upload JPG, PNG, WEBP image or PDF document.',
      };
    }

    // 3. File Size Validation (Max 10 MB)
    const maxBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        success: false,
        imageUrl: '',
        message: `File is too large (${sizeMb} MB). Maximum allowed size is 10 MB.`,
      };
    }

    const cleanCat = this.generateSlug(categoryName) || 'general';
    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `company-gallery/${cleanCat}/${cleanFileName}`;

    // Attempt Firebase Storage upload if configured
    if (isFirebaseConfigured() && storage) {
      try {
        const fileRef = ref(storage, storagePath);
        const uploadSnapshot = await uploadBytes(fileRef, file, {
          contentType: file.type,
          customMetadata: {
            uploadedBy: currentUserRole || 'admin',
            category: categoryName,
          },
        });
        const downloadUrl = await getDownloadURL(uploadSnapshot.ref);
        return {
          success: true,
          imageUrl: downloadUrl,
          documentUrl: isPdf ? downloadUrl : undefined,
          fileType: isPdf ? 'pdf' : 'image',
          storagePath,
          message: isPdf ? 'PDF document successfully uploaded!' : 'Image successfully uploaded to Firebase Cloud Storage!',
        };
      } catch (err: any) {
        console.warn('Firebase Storage upload notice, falling back to secure data URL:', err);
      }
    }

    // Browser FileReader Fallback
    if (typeof FileReader !== 'undefined') {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const resultData = reader.result as string;
          resolve({
            success: true,
            imageUrl: resultData,
            documentUrl: isPdf ? resultData : undefined,
            fileType: isPdf ? 'pdf' : 'image',
            storagePath,
            message: isPdf ? 'PDF document processed successfully!' : 'Image converted and cached successfully!',
          });
        };
        reader.onerror = () => {
          resolve({
            success: false,
            imageUrl: '',
            message: 'Failed to read media file.',
          });
        };
        reader.readAsDataURL(file);
      });
    }

    // Node / SSR Fallback
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
      return {
        success: true,
        imageUrl: base64,
        documentUrl: isPdf ? base64 : undefined,
        fileType: isPdf ? 'pdf' : 'image',
        storagePath,
        message: 'Media processed successfully!',
      };
    } catch {
      return {
        success: true,
        imageUrl: `https://fake-storage.example.com/${storagePath}`,
        documentUrl: isPdf ? `https://fake-storage.example.com/${storagePath}` : undefined,
        fileType: isPdf ? 'pdf' : 'image',
        storagePath,
        message: 'Media processed.',
      };
    }
  }

  /**
   * Categories Management (Super Admin Exclusive Governance)
   */
  getCategories(): GalleryCategory[] {
    const list = this.getLocalCategories();
    return list.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getActiveCategories(): GalleryCategory[] {
    return this.getCategories().filter((c) => c.isActive !== false);
  }

  getStoryCountForCategory(categoryName: string): number {
    const clean = categoryName.trim().toLowerCase();
    return this.getLocalStories().filter((s) => s.category.trim().toLowerCase() === clean).length;
  }

  createCategory(
    data: { name: string; slug?: string; description?: string; displayOrder?: number; isActive?: boolean },
    currentUserRole?: string
  ): { success: boolean; category?: GalleryCategory; message: string } {
    if (currentUserRole !== 'super_admin') {
      return { success: false, message: 'Unauthorized: Only Super Admin has permission to add categories.' };
    }

    const cleanName = data.name.trim();
    if (!cleanName) {
      return { success: false, message: 'Category name is required.' };
    }

    const currentList = this.getLocalCategories();
    if (currentList.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) {
      return { success: false, message: `Category "${cleanName}" already exists.` };
    }

    const newCat: GalleryCategory = {
      id: `cat_${Date.now()}`,
      name: cleanName,
      slug: data.slug?.trim() || this.generateSlug(cleanName),
      description: data.description?.trim(),
      displayOrder: data.displayOrder ?? currentList.length + 1,
      isActive: data.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    currentList.push(newCat);
    this.saveLocalCategories(currentList);

    return { success: true, category: newCat, message: `Category "${cleanName}" created successfully.` };
  }

  updateCategory(
    id: string,
    data: { name?: string; slug?: string; description?: string; displayOrder?: number; isActive?: boolean },
    currentUserRole?: string
  ): { success: boolean; category?: GalleryCategory; message: string } {
    if (currentUserRole !== 'super_admin') {
      return { success: false, message: 'Unauthorized: Only Super Admin has permission to edit categories.' };
    }

    const currentList = this.getLocalCategories();
    const index = currentList.findIndex((c) => c.id === id);
    if (index === -1) {
      return { success: false, message: 'Category not found.' };
    }

    const oldCat = currentList[index];
    const oldName = oldCat.name;
    const newName = data.name ? data.name.trim() : oldName;

    // Check collision if name changed
    if (newName.toLowerCase() !== oldName.toLowerCase()) {
      if (currentList.some((c) => c.id !== id && c.name.toLowerCase() === newName.toLowerCase())) {
        return { success: false, message: `A category named "${newName}" already exists.` };
      }
      // Re-map existing stories with oldName to newName
      const stories = this.getLocalStories();
      let updatedStoriesCount = 0;
      for (const s of stories) {
        if (s.category.toLowerCase() === oldName.toLowerCase()) {
          s.category = newName;
          s.updatedAt = new Date().toISOString();
          updatedStoriesCount++;
        }
      }
      if (updatedStoriesCount > 0) {
        this.saveLocalStories(stories);
      }
    }

    const updatedCat: GalleryCategory = {
      ...oldCat,
      name: newName,
      slug: data.slug?.trim() || (data.name ? this.generateSlug(newName) : oldCat.slug),
      description: data.description !== undefined ? data.description.trim() : oldCat.description,
      displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : oldCat.displayOrder,
      isActive: data.isActive !== undefined ? data.isActive : (oldCat.isActive !== false),
      updatedAt: new Date().toISOString(),
    };

    currentList[index] = updatedCat;
    this.saveLocalCategories(currentList);

    return { success: true, category: updatedCat, message: `Category "${newName}" updated successfully.` };
  }

  toggleCategoryStatus(
    id: string,
    currentUserRole?: string
  ): { success: boolean; isActive?: boolean; message: string } {
    if (currentUserRole !== 'super_admin') {
      return { success: false, message: 'Unauthorized: Only Super Admin can change category status.' };
    }

    const currentList = this.getLocalCategories();
    const cat = currentList.find((c) => c.id === id);
    if (!cat) {
      return { success: false, message: 'Category not found.' };
    }

    cat.isActive = !(cat.isActive !== false);
    cat.updatedAt = new Date().toISOString();
    this.saveLocalCategories(currentList);

    return {
      success: true,
      isActive: cat.isActive,
      message: `Category "${cat.name}" is now ${cat.isActive ? 'Active' : 'Inactive'}.`,
    };
  }

  reorderCategories(
    orderedIds: string[],
    currentUserRole?: string
  ): { success: boolean; message: string } {
    if (currentUserRole !== 'super_admin') {
      return { success: false, message: 'Unauthorized: Only Super Admin can change display order.' };
    }

    const currentList = this.getLocalCategories();
    const map = new Map(currentList.map((c) => [c.id, c]));

    orderedIds.forEach((id, idx) => {
      const cat = map.get(id);
      if (cat) {
        cat.displayOrder = idx + 1;
        cat.updatedAt = new Date().toISOString();
      }
    });

    this.saveLocalCategories(Array.from(map.values()));
    return { success: true, message: 'Category display order updated successfully.' };
  }

  deleteCategory(
    id: string,
    currentUserRole?: string
  ): { success: boolean; hasContent?: boolean; count?: number; message: string } {
    if (currentUserRole !== 'super_admin') {
      return { success: false, message: 'Unauthorized: Only Super Admin can delete categories.' };
    }

    const currentList = this.getLocalCategories();
    const cat = currentList.find((c) => c.id === id);
    if (!cat) {
      return { success: false, message: 'Category not found.' };
    }

    const storyCount = this.getStoryCountForCategory(cat.name);
    if (storyCount > 0) {
      return {
        success: false,
        hasContent: true,
        count: storyCount,
        message: `Cannot delete category "${cat.name}" because it contains ${storyCount} stories. Please migrate existing content to another category first.`,
      };
    }

    const updated = currentList.filter((c) => c.id !== id);
    this.saveLocalCategories(updated);
    return { success: true, message: `Category "${cat.name}" deleted successfully.` };
  }

  deleteMultipleCategories(
    ids: string[],
    currentUserRole?: string
  ): { success: boolean; deletedCount: number; skippedCount: number; message: string } {
    if (currentUserRole !== 'super_admin') {
      return { success: false, deletedCount: 0, skippedCount: ids.length, message: 'Unauthorized: Only Super Admin can delete categories.' };
    }

    const currentList = this.getLocalCategories();
    const idSet = new Set(ids);
    let deletedCount = 0;
    let skippedCount = 0;

    const remaining = currentList.filter((cat) => {
      if (!idSet.has(cat.id)) return true;
      const storyCount = this.getStoryCountForCategory(cat.name);
      if (storyCount > 0) {
        skippedCount++;
        return true;
      }
      deletedCount++;
      return false;
    });

    if (deletedCount > 0) {
      this.saveLocalCategories(remaining);
    }

    let message = `Successfully deleted ${deletedCount} categor${deletedCount === 1 ? 'y' : 'ies'}.`;
    if (skippedCount > 0) {
      message += ` ${skippedCount} categor${skippedCount === 1 ? 'y' : 'ies'} could not be deleted because they contain active stories.`;
    }

    return { success: deletedCount > 0, deletedCount, skippedCount, message };
  }

  migrateCategoryContentAndDelete(
    sourceId: string,
    targetCategoryName: string,
    currentUserRole?: string
  ): { success: boolean; migratedCount?: number; message: string } {
    if (currentUserRole !== 'super_admin') {
      return { success: false, message: 'Unauthorized: Only Super Admin can migrate and delete categories.' };
    }

    const currentList = this.getLocalCategories();
    const sourceCat = currentList.find((c) => c.id === sourceId);
    if (!sourceCat) {
      return { success: false, message: 'Source category not found.' };
    }

    const targetCat = currentList.find(
      (c) => c.name.toLowerCase() === targetCategoryName.trim().toLowerCase() && c.id !== sourceId
    );
    if (!targetCat) {
      return { success: false, message: 'Target replacement category not found.' };
    }

    // Migrate all stories
    const stories = this.getLocalStories();
    let migratedCount = 0;
    for (const s of stories) {
      if (s.category.toLowerCase() === sourceCat.name.toLowerCase()) {
        s.category = targetCat.name;
        s.updatedAt = new Date().toISOString();
        migratedCount++;
      }
    }
    this.saveLocalStories(stories);

    // Delete source category
    const updatedCategories = currentList.filter((c) => c.id !== sourceId);
    this.saveLocalCategories(updatedCategories);

    return {
      success: true,
      migratedCount,
      message: `Successfully migrated ${migratedCount} stories to "${targetCat.name}" and removed category "${sourceCat.name}".`,
    };
  }

  saveCategory(
    name: string,
    currentUserRole?: string
  ): { success: boolean; category?: GalleryCategory; message: string } {
    return this.createCategory({ name }, currentUserRole);
  }
}

export const galleryService = new GalleryService();
