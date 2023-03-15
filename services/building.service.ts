import { Building, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

type Query = {
  limit: number;
  offset: number;
} & Building;

type Param = {
  id: string;
};

export async function createBuilding(
  request: FastifyRequest<{ Body: Building }>,
  reply: FastifyReply,
) {
  const building = await prisma.building.create({
    data: request.body,
  });

  return reply.status(200).send({
    data: building,
  });
}

export async function requestBuilding(
  request: FastifyRequest<{ Params: Param; Querystring: Query }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { name, code, limit, offset } = request.query;

  const building = id
    ? await prisma.building.findUnique({
        where: {
          id: id,
        },
      })
    : await prisma.building.findMany({
        where: {
          code: {
            contains: code,
          },
          name: {
            contains: name,
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
    : await prisma.building.count({
        where: {
          code: {
            contains: code,
          },
          name: {
            contains: name,
          },
        },
      });

  reply.status(200).send({
    data: building,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updateBuilding(
  request: FastifyRequest<{ Params: Param; Body: Building }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const building = await prisma.building.update({
    where: {
      id: id,
    },
    data: request.body,
  });

  reply.status(200).send({
    data: building,
  });
}

export async function deleteBuilding(
  request: FastifyRequest<{ Params: Param }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const building = await prisma.building.delete({
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: building,
  });
}
