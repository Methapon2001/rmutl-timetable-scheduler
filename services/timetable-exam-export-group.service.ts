import { FastifyReply, FastifyRequest } from "fastify";
import xl from "excel4node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const userSelect = {
  id: true,
  username: true,
  role: true,
};

const subjectSelect = {
  id: true,
  code: true,
  name: true,
  credit: true,
  lecture: true,
  lab: true,
  learn: true,
};

const groupSelect = {
  id: true,
  name: true,
};

const buildingSelect = {
  id: true,
  code: true,
  name: true,
};

const roomSelect = {
  id: true,
  name: true,
  type: true,
  building: {
    select: buildingSelect,
  },
};

const instructorSelect = {
  id: true,
  name: true,
};

const sectionSelect = {
  id: true,
  no: true,
  alt: true,
  lab: true,
  type: true,
  capacity: true,
  subject: {
    select: subjectSelect,
  },
  group: {
    select: groupSelect,
  },
};

const examSelect = {
  id: true,
  room: {
    select: roomSelect,
  },
  section: {
    select: sectionSelect,
  },
  instructor: {
    select: instructorSelect,
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

const schedulerExamSelect = {
  id: true,
  weekday: true,
  start: true,
  end: true,
  publish: true,
  exam: {
    select: examSelect,
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
export async function exportGroupScheduleExam(
  req: FastifyRequest,
  res: FastifyReply
) {
  const data = await prisma.schedulerExam.findMany({
    select: schedulerExamSelect,
    where: {
      createdByUserId: req.user.id,
    },
  });

  let group = data.reduce<
    Record<string, (typeof data)[number]["exam"]["section"][number]["group"]>
  >((acc, curr) => {
    curr.exam.section.forEach((v) => {
      if (v.group && !acc[v.group.id]) acc[v.group.id] = v.group;
    });
    return acc;
  }, {});

  let wb = new xl.Workbook({
    defaultFont: {
      name: "AngsanaUPC",
      size: 12,
    },
  });

  const createWorksheetLayout = (title: string) => {
    let ws = wb.addWorksheet(title, {
      pageSetup: {
        paperSize: "A4_PAPER",
        orientation: "landscape",
      },
      margins: {
        top: 0.1,
        bottom: 0.1,
        left: 0.1,
        right: 0.1,
      },
      printOptions: {
        centerHorizontal: true,
      },
    });

    for (let i = 1; i <= 53; i++) {
      ws.column(i).setWidth(4);
    }

    const styleCenter = wb.createStyle({
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
    });

    const styleBorder = wb.createStyle({
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      },
    });

    ws.cell(1, 1, 17, 53, false).style({
      alignment: {
        vertical: "center",
      },
      ...styleBorder,
    });

    ws.cell(1, 1, 15, 14, true)
      .string([{ bold: true, size: 48 }, title])
      .style(styleCenter);

    ws.cell(1, 15, 2, 15, true).string("ที่").style(styleCenter);
    ws.cell(1, 16, 2, 19, true).string("รหัสวิชา").style(styleCenter);
    ws.cell(1, 20, 2, 31, true).string("ชื่อวิชา").style(styleCenter);
    ws.cell(1, 32, 1, 34, true).string("หน่วยกิต").style(styleCenter);
    ws.cell(2, 32).string("ท").style(styleCenter);
    ws.cell(2, 33).string("ป").style(styleCenter);
    ws.cell(2, 34).string("ร").style(styleCenter);
    ws.cell(1, 35, 2, 43, true).string("กลุ่มเรียน").style(styleCenter);
    ws.cell(1, 44, 2, 45, true).string("ระดับ").style(styleCenter);
    ws.cell(1, 46, 2, 47, true).string("ภาค").style(styleCenter);
    ws.cell(1, 48, 1, 50, true).string("จำนวนชม.").style(styleCenter);
    ws.cell(2, 48).string("ท").style(styleCenter);
    ws.cell(2, 49).string("ป").style(styleCenter);
    ws.cell(2, 50).string("ร").style(styleCenter);
    ws.cell(1, 51, 2, 53, true).string("หมายเหตุ").style(styleCenter);
    for (let i = 3; i <= 14; i++) {
      ws.cell(i, 15)
        .style(styleCenter)
        .number(i - 2);
      ws.cell(i, 16, i, 19, true);
      ws.cell(i, 20, i, 31, true);
      ws.cell(i, 35, i, 43, true);
      ws.cell(i, 44, i, 45, true);
      ws.cell(i, 46, i, 47, true);
      ws.cell(i, 51, i, 53, true);
    }
    ws.cell(15, 15, 15, 31, true).string("รวม").style(styleCenter);
    ws.cell(15, 35, 15, 47, true).string("รวม").style(styleCenter);
    ws.cell(15, 51, 15, 53, true);

    ws.cell(16, 1, 16, 3, true)
      .string("เวลา")
      .style({
        alignment: {
          horizontal: "right",
        },
      });
    ws.cell(17, 1, 17, 3, true)
      .string("คาบ")
      .style({
        alignment: {
          horizontal: "left",
        },
      });

    let period = 1;

    for (let i = 4; i <= 53; i = i + 2) {
      ws.cell(16, i, 16, i + 1, true)
        .number(period)
        .style({
          alignment: { horizontal: "center" },
        });
      ws.cell(17, i, 17, i + 1, true)
        .string(
          String(
            `${8 + Math.floor((period - 1) / 2)}:${
              (period - 1) % 2 === 0 ? "0" : "3"
            }0-${8 + Math.floor(period / 2)}:${period % 2 === 0 ? "0" : "3"}0`
          )
        )
        .style({
          alignment: { horizontal: "center" },
          font: { size: 9 },
        });
      period++;
    }

    return { ws, styleCenter, styleBorder };
  };

  Object.values(group).forEach((vGroup) => {
    const { id: groupId, name: groupName } = vGroup!;

    const { ws, styleCenter, styleBorder } = createWorksheetLayout(groupName);

    const weekdayMap = {
      mon: 0,
      tue: 1,
      wed: 2,
      thu: 3,
      fri: 4,
      sat: 5,
      sun: 6,
    };
    const rowPerDay = 3;

    Object.values(weekdayMap).forEach((vWeekday) => {
      ws.cell(
        18 + rowPerDay * vWeekday,
        1,
        18 + rowPerDay * vWeekday + rowPerDay - 1,
        3,
        true
      )
        .string(
          ["จันทร์", "อังคาร", "พุธ", "พฤ", "ศุกร์", "เสาร์", "อาทิตย์"][
            vWeekday
          ]
        )
        .style({ ...styleCenter, ...styleBorder });
      ws.cell(
        18 + rowPerDay * vWeekday + rowPerDay - 1,
        1,
        18 + rowPerDay * vWeekday + rowPerDay - 1,
        53
      ).style({
        border: {
          bottom: {
            style: "thin",
          },
        },
      });
    });

    for (let i = 1; i <= 25; i++) {
      ws.cell(18, 3 + i * 2, 18 + 7 * rowPerDay - 1, 3 + i * 2, false).style({
        border: {
          right: {
            style: "thin",
          },
        },
      });
    }

    const total: {
      lecture: number;
      lab: number;
      learn: number;
    } = {
      lecture: 0,
      lab: 0,
      learn: 0,
    };

    let count = 0;

    data.forEach((vProcessed) => {
      const associatedSection = vProcessed.exam.section.find(
        (obj) => obj.group?.id === groupId
      );

      if (!associatedSection) return;

      ws.cell(3 + count, 16)
        .string(associatedSection.subject.code)
        .style(styleCenter);
      ws.cell(3 + count, 20).string(vProcessed.exam.section[0].subject.name);
      ws.cell(3 + count, 32)
        .number(associatedSection.subject.lecture)
        .style(styleCenter);
      ws.cell(3 + count, 33)
        .number(associatedSection.subject.lab / 3)
        .style(styleCenter);
      ws.cell(3 + count, 34)
        .number(
          associatedSection.subject.lecture + associatedSection.subject.lab / 3
        )
        .style(styleCenter);
      ws.cell(3 + count, 35).string(
        associatedSection.subject.code +
          "_SEC_" +
          associatedSection.no +
          (associatedSection.alt ? `, ${associatedSection.alt}` : "")
      );
      ws.cell(3 + count, 48)
        .number(associatedSection.subject.lecture)
        .style(styleCenter);
      ws.cell(3 + count, 49)
        .number(associatedSection.subject.lab)
        .style(styleCenter);
      ws.cell(3 + count, 50)
        .number(
          associatedSection.subject.lecture + associatedSection.subject.lab
        )
        .style(styleCenter);
      count++;

      total.lecture += associatedSection.subject.lecture;
      total.lab += associatedSection.subject.lab;
      total.learn += associatedSection.subject.learn;

      ws.cell(
        18 + rowPerDay * weekdayMap[vProcessed.weekday],
        4 + (vProcessed.start - 1) * 2,
        18 + rowPerDay * weekdayMap[vProcessed.weekday] + rowPerDay - 1,
        3 + vProcessed.end * 2,
        true
      )
        .string(
          associatedSection.subject.code +
            "_SEC_" +
            associatedSection.no +
            (associatedSection.alt ? `, ${associatedSection.alt}` : "") +
            (vProcessed.exam.room
              ? "\n" +
                vProcessed.exam.room.building.code +
                "-" +
                vProcessed.exam.room.name
              : "")
        )
        .style({
          ...styleBorder,
          alignment: {
            wrapText: true,
            ...styleCenter.alignment,
          },
        });
    });

    ws.cell(15, 32).number(total.lecture).style(styleCenter);
    ws.cell(15, 33).number(total.lab).style(styleCenter);
    ws.cell(15, 34).number(total.learn).style(styleCenter);
  });

  const buffer = await wb.writeToBuffer();

  res.type("application/vnd.ms-excel").send(buffer);
}
