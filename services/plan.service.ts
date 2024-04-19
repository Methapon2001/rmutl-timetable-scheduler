import { Plan, PlanDetail, Prisma, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  courseSelect,
  logInfoSelect,
  planDetailSelect,
  planSelect,
  subjectSelect,
} from "./model";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const select = {
  ...planSelect,
  ...logInfoSelect,
  detail: {
    select: {
      ...planDetailSelect,
      subject: {
        select: subjectSelect,
      },
    },
  },
  course: {
    select: courseSelect,
  },
} satisfies Prisma.PlanSelect;

export async function createPlan(
  request: FastifyRequest<{
    Body: Plan & {
      detail: Pick<PlanDetail, "semester" | "year" | "subjectId">[];
    };
  }>,
  reply: FastifyReply,
) {
  const { detail: planDetail, ...planData } = request.body;

  const courseSubjectList = await prisma.courseDetail.findMany({
    select: {
      subject: {
        select: subjectSelect,
      },
    },
    where: {
      courseId: request.body.courseId,
    },
  });

  if (
    !planDetail.every(
      (detail) =>
        courseSubjectList.findIndex(
          ({ subject: courseSubject }) => courseSubject.id === detail.subjectId,
        ) !== -1,
    )
  ) {
    return reply.code(403).send({
      message: "Some of the subject provided may not be in course provided.",
    });
  }

  const plan = await prisma.plan.create({
    data: {
      ...planData,
      detail: {
        createMany: { data: planDetail },
      },
      createdByUserId: request.user.id,
      updatedByUserId: request.user.id,
    },
    select: select,
  });

  return reply.status(200).send({
    data: plan,
  });
}

export async function requestPlan(
  request: FastifyRequest<{
    Params: Pick<Plan, "id">;
    Querystring: {
      limit: number;
      offset: number;
    } & Pick<Plan, "name" | "createdByUserId" | "updatedByUserId">;
  }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { limit, offset, ...where } = request.query;

  const planWhere: Prisma.PlanWhereInput = where;

  const plan = id
    ? await prisma.plan.findUnique({
        select: select,
        where: {
          id: id,
        },
      })
    : await prisma.plan.findMany({
        select: select,
        where: planWhere,
        orderBy: {
          createdAt: "asc",
        },
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.plan.count({
        where: planWhere,
      });

  reply.status(200).send({
    data: plan,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updatePlan(
  request: FastifyRequest<{
    Params: Pick<Plan, "id">;
    Body: Omit<Plan, "id"> & {
      detail: Pick<PlanDetail, "semester" | "year" | "subjectId">[];
    };
  }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { detail: planDetail, ...planData } = request.body;

  const courseSubjectList = await prisma.courseDetail.findMany({
    select: {
      subject: {
        select: subjectSelect,
      },
    },
    where: {
      courseId: request.body.courseId,
    },
  });

  if (
    !planDetail.every(
      (detail) =>
        courseSubjectList.findIndex(
          ({ subject: courseSubject }) => courseSubject.id === detail.subjectId,
        ) !== -1,
    )
  ) {
    return reply.code(403).send({
      message: "Some of the subject provided may not be in course provided.",
    });
  }

  const plan = await prisma.plan.update({
    select: select,
    where: {
      id: id,
    },
    data: {
      ...planData,
      detail: {
        deleteMany: {
          planId: id,
        },
        createMany: {
          data: planDetail,
        },
      },
      updatedByUserId: request.user.id,
    },
  });

  reply.status(200).send({
    data: plan,
  });
}

export async function deletePlan(
  request: FastifyRequest<{
    Params: Pick<Plan, "id">;
  }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const plan = await prisma.plan.delete({
    select: select,
    where: {
      id: id,
    },
  });

  reply.status(200).send({
    data: plan,
  });
}
