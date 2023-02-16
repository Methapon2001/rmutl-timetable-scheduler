import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import {
  createUser,
  deleteUser,
  requestUser,
  updateUser,
} from "../services/user.service";
import userSchema from "./validation/user.schema";

export default async (server: FastifyInstance) => {
  server.post("/api/user", {
    onRequest: auth("admin"),
    handler: createUser,
    schema: {
      body: {
        ...userSchema.body,
        required: ["username", "password", "role"],
      },
    },
  });

  server.get("/api/user", {
    handler: requestUser,
    schema: {
      querystring: userSchema.querystring,
    },
  });

  server.get("/api/user/:id", {
    handler: requestUser,
    schema: {
      params: userSchema.params,
    },
  });

  server.put("/api/user/:id", {
    onRequest: auth(),
    handler: updateUser,
    schema: {
      params: userSchema.params,
      body: userSchema.body,
    },
  });

  server.delete("/api/user/:id", {
    onRequest: auth(),
    handler: deleteUser,
    schema: {
      params: userSchema.params,
    },
  });
};
