import { Prisma, PrismaClient, SchedulerExam } from "@prisma/client";
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
  learn: true,
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

const schedulerExamExamSelect: Prisma.SchedulerExamSelect = {
  id: true,
  weekday: true,
  start: true,
  end: true,
  publish: true,
  exam: {
    select: examSelect,
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

export async function createSchedulerExam(
  request: FastifyRequest<{ Body: SchedulerExam }>,
  reply: FastifyReply
) {
  const schedulerExam = await prisma.schedulerExam.create({
    data: {
      ...request.body,
      createdByUserId: request.user.id,
      updatedByUserId: request.user.id,
    },
    select: schedulerExamExamSelect,
  });

  return reply.status(200).send({
    data: schedulerExam,
  });
}

export async function requestSchedulerExam(
  request: FastifyRequest<{
    Params: Pick<SchedulerExam, "id">;
    Querystring: {
      limit: number;
      offset: number;
    } & Pick<SchedulerExam, "publish" | "createdByUserId" | "updatedByUserId">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { limit, offset, ...where } = request.query;

  const schedulerExamWhere: Prisma.SchedulerExamWhereInput = where;

  const schedulerExam = id
    ? await prisma.schedulerExam.findUnique({
        select: schedulerExamExamSelect,
        where: {
          id: id,
        },
      })
    : await prisma.schedulerExam.findMany({
        select: schedulerExamExamSelect,
        where: {
          ...schedulerExamWhere,
        },
        orderBy: {
          createdAt: "asc",
        },
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.schedulerExam.count({
        where: schedulerExamWhere,
      });

  reply.status(200).send({
    data: schedulerExam,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updateSchedulerExam(
  request: FastifyRequest<{
    Params: Pick<SchedulerExam, "id">;
    Body: Omit<SchedulerExam, "id">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const schedulerExam = await prisma.schedulerExam.update({
    select: schedulerExamExamSelect,
    where: {
      id: id,
    },
    data: {
      ...request.body,
      updatedByUserId: request.user.id,
    },
  });

  reply.status(200).send({
    data: schedulerExam,
  });
}

export async function deleteSchedulerExam(
  request: FastifyRequest<{
    Params: Pick<SchedulerExam, "id">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const schedulerExam = await prisma.schedulerExam.delete({
    select: schedulerExamExamSelect,
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: schedulerExam,
  });
}
