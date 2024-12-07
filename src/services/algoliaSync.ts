import { productsIndex } from '../config/algolia';
import { Store } from '../models/Store';

// Sync all products of a store to Algolia
export const syncProductToAlgolia = async (product: any, storeId: string) => {
  const algoliaObject = {
    objectID: product._id, // Algolia requires an objectID field
    name: product.name,
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl,
    status: product.status,
    storeId, // Associates the product with its shop
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };

  try {
    await productsIndex.saveObject(algoliaObject);
    console.log(`Product synced to Algolia: ${product.name}`);
  } catch (error) {
    console.error(`Error syncing product to Algolia: ${error.message}`);
  }
};

// Delete a product from Algolia
export const deleteProductFromAlgolia = async (productId: string) => {
  try {
    await productsIndex.deleteObject(productId);
    console.log(`Product deleted from Algolia: ${productId}`);
  } catch (error) {
    console.error(`Error deleting product from Algolia: ${error.message}`);
  }
};
