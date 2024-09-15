import admin from 'firebase-admin';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config(); // Load environment variables

// Get the path to the Firebase Admin SDK JSON file from the .env file
const serviceAccountPath = path.resolve(process.env.FIREBASE_ADMIN_SDK_PATH || '');

// Ensure the service account path is set correctly
if (!serviceAccountPath) {
  throw new Error('FIREBASE_ADMIN_SDK_PATH is not set in the .env file');
}

// Check if the file exists at the specified path
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`Service account file not found at path: ${serviceAccountPath}`);
}

// Load the service account key file
const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin SDK with the service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
