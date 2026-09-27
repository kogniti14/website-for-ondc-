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
        const val = validateCompanyMaster(parsed);
        if (val.isValid) {
          this.cachedMaster = { ...OFFICIAL_COMPANY_MASTER, ...parsed };
        } else {
          console.warn('[CompanyMasterService] Invalid stored company master, falling back to official defaults:', val.errors);
          this.cachedMaster = { ...OFFICIAL_COMPANY_MASTER };
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
    return this.cachedMaster || { ...OFFICIAL_COMPANY_MASTER };
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
      fetch('/api/data.php?collection=company_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
