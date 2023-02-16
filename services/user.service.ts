import { User, Role, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { exclude } from "../utils/object";
import { hash } from "../utils/scrypt";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

type Query = {
  limit: number;
  offset: number;
} & User;

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
  });

  const userWithExcludedFields = exclude(user, ["password"]);

  return reply.status(200).send({
    data: userWithExcludedFields,
  });
}

export async function requestUser(
  request: FastifyRequest<{ Params: Param; Querystring: Query }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { username, role, limit, offset } = request.query;

  const user = id
    ? await prisma.user.findFirst({
        where: {
          id: id,
        },
      })
    : await prisma.user.findMany({
        where: {
          username: username,
          role: role,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.user.count({
        where: {
          username: {
            contains: username,
          },
          role: role,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

  const userWithExcludedFields =
    user && Array.isArray(user)
      ? user.map((u) => exclude(u, ["password"]))
      : user
      ? exclude(user, ["password"])
      : null;

  return reply.status(200).send({
    data: userWithExcludedFields,
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

  if (request.user.role != Role.admin && request.user.id != id) {
    return reply.code(403).send({
      message: "Forbidden.",
    });
  }

  if (request.user.role != Role.admin && request.body.role) {
    return reply.code(403).send({
      message: "Forbidden.",
    });
  }

  if (request.body.password) {
    request.body.password = await hash(request.body.password);
  }

  const user = await prisma.user.update({
    where: {
      id: id,
    },
    data: request.body,
  });

  const userWithExcludedFields = exclude(user, ["password"]);

  return reply.status(200).send({
    data: userWithExcludedFields,
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
    const admin = await prisma.user.findMany({
      where: {
        role: Role.admin,
      },
    });

    if (admin.length <= 1) {
      return reply.code(403).send({
        message: "Forbidden.",
      });
    }
  }

  const user = await prisma.user.delete({
    where: {
      id: id,
    },
  });

  const userWithExcludedFields = exclude(user, ["password"]);

  reply.status(200).send({
    data: userWithExcludedFields,
  });
}
