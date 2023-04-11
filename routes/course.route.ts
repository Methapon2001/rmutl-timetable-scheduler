import { FastifyInstance } from "fastify";
import { auth } from "../hooks/auth.hook";
import {
  createCourse,
  deleteCourse,
  requestCourse,
  updateCourse,
} from "../services/course.service";
import courseSchema from "./validation/course.schema";

export default async (server: FastifyInstance) => {
  server.post("/api/course", {
    onRequest: auth(),
    handler: createCourse,
    schema: {
      body: {
        ...courseSchema.body,
        required: ["name", "detail"],
      },
    },
  });

  server.get("/api/course", {
    handler: requestCourse,
    schema: {
      querystring: courseSchema.querystring,
    },
  });

  server.get("/api/course/:id", {
    handler: requestCourse,
    schema: {
      params: courseSchema.params,
    },
  });

  server.put("/api/course/:id", {
    onRequest: auth(),
    handler: updateCourse,
    schema: {
      params: courseSchema.params,
      body: courseSchema.body,
    },
  });

  server.delete("/api/course/:id", {
    onRequest: auth(),
    handler: deleteCourse,
    schema: {
      params: courseSchema.params,
    },
  });
};
