import { Building, Prisma, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { buildingSelect, logInfoSelect } from "./model";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const select = { ...buildingSelect, ...logInfoSelect };

export async function createBuilding(
  request: FastifyRequest<{ Body: Building }>,
  reply: FastifyReply
) {
  const building = await prisma.building.create({
    data: {
      ...request.body,
      createdByUserId: request.user.id,
      updatedByUserId: request.user.id,
    },
    select: select,
  });

  return reply.status(200).send({
    data: building,
  });
}

export async function requestBuilding(
  request: FastifyRequest<{
    Params: Pick<Building, "id">;
    Querystring: {
      search: string;
      limit: number;
      offset: number;
    } & Pick<Building, "name" | "createdByUserId" | "updatedByUserId">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { limit, offset, search, ...where } = request.query;

  if (search) {
    return await searchBuilding(request, reply);
  }

  const buildingWhere: Prisma.BuildingWhereInput = where;

  const building = id
    ? await prisma.building.findUnique({
        select: select,
        where: {
          id: id,
        },
      })
    : await prisma.building.findMany({
        select: select,
        where: buildingWhere,
        orderBy: {
          createdAt: "asc",
        },
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.building.count({
        where: buildingWhere,
      });

  reply.status(200).send({
    data: building,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updateBuilding(
  request: FastifyRequest<{
    Params: Pick<Building, "id">;
    Body: Omit<Building, "id">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const building = await prisma.building.update({
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
    data: building,
  });
}

export async function deleteBuilding(
  request: FastifyRequest<{
    Params: Pick<Building, "id">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const building = await prisma.building.delete({
    select: select,
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: building,
  });
}

export async function searchBuilding(
  request: FastifyRequest<{
    Querystring: { search: string; limit: number; offset: number };
  }>,
  reply: FastifyReply
) {
  const { limit, offset, search } = request.query;

  const buildingWhere: Prisma.BuildingWhereInput = {
    OR: [
      {
        code: {
          contains: search,
        },
      },
      {
        name: {
          contains: search,
        },
      },
    ],
  };

  const building = await prisma.building.findMany({
    select: select,
    where: buildingWhere,
    orderBy: {
      createdAt: "asc",
    },
    skip: offset,
    take: limit,
  });

  const count = await prisma.building.count({
    where: buildingWhere,
  });

  reply.status(200).send({
    data: building,
    limit: limit,
    offset: offset,
    total: count,
  });
}
