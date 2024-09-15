import mongoose, { Schema, Document } from 'mongoose';
import { IStore } from '../types/store'; // Import the interface

// Create a Mongoose schema using the interface
interface IStoreModel extends IStore, Document {} // Extend the IProduct interface with Document

// Define the Store schema
const StoreSchema: Schema = new Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    address: {
      street: { type: String, required: true },
      houseNumber: { type: String, required: true },
      apartment: { type: String },
      postalCode: { type: String, required: true },
      city: { type: String, required: true },
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

// Create a 2dsphere index for geospatial queries
StoreSchema.index({ location: '2dsphere' });

// Export the Store model
export const Store = mongoose.model<IStoreModel>('Store', StoreSchema);
