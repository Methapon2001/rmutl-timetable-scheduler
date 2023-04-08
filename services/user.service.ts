import { User, Role, PrismaClient, Prisma } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { exclude } from "../utils/object";
import { hash } from "../utils/scrypt";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const userSelect: Prisma.UserSelect = {
  id: true,
  username: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

type Query = {
  limit: number;
  offset: number;
} & Pick<User, "username" | "role">;

type Param = {
  id: string;
};

export async function createUser(
  request: FastifyRequest<{ Body: User }>,
  reply: FastifyReply,
) {
  request.body.password = await hash(request.body.password);

  const user = await prisma.user.create({
    data: request.body,
    select: userSelect,
  });

  return reply.status(200).send({
    data: user,
  });
}

export async function requestUser(
  request: FastifyRequest<{ Params: Param; Querystring: Query }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { username, role, limit, offset } = request.query;

  const userWhere: Prisma.UserWhereInput = {
    username: username,
    role: role,
  };

  const user = id
    ? await prisma.user.findUnique({
        select: userSelect,
        where: {
          id: id,
        },
      })
    : await prisma.user.findMany({
        select: userSelect,
        where: userWhere,
        orderBy: {
          createdAt: "asc",
        },
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.user.count({
        where: userWhere,
        orderBy: {
          createdAt: "asc",
        },
      });

  return reply.status(200).send({
    data: user,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updateUser(
  request: FastifyRequest<{ Params: Param; Body: User }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  if (
    (request.user.role != Role.admin && request.user.id != id) ||
    (request.user.role != Role.admin && request.body.role)
  ) {
    return reply.code(403).send({
      message: "Forbidden.",
    });
  }

  if (request.body.password) {
    request.body.password = await hash(request.body.password);
  }

  const user = await prisma.user.update({
    select: userSelect,
    where: {
      id: id,
    },
    data: request.body,
  });

  return reply.status(200).send({
    data: user,
  });
}

export async function deleteUser(
  request: FastifyRequest<{ Params: Param }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  if (request.user.role != Role.admin && request.user.id != id) {
    return reply.code(403).send({
      message: "Forbidden.",
    });
  }

  if (request.user.role == Role.admin) {
    const count = await prisma.user.count({
      where: {
        role: Role.admin,
      },
    });

    if (count <= 1) {
      return reply.code(403).send({
        message: "Forbidden.",
      });
    }
  }

  const user = await prisma.user.delete({
    select: userSelect,
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: user,
  });
}
