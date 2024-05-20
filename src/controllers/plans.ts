// create controller for GET, POST, PATCH and DELETE

import { FastifyReply, FastifyRequest } from "fastify";
import { planService } from "~/services/plans";

export const getPlans = async (req: FastifyRequest, reply: FastifyReply) => {
    // todo 
    // where is the id of the plan comminng from ? 
    try {
        const plans = await planService.getAll(query);
        if (!plans) {
            return reply.status(404).send({ message: "Plans not found" });
        }
    } catch (err) {
        console.error("Error querying user:", err);
        return reply.status(500).send({ message: "Internal server error" });
    }
};

export * as planController from "./plans.ts";