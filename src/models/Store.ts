import mongoose, { Schema, Document } from 'mongoose';
import { IStore } from '../types/store'; // Import the interface


// Define the Product schema directly within the Store schema
const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: false },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold', 'hidden'],
      default: 'available',
    },
    requestQueue: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
       timestamp: { type: Date, default: Date.now } }],
    //reservedFor: { type: mongoose.Schema.Types.ObjectId, default: null },
    //reservedExpiration: { type: Date, default: null },
    soldTo: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true, _id: true  }
);

// Create a Mongoose schema using the interface
export interface IStoreModel extends IStore, Document {
  _id: mongoose.Types.ObjectId;
} // Extend the IStore interface with Document

// Define the Store schema
const StoreSchema: Schema = new Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerFirebaseId: { type: String, required: true },
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
    products: { type: [ProductSchema], default: [] },
  },
  { timestamps: true }
);

// Create a 2dsphere index for geospatial queries
StoreSchema.index({ location: '2dsphere' });

// Export the Store model
export const Store = mongoose.model<IStoreModel>('Store', StoreSchema);
