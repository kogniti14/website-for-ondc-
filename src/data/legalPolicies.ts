/**
 * KOGNITI MINDS PRIVATE LIMITED - Legal Policies & Compliance Documentation
 * Effective Date: 18 September 2026
 * Last Updated: 18 September 2026
 * 
 * Centralized, authoritative legal documents covering both B2C and B2B transactions.
 * All contact sections strictly comply with company guidelines:
 * - Entity: KOGNITI MINDS PRIVATE LIMITED
 * - Email: support@kognitiminds.com
 * - Phone: +91 9931648595
 * - Note: The word "Officer" is intentionally omitted from all contact sections.
 */

export interface PolicySection {
  id: string;
  partTitle?: string;
  title: string;
  content: string[];
  bullets?: string[];
  importantNotice?: string;
}

export interface LegalPolicy {
  id: 'terms' | 'privacy' | 'refund' | 'shipping';
  title: string;
  shortTitle: string;
  effectiveDate: string;
  lastUpdated: string;
  summary: string;
  iconName: string;
  sections: PolicySection[];
  contact: {
    entity: string;
    email: string;
    phone: string;
    addressUP: string;
    addressBihar: string;
    guidance: string[];
  };
}

export const LEGAL_POLICIES: Record<'terms' | 'privacy' | 'refund' | 'shipping', LegalPolicy> = {
  // ==========================================
  // 1. TERMS & CONDITIONS
  // ==========================================
  terms: {
    id: 'terms',
    title: 'Terms & Conditions of Service',
    shortTitle: 'Terms & Conditions',
    effectiveDate: '18 September 2026',
    lastUpdated: '18 September 2026',
    summary: 'Master commercial, electronic contracting, and platform usage terms governing B2C consumer orders and B2B institutional procurement contracts with KOGNITI MINDS PRIVATE LIMITED.',
    iconName: 'FileText',
    contact: {
      entity: 'KOGNITI MINDS PRIVATE LIMITED',
      email: 'support@kognitiminds.com',
      phone: '+91 9931648595',
      addressUP: 'Panchsheel Greens-2, Sec-16 B, Gr. Noida West, Bisrakh, Bishrakh, Gautam Buddha Nagar, Uttar Pradesh, India - 201306',
      addressBihar: '4th Floor, VBSS New Building, Bihiya Chaurasta, Bhojpur (Bihar) - 802154',
      guidance: [
        'Order ID / Tax Invoice Number / PO Number',
        'Date of transaction and delivery',
        'Detailed nature of enquiry, commercial dispute, or legal notice',
      ],
    },
    sections: [
      {
        id: 'tc-intro',
        title: '1. Electronic Contracting & Acceptance of Terms',
        content: [
          'This electronic document is published in accordance with the provisions of Rule 3(1) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and represents an electronic record under the Information Technology Act, 2000 and the Indian Contract Act, 1872.',
          'These Terms & Conditions ("Terms", "Agreement") govern your access to and commercial use of the web domains, portals, APIs, consumer storefront, and B2B wholesale portals owned and operated by KOGNITI MINDS PRIVATE LIMITED ("Company", "we", "us", "our"), a private limited company incorporated under the Companies Act, 2013 (CIN: U46496UP2024PTC213997).',
          'By accessing our website, registering an account, placing a B2C retail order, or submitting a B2B Purchase Order (PO) or Request for Quotation (RFQ), you unequivocally agree to be bound by these Terms, our Privacy Policy, Refund & Return Policy, and Shipping & Logistics Policy.',
        ],
      },
      {
        id: 'tc-eligibility',
        title: '2. Eligibility & Account Security',
        content: [
          'Use of our platform is available only to persons who can form legally binding contracts under the Indian Contract Act, 1872. Persons who are "incompetent to contract", including un-discharged insolvents and minors under eighteen (18) years of age, are not eligible to transact directly.',
          'For corporate, institutional, and B2B wholesale accounts, the individual registering or executing orders warrants that they possess full corporate authority and power of attorney to bind their legal entity to financial obligations, purchase contracts, and statutory GST compliances.',
          'You are solely responsible for maintaining the confidentiality of your account credentials, passwords, and verification OTPs. You agree to notify the Company immediately of any unauthorized access or breach of security.',
        ],
      },
      {
        id: 'tc-products',
        title: '3. Sustainable Paper Products & Technical Specifications',
        content: [
          'KOGNITI MINDS PRIVATE LIMITED manufactures and distributes innovative sustainable paper products, office stationery, packaging reams, and institutional supplies manufactured utilizing transformed agricultural residue and eco-conscious fibers.',
          'Due to the natural characteristics of agro-waste fiber composition, subtle natural variations in shade, raw grain texture, bulk calipers, and paper opacity may occur between raw agricultural harvest cycles. Such variations are natural hallmarks of eco-sustainable manufacturing and do not constitute manufacturing defects.',
          'All technical GSM specifications, tensile parameters, whiteness indices, and sheet dimensions are calibrated within standard paper industry tolerances (±5%). While we make every endeavor to display product visuals and specifications accurately, images are for illustrative presentation.',
        ],
      },
      {
        id: 'tc-b2c-orders',
        title: '4. B2C Orders, Pricing & Retail Payments',
        content: [
          'All retail prices listed on the consumer storefront are expressed in Indian National Rupees (INR) and are inclusive of Goods and Services Tax (GST) unless explicitly marked otherwise.',
          'Placement of an order by a retail buyer constitutes an irrevocable offer to purchase. Contractual acceptance occurs upon physical dispatch of the merchandise and issuance of the statutory GST invoice containing the carrier tracking Air Waybill (AWB).',
          'The Company reserves the right to cancel or decline any retail order prior to dispatch in the event of pricing typographical errors, inventory stockouts, force majeure events, or suspected fraudulent activity. In such instances, 100% of any prepaid consideration will be refunded to the original payment source.',
        ],
      },
      {
        id: 'tc-b2b-orders',
        title: '5. B2B Commercial Orders, Quotations & Purchase Orders',
        content: [
          'B2B transactions, wholesale procurement, institutional supply agreements, and custom mill runs are subject to specialized commercial verification.',
          'Formal Quotations and Proforma Invoices issued by the Company remain valid for the period specified therein (typically 7 to 15 calendar days) and are subject to paper pulp raw material market fluctuations and freight tariff revisions.',
          'Issuance of a Purchase Order (PO) by a B2B customer referencing our quotation, or digital acceptance of an RFQ proforma invoice on our portal, establishes a binding commercial contract governed by the Indian Contract Act, 1872.',
          'B2B buyers are strictly obligated to furnish accurate, active GSTIN identification (Uttar Pradesh, Bihar, or relevant state jurisdiction), PAN, and verified delivery destination addresses. Input Tax Credit (ITC) eligibility remains subject to Section 16 of the CGST Act, 2017, and the Company disclaims liability for buyer-side GSTN filing mismatches.',
        ],
      },
      {
        id: 'tc-custom-goods',
        title: '6. Customized, Made-to-Order & Specially Procured Goods',
        content: [
          'Orders requiring custom mill conversion, specialized paper ream slitting, custom branding, personalized packaging, institutional watermarking, or non-standard GSM production constitute Made-to-Order commercial goods.',
          'Once production or raw material procurement has commenced for customized or made-to-order goods, the order is strictly non-cancellable, non-returnable, and non-refundable, except where a verified manufacturing defect is established strictly pursuant to our Refund & Return Policy.',
        ],
        importantNotice: 'B2B customized and made-to-order production runs cannot be cancelled or returned due to customer specification changes or commercial re-evaluations.',
      },
      {
        id: 'tc-gst-invoicing',
        title: '7. Statutory Tax Invoicing & Credit Terms',
        content: [
          'All shipments are accompanied by a statutory Tax Invoice issued pursuant to Section 31 of the Central Goods and Services Tax (CGST) Act, 2017, alongside mandatory E-Way Bills for consignments exceeding statutory thresholds.',
          'Payment terms for B2B credit accounts are strictly governed by the approved commercial agreement or invoice due date. Delayed remittances beyond agreed credit periods shall attract commercial interest at the rate of 18% per annum or the rate prescribed under the Micro, Small and Medium Enterprises Development (MSMED) Act, 2006, calculated from the due date until full realization.',
          'Title and ownership of goods supplied under B2B credit terms shall remain with the Company until receipt of full and final payment, while risk of loss passes upon delivery.',
        ],
      },
      {
        id: 'tc-ip',
        title: '8. Intellectual Property & Proprietary Formulations',
        content: [
          'The trade name "KOGNITI MINDS", the Company logos, brand marks, product designs, proprietary agro-waste fiber manufacturing formulations, website graphics, text, UI elements, and software code are the exclusive intellectual property of KOGNITI MINDS PRIVATE LIMITED.',
          'Nothing contained herein grants any license or right to copy, reproduce, reverse engineer, decompile, distribute, or commercially exploit any proprietary assets without prior written authorization from the Company.',
        ],
      },
      {
        id: 'tc-fraud',
        title: '9. Anti-Fraud, Abuse & Chargeback Defense',
        content: [
          'The Company maintains zero tolerance towards fraudulent conduct, payment fraud, identity theft, abusive return claims, false shortage declarations, or manipulation of unboxing media.',
          'Any fraudulent chargeback dispute initiated with banks or payment intermediaries without fulfilling the claim procedure under our Refund & Return Policy shall be aggressively contested with carrier dispatch logs, tamper-evident weight scans, and digital delivery confirmations.',
          'The Company reserves the right to suspend accounts, cancel pending dispatches, withhold refunds, report unlawful conduct to law enforcement cybercrime authorities, and initiate civil recovery proceedings under Indian law for damages and legal costs.',
        ],
      },
      {
        id: 'tc-liability',
        title: '10. Disclaimers & Limitation of Liability',
        content: [
          'To the maximum extent permitted by applicable Indian law, the platform, products, and services are provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied, except for express manufacturer warranties documented in writing.',
          'In no event shall KOGNITI MINDS PRIVATE LIMITED, its directors, managerial personnel, employees, or affiliates be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including loss of profits, commercial interruption, or business goodwill.',
          'The total aggregate liability of the Company for any claim arising out of or related to an order, whether in contract, tort, or statutory duty, shall strictly not exceed the actual purchase amount received by the Company for the specific product giving rise to the claim.',
        ],
      },
      {
        id: 'tc-force-majeure',
        title: '11. Force Majeure',
        content: [
          'The Company shall not be held liable or deemed in breach of its obligations for delays, delivery failures, or performance defaults caused by circumstances beyond its reasonable control.',
          'Such events include acts of God, flood, earthquake, cyclone, fire, epidemics, pandemics, government lockdowns, transportation strikes, rail/freight blockades, power grid failures, raw agro-residue supply disruptions, or telecommunications breakdowns.',
        ],
      },
      {
        id: 'tc-jurisdiction',
        title: '12. Governing Law, Exclusive Jurisdiction & Arbitration',
        content: [
          'These Terms and all transactions executed hereunder shall be governed by, construed, and interpreted in accordance with the laws of the Republic of India.',
          'Any dispute, controversy, or claim arising out of or relating to this Agreement, including its formation, validity, or breach, shall first be attempted to be resolved amicably through mutual negotiations within thirty (30) calendar days.',
          'Failing amicable settlement, the dispute shall be referred to and finally resolved by binding arbitration under the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be Gautam Buddha Nagar, Uttar Pradesh, India, and proceedings shall be conducted in English.',
          'Subject to arbitration, the competent courts situated at Gautam Buddha Nagar, Uttar Pradesh, India, shall have exclusive territorial and subject-matter jurisdiction.',
        ],
      },
      {
        id: 'tc-statutory',
        title: '13. Mandatory Statutory Rights Protection',
        content: [
          'Nothing in these Terms is intended to unlawfully exclude, limit, or waive any mandatory non-excludable statutory consumer rights guaranteed under the Consumer Protection Act, 2019, the Consumer Protection (E-Commerce) Rules, 2020, or other applicable enactments.',
          'In the event of any irreconcilable conflict between a provision of these Terms and a mandatory statutory consumer provision, the mandatory statutory requirement shall govern solely to the extent of such conflict.',
        ],
      },
    ],
  },

  // ==========================================
  // 2. PRIVACY POLICY
  // ==========================================
  privacy: {
    id: 'privacy',
    title: 'Privacy & Data Protection Policy',
    shortTitle: 'Privacy Policy',
    effectiveDate: '18 September 2026',
    lastUpdated: '18 September 2026',
    summary: 'Comprehensive data privacy and personal data protection protocol governing information collection, storage, processing, and security across B2C, B2B, GeM, and ONDC channels in full compliance with the Information Technology Act, 2000, SPDI Rules 2011, and Digital Personal Data Protection Act (DPDPA), 2023.',
    iconName: 'ShieldCheck',
    contact: {
      entity: 'KOGNITI MINDS PRIVATE LIMITED',
      email: 'support@kognitiminds.com',
      phone: '+91 9931648595',
      addressUP: 'Panchsheel Greens-2, Sec-16 B, Gr. Noida West, Bisrakh, Bishrakh, Gautam Buddha Nagar, Uttar Pradesh, India - 201306',
      addressBihar: '4th Floor, VBSS New Building, Bihiya Chaurasta, Bhojpur (Bihar) - 802154',
      guidance: [
        'Registered account email or mobile number',
        'Specific nature of data query, consent withdrawal, or correction request',
        'Verification credentials confirming authorized identity',
      ],
    },
    sections: [
      {
        id: 'pp-scope',
        title: '1. Statutory Framework & Scope',
        content: [
          'KOGNITI MINDS PRIVATE LIMITED ("Company", "we", "us", "our") respects your privacy and is dedicated to securing all personal and corporate data entrusted to us.',
          'This Privacy & Data Protection Policy is published in compliance with Section 43A of the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 ("SPDI Rules"), the Digital Personal Data Protection Act, 2023 ("DPDPA"), and the Consumer Protection (E-Commerce) Rules, 2020.',
          'This Policy applies to retail consumers (B2C), corporate clients, institutional buyers, wholesale procurement representatives (B2B), platform visitors, and transactions routed through connected digital networks such as ONDC and GeM.',
        ],
      },
      {
        id: 'pp-collection',
        title: '2. Categories of Information We Collect',
        content: [
          'We collect only information reasonably necessary to fulfill orders, maintain corporate accounts, issue statutory tax documentation, and safeguard platform security:',
        ],
        bullets: [
          'Personal Identifiers: Full legal name, billing address, shipping destination address, contact phone number, and email address.',
          'B2B Corporate Credentials: Legal entity name, Corporate Identification Number (CIN), Goods and Services Tax Identification Number (GSTIN), Permanent Account Number (PAN), registered office address, and authorized procurement contact details.',
          'Transaction & Order Details: Products purchased, GSM specifications, order quantities, quotation references, delivery waybill numbers, invoice histories, and payment receipt confirmations.',
          'Verification Evidence: Continuous unboxing/unloading video recordings and photographs submitted pursuant to damage, defect, or shortage claim verification under our Refund & Return Policy.',
          'Technical & Log Telemetry: IP addresses, browser specifications, operating system details, access timestamps, and referring URLs collected automatically for network security and DDOS mitigation.',
        ],
      },
      {
        id: 'pp-payment',
        title: '3. Payment Information Security & PCI-DSS Compliance',
        content: [
          'All electronic payment transactions are routed directly through licensed, Reserve Bank of India (RBI)-authorized Indian payment aggregators and payment gateways utilizing 256-bit SSL (Secure Socket Layer) encryption.',
          'The Company DOES NOT store or process complete credit card numbers, debit card PINs, CVV codes, UPI MPINs, or Net Banking passwords on its web servers. All payment data is tokenized by certified payment gateways adhering to Payment Card Industry Data Security Standards (PCI-DSS).',
        ],
      },
      {
        id: 'pp-purpose',
        title: '4. Lawful Purpose & Utilization of Data',
        content: [
          'Information collected is processed strictly for legitimate business, contractual, and statutory purposes:',
        ],
        bullets: [
          'Processing, packing, dispatching, and fulfilling B2C and B2B orders.',
          'Generating statutory GST Tax Invoices pursuant to Section 31 of the CGST Act, 2017, and accompanying E-Way Bills.',
          'Coordinating physical doorstep delivery and freight haulage with integrated logistics carriers (e.g., Delhivery, Blue Dart, dedicated freight transporters).',
          'Evaluating and verifying return, damage, or warranty claims submitted with unboxing/unloading video evidence.',
          'Communicating transactional alerts, dispatch milestones, order tracking notifications, and commercial quotations.',
          'Preventing payment fraud, unauthorized platform intrusion, cyber abuse, and fraudulent chargeback claims.',
          'Complying with statutory audits, court orders, and government regulatory obligations under Indian law.',
        ],
      },
      {
        id: 'pp-sharing',
        title: '5. Information Sharing & Third-Party Disclosures',
        content: [
          'We DO NOT sell, rent, lease, or commercially trade your personal information or corporate transaction data to any third-party marketing companies.',
          'Disclosures are strictly limited to verified service partners executing core operational functions under confidentiality agreements:',
        ],
        bullets: [
          'Logistics Partners: Sharing delivery address, recipient name, contact number, and package weight with logistics providers (e.g., Delhivery, Blue Dart, commercial transporters) solely for package transit.',
          'Payment Intermediaries: Secure transmission of billing parameters to licensed payment aggregators for payment authorization.',
          'Statutory & Regulatory Authorities: Mandatory disclosures to the GST portal, taxation bodies, or law enforcement agencies when mandated by lawful subpoena, statutory audit, or court decree.',
        ],
      },
      {
        id: 'pp-security',
        title: '6. Data Security & Storage Architecture',
        content: [
          'We implement robust administrative, technical, and physical security measures designed to safeguard data against accidental loss, unauthorized access, alteration, destruction, or disclosure.',
          'Databases are hosted in enterprise-grade, ISO 27001-certified cloud infrastructure with end-to-end encryption at rest and in transit, strict role-based access control, periodic vulnerability assessments, and multi-factor authentication for administrative staff.',
        ],
      },
      {
        id: 'pp-retention',
        title: '7. Data Retention & Archival Guidelines',
        content: [
          'Personal and commercial transaction records are retained for as long as necessary to fulfill the operational purposes for which they were collected, or as required to comply with statutory legal requirements.',
          'Under Section 36 of the Central Goods and Services Tax Act, 2017, the Company is legally obligated to maintain tax invoices, dispatch registers, and accounts of transactions for a statutory period of at least seventy-two (72) months from the due date of furnishing the annual return.',
          'Unboxing video evidence and claim files are archived for verification and dispute defense purposes for up to twelve (12) months following claim settlement.',
        ],
      },
      {
        id: 'pp-rights',
        title: '8. Data Subject Rights & Choices',
        content: [
          'Pursuant to applicable data protection legislation (including the Digital Personal Data Protection Act, 2023), you possess rights concerning your personal information:',
        ],
        bullets: [
          'Right to Access & Review: You may review personal information maintained in your customer or B2B profile.',
          'Right to Rectification: You may request correction of inaccurate, incomplete, or outdated personal information.',
          'Right to Withdraw Consent: You may opt out of promotional newsletters and non-essential commercial announcements at any time.',
          'Statutory Limitations: Erasure of transaction histories is subject to mandatory tax retention and ongoing commercial contract obligations.',
        ],
      },
      {
        id: 'pp-cookies',
        title: '9. Cookies & Analytical Technologies',
        content: [
          'Our website utilizes essential session cookies and performance telemetry to maintain shopping cart states, remember login sessions, and optimize page load speeds.',
          'You may adjust your browser settings to reject non-essential cookies, though certain interactive features of the store or B2B portal may have restricted functionality.',
        ],
      },
      {
        id: 'pp-updates',
        title: '10. Policy Modifications & Amendments',
        content: [
          'The Company reserves the right to periodically modify this Privacy Policy to reflect operational enhancements, technological advancements, or legislative amendments.',
          'Any updates shall be posted on this page with an updated "Last Updated" timestamp, and continued interaction with the platform following such publication constitutes your informed acknowledgment of the revised terms.',
        ],
      },
    ],
  },

  // ==========================================
  // 3. REFUND & RETURN POLICY
  // ==========================================
  refund: {
    id: 'refund',
    title: 'Refund & Return Policy',
    shortTitle: 'Refund & Return Policy',
    effectiveDate: '18 September 2026',
    lastUpdated: '18 September 2026',
    summary: 'Strict B2C and B2B return, verification, and refund protocol governing physical damage, shortages, unboxing video evidence, anti-fraud controls, and commercial claims for KOGNITI MINDS PRIVATE LIMITED.',
    iconName: 'RotateCcw',
    contact: {
      entity: 'KOGNITI MINDS PRIVATE LIMITED',
      email: 'support@kognitiminds.com',
      phone: '+91 9931648595',
      addressUP: 'Panchsheel Greens-2, Sec-16 B, Gr. Noida West, Bisrakh, Bishrakh, Gautam Buddha Nagar, Uttar Pradesh, India - 201306',
      addressBihar: '4th Floor, VBSS New Building, Bihiya Chaurasta, Bhojpur (Bihar) - 802154',
      guidance: [
        'Order ID / Invoice Number',
        'Recorded Delivery Date',
        'Detailed Issue Description',
        'Unedited Continuous Unboxing / Unloading Video and High-Resolution Photographs',
      ],
    },
    sections: [
      {
        id: 'rp-part-a',
        partTitle: 'PART A — STRICT CLAIM PERIOD',
        title: '1. Strict 2-Calendar-Day Claim Period',
        content: [
          'This Policy applies to both B2C and B2B transactions of KOGNITI MINDS PRIVATE LIMITED. The Company maintains strict controls against fraudulent, abusive, manipulated or unsupported return/refund claims. Nothing in this Policy is intended to unlawfully remove any mandatory statutory consumer right.',
          'Except where a longer period is mandatorily required by applicable law or expressly agreed in writing, claims relating to:',
        ],
        bullets: [
          'visible damage;',
          'shortage;',
          'missing items;',
          'wrong product;',
          'wrong SKU;',
          'incorrect quantity;',
          'tampering;',
          'missing accessories/components;',
          'material discrepancy;',
          'apparent manufacturing defect; or',
          'materially incorrect product',
        ],
        importantNotice: 'All delivery-related discrepancy claims MUST be reported to the Company within 2 calendar days from the recorded delivery date. Claims submitted after this period may be rejected where legally permissible.',
      },
      {
        id: 'rp-part-b-video',
        partTitle: 'PART B — UNBOXING / UNLOADING EVIDENCE',
        title: '2. Continuous Unboxing Video Requirement',
        content: [
          'Customers are strongly required to record a continuous, clear and unedited video while opening the package. The video should, wherever reasonably possible, show:',
        ],
        bullets: [
          'sealed package;',
          'shipping label/AWB;',
          'package condition;',
          'seals/tape;',
          'complete opening process;',
          'all products;',
          'quantity;',
          'product condition;',
          'accessories/components; and',
          'packaging material.',
          'For B2B, bulk and freight shipments, customers should additionally record the unloading and opening process.',
        ],
        importantNotice: 'A continuous, unedited unboxing or unloading video showing intact seals and complete opening is critical evidence required for claim verification.',
      },
      {
        id: 'rp-part-b-photo',
        partTitle: 'PART B — UNBOXING / UNLOADING EVIDENCE (CONTD.)',
        title: '3. Photographs and Other Evidence',
        content: [
          'The Company may require:',
        ],
        bullets: [
          'original unboxing/unloading video;',
          'clear photographs;',
          'Order ID;',
          'invoice;',
          'PO;',
          'shipping label;',
          'SKU;',
          'quantity evidence;',
          'packaging;',
          'delivery proof;',
          'courier/freight documents;',
          'batch/lot information, where applicable; and',
          'any other reasonable evidence necessary to investigate the claim.',
        ],
      },
      {
        id: 'rp-part-c-investigation',
        partTitle: 'PART C — NO AUTOMATIC REFUND',
        title: '4. Claim Does Not Equal Automatic Refund',
        content: [
          'Submission of a claim does not automatically establish entitlement to a refund. The Company may investigate the claim by reviewing:',
        ],
        bullets: [
          'packing records;',
          'dispatch records;',
          'product/SKU records;',
          'shipment weight;',
          'packaging records;',
          'logistics records;',
          'delivery confirmation;',
          'photographs/videos;',
          'invoice/PO;',
          'customer communications; and',
          'other relevant information.',
          'The Company may request additional evidence where reasonably necessary.',
        ],
      },
      {
        id: 'rp-part-c-insufficient',
        partTitle: 'PART C — NO AUTOMATIC REFUND (CONTD.)',
        title: '5. Insufficient or Unverifiable Claims',
        content: [
          'Where evidence is materially insufficient, inconsistent, manipulated, unavailable or incapable of reasonably verifying the alleged issue, the Company may reject or hold the claim to the extent permitted by applicable law.',
          'The Company does not guarantee approval merely because photographs, videos or a written complaint have been submitted.',
        ],
      },
      {
        id: 'rp-part-d',
        partTitle: 'PART D — POTENTIALLY ELIGIBLE ISSUES',
        title: '6. Eligible Claim Categories',
        content: [
          'Subject to verification and applicable law, a remedy may be considered where:',
        ],
        bullets: [
          'wrong product was supplied;',
          'materially damaged product was delivered;',
          'product has a verified manufacturing defect;',
          'materially incorrect product was supplied;',
          'material quantity shortage is verified;',
          'essential component/accessory is missing; or',
          'another material discrepancy is established.',
        ],
      },
      {
        id: 'rp-part-e',
        partTitle: 'PART E — PRODUCT PRESERVATION',
        title: '7. Customer Must Preserve Product',
        content: [
          'Until the claim is resolved, the customer must preserve:',
          '• product; • original packaging; • shipping label; • invoice; • accessories; • tags; • seals; • damaged components; and • other relevant materials.',
          'The customer must not intentionally:',
        ],
        bullets: [
          'repair;',
          'alter;',
          'modify;',
          'substitute;',
          'dispose of;',
          'misuse; or',
          'further damage the product or packaging in a manner that affects verification.',
        ],
      },
      {
        id: 'rp-part-f',
        partTitle: 'PART F — FRAUD AND ABUSE',
        title: '8. Strict Anti-Fraud Protection',
        content: [
          'The Company may investigate claims involving:',
          '• edited/manipulated videos; • fabricated photographs; • product substitution; • false shortage; • intentional damage; • false defect claims; • repeated suspicious claims; • fraudulent chargebacks; • false identity/business details; • misuse of return/refund mechanisms; • abuse of promotional offers; or • coordinated fraudulent activity.',
          'Where permitted by law, the Company may:',
        ],
        bullets: [
          'reject the claim;',
          'suspend or restrict the account;',
          'cancel pending orders;',
          'restrict future transactions;',
          'withdraw promotional benefits;',
          'contest fraudulent chargebacks;',
          'recover losses through lawful means; and/or',
          'initiate appropriate legal proceedings.',
        ],
        importantNotice: 'Fraudulent, edited, or manipulated claim evidence and abusive chargeback claims will be contested with carrier weight records and may trigger account suspension and legal proceedings.',
      },
      {
        id: 'rp-part-g-returns',
        partTitle: 'PART G — B2C RETURN & REFUND',
        title: '9. B2C Returns',
        content: [
          'B2C returns shall be considered according to: this Policy; product-specific conditions; applicable order terms; and applicable law.',
          'Products may be required to be returned unused and in suitable original condition, except where the nature of the issue requires otherwise.',
        ],
      },
      {
        id: 'rp-part-g-process',
        partTitle: 'PART G — B2C RETURN & REFUND (CONTD.)',
        title: '10. B2C Refund Process',
        content: [
          'Where a refund is approved, the Company may process the refund after verification and completion of applicable return requirements.',
          'Depending on the circumstances, the remedy may be:',
        ],
        bullets: [
          'replacement;',
          'repair, where applicable;',
          'missing quantity replacement;',
          'partial refund;',
          'full refund;',
          'credit adjustment; or',
          'another legally permissible remedy.',
        ],
      },
      {
        id: 'rp-part-h-claims',
        partTitle: 'PART H — B2B RETURN & REFUND',
        title: '11. B2B Claims',
        content: [
          'B2B customers must report delivery-related damage, shortage, wrong product or material discrepancy within the 2-calendar-day claim period, unless otherwise agreed in writing or a longer period is required by applicable law.',
          'B2B claims should contain complete documentary evidence including PO, tax invoice, unloading video, carrier freight memo, and batch details.',
        ],
      },
      {
        id: 'rp-part-h-terms',
        partTitle: 'PART H — B2B RETURN & REFUND (CONTD.)',
        title: '12. B2B Commercial Terms',
        content: [
          'For B2B transactions, returns/cancellations/refunds may additionally be governed by: quotation; purchase order; proforma invoice; tax invoice; supply agreement; commercial confirmation; or mutually agreed written terms.',
        ],
      },
      {
        id: 'rp-part-h-custom',
        partTitle: 'PART H — B2B RETURN & REFUND (CONTD.)',
        title: '13. Customized / Specially Procured B2B Goods',
        content: [
          'Customized, made-to-order or specially procured goods may not be returnable merely because the customer changes its requirements, subject to applicable law and agreed commercial terms.',
        ],
      },
      {
        id: 'rp-part-i',
        partTitle: 'PART I — RETURN SHIPPING',
        title: '14. Return Logistics',
        content: [
          'Where a return is approved, the Company may determine the appropriate return method.',
          'Return freight may be borne by: the Company; customer; or both parties, depending on the verified cause of return and applicable commercial terms.',
        ],
      },
      {
        id: 'rp-part-j',
        partTitle: 'PART J — FINAL VERIFICATION',
        title: '15. Company\'s Investigation & Decision',
        content: [
          'The Company reserves the right to conduct reasonable verification before approving any return, replacement, credit or refund.',
          'A decision shall be based on available evidence, applicable terms and applicable law.',
          'The 2-day period primarily governs prompt reporting and verification of delivery-related discrepancies and does not purport to waive mandatory statutory rights.',
          'The Company\'s return/refund process will also remain subject to applicable consumer-protection law. The Department of Consumer Affairs publishes the Consumer Protection (E-Commerce) Rules, 2020 and related materials governing e-commerce entities.',
        ],
      },
    ],
  },

  // ==========================================
  // 4. SHIPPING & LOGISTICS POLICY
  // ==========================================
  shipping: {
    id: 'shipping',
    title: 'Shipping & Logistics Policy',
    shortTitle: 'Shipping & Logistics Policy',
    effectiveDate: '18 September 2026',
    lastUpdated: '18 September 2026',
    summary: 'Comprehensive surface, express courier, and bulk freight logistics protocol covering order processing, weight calculations, unloading responsibilities, proof of delivery, and transit inspection for KOGNITI MINDS PRIVATE LIMITED.',
    iconName: 'Truck',
    contact: {
      entity: 'KOGNITI MINDS PRIVATE LIMITED',
      email: 'support@kognitiminds.com',
      phone: '+91 9931648595',
      addressUP: 'Panchsheel Greens-2, Sec-16 B, Gr. Noida West, Bisrakh, Bishrakh, Gautam Buddha Nagar, Uttar Pradesh, India - 201306',
      addressBihar: '4th Floor, VBSS New Building, Bihiya Chaurasta, Bhojpur (Bihar) - 802154',
      guidance: [
        'Order ID / Tax Invoice Number',
        'Consignment Air Waybill (AWB) or Lorry Receipt (LR) Number',
        'Destination PIN code and delivery contact person',
        'Specific logistics query, re-routing request, or transit issue',
      ],
    },
    sections: [
      {
        id: 'sp-scope',
        title: '16. Scope & Applicability',
        content: [
          'This Shipping & Logistics Policy applies to both B2C and B2B orders fulfilled by KOGNITI MINDS PRIVATE LIMITED across India and designated international destinations.',
        ],
      },
      {
        id: 'sp-processing',
        title: '17. Order Processing',
        content: [
          'Orders are processed after successful payment confirmation and/or commercial approval. Processing time may vary depending on:',
        ],
        bullets: [
          'product availability;',
          'order quantity;',
          'customization;',
          'procurement;',
          'warehouse availability;',
          'payment confirmation;',
          'destination; and',
          'logistics arrangements.',
        ],
      },
      {
        id: 'sp-estimates',
        title: '18. Delivery Estimates',
        content: [
          'Any delivery estimate displayed on the website or provided by the Company is an estimated timeline unless expressly confirmed as guaranteed. Delivery may be affected by:',
        ],
        bullets: [
          'weather;',
          'traffic;',
          'transport delays;',
          'holidays;',
          'logistics capacity;',
          'remote destinations;',
          'force majeure;',
          'address issues;',
          'customer unavailability;',
          'regulatory restrictions; or',
          'other circumstances outside reasonable Company control.',
        ],
      },
      {
        id: 'sp-charges',
        title: '19. Shipping Charges & Computation',
        content: [
          'Shipping charges may depend on:',
        ],
        bullets: [
          'actual weight;',
          'volumetric weight;',
          'dimensions;',
          'destination;',
          'distance;',
          'courier/freight mode;',
          'vehicle type;',
          'quantity;',
          'packaging;',
          'handling;',
          'unloading requirements; and',
          'other logistics factors.',
          'The applicable shipping charge communicated at checkout or in the commercial quotation shall apply unless otherwise agreed.',
        ],
      },
      {
        id: 'sp-b2b-logistics',
        partTitle: 'B2B / BULK / FREIGHT SHIPMENTS',
        title: '20. B2B Logistics Modes',
        content: [
          'B2B orders may be shipped through:',
        ],
        bullets: [
          'courier;',
          'surface transport;',
          'LTL freight (Less Than Truckload);',
          'full truck load (FTL);',
          'dedicated vehicle;',
          'transporter; or',
          'another suitable logistics arrangement.',
          'The logistics method may depend on order size, weight, dimensions, destination and commercial terms.',
        ],
      },
      {
        id: 'sp-heavy-loads',
        partTitle: 'B2B / BULK / FREIGHT SHIPMENTS (CONTD.)',
        title: '21. Large, Heavy or Dense Loads',
        content: [
          'For large, heavy or dense shipments (such as institutional paper pallets and carton loads), additional logistics requirements may apply.',
          'Additional charges may arise from:',
        ],
        bullets: [
          'vehicle capacity;',
          'loading/unloading;',
          'handling;',
          'waiting time;',
          'difficult access;',
          'special equipment;',
          'multiple delivery attempts;',
          're-routing;',
          'detention;',
          'storage; or',
          'other destination-specific requirements.',
        ],
      },
      {
        id: 'sp-unloading',
        partTitle: 'B2B / BULK / FREIGHT SHIPMENTS (CONTD.)',
        title: '22. Unloading Responsibility',
        content: [
          'Unless expressly agreed otherwise in writing, B2B/bulk customers should ensure appropriate arrangements for unloading large/heavy shipments.',
          'This may include:',
        ],
        bullets: [
          'labour;',
          'trolley;',
          'forklift;',
          'unloading equipment;',
          'safe access;',
          'parking;',
          'loading-bay access; and',
          'authorised receiving personnel.',
        ],
        importantNotice: 'B2B buyers are responsible for safe unloading facilities, equipment (forklifts/trolleys), and authorized receiving personnel at the destination site.',
      },
      {
        id: 'sp-appointments',
        partTitle: 'B2B / BULK / FREIGHT SHIPMENTS (CONTD.)',
        title: '23. Delivery Appointments & Stoppages',
        content: [
          'Where a shipment requires a delivery appointment, the customer must provide accurate receiving details and coordinate with the transporter.',
          'Additional charges caused by customer-side delay, refusal, unavailable personnel or failed delivery may be recoverable where applicable.',
        ],
      },
      {
        id: 'sp-inspection',
        partTitle: 'DELIVERY INSPECTION',
        title: '24. Inspection at Delivery',
        content: [
          'Customers should inspect packages at delivery.',
          'Any visible:',
        ],
        bullets: [
          'damage;',
          'tampering;',
          'leakage;',
          'broken seal;',
          'shortage;',
          'wrong package; or',
          'other material discrepancy',
          'should be documented immediately and reported according to the Refund & Return Policy.',
        ],
      },
      {
        id: 'sp-video-record',
        partTitle: 'DELIVERY INSPECTION (CONTD.)',
        title: '25. Unboxing / Unloading Record',
        content: [
          'For high-value, bulk, B2B, freight or damage-prone shipments, continuous unloading/unboxing video is strongly recommended and may be critical evidence for claim verification.',
          'The video should show the package condition before opening and the complete opening/unloading process.',
        ],
      },
      {
        id: 'sp-shortage',
        partTitle: 'SHORTAGE CLAIMS',
        title: '26. Quantity Verification',
        content: [
          'Customers must verify quantity against the applicable invoice, packing information and/or PO.',
          'Shortage claims must be supported by reasonable evidence and submitted within the applicable claim period (2 calendar days from recorded delivery).',
        ],
      },
      {
        id: 'sp-lost',
        partTitle: 'LOST / MISROUTED SHIPMENTS',
        title: '27. Logistics Investigation',
        content: [
          'If a shipment is reported lost, delayed or misrouted, the Company may coordinate with the relevant logistics provider.',
          'Resolution may depend on: tracking records; delivery records; transporter investigation; shipment documentation; and applicable commercial terms.',
        ],
      },
      {
        id: 'sp-international',
        partTitle: 'INTERNATIONAL SHIPMENTS',
        title: '28. International Orders',
        content: [
          'International shipments may be subject to customs requirements; import duties; taxes; customs clearance; restricted-product rules; destination-country regulations; documentation requirements; and additional logistics charges.',
          'Unless expressly agreed otherwise, the customer/importer is responsible for applicable destination-country requirements and charges.',
        ],
      },
      {
        id: 'sp-restricted',
        partTitle: 'RESTRICTED LOCATIONS',
        title: '29. Delivery Restrictions',
        content: [
          'The Company may restrict delivery to locations where logistics service is unavailable, access is unsafe, legal restrictions apply, transportation is commercially impractical, customs restrictions apply, or additional arrangements are required.',
        ],
      },
      {
        id: 'sp-pod',
        partTitle: 'DELIVERY CONFIRMATION',
        title: '30. Proof of Delivery (POD)',
        content: [
          'Delivery may be evidenced by: OTP; signature; digital confirmation; courier record; transporter record; photograph; delivery scan; electronic proof of delivery; or other reasonable delivery evidence.',
        ],
      },
      {
        id: 'sp-failed',
        partTitle: 'FAILED DELIVERY',
        title: '31. Customer Unavailability & Re-delivery',
        content: [
          'If delivery fails because of: incorrect address; incomplete address; incorrect phone number; recipient unavailability; refusal to accept; failure to coordinate; inaccessible location; or customer-requested delay, additional shipping/re-delivery/storage charges may apply where permitted and applicable.',
        ],
      },
      {
        id: 'sp-returns-transport',
        partTitle: 'RETURN SHIPMENTS',
        title: '32. Return Transport Protocol',
        content: [
          'Where a return is approved, the Company may determine: transporter; packaging requirement; return address; shipping method; and documentation requirement.',
          'Customers must follow return instructions carefully to prevent transit loss or in-transit damage.',
        ],
      },
      {
        id: 'sp-force-majeure',
        partTitle: 'FORCE MAJEURE',
        title: '33. Uncontrollable Events',
        content: [
          'The Company shall not be responsible for logistics delays caused by circumstances beyond reasonable control, including natural disasters, severe weather, transportation disruptions, strikes, governmental restrictions, civil disturbances, war, infrastructure failures, epidemics/pandemics, supplier disruptions or other force majeure events.',
        ],
      },
      {
        id: 'sp-enforcement',
        partTitle: 'POLICY ENFORCEMENT',
        title: '34. Strict Enforcement',
        content: [
          'The Company reserves the right to enforce this Policy consistently and to investigate suspicious or disputed claims.',
          'Any attempt to misuse the return, refund or shipping process may result in appropriate action to the extent permitted by law.',
        ],
      },
      {
        id: 'sp-statutory',
        partTitle: 'STATUTORY RIGHTS',
        title: '35. Statutory Rights Reservation',
        content: [
          'Nothing in this Policy is intended to unlawfully exclude or restrict any mandatory statutory right available to a consumer or other party under applicable law.',
          'Where a mandatory legal requirement conflicts with a provision of this Policy, the mandatory legal requirement shall prevail.',
        ],
      },
      {
        id: 'sp-contact-clause',
        partTitle: 'POLICY CONTACT',
        title: '36. Returns / Shipping / Grievance Contact',
        content: [
          'For all claims, return authorizations, logistics tracking, or delivery grievances, customers should reach out with complete documentary support:',
        ],
        bullets: [
          'Entity: KOGNITI MINDS PRIVATE LIMITED',
          'Email: support@kognitiminds.com',
          'Phone: +91 9931648595',
          'Registered Office: Panchsheel Greens-2, Sec-16 B, Gr. Noida West, Bisrakh, Bishrakh, Gautam Buddha Nagar, Uttar Pradesh, India - 201306',
          'Operational Office: 4th Floor, VBSS New Building, Bihiya Chaurasta, Bhojpur (Bihar) - 802154',
          'Required details for claims: Order ID/Invoice No.; delivery date; issue description; and supporting evidence.',
        ],
      },
    ],
  },
};
