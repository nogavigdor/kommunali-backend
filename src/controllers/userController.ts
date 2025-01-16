import { Request, Response } from 'express';
import { User } from '../models/User';
import { admin, firebaseClientConfig, getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from '../config/firebase'; // Import Firebase Admin SDK
import firebase from 'firebase/compat/app'; 
import { FirebaseAuthError } from 'firebase-admin/auth';
import { AuthenticatedRequest } from '../types/authenticatedRequest';
import { validateRegistration, validateSocialRegistration, validateLogin } from '../validations/userValidation';
import type { IStoreModel } from '../models/Store';

// Initialize Firebase Client SDK if it hasn't been initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseClientConfig);
  }


// Register a user using Firebase Admin SDK and create a user profile in the database
export const registerUser = async (req: Request, res: Response) => {
    try {
        const validator = req.body.firebaseUserId ? validateSocialRegistration : validateRegistration;

        const { error } = validator(req.body);
        if (error) {
          return res.status(400).json({ errors: error.details.map(detail => ({ message: detail.message })) });
        }
        const { nickname, email, password, firebaseUserId} = req.body;

        let userRecord;

        if (firebaseUserId) {
            // If firebaseUserId is provided (Social Login case), retrieve the Firebase user record
            try {
                userRecord = await admin.auth().getUser(firebaseUserId);
                await admin.auth().updateUser(firebaseUserId, { displayName: nickname });
            } catch (error) {
                return res.status(400).json({ message: "Invalid Firebase UID" });
            }
        } else {
            // Create a new user in Firebase (Email/Password registration case)
            userRecord = await admin.auth().createUser({
                //displayName is the known property in firebase for nickname
                displayName: nickname,
                email: email,
                password: password,
            });
        }

        //if its a social media registration, the firebaseUserId will be the one provided in the request
        const userId = firebaseUserId || userRecord.uid;

        // Check if the user profile already exists in the database
        const existingUser = await User.findOne({userId});
        if (existingUser) {
            return res.status(400).json({ message: 'User profile already exists in mongodb' });
        }

        // Create a new user profile in the database using Firebase UID
        const newUser = new User({
            firebaseUserId: userId,
            nickname: userRecord.displayName, // Use the display name from the Firebase user record
            email: userRecord.email, // Use the email from the Firebase user record
            stores: [], // Initialize stores as an empty array
            requested_products: [], // Initialize requested_products as an empty array
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error:any) {
        console.error('Error during user registration:', error);

        // More specific Firebase error handling
        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({ message: 'Email already exists in Firebase' });
        } else if (error.code === 'auth/invalid-password') {
            return res.status(400).json({ message: 'Invalid password. Please meet the requirements.' });
        } else if (error.code === 'auth/invalid-email') {
            return res.status(400).json({ message: 'Invalid email format.' });
        } else {
            return res.status(500).json({ message: 'Failed to create user profile', error: error.message });
        }
    }
};

export const loginUser = async (req: Request, res: Response) => {
    
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ errors: error.details.map(detail => ({ message: detail.message })) });
    }
    const { email, password } = req.body;
   
    const auth = getAuth();
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log(userCredential);
        const user = userCredential.user;
        res.status(200).json(user);
    } catch (error) {
        res.status(401).json({ message: 'Invalid email or password.', error });
    }
};


// Get user information by Firebase UID
export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const firebaseUserId = req.user?.uid; ;

        if (!firebaseUserId) {
            return res.status(401).json({ message: 'Unauthorized: No user ID found' });
        }

        const user = await User.findOne({ firebaseUserId }).populate<{ stores: IStoreModel[] }>('stores');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user', error });
    }
};

// Update user information
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const firebaseUserId = req.user?.uid; 
        const updatedData = req.body;

        const updatedUser = await User.findOneAndUpdate({ firebaseUserId }, updatedData, { new: true }).populate<{stores: IStoreModel[]}>('stores');
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user profile', error });
    }
};

// Delete user profile
export const deleteUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const firebaseUserId = req.user?.uid;

        const deletedUser = await User.findOneAndDelete({ firebaseUserId });
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!firebaseUserId) {
            return res.status(400).json({ message: 'Invalid Firebase UID' });
        }
        await admin.auth().deleteUser(firebaseUserId);

        res.status(200).json({ message: 'User profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user profile', error });
    }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const auth = getAuth();

        await sendPasswordResetEmail(auth, email); // TODO: Add url for the actionCodeSettings (redirect after change)

        res.status(200).json({ message: 'Password reset link sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send password reset link', error });
    }
}
