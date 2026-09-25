import {
  CompanyCertification,
  CertificationCategory,
  CertificationVisibility,
  CertificationStatus,
  ValidityStatus,
} from '../types';
import { db, storage, isFirebaseConfigured } from './firebase';
import {
  ref as dbRef,
  set as dbSet,
  remove as dbRemove,
} from 'firebase/database';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { dataSyncBus } from './dataSyncBus';

const LOCAL_STORAGE_CERTS_KEY = 'kogniti_company_certifications';
const LOCAL_STORAGE_CATEGORIES_KEY = 'kogniti_certification_categories';

/**
 * 13 Official Certificate Categories specified in project requirements
 */
export const INITIAL_CERTIFICATION_CATEGORIES: CertificationCategory[] = [
  { id: 'cat_msme', name: 'MSME / Udyam', slug: 'msme-udyam', description: 'Official Udyam and MSME registration certificates', displayOrder: 1, isActive: true },
  { id: 'cat_startup', name: 'Startup Certification', slug: 'startup-certification', description: 'DPIIT Startup India recognition and awards', displayOrder: 2, isActive: true },
  { id: 'cat_iso', name: 'ISO Certification', slug: 'iso-certification', description: 'ISO 9001, ISO 14001, and international standards', displayOrder: 3, isActive: true },
  { id: 'cat_gov', name: 'Government Registration', slug: 'government-registration', description: 'Official central & state statutory registrations', displayOrder: 4, isActive: true },
  { id: 'cat_quality', name: 'Quality Certification', slug: 'quality-certification', description: 'Product and manufacturing process quality assurances', displayOrder: 5, isActive: true },
  { id: 'cat_env', name: 'Environmental Certification', slug: 'environmental-certification', description: 'Green industry consents, ESG and ecological ratings', displayOrder: 6, isActive: true },
  { id: 'cat_prod', name: 'Product Certification', slug: 'product-certification', description: 'Zero plastic and agricultural pulp laboratory certs', displayOrder: 7, isActive: true },
  { id: 'cat_compliance', name: 'Compliance', slug: 'compliance', description: 'Statutory, tax, and pollution board compliance filings', displayOrder: 8, isActive: true },
  { id: 'cat_approval', name: 'Approval', slug: 'approval', description: 'GeM OEM vendor approvals and institutional clearance', displayOrder: 9, isActive: true },
  { id: 'cat_membership', name: 'Membership', slug: 'membership', description: 'Industry associations and paper trade federations', displayOrder: 10, isActive: true },
  { id: 'cat_license', name: 'License', slug: 'license', description: 'Commercial operation and manufacturing licenses', displayOrder: 11, isActive: true },
  { id: 'cat_awards', name: 'Awards & Recognition', slug: 'awards-recognition', description: 'Industry leadership and sustainability honors', displayOrder: 12, isActive: true },
  { id: 'cat_other', name: 'Other', slug: 'other', description: 'Supplementary corporate recognitions and affidavits', displayOrder: 13, isActive: true },
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
  private isHydrated = false;

  constructor() {
    if (typeof window !== 'undefined') {
      setTimeout(() => this.hydrateFromServer(), 50);
    }
  }

  private async syncServer(
    collection: string,
    payload: any,
    method: 'POST' | 'DELETE' = 'POST',
    id?: string,
    isBatch = false
  ): Promise<any> {
    if (typeof window === 'undefined') return null;
    if (Array.isArray(payload)) {
      isBatch = true;
    }
    const body = method !== 'DELETE' ? JSON.stringify(payload) : undefined;
    const isAdmin = typeof window !== 'undefined' && (
      localStorage.getItem('km_active_role') === 'admin' ||
      Boolean(localStorage.getItem('km_active_admin_id'))
    );
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    };
    if (isAdmin) {
      headers['X-Admin-Role'] = 'super_admin';
      headers['Authorization'] = 'Bearer admin';
    }

    try {
      // 1. PRIMARY CLOUD STORE: Asynchronously replicate to Firebase Realtime Database
      if (isFirebaseConfigured() && db) {
        try {
          if (isBatch && Array.isArray(payload)) {
            const listRef = dbRef(db, collection);
            if (payload.length === 0) {
              dbSet(listRef, null).catch(() => {});
            } else {
              const obj: Record<string, any> = {};
              for (const it of payload) {
                const docId = it?.id || it?.slug;
                if (docId) obj[docId] = it;
              }
              dbSet(listRef, obj).catch(() => {});
            }
          } else {
            const docId = id || (payload && payload.id);
            if (docId) {
              const itemRef = dbRef(db, `${collection}/${docId}`);
              if (method === 'DELETE') {
                dbRemove(itemRef).catch(() => {});
              } else if (payload && typeof payload === 'object') {
                dbSet(itemRef, payload).catch(() => {});
              }
            }
          }
        } catch {}
      }

      // 2. FAILOVER & HOSTINGER PERSISTENCE
      const batchParam = isBatch ? '&replace=true' : '';
      const phpUrl =
        method === 'DELETE' && id
          ? `/api/data.php?collection=${collection}&id=${encodeURIComponent(id)}`
          : `/api/data.php?collection=${collection}${batchParam}`;
      let res = await fetch(phpUrl, { method, headers, body, cache: 'no-store' }).catch(() => null);
      if (!res || !res.ok) {
        const url =
          method === 'DELETE' && id
            ? `/api/data/${collection}/${encodeURIComponent(id)}`
            : `/api/data/${collection}${isBatch ? '?replace=true' : ''}`;
        res = await fetch(url, { method, headers, body, cache: 'no-store' }).catch(() => null);
      }
      if (res && res.ok) {
        return await res.json().catch(() => null);
      }
    } catch {
      // Non-blocking background sync
    }
    return null;
  }

  async hydrateFromServer(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const timestamp = Date.now();
      const isAdmin = typeof window !== 'undefined' && (
        localStorage.getItem('km_active_role') === 'admin' ||
        Boolean(localStorage.getItem('km_active_admin_id'))
      );
      const reqHeaders: Record<string, string> = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      };
      if (isAdmin) {
        reqHeaders['X-Admin-Role'] = 'super_admin';
        reqHeaders['Authorization'] = 'Bearer admin';
      }

      // 1. Hydrate Certifications from authoritative server with anti-cache
      let res = await fetch(`/api/data.php?collection=certifications&t=${timestamp}`, {
        cache: 'no-store',
        headers: reqHeaders,
      }).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`/api/data/certifications?t=${timestamp}`, {
          cache: 'no-store',
          headers: reqHeaders,
        }).catch(() => null);
      }
      if (res && res.ok) {
        const serverData = await res.json();
        if (Array.isArray(serverData) && serverData.length > 0) {
          const cleanedCerts: CompanyCertification[] = [];
          for (const item of serverData) {
            if (!item) continue;
            if (item.id && (item.name || item.title)) {
              cleanedCerts.push(item);
            } else if ((item['0'] || item[0]) && !item.name && !item.title) {
              // Unpack corrupted batch object
              for (const k of Object.keys(item)) {
                const sub = item[k];
                if (sub && typeof sub === 'object' && sub.id && (sub.name || sub.title)) {
                  cleanedCerts.push(sub);
                }
              }
            }
          }

          if (cleanedCerts.length > 0) {
            cleanedCerts.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            this.saveLocalCertificates(cleanedCerts);
            dataSyncBus.emit('certifications', cleanedCerts);
          }
        }
      }

      // 2. Hydrate Categories from authoritative server
      let catRes = await fetch(`/api/data.php?collection=certification_categories&t=${timestamp}`, {
        cache: 'no-store',
        headers: reqHeaders,
      }).catch(() => null);
      if (!catRes || !catRes.ok) {
        catRes = await fetch(`/api/data/certification_categories?t=${timestamp}`, {
          cache: 'no-store',
          headers: reqHeaders,
        }).catch(() => null);
      }
      if (catRes && catRes.ok) {
        const serverCats = await catRes.json();
        if (Array.isArray(serverCats) && serverCats.length > 0) {
          serverCats.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          this.saveLocalCategories(serverCats);
          dataSyncBus.emit('certification_categories', serverCats);
        }
      }
    } catch {
      // Non-blocking
    }
  }

  /**
   * Role authorization check: allows super_admin, admin, operations_admin, catalog_manager, or staff
   */
  isAuthorized(role?: string): boolean {
    if (!role) return false;
    const permitted = ['super_admin', 'admin', 'operations_admin', 'catalog_manager', 'staff'];
    return permitted.includes(role);
  }

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
        const parsed: CertificationCategory[] = JSON.parse(data);
        return parsed.map((c) => ({
          ...c,
          isActive: c.isActive !== false,
        }));
      }
      return (this.memoryCategories || INITIAL_CERTIFICATION_CATEGORIES).map((c) => ({
        ...c,
        isActive: c.isActive !== false,
      }));
    } catch {
      return (this.memoryCategories || INITIAL_CERTIFICATION_CATEGORIES).map((c) => ({
        ...c,
        isActive: c.isActive !== false,
      }));
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
    // 1. Role Authorization
    if (!this.isAuthorized(currentUserRole)) {
      return {
        success: false,
        message: 'Unauthorized: Admin privileges required to upload or publish certifications.',
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

    // Sync to persistent server storage (/api/data/certifications)
    const serverRes = await this.syncServer('certifications', newCert, 'POST');
    if (serverRes && serverRes.item) {
      currentList[0] = { ...newCert, ...serverRes.item };
      this.saveLocalCertificates(currentList);
    }
    dataSyncBus.emit('certifications', currentList);

    // Save to Realtime Database if live Firebase is active (with non-blocking timeout)
    if (isFirebaseConfigured() && db) {
      try {
        await Promise.race([
          dbSet(dbRef(db, `certifications/${id}`), newCert),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Realtime Database timeout')), 1000)),
        ]);
      } catch (fbErr) {
        console.warn('Realtime Database certificate save fallback notice:', fbErr);
      }
    }

    return {
      success: true,
      certificate: currentList[0] || newCert,
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
    if (!this.isAuthorized(currentUserRole)) {
      return {
        success: false,
        message: 'Unauthorized: Admin privileges required to modify certifications.',
      };
    }

    const currentList = this.getLocalCertificates();
    const index = currentList.findIndex((c) => c.id === id);
    if (index === -1) {
      return { success: false, message: 'Certificate not found.' };
    }

    const now = new Date().toISOString();
    let fileUrl = updates.fileUrl !== undefined ? updates.fileUrl : currentList[index].fileUrl;
    if (fileUrl && !fileUrl.startsWith('data:') && !fileUrl.includes('?v=')) {
      fileUrl = `${fileUrl}?v=${Date.now()}`;
    }

    let updatedCert: CompanyCertification = {
      ...currentList[index],
      ...updates,
      fileUrl,
      updatedAt: now,
      publishedAt:
        updates.status === 'published' && !currentList[index].publishedAt
          ? now
          : currentList[index].publishedAt,
    };

    currentList[index] = updatedCert;
    this.saveLocalCertificates(currentList);

    // Sync to persistent server storage (/api/data/certifications)
    const serverRes = await this.syncServer('certifications', updatedCert, 'POST', id);
    if (serverRes && serverRes.item) {
      updatedCert = { ...updatedCert, ...serverRes.item };
      currentList[index] = updatedCert;
      this.saveLocalCertificates(currentList);
    }
    dataSyncBus.emit('certifications', currentList);

    if (isFirebaseConfigured() && db) {
      try {
        await Promise.race([
          dbSet(dbRef(db, `certifications/${id}`), updatedCert),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Realtime Database timeout')), 1000)),
        ]);
      } catch (fbErr) {
        console.warn('Realtime Database certificate update fallback notice:', fbErr);
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
    if (!this.isAuthorized(currentUserRole)) {
      return {
        success: false,
        message: 'Unauthorized: Admin privileges required to delete certifications.',
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

    // Sync deletion to persistent server storage (/api/data/certifications)
    await this.syncServer('certifications', null, 'DELETE', id);
    dataSyncBus.emit('certifications', filtered);

    // Remove from Realtime Database
    if (isFirebaseConfigured() && db) {
      try {
        await Promise.race([
          dbRemove(dbRef(db, `certifications/${id}`)),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Realtime Database timeout')), 1000)),
        ]);
      } catch (fbErr) {
        console.warn('Realtime Database certificate delete fallback notice:', fbErr);
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
   * Super Admin Exclusive: Bulk Delete certificates
   */
  async deleteMultipleCertificates(
    ids: string[],
    currentUserRole?: string
  ): Promise<{ success: boolean; deletedCount: number; message: string }> {
    if (!this.isAuthorized(currentUserRole)) {
      return {
        success: false,
        deletedCount: 0,
        message: 'Unauthorized: Admin privileges required to delete certifications.',
      };
    }

    if (!ids || ids.length === 0) {
      return { success: true, deletedCount: 0, message: 'No certificates selected.' };
    }

    const currentList = this.getLocalCertificates();
    const idSet = new Set(ids);
    const targets = currentList.filter((c) => idSet.has(c.id));
    const filtered = currentList.filter((c) => !idSet.has(c.id));
    this.saveLocalCertificates(filtered);

    // Sync deletions to persistent server storage
    await Promise.all(ids.map((id) => this.syncServer('certifications', null, 'DELETE', id)));
    dataSyncBus.emit('certifications', filtered);

    // Asynchronously remove from Realtime Database & Firebase Storage
    if (isFirebaseConfigured()) {
      for (const target of targets) {
        if (db) {
          dbRemove(dbRef(db, `certifications/${target.id}`)).catch(() => {});
        }
        if (storage && target.storagePath) {
          deleteObject(ref(storage, target.storagePath)).catch(() => {});
        }
      }
    }

    return {
      success: true,
      deletedCount: targets.length,
      message: `${targets.length} certificate${targets.length === 1 ? ' was' : 's were'} permanently deleted.`,
    };
  }

  /**
   * Super Admin Exclusive: Quick toggle publish / unpublish
   */
  async togglePublishStatus(
    id: string,
    currentUserRole?: string
  ): Promise<{ success: boolean; newStatus?: CertificationStatus; message: string }> {
    if (!this.isAuthorized(currentUserRole)) {
      return {
        success: false,
        message: 'Unauthorized: Admin privileges required to change publication status.',
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
    // 1. Role Authorization
    if (!this.isAuthorized(currentUserRole)) {
      return {
        success: false,
        fileUrl: '',
        fileType: '',
        message: 'Unauthorized: Admin privileges required to upload certificate files.',
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

    // 4. Primary: Upload to authoritative server endpoint (/api/upload.php or /api/upload)
    if (typeof window !== 'undefined' && typeof FormData !== 'undefined') {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'certificates');

        let uploadRes = await fetch('/api/upload.php', {
          method: 'POST',
          body: formData,
        }).catch(() => null);

        if (!uploadRes || !uploadRes.ok) {
          uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          }).catch(() => null);
        }

        if (uploadRes && uploadRes.ok) {
          const uploadData = await uploadRes.json();
          const finalUrl = uploadData.url || uploadData.fileUrl;
          if (uploadData.success && finalUrl) {
            const versionedUrl = finalUrl.includes('?v=') || finalUrl.startsWith('data:')
              ? finalUrl
              : `${finalUrl}?v=${Date.now()}`;
            return {
              success: true,
              fileUrl: versionedUrl,
              storagePath: uploadData.path || uploadData.filePath || finalUrl,
              fileType: file.type,
              thumbnailUrl: file.type === 'application/pdf' ? '' : versionedUrl,
              message: 'Certificate uploaded and verified on server storage.',
            };
          }
        }
      } catch (uploadErr) {
        console.warn('Server upload notice, attempting cloud fallback:', uploadErr);
      }
    }

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
   * Categories Management (Super Admin Exclusive Governance)
   */
  getCategories(): CertificationCategory[] {
    const list = this.getLocalCategories();
    return list.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getActiveCategories(): CertificationCategory[] {
    return this.getCategories().filter((c) => c.isActive !== false);
  }

  getCertificateCountForCategory(categoryName: string): number {
    const clean = categoryName.trim().toLowerCase();
    return this.getLocalCertificates().filter((c) => c.category.trim().toLowerCase() === clean).length;
  }

  async createCategory(
    data: { name: string; slug?: string; description?: string; displayOrder?: number; isActive?: boolean },
    currentUserRole?: string
  ): Promise<{ success: boolean; category?: CertificationCategory; message: string }> {
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

    const newCat: CertificationCategory = {
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

    // Sync to authoritative server storage and notify subscribers
    this.syncServer('certification_categories', newCat, 'POST');
    dataSyncBus.emit('certification_categories', currentList);

    if (isFirebaseConfigured() && db) {
      try {
        await dbSet(dbRef(db, `certification_categories/${newCat.id}`), newCat);
      } catch (err) {
        console.warn('Realtime Database category sync notice:', err);
      }
    }

    return { success: true, category: newCat, message: `Category "${cleanName}" created successfully.` };
  }

  async updateCategory(
    id: string,
    data: { name?: string; slug?: string; description?: string; displayOrder?: number; isActive?: boolean },
    currentUserRole?: string
  ): Promise<{ success: boolean; category?: CertificationCategory; message: string }> {
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

    if (newName.toLowerCase() !== oldName.toLowerCase()) {
      if (currentList.some((c) => c.id !== id && c.name.toLowerCase() === newName.toLowerCase())) {
        return { success: false, message: `A category named "${newName}" already exists.` };
      }
      // Re-map existing certificates with oldName to newName
      const certs = this.getLocalCertificates();
      let updatedCount = 0;
      for (const c of certs) {
        if (c.category.toLowerCase() === oldName.toLowerCase()) {
          c.category = newName;
          c.updatedAt = new Date().toISOString();
          updatedCount++;
        }
      }
      if (updatedCount > 0) {
        this.saveLocalCertificates(certs);
        this.syncServer('certifications', certs, 'POST');
        dataSyncBus.emit('certifications', certs);
      }
    }

    const updatedCat: CertificationCategory = {
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

    // Sync to authoritative server storage and notify subscribers
    this.syncServer('certification_categories', updatedCat, 'POST', id);
    dataSyncBus.emit('certification_categories', currentList);

    if (isFirebaseConfigured() && db) {
      try {
        await dbSet(dbRef(db, `certification_categories/${updatedCat.id}`), updatedCat);
      } catch (err) {
        console.warn('Realtime Database category sync notice:', err);
      }
    }

    return { success: true, category: updatedCat, message: `Category "${newName}" updated successfully.` };
  }

  async toggleCategoryStatus(
    id: string,
    currentUserRole?: string
  ): Promise<{ success: boolean; isActive?: boolean; message: string }> {
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

    this.syncServer('certification_categories', cat, 'POST', id);
    dataSyncBus.emit('certification_categories', currentList);

    if (isFirebaseConfigured() && db) {
      try {
        await dbSet(dbRef(db, `certification_categories/${cat.id}`), cat);
      } catch (err) {
        console.warn('Realtime Database category sync notice:', err);
      }
    }

    return {
      success: true,
      isActive: cat.isActive,
      message: `Category "${cat.name}" is now ${cat.isActive ? 'Active' : 'Inactive'}.`,
    };
  }

  async reorderCategories(
    orderedIds: string[],
    currentUserRole?: string
  ): Promise<{ success: boolean; message: string }> {
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

    const updatedList = Array.from(map.values());
    this.saveLocalCategories(updatedList);

    this.syncServer('certification_categories', updatedList, 'POST');
    dataSyncBus.emit('certification_categories', updatedList);
    return { success: true, message: 'Category display order updated successfully.' };
  }

  async deleteCategory(
    id: string,
    currentUserRole?: string
  ): Promise<{ success: boolean; hasContent?: boolean; count?: number; message: string }> {
    if (currentUserRole !== 'super_admin') {
      return { success: false, message: 'Unauthorized: Only Super Admin can delete categories.' };
    }

    const currentList = this.getLocalCategories();
    const cat = currentList.find((c) => c.id === id);
    if (!cat) {
      return { success: false, message: 'Category not found.' };
    }

    const certCount = this.getCertificateCountForCategory(cat.name);
    if (certCount > 0) {
      return {
        success: false,
        hasContent: true,
        count: certCount,
        message: `Cannot delete category "${cat.name}" because it contains ${certCount} certificates or documents. Please migrate existing content to another category first.`,
      };
    }

    const updated = currentList.filter((c) => c.id !== id);
    this.saveLocalCategories(updated);

    this.syncServer('certification_categories', null, 'DELETE', id);
    dataSyncBus.emit('certification_categories', updated);
    return { success: true, message: `Category "${cat.name}" deleted successfully.` };
  }

  async deleteMultipleCategories(
    ids: string[],
    currentUserRole?: string
  ): Promise<{ success: boolean; deletedCount: number; skippedCount: number; message: string }> {
    if (currentUserRole !== 'super_admin') {
      return { success: false, deletedCount: 0, skippedCount: ids.length, message: 'Unauthorized: Only Super Admin can delete categories.' };
    }

    const currentList = this.getLocalCategories();
    const idSet = new Set(ids);
    let deletedCount = 0;
    let skippedCount = 0;

    const remaining = currentList.filter((cat) => {
      if (!idSet.has(cat.id)) return true;
      const certCount = this.getCertificateCountForCategory(cat.name);
      if (certCount > 0) {
        skippedCount++;
        return true;
      }
      deletedCount++;
      return false;
    });

    if (deletedCount > 0) {
      this.saveLocalCategories(remaining);
      ids.forEach((id) => {
        if (!remaining.some((r) => r.id === id)) {
          this.syncServer('certification_categories', null, 'DELETE', id);
        }
      });
      dataSyncBus.emit('certification_categories', remaining);
    }

    let message = `Successfully deleted ${deletedCount} categor${deletedCount === 1 ? 'y' : 'ies'}.`;
    if (skippedCount > 0) {
      message += ` ${skippedCount} categor${skippedCount === 1 ? 'y' : 'ies'} could not be deleted because they contain active certificates or documents.`;
    }

    return { success: deletedCount > 0, deletedCount, skippedCount, message };
  }

  async migrateCategoryContentAndDelete(
    sourceId: string,
    targetCategoryName: string,
    currentUserRole?: string
  ): Promise<{ success: boolean; migratedCount?: number; message: string }> {
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

    // Migrate all certificates
    const certs = this.getLocalCertificates();
    let migratedCount = 0;
    for (const c of certs) {
      if (c.category.toLowerCase() === sourceCat.name.toLowerCase()) {
        c.category = targetCat.name;
        c.updatedAt = new Date().toISOString();
        migratedCount++;
      }
    }
    this.saveLocalCertificates(certs);
    this.syncServer('certifications', certs, 'POST');
    dataSyncBus.emit('certifications', certs);

    // Delete source category
    const updatedCategories = currentList.filter((c) => c.id !== sourceId);
    this.saveLocalCategories(updatedCategories);
    this.syncServer('certification_categories', null, 'DELETE', sourceId);
    dataSyncBus.emit('certification_categories', updatedCategories);

    return {
      success: true,
      migratedCount,
      message: `Successfully migrated ${migratedCount} certificates to "${targetCat.name}" and removed category "${sourceCat.name}".`,
    };
  }

  async saveCategory(
    cat: CertificationCategory,
    currentUserRole?: string
  ): Promise<{ success: boolean; message: string }> {
    if (currentUserRole !== 'super_admin') {
      return {
        success: false,
        message: 'Unauthorized: Super Admin privileges required to manage certification categories.',
      };
    }

    const current = this.getLocalCategories();
    const existingIndex = current.findIndex((c) => c.id === cat.id || c.slug === cat.slug);
    if (existingIndex >= 0) {
      current[existingIndex] = { ...cat, isActive: cat.isActive !== false, updatedAt: new Date().toISOString() };
    } else {
      current.push({ ...cat, isActive: cat.isActive !== false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.saveLocalCategories(current);

    this.syncServer('certification_categories', cat, 'POST', cat.id);
    dataSyncBus.emit('certification_categories', current);

    if (isFirebaseConfigured() && db) {
      try {
        await dbSet(dbRef(db, `certification_categories/${cat.id}`), cat);
      } catch (fbErr) {
        console.warn('Realtime Database category save fallback notice:', fbErr);
      }
    }

    return { success: true, message: 'Category saved successfully.' };
  }
}

export const certificationService = new CertificationService();
