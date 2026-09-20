/**
 * Kogniti Minds - Data Persistence REST Router
 * Enables cross-device synchronized persistence for Products, Orders, Users,
 * B2B Businesses, and Quotations.
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
]);

function validateCollection(req, res, next) {
  const collection = req.params.collection;
  if (!ALLOWED_COLLECTIONS.has(collection)) {
    return res.status(400).json({ error: `Collection '${collection}' is not supported.` });
  }
  next();
}

// GET all items in collection
dataRouter.get('/:collection', validateCollection, (req, res) => {
  try {
    const data = persistentStore.getAll(req.params.collection);
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
    res.status(200).json({ success: true, id: req.params.id });
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
