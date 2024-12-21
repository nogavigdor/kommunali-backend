import { IProduct } from './product';
import { Types } from 'mongoose';

export interface IStore {
    _id?: Types.ObjectId; 
    owner: string; // User ID as a string
    ownerFirebaseId: string;
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
    products: IProduct[]; // Array of products (IProduct interface)
    createdAt: Date;
    updatedAt: Date;
  }
  