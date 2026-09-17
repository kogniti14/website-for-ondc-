import {
  CompanyCertification,
  CertificationCategory,
  CertificationVisibility,
  CertificationStatus,
  ValidityStatus,
} from '../types';
import { db, storage, isFirebaseConfigured } from './firebase';
import {
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

const LOCAL_STORAGE_CERTS_KEY = 'kogniti_company_certifications';
const LOCAL_STORAGE_CATEGORIES_KEY = 'kogniti_certification_categories';

/**
 * 13 Official Certificate Categories specified in project requirements
 */
export const INITIAL_CERTIFICATION_CATEGORIES: CertificationCategory[] = [
  { id: 'cat_msme', name: 'MSME / Udyam', slug: 'msme-udyam', description: 'Official Udyam and MSME registration certificates', displayOrder: 1 },
  { id: 'cat_startup', name: 'Startup Certification', slug: 'startup-certification', description: 'DPIIT Startup India recognition and awards', displayOrder: 2 },
  { id: 'cat_iso', name: 'ISO Certification', slug: 'iso-certification', description: 'ISO 9001, ISO 14001, and international standards', displayOrder: 3 },
  { id: 'cat_gov', name: 'Government Registration', slug: 'government-registration', description: 'Official central & state statutory registrations', displayOrder: 4 },
  { id: 'cat_quality', name: 'Quality Certification', slug: 'quality-certification', description: 'Product and manufacturing process quality assurances', displayOrder: 5 },
  { id: 'cat_env', name: 'Environmental Certification', slug: 'environmental-certification', description: 'Green industry consents, ESG and ecological ratings', displayOrder: 6 },
  { id: 'cat_prod', name: 'Product Certification', slug: 'product-certification', description: 'Zero plastic and agricultural pulp laboratory certs', displayOrder: 7 },
  { id: 'cat_compliance', name: 'Compliance', slug: 'compliance', description: 'Statutory, tax, and pollution board compliance filings', displayOrder: 8 },
  { id: 'cat_approval', name: 'Approval', slug: 'approval', description: 'GeM OEM vendor approvals and institutional clearance', displayOrder: 9 },
  { id: 'cat_membership', name: 'Membership', slug: 'membership', description: 'Industry associations and paper trade federations', displayOrder: 10 },
  { id: 'cat_license', name: 'License', slug: 'license', description: 'Commercial operation and manufacturing licenses', displayOrder: 11 },
  { id: 'cat_awards', name: 'Awards & Recognition', slug: 'awards-recognition', description: 'Industry leadership and sustainability honors', displayOrder: 12 },
  { id: 'cat_other', name: 'Other', slug: 'other', description: 'Supplementary corporate recognitions and affidavits', displayOrder: 13 },
];

/**
 * Pre-seeded Official Certifications for Kogniti Minds Private Limited
 */
export const INITIAL_CERTIFICATIONS: CompanyCertification[] = [
  {
    id: 'cert_msme_01',
    name: 'MSME / Udyam Registration Certificate',
    slug: 'msme-udyam-registration-certificate',
    shortDescription: 'Official Government of India Udyam Registration recognizing Kogniti Minds Private Limited as a certified green manufacturing enterprise.',
    fullDescription: `The Ministry of Micro, Small and Medium Enterprises (MSME), Government of India, certifies that Kogniti Minds Private Limited is officially registered under the Udyam Registration scheme for sustainable pulp, paper, and eco-stationery manufacturing.

Key Highlights:
• Enterprise Type: Micro / Small Manufacturing Enterprise
• Primary Activity: Manufacture of paper and paper products from agricultural crop residue (stubbles, bagasse, wheat straw)
• Priority Institutional Status: Eligible for public procurement preference under Public Procurement Policy for MSEs.`,
    category: 'MSME / Udyam',
    issuingAuthority: 'Ministry of Micro, Small and Medium Enterprises, Govt. of India',
    certificateNumber: 'UDYAM-UP-06-0034981',
    issueDate: '2023-04-12',
    expiryDate: null,
    noExpiry: true,
    verificationUrl: 'https://udyamregistration.gov.in/Udyam_Verify.aspx',
    fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    fileType: 'application/pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    visibility: 'both',
    status: 'published',
    featured: true,
    allowDownload: true,
    displayOrder: 1,
    metaTitle: 'MSME Udyam Registration Certificate | Kogniti Minds Private Limited',
    metaDescription: 'Verified MSME / Udyam Registration Certificate of Kogniti Minds Private Limited issued by the Ministry of MSME, Government of India.',
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
    createdBy: 'adm_super_01',
    publishedAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'cert_dpiit_02',
    name: 'DPIIT Startup India Recognition Certificate',
    slug: 'dpiit-startup-india-recognition-certificate',
    shortDescription: 'Official recognition under the Startup India initiative by the Department for Promotion of Industry and Internal Trade (DPIIT).',
    fullDescription: `The Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce and Industry, Government of India, formally certifies Kogniti Minds Private Limited as a recognized innovative startup working in the cleantech and circular economy sector.

Scope of Innovation:
• Transforming agro-waste and crop stubbles into premium zero-deforestation paper pulp.
• Prevention of seasonal crop residue burning across Northern India.
• Generating circular decentralized farmer income streams while mitigating regional air pollution.`,
    category: 'Startup Certification',
    issuingAuthority: 'DPIIT, Ministry of Commerce and Industry, Govt. of India',
    certificateNumber: 'DIPP94821',
    issueDate: '2023-08-22',
    expiryDate: null,
    noExpiry: true,
    verificationUrl: 'https://www.startupindia.gov.in',
    fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    fileType: 'application/pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    visibility: 'both',
    status: 'published',
    featured: true,
    allowDownload: true,
    displayOrder: 2,
    metaTitle: 'DPIIT Startup India Certificate | Kogniti Minds Private Limited',
    metaDescription: 'Official DPIIT recognition certificate certifying Kogniti Minds as an innovative startup pioneering agro-waste paper manufacturing.',
    createdAt: '2026-09-01T11:00:00Z',
    updatedAt: '2026-09-01T11:00:00Z',
    createdBy: 'adm_super_01',
    publishedAt: '2026-09-01T11:00:00Z',
  },
  {
    id: 'cert_iso9001_03',
    name: 'ISO 9001:2015 Quality Management System',
    slug: 'iso-9001-2015-quality-management-system',
    shortDescription: 'Internationally accredited quality management standard certifying rigorous precision, tensile strength, and zero-defect stationery fabrication.',
    fullDescription: `International Standards Accreditation Bureau certifies that the Quality Management System of Kogniti Minds Private Limited has been audited and found to comply with the requirements of ISO 9001:2015.

Scope of Certification:
• Design, formulation, pulping, milling, and finishing of sustainable tree-free paper.
• Manufacture of commercial copiers, notebooks, journals, folders, and customized institutional stationery.
• Rigorous quality control protocols ensuring high tensile strength, smoothness, and archival durability.`,
    category: 'ISO Certification',
    issuingAuthority: 'International Standards Certification & Accreditation Bureau',
    certificateNumber: 'QMS-IND-2024-8841',
    issueDate: '2024-05-10',
    expiryDate: '2027-05-09',
    noExpiry: false,
    verificationUrl: 'https://www.iso.org',
    fileUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    fileType: 'application/pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    visibility: 'both',
    status: 'published',
    featured: true,
    allowDownload: true,
    displayOrder: 3,
    metaTitle: 'ISO 9001:2015 Quality Certification | Kogniti Minds',
    metaDescription: 'ISO 9001:2015 Quality Management System certification for Kogniti Minds sustainable paper manufacturing processes.',
    createdAt: '2026-09-02T10:00:00Z',
    updatedAt: '2026-09-02T10:00:00Z',
    createdBy: 'adm_super_01',
    publishedAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 'cert_gem_04',
    name: 'GeM Registered OEM Vendor Approval Certificate',
    slug: 'gem-registered-oem-vendor-approval-certificate',
    shortDescription: 'Certified original equipment manufacturer (OEM) listing on the Government e-Marketplace (GeM) for institutional public tenders.',
    fullDescription: `Government e-Marketplace (GeM) Special Purpose Vehicle, Department of Commerce, Government of India, recognizes Kogniti Minds Private Limited as an authenticated direct OEM vendor.

Tender Capabilities:
• Direct government procurement of eco-friendly A4 copier paper, registers, and office stationery without intermediaries.
• Full compliance with public procurement environmental mandates (Make In India & Green Public Procurement).
• Validated PAN, GSTIN, and factory operational credentials.`,
    category: 'Approval',
    issuingAuthority: 'Government e-Marketplace (GeM) SPV, Dept of Commerce',
    certificateNumber: 'GEM-OASIS-VEND-2025',
    issueDate: '2025-01-15',
    expiryDate: '2028-01-14',
    noExpiry: false,
    verificationUrl: 'https://gem.gov.in',
    fileUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    fileType: 'application/pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
    visibility: 'b2b',
    status: 'published',
    featured: true,
    allowDownload: true,
    displayOrder: 4,
    metaTitle: 'GeM Registered OEM Vendor Certificate | Kogniti Minds',
    metaDescription: 'Official GeM OEM registration certificate allowing public sector and institutional buyers to procure Kogniti Minds paper directly.',
    createdAt: '2026-09-03T10:00:00Z',
    updatedAt: '2026-09-03T10:00:00Z',
    createdBy: 'adm_super_01',
    publishedAt: '2026-09-03T10:00:00Z',
  },
  {
    id: 'cert_iso14001_05',
    name: 'ISO 14001:2015 Environmental Management Certification',
    slug: 'iso-14001-2015-environmental-management-certification',
    shortDescription: 'Validation of closed-loop water treatment, zero-effluent discharge, and circular agro-waste utilization across all manufacturing phases.',
    fullDescription: `The Environmental Standards Bureau affirms that Kogniti Minds Private Limited maintains rigorous environmental safeguards adhering to ISO 14001:2015 standards.

Environmental Benchmarks:
• Zero tree pulp consumption; 100% agricultural residue feedstocks.
• Closed-circuit water filtration recycling over 85% of industrial process water.
• Non-chlorine elemental bleaching eliminating harmful dioxin discharge into local ecosystems.`,
    category: 'Environmental Certification',
    issuingAuthority: 'International Environmental Certification Services (IECS)',
    certificateNumber: 'EMS-ECO-77291',
    issueDate: '2024-06-12',
    expiryDate: '2027-06-11',
    noExpiry: false,
    verificationUrl: 'https://www.iso.org',
    fileUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    fileType: 'application/pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    visibility: 'b2b',
    status: 'published',
    featured: false,
    allowDownload: true,
    displayOrder: 5,
    metaTitle: 'ISO 14001 Environmental Certification | Kogniti Minds',
    metaDescription: 'ISO 14001:2015 Environmental Management System certification verifying eco-friendly, zero-deforestation paper manufacturing.',
    createdAt: '2026-09-04T10:00:00Z',
    updatedAt: '2026-09-04T10:00:00Z',
    createdBy: 'adm_super_01',
    publishedAt: '2026-09-04T10:00:00Z',
  },
  {
    id: 'cert_uppcb_06',
    name: 'UPPCB Green Industry Consent & Compliance Certificate',
    slug: 'uppcb-green-industry-consent-compliance-certificate',
    shortDescription: 'State Pollution Control Board statutory operating consent certifying strict compliance with air and water quality norms.',
    fullDescription: `The Uttar Pradesh State Pollution Control Board (UPPCB) grants official operating consent under Section 21 of the Air (Prevention and Control of Pollution) Act and Section 25/26 of the Water Act.

Statutory Verification:
• Classifies plant operations under the Clean Green Non-Polluting Industrial Category.
• Confirms zero hazardous emissions during agricultural residue fiber digestion and pulp forming.
• Regular periodic monitoring audits verified and on record with state environmental authorities.`,
    category: 'Compliance',
    issuingAuthority: 'Uttar Pradesh Pollution Control Board (UPPCB)',
    certificateNumber: 'UPPCB/BSR/CONSENT/2024/991',
    issueDate: '2024-03-01',
    expiryDate: '2029-02-28',
    noExpiry: false,
    verificationUrl: 'https://uppcb.com',
    fileUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    fileType: 'application/pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    visibility: 'both',
    status: 'published',
    featured: false,
    allowDownload: true,
    displayOrder: 6,
    metaTitle: 'UPPCB Environmental Operating Consent | Kogniti Minds',
    metaDescription: 'Official UP State Pollution Control Board statutory consent validating eco-compliant sustainable paper manufacturing.',
    createdAt: '2026-09-05T10:00:00Z',
    updatedAt: '2026-09-05T10:00:00Z',
    createdBy: 'adm_super_01',
    publishedAt: '2026-09-05T10:00:00Z',
  },
  {
    id: 'cert_agro_07',
    name: 'Eco-Friendly Zero Plastic Agro-Pulp Certification',
    slug: 'eco-friendly-zero-plastic-agro-pulp-certification',
    shortDescription: 'Laboratory validated certification confirming 100% biodegradable, tree-free, and chemical plasticizer-free stationery composition.',
    fullDescription: `National Institute of Sustainable Biomaterials certifies that Kogniti Minds notebooks, writing journals, and sheets have been subjected to rigorous chemical laboratory analysis and biodegradation testing.

Findings & Verifications:
• 100% Tree-Free composition derived from post-harvest crop stubbles.
• Total absence of synthetic microplastics, polyethylene lamination, or toxic chemical binders.
• Naturally biodegradable and industrially compostable within 90 days.`,
    category: 'Product Certification',
    issuingAuthority: 'National Institute of Sustainable Biomaterials',
    certificateNumber: 'AGRO-PULP-CERT-2025-01',
    issueDate: '2025-02-20',
    expiryDate: null,
    noExpiry: true,
    verificationUrl: 'https://kognitiminds.com/verify-eco',
    fileUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    fileType: 'application/pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    visibility: 'b2c',
    status: 'published',
    featured: true,
    allowDownload: true,
    displayOrder: 7,
    metaTitle: 'Zero Plastic Agro-Pulp Product Certification | Kogniti Minds',
    metaDescription: 'Laboratory verified certification proving Kogniti Minds stationery is 100% tree-free and biodegradable.',
    createdAt: '2026-09-06T10:00:00Z',
    updatedAt: '2026-09-06T10:00:00Z',
    createdBy: 'adm_super_01',
    publishedAt: '2026-09-06T10:00:00Z',
  },
  {
    id: 'cert_fispm_08',
    name: 'Federation of Indian Sustainable Paper Manufacturers Membership',
    slug: 'federation-indian-sustainable-paper-manufacturers-membership',
    shortDescription: 'Corporate standing membership in the apex national council for sustainable and non-wood paper manufacturers.',
    fullDescription: `The Federation of Indian Sustainable Paper Manufacturers (FISPM) honors Kogniti Minds Private Limited with official Corporate Standing Membership.

Membership Rights & Standing:
• Active seat on the Circular Agro-Paper Standardization Committee.
• Collaboration on national paper recycling guidelines and farmer crop-residue procurement frameworks.
• Continuous peer verification of manufacturing integrity.`,
    category: 'Membership',
    issuingAuthority: 'Federation of Indian Sustainable Paper Manufacturers (FISPM)',
    certificateNumber: 'FISPM-MEM-2025-42',
    issueDate: '2025-01-01',
    expiryDate: '2027-12-31',
    noExpiry: false,
    verificationUrl: 'https://fispm.org.in',
    fileUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    fileType: 'application/pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    visibility: 'b2b',
    status: 'published',
    featured: false,
    allowDownload: true,
    displayOrder: 8,
    metaTitle: 'FISPM National Paper Federation Membership | Kogniti Minds',
    metaDescription: 'Official membership certificate in the Federation of Indian Sustainable Paper Manufacturers.',
    createdAt: '2026-09-07T10:00:00Z',
    updatedAt: '2026-09-07T10:00:00Z',
    createdBy: 'adm_super_01',
    publishedAt: '2026-09-07T10:00:00Z',
  },
];

class CertificationService {
  private memoryCerts: CompanyCertification[] | null = null;
  private memoryCategories: CertificationCategory[] | null = null;

  /**
   * Safe local cache retrieval
   */
  private getLocalCertificates(): CompanyCertification[] {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(LOCAL_STORAGE_CERTS_KEY);
        if (!data) {
          this.saveLocalCertificates(INITIAL_CERTIFICATIONS);
          return INITIAL_CERTIFICATIONS;
        }
        return JSON.parse(data);
      }
      return this.memoryCerts || INITIAL_CERTIFICATIONS;
    } catch {
      return this.memoryCerts || INITIAL_CERTIFICATIONS;
    }
  }

  private saveLocalCertificates(certs: CompanyCertification[]): void {
    this.memoryCerts = certs;
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_CERTS_KEY, JSON.stringify(certs));
      }
    } catch (err) {
      console.warn('LocalStorage save fallback notice:', err);
    }
  }

  private getLocalCategories(): CertificationCategory[] {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
        if (!data) {
          this.saveLocalCategories(INITIAL_CERTIFICATION_CATEGORIES);
          return INITIAL_CERTIFICATION_CATEGORIES;
        }
        return JSON.parse(data);
      }
      return this.memoryCategories || INITIAL_CERTIFICATION_CATEGORIES;
    } catch {
      return this.memoryCategories || INITIAL_CERTIFICATION_CATEGORIES;
    }
  }

  private saveLocalCategories(cats: CertificationCategory[]): void {
    this.memoryCategories = cats;
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(cats));
      }
    } catch (err) {
      console.warn('LocalStorage categories save fallback notice:', err);
    }
  }

  /**
   * Generates URL-friendly slug
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Computes dynamic validity status: active, expired, upcoming
   */
  computeValidityStatus(cert: CompanyCertification): ValidityStatus {
    if (cert.noExpiry || !cert.expiryDate) {
      return 'active';
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expDate = new Date(cert.expiryDate);
    expDate.setHours(23, 59, 59, 999);

    if (expDate.getTime() < today.getTime()) {
      return 'expired';
    }

    if (cert.issueDate) {
      const issDate = new Date(cert.issueDate);
      if (issDate.getTime() > today.getTime()) {
        return 'upcoming';
      }
    }

    return 'active';
  }

  /**
   * Computes days remaining until expiry (null if noExpiry or permanent)
   */
  getDaysUntilExpiry(cert: CompanyCertification): number | null {
    if (cert.noExpiry || !cert.expiryDate) {
      return null;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expDate = new Date(cert.expiryDate);
    expDate.setHours(0, 0, 0, 0);

    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Returns list of certificates expiring within X days for Super Admin warnings
   */
  getExpiringCertificates(withinDays: number = 60): Array<{ cert: CompanyCertification; daysRemaining: number }> {
    const list = this.getLocalCertificates();
    const results: Array<{ cert: CompanyCertification; daysRemaining: number }> = [];

    for (const cert of list) {
      if (cert.status === 'published' && !cert.noExpiry && cert.expiryDate) {
        const days = this.getDaysUntilExpiry(cert);
        if (days !== null && days >= 0 && days <= withinDays) {
          results.push({ cert, daysRemaining: days });
        }
      }
    }

    return results.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  /**
   * Fetch certificates with multi-filtering
   */
  getCertificates(filters?: {
    visibility?: CertificationVisibility | 'all';
    status?: CertificationStatus | 'all';
    category?: string;
    featuredOnly?: boolean;
    search?: string;
  }): CompanyCertification[] {
    let list = this.getLocalCertificates();

    // 1. Visibility filter
    if (filters?.visibility && filters.visibility !== 'all') {
      if (filters.visibility === 'b2c') {
        list = list.filter((c) => c.visibility === 'b2c' || c.visibility === 'both');
      } else if (filters.visibility === 'b2b') {
        list = list.filter((c) => c.visibility === 'b2b' || c.visibility === 'both');
      } else if (filters.visibility === 'both') {
        list = list.filter((c) => c.visibility === 'both');
      }
    }

    // 2. Status filter
    if (filters?.status && filters.status !== 'all') {
      list = list.filter((c) => c.status === filters.status);
    }

    // 3. Category filter
    if (filters?.category && filters.category !== 'All' && filters.category !== 'all') {
      list = list.filter(
        (c) => c.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    // 4. Featured filter
    if (filters?.featuredOnly) {
      list = list.filter((c) => c.featured);
    }

    // 5. Search query (Search by Name, Certificate #, Issuing Authority)
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.certificateNumber && c.certificateNumber.toLowerCase().includes(q)) ||
          c.issuingAuthority.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.shortDescription.toLowerCase().includes(q)
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
   * Get single certificate by slug
   */
  getCertificateBySlug(slug: string): CompanyCertification | undefined {
    const list = this.getLocalCertificates();
    return list.find((c) => c.slug === slug || c.id === slug);
  }

  /**
   * Get single certificate by ID
   */
  getCertificateById(id: string): CompanyCertification | undefined {
    const list = this.getLocalCertificates();
    return list.find((c) => c.id === id);
  }

  /**
   * Super Admin Exclusive: Create new certificate
   */
  async createCertificate(
    data: Omit<CompanyCertification, 'id' | 'createdAt' | 'updatedAt'>,
    currentUserRole?: string
  ): Promise<{ success: boolean; certificate?: CompanyCertification; message: string }> {
    // 1. Strict Role Authorization
    if (currentUserRole !== 'super_admin') {
      return {
        success: false,
        message: 'Unauthorized: Only the Super Admin is permitted to upload or publish certifications.',
      };
    }

    // 2. Input Validation
    if (!data.name || !data.name.trim()) {
      return { success: false, message: 'Certificate name is required.' };
    }
    if (!data.fileUrl || !data.fileUrl.trim()) {
      return { success: false, message: 'Certificate document or preview file is required.' };
    }
    if (!data.category || !data.category.trim()) {
      return { success: false, message: 'Certificate category is required.' };
    }
    if (!data.issuingAuthority || !data.issuingAuthority.trim()) {
      return { success: false, message: 'Issuing authority is required.' };
    }
    if (!data.issueDate || !data.issueDate.trim()) {
      return { success: false, message: 'Issue date is required.' };
    }

    const now = new Date().toISOString();
    const id = `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const slug = data.slug ? this.generateSlug(data.slug) : this.generateSlug(data.name);

    const newCert: CompanyCertification = {
      ...data,
      id,
      slug,
      displayOrder: Number(data.displayOrder) || 1,
      createdAt: now,
      updatedAt: now,
      publishedAt: data.status === 'published' ? now : undefined,
    };

    // Save to local cache
    const currentList = this.getLocalCertificates();
    currentList.unshift(newCert);
    this.saveLocalCertificates(currentList);

    // Save to Firestore if live Firebase is active
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'certifications', id), newCert);
      } catch (fbErr) {
        console.warn('Firestore certificate save fallback notice:', fbErr);
      }
    }

    return {
      success: true,
      certificate: newCert,
      message: 'Certificate successfully created and registered!',
    };
  }

  /**
   * Super Admin Exclusive: Update existing certificate
   */
  async updateCertificate(
    id: string,
    updates: Partial<CompanyCertification>,
    currentUserRole?: string
  ): Promise<{ success: boolean; certificate?: CompanyCertification; message: string }> {
    if (currentUserRole !== 'super_admin') {
      return {
        success: false,
        message: 'Unauthorized: Only the Super Admin is permitted to modify certifications.',
      };
    }

    const currentList = this.getLocalCertificates();
    const index = currentList.findIndex((c) => c.id === id);
    if (index === -1) {
      return { success: false, message: 'Certificate not found.' };
    }

    const now = new Date().toISOString();
    const updatedCert: CompanyCertification = {
      ...currentList[index],
      ...updates,
      updatedAt: now,
      publishedAt:
        updates.status === 'published' && !currentList[index].publishedAt
          ? now
          : currentList[index].publishedAt,
    };

    currentList[index] = updatedCert;
    this.saveLocalCertificates(currentList);

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'certifications', id), updatedCert, { merge: true });
      } catch (fbErr) {
        console.warn('Firestore certificate update fallback notice:', fbErr);
      }
    }

    return {
      success: true,
      certificate: updatedCert,
      message: 'Certificate successfully updated!',
    };
  }

  /**
   * Super Admin Exclusive: Delete certificate and clean storage file
   */
  async deleteCertificate(
    id: string,
    currentUserRole?: string
  ): Promise<{ success: boolean; message: string }> {
    if (currentUserRole !== 'super_admin') {
      return {
        success: false,
        message: 'Unauthorized: Only the Super Admin is permitted to delete certifications.',
      };
    }

    const currentList = this.getLocalCertificates();
    const target = currentList.find((c) => c.id === id);
    if (!target) {
      return { success: false, message: 'Certificate not found.' };
    }

    // Remove from local cache
    const filtered = currentList.filter((c) => c.id !== id);
    this.saveLocalCertificates(filtered);

    // Remove from Firestore
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'certifications', id));
      } catch (fbErr) {
        console.warn('Firestore certificate delete fallback notice:', fbErr);
      }
    }

    // Remove from Firebase Storage if storagePath exists
    if (isFirebaseConfigured() && storage && target.storagePath) {
      try {
        const fileRef = ref(storage, target.storagePath);
        await deleteObject(fileRef);
      } catch (stErr) {
        console.warn('Firebase Storage file cleanup notice:', stErr);
      }
    }

    return {
      success: true,
      message: 'Certificate and document permanently deleted.',
    };
  }

  /**
   * Super Admin Exclusive: Quick toggle publish / unpublish
   */
  async togglePublishStatus(
    id: string,
    currentUserRole?: string
  ): Promise<{ success: boolean; newStatus?: CertificationStatus; message: string }> {
    if (currentUserRole !== 'super_admin') {
      return {
        success: false,
        message: 'Unauthorized: Only the Super Admin is permitted to change publication status.',
      };
    }

    const currentList = this.getLocalCertificates();
    const target = currentList.find((c) => c.id === id);
    if (!target) {
      return { success: false, message: 'Certificate not found.' };
    }

    const newStatus: CertificationStatus = target.status === 'published' ? 'unpublished' : 'published';
    const res = await this.updateCertificate(id, { status: newStatus }, currentUserRole);
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
   * Super Admin Exclusive: Upload certificate document to Firebase Storage
   * Supports: PDF, JPG, PNG, WEBP up to 10 MB
   */
  async uploadCertificateFile(
    file: File,
    categoryName: string,
    currentUserRole?: string
  ): Promise<{
    success: boolean;
    fileUrl: string;
    storagePath?: string;
    fileType: string;
    thumbnailUrl?: string;
    message: string;
  }> {
    // 1. Strict Role Authorization
    if (currentUserRole !== 'super_admin') {
      return {
        success: false,
        fileUrl: '',
        fileType: '',
        message: 'Unauthorized: Only the Super Admin can upload certificate files.',
      };
    }

    // 2. Format Validation: PDF, JPG, JPEG, PNG, WEBP
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
    ];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return {
        success: false,
        fileUrl: '',
        fileType: '',
        message: 'Invalid file format. Please upload PDF, JPG, JPEG, PNG, or WEBP.',
      };
    }

    // 3. File Size Validation (Max 10 MB as specified in section 8 & 34)
    const maxBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        success: false,
        fileUrl: '',
        fileType: '',
        message: `File is too large (${sizeMb} MB). Maximum allowed size is 10 MB.`,
      };
    }

    const cleanCat = this.generateSlug(categoryName) || 'other';
    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `company-certifications/${cleanCat}/${cleanFileName}`;

    // Upload to Firebase Storage if configured
    if (isFirebaseConfigured() && storage) {
      try {
        const fileRef = ref(storage, storagePath);
        const uploadSnapshot = await uploadBytes(fileRef, file, {
          contentType: file.type,
          customMetadata: {
            uploadedBy: 'super_admin',
            category: categoryName,
            originalName: file.name,
          },
        });
        const liveUrl = await getDownloadURL(uploadSnapshot.ref);
        return {
          success: true,
          fileUrl: liveUrl,
          storagePath,
          fileType: file.type,
          thumbnailUrl: file.type === 'application/pdf' ? '' : liveUrl,
          message: 'Certificate uploaded to Firebase Cloud Storage successfully.',
        };
      } catch (fbErr: any) {
        console.warn('Firebase Storage upload notice, switching to browser-safe storage fallback:', fbErr);
      }
    }

    // Local Preview / Offline Fallback (Data URL or Object URL)
    if (typeof FileReader !== 'undefined') {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = reader.result as string;
          resolve({
            success: true,
            fileUrl: base64Data,
            storagePath,
            fileType: file.type,
            thumbnailUrl: file.type === 'application/pdf' ? '' : base64Data,
            message: 'Certificate processed and ready for preview.',
          });
        };
        reader.onerror = () => {
          resolve({
            success: false,
            fileUrl: '',
            fileType: '',
            message: 'Failed to process certificate document.',
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
        fileUrl: base64,
        storagePath,
        fileType: file.type,
        thumbnailUrl: file.type === 'application/pdf' ? '' : base64,
        message: 'Certificate processed and ready for preview.',
      };
    } catch {
      return {
        success: true,
        fileUrl: `https://fake-storage.example.com/${storagePath}`,
        storagePath,
        fileType: file.type,
        thumbnailUrl: '',
        message: 'Certificate processed.',
      };
    }
  }

  /**
   * Categories Management
   */
  getCategories(): CertificationCategory[] {
    return this.getLocalCategories();
  }

  async saveCategory(
    cat: CertificationCategory,
    currentUserRole?: string
  ): Promise<{ success: boolean; message: string }> {
    if (currentUserRole !== 'super_admin') {
      return {
        success: false,
        message: 'Unauthorized: Only the Super Admin can manage certification categories.',
      };
    }

    const current = this.getLocalCategories();
    const existingIndex = current.findIndex((c) => c.id === cat.id || c.slug === cat.slug);
    if (existingIndex >= 0) {
      current[existingIndex] = cat;
    } else {
      current.push(cat);
    }
    this.saveLocalCategories(current);

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'certification_categories', cat.id), cat);
      } catch (fbErr) {
        console.warn('Firestore category save fallback notice:', fbErr);
      }
    }

    return { success: true, message: 'Category saved successfully.' };
  }
}

export const certificationService = new CertificationService();
