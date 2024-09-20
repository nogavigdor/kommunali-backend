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
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    stores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }], // References to owned stores
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt fields
);

// Export the User model
export const User = mongoose.model<IUserModel>('User', UserSchema);
