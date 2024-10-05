import { Types } from 'mongoose';
export interface IProduct {
    _id?: Types.ObjectId; 
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    status: 'available' | 'reserved' | 'sold' | 'hidden';

    reservedFor: Types.ObjectId |  null;
    reservedExpiration: Date | null;
    soldTo?: Types.ObjectId;
  }