import { Types } from 'mongoose';
export interface IProduct {
    _id?: Types.ObjectId; 
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    status: 'available' | 'reserved' | 'sold' | 'hidden';
  }