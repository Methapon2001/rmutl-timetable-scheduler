import { Course, CourseDetail, Prisma, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const userSelect: Prisma.UserSelect = {
  id: true,
  username: true,
  role: true,
};

const subjectSelect: Prisma.SubjectSelect = {
  id: true,
  code: true,
  name: true,
  credit: true,
  lecture: true,
  lab: true,
};

const detailSelect: Prisma.CourseDetailSelect = {
  id: true,
  type: true,
  subject: {
    select: subjectSelect,
  },
};

const courseSelect: Prisma.CourseSelect = {
  id: true,
  name: true,
  detail: {
    select: detailSelect,
  },
  createdAt: true,
  createdBy: {
    select: userSelect,
  },
  updatedAt: true,
  updatedBy: {
    select: userSelect,
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
    select: courseSelect,
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
        select: courseSelect,
        where: {
          id: id,
        },
      })
    : await prisma.course.findMany({
        select: courseSelect,
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
    select: courseSelect,
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
    select: courseSelect,
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: course,
  });
}
