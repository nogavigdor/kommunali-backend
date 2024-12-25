import { typesenseClient } from '../config/typesense';
import { Store } from '../models/Store';
import type { IProduct, IProductWithDates } from '../types/product';
import dotenv from 'dotenv';

dotenv.config();
const TYPESENSE_COLLECTION_NAME = process.env.TYPESENSE_COLLECTION_NAME ?? 'dev_kommunali_products';

// Sync a single product to Typesense
export const syncProductToTypesense = async (product: IProduct, storeId: string) => {
  const productObj = product as IProductWithDates;

  const typesenseDocument = {
    id: product._id?.toString(), // Typesense requires an `id` field
    name: product.name,
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl,
    status: product.status,
    storeId, // Associates the product with its shop
    createdAt: Math.floor(productObj.createdAt.getTime() / 1000), // Convert to seconds
    updatedAt: Math.floor(productObj.updatedAt.getTime() / 1000), // Convert to seconds
  };

  try {
    await typesenseClient.collections(TYPESENSE_COLLECTION_NAME).documents().upsert(typesenseDocument);
    console.log(`Product synced to Typesense: ${product.name}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error syncing product to Typesense: ${error.message}`);
    } else {
      console.error('Error syncing product to Typesense:', error);
    }
  }
};

// Delete a product from Typesense
export const deleteProductFromTypesense = async (productId: string) => {
  try {
    await typesenseClient.collections(TYPESENSE_COLLECTION_NAME).documents(productId).delete();
    console.log(`Product deleted from Typesense: ${productId}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error deleting product from Typesense: ${error.message}`);
    } else {
      console.error('Error deleting product from Typesense:', error);
    }
  }
};
