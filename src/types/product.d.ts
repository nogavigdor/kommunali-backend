export interface IProduct {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    status: 'available' | 'reserved' | 'sold' | 'hidden';
  }