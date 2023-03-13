import { Section, PrismaClient, SectionType, Instructor } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

type Body = {
  subjectId: string;
  groupId: null | string;
  manual: boolean;
  type: SectionType;
  no: number;
  sections: {
    roomId: null | string;
    instructorId: null | string[] | Instructor[];
  }[];
};

type Query = {
  limit: number;
  offset: number;
  instructorId: string;
} & Section;

type Param = {
  id: string;
};

export async function createSection(
  request: FastifyRequest<{ Body: Body }>,
  reply: FastifyReply,
) {
  if (request.body.manual == false) {
    request.body.no =
      (await prisma.section.count({
        where: {
          subjectId: request.body.subjectId,
          parentId: null,
        },
      })) + 1;
  }

  const data = request.body.sections.map((val, idx) => {
    const section = { ...val };

    if (section.instructorId == null) {
      section.instructorId = [] as Instructor[];
    } else {
      section.instructorId = section.instructorId.map((instructor) => {
        if (typeof instructor == "string") {
          return { id: instructor } as Instructor;
        }
        return instructor as Instructor;
      }) as Instructor[];
    }

    return {
      subjectId: request.body.subjectId,
      groupId: request.body.groupId,
      roomId: section.roomId,
      manual: request.body.manual,
      type: idx == 0 ? request.body.type : "lab",
      no: request.body.no,
      lab:
        idx != 0 && request.body.type == "lecture"
          ? idx
          : idx != 0 && request.body.type == "lab"
          ? idx + 1
          : null,
      createdBy: request.user.id,
      instructor: {
        connect: section.instructorId as Instructor[],
      },
    };
  });

  const main = data.shift()!;
  const child = data;

  const section = await prisma.section.create({
    data: {
      ...main,
      child: {
        create: child,
      },
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          role: true,
        },
      },
      room: {
        include: {
          building: true,
        },
      },
      group: true,
      instructor: true,
      subject: true,
      child: {
        include: {
          room: {
            include: {
              building: true,
            },
          },
          group: true,
          instructor: true,
          subject: true,
        },
        orderBy: [
          {
            no: "desc",
          },
          {
            lab: "asc",
          },
        ],
      },
    },
  });

  reply.code(200).send({
    data: section,
  });
}

export async function requestSection(
  request: FastifyRequest<{ Params: Param; Querystring: Query }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { no, type, subjectId, roomId, instructorId, parentId, limit, offset } =
    request.query;

  const section = id
    ? await prisma.section.findFirst({
        where: {
          id: id,
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
          room: {
            include: {
              building: true,
            },
          },
          group: true,
          instructor: true,
          subject: true,
          child: {
            include: {
              room: {
                include: {
                  building: true,
                },
              },
              group: true,
              instructor: true,
              subject: true,
            },
            orderBy: [
              {
                no: "desc",
              },
              {
                lab: "asc",
              },
            ],
          },
        },
      })
    : await prisma.section.findMany({
        where: {
          no: no,
          type: type,
          subjectId: subjectId,
          roomId: roomId,
          parentId: parentId,
          instructor: {
            some: {
              id: instructorId,
            },
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
          room: {
            include: {
              building: true,
            },
          },
          group: true,
          instructor: true,
          subject: true,
          child: {
            include: {
              room: {
                include: {
                  building: true,
                },
              },
              group: true,
              instructor: true,
              subject: true,
            },
            orderBy: [
              {
                no: "desc",
              },
              {
                lab: "asc",
              },
            ],
          },
        },
        orderBy: [
          {
            no: "desc",
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
          no: no,
          type: type,
          subjectId: subjectId,
          roomId: roomId,
          parentId: parentId,
          instructor: {
            some: {
              id: instructorId,
            },
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
    Params: Param;
    Body: Section & {
      instructorId: null | string[] | Instructor[];
    };
  }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { no, roomId, groupId, instructorId } = request.body;

  if (no) {
    const query = await prisma.section.findFirst({
      where: {
        id: id,
      },
    });

    const updateId = query?.parentId ?? id;

    await prisma.section.updateMany({
      where: {
        OR: [{ id: updateId }, { parentId: updateId }],
      },
      data: {
        manual: true,
        no: no,
      },
    });
  }

  const section = await prisma.section.update({
    where: {
      id: id,
    },
    data: {
      roomId: roomId,
      groupId: groupId,
      instructor: {
        set: [],
        connect: instructorId?.map((instructor) => {
          if (typeof instructor == "string") {
            return { id: instructor } as Instructor;
          }
          return instructor as Instructor;
        }) as Instructor[],
      },
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          role: true,
        },
      },
      room: {
        include: {
          building: true,
        },
      },
      group: true,
      instructor: true,
      subject: true,
      child: {
        include: {
          room: {
            include: {
              building: true,
            },
          },
          group: true,
          instructor: true,
          subject: true,
        },
      },
    },
  });

  reply.status(200).send({
    data: section,
  });
}

export async function deleteSection(
  request: FastifyRequest<{ Params: Param }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const section = await prisma.section.delete({
    where: {
      id: id,
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          role: true,
        },
      },
      room: {
        include: {
          building: true,
        },
      },
      group: true,
      instructor: true,
      subject: true,
      child: {
        include: {
          room: {
            include: {
              building: true,
            },
          },
          group: true,
          instructor: true,
          subject: true,
        },
        orderBy: [
          {
            no: "desc",
          },
          {
            lab: "asc",
          },
        ],
      },
    },
  });

  if (section.parentId == null) {
    await prisma.section.updateMany({
      where: {
        subjectId: section.subject.id,
        manual: false,
        no: {
          gt: section.no,
        },
      },
      data: {
        no: {
          decrement: 1,
        },
      },
    });
  } else {
    await prisma.section.updateMany({
      where: {
        parentId: section.parentId,
        lab: {
          gt: section.lab!,
        },
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
