import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types/user'; // Import the interface

// Create a Mongoose schema using the interface
interface IUserModel extends IUser, Document {
  _id: mongoose.Types.ObjectId;
} // Extend the IProduct interface with Document

// Define the User schema
const UserSchema: Schema = new Schema(
  {
    firebaseUserId: { type: String, required: true },
    role: { type: String, default: 'user' },
    email: { type: String, required: true, unique: true },
    firstName: { type: String, optional: true },
    lastName: { type: String, optional: true },
    lastCoordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    stores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }], // References to owned stores
    requested_products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId }, // Reference to the product's _id (embedded in Store)
        store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }, // Reference to the Store
      },
    ],
    chatsInitiated: [{ 
      shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }, // Reference to the Store
      chatFirebaseId: { type: String, required: true },
    }], // References to chats
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt fields
);

// Export the User model
export const User = mongoose.model<IUserModel>('User', UserSchema);
