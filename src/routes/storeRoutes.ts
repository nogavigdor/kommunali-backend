import express from 'express';
import {
  createStore,
  getAllStores,
  getStoreById,
  updateStore,
  deleteStore
} from '../controllers/storeController';

const router = express.Router();

// Create a new store
router.post('/', createStore);

// Get all stores
router.get('/', getAllStores);

// Get a specific store by ID
router.get('/:storeId', getStoreById);

// Update store details
router.put('/:storeId', updateStore);

// Delete a store
router.delete('/:storeId', deleteStore);

export default router;
