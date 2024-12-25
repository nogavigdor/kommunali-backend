import Typesense from 'typesense';
import dotenv from 'dotenv';

dotenv.config();

// Initializes the Typesense client
export const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST as string,
      port: parseInt(process.env.TYPESENSE_PORT as string, 10),
      protocol: 'https',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY as string,
  connectionTimeoutSeconds: 2,
});
