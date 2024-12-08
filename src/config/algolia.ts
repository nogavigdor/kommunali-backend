import { algoliasearch } from 'algoliasearch';
import dotenv from 'dotenv';

dotenv.config();


// Initialize the Algolia client
export const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID as string,
  process.env.ALGOLIA_WRITE_API_KEY as string
);

// Initialize the Algolia index - not relevant in algolia v5
//export const productsIndex = algoliaClient.initIndex('products');


/*
import algoliasearch, { SearchClient } from 'algoliasearch';
import dotenv from 'dotenv';

dotenv.config();

// Workaround: Explicitly cast `algoliasearch` to callable type
const algolia = algoliasearch as unknown as (
  appId: string,
  apiKey: string
) => SearchClient;

// Initialize the Algolia client
const algoliaClient = algolia(
  process.env.ALGOLIA_APP_ID as string,
  process.env.ALGOLIA_WRITE_API_KEY as string
) as SearchClient & { initIndex: (indexName: string) => any }; // Add initIndex manually

// Initialize the Algolia index
export const productsIndex = algoliaClient.initIndex('products');
*/