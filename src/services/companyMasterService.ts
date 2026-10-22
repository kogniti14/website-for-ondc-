/**
 * KOGNITI MINDS — Company Master Service
 *
 * Centralized service managing the single source of truth for:
 * - Legal entity details
 * - Tax & statutory identity (CIN, PAN, GSTIN, State code)
 * - Registered & operational business address
 * - Official communication channels & bank remittance details
 *
 * Integrated with dataSyncBus for reactive updates across the app.
 */

import {
  CompanyMasterSettings,
  OFFICIAL_COMPANY_MASTER,
  validateCompanyMaster,
  formatCompanyAddress,
  formatStatutoryLine,
  CompanyMasterValidationResult,
} from '../config/companyMaster';
import { dataSyncBus } from './dataSyncBus';
import { getProductionApiUrl } from './apiConfig';

const STORAGE_KEY = 'km_company_master_v1';

class CompanyMasterService {
  private cachedMaster: CompanyMasterSettings | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const clean: CompanyMasterSettings = {
          ...OFFICIAL_COMPANY_MASTER,
          ...parsed,
          legal_name: (parsed.legal_name || '').trim() || OFFICIAL_COMPANY_MASTER.legal_name,
          cin: (parsed.cin || '').trim() || OFFICIAL_COMPANY_MASTER.cin,
          pan: (parsed.pan || '').trim() || OFFICIAL_COMPANY_MASTER.pan,
          gstin: (parsed.gstin || '').trim() || OFFICIAL_COMPANY_MASTER.gstin,
          msme_udyam: (parsed.msme_udyam || '').trim() || OFFICIAL_COMPANY_MASTER.msme_udyam,
          address_line_1: (parsed.address_line_1 || '').trim() || OFFICIAL_COMPANY_MASTER.address_line_1,
          address_line_2: (parsed.address_line_2 || '').trim() || OFFICIAL_COMPANY_MASTER.address_line_2,
          branch_office: (parsed.branch_office || '').trim() || OFFICIAL_COMPANY_MASTER.branch_office,
          city: (parsed.city || '').trim() || OFFICIAL_COMPANY_MASTER.city,
          district: (parsed.district || '').trim() || OFFICIAL_COMPANY_MASTER.district,
          state: (parsed.state || '').trim() || OFFICIAL_COMPANY_MASTER.state,
          country: (parsed.country || '').trim() || OFFICIAL_COMPANY_MASTER.country,
          pincode: (parsed.pincode || '').trim() || OFFICIAL_COMPANY_MASTER.pincode,
        };
        // Normalize any legacy Panchsheel address with duplicated fields
        if (clean.address_line_1.includes('Greens-2') || clean.address_line_2.includes('Bisrakh')) {
          clean.address_line_1 = OFFICIAL_COMPANY_MASTER.address_line_1;
          clean.address_line_2 = OFFICIAL_COMPANY_MASTER.address_line_2;
        }
        const val = validateCompanyMaster(clean);
        if (val.isValid) {
          this.cachedMaster = clean;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
        } else {
          console.warn('[CompanyMasterService] Invalid stored company master, falling back to official defaults:', val.errors);
          this.cachedMaster = { ...OFFICIAL_COMPANY_MASTER };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cachedMaster));
        }
      } else {
        this.cachedMaster = { ...OFFICIAL_COMPANY_MASTER };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cachedMaster));
      }
    } catch {
      this.cachedMaster = { ...OFFICIAL_COMPANY_MASTER };
    }
  }

  /**
   * Get the current authoritative Company Master settings
   */
  public getCompanyMaster(): CompanyMasterSettings {
    if (!this.cachedMaster) {
      this.init();
    }
    const cm = this.cachedMaster || { ...OFFICIAL_COMPANY_MASTER };
    return {
      ...OFFICIAL_COMPANY_MASTER,
      ...cm,
      cin: (cm.cin || '').trim() || OFFICIAL_COMPANY_MASTER.cin,
      pan: (cm.pan || '').trim() || OFFICIAL_COMPANY_MASTER.pan,
      gstin: (cm.gstin || '').trim() || OFFICIAL_COMPANY_MASTER.gstin,
      address_line_1: (cm.address_line_1 || '').trim() || OFFICIAL_COMPANY_MASTER.address_line_1,
      address_line_2: (cm.address_line_2 || '').trim() || OFFICIAL_COMPANY_MASTER.address_line_2,
      state: (cm.state || '').trim() || OFFICIAL_COMPANY_MASTER.state,
      country: (cm.country || '').trim() || OFFICIAL_COMPANY_MASTER.country,
      pincode: (cm.pincode || '').trim() || OFFICIAL_COMPANY_MASTER.pincode,
    };
  }

  /**
   * Reactive listener for company master updates
   */
  public subscribe(callback: (master: CompanyMasterSettings) => void): () => void {
    return dataSyncBus.subscribe('company_settings', (data) => {
      if (data) {
        this.cachedMaster = data;
        callback(data);
      }
    });
  }

  /**
   * Update and persist company master settings
   * Rejects update if required statutory fields are corrupted or invalid
   */
  public saveCompanyMaster(data: Partial<CompanyMasterSettings>): { success: boolean; errors: string[] } {
    const current = this.getCompanyMaster();
    const candidate: CompanyMasterSettings = {
      ...current,
      ...data,
      legal_name: (data.legal_name || current.legal_name).trim(),
      cin: (data.cin || current.cin).trim().toUpperCase(),
      pan: (data.pan || current.pan).trim().toUpperCase(),
      gstin: (data.gstin || current.gstin).trim().toUpperCase(),
      msme_udyam: (data.msme_udyam !== undefined ? data.msme_udyam : (current.msme_udyam || 'UDYAM-UP-06-0034981')).trim().toUpperCase(),
      branch_office: (data.branch_office !== undefined ? data.branch_office : (current.branch_office || '4th Floor, VBSS New Building, Bihiya Chaurasta, Bhojpur, Bihar, India - 802154')).trim(),
      pincode: (data.pincode || current.pincode).trim(),
      updated_at: new Date().toISOString(),
    };

    const validation = validateCompanyMaster(candidate);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    this.cachedMaster = candidate;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(candidate));
      } catch (err) {
        console.error('[CompanyMasterService] Failed to save to localStorage:', err);
      }
    }

    // Emit reactive event across application
    dataSyncBus.emit('company_settings', candidate);

    // Sync to backend LiteSpeed storage asynchronously
    try {
      const isAdmin = typeof window !== 'undefined' && (
        localStorage.getItem('km_active_role') === 'admin' ||
        Boolean(localStorage.getItem('km_active_admin_id')) ||
        Boolean(localStorage.getItem('km_admin_session')) ||
        window.location.pathname.startsWith('/admin')
      );
      const adminParam = isAdmin ? '&admin_role=super_admin' : '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      };
      if (isAdmin) {
        headers['X-Admin-Role'] = 'super_admin';
        headers['Authorization'] = 'Bearer admin';
      }
      const targetUrl = getProductionApiUrl(`/api/data.php?collection=company_settings${adminParam}`);
      fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(candidate),
      }).catch(() => {});
    } catch {
      // Non-blocking for offline / static dev
    }

    return { success: true, errors: [] };
  }

  /**
   * Reset company master to official statutory baseline
   */
  public resetToOfficialDefaults(): CompanyMasterSettings {
    this.cachedMaster = { ...OFFICIAL_COMPANY_MASTER };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cachedMaster));
    }
    dataSyncBus.emit('company_settings', this.cachedMaster);
    return this.cachedMaster;
  }

  public resetToOfficial(): CompanyMasterSettings {
    return this.resetToOfficialDefaults();
  }

  /**
   * Convenience formatting helpers
   */
  public getFullAddress(): string {
    return formatCompanyAddress(this.getCompanyMaster());
  }

  public getStatutoryLine(): string {
    return formatStatutoryLine(this.getCompanyMaster());
  }

  public formatAddress(cm: CompanyMasterSettings = this.getCompanyMaster()): string {
    return formatCompanyAddress(cm);
  }

  public formatStatutory(cm: CompanyMasterSettings = this.getCompanyMaster()): string {
    return formatStatutoryLine(cm);
  }
}

export const companyMasterService = new CompanyMasterService();
export type { CompanyMasterSettings, CompanyMasterValidationResult };
export {
  OFFICIAL_COMPANY_MASTER,
  validateCompanyMaster,
  formatCompanyAddress,
  formatStatutoryLine,
};
