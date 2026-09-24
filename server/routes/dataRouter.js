/**
 * Kogniti Minds - Data Persistence REST Router
 * Enables cross-device synchronized persistence for Products, Orders, Users,
 * B2B Businesses, Quotations, Certifications, Stories, and Site Media.
 */

import express from 'express';
import { persistentStore } from '../storage/persistentStore.js';
import logger from '../logger.js';

export const dataRouter = express.Router();

const ALLOWED_COLLECTIONS = new Set([
  'products',
  'categories',
  'b2c_users',
  'b2b_businesses',
  'b2c_orders',
  'b2b_orders',
  'b2b_quotations',
  'admin_users',
  'coupons',
  'settings',
  'certifications',
  'certification_categories',
  'stories',
  'gallery_categories',
  'site_media',
  'policies',
  'policy_records',
  'policy_versions',
  'testimonials',
  'reviews',
  'review_audit_logs',
]);

function validateCollection(req, res, next) {
  const collection = req.params.collection;
  if (!ALLOWED_COLLECTIONS.has(collection)) {
    return res.status(400).json({ error: `Collection '${collection}' is not supported.` });
  }
  // Enforce zero-caching for fresh data synchronization
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}

function isAuthorizedAdmin(req) {
  const authHeader = (req.headers['authorization'] || '').toLowerCase();
  const adminRole = (req.headers['x-admin-role'] || '').toLowerCase();
  return (
    authHeader.includes('admin') ||
    authHeader.includes('super_admin') ||
    adminRole === 'admin' ||
    adminRole === 'super_admin'
  );
}

function sanitizeProductItem(item, isAdmin) {
  if (isAdmin) return item;
  const copy = { ...item };
  const stock = typeof copy.stock === 'number' ? copy.stock : 0;
  if (!copy.stockStatus) {
    copy.stockStatus = stock > 50 ? 'in_stock' : (stock > 0 ? 'limited_stock' : 'out_of_stock');
  }
  delete copy.stock;
  delete copy.stockQuantity;
  return copy;
}

// GET all items in collection
dataRouter.get('/:collection', validateCollection, (req, res) => {
  try {
    let data = persistentStore.getAll(req.params.collection);
    const isAdmin = isAuthorizedAdmin(req);
    if (req.params.collection === 'products' && !isAdmin && Array.isArray(data)) {
      const sanitized = data.map((p) => sanitizeProductItem(p, false));
      return res.json(sanitized);
    }
    if (req.params.collection === 'reviews' && Array.isArray(data)) {
      const { productId } = req.query;
      if (productId) {
        data = data.filter((r) => r.productId === productId);
      }
      if (!isAdmin) {
        data = data
          .filter((r) => r.status === 'approved')
          .map((r) => {
            const clean = { ...r };
            delete clean.orderId;
            delete clean.customerId;
            delete clean.moderationNotes;
            delete clean.moderatedBy;
            delete clean.moderatedAt;
            return clean;
          });
      }
      return res.json(data);
    }
    res.json(data);
  } catch (err) {
    logger.error('DataRouter', 'get_all', `Error retrieving ${req.params.collection}`, err);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

// GET single item by ID
dataRouter.get('/:collection/:id', validateCollection, (req, res) => {
  try {
    const item = persistentStore.getById(req.params.collection, req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const isAdmin = isAuthorizedAdmin(req);
    if (req.params.collection === 'products' && !isAdmin) {
      return res.json(sanitizeProductItem(item, false));
    }
    res.json(item);
  } catch (err) {
    logger.error('DataRouter', 'get_id', `Error retrieving item ${req.params.id}`, err);
    res.status(500).json({ error: 'Failed to retrieve item' });
  }
});

// POST create/save item in collection
dataRouter.post('/:collection', validateCollection, (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid payload: JSON object required' });
    }
    const saved = persistentStore.save(req.params.collection, body);
    logger.info('DataRouter', 'save', `Saved record in ${req.params.collection}`, { id: saved.id || saved.userId || saved.rfqNumber });
    res.status(200).json({ success: true, item: saved });
  } catch (err) {
    logger.error('DataRouter', 'save_error', `Error saving to ${req.params.collection}`, err);
    res.status(500).json({ error: 'Failed to save item' });
  }
});

// PUT update existing item
dataRouter.put('/:collection/:id', validateCollection, (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    const merged = { ...body, id: req.params.id };
    const saved = persistentStore.save(req.params.collection, merged);
    res.status(200).json({ success: true, item: saved });
  } catch (err) {
    logger.error('DataRouter', 'update_error', `Error updating in ${req.params.collection}`, err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE single item
dataRouter.delete('/:collection/:id', validateCollection, (req, res) => {
  try {
    const deleted = persistentStore.delete(req.params.collection, req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Item not found or already deleted' });
    }
    logger.info('DataRouter', 'delete', `Deleted item ${req.params.id} from ${req.params.collection}`);
    res.status(200).json({ success: true, id: req.params.id, deleted: true });
  } catch (err) {
    logger.error('DataRouter', 'delete_error', `Error deleting item ${req.params.id}`, err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// POST batch save
dataRouter.post('/:collection/batch', validateCollection, (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Expected array of items for batch operation' });
    }
    persistentStore.saveBatch(req.params.collection, items);
    logger.info('DataRouter', 'batch_save', `Batch saved ${items.length} items to ${req.params.collection}`);
    res.status(200).json({ success: true, count: items.length });
  } catch (err) {
    logger.error('DataRouter', 'batch_error', `Error batch saving to ${req.params.collection}`, err);
    res.status(500).json({ error: 'Failed to perform batch save' });
  }
});

export default dataRouter;
