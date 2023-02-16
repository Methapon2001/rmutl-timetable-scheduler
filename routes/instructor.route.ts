import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import {
  createInstructor,
  deleteInstructor,
  requestInstructor,
  updateInstructor,
} from "../services/instructor.service";
import instructorSchema from "./validation/instructor.schema";

export default async (server: FastifyInstance) => {
  server.post("/api/instructor", {
    onRequest: auth(),
    handler: createInstructor,
    schema: {
      body: {
        ...instructorSchema.body,
        required: ["name"],
      },
    },
  });

  server.get("/api/instructor", {
    handler: requestInstructor,
    schema: {
      querystring: instructorSchema.querystring,
    },
  });

  server.get("/api/instructor/:id", {
    handler: requestInstructor,
    schema: {
      params: instructorSchema.params,
    },
  });

  server.put("/api/instructor/:id", {
    onRequest: auth(),
    handler: updateInstructor,
    schema: {
      params: instructorSchema.params,
      body: instructorSchema.body,
    },
  });

  server.delete("/api/instructor/:id", {
    onRequest: auth(),
    handler: deleteInstructor,
    schema: {
      params: instructorSchema.params,
    },
  });
};
