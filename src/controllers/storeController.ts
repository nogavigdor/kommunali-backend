import { Request, Response } from 'express';
import mongoose from 'mongoose'; // Import mongoose for ObjectId
import { Store } from '../models/Store';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types/authenticatedRequest';

// Create a new store
export const createStore = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { ownerId, name, description, location, address } = req.body;

        // Validate ownerId as an ObjectId
        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
            return res.status(400).json({ message: 'Invalid owner ID' });
        }

        // Cast ownerId to ObjectId
        const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

        // Check if the owner exists
        const owner = await User.findById(ownerObjectId);
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        const newStore = new Store({
            owner: ownerObjectId,
            name,
            description,
            location,
            address,
            products: [],
        });

        const savedStore = await newStore.save();

        // Add the store to the owner's list of stores
        owner.stores.push(savedStore._id);
        await owner.save();

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
