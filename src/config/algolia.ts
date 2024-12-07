import algoliasearch from 'algoliasearch';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Algolia client
//this typing error should be ignore as algolia search provides its own types
const algoliaClient = algoliasearch(
    process.env.ALGOLIA_APP_ID as string,
     process.env.ALGOLIA_WRITE_API_KEY as string
    );
export const productsIndex = algoliaClient.initIndex('products');
