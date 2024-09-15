import express from 'express';
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProductDetails,
  updateProductStatus,
  deleteProduct
} from '../controllers/productController';

const router = express.Router();

// Add a new product
router.post('/', addProduct);

// Get all products (with optional filtering)
router.get('/', getAllProducts);

// Get a specific product by ID
router.get('/:productId', getProductById);

// Update product details
router.put('/:productId', updateProductDetails);

// Update product status (PATCH for partial update)
router.patch('/:productId/status', updateProductStatus);

// Delete a product
router.delete('/:productId', deleteProduct);

export default router;
