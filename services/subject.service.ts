import { Subject, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

type Query = {
  limit: number;
  offset: number;
} & Subject;

type Param = {
  id: string;
};

export async function createSubject(
  request: FastifyRequest<{ Body: Subject }>,
  reply: FastifyReply,
) {
  const subject = await prisma.subject.create({
    data: request.body,
  });

  return reply.status(200).send({
    data: subject,
  });
}

export async function requestSubject(
  request: FastifyRequest<{ Params: Param; Querystring: Query }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { name, code, credit, lecture, exam, limit, offset } = request.query;

  const subject = id
    ? await prisma.subject.findUnique({
        where: {
          id: id,
        },
      })
    : await prisma.subject.findMany({
        where: {
          code: {
            contains: code,
          },
          name: {
            contains: name,
          },
          credit: credit,
          lecture: lecture,
          exam: exam,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.subject.count({
        where: {
          code: {
            contains: code,
          },
          name: {
            contains: name,
          },
          credit: credit,
          lecture: lecture,
          exam: exam,
        },
      });

  reply.status(200).send({
    data: subject,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updateSubject(
  request: FastifyRequest<{ Params: Param; Body: Subject }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const subject = await prisma.subject.update({
    where: {
      id: id,
    },
    data: request.body,
  });

  reply.status(200).send({
    data: subject,
  });
}

export async function deleteSubject(
  request: FastifyRequest<{ Params: Param }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const subject = await prisma.subject.delete({
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: subject,
  });
}
