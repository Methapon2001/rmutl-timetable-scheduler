import { FastifyReply, FastifyRequest } from "fastify";
import { verify } from "../utils/jwt";

export function auth(role?: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    let token: string | undefined;

    if (request.headers.authorization?.startsWith("Bearer ")) {
      token = request.headers.authorization?.split(" ")[1];
    }

    if (token) {
      request.user = await verify(token);
    }

    if (!request.user) {
      reply.code(401).send({
        message: "Unauthorized.",
      });

      await reply;
    }

    if (role && request.user.role != role) {
      reply.code(403).send({
        message: "Forbidden.",
      });

      await reply;
    }
  };
}
