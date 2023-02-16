import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import {
  createBuilding,
  deleteBuilding,
  requestBuilding,
  updateBuilding,
} from "../services/building.service";
import buildingSchema from "./validation/building.schema";

export default async (server: FastifyInstance) => {
  server.post("/api/building", {
    onRequest: auth(),
    handler: createBuilding,
    schema: {
      body: {
        ...buildingSchema.body,
        required: ["name", "code"],
      },
    },
  });

  server.get("/api/building", {
    handler: requestBuilding,
    schema: {
      querystring: buildingSchema.querystring,
    },
  });

  server.get("/api/building/:id", {
    handler: requestBuilding,
    schema: {
      params: buildingSchema.params,
    },
  });

  server.put("/api/building/:id", {
    onRequest: auth(),
    handler: updateBuilding,
    schema: {
      params: buildingSchema.params,
      body: buildingSchema.body,
    },
  });

  server.delete("/api/building/:id", {
    onRequest: auth(),
    handler: deleteBuilding,
    schema: {
      params: buildingSchema.params,
    },
  });
};
