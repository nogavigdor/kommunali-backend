import { IProductWithDates } from '../src/types/product';

import mongoose from 'mongoose';
import { Store } from '../src/models/Store';
import Typesense from 'typesense';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); 

const TYPESENSE_NODES = [
  {
    host: process.env.TYPESENSE_HOST || 'localhost',
    port: 443,
    protocol: 'https',
  },
];

const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY || '';
const TYPESENSE_COLLECTION_NAME = process.env.TYPESENSE_COLLECTION_NAME || 'dev_kommunali_products';

const typesenseClient = new Typesense.Client({
  nodes: TYPESENSE_NODES,
  apiKey: TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 2,
});

const typesenseSchema = {
  name: TYPESENSE_COLLECTION_NAME,
  fields: [
    { name: 'name', type: 'string' as const },
    { name: 'description', type: 'string' as const },
    { name: 'price', type: 'float' as const },
    { name: 'imageUrl', type: 'string' as const },
    { name: 'status', type: 'string' as const, facet: true },
    { name: 'createdAt', type: 'int64' as const },
    { name: 'updatedAt', type: 'int64' as const },
    { name: 'storeId', type: 'string' as const, facet: true },
    { name: 'id', type: 'string' as const },
  ],
  default_sorting_field: 'createdAt',
};



async function populateTypesense() {
  try {

    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('MongoDB connected successfully');

    try {
      await typesenseClient.collections(TYPESENSE_COLLECTION_NAME).delete();
      console.log(`Deleted existing collection: ${TYPESENSE_COLLECTION_NAME}`);
    } catch (err) {
        if (err instanceof Error) {
            console.log('Collection does not exist or could not be deleted:', err.message);
          } else {
            console.log('Collection does not exist or could not be deleted:', err);
          }
          
    }

    await typesenseClient.collections().create(typesenseSchema);
    console.log(`Created collection: ${TYPESENSE_COLLECTION_NAME}`);

    const stores = await Store.find().exec();

    const products = stores.flatMap(store =>
          store.products.map((product) => {
            const productWithDates = product as IProductWithDates;
            return {
              name: productWithDates.name,
              description: productWithDates.description,
              price: productWithDates.price,
              imageUrl: productWithDates.imageUrl,
              status: productWithDates.status,
              createdAt: Math.floor(new Date(productWithDates.createdAt).getTime() / 1000),
              updatedAt: Math.floor(new Date(productWithDates.updatedAt).getTime() / 1000),
              storeId: store._id.toString(),
              id: productWithDates._id ? productWithDates._id.toString() : '',
            };
          })
        );

    console.log(`Importing ${products.length} products into Typesense...`);
    const response = await typesenseClient.collections(TYPESENSE_COLLECTION_NAME).documents().import(products, { action: 'upsert' });
    console.log('Import response:', response);
  } catch (error) {
    console.error('Error populating Typesense:', error);
  } finally {
    mongoose.connection.close();
  }
}

populateTypesense();
