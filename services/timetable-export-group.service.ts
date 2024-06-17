import xl from "excel4node";
import { FastifyReply, FastifyRequest } from "fastify";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  buildingSelect,
  groupSelect,
  instructorSelect,
  logInfoSelect,
  roomSelect,
  scheduleSelect,
  sectionSelect,
  subjectSelect,
} from "./model";
import { createWorksheetLayout } from "../utils/excel";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const select = {
  ...scheduleSelect,
  ...logInfoSelect,
  section: {
    select: {
      ...sectionSelect,
      room: {
        select: {
          ...roomSelect,
          building: { select: buildingSelect },
        },
      },
      group: { select: groupSelect },
      instructor: { select: instructorSelect },
      subject: { select: subjectSelect },
      parent: { select: sectionSelect },
    },
  },
} satisfies Prisma.SchedulerSelect;

export async function exportGroupSchedule(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const data = await prisma.scheduler.findMany({
    select: select,
    where: {
      info: { current: true },
      createdByUserId: req.user.id,
    },
    orderBy: [
      { section: { subject: { code: "asc" } } },
      { section: { no: "asc" } },
      { section: { lab: "asc" } },
    ],
  });

  const processOverlaps = (arg: typeof data) => {
    const processed = arg.map((current) => ({
      ...current,
      _overlap: arg.some(
        (item) =>
          item.id !== current.id &&
          item.weekday == current.weekday &&
          item.end >= current.start &&
          item.start <= current.end,
      ),
      _offset: -1,
    }));

    for (let i = 0; i < processed.length; i++) {
      if (processed[i]._overlap === false || processed[i]._offset !== -1) {
        continue;
      }

      const offsetList: number[] = [];
      const mutualOverlap = processed.filter(
        (item) =>
          processed[i].id !== item.id &&
          item.weekday === processed[i].weekday &&
          processed[i].start <= item.end &&
          processed[i].end >= item.start,
      );

      mutualOverlap.forEach((item) => {
        if (item._offset !== -1) offsetList.push(item._offset);
      });

      let j = 0;
      while (offsetList.includes(j)) j++;
      processed[i]._offset = j;

      for (let k = 0; k < processed.length; k++) {
        if (processed[i].weekday !== processed[k].weekday || i === k) continue;
        if (
          processed[i].section.subject.id === processed[k].section.subject.id
        ) {
          processed[k]._overlap = true;
          processed[k]._offset = j;
        }
      }
    }
    return processed;
  };

  let group = data.reduce<
    Record<string, (typeof data)[number]["section"]["group"]>
  >((acc, curr) => {
    if (curr.section.group && !acc[curr.section.group.id]) {
      acc[curr.section.group.id] = curr.section.group;
    }
    return acc;
  }, {});

  let wb = new xl.Workbook({
    defaultFont: {
      name: "AngsanaUPC",
      size: 12,
    },
  });

  Object.values(group).forEach((grp) => {
    const { id: groupId, name: groupName } = grp!;
    const { ws, alignCenter, border } = createWorksheetLayout(wb, groupName);

    const p = processOverlaps(
      data.filter((x) => x.section.group?.id === groupId),
    );

    const maxOverlap = Math.max(...p.map((x) => x._offset), 2) + 1;
    const weekdayMap = {
      mon: 0,
      tue: 1,
      wed: 2,
      thu: 3,
      fri: 4,
      sat: 5,
      sun: 6,
    };

    ws.cell(
      18 + maxOverlap * weekdayMap["wed"],
      4 + (15 - 1) * 2,
      18 + maxOverlap * weekdayMap["wed"] + maxOverlap - 1,
      3 + 18 * 2,
      true,
    )
      .string("Activity")
      .style({
        ...border,
        alignment: { wrapText: true, ...alignCenter.alignment },
      });

    Object.values(weekdayMap).forEach((vWeekday) => {
      ws.cell(
        18 + maxOverlap * vWeekday,
        1,
        18 + maxOverlap * vWeekday + maxOverlap - 1,
        3,
        true,
      )
        .string(
          ["จันทร์", "อังคาร", "พุธ", "พฤ", "ศุกร์", "เสาร์", "อาทิตย์"][
            vWeekday
          ],
        )
        .style({ ...alignCenter, ...border });
      ws.cell(
        18 + maxOverlap * vWeekday + maxOverlap - 1,
        1,
        18 + maxOverlap * vWeekday + maxOverlap - 1,
        53,
      ).style({
        border: { bottom: { style: "thin" } },
      });
    });

    for (let i = 1; i <= 25; i++) {
      ws.cell(18, 3 + i * 2, 18 + 7 * maxOverlap - 1, 3 + i * 2, false).style({
        border: { right: { style: "thin" } },
      });
    }

    const total = { lecture: 0, lab: 0, learn: 0 };
    let detailCount = 0;

    p.forEach((v) => {
      if (v.section.parent === null) {
        ws.cell(3 + detailCount, 16)
          .string(v.section.subject.code)
          .style(alignCenter);
        ws.cell(3 + detailCount, 20).string(v.section.subject.name);
        ws.cell(3 + detailCount, 32)
          .number(v.section.subject.lecture)
          .style(alignCenter);
        ws.cell(3 + detailCount, 33)
          .number(v.section.subject.lab / 3)
          .style(alignCenter);
        ws.cell(3 + detailCount, 34)
          .number(v.section.subject.lecture + v.section.subject.lab / 3)
          .style(alignCenter);
        ws.cell(3 + detailCount, 35).string(
          v.section.subject.code +
            "_SEC_" +
            v.section.no +
            (v.section.alt ? `, ${v.section.alt}` : ""),
        );
        ws.cell(3 + detailCount, 48)
          .number(v.section.subject.lecture)
          .style(alignCenter);
        ws.cell(3 + detailCount, 49)
          .number(v.section.subject.lab)
          .style(alignCenter);
        ws.cell(3 + detailCount, 50)
          .number(v.section.subject.lecture + v.section.subject.lab)
          .style(alignCenter);
        total.lecture += v.section.subject.lecture;
        total.lab += v.section.subject.lab;
        detailCount++;
      }

      if (!v._overlap) {
        ws.cell(
          18 + maxOverlap * weekdayMap[v.weekday],
          4 + (v.start - 1) * 2,
          18 + maxOverlap * weekdayMap[v.weekday] + maxOverlap - 1,
          3 + v.end * 2,
          true,
        )
          .string(
            v.section.subject.code +
              "_SEC_" +
              v.section.no +
              (v.section.alt ? `, ${v.section.alt}` : "") +
              (v.section.lab ? `-L${v.section.lab}` : "") +
              (v.section.room
                ? "\n" +
                  v.section.room.building.code +
                  "-" +
                  v.section.room.name
                : ""),
          )
          .style({
            ...border,
            alignment: { wrapText: true, ...alignCenter.alignment },
          });
      } else {
        ws.cell(
          18 + maxOverlap * weekdayMap[v.weekday] + v._offset,
          4 + (v.start - 1) * 2,
          18 + maxOverlap * weekdayMap[v.weekday] + v._offset,
          3 + v.end * 2,
          true,
        )
          .string(v.section.subject.name)
          .style({ ...border, ...alignCenter });
      }
    });

    ws.cell(15, 32).number(total.lecture).style(alignCenter);
    ws.cell(15, 33)
      .number(total.lab / 3)
      .style(alignCenter);
    ws.cell(15, 34)
      .number(total.lecture + total.lab / 3)
      .style(alignCenter);
    ws.cell(15, 48).number(total.lecture).style(alignCenter);
    ws.cell(15, 49).number(total.lab).style(alignCenter);
    ws.cell(15, 50)
      .number(total.lecture + total.lab)
      .style(alignCenter);
  });

  const buffer = await wb.writeToBuffer();

  res
    .type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    .send(buffer);
}
