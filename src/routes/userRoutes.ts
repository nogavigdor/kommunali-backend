import express from 'express';
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile
} from '../controllers/userController';

import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router();

//Apply the firebase auth middleware to all routes
router.use(verifyToken);

// Create a user profile (Registration)
router.post('/register', createUserProfile);

// Get user profile
router.get('/:userId', getUserProfile);

// Update user profile
router.put('/:userId', updateUserProfile);

// Delete user profile
router.delete('/:userId', deleteUserProfile);

export default router;
