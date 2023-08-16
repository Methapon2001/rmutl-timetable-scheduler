import { Group, Prisma, PrismaClient } from "@prisma/client";
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

const courseDetailSelect: Prisma.CourseDetailSelect = {
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
    select: courseDetailSelect,
  },
};

const planSelect: Prisma.PlanSelect = {
  id: true,
  name: true,
  detail: {
    select: {
      year: true,
      semester: true,
      subject: {
        select: subjectSelect,
      },
    },
  },
};

const groupSelect: Prisma.GroupSelect = {
  id: true,
  name: true,
  course: {
    select: courseSelect,
  },
  plan: {
    select: planSelect,
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

export async function createGroup(
  request: FastifyRequest<{ Body: Group }>,
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
  const group = await prisma.group.create({
    data: {
      ...request.body,
      infoId: info.id,
      createdByUserId: request.user.id,
      updatedByUserId: request.user.id,
    },
    select: groupSelect,
  });

  return reply.status(200).send({
    data: group,
  });
}

export async function requestGroup(
  request: FastifyRequest<{
    Params: Pick<Group, "id">;
    Querystring: {
      search: string;
      limit: number;
      offset: number;
    } & Pick<
      Group,
      "name" | "courseId" | "createdByUserId" | "updatedByUserId"
    >;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { limit, offset, search, ...where } = request.query;

  if (search) {
    return await searchGroup(request, reply);
  }

  const groupWhere: Prisma.GroupWhereInput = where;

  const group = id
    ? await prisma.group.findUnique({
        select: groupSelect,
        where: {
          id: id,
        },
      })
    : await prisma.group.findMany({
        select: groupSelect,
        where: groupWhere,
        orderBy: {
          createdAt: "asc",
        },
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.group.count({
        where: groupWhere,
      });

  reply.status(200).send({
    data: group,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updateGroup(
  request: FastifyRequest<{
    Params: Pick<Group, "id">;
    Body: Omit<Group, "id">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const rec = await prisma.group.findUnique({
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

  const group = await prisma.group.update({
    select: groupSelect,
    where: {
      id: id,
    },
    data: {
      ...request.body,
      updatedByUserId: request.user.id,
    },
  });

  reply.status(200).send({
    data: group,
  });
}

export async function deleteGroup(
  request: FastifyRequest<{
    Params: Pick<Group, "id">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const rec = await prisma.group.findUnique({
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

  const group = await prisma.group.delete({
    select: groupSelect,
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: group,
  });
}

export async function searchGroup(
  request: FastifyRequest<{
    Querystring: { search: string; limit: number; offset: number };
  }>,
  reply: FastifyReply
) {
  const { limit, offset, search } = request.query;

  const groupWhere: Prisma.GroupWhereInput = {
    OR: [
      {
        name: {
          contains: search,
        },
      },
      {
        course: {
          name: {
            contains: search,
          },
        },
      },
    ],
  };

  const group = await prisma.group.findMany({
    select: groupSelect,
    where: groupWhere,
    orderBy: {
      createdAt: "asc",
    },
    skip: offset,
    take: limit,
  });

  const count = await prisma.group.count({
    where: groupWhere,
  });

  reply.status(200).send({
    data: group,
    limit: limit,
    offset: offset,
    total: count,
  });
}
