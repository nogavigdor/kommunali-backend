import express from 'express';
import {
  createChat,
} from '../controllers/chatController';

import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router();


// Create chat for the user upon user request when requesting a product
router.post('/create', verifyToken, createChat);


export default router;
 