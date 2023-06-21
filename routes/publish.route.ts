import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import { action as publish } from "../services/publish.service";

export default async (server: FastifyInstance) => {
  server.post("/api/publish", {
    onRequest: auth(),
    handler: publish,
    schema: {
      body: {
        type: "object",
        properties: {
          roomId: {
            type: "string",
          },
          groupId: {
            type: "string",
          },
          instructorId: {
            type: "string",
          },
          publish: {
            type: "boolean",
          },
        },
      },
    },
  });
};
