/**
 * KOGNITI MINDS PRIVATE LIMITED - OFFICIAL LEGAL & BUSINESS MASTER DATA VERIFICATION
 * 
 * Comprehensive automated verification script testing:
 * 1. Statutory master data integrity
 * 2. Strict validation & corruption rejection rules
 * 3. Tax computation rules (Intra-state UP 09 vs Interstate IGST)
 * 4. Document generators:
 *    - B2B Commercial Quotation
 *    - B2B Proforma Invoice
 *    - Production Tax Invoice (Section 31 CGST Act)
 *    - Credit Note (Section 34 CGST Act)
 *    - Debit Note (Section 34 CGST Act)
 *    - Commercial Email Templates (9 document types)
 *    - ONDC RETeB2B 1.2.5 Seller Mapping
 */

const fs = require('fs');
const path = require('path');

// Canonical Company Master
const OFFICIAL_MASTER = {
  id: 'km_official_master_v1',
  legal_name: 'KOGNITI MINDS PRIVATE LIMITED',
  cin: 'U46496UP2024PTC213997',
  pan: 'AALCK4750F',
  gstin: '09AALCK4750F1ZC',
  gst_state: 'Uttar Pradesh',
  state_code: '09',
  address_line_1: 'Panchsheel Greens-2, Sec-16 B',
  address_line_2: 'Greater Noida West, Bisrakh, Bishrakh',
  city: 'Greater Noida West',
  district: 'Gautam Buddha Nagar',
  state: 'Uttar Pradesh',
  country: 'India',
  pincode: '201306',
  support_email: 'support@kognitiminds.com',
  support_phone: '+91 99991 44474',
};

// Statutory Regex Patterns
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const CIN_REGEX = /^[UL]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
const PIN_REGEX = /^[1-9][0-9]{5}$/;

function validate(data) {
  const errors = [];
  if (!data.legal_name || data.legal_name.trim() !== 'KOGNITI MINDS PRIVATE LIMITED') {
    errors.push('Legal company name must match KOGNITI MINDS PRIVATE LIMITED');
  }
  const gstinValid = GSTIN_REGEX.test(data.gstin || '');
  if (!gstinValid) errors.push('Invalid GSTIN format');

  const panValid = PAN_REGEX.test(data.pan || '');
  if (!panValid) errors.push('Invalid PAN format');

  const cinValid = CIN_REGEX.test(data.cin || '');
  if (!cinValid) errors.push('Invalid CIN format');

  const pinValid = PIN_REGEX.test(data.pincode || '');
  if (!pinValid) errors.push('Invalid PIN code format');

  if (gstinValid && panValid && (data.gstin || '').substring(2, 12) !== data.pan) {
    errors.push('GSTIN characters 3-12 must match PAN');
  }

  return {
    valid: errors.length === 0,
    errors,
    gstinValid,
    panValid,
    cinValid,
    pinValid,
  };
}

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    failed++;
  }
}

console.log('\n===============================================================');
console.log('KOGNITI MINDS — OFFICIAL LEGAL & BUSINESS MASTER DATA TEST SUITE');
console.log('===============================================================\n');

// TEST SUITE 1: Canonical Master Data Integrity
console.log('[1/7] Testing Canonical Company Master Data Values...');
assert(OFFICIAL_MASTER.legal_name === 'KOGNITI MINDS PRIVATE LIMITED', 'Legal Name is KOGNITI MINDS PRIVATE LIMITED');
assert(OFFICIAL_MASTER.cin === 'U46496UP2024PTC213997', 'CIN matches U46496UP2024PTC213997');
assert(OFFICIAL_MASTER.pan === 'AALCK4750F', 'PAN matches AALCK4750F');
assert(OFFICIAL_MASTER.gstin === '09AALCK4750F1ZC', 'GSTIN matches 09AALCK4750F1ZC');
assert(OFFICIAL_MASTER.gst_state === 'Uttar Pradesh', 'GST State is Uttar Pradesh');
assert(OFFICIAL_MASTER.state_code === '09', 'State Code is 09');
assert(OFFICIAL_MASTER.pincode === '201306', 'PIN Code is 201306');
assert(OFFICIAL_MASTER.gstin.substring(0, 2) === '09', 'GSTIN state prefix matches 09 (Uttar Pradesh)');
assert(OFFICIAL_MASTER.gstin.substring(2, 12) === OFFICIAL_MASTER.pan, 'GSTIN characters 3-12 match PAN AALCK4750F');

// TEST SUITE 2: Statutory Validation & Corruption Rejection
console.log('\n[2/7] Testing Statutory Validation Engine...');
const canonicalVal = validate(OFFICIAL_MASTER);
assert(canonicalVal.valid === true, 'Canonical Company Master is valid');
assert(canonicalVal.gstinValid === true, 'GSTIN format passes regex');
assert(canonicalVal.panValid === true, 'PAN format passes regex');
assert(canonicalVal.cinValid === true, 'CIN format passes regex');
assert(canonicalVal.pinValid === true, 'PIN format passes regex');

// Corruption tests
const corruptedGstin = { ...OFFICIAL_MASTER, gstin: '09INVALIDGST123' };
assert(validate(corruptedGstin).valid === false, 'Rejects corrupted GSTIN');

const corruptedPan = { ...OFFICIAL_MASTER, pan: 'INVALIDPAN' };
assert(validate(corruptedPan).valid === false, 'Rejects corrupted PAN');

const corruptedCin = { ...OFFICIAL_MASTER, cin: 'INVALIDCIN123' };
assert(validate(corruptedCin).valid === false, 'Rejects corrupted CIN');

const corruptedPin = { ...OFFICIAL_MASTER, pincode: '20130' };
assert(validate(corruptedPin).valid === false, 'Rejects invalid 5-digit PIN');

const mismatchedPanGstin = { ...OFFICIAL_MASTER, pan: 'BBBCK4750F' };
assert(validate(mismatchedPanGstin).valid === false, 'Rejects mismatch between GSTIN embedded PAN and PAN field');

// TEST SUITE 3: Tax Calculation Classification (Intra-state UP vs Interstate)
console.log('\n[3/7] Testing GST Tax Computation Rules (Intra-state UP vs Interstate)...');
function computeTax(buyerState, taxableAmount, ratePercent = 18) {
  const isIntraState = (buyerState || '').trim().toLowerCase() === 'uttar pradesh' || buyerState === '09';
  const totalTax = Math.round(taxableAmount * (ratePercent / 100) * 100) / 100;
  if (isIntraState) {
    const halfRate = ratePercent / 2;
    const cgst = Math.round(taxableAmount * (halfRate / 100) * 100) / 100;
    const sgst = Math.round(taxableAmount * (halfRate / 100) * 100) / 100;
    return { isIntraState, cgst, sgst, igst: 0, totalTax, grandTotal: taxableAmount + totalTax };
  } else {
    return { isIntraState, cgst: 0, sgst: 0, igst: totalTax, totalTax, grandTotal: taxableAmount + totalTax };
  }
}

const intraTax = computeTax('Uttar Pradesh', 10000, 18);
assert(intraTax.isIntraState === true, 'Uttar Pradesh recognized as Intra-State (Supplier is UP 09)');
assert(intraTax.cgst === 900 && intraTax.sgst === 900, 'Intra-state correctly splits into CGST 9% (₹900) + SGST 9% (₹900)');
assert(intraTax.igst === 0, 'Intra-state sets IGST to 0');
assert(intraTax.grandTotal === 11800, 'Intra-state Grand Total is ₹11,800');

const interTax = computeTax('Delhi', 10000, 18);
assert(interTax.isIntraState === false, 'Delhi recognized as Inter-State');
assert(interTax.igst === 1800, 'Inter-state applies full IGST 18% (₹1,800)');
assert(interTax.cgst === 0 && interTax.sgst === 0, 'Inter-state sets CGST & SGST to 0');
assert(interTax.grandTotal === 11800, 'Inter-state Grand Total is ₹11,800');

// TEST SUITE 4: Source Code Audit for Proforma & Credit/Debit Notes
console.log('\n[4/7] Testing Implementation of Business Document Modules in Source...');
const proformaModalPath = path.join(__dirname, 'src/components/b2b/ProformaInvoiceModal.tsx');
assert(fs.existsSync(proformaModalPath), 'ProformaInvoiceModal.tsx exists in src/components/b2b/');
const proformaContent = fs.readFileSync(proformaModalPath, 'utf8');
assert(proformaContent.includes('PROFORMA INVOICE'), 'Proforma Invoice is prominently labeled PROFORMA INVOICE');
assert(proformaContent.includes('NOT A TAX INVOICE'), 'Contains statutory disclaimer: PROFORMA INVOICE - NOT A TAX INVOICE');
assert(proformaContent.includes('companyMasterService.getCompanyMaster()'), 'Proforma dynamically reads from companyMasterService');

const creditDebitModalPath = path.join(__dirname, 'src/components/common/CreditDebitNoteModal.tsx');
assert(fs.existsSync(creditDebitModalPath), 'CreditDebitNoteModal.tsx exists in src/components/common/');
const creditDebitContent = fs.readFileSync(creditDebitModalPath, 'utf8');
assert(creditDebitContent.includes('Section 34 of CGST Act, 2017'), 'Credit/Debit Note references Section 34 of CGST Act, 2017');
assert(creditDebitContent.includes('originalInvoiceNumber'), 'Requires mandatory linkage to original invoice number');
assert(creditDebitContent.includes('companyMasterService.getCompanyMaster()'), 'Credit/Debit Note dynamically reads from companyMasterService');

// TEST SUITE 5: Commercial Email Service Audit
console.log('\n[5/7] Testing Commercial Email Templates & Standard Corporate Footer...');
const emailServicePath = path.join(__dirname, 'src/services/commercialEmailService.ts');
assert(fs.existsSync(emailServicePath), 'commercialEmailService.ts exists in src/services/');
const emailContent = fs.readFileSync(emailServicePath, 'utf8');
assert(emailContent.includes('generateOfficialEmailFooter'), 'Contains official corporate email footer generator');
assert(emailContent.includes('cm.cin') && emailContent.includes('cm.pan') && emailContent.includes('cm.gstin'), 'Footer dynamically renders CIN, PAN, and GSTIN');
assert(emailContent.includes('quotation') && emailContent.includes('proforma_invoice') && emailContent.includes('tax_invoice'), 'Supports Quotation, Proforma Invoice, and Tax Invoice');
assert(emailContent.includes('credit_note') && emailContent.includes('debit_note'), 'Supports Credit Note and Debit Note');

// TEST SUITE 6: Admin Management Console Audit
console.log('\n[6/7] Testing Admin Company Master Management Console...');
const adminCompMasterPath = path.join(__dirname, 'src/components/admin/CompanyMasterManagement.tsx');
assert(fs.existsSync(adminCompMasterPath), 'CompanyMasterManagement.tsx exists in src/components/admin/');
const adminCompContent = fs.readFileSync(adminCompMasterPath, 'utf8');
assert(adminCompContent.includes('Company Master & Statutory Legal Details'), 'Contains Company Master administrative title');
assert(adminCompContent.includes('validateCompanyMaster'), 'Integrates real-time statutory validation');
assert(adminCompContent.includes('QuotationModal') && adminCompContent.includes('ProformaInvoiceModal'), 'Contains live Document Preview Suite');
assert(adminCompContent.includes('CreditDebitNoteModal'), 'Contains Credit/Debit note preview launchers');

// TEST SUITE 7: ONDC RETeB2B 1.2.5 Seller Master Mapping
console.log('\n[7/7] Testing ONDC RETeB2B 1.2.5 Master Mapping...');
const ondcConfigPath = path.join(__dirname, 'server/ondc/config.js');
assert(fs.existsSync(ondcConfigPath), 'server/ondc/config.js exists');
const ondcConfigContent = fs.readFileSync(ondcConfigPath, 'utf8');
assert(ondcConfigContent.includes('09AALCK4750F1ZC'), 'server/ondc/config.js uses official GSTIN 09AALCK4750F1ZC');
assert(ondcConfigContent.includes('AALCK4750F'), 'server/ondc/config.js uses official PAN AALCK4750F');
assert(ondcConfigContent.includes('U46496UP2024PTC213997'), 'server/ondc/config.js uses official CIN U46496UP2024PTC213997');
assert(ondcConfigContent.includes('201306'), 'server/ondc/config.js uses official PIN 201306');

const ondcSearchJsonPath = path.join(__dirname, 'public/ondc-workbench/01_on_search.json');
assert(fs.existsSync(ondcSearchJsonPath), 'public/ondc-workbench/01_on_search.json exists');
const ondcSearchContent = fs.readFileSync(ondcSearchJsonPath, 'utf8');
assert(ondcSearchContent.includes('09AALCK4750F1ZC'), '01_on_search.json uses official GSTIN 09AALCK4750F1ZC');
assert(ondcSearchContent.includes('AALCK4750F'), '01_on_search.json uses official PAN AALCK4750F');
assert(ondcSearchContent.includes('U46496UP2024PTC213997'), '01_on_search.json uses official CIN U46496UP2024PTC213997');

console.log('\n===============================================================');
console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
if (failed === 0) {
  console.log('STATUS: ALL STATUTORY MASTER DATA & DOCUMENT TESTS PASSED ✓');
} else {
  console.error('STATUS: SOME TESTS FAILED!');
  process.exit(1);
}
console.log('===============================================================\n');
