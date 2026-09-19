/**
 * ONDC:RETeB2B Catalogue Mapper & Provider Definition
 * Kogniti Minds Private Limited
 */

import ondcConfig from './config.js';

export const ONDC_CATEGORIES = [
  { id: 'cat_paper', descriptor: { name: 'Sustainable & Agri-Waste-Based Paper' } },
  { id: 'cat_notebooks', descriptor: { name: 'Eco Notebooks & Notepads' } },
  { id: 'cat_stationery', descriptor: { name: 'Stationery & Office Organizers' } },
  { id: 'cat_gifting', descriptor: { name: 'Corporate Gifting & Hampers' } },
  { id: 'cat_institutional', descriptor: { name: 'Institutional Bulk Pallets' } },
];

export const PRODUCTS_CATALOG = [
  {
    id: 'km-agri-a4-75',
    name: 'Kogniti AgroPrint 75 GSM A4 Sustainable Copier Paper (500 Sheets)',
    tagline: '100% Tree-Free Copier Paper Crafted from Upcycled Agricultural Crop Residue',
    sku: 'KM-PAP-AG75',
    hsn: '48025610',
    categoryId: 'cat_paper',
    categoryName: 'Sustainable & Agri-Waste-Based Paper',
    b2cMrp: 399,
    b2cPrice: 289,
    b2bWholesalePrice: 198,
    b2bMoq: 10,
    b2bDiscountSlabs: [
      { minQty: 10, maxQty: 49, discountPercent: 0, label: 'Base Wholesale' },
      { minQty: 50, maxQty: 199, discountPercent: 8, label: 'Office Tier (8% Off)' },
      { minQty: 200, maxQty: 499, discountPercent: 15, label: 'Campus Tier (15% Off)' },
      { minQty: 500, discountPercent: 22, label: 'Institutional Truckload (22% Off)' },
    ],
    gstRate: 18,
    stock: 2400,
    images: [
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
    ],
    shortDescription: 'Eco-engineered multipurpose 75 GSM A4 copier paper manufactured using agricultural crop residue pulp.',
    description: 'Breakthrough sustainable paper manufactured from agricultural residue such as wheat straw, sugarcane bagasse, and paddy stalks. Eliminates stubble burning and protects forest ecosystems.',
    dimensions: '21.0cm x 29.7cm x 5.2cm',
    weight: '2.35 kg',
    leadTimeDays: 2,
  },
  {
    id: 'km-agri-a4-80',
    name: 'Kogniti AgroPrint 80 GSM A4 Premium Copier Paper (500 Sheets)',
    tagline: 'Ultra-Smooth 80 GSM High-Brightness Paper for Executive Printing & Contracts',
    sku: 'KM-PAP-AG80',
    hsn: '48025610',
    categoryId: 'cat_paper',
    categoryName: 'Sustainable & Agri-Waste-Based Paper',
    b2cMrp: 449,
    b2cPrice: 329,
    b2bWholesalePrice: 225,
    b2bMoq: 10,
    b2bDiscountSlabs: [
      { minQty: 10, maxQty: 49, discountPercent: 0, label: 'Base Wholesale' },
      { minQty: 50, maxQty: 199, discountPercent: 8, label: 'Corporate Tier (8% Off)' },
      { minQty: 200, discountPercent: 18, label: 'Bulk Enterprise (18% Off)' },
    ],
    gstRate: 18,
    stock: 1800,
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
    ],
    shortDescription: 'High-density 80 GSM A4 agricultural residue paper with 98% ISO brightness.',
    description: 'Engineered for boardrooms, law firms, and high-impact presentations. Ultra-smooth surface prevents feathering.',
    dimensions: '21.0cm x 29.7cm x 5.6cm',
    weight: '2.50 kg',
    leadTimeDays: 2,
  },
  {
    id: 'km-copier-a4-carton',
    name: 'Kogniti AgroPrint A4 Carton Pack (5 Reams / 2,500 Sheets)',
    tagline: 'Standard Enterprise Office Supply Box — 5 Reams of 75 GSM Tree-Free Paper',
    sku: 'KM-PAP-BOX5',
    hsn: '48025610',
    categoryId: 'cat_paper',
    categoryName: 'Sustainable & Agri-Waste-Based Paper',
    b2cMrp: 1899,
    b2cPrice: 1399,
    b2bWholesalePrice: 940,
    b2bMoq: 4,
    b2bDiscountSlabs: [
      { minQty: 4, maxQty: 19, discountPercent: 0, label: 'Carton Wholesale' },
      { minQty: 20, maxQty: 99, discountPercent: 10, label: 'Pallet Order (10% Off)' },
      { minQty: 100, discountPercent: 18, label: 'Full Truckload (18% Off)' },
    ],
    gstRate: 18,
    stock: 450,
    images: [
      'https://images.unsplash.com/photo-1589330694653-dad6ef495b54?auto=format&fit=crop&w=1000&q=80',
    ],
    shortDescription: 'Standard office master carton holding 5 shrink-wrapped reams of 75 GSM sustainable paper.',
    description: 'Master carton packaging engineered for quick handling and institutional storage in corporate mailrooms.',
    dimensions: '31.5cm x 22.5cm x 27.5cm',
    weight: '11.8 kg',
    leadTimeDays: 2,
  },
  {
    id: 'km-notebook-spiral-a5',
    name: 'Kogniti EcoSpiral A5 Professional Notebook (160 Pages)',
    tagline: 'Durable Recycled Kraft Cover with Unbleached Agri-Residue Smooth Lined Pages',
    sku: 'KM-NB-SP160',
    hsn: '48201090',
    categoryId: 'cat_notebooks',
    categoryName: 'Eco Notebooks & Notepads',
    b2cMrp: 249,
    b2cPrice: 179,
    b2bWholesalePrice: 110,
    b2bMoq: 25,
    b2bDiscountSlabs: [
      { minQty: 25, maxQty: 99, discountPercent: 0, label: 'Office Wholesale' },
      { minQty: 100, maxQty: 499, discountPercent: 12, label: 'Conference Bulk (12% Off)' },
      { minQty: 500, discountPercent: 20, label: 'Annual Supply (20% Off)' },
    ],
    gstRate: 18,
    stock: 1200,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
    ],
    shortDescription: 'Executive wire-bound A5 notebook with 100% post-consumer recycled covers.',
    description: 'Twin-loop black metal wire-bound notebook. Ideal for daily notes, project logs, and training workshops.',
    dimensions: '14.8cm x 21.0cm x 1.4cm',
    weight: '0.24 kg',
    leadTimeDays: 2,
  },
  {
    id: 'km-notebook-subject-b5',
    name: 'Kogniti Multi-Subject B5 Campus Notebook (300 Pages)',
    tagline: '5-Subject Tabbed Notebook Crafted with Off-White Tree-Free Writing Paper',
    sku: 'KM-NB-SUB5',
    hsn: '48201090',
    categoryId: 'cat_notebooks',
    categoryName: 'Eco Notebooks & Notepads',
    b2cMrp: 399,
    b2cPrice: 289,
    b2bWholesalePrice: 185,
    b2bMoq: 20,
    b2bDiscountSlabs: [
      { minQty: 20, maxQty: 99, discountPercent: 0, label: 'Institutional Base' },
      { minQty: 100, maxQty: 299, discountPercent: 10, label: 'Campus Bookstore (10% Off)' },
      { minQty: 300, discountPercent: 18, label: 'University Tier (18% Off)' },
    ],
    gstRate: 18,
    stock: 800,
    images: [
      'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1000&q=80',
    ],
    shortDescription: 'B5 5-subject notebook with color-coded dividers made from recycled board.',
    description: 'Designed for university students and multi-project corporate teams.',
    dimensions: '17.6cm x 25.0cm x 2.2cm',
    weight: '0.45 kg',
    leadTimeDays: 2,
  },
  {
    id: 'km-journal-hardbound',
    name: 'Kogniti Heritage Hardbound Executive Journal (192 Pages)',
    tagline: 'Bound in Upcycled Cotton Rag Cover with Gold Foil Debossed Logo',
    sku: 'KM-JRN-HB192',
    hsn: '48201090',
    categoryId: 'cat_notebooks',
    categoryName: 'Eco Notebooks & Notepads',
    b2cMrp: 599,
    b2cPrice: 429,
    b2bWholesalePrice: 280,
    b2bMoq: 15,
    b2bDiscountSlabs: [
      { minQty: 15, maxQty: 49, discountPercent: 0, label: 'Executive Base' },
      { minQty: 50, maxQty: 199, discountPercent: 10, label: 'Corporate Gifting (10% Off)' },
      { minQty: 200, discountPercent: 20, label: 'Summit Edition (20% Off)' },
    ],
    gstRate: 18,
    stock: 650,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
    ],
    shortDescription: 'Hardbound luxury journal with bookmark ribbon, elastic band, and back pocket.',
    description: 'Crafted for leadership meetings, strategic journaling, and corporate milestones.',
    dimensions: '14.5cm x 21.5cm x 1.8cm',
    weight: '0.38 kg',
    leadTimeDays: 2,
  },
  {
    id: 'km-stat-desk-organizer',
    name: 'Kogniti KraftDesk Modular Desktop Organizer Set',
    tagline: 'Precision Cut Recycled High-Density Kraft Board Organizers (Set of 4)',
    sku: 'KM-ORG-DK4',
    hsn: '48191010',
    categoryId: 'cat_stationery',
    categoryName: 'Stationery & Office Organizers',
    b2cMrp: 699,
    b2cPrice: 499,
    b2bWholesalePrice: 320,
    b2bMoq: 10,
    b2bDiscountSlabs: [
      { minQty: 10, maxQty: 49, discountPercent: 0, label: 'Office Wholesale' },
      { minQty: 50, maxQty: 149, discountPercent: 8, label: 'Facility Setup (8% Off)' },
      { minQty: 150, discountPercent: 16, label: 'Workspace Fitout (16% Off)' },
    ],
    gstRate: 18,
    stock: 350,
    images: [
      'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=1000&q=80',
    ],
    shortDescription: 'Plastic-free modular 4-piece desk organizer set for modern workspaces.',
    description: 'Includes pen stand, document tray, sticky notes cube, and card holder.',
    dimensions: '28.0cm x 18.0cm x 12.0cm',
    weight: '0.62 kg',
    leadTimeDays: 3,
  },
  {
    id: 'km-pen-bamboo-roller',
    name: 'Kogniti PureStem Bamboo Rollerball Pen (Pack of 10)',
    tagline: '100% Biodegradable Bamboo Barrel with High-Precision German Metal Refill',
    sku: 'KM-PEN-BAM10',
    hsn: '96081019',
    categoryId: 'cat_stationery',
    categoryName: 'Stationery & Office Organizers',
    b2cMrp: 499,
    b2cPrice: 349,
    b2bWholesalePrice: 210,
    b2bMoq: 15,
    b2bDiscountSlabs: [
      { minQty: 15, maxQty: 49, discountPercent: 0, label: 'Pack Wholesale' },
      { minQty: 50, maxQty: 199, discountPercent: 12, label: 'Event Swag (12% Off)' },
      { minQty: 200, discountPercent: 22, label: 'Corporate Bulk (22% Off)' },
    ],
    gstRate: 18,
    stock: 900,
    images: [
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1000&q=80',
    ],
    shortDescription: 'Sustainable bamboo rollerball pens with laser-engravable natural barrels.',
    description: 'Smooth 0.7mm blue gel refill, balanced weight, and zero single-use plastic barrel.',
    dimensions: '14.0cm x 1.1cm x 1.1cm',
    weight: '0.18 kg',
    leadTimeDays: 2,
  },
  {
    id: 'km-folder-kraft-expandable',
    name: 'Kogniti FileMaster Expandable Kraft Document Folder (Pack of 10)',
    tagline: 'Heavy-Duty 350 GSM Recycled Manila Board with Cloth Gusset',
    sku: 'KM-FLD-EX10',
    hsn: '48203000',
    categoryId: 'cat_stationery',
    categoryName: 'Stationery & Office Organizers',
    b2cMrp: 449,
    b2cPrice: 319,
    b2bWholesalePrice: 195,
    b2bMoq: 15,
    b2bDiscountSlabs: [
      { minQty: 15, maxQty: 49, discountPercent: 0, label: 'Carton Tier' },
      { minQty: 50, maxQty: 199, discountPercent: 10, label: 'Enterprise Legal (10% Off)' },
      { minQty: 200, discountPercent: 18, label: 'Archive Bulk (18% Off)' },
    ],
    gstRate: 18,
    stock: 750,
    images: [
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=80',
    ],
    shortDescription: 'Expandable 2-inch gusset document wallet holding up to 300 A4 sheets.',
    description: 'Reinforced edges and natural cotton ribbon tie closure for compliance and records.',
    dimensions: '34.5cm x 24.5cm x 5.0cm',
    weight: '0.85 kg',
    leadTimeDays: 2,
  },
  {
    id: 'km-art-sketchbook-a4',
    name: 'Kogniti Artisan Heavyweight A4 Art Sketchbook (120 Pages, 140 GSM)',
    tagline: 'Rough Grain Tree-Free Agro-Residue Paper for Charcoal, Ink, Watercolor & Gouache',
    sku: 'KM-ART-SK140',
    hsn: '48201090',
    categoryId: 'cat_notebooks',
    categoryName: 'Eco Notebooks & Notepads',
    b2cMrp: 499,
    b2cPrice: 369,
    b2bWholesalePrice: 240,
    b2bMoq: 15,
    b2bDiscountSlabs: [
      { minQty: 15, maxQty: 49, discountPercent: 0, label: 'Studio Wholesale' },
      { minQty: 50, maxQty: 199, discountPercent: 10, label: 'Design School (10% Off)' },
      { minQty: 200, discountPercent: 20, label: 'Institutional (20% Off)' },
    ],
    gstRate: 18,
    stock: 500,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
    ],
    shortDescription: 'Acid-free 140 GSM artist sketchbook with cold-pressed natural texture.',
    description: 'Micro-perforated sheets allow clean tearing without damaging binding.',
    dimensions: '21.0cm x 29.7cm x 1.8cm',
    weight: '0.62 kg',
    leadTimeDays: 2,
  },
  {
    id: 'km-eco-hamper-exec',
    name: 'Kogniti Executive GreenWelcome Eco Hamper Box',
    tagline: 'Curated 7-Piece Sustainable Onboarding Kit in Luxury Rigid Kraft Gift Box',
    sku: 'KM-HMP-EXEC',
    hsn: '48209090',
    categoryId: 'cat_gifting',
    categoryName: 'Corporate Gifting & Hampers',
    b2cMrp: 1899,
    b2cPrice: 1399,
    b2bWholesalePrice: 920,
    b2bMoq: 5,
    b2bDiscountSlabs: [
      { minQty: 5, maxQty: 24, discountPercent: 0, label: 'Corporate Base' },
      { minQty: 25, maxQty: 99, discountPercent: 8, label: 'Quarterly Induction (8% Off)' },
      { minQty: 100, discountPercent: 18, label: 'Enterprise Annual (18% Off)' },
    ],
    gstRate: 18,
    stock: 220,
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80',
    ],
    shortDescription: 'Comprehensive corporate welcome kit in debossed magnetic-latch kraft box.',
    description: 'Includes journal, bamboo pen, desk calendar, plantable seed coaster, notebook, sticker pack.',
    dimensions: '32.0cm x 26.0cm x 9.0cm',
    weight: '1.45 kg',
    leadTimeDays: 4,
  },
  {
    id: 'km-inst-pallet-a4',
    name: 'Kogniti Institutional Bulk Pallet: 75 GSM Agro Copier Paper (40 Cartons / 200 Reams)',
    tagline: 'Direct-from-Mill Industrial Pallet for Universities, Examination Boards & Enterprises',
    sku: 'KM-INST-PLT40',
    hsn: '48025610',
    categoryId: 'cat_institutional',
    categoryName: 'Institutional Bulk Pallets',
    b2cMrp: 79800,
    b2cPrice: 55600,
    b2bWholesalePrice: 38000,
    b2bMoq: 1,
    b2bDiscountSlabs: [
      { minQty: 1, maxQty: 2, discountPercent: 0, label: 'Single Pallet' },
      { minQty: 3, maxQty: 9, discountPercent: 5, label: 'Multi-Campus (5% Off)' },
      { minQty: 10, discountPercent: 12, label: 'Container Load (12% Off)' },
    ],
    gstRate: 18,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1589330694653-dad6ef495b54?auto=format&fit=crop&w=1000&q=80',
    ],
    shortDescription: 'Industrial wooden pallet wrapped in weather-proof stretch film with 100,000 sheets.',
    description: 'Delivered directly via hydraulic liftgate trucks. Dedicated transport insurance and batch quality certificate included.',
    dimensions: '120.0cm x 100.0cm x 135.0cm',
    weight: '475.0 kg',
    leadTimeDays: 4,
  },
];

/**
 * Format products into official ONDC:RETeB2B Catalog representation
 */
export function buildOndcCatalog(searchIntent = {}) {
  let matchedItems = PRODUCTS_CATALOG;

  // Filter if search intent specified a keyword or category
  const query = (searchIntent.item?.descriptor?.name || '').toLowerCase().trim();
  if (query) {
    matchedItems = matchedItems.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.categoryName.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.shortDescription.toLowerCase().includes(query)
    );
  }

  const items = matchedItems.map((prod) => ({
    id: prod.id,
    parent_item_id: prod.categoryId,
    descriptor: {
      name: prod.name,
      code: prod.sku,
      symbol: prod.images[0],
      short_desc: prod.shortDescription,
      long_desc: prod.description,
      images: prod.images,
    },
    price: {
      currency: 'INR',
      value: prod.b2bWholesalePrice.toFixed(2),
      maximum_value: prod.b2cMrp.toFixed(2),
    },
    category_id: prod.categoryId,
    fulfillment_id: 'F1',
    location_id: 'L1',
    quantity: {
      available: { count: prod.stock.toString() },
      maximum: { count: Math.min(prod.stock, 500).toString() },
    },
    matched: true,
    tags: [
      {
        code: 'origin',
        list: [{ code: 'country', value: 'IND' }],
      },
      {
        code: 'attribute',
        list: [
          { code: 'brand', value: 'KOGNITI MINDS' },
          { code: 'hsn_code', value: prod.hsn },
          { code: 'tax_rate', value: `${prod.gstRate}%` },
          { code: 'weight', value: prod.weight },
          { code: 'dimensions', value: prod.dimensions },
        ],
      },
      {
        code: 'b2b/moq',
        list: [{ code: 'min_order_quantity', value: prod.b2bMoq.toString() }],
      },
      {
        code: 'bpp/item_discount',
        list: prod.b2bDiscountSlabs.map((slab) => ({
          code: `slab_${slab.minQty}`,
          value: JSON.stringify({
            min_qty: slab.minQty,
            max_qty: slab.maxQty || null,
            discount_percent: slab.discountPercent,
            label: slab.label,
          }),
        })),
      },
    ],
  }));

  return {
    'bpp/descriptor': {
      name: ondcConfig.seller.name,
      short_desc: ondcConfig.seller.shortDesc,
      long_desc: ondcConfig.seller.longDesc,
      images: ['https://kognitiminds.com/logo-icon.png'],
      tags: [
        { code: 'bpp_terms', list: [
          { code: 'gstin', value: ondcConfig.seller.gstin },
          { code: 'pan', value: ondcConfig.seller.pan },
          { code: 'cin', value: ondcConfig.seller.cin },
        ]},
      ],
    },
    'bpp/categories': ONDC_CATEGORIES,
    'bpp/fulfillments': [
      {
        id: 'F1',
        type: 'Delivery',
        tracking: true,
        contact: {
          phone: ondcConfig.seller.phone,
          email: ondcConfig.seller.supportEmail,
        },
      },
    ],
    'bpp/providers': [
      {
        id: ondcConfig.seller.id,
        descriptor: {
          name: ondcConfig.seller.name,
          short_desc: ondcConfig.seller.shortDesc,
          images: ['https://kognitiminds.com/logo-icon.png'],
        },
        categories: ONDC_CATEGORIES,
        locations: [
          {
            id: 'L1',
            gps: '28.6280,77.3750',
            address: {
              street: ondcConfig.seller.address.street,
              city: ondcConfig.seller.address.city,
              state: ondcConfig.seller.address.state,
              area_code: ondcConfig.seller.address.pincode,
            },
            circle: {
              gps: '28.6280,77.3750',
              radius: { unit: 'km', value: '3000' }, // Pan-India Delivery
            },
          },
        ],
        items,
        tags: [
          {
            code: 'serviceability',
            list: [
              { code: 'location', value: 'L1' },
              { code: 'category', value: 'all' },
              { code: 'type', value: 'pan_india' },
            ],
          },
        ],
      },
    ],
  };
}

export function findProductById(id) {
  return PRODUCTS_CATALOG.find((p) => p.id === id || p.sku === id);
}

export default {
  PRODUCTS_CATALOG,
  ONDC_CATEGORIES,
  buildOndcCatalog,
  findProductById,
};
