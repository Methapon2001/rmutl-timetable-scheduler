import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import {
  createPlan,
  deletePlan,
  requestPlan,
  updatePlan,
} from "../services/plan.service";
import planSchema from "./validation/plan.schema";

export default async (server: FastifyInstance) => {
  server.post("/api/plan", {
    onRequest: auth(),
    handler: createPlan,
    schema: {
      body: {
        ...planSchema.body,
        required: ["name", "detail", "courseId"],
      },
    },
  });

  server.get("/api/plan", {
    handler: requestPlan,
    schema: {
      querystring: planSchema.querystring,
    },
  });

  server.get("/api/plan/:id", {
    handler: requestPlan,
    schema: {
      params: planSchema.params,
    },
  });

  server.put("/api/plan/:id", {
    onRequest: auth(),
    handler: updatePlan,
    schema: {
      params: planSchema.params,
      body: planSchema.body,
    },
  });

  server.delete("/api/plan/:id", {
    onRequest: auth(),
    handler: deletePlan,
    schema: {
      params: planSchema.params,
    },
  });
};
