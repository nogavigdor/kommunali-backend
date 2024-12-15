import { Types } from 'mongoose';
export interface IProduct {
    _id?: Types.ObjectId; 
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    status: 'available' | 'reserved' | 'sold' | 'hidden';
    requestQueue: { user: Types.ObjectId, timestamp: Date }[];
    reservedFor: Types.ObjectId |  null;
    reservedExpiration: Date | null;
    soldTo?: Types.ObjectId;
  }

  export interface IProductWithDates extends IProduct {
    createdAt: Date;
    updatedAt: Date;
  }