import { Instructor, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

type Query = {
  limit: number;
  offset: number;
} & Instructor;

type Param = {
  id: string;
};

export async function createInstructor(
  request: FastifyRequest<{ Body: Instructor }>,
  reply: FastifyReply,
) {
  const instructor = await prisma.instructor.create({
    data: request.body,
  });

  return reply.status(200).send({
    data: instructor,
  });
}

export async function requestInstructor(
  request: FastifyRequest<{ Params: Param; Querystring: Query }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { name, limit, offset } = request.query;

  const instructor = id
    ? await prisma.instructor.findUnique({
        where: {
          id: id,
        },
      })
    : await prisma.instructor.findMany({
        where: {
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
    : await prisma.instructor.count({
        where: {
          name: {
            contains: name,
          },
        },
      });

  reply.status(200).send({
    data: instructor,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updateInstructor(
  request: FastifyRequest<{ Params: Param; Body: Instructor }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const instructor = await prisma.instructor.update({
    where: {
      id: id,
    },
    data: request.body,
  });

  reply.status(200).send({
    data: instructor,
  });
}

export async function deleteInstructor(
  request: FastifyRequest<{ Params: Param }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const instructor = await prisma.instructor.delete({
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: instructor,
  });
}
