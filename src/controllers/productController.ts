import { Request, Response } from 'express';
import { IProduct } from '../types/product'; // Importing the interface
import { Store } from '../models/Store';
import { Types } from 'mongoose';

export const addProduct = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const { name, description, price, imageUrl } = req.body;

    // Find the store by ID
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    // Validate product details
    if (!name || !price) {
      return res.status(400).json({ message: 'Product name and price are required.' });
    }

     // Create a new product subdocument using the Mongoose schema
     const newProduct: IProduct = { name, description, price, imageUrl, status: 'available' };

    // Push the new product into the store's products array
    store.products.push(newProduct);
    await store.save();

    // Return the newly added product
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add product', error });
  }
};


// Update product status (available, reserved, sold, hidden)
export const updateProductStatus = async (req: Request, res: Response) => {
      try {
        const { storeId, productId } = req.params;
        const { status } = req.body; // Expected to be one of: "available", "reserved", "sold", "hidden"
    
        // Validate status
        if (!['available', 'reserved', 'sold', 'hidden'].includes(status)) {
          return res.status(400).json({ message: 'Invalid status value' });
        }
    
        // Find the store
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ message: 'Store not found.' });
      }

       // Cast products to DocumentArray to use .id() method
     const productsArray = store.products as Types.DocumentArray<IProduct>;

      // Find the product in the store's products array
      const product = productsArray.id(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found in store.' });
      }

      // Update the product status
      product.status = status;
      await store.save();

      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update product status', error });
    }
  };

 // Get all products with optional filtering and pagination
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const { storeId } = req.params;
        const { status, page = '1', limit = '10' } = req.query;
    
        // Find the store
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ message: 'Store not found.' });
      }

      // Apply filtering if status is provided
      let products = store.products;
      if (status && ['available', 'reserved', 'sold', 'hidden'].includes(status as string)) {
        products = products.filter(product => product.status === status);
      }

      // Apply pagination
      const pageNumber = Number(page);
      const limitNumber = Number(limit);
      const paginatedProducts = products.slice((pageNumber - 1) * limitNumber, pageNumber * limitNumber);

      res.status(200).json(paginatedProducts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch products', error });
    }
  };
  // Get a single product by ID
export const getProductById = async (req: Request, res: Response) => {
    try {
      const { storeId, productId } = req.params;

      // Find the store
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ message: 'Store not found.' });
      }

      const productsArray = store.products as Types.DocumentArray<IProduct>;

      // Find the product in the store's products array
      const product = productsArray.id(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found in store.' });
      }

      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch product', error });
    }
  };
  
  // Update product details
export const updateProductDetails = async (req: Request, res: Response) => {
    try {
      const { storeId, productId } = req.params;
      const updatedData = req.body;

      // Find the store
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ message: 'Store not found.' });
      }

       // Cast products to DocumentArray to use .id() method
    const productsArray = store.products as Types.DocumentArray<IProduct>;

      // Find the product in the store's products array
      const product = productsArray.id(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found in store.' });
      }

      // Update the product's fields
      Object.assign(product, updatedData);
      await store.save();

      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update product details', error });
    }
  };

  // Delete a product by ID (hard delete)
export const deleteProduct = async (req: Request, res: Response) => {
    try {
      const { storeId, productId } = req.params;

      // Find the store
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ message: 'Store not found.' });
      }

       // Cast products to DocumentArray to use .id() method
    const productsArray = store.products as Types.DocumentArray<IProduct>;

      // Remove the product from the store's products array
      const product = productsArray .id(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found in store.' });
      }

     

      product.remove(); // Remove the product
      await store.save();

      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete product', error });
    }
  };
  
  