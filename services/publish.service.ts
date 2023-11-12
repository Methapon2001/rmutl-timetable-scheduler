import { PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

export let action = async (
  request: FastifyRequest<{
    Body: {
      publish: boolean;
      year: number;
      semester: number;
    };
  }>,
  reply: FastifyReply,
) => {
  const info = await prisma.info.findFirst({
    where: {
      current: true,
    },
  });

  const updated = await prisma.scheduler.updateMany({
    where: {
      info: {
        year: request.body.year ?? info?.year,
        semester: request.body.semester ?? info?.semester,
      },
      createdByUserId: request.user.id,
    },
    data: {
      publish: request.body.publish,
    },
  });

  reply.status(200).send({
    data: updated,
  });
};

export const actionPublishExam = async (
  request: FastifyRequest<{
    Body: {
      publish: boolean;
      year: number;
      semester: number;
    };
  }>,
  reply: FastifyReply,
) => {
  const info = await prisma.info.findFirst({
    where: {
      current: true,
    },
  });

  const updated = await prisma.schedulerExam.updateMany({
    where: {
      info: {
        year: request.body.year ?? info?.year,
        semester: request.body.semester ?? info?.semester,
      },
      createdByUserId: request.user.id,
    },
    data: {
      publish: request.body.publish,
    },
  });

  reply.status(200).send({
    data: updated,
  });
};
