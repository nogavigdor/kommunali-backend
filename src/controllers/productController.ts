import { Request, Response } from 'express';
import { IProduct} from '../types/product'; // Importing the interface
import { Store } from '../models/Store';
import { Types } from 'mongoose';
import { AuthenticatedRequest, AuthenticatedMongoRequest } from '../types/authenticatedRequest';
import { User } from '../models/User';
//import { syncProductToAlgolia, deleteProductFromAlgolia } from '../services/algoliaSync'; // Import the Algolia sync function
import { syncProductToTypesense, deleteProductFromTypesense } from '../services/typesenseSync';
import mongoose from 'mongoose';

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
     const newProduct: IProduct = {
       name, description, price, imageUrl, status: 'available', requestQueue: [],
     //   reservedFor: null, reservedExpiration: null
      };

    // Push the new product into the store's products array
    store.products.push(newProduct);
    // Save the store with the new product
    const mongoDBStore = await store.save();
    // Get the newly added product object - which now includes the value of the created and updated dates added by Mongoose
    const returnedNewProduct = mongoDBStore.products[mongoDBStore.products.length - 1];

    // Sync the new product to Typesense
          await syncProductToTypesense(returnedNewProduct, storeId).catch((error) => {
            console.error('Failed to sync the new product with Typesense:', error);
          });

    // Return the newly added product
    res.status(201).json(returnedNewProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add product', error });
  }
};

//Add/update A product request with the ability to reserve and cancel reservation
export const addProductRequest = async (req: AuthenticatedMongoRequest, res: Response) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const { storeId, productId } = req.params;
    //retrieving the user details which was added to the request object by the verifyToken middleware
    const user = req.mongoUser;
    const { action } = req.body;
    // Find the store by ID
    const store = await Store.findById(storeId).session(session);
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required.' });
    }
    if ( action === 'request') {
      // Find the product in the store's products array
      const product = store.products.find(product => product._id?.toString() === productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found in store.' });
      }
      // Check if the product is available
      if (product.status == 'sold' || product.status == 'hidden') {
        return res.status(400).json({ message: 'Product is not available.' });
      }
 // Add user to the queue
 const existingRequest = user && user._id ? product.requestQueue?.
 find(entry => entry.user?.toString() === user._id?.toString()) : null;
 if (existingRequest) {
   return res.status(400).json({ message: 'You have already requested this product.' });
 }

 if (user && user._id) {
   product.requestQueue.push({ user: user._id, timestamp: new Date() });
   product.status = 'reserved';
 } else {
   return res.status(400).json({ message: 'User ID is missing.' });
 }
 await store.save({session});

 // update the user position in the queue
 //const position = user && user._id ? product.requestQueue.findIndex(entry => entry.user?.toString() === user._id?.toString()) + 1 : -1;
 /*
 return res.status(200).json({ message: `You have been added to the queue. Your position is ${position}.` });
      // Reserve the product for the user
      product.status = 'reserved';
      product.reservedFor = user?._id ?? null;
      product.reservedExpiration = new Date(Date.now() + 10000 * 60 * 1000); // 10000 minutes from now
      await store.save();

      console.log('the store id is', storeId);
      console.log('the product id is', productId);
*/
    // Sync the product with the updated reserved status with Algolia
    await syncProductToTypesense(product, storeId).catch((error) => {
      console.error('Failed to sync with Typesense with the product reserved status:', error);
    });


       // Add the product to the user's requested_products array
       const updatedUser = await User.findByIdAndUpdate(
        user?._id,
        { $addToSet: { requested_products: { product: productId, store: storeId } } },
        { session, new: true }
      );
      console.log(updatedUser);

    //  return res.status(200).json({ message: 'Product reserved successfully', product });
    session.commitTransaction();
    return res.status(200).json(product);

    } else if (action === 'cancel') {
      // Find the product in the store's products array
      const product = store.products.find(product => product._id?.toString() === productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found in store.' });
      }
      if(product.status !== 'reserved') {
        return res.status(400).json({ message: 'Product is not reserved.' });
      }
      // Find the product's index
      const requestIndex = product.requestQueue.
      findIndex(entry => entry.user?.toString() === user?._id?.toString());

        // Check if the product is reserved by the user or the user is the store owner
      if (requestIndex === -1) {
        return res.status(400).json({ message: 'Product cannot be cancelled by you.' });
      }
      // Cancel the reservation
      //removing the user from the request queue
      product.requestQueue.splice(requestIndex, 1);
      //updates the product status to available if the request queue is empty
      if (product.requestQueue.length === 0) {
        product.status = 'available';
      }
      await store.save({session});
      
     // Sync new product available status with Typesense
     await syncProductToTypesense(product, storeId).catch((error) => {
      console.error('Failed to sync product available status with Typesense:', error);
    });

      // Remove the product from the user's requested_products array
      await User.findByIdAndUpdate(
        user?._id,
        { $pull: { requested_products: { product: productId } } },
        { session, new: true },
      );

      session.commitTransaction();
      return res.status(200).json(product);
      
   
    } else {
      return res.status(400).json({ message: 'Invalid action.' });
    }


    
  } catch (error) {
    res.status(500).json({ message: 'Failed to add product', error });
  }
}


// Update product status by the store owner (available, sold, hidden.but not reserver)
export const updateProductStatus = async (req: Request, res: Response) => {
      try {
        const session = await mongoose.startSession();
        session.startTransaction();
        const { storeId, productId } = req.params;
        const { status } = req.body; // Expected to be one of: "available",  "sold", "hidden"
        // Validate status
        if (!['available', 'sold', 'hidden'].includes(status)) {
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
      //delete the product from the request queue of the users who requested it
      for (const request of product.requestQueue) {
      const user = await User.findById(request.user, {$session: session});
      if (user) {
        // Remove the product from the user's requested_products array
        await User.findByIdAndUpdate(
          user._id,
          { $pull: { requested_products: { product: productId } } },
          { session, new: true }
        );
      }
    }
    // Clear the request queue
    product.requestQueue = [];
      // Update the product status
      product.status = status;
      await store.save({session});
         // Sync the product with the updated status with Algolia
    await syncProductToTypesense(product, storeId).catch((error) => {
      console.error('Failed to sync the updated product status  with Typesense:', error);
    });
      session.commitTransaction();
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update product status', error });
    }
  };

  // Approve a product request - currently not implemented
export const approveProductRequest = async (req: Request, res: Response) => {
    try {
      const { storeId, productId } = req.params;
      const { userId } = req.body;
  
      // Find the store
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ message: 'Store not found.' });
      }

      // Find the product in the store's products array
      const product = store.products.find(product => product._id?.toString() === productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found in store.' });
      }

      // Checks if the product is available
      if (product.status === 'sold'|| product.status === 'hidden') {
        return res.status(400).json({ message: 'Product is already sold and cannot be reserved.' });
      }

      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Check if the user has requested the product
      const requestedProduct = user.requested_products.find(p => p.product.toString() === productId);
      if (!requestedProduct) {
        return res.status(400).json({ message: 'User has not requested this product.' });
      }

      const firstInQueue = product.requestQueue[0];
      if (!firstInQueue || firstInQueue.user.toString() !== userId) {
        return res.status(400).json({ message: 'User is not first in the queue.' });
      }

      // Update the product status
      product.status = 'reserved';
      // product.reservedFor = userId.toString();
     //  product.reservedExpiration = new Date(Date.now() + 10000 * 60 * 1000); // 10000 minutes from now
      await store.save();

      // Remove the product from the user's requested_products array
      await User.findByIdAndUpdate(
        userId,
        { $pull: { requested_products: { product: productId } } },
        { new: true }
      );

      // Sync the product with the updated status with Typesense
      await syncProductToTypesense(product, storeId).catch((error) => {
        console.error('Failed to sync the updated product status with Typesense:', error);
      });

      res.status(200).json({ message: 'Product was reserved successfully', product });
    } catch (error) {
      res.status(500).json({ message: 'Failed to approve product request', error });
    }
  }


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
    await syncProductToTypesense(product, storeId).catch((error) => {
      console.error('Failed to sync updated product with Typesense:', error);
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

// Attempt to find the product in the products array
const product = store.products.find((p) => p && p._id && p._id.toString() === productId);
if (!product) {
  console.log('Product not found in store.');
  return res.status(404).json({ message: 'Product not found in store.' });
}

// Output the found product for confirmation
console.log('Found product:', product);


    // Remove the product from the products array
    store.products = store.products.filter(p => p._id?.toString() !== productId);
    await store.save();

       // Delete product from Typesense
       await deleteProductFromTypesense(productId).catch((error) => {
        console.error('Failed to delete the product from Typesense:', error);
      });

      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error details:', error);
      res.status(500).json({ message: 'Failed to delete product', error });
    }
  };
  
  