import { Request, Response } from 'express';
import { User } from '../models/User';
import { Store } from '../models/Store';
import { admin, firebaseClientConfig, getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from '../config/firebase'; // Import Firebase Admin SDK
import firebase from 'firebase/compat/app'; 
import { FirebaseAuthError } from 'firebase-admin/auth';
import { AuthenticatedRequest } from '../types/authenticatedRequest';
import { validateRegistration, validateLogin } from '../validations/userValidation';
import type { IStoreModel } from '../models/Store';

// Initialize Firebase Client SDK if it hasn't been initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseClientConfig);
  }

// create a chat witha a store
export const createChat = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { shopId, productId } = req.body;
        if (!shopId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const firebaseUserId = req.user?.uid;
        if (!firebaseUserId) {
            return res.status(401).json({ message: 'Unauthorized: No user ID found' });
        }

        const shop = await Store.findOne({_id: shopId});
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        // Create a new chat document in Firestore
        const fireStore = admin.firestore();
        const shopDoc = fireStore.collection('shopChats').doc(shopId);
        const chatsCollection = shopDoc.collection('chats');
        // Add a new chat document to the chats collection
        const chatDoc = await chatsCollection.add({
            customer: firebaseUserId,
            //currently wil be assigned with undefined
            //as product id is not yet implemented in xhat
            product: productId,
            shopOwner: shop.ownerFirebaseId,
            messages: [],
        });
        // Update the user profile with the new chat
        const user = await User.findOneAndUpdate({ firebaseUserId }, {
            $push: {
                chatsInitiated: {
                    shopId: shopId,
                    chatFirebaseId: chatDoc.id,
                },
            },
        }, { new: true });
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ message: 'Failed to create chat', error });
    }
};
