export interface IStore {
    owner: string; // User ID as a string
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
    products: string[]; // Array of product IDs (as strings)
    createdAt: Date;
    updatedAt: Date;
  }
  