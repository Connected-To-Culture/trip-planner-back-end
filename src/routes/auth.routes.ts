import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import User from '~/models/user.models';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '~/utils/mailer.utils';
import z from 'zod';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

const plugin: FastifyPluginAsyncZod = async (app) => {
    type Body = {
        email: string;
        password: string;
    };
    app.post(
        '/auth/login',
        {
            schema: {
                body: {
                    email: z.string(),
                    password: z.string(),
                },
            },
        },
        async (req: FastifyRequest, res: FastifyReply) => {
            try {
                const { email, password } = req.body as Body;

                // Validate input
                if (!email || !password) {
                    return res
                        .status(400)
                        .send({ error: 'Email and password are required' });
                }

                // Find user in the database
                const user = await User.findOne({ email });
                if (!user) {
                    return res.status(404).send({ error: 'User not found' });
                }

                // Verify password
                const isMatch = await bcryptjs.compare(password, user.password);
                if (!isMatch) {
                    return res
                        .status(401)
                        .send({ error: 'Incorrect password' });
                }

                // Generate JWT token
                const token = jwt.sign(
                    { id: user.id, email: user.email },
                    process.env.JWT_SECRET!,
                    { expiresIn: '1d' },
                );

                // Respond with token
                return res.send({ message: 'Login successful', token });
            } catch (error) {
                console.log(error);
                return res.send(error);
            }
        },
    );

    type SignUpRequestBody = {
        firstname: string;
        lastname: string;
        username: string;
        email: string;
        password: string;
    };
    app.post(
        '/auth/sign-up',
        async (req: FastifyRequest, res: FastifyReply) => {
            try {
                // Check if request body is valid
                const requestBody = req.body as SignUpRequestBody;
                if (!requestBody) {
                    return res
                        .status(400)
                        .send({ message: 'Invalid request body' });
                }
                const { username, email, password } = requestBody;
                // Check if user already exists
                const existingUser = await User.findOne({ username });
                if (existingUser) {
                    return res
                        .status(409)
                        .send({ message: 'Username is already taken' });
                }
                // Hash password
                const salt = await bcryptjs.genSalt(10);
                const hashedPassword = await bcryptjs.hash(password, salt);

                // Create new user
                const newUser = new User({
                    username,
                    email,
                    password: hashedPassword,
                });

                // Save new user to database
                const savedUser = await newUser.save();

                const emailType = 'VERIFY';
                await sendEmail({ email, emailType, userId: savedUser._id });

                // Send response
                return res.status(201).send({
                    success: true,
                    user: savedUser,
                });
            } catch (error) {
                console.error('Error in sign-up handler:', error);
                return res.status(500).send({
                    success: false,
                    error: 'An internal server error occurred',
                });
            }
        },
    );
};

export default plugin;
