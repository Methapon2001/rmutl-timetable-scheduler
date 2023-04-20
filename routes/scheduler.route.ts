import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import {
  createScheduler,
  deleteScheduler,
  requestScheduler,
  updateScheduler,
} from "../services/scheduler.service";
import schedulerSchema from "./validation/scheduler.schema";

export default async (server: FastifyInstance) => {
  server.post("/api/scheduler", {
    onRequest: auth(),
    handler: createScheduler,
    schema: {
      body: {
        ...schedulerSchema.body,
        required: ["weekday", "start", "end", "sectionId"],
      },
    },
  });

  server.get("/api/scheduler", {
    handler: requestScheduler,
    schema: {
      querystring: schedulerSchema.querystring,
    },
  });

  server.get("/api/scheduler/:id", {
    handler: requestScheduler,
    schema: {
      params: schedulerSchema.params,
    },
  });

  server.put("/api/scheduler/:id", {
    onRequest: auth(),
    handler: updateScheduler,
    schema: {
      params: schedulerSchema.params,
      body: schedulerSchema.body,
    },
  });

  server.delete("/api/scheduler/:id", {
    onRequest: auth(),
    handler: deleteScheduler,
    schema: {
      params: schedulerSchema.params,
    },
  });
};
