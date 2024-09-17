import { Types } from 'mongoose';
export interface IUser {
    _id?: Types.ObjectId; 
    firebaseUserId: string;
    email: string;
    firstName: string;
    lastName: string;
    stores: Types.ObjectId[]; // Array of store IDs
    updatedAt: Date;
  }
  