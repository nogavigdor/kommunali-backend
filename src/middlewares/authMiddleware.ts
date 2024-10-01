import { Request, Response, NextFunction } from 'express';
import { admin } from '.././config/firebase'; // Import the initialized Firebase Admin instance
import { AuthenticatedRequest } from '../types/authenticatedRequest';
import { User } from '../models/User';
import { UserRole } from '../types/user';



export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization; // Get the token from the Authorization header

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authorizationHeader.split(' ')[1]; 
  try {
    // Verify the token using Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('decodedToken', decodedToken);
    (req as AuthenticatedRequest).user = decodedToken; // Attach the decoded token to the request object
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

export const verifyAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(403).json({ message: 'Forbidden: login required' });
  }
  const firebaseUserId = req.user.uid;
  const user = await User.findOne({ firebaseUserId });
  if (user?.role !== UserRole.ADMIN) {
    return res.status(403).json({ message: 'Forbidden: admin role required' });
  }
  next();
};