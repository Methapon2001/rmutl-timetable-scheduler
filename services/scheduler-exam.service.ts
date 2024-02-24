import { Prisma, PrismaClient, SchedulerExam } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  buildingSelect,
  examSelect,
  groupSelect,
  instructorSelect,
  logInfoSelect,
  roomSelect,
  scheduleExamSelect,
  sectionSelect,
  subjectSelect,
} from "./model";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const select = {
  ...scheduleExamSelect,
  ...logInfoSelect,
  exam: {
    select: {
      ...examSelect,
      room: {
        select: {
          ...roomSelect,
          building: { select: buildingSelect },
        },
      },
      section: {
        select: {
          ...sectionSelect,
          group: { select: groupSelect },
          subject: { select: subjectSelect },
        },
      },
      instructor: { select: instructorSelect },
    },
  },
} satisfies Prisma.SchedulerExamSelect;

export async function createSchedulerExam(
  request: FastifyRequest<{
    Querystring: { noUpdateSignal: boolean }; // this is to type request which will be used later on response
    Body: SchedulerExam;
  }>,
  reply: FastifyReply,
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

  const schedulerExam = await prisma.schedulerExam.create({
    data: {
      ...request.body,
      infoId: info.id,
      createdByUserId: request.user.id,
      updatedByUserId: request.user.id,
    },
    select: select,
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
      year: number;
      semester: number;
    } & Pick<SchedulerExam, "publish" | "createdByUserId" | "updatedByUserId">;
  }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { limit, offset, year, semester, ...where } = request.query;

  const schedulerExamWhere: Prisma.SchedulerExamWhereInput = where;

  const schedulerExam = id
    ? await prisma.schedulerExam.findUnique({
        select: select,
        where: {
          id: id,
        },
      })
    : await prisma.schedulerExam.findMany({
        select: select,
        where: {
          ...schedulerExamWhere,
          info: { year, semester },
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
        where: { ...schedulerExamWhere, info: { year, semester } },
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
  reply: FastifyReply,
) {
  const { id } = request.params;

  const schedulerExam = await prisma.schedulerExam.update({
    select: select,
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
  reply: FastifyReply,
) {
  const { id } = request.params;

  const schedulerExam = await prisma.schedulerExam.delete({
    select: select,
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: schedulerExam,
  });
}

export async function resetSchedulerExam(
  request: FastifyRequest<{
    Querystring: {
      year: number;
      semester: number;
    };
  }>,
  reply: FastifyReply,
) {
  const { id: userId } = request.user;

  await prisma.schedulerExam.deleteMany({
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
