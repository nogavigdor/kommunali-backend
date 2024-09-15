import { Request, Response } from 'express';
import { User } from '../models/User';
import admin from '../config/firebase'; // Import Firebase Admin SDK

// Middleware has already verified the token, and we have the Firebase UID
export const createUserProfile = async (req: Request, res: Response) => {
    try {
        const { firebaseUserId, email, firstName, lastName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ firebaseUserId });
        if (existingUser) {
            return res.status(400).json({ message: 'User profile already exists' });
        }

        const newUser = new User({
            firebaseUserId,
            email,
            firstName,
            lastName,
            stores: [],
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create user profile', error });
    }
};

// Get user information by Firebase UID
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const { firebaseUserId } = req.body;

        const user = await User.findOne({ firebaseUserId }).populate('stores');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user', error });
    }
};

// Update user information
export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const { firebaseUserId } = req.body;
        const updatedData = req.body;

        const updatedUser = await User.findOneAndUpdate({ firebaseUserId }, updatedData, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user profile', error });
    }
};

// Delete user profile
export const deleteUserProfile = async (req: Request, res: Response) => {
    try {
        const { firebaseUserId } = req.body;

        const deletedUser = await User.findOneAndDelete({ firebaseUserId });
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Optionally, delete the Firebase user
        await admin.auth().deleteUser(firebaseUserId);

        res.status(200).json({ message: 'User profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user profile', error });
    }
};
