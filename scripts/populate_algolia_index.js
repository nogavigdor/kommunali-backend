"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// const { MongoClient } = require('mongodb');
const mongoose_1 = __importDefault(require("mongoose"));
const Store_1 = require("../src/models/Store");
const algolia_1 = require("../src/config/algolia");
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
        mongoose_1.default.connect(process.env.MONGO_URI || '', {
        // useNewUrlParser: true,
        //useUnifiedTopology: true,
        })
            .then(() => console.log('MongoDB connected successfully'))
            .catch(err => console.error('MongoDB connection error:', err));
        //await mongoClient.connect();
        //const db = mongoClient.db();
        // const storesCollection = db.collection('stores');
        // Fetch all stores with their products
        const stores = await Store_1.Store.find().exec();
        // Flatten the products from all stores into a single array
        const products = stores.flatMap(store => store.products.map(product => ({
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
            status: product.status,
            createdAt: new Date(product.createdAt).getTime(),
            updatedAt: new Date(product.updatedAt).getTime(),
            storeId: store._id, // Include the store ID for reference
            objectID: product._id, // Algolia requires a unique `objectID`
        })));
        console.log(`Preparing to import ${products.length} products to Algolia...`);
        // Push data to Algolia
        const algoliaResponse = await algolia_1.algoliaClient.saveObjects({
            indexName: ALGOLIA_INDEX_NAME,
            objects: products,
        });
        console.log(`Successfully imported products to Algolia:`, algoliaResponse);
    }
    catch (error) {
        console.error('Error importing products to Algolia:', error);
    }
    finally {
        // Close MongoDB connection
        // await mongoClient.close();
    }
}
importProducts();
