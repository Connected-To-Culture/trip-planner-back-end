import jwt from 'jsonwebtoken';
import { Token } from '~/types/auth.types.js';

export const verifyToken = (requiredType = Token.User) => {
  return (req, res, done) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.code(401).send({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      type Payload = {
        type: Token;
      };
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as Payload;
      if (payload.type !== requiredType) {
        return res.code(401).send({ message: 'Invalid token type' });
      }
      req.user = payload;
      return done();
    } catch (err) {
      return res.code(401).send({ message: 'Invalid token' });
    }
  };
};
