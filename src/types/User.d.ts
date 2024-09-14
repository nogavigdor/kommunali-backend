// src/types/user.d.ts
export interface IUser {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    stores: string[]; // Array of store IDs (as strings) representing the user's stores
    createdAt: Date;
    updatedAt: Date;
  }
  