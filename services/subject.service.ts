import { Subject, Prisma, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { logInfoSelect, subjectSelect } from "./model";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const select = { ...subjectSelect, ...logInfoSelect };

export async function createSubject(
  request: FastifyRequest<{ Body: Subject }>,
  reply: FastifyReply
) {
  const subject = await prisma.subject.create({
    data: {
      ...request.body,
      createdByUserId: request.user.id,
      updatedByUserId: request.user.id,
    },
    select: select,
  });

  return reply.status(200).send({
    data: subject,
  });
}

export async function requestSubject(
  request: FastifyRequest<{
    Params: Pick<Subject, "id">;
    Querystring: {
      search: string;
      limit: number;
      offset: number;
    } & Pick<
      Subject,
      | "code"
      | "name"
      | "credit"
      | "lecture"
      | "lab"
      | "learn"
      | "createdByUserId"
      | "updatedByUserId"
    >;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { limit, offset, search, ...where } = request.query;

  if (search) {
    return await searchSubject(request, reply);
  }

  const subjectWhere: Prisma.SubjectWhereInput = where;

  const subject = id
    ? await prisma.subject.findUnique({
        select: select,
        where: {
          id: id,
        },
      })
    : await prisma.subject.findMany({
        select: select,
        where: subjectWhere,
        orderBy: {
          createdAt: "asc",
        },
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.subject.count({
        where: subjectWhere,
      });

  reply.status(200).send({
    data: subject,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updateSubject(
  request: FastifyRequest<{
    Params: Pick<Subject, "id">;
    Body: Omit<Subject, "id">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const subject = await prisma.subject.update({
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
    data: subject,
  });
}

export async function deleteSubject(
  request: FastifyRequest<{
    Params: Pick<Subject, "id">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const subject = await prisma.subject.delete({
    select: select,
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: subject,
  });
}

export async function searchSubject(
  request: FastifyRequest<{
    Querystring: { search: string; limit: number; offset: number };
  }>,
  reply: FastifyReply
) {
  const { limit, offset, search } = request.query;

  const subjectWhere: Prisma.SubjectWhereInput = {
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

  const subject = await prisma.subject.findMany({
    select: select,
    where: subjectWhere,
    orderBy: {
      createdAt: "asc",
    },
    skip: offset,
    take: limit,
  });

  const count = await prisma.subject.count({
    where: subjectWhere,
  });

  reply.status(200).send({
    data: subject,
    limit: limit,
    offset: offset,
    total: count,
  });
}
