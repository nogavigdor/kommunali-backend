import express from 'express';
import {
  addProduct,
  addProductRequest,
  approveProductRequest,
  getAllProducts,
  getProductById,
  updateProductDetails,
  updateProductStatus,
  deleteProduct
} from '../controllers/productController';
import { verifyToken, addMongoUserToRequest } from '../middlewares/authMiddleware';
import { verifyStoreOwner } from '../middlewares/storeMiddleware';
import { app } from 'firebase-admin';


const router = express.Router({ mergeParams: true });

// Add a new product
router.post('/', verifyToken, verifyStoreOwner, addProduct);

// Add a request for a specific product
router.put('/:productId/request', verifyToken, addMongoUserToRequest, addProductRequest);

// Approve a request for a specific product (only the store owner can approve requests)
router.put('/:productId/approve', verifyToken, verifyStoreOwner, approveProductRequest);

// Get all products (with optional filtering)
router.get('/', getAllProducts);

// Get a specific product by ID
router.get('/:productId', getProductById);

// Update product details
router.put('/:productId', verifyToken, verifyStoreOwner, updateProductDetails);

// Update product status (PATCH for partial update) - in case the owner wants to change the status of the product
router.patch('/:productId', verifyToken, verifyStoreOwner, updateProductStatus);

// Delete a product
router.delete('/:productId', verifyToken, verifyStoreOwner, deleteProduct);

export default router;
