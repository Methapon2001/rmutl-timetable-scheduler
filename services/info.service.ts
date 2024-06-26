import { Prisma, Info, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { infoSelect } from "./model";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const select = infoSelect;

export async function createInfo(
  // TODO: clone previous semester group
  request: FastifyRequest<{
    Body: Info & { withPreviousData: boolean };
  }>,
  reply: FastifyReply,
) {
  const exist = await prisma.info.findFirst({
    where: {
      year: request.body.year,
      semester: request.body.semester,
    },
  });

  if (exist) {
    return reply.code(400).send({
      message: "Year and semester already exist.",
    });
  }

  if (request.body.current) {
    await prisma.info.updateMany({
      data: {
        current: false,
      },
    });
  }

  const info = await prisma.info.create({
    data: {
      ...request.body,
      current: request.body.current !== undefined ? request.body.current : true,
    },
    select: select,
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
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { limit, offset, ...where } = request.query;

  const infoWhere: Prisma.InfoWhereInput = where;

  const info = id
    ? await prisma.info.findUnique({
        where: {
          id: id,
        },
        select: select,
      })
    : await prisma.info.findMany({
        select: select,
        orderBy: [{ year: "desc" }, { semester: "desc" }],
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
  reply: FastifyReply,
) {
  const { id } = request.params;

  const exist = await prisma.info.findFirst({
    where: {
      NOT: {
        id: id,
      },
      year: request.body.year,
      semester: request.body.semester,
    },
  });

  if (exist) {
    return reply.code(400).send({
      message: "Year and semester already exist.",
    });
  }
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
  reply: FastifyReply,
) {
  const { id } = request.params;

  const info = await prisma.info.delete({
    select: select,
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: info,
  });
}
