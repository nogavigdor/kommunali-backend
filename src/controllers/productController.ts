import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { IProduct } from '../types/product'; // Importing the interface

export const addProduct = async (req: Request, res: Response) => {
  try {
    const newProductData: IProduct = req.body;

    if (!newProductData.name || !newProductData.price) {
      return res.status(400).json({ message: 'Product name and price are required.' });
    }

    const newProduct = new Product(newProductData);
    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add product', error });
  }
};


// Update product status (available, reserved, sold, hidden)
export const updateProductStatus = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const { status } = req.body; // Expected to be one of: "available", "reserved", "sold", "hidden"
  
      // Validate status
      if (!['available', 'reserved', 'sold', 'hidden'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
  
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { status },
        { new: true }
      );
  
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update product status', error });
    }
  };

 // Get all products with optional filtering and pagination
export const getAllProducts = async (req: Request, res: Response) => {
    try {
      const { status, page = '1', limit = '10' } = req.query;
  
      // Ensure `status` is a string
      const statusString = status as string;
  
      // Build the query
      const query: any = {};
      if (statusString && ['available', 'reserved', 'sold', 'hidden'].includes(statusString)) {
        query.status = statusString;
      }
  
      // Convert `page` and `limit` to numbers
      const pageNumber = Number(page);
      const limitNumber = Number(limit);
  
      const products = await Product.find(query)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
  
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch products', error });
    }
  };
  // Get a single product by ID
export const getProductById = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch product', error });
    }
  };
  
  // Update product details
export const updateProductDetails = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const updatedData = req.body;
  
      // validation for the updatedData should be later added here
  
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updatedData,
        { new: true, runValidators: true } // Ensure the updated data is validated
      );
  
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update product details', error });
    }
  };

  // Delete a product by ID (hard delete)
export const deleteProduct = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const deletedProduct = await Product.findByIdAndDelete(productId);
  
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete product', error });
    }
  };
  
  