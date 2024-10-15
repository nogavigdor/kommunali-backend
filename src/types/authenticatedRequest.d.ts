import type { Request } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { IUser } from './user';

// Extend the Request interface to include a 'user' property which contains firebase user data
export interface AuthenticatedRequest extends Request {
    user?: DecodedIdToken;
  }

export interface AuthenticatedMongoRequest extends AuthenticatedRequest {
    mongoUser?: IUser;
  }