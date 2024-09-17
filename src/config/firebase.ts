import admin from 'firebase-admin';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import * as firebase from 'firebase/app';
import dotenv from 'dotenv';
import serviceAccountKey from './firebase-adminsdk.json'; // Directly import the JSON file

dotenv.config(); // Load environment variables

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

export { admin, firebaseClientConfig, getAuth, signInWithEmailAndPassword };
