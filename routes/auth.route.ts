import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import { check, refresh, login, logout } from "../services/auth.service";
import authSchema from "./validation/auth.schema";

export default async (instance: FastifyInstance) => {
  instance.post("/api/auth/login", {
    handler: login,
    schema: {
      body: {
        ...authSchema.body,
        required: ["username", "password"],
      },
    },
  });

  instance.post("/api/auth/refresh", {
    handler: refresh,
    schema: {
      body: {
        ...authSchema.body,
        required: ["token"],
      },
    },
  });

  instance.get("/api/auth/check", {
    handler: check,
  });

  instance.post("/api/auth/logout", {
    onRequest: auth(),
    handler: logout,
    schema: {
      body: {
        ...authSchema.body,
        required: ["token"],
      },
    },
  });
};
