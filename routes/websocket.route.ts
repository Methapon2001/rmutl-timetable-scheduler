import { FastifyInstance } from "fastify";

export default async (server: FastifyInstance) => {
  server.get("/websocket", { websocket: true }, (connection, _) => {
    connection.setEncoding("utf-8");
  });
};
