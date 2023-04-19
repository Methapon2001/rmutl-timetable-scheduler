import { Room, Prisma, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const userSelect: Prisma.UserSelect = {
  id: true,
  username: true,
  role: true,
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
  createdAt: true,
  createdBy: {
    select: userSelect,
  },
  updatedAt: true,
  updatedBy: {
    select: userSelect,
  },
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
    select: roomSelect,
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
        select: roomSelect,
        where: {
          id: id,
        },
      })
    : await prisma.room.findMany({
        select: roomSelect,
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
    select: roomSelect,
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
    select: roomSelect,
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
    select: roomSelect,
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
