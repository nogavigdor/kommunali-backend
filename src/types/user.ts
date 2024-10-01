import { Types } from 'mongoose';

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
  }

export interface IUser {
    _id?: Types.ObjectId; 
    firebaseUserId: string;
    role: UserRole;
    email: string;
    firstName: string;
    lastName: string;
    stores: Types.ObjectId[]; // Array of store IDs
    updatedAt: Date;
  }
  