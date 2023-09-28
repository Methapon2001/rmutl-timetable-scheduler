import { Prisma, PrismaClient, Scheduler } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  buildingSelect,
  courseSelect,
  groupSelect,
  instructorSelect,
  logInfoSelect,
  planSelect,
  roomSelect,
  scheduleSelect,
  sectionSelect,
  subjectSelect,
} from "./model";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const select: Prisma.SchedulerSelect = {
  ...scheduleSelect,
  ...logInfoSelect,
  section: {
    select: {
      ...sectionSelect,
      room: {
        select: {
          ...roomSelect,
          building: { select: buildingSelect },
        },
      },
      group: {
        select: groupSelect,
      },
      instructor: { select: instructorSelect },
      subject: { select: subjectSelect },
    },
  },
};

export async function createScheduler(
  request: FastifyRequest<{ Body: Scheduler }>,
  reply: FastifyReply
) {
  if (
    request.body.weekday === "wed" &&
    request.body.start <= 18 &&
    request.body.end >= 15
  ) {
    return reply.status(400).send({
      message: "This period is preserved for activity.",
    });
  }

  if (request.body.start > request.body.end) {
    return reply.status(400).send({
      message: "End period must be greater than start period.",
    });
  }

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

  const scheduler = await prisma.scheduler.create({
    data: {
      ...request.body,
      infoId: info.id,
      createdByUserId: request.user.id,
      updatedByUserId: request.user.id,
    },
    select: select,
  });

  return reply.status(200).send({
    data: scheduler,
  });
}

export async function requestScheduler(
  request: FastifyRequest<{
    Params: Pick<Scheduler, "id">;
    Querystring: {
      limit: number;
      offset: number;
      groupId: string;
      year: number;
      semester: number;
    } & Pick<Scheduler, "publish" | "createdByUserId" | "updatedByUserId">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { limit, offset, year, semester, groupId, ...where } = request.query;

  const schedulerWhere: Prisma.SchedulerWhereInput = where;

  const scheduler = id
    ? await prisma.scheduler.findUnique({
        select: select,
        where: {
          id: id,
        },
      })
    : await prisma.scheduler.findMany({
        select: select,
        where: {
          ...schedulerWhere,
          info: {
            year,
            semester,
          },
          section: {
            groupId: groupId,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.scheduler.count({
        where: {
          ...schedulerWhere,
          info: {
            year,
            semester,
          },
          section: {
            groupId: groupId,
          },
        },
      });

  reply.status(200).send({
    data: scheduler,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updateScheduler(
  request: FastifyRequest<{
    Params: Pick<Scheduler, "id">;
    Body: Omit<Scheduler, "id">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const scheduler = await prisma.scheduler.update({
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
    data: scheduler,
  });
}

export async function deleteScheduler(
  request: FastifyRequest<{
    Params: Pick<Scheduler, "id">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const scheduler = await prisma.scheduler.delete({
    select: select,
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: scheduler,
  });
}

export async function resetScheduler(
  request: FastifyRequest<{
    Querystring: {
      year: number;
      semester: number;
    };
  }>,
  reply: FastifyReply
) {
  const { id: userId } = request.user;

  await prisma.scheduler.deleteMany({
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
