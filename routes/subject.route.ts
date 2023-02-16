import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import {
  createSubject,
  deleteSubject,
  requestSubject,
  updateSubject,
} from "../services/subject.service";
import subjectSchema from "./validation/subject.schema";

export default async (server: FastifyInstance) => {
  server.post("/api/subject", {
    onRequest: auth(),
    handler: createSubject,
    schema: {
      body: {
        ...subjectSchema.body,
        required: ["code", "name", "credit", "lecture", "lab", "exam"],
      },
    },
  });

  server.get("/api/subject", {
    handler: requestSubject,
    schema: {
      querystring: subjectSchema.querystring,
    },
  });

  server.get("/api/subject/:id", {
    handler: requestSubject,
    schema: {
      params: subjectSchema.params,
    },
  });

  server.put("/api/subject/:id", {
    onRequest: auth(),
    handler: updateSubject,
    schema: {
      params: subjectSchema.params,
      body: subjectSchema.body,
    },
  });

  server.delete("/api/subject/:id", {
    onRequest: auth(),
    handler: deleteSubject,
    schema: {
      params: subjectSchema.params,
    },
  });
};
