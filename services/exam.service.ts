import {
  Section,
  Prisma,
  PrismaClient,
  Instructor,
  Exam,
} from "@prisma/client";
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
  exam: true,
};

const groupSelect: Prisma.GroupSelect = {
  id: true,
  name: true,
};

const buildingSelect: Prisma.BuildingSelect = {
  id: true,
  code: true,
  name: true,
};

const roomSelect: Prisma.RoomSelect = {
  id: true,
  name: true,
  type: true,
  building: {
    select: buildingSelect,
  },
};

const instructorSelect: Prisma.InstructorSelect = {
  id: true,
  name: true,
};

const childSectionSelect: Prisma.SectionSelect = {
  id: true,
  no: true,
  lab: true,
  type: true,
  subject: {
    select: subjectSelect,
  },
};

const sectionSelect: Prisma.SectionSelect = {
  ...childSectionSelect,
  parent: {
    select: childSectionSelect,
  },
  group: {
    select: groupSelect,
  },
  child: {
    select: childSectionSelect,
    orderBy: [
      {
        subject: {
          name: "asc",
        },
      },
      {
        no: "asc",
      },
      {
        lab: "asc",
      },
    ],
  },
};

const examSelect: Prisma.ExamSelect = {
  id: true,
  room: {
    select: roomSelect,
  },
  section: {
    select: sectionSelect,
  },
  instructor: {
    select: instructorSelect,
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

export async function createExam(
  request: FastifyRequest<{
    Body: Exam & { instructor: Instructor[]; section: Section[] };
  }>,
  reply: FastifyReply
) {
  const { roomId, instructor, section } = request.body;

  const exam = await prisma.exam.create({
    data: {
      section: {
        connect: section,
      },
      instructor: {
        connect: instructor,
      },
      roomId: roomId,
      createdByUserId: request.user.id,
      updatedByUserId: request.user.id,
    },
    select: examSelect,
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
    } & Pick<Exam, "roomId" | "createdByUserId" | "updatedByUserId"> & {
        instructor: Instructor[];
        section: Section[];
      };
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { limit, offset, search, instructor, section, ...where } =
    request.query;

  // if (search) {
  //   return await searchGroup(request, reply);
  // }

  const examWhere: Prisma.ExamWhereInput = where;

  const exam = id
    ? await prisma.group.findUnique({
        select: examSelect,
        where: {
          id: id,
        },
      })
    : await prisma.group.findMany({
        select: examSelect,
        where: examWhere,
        orderBy: {
          createdAt: "asc",
        },
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.group.count({
        where: examWhere,
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
    select: examSelect,
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

  const rec = await prisma.section.findUnique({
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
    select: examSelect,
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
    select: examSelect,
    where: examWhere,
    orderBy: {
      createdAt: "asc",
    },
    skip: offset,
    take: limit,
  });

  const count = await prisma.section.count({
    where: examWhere,
  });

  reply.status(200).send({
    data: exam,
    limit: limit,
    offset: offset,
    total: count,
  });
}
