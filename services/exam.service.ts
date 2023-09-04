import {
  Section,
  Prisma,
  PrismaClient,
  Instructor,
  Exam,
  Role,
} from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  buildingSelect,
  examSelect,
  groupSelect,
  instructorSelect,
  logInfoSelect,
  roomSelect,
  sectionSelect,
  subjectSelect,
} from "./model";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const select: Prisma.ExamSelect = {
  ...examSelect,
  ...logInfoSelect,
  room: {
    select: {
      ...roomSelect,
      building: { select: buildingSelect },
    },
  },
  section: {
    select: {
      ...sectionSelect,
      ...logInfoSelect,
      parent: { select: sectionSelect },
      group: { select: groupSelect },
      subject: { select: subjectSelect },
    },
  },
  instructor: { select: instructorSelect },
};

export async function createExam(
  request: FastifyRequest<{
    Body: Exam & { instructor: Instructor[]; section: Section[] };
  }>,
  reply: FastifyReply
) {
  const info = await prisma.info.findFirst({
    where: {
      current: true,
    },
  });

  if (!info) {
    return reply.code(400).send({
      message: "Must set year and semester before add this data.",
    });
  }

  const { roomId, instructor, section } = request.body;

  const exam = await prisma.exam.create({
    data: {
      section: {
        connect: section,
      },
      instructor: {
        connect: instructor,
      },
      infoId: info.id,
      roomId: roomId,
      createdByUserId: request.user.id,
      updatedByUserId: request.user.id,
    },
    select: select,
  });

  return reply.status(200).send({
    data: exam,
  });
}

export async function requestExam(
  request: FastifyRequest<{
    Params: Pick<Exam, "id">;
    Querystring: {
      search: string;
      limit: number;
      offset: number;
      year: number;
      semester: number;
    } & Pick<Exam, "roomId" | "createdByUserId" | "updatedByUserId">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { limit, offset, year, semester, search, ...where } = request.query;

  if (search) {
    return await searchExam(request, reply);
  }

  const examWhere: Prisma.ExamWhereInput = where;

  const exam = id
    ? await prisma.exam.findUnique({
        select: select,
        where: {
          id: id,
        },
      })
    : await prisma.exam.findMany({
        select: select,
        where: { ...examWhere, info: { year, semester } },
        orderBy: {
          createdAt: "asc",
        },
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.exam.count({
        where: { ...examWhere, info: { year, semester } },
      });

  reply.status(200).send({
    data: exam,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updateExam(
  request: FastifyRequest<{
    Params: Pick<Exam, "id">;
    Body: Partial<Pick<Exam, "roomId">> & {
      instructor?: Instructor[];
      section?: Section[];
    };
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const rec = await prisma.exam.findUnique({
    select: {
      createdByUserId: true,
    },
    where: {
      id: id,
    },
  });

  if (rec?.createdByUserId != request.user.id) {
    return reply.code(403).send({
      message: "Forbidden.",
    });
  }

  const used = await prisma.schedulerExam.findFirst({
    select: {
      id: true,
    },
    where: {
      exam: {
        id: id,
      },
    },
  });

  if (used) {
    return reply.code(403).send({
      message: "Cannot edit when this is used in schedule.",
    });
  }

  const exam = await prisma.exam.update({
    select: select,
    where: {
      id: id,
    },
    data: {
      ...request.body,
      instructor: request.body.instructor
        ? {
            set: [],
            connect: request.body.instructor,
          }
        : undefined,
      section: request.body.section
        ? {
            set: [],
            connect: request.body.section,
          }
        : undefined,
      updatedByUserId: request.user.id,
    },
  });

  return reply.status(200).send({
    data: exam,
  });
}

export async function deleteExam(
  request: FastifyRequest<{
    Params: Pick<Exam, "id">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const rec = await prisma.exam.findUnique({
    select: {
      createdByUserId: true,
    },
    where: {
      id: id,
    },
  });

  if (
    request.user.role != Role.admin &&
    rec?.createdByUserId != request.user.id
  ) {
    return reply.code(403).send({
      message: "Forbidden.",
    });
  }

  const used = await prisma.scheduler.findFirst({
    select: {
      id: true,
    },
    where: {
      sectionId: id,
    },
  });

  if (used) {
    return reply.code(403).send({
      message: "Cannot delete when this is used in schedule.",
    });
  }

  const exam = await prisma.exam.delete({
    select: select,
    where: {
      id: id,
    },
  });

  reply.code(200).send({
    data: exam,
  });
}

export async function searchExam(
  request: FastifyRequest<{
    Querystring: { search: string; limit: number; offset: number };
  }>,
  reply: FastifyReply
) {
  const { limit, offset, search } = request.query;

  const examWhere: Prisma.ExamWhereInput = {
    OR: [
      {
        room: {
          name: {
            contains: search,
          },
        },
      },
      {
        room: {
          building: {
            name: {
              contains: search,
            },
          },
        },
      },
      {
        instructor: {
          some: {
            name: {
              contains: search,
            },
          },
        },
      },
      {
        section: {
          some: {
            subject: {
              name: {
                contains: search,
              },
            },
          },
        },
      },
      {
        section: {
          some: {
            group: {
              name: {
                contains: search,
              },
            },
          },
        },
      },
    ],
  };

  const exam = await prisma.exam.findMany({
    select: select,
    where: examWhere,
    orderBy: {
      createdAt: "asc",
    },
    skip: offset,
    take: limit,
  });

  const count = await prisma.exam.count({
    where: examWhere,
  });

  reply.status(200).send({
    data: exam,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function resetExam(
  request: FastifyRequest<{
    Querystring: {
      year: number;
      semester: number;
    };
  }>,
  reply: FastifyReply
) {
  const { id: userId } = request.user;

  await prisma.exam.deleteMany({
    where: {
      info: {
        year: request.query.year,
        semester: request.query.semester,
      },
      createdByUserId: userId,
    },
  });

  return reply.status(200).send({
    message: "Success.",
  });
}
