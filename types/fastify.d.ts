import { FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
      username: string;
      role: "admin" | "user";
    };
  }
}
