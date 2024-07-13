import jwt from 'jsonwebtoken';

export const createJwt = (
  payload: string | object | Buffer,
  expiresIn: string = '30d',
) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn });
};
