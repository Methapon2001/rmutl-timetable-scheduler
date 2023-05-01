import { FastifyInstance } from "fastify";

export default async (server: FastifyInstance) => {
  server.get("/websocket", { websocket: true }, (connection, _request) => {
    connection.setEncoding("utf-8");
  });
};
