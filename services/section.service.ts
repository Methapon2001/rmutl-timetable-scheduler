import {
  Section,
  Prisma,
  PrismaClient,
  Instructor,
  Role,
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
  learn: true,
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
  alt: true,
  lab: true,
  type: true,
  capacity: true,
  group: {
    select: groupSelect,
  },
  room: {
    select: roomSelect,
  },
  subject: {
    select: subjectSelect,
  },
  instructor: {
    select: instructorSelect,
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

async function nextSectionNo(subjectId: string) {
  const manual = await prisma.section.findMany({
    select: {
      no: true,
    },
    where: {
      subjectId: subjectId,
      parentId: null,
      manual: true,
    },
    orderBy: {
      no: "desc",
    },
  });

  const auto = await prisma.section.findFirst({
    select: {
      no: true,
    },
    where: {
      subjectId: subjectId,
      parentId: null,
      manual: false,
    },
    orderBy: {
      no: "desc",
    },
  });

  let next = auto ? auto.no + 1 : 1;

  while (manual.findIndex((man) => man.no == next) != -1) next++;

  return next;
}

type CreateBody = Pick<Section, "type" | "subjectId"> &
  Partial<Pick<Section, "no" | "alt" | "manual" | "groupId">> & {
    section: {
      roomId: string | null;
      instructor?: Instructor[];
      capacity: number;
    }[];
  };

export async function createSection(
  request: FastifyRequest<{
    Body: CreateBody;
  }>,
  reply: FastifyReply
) {
  const sectionNo =
    request.body.manual && request.body.no
      ? request.body.no
      : await nextSectionNo(request.body.subjectId);

  const info = await prisma.info.findFirst({
    where: {
      current: true,
    },
  });

  if (!info) {
    return reply.code(400).send({
      message: "Must set year and semester before add this data.",
    });
  }

  const data = request.body.section.map((val, idx) => {
    return {
      type: idx == 0 ? request.body.type : "lab",
      no: sectionNo,
      alt: request.body.alt,
      lab:
        idx != 0 && request.body.type == "lecture"
          ? idx
          : request.body.type == "lab"
          ? idx + 1
          : null,
      manual: request.body.manual,
      capacity: val.capacity,
      subjectId: request.body.subjectId,
      groupId: request.body.groupId,
      roomId: val.roomId,
      instructor: {
        connect: val.instructor,
      },
      infoId: info.id,
      createdByUserId: request.user.id,
      updatedByUserId: request.user.id,
    };
  });

  const validateRoomConstraint = data.every(async (sec) => {
    if (!sec.roomId) return true;

    const room = await prisma.room.findUnique({
      select: {
        type: true,
      },
      where: {
        id: sec.roomId,
      },
    });

    return room?.type == "both" || room?.type == sec.type;
  });

  if (!validateRoomConstraint) {
    return reply.code(400).send({
      message: "Room type must matched with section type.",
    });
  }

  const main = data.shift()!;
  const child = data;

  const section = await prisma.section.create({
    data: {
      ...main,
      child: {
        create: child,
      },
    },
    select: sectionSelect,
  });

  return reply.status(200).send({
    data: section,
  });
}

export async function requestSection(
  request: FastifyRequest<{
    Params: Pick<Section, "id">;
    Querystring: {
      search: string;
      limit: number;
      offset: number;
      exam_filtered: number;
      year: number;
      semester: number;
    } & Pick<
      Section,
      | "groupId"
      | "roomId"
      | "subjectId"
      | "no"
      | "createdByUserId"
      | "updatedByUserId"
    >;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { limit, offset, search, year, semester, exam_filtered, ...where } =
    request.query;

  if (search) {
    return await searchSection(request, reply);
  }

  const sectionWhere: Prisma.SectionWhereInput = where;

  if (exam_filtered) {
    sectionWhere.exam = { none: {} };
    sectionWhere.parent = null;
  }

  const section = id
    ? await prisma.section.findUnique({
        select: sectionSelect,
        where: {
          id: id,
        },
      })
    : await prisma.section.findMany({
        select: sectionSelect,
        where: {
          ...sectionWhere,
          info: {
            year,
            semester,
          },
        },
        orderBy: [
          {
            createdAt: "asc",
          },
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
        skip: offset,
        take: limit,
      });

  const count = id
    ? undefined
    : await prisma.section.count({
        where: {
          ...sectionWhere,
          info: {
            year,
            semester,
          },
        },
      });

  reply.status(200).send({
    data: section,
    limit: limit,
    offset: offset,
    total: count,
  });
}

export async function updateSection(
  request: FastifyRequest<{
    Params: Pick<Section, "id">;
    Body: Partial<Pick<Section, "alt" | "capacity" | "roomId" | "groupId">> & {
      instructor?: Instructor[];
    };
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const rec = await prisma.section.findUnique({
    select: {
      createdByUserId: true,
    },
    where: {
      id: id,
    },
  });

  if (rec?.createdByUserId != request.user.id) {
    return reply.code(403).send({
      message: "Forbidden.",
    });
  }

  const used = await prisma.scheduler.findFirst({
    select: {
      id: true,
    },
    where: {
      sectionId: id,
    },
  });

  if (used) {
    return reply.code(403).send({
      message: "Cannot edit when this is used in schedule.",
    });
  }

  const section = await prisma.section.update({
    select: sectionSelect,
    where: {
      id: id,
    },
    data: {
      ...request.body,
      instructor: request.body.instructor
        ? {
            set: [],
            connect: request.body.instructor,
          }
        : undefined,
      updatedByUserId: request.user.id,
    },
  });

  return reply.status(200).send({
    data: section,
  });
}

export async function deleteSection(
  request: FastifyRequest<{
    Params: Pick<Section, "id">;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const rec = await prisma.section.findUnique({
    select: {
      createdByUserId: true,
    },
    where: {
      id: id,
    },
  });

  if (
    request.user.role != Role.admin &&
    rec?.createdByUserId != request.user.id
  ) {
    return reply.code(403).send({
      message: "Forbidden.",
    });
  }

  const used = await prisma.scheduler.findFirst({
    select: {
      id: true,
    },
    where: {
      sectionId: id,
    },
  });

  if (used) {
    return reply.code(403).send({
      message: "Cannot delete when this is used in schedule.",
    });
  }

  const exam = await prisma.exam.findMany({
    select: {
      id: true,
      section: true,
    },
    where: {
      section: {
        some: {
          id: id,
        },
      },
    },
  });

  exam.forEach(async (ex) => {
    ex.section.length === 1
      ? await prisma.exam.delete({
          where: {
            id: ex.id,
          },
        })
      : await prisma.exam.update({
          where: {
            id: ex.id,
          },
          data: {
            section: {
              disconnect: {
                id: id,
              },
            },
          },
        });
  });

  const section = await prisma.section.delete({
    select: sectionSelect,
    where: {
      id: id,
    },
  });

  if (section && section.child?.length != 0) {
    const manual = await prisma.section.findMany({
      where: {
        no: {
          gt: section.no,
        },
        subjectId: section.subject?.id,
        parentId: null,
        manual: true,
      },
      orderBy: {
        no: "desc",
      },
    });

    manual.forEach(async (man) => {
      await prisma.section.updateMany({
        where: {
          no: man.no + 1,
          manual: false,
          subjectId: section.subject?.id,
        },
        data: {
          no: {
            decrement: 1,
          },
        },
      });
    });

    await prisma.section.updateMany({
      where: {
        no: {
          gt: section.no,
        },
        manual: false,
        subjectId: section.subject?.id,
      },
      data: {
        no: {
          decrement: 1,
        },
      },
    });
  }

  if (section && section.child?.length == 0) {
    await prisma.section.updateMany({
      where: {
        no: section.no,
        type: "lab",
        lab: {
          gt: section.lab ?? undefined,
        },
        subjectId: section.subject?.id,
      },
      data: {
        lab: {
          decrement: 1,
        },
      },
    });
  }

  reply.status(200).send({
    data: section,
  });
}

export async function resetSection(
  request: FastifyRequest<{
    Querystring: {
      year: number;
      semester: number;
    };
  }>,
  reply: FastifyReply
) {
  const { id: userId } = request.user;

  await prisma.section.deleteMany({
    where: {
      info: {
        year: request.query.year,
        semester: request.query.semester,
      },
      createdByUserId: userId,
    },
  });

  await prisma.exam.deleteMany({
    where: {
      section: {
        none: {},
      },
    },
  });

  return reply.status(200).send({
    message: "Success.",
  });
}

export async function searchSection(
  request: FastifyRequest<{
    Querystring: { search: string; limit: number; offset: number };
  }>,
  reply: FastifyReply
) {
  const { limit, offset, search } = request.query;

  const sectionWhere: Prisma.SectionWhereInput = {
    OR: [
      {
        group: {
          name: {
            contains: search,
          },
        },
      },
      {
        group: {
          course: {
            name: {
              contains: search,
            },
          },
        },
      },
      {
        room: {
          name: {
            contains: search,
          },
        },
      },
      {
        room: {
          building: {
            name: {
              contains: search,
            },
          },
        },
      },
      {
        subject: {
          name: {
            contains: search,
          },
        },
      },
      {
        instructor: {
          some: {
            name: {
              contains: search,
            },
          },
        },
      },
    ],
  };

  const section = await prisma.section.findMany({
    select: sectionSelect,
    where: sectionWhere,
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
    skip: offset,
    take: limit,
  });

  const count = await prisma.section.count({
    where: sectionWhere,
  });

  reply.status(200).send({
    data: section,
    limit: limit,
    offset: offset,
    total: count,
  });
}
