import { dot } from 'node:test/reporters';
import { algoliaClient } from '../config/algolia';
//const { productsIndex } = require('../config/algolia');
import { Store } from '../models/Store';
import type { IProduct, IProductWithDates } from '../types/product';
import dotenv from 'dotenv';

dotenv.config();
const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME ?? "dev_kommunali_products";

// Sync all products of a store to Algolia
export const syncProductToAlgolia = async (product: IProduct, storeId: string) => {
  const productObj = product as IProductWithDates;

  const algoliaObject = {
    objectID: product._id, // Algolia requires an objectID field
    name: product.name,
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl,
    status: product.status,
    storeId, // Associates the product with its shop
    createdAt: productObj.createdAt.getTime(),
    updatedAt: productObj.updatedAt.getTime(),
  };

  try {
    await algoliaClient.saveObject({
      indexName: ALGOLIA_INDEX_NAME,
      body: algoliaObject,
    });
    console.log(`Product synced to Algolia: ${product.name}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error syncing product to Algolia: ${error.message}`);
    } else {
      console.error('Error syncing product to Algolia:', error);
    }
  }
};

// Delete a product from Algolia
export const deleteProductFromAlgolia = async (productId: string) => {
  try {
    await algoliaClient.deleteObject({
      indexName: ALGOLIA_INDEX_NAME,
      objectID: productId,
    });
    console.log(`Product deleted from Algolia: ${productId}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error deleting product from Algolia: ${error.message}`);
    } else {
      console.error('Error deleting product from Algolia:', error);
    }
  }
};
