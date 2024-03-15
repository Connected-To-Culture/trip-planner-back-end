
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import User from '~/models/userModel';
import bcryptjs from 'bcryptjs';
import { connectToMongoose } from '~/dBconfig/MongoDb';
type SignUpRequestBody = {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
}
// Establish database connection
connectToMongoose();
export default async function signUpHandler(app: FastifyInstance) {
    app.post('/sign-up', async (req: FastifyRequest, res: FastifyReply) => {
        try {
            // Check if request body is valid
            const requestBody = req.body as SignUpRequestBody;
            if (!requestBody) {
                return res.status(400).send({ message: 'Invalid request body' });
            }
            const { firstname, lastname, username, email, password } = requestBody;

            // Check if user already exists
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(409).send({ message: 'Username is already taken' });
            }

            // Hash password
            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(password, salt);

            // Create new user
            const newUser = new User({
                firstname,
                lastname,
                username,
                email,
                password: hashedPassword
            });

            // Save new user to database
            const savedUser = await newUser.save();

            // Send response
            return res.status(201).send({
                success: true,
                user: savedUser
            });
        } catch (error) {
            console.error('Error in sign-up handler:', error);
            return res.status(500).send({
                success: false,
                error: 'An internal server error occurred'
            });
        }
    });
}
