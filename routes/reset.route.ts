import { FastifyInstance, FastifyRequest } from "fastify";
import { auth } from "../hooks/auth.hook";
import { resetScheduler } from "../services/scheduler.service";
import { resetSchedulerExam } from "../services/scheduler-exam.service";
import { resetExam } from "../services/exam.service";
import { resetSection } from "../services/section.service";

export default async (server: FastifyInstance) => {
  function broadcast(message: string) {
    server.websocketServer.clients.forEach((client) => {
      if (client.readyState === 1) client.send(message);
    });
  }

  server.post("/api/reset", {
    onRequest: auth(),
    handler: (
      req: FastifyRequest<{
        Querystring: {
          target: "scheduler" | "schedulerExam" | "exam" | "section";
          year: number;
          semester: number;
        };
      }>,
      res,
    ) => {
      const { target } = req.query;

      switch (target) {
        case "scheduler":
          broadcast(JSON.stringify({ update: 1 }));
          resetScheduler(req, res);
          break;
        case "schedulerExam":
          broadcast(JSON.stringify({ update: 2 }));
          resetSchedulerExam(req, res);
          break;
        case "exam":
          resetExam(req, res);
          break;
        case "section":
          resetSection(req, res);
          break;
        default:
          res.status(400).send({
            message: "Target not provided.",
          });
          break;
      }
    },
    schema: {
      querystring: {
        type: "object",
        required: ["target"],
        properties: {
          target: {
            type: "string",
            enum: ["scheduler", "schedulerExam", "exam", "section"],
          },
          year: { type: "number" },
          semester: { type: "number" },
        },
      },
    },
  });
};
