import jwt from 'jsonwebtoken';

export const createToken = (
  payload: string | object | Buffer,
  expiresIn: string = '1d',
) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn });
};
