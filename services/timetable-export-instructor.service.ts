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

const courseSelect = {
  id: true,
  name: true,
};

const groupSelect = {
  id: true,
  name: true,
  course: {
    select: courseSelect,
  },
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

const childSectionSelect = {
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

const sectionSelect = {
  ...childSectionSelect,
  parent: {
    select: childSectionSelect,
  },
  child: {
    select: childSectionSelect,
  },
};

const schedulerSelect = {
  id: true,
  weekday: true,
  start: true,
  end: true,
  publish: true,
  section: {
    select: sectionSelect,
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

export async function exportInstructorSchedule(
  req: FastifyRequest,
  res: FastifyReply
) {
  const data = await prisma.scheduler.findMany({
    select: schedulerSelect,
    where: {
      createdByUserId: req.user.id,
    },
  });

  const processOverlaps = (arg: typeof data) => {
    const processed = arg.map((current) => {
      return {
        ...current,
        _overlap: arg.some(
          (item) =>
            item.id !== current.id &&
            item.weekday == current.weekday &&
            item.end >= current.start &&
            item.start <= current.end
        ),
        _offset: -1,
      };
    });

    for (let i = 0; i < processed.length; i++) {
      if (processed[i]._overlap === false || processed[i]._offset !== -1)
        continue;

      const offsetList: number[] = [];

      const mutualOverlap = processed.filter(
        (item) =>
          processed[i].id !== item.id &&
          item.weekday === processed[i].weekday &&
          processed[i].start <= item.end &&
          processed[i].end >= item.start
      );

      mutualOverlap.forEach((item) => {
        if (item._offset !== -1) offsetList.push(item._offset);
      });

      let j = 0;

      while (offsetList.includes(j)) j++;

      processed[i]._offset = j;

      for (let k = 0; k < processed.length; k++) {
        if (processed[i].weekday !== processed[k].weekday || i == k) continue;

        if (
          processed[i].section.subject.id == processed[k].section.subject.id
        ) {
          processed[k]._overlap = true;
          processed[k]._offset = j;
        }
      }
    }
    return processed;
  };

  let instructor = data.reduce<
    Record<string, (typeof data)[number]["section"]["instructor"][number]>
  >((acc, curr) => {
    curr.section.instructor.forEach((v) => {
      if (!acc[v.id]) acc[v.id] = v;
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
      .string([{ bold: true, size: 32 }, title])
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

  Object.values(instructor).forEach((vInstructor) => {
    const { id: instructorId, name: instructorName } = vInstructor!;

    const { ws, styleCenter, styleBorder } =
      createWorksheetLayout(instructorName);

    const p = processOverlaps(
      data.filter(
        (vSchedule) =>
          vSchedule.section.instructor.findIndex(
            (obj) => obj.id === instructorId
          ) !== -1
      )
    );

    const maxOverlap = Math.max(...p.map((obj) => obj._offset), 2) + 1;
    const weekdayMap = {
      mon: 0,
      tue: 1,
      wed: 2,
      thu: 3,
      fri: 4,
      sat: 5,
      sun: 6,
    };

    Object.values(weekdayMap).forEach((vWeekday) => {
      ws.cell(
        18 + maxOverlap * vWeekday,
        1,
        18 + maxOverlap * vWeekday + maxOverlap - 1,
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
        18 + maxOverlap * vWeekday + maxOverlap - 1,
        1,
        18 + maxOverlap * vWeekday + maxOverlap - 1,
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
      ws.cell(18, 3 + i * 2, 18 + 7 * maxOverlap - 1, 3 + i * 2, false).style({
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
    } = {
      lecture: 0,
      lab: 0,
    };

    p.forEach((vProcessed, idx) => {
      ws.cell(3 + idx, 16)
        .string(vProcessed.section.subject.code)
        .style(styleCenter);
      ws.cell(3 + idx, 20).string(vProcessed.section.subject.name);
      ws.cell(3 + idx, 32)
        .number(vProcessed.section.subject.lecture)
        .style(styleCenter);
      ws.cell(3 + idx, 33)
        .number(vProcessed.section.subject.lab)
        .style(styleCenter);
      ws.cell(3 + idx, 34)
        .number(
          vProcessed.section.subject.lecture +
            vProcessed.section.subject.lab / 3
        )
        .style(styleCenter);
      ws.cell(3 + idx, 35).string(
        vProcessed.section.subject.code + "_SEC_" + vProcessed.section.no
      );
      ws.cell(3 + idx, 48)
        .number(vProcessed.section.subject.lecture)
        .style(styleCenter);
      ws.cell(3 + idx, 49)
        .number(vProcessed.section.subject.lab)
        .style(styleCenter);
      ws.cell(3 + idx, 50)
        .number(
          vProcessed.section.subject.lecture + vProcessed.section.subject.lab
        )
        .style(styleCenter);

      total.lecture += vProcessed.section.subject.lecture;
      total.lab += vProcessed.section.subject.lab;

      if (!vProcessed._overlap) {
        ws.cell(
          18 + maxOverlap * weekdayMap[vProcessed.weekday],
          4 + (vProcessed.start - 1) * 2,
          18 + maxOverlap * weekdayMap[vProcessed.weekday] + maxOverlap - 1,
          3 + vProcessed.end * 2,
          true
        )
          .string(
            vProcessed.section.subject.code +
              "_SEC_" +
              vProcessed.section.no +
              (vProcessed.section.room
                ? "\n" +
                  vProcessed.section.room.building.code +
                  "-" +
                  vProcessed.section.room.name
                : "")
          )
          .style({
            ...styleBorder,
            alignment: {
              wrapText: true,
              ...styleCenter.alignment,
            },
          });
      } else {
        ws.cell(
          18 + maxOverlap * weekdayMap[vProcessed.weekday] + vProcessed._offset,

          4 + (vProcessed.start - 1) * 2,
          18 + maxOverlap * weekdayMap[vProcessed.weekday] + vProcessed._offset,
          3 + vProcessed.end * 2,
          true
        )
          .string(vProcessed.section.subject.name)
          .style({ ...styleBorder, ...styleCenter });
      }
    });

    ws.cell(15, 32).number(total.lecture).style(styleCenter);
    ws.cell(15, 33)
      .number(total.lab / 3)
      .style(styleCenter);
    ws.cell(15, 34)
      .number(total.lecture + total.lab / 3)
      .style(styleCenter);
    ws.cell(15, 48).number(total.lecture).style(styleCenter);
    ws.cell(15, 49).number(total.lab).style(styleCenter);
    ws.cell(15, 50)
      .number(total.lecture + total.lab)
      .style(styleCenter);
  });

  const buffer = await wb.writeToBuffer();

  res.type("application/vnd.ms-excel").send(buffer);
}
