import { FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user: { [key: string]: any };
  }
}
