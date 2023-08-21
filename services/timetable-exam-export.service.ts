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

export async function exportScheduleExam(
  req: FastifyRequest<{
    Querystring: {
      year: number;
      semester: number;
      midtermDate: string;
      finalDate: string;
    };
  }>,
  res: FastifyReply
) {
  const data = await prisma.schedulerExam.findMany({
    select: schedulerExamSelect,
    where: {
      createdByUserId: req.user.id,
    },
  });

  console.log(req.query.year, req.query.semester);
  console.log(req.query.midtermDate, req.query.finalDate);

  let wb = new xl.Workbook({
    defaultFont: {
      name: "AngsanaUPC",
      size: 12,
    },
  });

  let ws = wb.addWorksheet("Exam", {
    pageSetup: {
      paperSize: "A4_PAPER",
      orientation: "portrait",
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

  const styleCenter = wb.createStyle({
    alignment: {
      horizontal: "center",
      vertical: "center",
    },
  });

  const styleTopLeft = wb.createStyle({
    alignment: {
      wrapText: true,
      vertical: "top",
      horizontal: "left",
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

  ws.column(1).setWidth(30);
  ws.column(2).setWidth(30);
  ws.column(3).setWidth(30);
  ws.column(4).setWidth(30);
  ws.column(5).setWidth(30);
  ws.cell(1, 1)
    .string("วิชา")
    .style({
      ...styleCenter,
      ...styleBorder,
    });
  ws.cell(1, 2)
    .string("กลางภาค")
    .style({
      ...styleCenter,
      ...styleBorder,
    });
  ws.cell(1, 3)
    .string("ปลายภาค")
    .style({
      ...styleCenter,
      ...styleBorder,
    });
  ws.cell(1, 4)
    .string("ห้องสอบ")
    .style({
      ...styleCenter,
      ...styleBorder,
    });
  ws.cell(1, 5)
    .string("ผู้คุมสอบ")
    .style({
      ...styleCenter,
      ...styleBorder,
    });

  const midtermDate = new Date();
  const finalDate = new Date();
  const timestampDay = 86400000;

  const weekdayMapNum = {
    mon: 0,
    tue: 1,
    wed: 2,
    thu: 3,
    fri: 4,
    sat: 5,
    sun: 6,
  };

  const monthName = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];

  data.forEach((val, idx) => {
    ws.cell(2 + idx, 1)
      .string(
        val.exam.section[0].subject.code +
          " " +
          val.exam.section[0].subject.name
      )
      .style({
        ...styleTopLeft,
        ...styleBorder,
      });

    ws.cell(2 + idx, 2)
      .string(
        new Date(
          midtermDate.getTime() + timestampDay * weekdayMapNum[val.weekday]
        ).getDate() +
          " " +
          monthName[
            new Date(
              midtermDate.getTime() + timestampDay * weekdayMapNum[val.weekday]
            ).getMonth()
          ] +
          " " +
          new Date(
            midtermDate.getTime() + timestampDay * weekdayMapNum[val.weekday]
          ).getFullYear() +
          "\n" +
          (8 +
            Math.floor((val.start - 1) / 4) +
            ":" +
            ["00", "15", "30", "45"][(val.start - 1) % 4] +
            " น.") +
          " - " +
          (8 +
            Math.floor(val.end / 4) +
            ":" +
            ["00", "15", "30", "45"][(val.end) % 4]) +
          " น."
      )
      .style({
        ...styleTopLeft,
        ...styleBorder,
      });
    ws.cell(2 + idx, 3)
      .string(
        new Date(
          finalDate.getTime() + timestampDay * weekdayMapNum[val.weekday]
        ).getDate() +
          " " +
          monthName[
            new Date(
              finalDate.getTime() + timestampDay * weekdayMapNum[val.weekday]
            ).getMonth()
          ] +
          " " +
          new Date(
            finalDate.getTime() + timestampDay * weekdayMapNum[val.weekday]
          ).getFullYear() +
          "\n" +
          (8 +
            Math.floor((val.start - 1) / 4) +
            ":" +
            ["00", "15", "30", "45"][(val.start - 1) % 4] +
            " น.") +
          " - " +
          (8 +
            Math.floor(val.end / 4) +
            ":" +
            ["00", "15", "30", "45"][(val.end) % 4]) +
          " น."
      )
      .style({
        ...styleTopLeft,
        ...styleBorder,
      });
    ws.cell(2 + idx, 4)
      .string(val.exam.room?.building.code + "-" + val.exam.room?.name)
      .style({
        ...styleTopLeft,
        ...styleBorder,
      });
    ws.cell(2 + idx, 5)
      .string(val.exam.instructor.map((inst) => inst.name).join("\n"))
      .style({
        ...styleTopLeft,
        ...styleBorder,
      });
  });

  const buffer = await wb.writeToBuffer();

  res.type("application/vnd.ms-excel").send(buffer);
}
