import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import { check, refresh, login, logout } from "../services/auth.service";
import authSchema from "./validation/auth.schema";

export default async (instance: FastifyInstance) => {
  instance.post("/auth/login", {
    handler: login,
    schema: {
      body: {
        ...authSchema.body,
        required: ["username", "password"],
      },
    },
  });

  instance.post("/auth/refresh", {
    handler: refresh,
    schema: {
      body: {
        ...authSchema.body,
        required: ["token"],
      },
    },
  });

  instance.get("/auth/check", {
    handler: check,
  });

  instance.post("/auth/logout", {
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
