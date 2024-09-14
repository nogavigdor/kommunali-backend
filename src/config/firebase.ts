import admin from 'firebase-admin';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Get the path to the Firebase Admin SDK JSON file from the .env file
const serviceAccountPath = path.resolve(process.env.FIREBASE_ADMIN_SDK_PATH || '');

// Ensure the service account path is set correctly
if (!serviceAccountPath) {
  throw new Error('FIREBASE_ADMIN_SDK_PATH is not set in the .env file');
}

// Load the service account key file
const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin SDK with the service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
