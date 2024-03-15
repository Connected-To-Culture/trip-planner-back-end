import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import User from '~/models/userModel';
import bcryptjs from 'bcryptjs';
import jwt from "jsonwebtoken"
import { connectToMongoose } from '~/dBconfig/MongoDb';
type Body = {
    email: string;
    password: string;
}
connectToMongoose()
export default async (app: FastifyInstance) => {
    app.post('/login', async (req: FastifyRequest, res: FastifyReply) => {
        try {
            const { email, password } = req.body as Body;
            
            // Validate input
            if (!email || !password) {
                return res.status(400).send({ error: 'Email and password are required' });
            }

            // Find user in the database
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).send({ error: 'User not found' });
            }

            // Verify password
            const isMatch = await bcryptjs.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).send({ error: 'Incorrect password' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET!,
                { expiresIn: '1d' }
            );

            // Respond with token
            return res.send({ message: 'Login successful', token });
        } catch (error) {
            console.log(error)
            return res.send(error)
        }
    });
}
