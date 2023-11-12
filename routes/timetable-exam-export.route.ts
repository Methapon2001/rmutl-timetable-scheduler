import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import { exportScheduleExam } from "../services/timetable-exam-export.service";

export default async (server: FastifyInstance) => {
  server.get("/timetable-exam/export", {
    onRequest: auth(),
    handler: exportScheduleExam,
    schema: {
      querystring: {
        type: "object",
        required: ["year", "semester", "midtermDate", "finalDate"],
        properties: {
          year: { type: "number" },
          semester: { type: "number" },
          midtermDate: { type: "string" },
          finalDate: { type: "string" },
        },
      },
    },
  });
};
