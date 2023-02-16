import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import {
  createGroup,
  deleteGroup,
  requestGroup,
  updateGroup,
} from "../services/group.service";
import groupSchema from "./validation/group.schema";

export default async (server: FastifyInstance) => {
  server.post("/api/group", {
    onRequest: auth(),
    handler: createGroup,
    schema: {
      body: {
        ...groupSchema.body,
        required: ["name"],
      },
    },
  });

  server.get("/api/group", {
    handler: requestGroup,
    schema: {
      querystring: groupSchema.querystring,
    },
  });

  server.get("/api/group/:id", {
    handler: requestGroup,
    schema: {
      params: groupSchema.params,
    },
  });

  server.put("/api/group/:id", {
    onRequest: auth(),
    handler: updateGroup,
    schema: {
      params: groupSchema.params,
      body: groupSchema.body,
    },
  });

  server.delete("/api/group/:id", {
    onRequest: auth(),
    handler: deleteGroup,
    schema: {
      params: groupSchema.params,
    },
  });
};
