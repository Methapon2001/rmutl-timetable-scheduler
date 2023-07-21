import { PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

export let action = async (
  request: FastifyRequest<{
    Body: {
      groupId?: string;
      instructorId?: string;
      roomId?: string;
      publish: boolean;
    };
  }>,
  reply: FastifyReply
) => {
  const updated = await prisma.scheduler.updateMany({
    where: {
      section: {
        groupId: request.body.groupId,
        instructor: request.body.instructorId
          ? {
              some: {
                id: request.body.instructorId,
              },
            }
          : undefined,
        roomId: request.body.roomId,
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
      groupId?: string;
      instructorId?: string;
      roomId?: string;
      publish: boolean;
    };
  }>,
  reply: FastifyReply
) => {
  const updated = await prisma.schedulerExam.updateMany({
    where: {
      exam: {
        instructor: request.body.instructorId
          ? {
              some: {
                id: request.body.instructorId,
              },
            }
          : undefined,
        section: request.body.groupId
          ? {
              some: {
                groupId: request.body.groupId,
              },
            }
          : undefined,
        roomId: request.body.roomId,
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
