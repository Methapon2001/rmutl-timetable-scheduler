import { Prisma, PrismaClient } from "@prisma/client";
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
    },
    data: {
      publish: request.body.publish,
    },
  });

  reply.status(200).send({
    data: updated,
  });
};
