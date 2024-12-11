import dotenv from 'dotenv';
dotenv.config();
// const { MongoClient } = require('mongodb');
import mongoose from 'mongoose';
import { Store } from '../src/models/Store';
import { algoliaClient } from '../src/config/algolia';

// Environment variables
// const MONGO_URI = process.env.MONGO_URI;
// const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
// const ALGOLIA_ADMIN_API_KEY = process.env.ALGOLIA_WRITE_API_KEY;
const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME ?? "dev_kommunali_products";

// Initialize MongoDB client
// const mongoClient = new MongoClient(MONGO_URI);

// Initialize Algolia client
// const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);
// const algoliaIndex = algoliaClient.initIndex(ALGOLIA_INDEX_NAME);

async function importProducts() {
  try {
    // Connect to MongoDB
    mongoose.connect(process.env.MONGO_URI || '', {
      // useNewUrlParser: true,
       //useUnifiedTopology: true,
     })
     .then(() => console.log('MongoDB connected successfully'))
     .catch(err => console.error('MongoDB connection error:', err));
    //await mongoClient.connect();
    //const db = mongoClient.db();
    // const storesCollection = db.collection('stores');

    // Fetch all stores with their products
    const stores = await Store.find().exec();

    // Flatten the products from all stores into a single array
    const products = stores.flatMap(store =>
      store.products.map(product => ({
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        status: product.status,
        createdAt: new Date((product as any).createdAt).getTime(),
        updatedAt: new Date((product as any).updatedAt).getTime(),
        storeId: store._id,          // Include the store ID for reference
        objectID: product._id, // Algolia requires a unique `objectID`
      }))
    );

    console.log(`Preparing to import ${products.length} products to Algolia...`);

    // Push data to Algolia
    const algoliaResponse = await algoliaClient.saveObjects({
      indexName: ALGOLIA_INDEX_NAME,
      objects: products,
    });

    console.log(`Successfully imported products to Algolia:`, algoliaResponse);
  } catch (error) {
    console.error('Error importing products to Algolia:', error);
  } finally {
    // Close MongoDB connection
    // await mongoClient.close();
  }
}

importProducts();
