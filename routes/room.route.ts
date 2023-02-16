import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import {
  createRoom,
  deleteRoom,
  requestRoom,
  updateRoom,
} from "../services/room.service";
import roomSchema from "./validation/room.schema";

export default async (server: FastifyInstance) => {
  server.post("/api/room", {
    onRequest: auth(),
    handler: createRoom,
    schema: {
      body: {
        ...roomSchema.body,
        required: ["name", "type", "buildingId"],
      },
    },
  });

  server.get("/api/room", {
    handler: requestRoom,
    schema: {
      querystring: roomSchema.querystring,
    },
  });

  server.get("/api/room/:id", {
    handler: requestRoom,
    schema: {
      params: roomSchema.params,
    },
  });

  server.put("/api/room/:id", {
    onRequest: auth(),
    handler: updateRoom,
    schema: {
      params: roomSchema.params,
      body: roomSchema.body,
    },
  });

  server.delete("/api/room/:id", {
    onRequest: auth(),
    handler: deleteRoom,
    schema: {
      params: roomSchema.params,
    },
  });
};
