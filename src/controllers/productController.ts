import { Request, Response } from 'express';
import { IProduct } from '../types/product'; // Importing the interface
import { Store } from '../models/Store';
import { Types } from 'mongoose';
import { AuthenticatedRequest, AuthenticatedMongoRequest } from '../types/authenticatedRequest';
import { User } from '../models/User';
import { syncProductToAlgolia, deleteProductFromAlgolia } from '../services/algoliaSync'; // Import the Algolia sync function

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
    if (!name || price === undefined || price === null) {
      return res.status(400).json({ message: 'Product name and price are required.' });
    }

     // Create a new product subdocument using the Mongoose schema
     const newProduct: IProduct = { name, description, price, imageUrl, status: 'available', reservedFor: null, reservedExpiration: null };

    // Push the new product into the store's products array
    store.products.push(newProduct);
    await store.save();

    // Sync the new product to Algolia
          await syncProductToAlgolia(newProduct, storeId).catch((error) => {
            console.error('Failed to sync the new product with Algolia:', error);
          });

    // Return the newly added product
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add product', error });
  }
};

//Add A product request with the ability to reserve and cancel reservation
export const addProductRequest = async (req: AuthenticatedMongoRequest, res: Response) => {
  try {
    const { storeId, productId } = req.params;
    //retrieving the user details which was added to the request object by the verifyToken middleware
    const user = req.mongoUser;
    const { action } = req.body;

    // Find the store by ID
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required.' });
    }

    if ( action === 'reserve') {
      // Find the product in the store's products array
      const product = store.products.find(product => product._id?.toString() === productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found in store.' });
      }

      // Check if the product is available
      if (product.status !== 'available') {
        return res.status(400).json({ message: 'Product is not available.' });
      }

      console.log('the user id is', user?._id);

      // Reserve the product for the user
      product.status = 'reserved';
      product.reservedFor = user?._id ?? null;
      product.reservedExpiration = new Date(Date.now() + 10000 * 60 * 1000); // 10000 minutes from now
      await store.save();

      console.log('the store id is', storeId);
      console.log('the product id is', productId);

    // Sync the product with the updated reserved status with Algolia
    await syncProductToAlgolia(product, storeId).catch((error) => {
      console.error('Failed to sync with Algolia with the product reserved status:', error);
    });


       // Add the product to the user's requested_products array
       const updatedUser = await User.findByIdAndUpdate(
        user?._id,
        { $addToSet: { requested_products: { product: productId, store: storeId } } },
        { new: true }
      );
      console.log(updatedUser);

      return res.status(200).json({ message: 'Product reserved successfully', product });

    } else if (action === 'cancel') {
      // Find the product in the store's products array
      const product = store.products.find(product => product._id?.toString() === productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found in store.' });
      }

      if(product.status !== 'reserved') {
        return res.status(400).json({ message: 'Product is not reserved.' });
      }

        // Check if the product is reserved by the user or the user is the store owner
      if ( product.reservedFor?.toString() !== user?._id?.toString() && !(user?.stores.find(store => store.toString() === storeId))) {
        return res.status(400).json({ message: 'Product is not reserved by you.' });
      }

  

    

      // Cancel the reservation
      product.status = 'available';
      product.reservedFor = null;
      product.reservedExpiration = null;
      await store.save();
      

     // Sync new product available status with Algolia
     await syncProductToAlgolia(product, storeId).catch((error) => {
      console.error('Failed to sync product available status with Algolia:', error);
    });

      // Remove the product from the user's requested_products array
      await User.findByIdAndUpdate(
        user?._id,
        { $pull: { requested_products: { product: productId } } },
        { new: true }
      );

      return res.status(200).json({ message: 'Product reservation canceled', product });
      
   
    } else {
      return res.status(400).json({ message: 'Invalid action.' });
    }


    
  } catch (error) {
    res.status(500).json({ message: 'Failed to add product', error });
  }
}


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

         // Sync the product with the updated status with Algolia
    await syncProductToAlgolia(product, storeId).catch((error) => {
      console.error('Failed to sync the updated product status  with Algolia:', error);
    });

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

      // Sync the updated product to Algolia
    await syncProductToAlgolia(product, storeId).catch((error) => {
      console.error('Failed to sync updated product with Algolia:', error);
    });

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
      const product = productsArray.id(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found in store.' });
      }

     

      await product.deleteOne(); // Remove the product
      await store.save();

       // Delete product from Algolia
       await deleteProductFromAlgolia(productId).catch((error) => {
        console.error('Failed to delete the product from Algolia:', error);
      });

      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete product', error });
    }
  };
  
  