import mongoose, { Schema, Document } from 'mongoose';

// Define the User interface
interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  stores: mongoose.Types.ObjectId[]; // Array of store references (owned by the user)
  createdAt: Date;
  updatedAt: Date;
}

// Define the User schema
const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    stores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }], // References to owned stores
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt fields
);

// Export the User model
export const User = mongoose.model<IUser>('User', UserSchema);
