import admin from 'firebase-admin';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import * as firebase from 'firebase/app';
import dotenv from 'dotenv';
//import serviceAccountKey from './firebase-adminsdk.json'; // Directly import the JSON file

dotenv.config(); // Load environment variables

// Initialize Firebase Admin SDK with environment variables
const serviceAccountKey = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Handle newlines in the private key
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

// Initialize Firebase Admin SDK with the service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey as admin.ServiceAccount),
});

// Extract necessary fields for the Firebase client SDK configuration
const firebaseClientConfig = {
  apiKey: process.env.FIREBASE_API_KEY, // These values should still be in .env for security
  authDomain: `${serviceAccountKey.project_id}.firebaseapp.com`,
  projectId: serviceAccountKey.project_id,
  storageBucket: `${serviceAccountKey.project_id}.appspot.com`,
  messagingSenderId: serviceAccountKey.client_id,
  appId: process.env.FIREBASE_APP_ID, // Unique identifier for the Firebase application
};

firebase.initializeApp(firebaseClientConfig); // Initialize Firebase Client SDK

export { admin, firebaseClientConfig, getAuth, signInWithEmailAndPassword, sendPasswordResetEmail };
