import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import {
  createSection,
  deleteSection,
  requestSection,
  updateSection,
} from "../services/section.service";
import sectionSchema from "./validation/section.schema";

export default async (server: FastifyInstance) => {
  server.post("/api/section", {
    onRequest: auth(),
    handler: createSection,
    schema: {
      body: {
        ...sectionSchema.bodyCreate,
        required: ["subjectId", "type", "section"],
      },
    },
  });

  server.get("/api/section", {
    handler: requestSection,
    schema: {
      querystring: sectionSchema.querystring,
    },
  });

  server.get("/api/section/:id", {
    handler: requestSection,
    schema: {
      params: sectionSchema.params,
    },
  });

  server.put("/api/section/:id", {
    onRequest: auth(),
    handler: updateSection,
    schema: {
      params: sectionSchema.params,
      body: sectionSchema.bodyUpdate,
    },
  });

  server.delete("/api/section/:id", {
    onRequest: auth(),
    handler: deleteSection,
    schema: {
      params: sectionSchema.params,
    },
  });
};
