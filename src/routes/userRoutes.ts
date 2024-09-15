import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile
} from '../controllers/userController';

import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router();


// Create a user profile (Registration)
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

// Get user profile
router.get('/:userId', verifyToken, getUserProfile);

// Update user profile
router.put('/:userId', verifyToken,  updateUserProfile);

// Delete user profile
router.delete('/:userId', verifyToken,  deleteUserProfile);

export default router;
