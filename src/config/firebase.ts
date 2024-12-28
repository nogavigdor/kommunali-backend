import admin from 'firebase-admin';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import * as firebase from 'firebase/app';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

// Extract necessary fields for the Firebase client SDK configuration
const firebaseClientConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: serviceAccountKey.client_id,
  appId: process.env.FIREBASE_APP_ID, // Unique identifier for the Firebase application
};

//Initialize Firebase Client SDK
firebase.initializeApp(firebaseClientConfig); // Initialize Firebase Client SDK

export { admin, firebaseClientConfig, getAuth, signInWithEmailAndPassword, sendPasswordResetEmail };
