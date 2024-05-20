// create controller for GET, POST, PATCH, DELETE

import { FastifyReply, FastifyRequest } from "fastify";
import { userService } from "~/services/users";

// GET controller 

export const getUser = async (req : FastifyRequest<{ Querystring: { id?: string; email?: string } }>, reply : FastifyReply)=> {
    const { id, email } = req.query;
    try {
        // why do we need to set a varibale to save the query if it already been saved on req.query ? 
        let query = {};
        if (id) {
            query = { id: id };
        } else if (email) {
            query = { email: email };
        } else {
            return reply.status(400).send({ message: "Query parameter id or email is required" });
        }
        // Adding a userService to handle small user actions such as find, findById and so on.
        const user = await userService.getAll(query);
        if (!user) {
            return reply.status(404).send({ message: "User not found" });
        }
        return reply.send(user);
    }
    catch (err) { 
        console.log(err);
        return reply.status(500).send({ message: "Internal server error" });
    }

}; 

export * as userController from "./users";