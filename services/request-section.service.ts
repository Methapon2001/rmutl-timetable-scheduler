import { Prisma, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const userSelect: Prisma.UserSelect = {
  id: true,
  username: true,
  role: true,
};

const openedRequestSectionSelect: Prisma.OpenedRequestSectionSelect = {
  id: true,
  key: true,
  opener: {
    select: userSelect,
  },
  createdAt: true,
};

export async function requestSectionStatus(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = await prisma.openedRequestSection.findFirst({
    select: openedRequestSectionSelect,
    where: {
      openedByUserId: request.user.id,
    },
  });

  reply.status(200).send({ data });
}

export async function checkRequestSection(
  request: FastifyRequest<{ Querystring: { key: string } }>,
  reply: FastifyReply
) {
  const data = await prisma.openedRequestSection.findFirst({
    select: openedRequestSectionSelect,
    where: {
      key: request.query.key,
    },
  });

  reply.status(200).send({ data });
}

export async function openRequestSection(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const record = await prisma.openedRequestSection.findFirst({
    where: {
      openedByUserId: request.user.id,
    },
  });

  if (record) {
    return reply.status(400).send({
      message: "Already open request.",
    });
  }

  const data = await prisma.openedRequestSection.create({
    select: openedRequestSectionSelect,
    data: {
      openedByUserId: request.user.id,
    },
  });

  reply.status(200).send({
    data,
  });
}

export async function closeRequestSection(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = await prisma.openedRequestSection.delete({
    where: {
      openedByUserId: request.user.id,
    },
  });

  reply.status(200).send({ data });
}

const subjectSelect: Prisma.SubjectSelect = {
  id: true,
  code: true,
  name: true,
  credit: true,
  lecture: true,
  lab: true,
};

const instructorSelect: Prisma.InstructorSelect = {
  id: true,
  name: true,
};

const requestSectionSelect: Prisma.RequestSectionSelect = {
  id: true,
  number: true,
  subject: {
    select: subjectSelect,
  },
  openedRequestSection: {
    select: openedRequestSectionSelect,
  },
  requester: {
    select: instructorSelect,
  },
  createdAt: true,
};

export async function listRequestSection(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = await prisma.requestSection.findMany({
    select: requestSectionSelect,
    where: {
      openedRequestSection: {
        openedByUserId: request.user.id,
      },
    },
  });

  reply.status(200).send({ data });
}

export async function createRequestSection(
  request: FastifyRequest<{
    Querystring: {
      key: string;
    };
    Body: {
      number: number | null | undefined;
      subjectId: string;
      instructorId: string;
    };
  }>,
  reply: FastifyReply
) {
  const record = await prisma.openedRequestSection.findFirst({
    where: {
      key: request.query.key,
    },
  });

  if (!record) {
    return reply.status(400).send({
      message:
        "The provided key does not match with any form, check your key again.",
    });
  }

  const data = await prisma.requestSection.create({
    select: requestSectionSelect,
    data: {
      number: request.body.number ?? undefined,
      subjectId: request.body.subjectId,
      requestedByInstructorId: request.body.instructorId,
      openedRequestSectionId: record.id,
    },
  });

  reply.status(200).send({ data });
}

export async function deleteRequestSection(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const record = await prisma.requestSection.findFirst({
    include: {
      openedRequestSection: true,
    },
    where: {
      id: request.params.id,
    },
  });

  if (
    record &&
    record.openedRequestSection.openedByUserId !== request.user.id &&
    request.user.role !== "admin"
  ) {
    return reply.code(403).send({
      message: "Forbidden.",
    });
  }

  const data = await prisma.requestSection.delete({
    select: requestSectionSelect,
    where: {
      id: request.params.id,
    },
  });

  reply.status(200).send({ data });
}
