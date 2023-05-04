import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import {
  createExam,
  deleteExam,
  requestExam,
  updateExam,
} from "../services/exam.service";
import examSchema from "./validation/exam.schema";

export default async (server: FastifyInstance) => {
  server.post("/api/exam", {
    onRequest: auth(),
    handler: createExam,
    schema: {
      body: {
        ...examSchema.body,
        required: ["section", "instructor"],
      },
    },
  });

  server.get("/api/exam", {
    handler: requestExam,
    schema: {
      querystring: examSchema.querystring,
    },
  });

  server.get("/api/exam/:id", {
    handler: requestExam,
    schema: {
      params: examSchema.params,
    },
  });

  server.put("/api/exam/:id", {
    onRequest: auth(),
    handler: updateExam,
    schema: {
      params: examSchema.params,
      body: examSchema.body,
    },
  });

  server.delete("/api/exam/:id", {
    onRequest: auth(),
    handler: deleteExam,
    schema: {
      params: examSchema.params,
    },
  });
};
