/**
 * KOGNITI MINDS — OFFICIAL LEGAL & BUSINESS MASTER DATA
 * SINGLE SOURCE OF TRUTH
 *
 * This configuration holds the authoritative legal entity and supplier
 * identity for Kogniti Minds Private Limited. All business documents,
 * invoices, quotations, proforma invoices, credit/debit notes, email templates,
 * legal policies, and customer interfaces must read company information from here.
 */

export interface CompanyMasterSettings {
  id: string;
  legal_name: string;
  cin: string;
  pan: string;
  gstin: string;
  gst_state: string;
  gst_state_code: string;
  address_line_1: string;
  address_line_2: string;
  branch_office?: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  support_email: string;
  sales_email: string;
  accounts_email: string;
  support_phone: string;
  website: string;
  bank_account_name?: string;
  bank_name?: string;
  bank_account_no?: string;
  bank_ifsc?: string;
  bank_branch?: string;
  bank_details: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    ifsc: string;
    branch: string;
    accountType: string;
  };
  created_at: string;
  updated_at: string;
}

export const OFFICIAL_COMPANY_MASTER: CompanyMasterSettings = {
  id: 'company_master_primary',
  legal_name: 'KOGNITI MINDS PRIVATE LIMITED',
  cin: 'U46496UP2024PTC213997',
  pan: 'AALCK4750F',
  gstin: '09AALCK4750F1ZC',
  gst_state: 'Uttar Pradesh',
  gst_state_code: '09',
  address_line_1: 'Panchsheel Greens-2, Sec-16 B',
  address_line_2: 'Greater Noida West, Bisrakh, Bishrakh',
  branch_office: '4th Floor, VBSS New Building, Bihiya Chaurasta, Bhojpur (Bihar) - 802154',
  city: 'Greater Noida West',
  district: 'Gautam Buddha Nagar',
  state: 'Uttar Pradesh',
  country: 'India',
  pincode: '201306',
  support_email: 'support@kognitiminds.com',
  sales_email: 'sales@kognitiminds.com',
  accounts_email: 'accounts@kognitiminds.com',
  support_phone: '+91 99991 44474',
  website: 'https://kognitiminds.com',
  bank_account_name: 'KOGNITI MINDS PRIVATE LIMITED',
  bank_name: 'HDFC Bank Ltd',
  bank_account_no: '50200089234125',
  bank_ifsc: 'HDFC0000128',
  bank_branch: 'Sector 62 Branch, Noida',
  bank_details: {
    accountHolder: 'KOGNITI MINDS PRIVATE LIMITED',
    bankName: 'HDFC Bank Ltd',
    accountNumber: '50200089234125',
    ifsc: 'HDFC0000128',
    branch: 'Sector 62 Branch, Noida',
    accountType: 'Current Account',
  },
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2026-09-27T00:00:00.000Z',
};

/**
 * Validation Regex Constants per Indian Statutory Standards
 */
export const VALIDATION_REGEX = {
  GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  CIN: /^[UL]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/,
  PINCODE: /^[1-9][0-9]{5}$/,
};

export interface CompanyMasterValidationResult {
  isValid: boolean;
  valid: boolean;
  errors: string[];
  gstinValid: boolean;
  panValid: boolean;
  cinValid: boolean;
  pinValid: boolean;
}

/**
 * Validate Company Master integrity
 * Prevents generation of commercial/legal documents if master data is invalid
 */
export function validateCompanyMaster(data: Partial<CompanyMasterSettings>): CompanyMasterValidationResult {
  const errors: string[] = [];

  const legalNameValid = Boolean(data.legal_name && data.legal_name.toUpperCase().includes('KOGNITI MINDS'));
  if (!legalNameValid) {
    errors.push('Legal company name must be KOGNITI MINDS PRIVATE LIMITED');
  }

  const cinValid = Boolean(data.cin && VALIDATION_REGEX.CIN.test(data.cin.trim()));
  if (!cinValid) {
    errors.push(`Invalid Corporate Identification Number (CIN): ${data.cin || ''}. Expected 21-character standard format.`);
  }

  const panValid = Boolean(data.pan && VALIDATION_REGEX.PAN.test(data.pan.trim()));
  if (!panValid) {
    errors.push(`Invalid Permanent Account Number (PAN): ${data.pan || ''}. Expected 10-character alphanumeric format.`);
  }

  const gstinValid = Boolean(data.gstin && VALIDATION_REGEX.GSTIN.test(data.gstin.trim()));
  if (!gstinValid) {
    errors.push(`Invalid GSTIN: ${data.gstin || ''}. Expected 15-character statutory GST format.`);
  }

  if (data.gstin && data.pan && !data.gstin.includes(data.pan)) {
    errors.push(`GSTIN mismatch: PAN digits within GSTIN (${data.gstin}) do not match PAN (${data.pan}).`);
  }

  const pinValid = Boolean(data.pincode && VALIDATION_REGEX.PINCODE.test(data.pincode.trim()));
  if (!pinValid) {
    errors.push(`Invalid PIN code: ${data.pincode || ''}. Expected 6-digit Indian postal code.`);
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    valid: isValid,
    errors,
    gstinValid,
    panValid,
    cinValid,
    pinValid,
  };
}

/**
 * Helper to produce standard formatted full business address
 */
export function formatCompanyAddress(company: CompanyMasterSettings = OFFICIAL_COMPANY_MASTER): string {
  return `${company.address_line_1}, ${company.address_line_2}, ${company.district}, ${company.state}, ${company.country} - ${company.pincode}`;
}

/**
 * Helper to produce standard statutory credentials string
 */
export function formatStatutoryLine(company: CompanyMasterSettings = OFFICIAL_COMPANY_MASTER): string {
  return `CIN: ${company.cin} • PAN: ${company.pan} • GSTIN: ${company.gstin} • State: ${company.gst_state} (Code: ${company.gst_state_code})`;
}
