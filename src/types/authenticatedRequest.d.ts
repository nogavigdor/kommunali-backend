import type { Request } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';

// Extend the Request interface to include a 'user' property which contains firebase user data
export interface AuthenticatedRequest extends Request {
    user?: DecodedIdToken;
  }