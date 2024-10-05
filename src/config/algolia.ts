/* import * as algoliasearch from 'algoliasearch'; // Correct import
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Algolia client
const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID as string, process.env.ALGOLIA_ADMIN_API_KEY as string);
export const productsIndex = algoliaClient.initIndex('products');
*/