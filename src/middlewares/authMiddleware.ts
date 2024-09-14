import { Request, Response, NextFunction } from 'express';
import admin from '.././config/firebase'; // Import the initialized Firebase Admin instance

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split('Bearer ')[1]; // Extract the token from the Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    // Verify the token using Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as any).user = decodedToken; // Attach the decoded token to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};