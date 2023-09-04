import { Course, CourseDetail, Prisma, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  courseDetailSelect,
  courseSelect,
  logInfoSelect,
  subjectSelect,
} from "./model";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const select = {
  ...courseSelect,
  ...logInfoSelect,
  detail: {
    select: { ...courseDetailSelect, subject: { select: subjectSelect } },
  },
};
export async function createCourse(
  request: FastifyRequest<{
    Body: Course & { detail: Pick<CourseDetail, "type" | "subjectId">[] };
  }>,
  reply: FastifyReply
) {
  const { detail: courseDetail, ...courseData } = request.body;

  const course = await prisma.course.create({
    data: {
      ...courseData,
      detail: {
        createMany: { data: courseDetail },
      },
      createdByUserId: request.user.id,
      updatedByUserId: request.user.id,
    },
    select: select,
  });

  return reply.status(200).send({
    data: course,
  });
}

export async function requestCourse(
  request: FastifyRequest<{
    Params: Pick<Course, "id">;
    Querystring: {
      limit: number;
      offset: number;
    } & Pick<Course, "name" | "createdByUserId" | "updatedByUserId">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { limit, offset, ...where } = request.query;

  const courseWhere: Prisma.CourseWhereInput = where;

  const course = id
    ? await prisma.course.findUnique({
        select: select,
        where: {
          id: id,
        },
      })
    : await prisma.course.findMany({
        select: select,
        where: courseWhere,
        orderBy: {
          createdAt: "asc",
        },
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.course.count({
        where: courseWhere,
      });

  reply.status(200).send({
    data: course,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updateCourse(
  request: FastifyRequest<{
    Params: Pick<Course, "id">;
    Body: Omit<Course, "id"> & {
      detail: Pick<CourseDetail, "type" | "subjectId">[];
    };
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { detail: courseDetail, ...courseData } = request.body;

  const course = await prisma.course.update({
    select: select,
    where: {
      id: id,
    },
    data: {
      ...courseData,
      detail: {
        deleteMany: {
          courseId: id,
        },
        createMany: {
          data: courseDetail,
        },
      },
      updatedByUserId: request.user.id,
    },
  });

  reply.status(200).send({
    data: course,
  });
}

export async function deleteCourse(
  request: FastifyRequest<{
    Params: Pick<Course, "id">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const course = await prisma.course.delete({
    select: select,
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: course,
  });
}
