import xl from "excel4node";
import { FastifyReply, FastifyRequest } from "fastify";
import { Prisma, PrismaClient } from "@prisma/client";
import { weekdayNum, thaiMonthName } from "../utils/datetime";
import {
  buildingSelect,
  examSelect,
  groupSelect,
  instructorSelect,
  logUserInfoSelect,
  roomSelect,
  scheduleExamSelect,
  sectionSelect,
  subjectSelect,
} from "./model";
import { createStyle } from "../utils/excel";

const prisma = new PrismaClient({ errorFormat: "minimal" });

const select = {
  ...logUserInfoSelect,
  ...scheduleExamSelect,
  exam: {
    select: {
      ...examSelect,
      room: {
        select: {
          ...roomSelect,
          building: { select: buildingSelect },
        },
      },
      section: {
        select: {
          ...sectionSelect,
          subject: { select: subjectSelect },
          group: { select: groupSelect },
        },
      },
      instructor: { select: instructorSelect },
    },
  },
} satisfies Prisma.SchedulerExamSelect;

export async function exportScheduleExam(
  req: FastifyRequest<{
    Querystring: {
      year: number;
      semester: number;
      midtermDate: string;
      finalDate: string;
    };
  }>,
  res: FastifyReply,
) {
  let wb = new xl.Workbook({ defaultFont: { name: "AngsanaUPC", size: 12 } });

  let ws = wb.addWorksheet("Exam", {
    pageSetup: {
      paperSize: "A4_PAPER",
      orientation: "portrait",
    },
    margins: { top: 0.1, bottom: 0.1, left: 0.1, right: 0.1 },
    printOptions: { centerHorizontal: true },
  });

  const { alignCenter, alignTopLeft, border } = createStyle(wb);

  for (let i = 1; i <= 5; i++) ws.column(i).setWidth(30);

  const columnStyle = { ...alignCenter, ...border };
  ws.cell(1, 1).string("วิชา").style(columnStyle);
  ws.cell(1, 2).string("กลุ่มเรียน").style(columnStyle);
  ws.cell(1, 3).string("กลางภาค").style(columnStyle);
  ws.cell(1, 4).string("ปลายภาค").style(columnStyle);
  ws.cell(1, 5).string("ห้องสอบ").style(columnStyle);
  ws.cell(1, 6).string("ผู้คุมสอบ").style(columnStyle);
  const data = await prisma.schedulerExam.findMany({
    select: select,
    where: { createdByUserId: req.user.id },
  });
  const mid = new Date(req.query.midtermDate);
  const final = new Date(req.query.finalDate);
  const tsDay = 86400000;

  data.forEach((v, i) => {
    const subjectCode = v.exam.section[0].subject.code;
    const subjectName = v.exam.section[0].subject.name;
    const offsetWeekday = tsDay * weekdayNum[v.weekday];
    const midtermWeekday = new Date(mid.getTime() + offsetWeekday);
    const finalWeekday = new Date(final.getTime() + offsetWeekday);
    const alignTopLeftWithBorder = { ...alignTopLeft, ...border };

    ws.cell(2 + i, 1)
      .string(`${subjectCode} ${subjectName}`)
      .style(alignTopLeftWithBorder);
    ws.cell(2 + i, 2)
      .string(`SEC_${v.exam.section.map((v) => v.no).join(", ")}`)
      .style(alignTopLeftWithBorder);
    ws.cell(2 + i, 3)
      .string(
        `${midtermWeekday.getDate()} ${
          thaiMonthName[midtermWeekday.getMonth()]
        } ${midtermWeekday.getFullYear()}\n` +
          (8 +
            Math.floor((v.start - 1) / 4) +
            ":" +
            ["00", "15", "30", "45"][(v.start - 1) % 4] +
            " น.") +
          " - " +
          (8 +
            Math.floor(v.end / 4) +
            ":" +
            ["00", "15", "30", "45"][v.end % 4]) +
          " น.",
      )
      .style(alignTopLeftWithBorder);
    ws.cell(2 + i, 4)
      .string(
        `${finalWeekday.getDate()} ${
          thaiMonthName[finalWeekday.getMonth()]
        } ${finalWeekday.getFullYear()}\n` +
          (8 +
            Math.floor((v.start - 1) / 4) +
            ":" +
            ["00", "15", "30", "45"][(v.start - 1) % 4] +
            " น.") +
          " - " +
          (8 +
            Math.floor(v.end / 4) +
            ":" +
            ["00", "15", "30", "45"][v.end % 4]) +
          " น.",
      )
      .style(alignTopLeftWithBorder);
    ws.cell(2 + i, 5)
      .string(
        `${v.exam.room?.building.code || ""}"-"${v.exam.room?.name || ""}`,
      )
      .style(alignTopLeftWithBorder);
    ws.cell(2 + i, 6)
      .string(v.exam.instructor.map((inst) => inst.name).join("\n"))
      .style(alignTopLeftWithBorder);
  });

  const buffer = await wb.writeToBuffer();

  res.type("application/vnd.ms-excel").send(buffer);
}
