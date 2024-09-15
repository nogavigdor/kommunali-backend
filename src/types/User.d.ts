export interface IUser {
    firebaseUserId: string;
    email: string;
    firstName: string;
    lastName: string;
    stores: string[]; // Array of store IDs (as strings) representing the user's stores
    createdAt: Date;
    updatedAt: Date;
  }
  