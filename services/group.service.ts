import { Group, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

type Query = {
  limit: number;
  offset: number;
  user: string;
} & Group;

type Param = {
  id: string;
};

export async function createGroup(
  request: FastifyRequest<{ Body: Group }>,
  reply: FastifyReply,
) {
  const group = await prisma.group.create({
    data: { ...request.body, createdBy: request.user.id },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          role: true,
        },
      },
    },
  });

  return reply.status(200).send({
    data: group,
  });
}

export async function requestGroup(
  request: FastifyRequest<{ Params: Param; Querystring: Query }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { name, user, limit, offset } = request.query;

  const group = id
    ? await prisma.group.findUnique({
        where: {
          id: id,
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      })
    : await prisma.group.findMany({
        where: {
          name: {
            contains: name,
          },
          createdBy: user,
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.group.count({
        where: {
          name: {
            contains: name,
          },
          createdBy: user,
        },
      });

  reply.status(200).send({
    data: group,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updateGroup(
  request: FastifyRequest<{ Params: Param; Body: Group }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const rec = await prisma.group.findFirst({
    where: {
      id: id,
    },
  });

  if (rec?.createdBy != request.user.id) {
    return reply.code(403).send({
      message: "Forbidden.",
    });
  }

  const group = await prisma.group.update({
    where: {
      id: id,
    },
    data: request.body,
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          role: true,
        },
      },
    },
  });

  reply.status(200).send({
    data: group,
  });
}

export async function deleteGroup(
  request: FastifyRequest<{ Params: Param }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const rec = await prisma.group.findFirst({
    where: {
      id: id,
    },
  });

  if (rec?.createdBy != request.user.id) {
    return reply.code(403).send({
      message: "Forbidden.",
    });
  }

  const group = await prisma.group.delete({
    where: {
      id: id,
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          role: true,
        },
      },
    },
  });

  reply.status(200).send({
    data: group,
  });
}
