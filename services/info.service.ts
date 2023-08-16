import { Prisma, Info, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const infoSelect = {
  id: true,
  year: true,
  semester: true,
  current: true,
};

export async function createInfo(
  request: FastifyRequest<{
    Body: Info;
  }>,
  reply: FastifyReply
) {
  await prisma.info.updateMany({
    data: {
      current: false,
    },
  });
  const info = await prisma.info.create({
    data: {
      ...request.body,
      current: true,
    },
    select: infoSelect,
  });

  return reply.status(200).send({
    data: info,
  });
}

export async function requestInfo(
  request: FastifyRequest<{
    Params: Pick<Info, "id">;
    Querystring: {
      search: string;
      limit: number;
      offset: number;
    } & Info;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { limit, offset, ...where } = request.query;

  const infoWhere: Prisma.InfoWhereInput = where;

  const info = id
    ? await prisma.info.findUnique({
        where: {
          id: id,
        },
        select: infoSelect,
      })
    : await prisma.info.findMany({
        select: infoSelect,
        where: infoWhere,
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.info.count({
        where: infoWhere,
      });

  reply.status(200).send({
    data: info,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updateInfo(
  request: FastifyRequest<{
    Params: Pick<Info, "id">;
    Body: Omit<Info, "id">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const info = await prisma.info.update({
    where: {
      id: id,
    },
    data: {
      ...request.body,
    },
  });

  if (request.body.current === true) {
    await prisma.info.updateMany({
      where: {
        NOT: {
          id: id,
        },
      },
      data: {
        current: false,
      },
    });
  }

  reply.status(200).send({
    data: info,
  });
}

export async function deleteInfo(
  request: FastifyRequest<{
    Params: Pick<Info, "id">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const info = await prisma.info.delete({
    select: infoSelect,
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: info,
  });
}
