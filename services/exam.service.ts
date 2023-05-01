import {
  Section,
  Prisma,
  PrismaClient,
  Instructor,
  Exam,
} from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const userSelect: Prisma.UserSelect = {
  id: true,
  username: true,
  role: true,
};

const subjectSelect: Prisma.SubjectSelect = {
  id: true,
  code: true,
  name: true,
  credit: true,
  lecture: true,
  lab: true,
  exam: true,
};

const courseDetailSelect: Prisma.CourseDetailSelect = {
  id: true,
  type: true,
  subject: {
    select: subjectSelect,
  },
};

const courseSelect: Prisma.CourseSelect = {
  id: true,
  name: true,
  detail: {
    select: courseDetailSelect,
  },
};

const groupSelect: Prisma.GroupSelect = {
  id: true,
  name: true,
  course: {
    select: courseSelect,
  },
};

const buildingSelect: Prisma.BuildingSelect = {
  id: true,
  code: true,
  name: true,
};

const roomSelect: Prisma.RoomSelect = {
  id: true,
  name: true,
  type: true,
  building: {
    select: buildingSelect,
  },
};

const instructorSelect: Prisma.InstructorSelect = {
  id: true,
  name: true,
};

const childSectionSelect: Prisma.SectionSelect = {
  id: true,
  no: true,
  lab: true,
  type: true,
  subject: {
    select: subjectSelect,
  },
};

const sectionSelect: Prisma.SectionSelect = {
  ...childSectionSelect,
  parent: {
    select: childSectionSelect,
  },
  child: {
    select: childSectionSelect,
    orderBy: [
      {
        subject: {
          name: "asc",
        },
      },
      {
        no: "asc",
      },
      {
        lab: "asc",
      },
    ],
  },
  createdAt: true,
  createdBy: {
    select: userSelect,
  },
  updatedAt: true,
  updatedBy: {
    select: userSelect,
  },
};

export async function createExam(
  request: FastifyRequest<{
    Body: Exam & { instructor: Instructor[]; section: Section[] };
  }>,
  reply: FastifyReply
) {
  const { instructor, section } = request.body;

  const exam = await prisma.exam.create({
    data: {
      section: {
        connect: section,
      },
      instructor: {
        connect: instructor,
      },
      createdByUserId: request.user.id,
      updatedByUserId: request.user.id,
    },
  });

  return reply.status(200).send({
    data: exam,
  });
}

export async function requestExam(
  request: FastifyRequest<{
    Body: Exam & { instructor: Instructor[]; section: Section[] };
  }>,
  reply: FastifyReply
) {

}
