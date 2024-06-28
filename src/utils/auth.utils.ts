import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

export const createToken = (payload: string | object | Buffer, expiresIn: string = '1d') => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn });
};

export const hash = (s: string) => {
  return bcryptjs.hash(s, 10);
};
