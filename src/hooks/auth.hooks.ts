import jwt from 'jsonwebtoken';
import { Jwt } from '~/types/auth.types';

export const verifyJwt = (requiredType = Jwt.User) => {
  return (req, res, done) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.code(401).send({ message: 'No jwt provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      type Payload = {
        type: Jwt;
      };
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as Payload;
      console.log(payload.type, requiredType);
      if (payload.type !== requiredType) {
        return res.code(401).send({ message: 'Invalid jwt type' });
      }
      req.user = payload;
      return done();
    } catch (err) {
      return res.code(401).send({ message: 'Invalid jwt' });
    }
  };
};
