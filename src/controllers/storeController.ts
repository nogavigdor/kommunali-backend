import { Request, Response } from 'express';
import mongoose from 'mongoose'; // Import mongoose for ObjectId
import { Store } from '../models/Store';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types/authenticatedRequest';
import { ILocationQuery } from '../types/locationQuery';

// Create a new store
export const createStore = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, description, location, address } = req.body;

        const firebaseUserId = req.user?.uid;

        const user = await User.findOne({ firebaseUserId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const owner = user._id;
        const ownerFirebaseId = firebaseUserId;

        const newStore = new Store({
            owner,
            ownerFirebaseId,
            name,
            description,
            location,
            address,
            products: [],
        });

        const savedStore = await newStore.save();

        // Add the store to the owner's list of stores
        user.stores.push(savedStore._id);
        await user.save();

        res.status(201).json(savedStore);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create store', error });
    }
};

// Get all stores
export const getAllStores = async (req: Request, res: Response) => {
    try {
        const stores = await Store.find().populate('owner'); // Populates the owner field with user data
        res.status(200).json(stores);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stores', error });
    }
};

// Get all stores within the specified bounds (2 coordinates which define a rectangle)
export const getStoresInBounds = async (req: Request, res: Response) => {
    try {
        const { bottomLeft, topRight } = req.body as ILocationQuery;

        const stores = await Store.find({
            location: {
                $geoWithin: {
                    $box: [bottomLeft, topRight],
                },
            },
        });
        

        res.status(200).json(stores);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stores', error });
    }
};

// Get a store by ID
export const getStoreById = async (req: Request, res: Response) => {
    try {
        const { storeId } = req.params;

        // Validate storeId
        if (!mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(400).json({ message: 'Invalid store ID' });
        }

        const store = await Store.findById(storeId).populate('owner');
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        res.status(200).json(store);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch store', error });
    }
};

// Update store details
export const updateStore = async (req: Request, res: Response) => {
    try {
        const { storeId } = req.params;
        const updatedData = req.body;

        // Validate storeId
        if (!mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(400).json({ message: 'Invalid store ID' });
        }

        const updatedStore = await Store.findByIdAndUpdate(storeId, updatedData, { new: true, runValidators: true });
        if (!updatedStore) {
            return res.status(404).json({ message: 'Store not found' });
        }

        res.status(200).json(updatedStore);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update store', error });
    }
};

// Delete a store
export const deleteStore = async (req: Request, res: Response) => {
    try {
        const { storeId } = req.params;

        // Validate storeId
        if (!mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(400).json({ message: 'Invalid store ID' });
        }

        const deletedStore = await Store.findByIdAndDelete(storeId);
        if (!deletedStore) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Optionally, you could also remove this store from the owner's list of stores
        await User.findByIdAndUpdate(deletedStore.owner, { $pull: { stores: storeId } });

        res.status(200).json({ message: 'Store deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete store', error });
    }
};
