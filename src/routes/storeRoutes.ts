import express from 'express';
import {
  createStore,
  getAllStores,
  getStoresInBounds,
  getStoreById,
  updateStore,
  deleteStore
} from '../controllers/storeController';

import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware';  

const router = express.Router();

// Create a new store
router.post('/', verifyToken, createStore);

// Get all stores - by admin
router.get('/', verifyToken, verifyAdmin, getAllStores);

// Get all stores - by user
router.get('/', verifyToken, getAllStores);

// Get all stores in bounds
router.post('/stores-in-bounds', getStoresInBounds);


// Get a specific store by ID
router.get('/:storeId', verifyToken, getStoreById);

// Update store details
router.put('/:storeId', verifyToken, updateStore);

// Delete a store
router.delete('/:storeId', verifyToken, deleteStore);



export default router;
