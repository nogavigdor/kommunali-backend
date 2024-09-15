import { Request, Response, NextFunction } from 'express';
import { admin } from '.././config/firebase'; // Import the initialized Firebase Admin instance

// Extend the Request interface to include a 'user' property
interface AuthenticatedRequest extends Request {
  user?: { uid: string };
}

export const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization; // Get the token from the Authorization header

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authorizationHeader.split(' ')[1]; 
  try {
    // Verify the token using Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as any).user = decodedToken; // Attach the decoded token to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};