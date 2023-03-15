import { Room, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

type Query = {
  limit: number;
  offset: number;
} & Room;

type Param = {
  id: string;
};

export async function createRoom(
  request: FastifyRequest<{ Body: Room }>,
  reply: FastifyReply,
) {
  const room = await prisma.room.create({
    data: request.body,
    include: {
      building: true,
    },
  });

  return reply.status(200).send({
    data: room,
  });
}

export async function requestRoom(
  request: FastifyRequest<{ Params: Param; Querystring: Query }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { name, type, limit, offset } = request.query;

  const room = id
    ? await prisma.room.findUnique({
        where: {
          id: id,
        },
        include: {
          building: true,
        },
      })
    : await prisma.room.findMany({
        where: {
          name: {
            contains: name,
          },
          type: type,
        },
        include: {
          building: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.room.count({
        where: {
          name: {
            contains: name,
          },
          type: type,
        },
      });

  reply.status(200).send({
    data: room,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updateRoom(
  request: FastifyRequest<{ Params: Param; Body: Room }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const room = await prisma.room.update({
    where: {
      id: id,
    },
    data: request.body,
    include: {
      building: true,
    },
  });

  reply.status(200).send({
    data: room,
  });
}

export async function deleteRoom(
  request: FastifyRequest<{ Params: Param }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const room = await prisma.room.delete({
    where: {
      id: id,
    },
    include: {
      building: true,
    },
  });

  reply.status(200).send({
    data: room,
  });
}
