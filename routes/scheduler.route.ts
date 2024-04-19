import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import {
  createScheduler,
  deleteScheduler,
  requestScheduler,
  updateScheduler,
} from "../services/scheduler.service";
import schedulerSchema from "./validation/scheduler.schema";

const UPDATE_SIGNAL = { update: 1 };

export default async (server: FastifyInstance) => {
  function broadcast(message: string) {
    server.websocketServer.clients.forEach((client) => {
      if (client.readyState === 1) client.send(message);
    });
  }

  server.post("/api/scheduler", {
    onRequest: auth(),
    onResponse: (request, _reply) => {
      // this is for consecutive or simultanous call to this route so this will not send update signal to other
      if (!request.query.noUpdateSignal) {
        broadcast(JSON.stringify(UPDATE_SIGNAL));
      }
    },
    handler: createScheduler,
    schema: {
      body: {
        ...schedulerSchema.body,
        required: ["weekday", "start", "end", "sectionId"],
      },
    },
  });

  server.get("/api/scheduler", {
    handler: requestScheduler,
    schema: {
      querystring: schedulerSchema.querystring,
    },
  });

  server.get("/api/scheduler/:id", {
    handler: requestScheduler,
    schema: {
      params: schedulerSchema.params,
    },
  });

  server.put("/api/scheduler/:id", {
    onRequest: auth(),
    onResponse: (_request, _reply) => {
      broadcast(JSON.stringify(UPDATE_SIGNAL));
    },
    handler: updateScheduler,
    schema: {
      params: schedulerSchema.params,
      body: schedulerSchema.body,
    },
  });

  server.delete("/api/scheduler/:id", {
    onRequest: auth(),
    onResponse: (_request, _reply) => {
      broadcast(JSON.stringify(UPDATE_SIGNAL));
    },
    handler: deleteScheduler,
    schema: {
      params: schedulerSchema.params,
    },
  });
};
