import { Types } from 'mongoose';

export interface ILocationQuery {
  topLeft: [number, number];
  topRight: [number, number];
  bottomRight: [number, number];
  bottomLeft: [number, number];
}