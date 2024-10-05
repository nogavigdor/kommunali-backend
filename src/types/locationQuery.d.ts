import { Types } from 'mongoose';
/* can be used to define a plygon with 4 points */
/*
export interface ILocationQuery {
  topLeft: [number, number];
  topRight: [number, number];
  bottomRight: [number, number];
  bottomLeft: [number, number];
}
*/

/* define a rectangle/screen with 2 points */
export interface ILocationQuery {
  bottomLeft: [number, number];
  topRight: [number, number];
}