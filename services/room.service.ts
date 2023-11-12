import { Room, Prisma, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { buildingSelect, logInfoSelect, roomSelect } from "./model";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const select = {
  ...roomSelect,
  ...logInfoSelect,
  building: { select: buildingSelect },
};

export async function createRoom(
  request: FastifyRequest<{ Body: Room }>,
  reply: FastifyReply,
) {
  const room = await prisma.room.create({
    data: {
      ...request.body,
      createdByUserId: request.user.id,
      updatedByUserId: request.user.id,
    },
    select: select,
  });

  return reply.status(200).send({
    data: room,
  });
}

export async function requestRoom(
  request: FastifyRequest<{
    Params: Pick<Room, "id">;
    Querystring: {
      search: string;
      limit: number;
      offset: number;
    } & Pick<
      Room,
      "name" | "type" | "buildingId" | "createdByUserId" | "updatedByUserId"
    >;
  }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { limit, offset, search, ...where } = request.query;

  if (search) {
    return await searchRoom(request, reply);
  }

  const roomWhere: Prisma.RoomWhereInput = where;

  const room = id
    ? await prisma.room.findUnique({
        select: select,
        where: {
          id: id,
        },
      })
    : await prisma.room.findMany({
        select: select,
        where: roomWhere,
        orderBy: {
          createdAt: "asc",
        },
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.room.count({
        where: roomWhere,
      });

  reply.status(200).send({
    data: room,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updateRoom(
  request: FastifyRequest<{
    Params: Pick<Room, "id">;
    Body: Omit<Room, "id">;
  }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const room = await prisma.room.update({
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
    data: room,
  });
}

export async function deleteRoom(
  request: FastifyRequest<{
    Params: Pick<Room, "id">;
  }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const room = await prisma.room.delete({
    select: select,
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: room,
  });
}

export async function searchRoom(
  request: FastifyRequest<{
    Querystring: { search: string; limit: number; offset: number };
  }>,
  reply: FastifyReply,
) {
  const { limit, offset, search } = request.query;

  const roomWhere: Prisma.RoomWhereInput = {
    OR: [
      {
        name: {
          contains: search,
        },
      },
      {
        building: {
          name: {
            contains: search,
          },
        },
      },
    ],
  };

  const room = await prisma.room.findMany({
    select: select,
    where: roomWhere,
    orderBy: {
      createdAt: "asc",
    },
    skip: offset,
    take: limit,
  });

  const count = await prisma.room.count({
    where: roomWhere,
  });

  reply.status(200).send({
    data: room,
    limit: limit,
    offset: offset,
    total: count,
  });
}
