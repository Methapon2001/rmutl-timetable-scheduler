import { Prisma, PrismaClient, Scheduler } from "@prisma/client";
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

// const courseDetailSelect: Prisma.CourseDetailSelect = {
//   id: true,
//   type: true,
//   subject: {
//     select: subjectSelect,
//   },
// };

const courseSelect: Prisma.CourseSelect = {
  id: true,
  name: true,
  // detail: {
  //   select: courseDetailSelect,
  // },
};

const groupSelect: Prisma.GroupSelect = {
  id: true,
  name: true,
  course: {
    select: courseSelect,
  },
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
  alt: true,
  lab: true,
  type: true,
  capacity: true,
  group: {
    select: groupSelect,
  },
  room: {
    select: roomSelect,
  },
  subject: {
    select: subjectSelect,
  },
  instructor: {
    select: instructorSelect,
  },
};

const sectionSelect: Prisma.SectionSelect = {
  ...childSectionSelect,
  parent: {
    select: childSectionSelect,
  },
  child: {
    select: childSectionSelect,
  },
};

const schedulerSelect: Prisma.SchedulerSelect = {
  id: true,
  weekday: true,
  start: true,
  end: true,
  publish: true,
  section: {
    select: sectionSelect,
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

export async function createScheduler(
  request: FastifyRequest<{ Body: Scheduler }>,
  reply: FastifyReply
) {
  const scheduler = await prisma.scheduler.create({
    data: {
      ...request.body,
      createdByUserId: request.user.id,
      updatedByUserId: request.user.id,
    },
    select: schedulerSelect,
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
    } & Pick<Scheduler, "publish" | "createdByUserId" | "updatedByUserId">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { limit, offset, groupId, ...where } = request.query;

  const schedulerWhere: Prisma.SchedulerWhereInput = where;

  const scheduler = id
    ? await prisma.scheduler.findUnique({
        select: schedulerSelect,
        where: {
          id: id,
        },
      })
    : await prisma.scheduler.findMany({
        select: schedulerSelect,
        where: {
          ...schedulerWhere,
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
        where: schedulerWhere,
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
    select: schedulerSelect,
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
    select: schedulerSelect,
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: scheduler,
  });
}
