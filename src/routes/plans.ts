import { FastifyInstance } from "fastify";
import { planController } from "~/controllers/plans";
// Establish database connection

export default async (app: FastifyInstance) => {

    app.get("/users", planController.getPlans);

};


// export default async (app: FastifyInstance) => {
//   app.get("/user/plans", async (req: FastifyRequest, reply: FastifyReply) => {
//     try {
//       const plans = await Plan.find({}, { _id: false, tripName: true });
//       if (!plans) {
//         return reply.status(404).send({ message: "Plans not found" });
//       }
//       return reply.send(plans);
//     } catch (error) {
//       console.error("Error querying user:", error);
//       return reply.status(500).send({ message: "Internal server error" });
//     }
//   });
// };

