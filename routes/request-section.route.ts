import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import {
  checkRequestSection,
  closeRequestSection,
  createRequestSection,
  deleteRequestSection,
  listRequestSection,
  openRequestSection,
  requestSectionStatus,
} from "../services/request-section.service";

export default async (server: FastifyInstance) => {
  server.get("/api/request-section/status", {
    onRequest: auth(),
    handler: requestSectionStatus,
  });

  server.get("/api/request-section/check", {
    handler: checkRequestSection,
    schema: {
      querystring: {
        type: "object",
        required: ["key"],
        properties: {
          key: { type: "string" },
        },
      },
    },
  });

  server.post("/api/request-section/open", {
    onRequest: auth(),
    handler: openRequestSection,
  });

  server.post("/api/request-section/close", {
    onRequest: auth(),
    handler: closeRequestSection,
  });

  server.get("/api/request-section", {
    onRequest: auth(),
    handler: listRequestSection,
  });

  server.delete("/api/request-section/:id", {
    onRequest: auth(),
    handler: deleteRequestSection,
  });

  server.post("/api/request-section", {
    handler: createRequestSection,
    schema: {
      body: {
        type: "object",
        required: ["subjectId", "instructorId"],
        properties: {
          number: { type: "number" },
          subjectId: { type: "string" },
          instructorId: { type: "string" },
        },
      },
      querystring: {
        type: "object",
        required: ["key"],
        properties: {
          key: { type: "string" },
        },
      },
    },
  });
};
