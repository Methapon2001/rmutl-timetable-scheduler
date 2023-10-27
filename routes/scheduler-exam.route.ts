import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import {
  createSchedulerExam,
  deleteSchedulerExam,
  requestSchedulerExam,
  updateSchedulerExam,
} from "../services/scheduler-exam.service";
import schedulerExamSchema from "./validation/scheduler-exam.schema";

const UPDATE_SIGNAL = { update: 2 };

export default async (server: FastifyInstance) => {
  function broadcast(message: string) {
    server.websocketServer.clients.forEach((client) => {
      if (client.readyState === 1) client.send(message);
    });
  }

  server.post("/api/scheduler-exam", {
    onRequest: auth(),
    onResponse: (_request, _reply) => {
      broadcast(JSON.stringify(UPDATE_SIGNAL));
    },
    handler: createSchedulerExam,
    schema: {
      body: {
        ...schedulerExamSchema.body,
        required: ["weekday", "start", "end", "examId"],
      },
    },
  });

  server.get("/api/scheduler-exam", {
    handler: requestSchedulerExam,
    schema: {
      querystring: schedulerExamSchema.querystring,
    },
  });

  server.get("/api/scheduler-exam/:id", {
    handler: requestSchedulerExam,
    schema: {
      params: schedulerExamSchema.params,
    },
  });

  server.put("/api/scheduler-exam/:id", {
    onRequest: auth(),
    onResponse: (_request, _reply) => {
      broadcast(JSON.stringify(UPDATE_SIGNAL));
    },
    handler: updateSchedulerExam,
    schema: {
      params: schedulerExamSchema.params,
      body: schedulerExamSchema.body,
    },
  });

  server.delete("/api/scheduler-exam/:id", {
    onRequest: auth(),
    onResponse: (_request, _reply) => {
      broadcast(JSON.stringify(UPDATE_SIGNAL));
    },
    handler: deleteSchedulerExam,
    schema: {
      params: schedulerExamSchema.params,
    },
  });
};
