import { FastifyInstance } from 'fastify';
import { userController } from '~/controllers/users';

export default async (app: FastifyInstance) => {
    app.get<{
        Querystring: {
            id?: string;
            email?: string;
        };
    }>("/users", userController.getUser);

    // TODO POST - PATCH - DELETE 
    /*
    app.patch<{
        Params: {
            id: string;
        };
        Body: {
            name?: string;
            email?: string;
        };
    }>('/users/:id', updateUser);
    */

    // add more routes ... 
};