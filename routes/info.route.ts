import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import {
  createInfo,
  deleteInfo,
  requestInfo,
  updateInfo,
} from "../services/info.service";
import infoSchema from "./validation/info.schema";

export default async (server: FastifyInstance) => {
  server.post("/api/info", {
    onRequest: auth(),
    handler: createInfo,
    schema: {
      body: {
        ...infoSchema.body,
        required: ["year", "semester"],
      },
    },
  });

  server.get("/api/info", {
    handler: requestInfo,
    schema: {
      querystring: infoSchema.querystring,
    },
  });

  server.get("/api/info/:id", {
    handler: requestInfo,
    schema: {
      params: infoSchema.params,
    },
  });

  server.put("/api/info/:id", {
    onRequest: auth(),
    handler: updateInfo,
    schema: {
      params: infoSchema.params,
      body: infoSchema.body,
    },
  });

  server.delete("/api/info/:id", {
    onRequest: auth(),
    handler: deleteInfo,
    schema: {
      params: infoSchema.params,
    },
  });
};
