import mongoose, { Schema, Document } from 'mongoose';

// Define the Store interface
interface IStore extends Document {
  owner: mongoose.Types.ObjectId; // Reference to the User model
  name: string;
  description: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: {
    street: string;
    houseNumber: string;
    apartment?: string;
    postalCode: string;
    city: string;
  };
  products: mongoose.Types.ObjectId[]; // Array of product references
  createdAt: Date;
  updatedAt: Date;
}

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
export const Store = mongoose.model<IStore>('Store', StoreSchema);
