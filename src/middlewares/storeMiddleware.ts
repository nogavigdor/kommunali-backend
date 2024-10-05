import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/authenticatedRequest';
import { User } from '../models/User';

// Middleware to verify that the user is the owner of the store
export const verifyStoreOwner = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(403).json({ message: 'Forbidden: login required' });
    }
    const firebaseUserId = req.user.uid;
    const user = await User.findOne({ firebaseUserId });
    if (!user) {
        return res.status(403).json({ message: 'Forbidden: user not found' });
    }

    const { storeId } = req.params;

    const store = user.stores.find((store) => store.toString() === storeId);
    if (!store) {
        return res.status(403).json({ message: 'Forbidden: store not found' });
    }
    next();
}
