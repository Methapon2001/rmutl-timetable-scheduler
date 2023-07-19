import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import { exportGroupScheduleExam } from "../services/timetable-exam-export-group.service";
import { exportInstructorScheduleExam } from "../services/timetable-exam-export-instructor.service";
import { exportRoomScheduleExam } from "../services/timetable-exam-export-room.service";

export default async (server: FastifyInstance) => {
  server.get("/timetable-exam/export/group", {
    onRequest: auth(),
    handler: exportGroupScheduleExam,
  });

  server.get("/timetable-exam/export/instructor", {
    onRequest: auth(),
    handler: exportInstructorScheduleExam,
  });

  server.get("/timetable-exam/export/room", {
    onRequest: auth(),
    handler: exportRoomScheduleExam,
  });
};
