import { Types } from 'mongoose'; 

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
  }

  export interface RequestedProduct {
    product: string; // String representing the product's ObjectId
    store: string;   // String representing the store's ObjectId
  }

export interface IUser {
    _id?: Types.ObjectId; 
    firebaseUserId: string;
    role: UserRole;
    email: string;
    firstName: string;
    lastName: string;
    nickname: string;
    lastCoordinates: [number, number]; // [longitude, latitude]
    stores: Types.ObjectId[]; // Array of store IDs
    requested_products: RequestedProduct[]; // Array of requested products with store references
    // Array of chat references to chats initiated by the user
    chatsInitiated: { shopId: Types.ObjectId; chatFirebaseId: string }[]; 
    updatedAt: Date;
  }
  
  export interface IRegisterUser {
    email: string;
    password: string;
  }