import type { Request } from 'express';

// Extend the Request interface to include a 'user' property
export interface AuthenticatedRequest extends Request {
    user?: { uid: string,
    email: string,
    emailVerified: boolean,
    displayName: string | null,
    photoURL: string | null,
    phoneNumber: string | null,

     };
  }