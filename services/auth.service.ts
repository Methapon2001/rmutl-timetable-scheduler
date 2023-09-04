import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaClient, User } from "@prisma/client";
import { compare } from "../utils/scrypt";
import { exclude } from "../utils/object";
import { sign, verify } from "../utils/jwt";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

async function issueTokenPair(user: User) {
  const payload = exclude(user, ["password", "createdAt", "updatedAt"]);

  const accessToken = await sign(payload, {
    expiresIn: 900000,
  });
  const refreshToken = await sign({ id: user.id }, { expiresIn: 2592000000 });

  await prisma.token.create({
    data: {
      token: refreshToken,
      iat: new Date(),
      exp: new Date(Date.now() + 2592000000),
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  return [accessToken, refreshToken];
}

async function clearExpiredToken() {
  return await prisma.token.deleteMany({
    where: {
      exp: {
        lt: new Date(),
      },
    },
  });
}

export async function check(request: FastifyRequest, reply: FastifyReply) {
  let token: string | undefined;
  let payload: object | undefined;

  if (request.headers.authorization?.startsWith("Bearer ")) {
    token = request.headers.authorization?.split(" ")[1];
  }

  if (token) {
    payload = await verify(token);
  }

  if (payload) {
    return reply.code(200).send({
      isAuthenticated: true,
      user: { ...payload, jti: undefined, iat: undefined, exp: undefined },
    });
  }

  return reply.code(200).send({
    isAuthenticated: false,
  });
}

export async function login(
  request: FastifyRequest<{ Body: { username: string; password: string } }>,
  reply: FastifyReply
) {
  clearExpiredToken();

  const user = await prisma.user.findFirst({
    where: {
      username: request.body.username,
    },
  });

  if (user && (await compare(request.body.password, user.password))) {
    const [accessToken, refreshToken] = await issueTokenPair(user);

    return reply.status(200).send({
      token: {
        access: accessToken,
        refresh: refreshToken,
      },
    });
  }

  return reply.code(401).send({
    message: "Unauthorized.",
  });
}

export async function logout(
  request: FastifyRequest<{ Body: { token: string } }>,
  reply: FastifyReply
) {
  const token = await prisma.token.findFirst({
    where: {
      token: request.body.token,
    },
    include: {
      user: true,
    },
  });

  if (token && token.user.id != request.user.id) {
    return reply.status(403).send({
      message: "Forbidden.",
    });
  }

  if (token) {
    await prisma.token.delete({
      where: {
        id: token.id,
      },
    });
  }

  return reply.code(200).send({});
}

export async function refresh(
  request: FastifyRequest<{ Body: { token: string } }>,
  reply: FastifyReply
) {
  const payload = await verify(request.body.token);

  if (!payload) {
    return reply.status(401).send({
      message: "Unauthorized.",
    });
  }

  const token = await prisma.token.findFirst({
    where: {
      token: request.body.token,
    },
    include: {
      user: true,
    },
  });

  if (!token) {
    await prisma.token.deleteMany({
      where: {
        user: { id: payload.id },
      },
    });

    return reply.status(401).send({
      message: "Unauthorized.",
    });
  }

  const [accessToken, refreshToken] = await issueTokenPair(token.user);

  await prisma.token.delete({
    where: {
      id: token.id,
    },
  });

  return reply.status(200).send({
    token: {
      access: accessToken,
      refresh: refreshToken,
    },
  });
}
