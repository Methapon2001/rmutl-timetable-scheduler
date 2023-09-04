import { Instructor, Prisma, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { instructorSelect, logInfoSelect } from "./model";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const select = { ...instructorSelect, ...logInfoSelect };

export async function createInstructor(
  request: FastifyRequest<{ Body: Instructor }>,
  reply: FastifyReply
) {
  const instructor = await prisma.instructor.create({
    data: {
      ...request.body,
      createdByUserId: request.user.id,
      updatedByUserId: request.user.id,
    },
    select: select,
  });

  return reply.status(200).send({
    data: instructor,
  });
}

export async function requestInstructor(
  request: FastifyRequest<{
    Params: Pick<Instructor, "id">;
    Querystring: {
      search: string;
      limit: number;
      offset: number;
    } & Pick<Instructor, "name" | "createdByUserId" | "updatedByUserId">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { limit, offset, search, ...where } = request.query;

  if (search) {
    return await searchInstructor(request, reply);
  }

  const instructorWhere: Prisma.InstructorWhereInput = where;

  const instructor = id
    ? await prisma.instructor.findUnique({
        select: select,
        where: {
          id: id,
        },
      })
    : await prisma.instructor.findMany({
        select: select,
        where: instructorWhere,
        orderBy: {
          createdAt: "asc",
        },
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.instructor.count({
        where: instructorWhere,
      });

  reply.status(200).send({
    data: instructor,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updateInstructor(
  request: FastifyRequest<{
    Params: Pick<Instructor, "id">;
    Body: Omit<Instructor, "id">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const instructor = await prisma.instructor.update({
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
    data: instructor,
  });
}

export async function deleteInstructor(
  request: FastifyRequest<{
    Params: Pick<Instructor, "id">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const instructor = await prisma.instructor.delete({
    select: select,
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: instructor,
  });
}

export async function searchInstructor(
  request: FastifyRequest<{
    Querystring: { search: string; limit: number; offset: number };
  }>,
  reply: FastifyReply
) {
  const { limit, offset, search } = request.query;

  const instructorWhere: Prisma.InstructorWhereInput = {
    OR: [
      {
        name: {
          contains: search,
        },
      },
    ],
  };

  const instructor = await prisma.instructor.findMany({
    select: select,
    where: instructorWhere,
    orderBy: {
      createdAt: "asc",
    },
    skip: offset,
    take: limit,
  });

  const count = await prisma.instructor.count({
    where: instructorWhere,
  });

  reply.status(200).send({
    data: instructor,
    limit: limit,
    offset: offset,
    total: count,
  });
}
