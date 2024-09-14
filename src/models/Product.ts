// src/models/Product.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from '../types/product'; // Import the interface

// Create a Mongoose schema using the interface
interface IProductModel extends IProduct, Document {} // Extend the IProduct interface with Document

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['available', 'reserved', 'sold', 'hidden'], 
    default: 'available' 
  },
}, { timestamps: true });

// Export the Mongoose model
export const Product = mongoose.model<IProductModel>('Product', ProductSchema);
