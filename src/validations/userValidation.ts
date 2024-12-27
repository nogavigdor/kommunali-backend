import Joi from 'joi';
import { IRegisterUser, IUser } from '../types/user';

export const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'string.empty': 'Password is required',
  }),
  nickname: Joi.string().min(3).required().messages({
    'string.min': 'Password must be at least 3 characters',
    'string.empty': 'Nickname is required',
  }),

});

export const validateRegistration = (data: IRegisterUser) => {
  return userRegistrationSchema.validate(data, { abortEarly: false });
};

export const userLoginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'string.empty': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters',
        'string.empty': 'Password is required',
    }),
    });

export const validateLogin = (data: IRegisterUser) => {
    return userLoginSchema.validate(data, { abortEarly: false });
}
