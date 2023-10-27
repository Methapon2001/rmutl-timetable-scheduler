import { FastifyInstance } from "fastify";

export default async (server: FastifyInstance) => {
  server.get("/websocket", { websocket: true }, (connection, _) => {
    connection.setEncoding("utf-8");
    connection.socket.on("message", (msg) => {
      const obj = JSON.parse(msg.toString());

      if (typeof obj === "object" && (obj as Object).hasOwnProperty("update"))
        server.websocketServer.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({ update: obj.update }));
          }
        });
    });
  });
};
