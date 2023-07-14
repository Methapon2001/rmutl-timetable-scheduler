import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import { exportGroupSchedule } from "../services/timetable-export-group.service";
import { exportInstructorSchedule } from "../services/timetable-export-instructor.service";
import { exportRoomSchedule } from "../services/timetable-export-room.service";

export default async (server: FastifyInstance) => {
  server.get("/timetable/export/group", {
    onRequest: auth(),
    handler: exportGroupSchedule,
  });

  server.get("/timetable/export/instructor", {
    onRequest: auth(),
    handler: exportInstructorSchedule,
  });

  server.get("/timetable/export/room", {
    onRequest: auth(),
    handler: exportRoomSchedule,
  });
};
