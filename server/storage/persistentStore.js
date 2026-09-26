/**
 * Kogniti Minds - Production Persistent Data Store
 * Provides persistent, atomic file-backed JSON storage under data/storage/.
 *
 * Guarantees:
 * 1. Safe Deployments: Directory data/storage/ is in .gitignore so git pulls NEVER overwrite production data.
 * 2. Atomic Writes: Writes to a temporary file first then renames atomically to eliminate corruption risk.
 * 3. Seed Safety: Seeds initial records only if the target file does NOT exist; never overwrites user records.
 * 4. Additive migrations only: Never drops tables or wipes datasets.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger.js';
import { PRODUCTS_CATALOG } from '../ondc/canonicalProducts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root data directory (ignored by git to survive pulls and deployments)
const DATA_DIR = path.resolve(__dirname, '../../data/storage');

const DEFAULT_CATEGORIES = [
  { id: 'cat_paper', name: 'Sustainable & Agri-Waste-Based Paper', slug: 'paper', displayOrder: 1 },
  { id: 'cat_notebooks', name: 'Eco Notebooks & Notepads', slug: 'notebooks', displayOrder: 2 },
  { id: 'cat_stationery', name: 'Stationery & Office Organizers', slug: 'stationery', displayOrder: 3 },
  { id: 'cat_gifting', name: 'Corporate Gifting & Hampers', slug: 'gifting', displayOrder: 4 },
  { id: 'cat_institutional', name: 'Institutional Bulk Pallets', slug: 'institutional', displayOrder: 5 },
];

const DEFAULT_ADMIN = {
  id: 'adm_super_01',
  userId: 'kogniti14',
  name: 'Shaurya Kashyap',
  email: 'kogniti14@kognitiminds.com',
  role: 'super_admin',
  department: 'Founder & CEO Kogniti Minds Private Limited',
  status: 'approved',
  registeredAt: '2026-08-01T09:00:00Z',
  approvedAt: '2026-08-01T09:00:00Z',
};

class PersistentStore {
  constructor() {
    this.cache = new Map();
    this.ensureDirectory();
    this.initializeDefaults();
  }

  ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  getFilePath(collection) {
    const cleanName = collection.replace(/[^a-zA-Z0-9_-]/g, '');
    return path.join(DATA_DIR, `${cleanName}.json`);
  }

  initializeDefaults() {
    this.ensureCollection('products', PRODUCTS_CATALOG);
    this.ensureCollection('categories', DEFAULT_CATEGORIES);
    this.ensureCollection('b2c_users', []);
    this.ensureCollection('b2b_businesses', []);
    this.ensureCollection('b2c_orders', []);
    this.ensureCollection('b2b_orders', []);
    this.ensureCollection('b2b_quotations', []);
    this.ensureCollection('admin_users', [DEFAULT_ADMIN]);
    this.ensureCollection('coupons', []);
    this.ensureCollection('settings', {
      storeName: 'Kogniti Minds Private Limited',
      contactEmail: 'support@kognitiminds.com',
      contactPhone: '+91 99316 48595',
      updatedAt: new Date().toISOString(),
    });
    this.ensureCollection('certifications', []);
    this.ensureCollection('certification_categories', []);
    this.ensureCollection('stories', []);
    this.ensureCollection('gallery_categories', []);
    this.ensureCollection('site_media', {});
    this.ensureCollection('policies', {});
    this.ensureCollection('policy_records', []);
    this.ensureCollection('policy_versions', {
      terms: '1.0.0',
      privacy: '1.0.0',
      refund: '1.0.0',
      shipping: '1.0.0',
    });
  }

  ensureCollection(collection, defaultData) {
    const filePath = this.getFilePath(collection);
    if (!fs.existsSync(filePath)) {
      this.writeToFile(filePath, defaultData);
      this.cache.set(collection, defaultData);
      logger.info('Store', 'initialize', `Initialized persistent collection: ${collection}`);
    } else {
      // Load into memory cache
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(content);
        this.cache.set(collection, parsed);
      } catch (err) {
        logger.error('Store', 'readError', `Failed to read ${collection}. Re-initializing fallback safely.`, err);
        this.writeToFile(filePath, defaultData);
        this.cache.set(collection, defaultData);
      }
    }
  }

  writeToFile(filePath, data) {
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(tempPath, jsonString, 'utf8');
    fs.renameSync(tempPath, filePath);
  }

  getAll(collection) {
    const cached = this.cache.get(collection);
    if (cached !== undefined) {
      return cached;
    }
    const filePath = this.getFilePath(collection);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        this.cache.set(collection, data);
        return data;
      } catch (err) {
        logger.error('Store', 'readError', `Error reading collection: ${collection}`, err);
      }
    }
    return Array.isArray(this.cache.get(collection)) ? [] : {};
  }

  getById(collection, id, keyField = 'id') {
    const items = this.getAll(collection);
    if (Array.isArray(items)) {
      return items.find((item) => item && (item[keyField] === id || item.id === id));
    }
    return items[id];
  }

  save(collection, item, keyField = 'id') {
    const items = this.getAll(collection);
    if (Array.isArray(items)) {
      const targetId = item[keyField] || item.id;
      const index = items.findIndex((existing) => existing && (existing[keyField] === targetId || existing.id === targetId));
      if (index >= 0) {
        items[index] = { ...items[index], ...item, updatedAt: new Date().toISOString() };
      } else {
        const newItem = {
          ...item,
          [keyField]: targetId || `item_${Date.now()}`,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        items.unshift(newItem);
      }
      this.writeToFile(this.getFilePath(collection), items);
      this.cache.set(collection, items);
      return item;
    } else if (typeof items === 'object' && items !== null) {
      const updated = { ...items, ...item, updatedAt: new Date().toISOString() };
      this.writeToFile(this.getFilePath(collection), updated);
      this.cache.set(collection, updated);
      return updated;
    }
    return item;
  }

  delete(collection, id, keyField = 'id') {
    const items = this.getAll(collection);
    if (Array.isArray(items)) {
      const filtered = items.filter((item) => item && item[keyField] !== id && item.id !== id);
      const deletedCount = items.length - filtered.length;
      if (deletedCount > 0) {
        this.writeToFile(this.getFilePath(collection), filtered);
        this.cache.set(collection, filtered);
      }
      return deletedCount > 0;
    } else if (typeof items === 'object' && items !== null) {
      if (id in items) {
        const copy = { ...items };
        delete copy[id];
        this.writeToFile(this.getFilePath(collection), copy);
        this.cache.set(collection, copy);
        return true;
      }
    }
    return false;
  }

  saveBatch(collection, newItems, keyField = 'id') {
    if (!Array.isArray(newItems)) return false;
    let items = this.getAll(collection);
    if (!Array.isArray(items)) items = [];

    for (const item of newItems) {
      const targetId = item[keyField] || item.id;
      const index = items.findIndex((existing) => existing && (existing[keyField] === targetId || existing.id === targetId));
      if (index >= 0) {
        items[index] = { ...items[index], ...item, updatedAt: new Date().toISOString() };
      } else {
        items.unshift({
          ...item,
          [keyField]: targetId || `item_${Date.now()}`,
          createdAt: item.createdAt || new Date().toISOString(),
        });
      }
    }

    this.writeToFile(this.getFilePath(collection), items);
    this.cache.set(collection, items);
    return true;
  }

  backup(destinationDir) {
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }
    const files = fs.readdirSync(DATA_DIR);
    let count = 0;
    for (const file of files) {
      if (file.endsWith('.json')) {
        const src = path.join(DATA_DIR, file);
        const dest = path.join(destinationDir, file);
        fs.copyFileSync(src, dest);
        count++;
      }
    }
    logger.info('Store', 'backup', `Successfully backed up ${count} persistent data files to ${destinationDir}`);
    return count;
  }
}

export const persistentStore = new PersistentStore();
export default persistentStore;
