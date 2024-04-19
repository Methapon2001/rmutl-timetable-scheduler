import { Workbook } from "excel4node";

export function createStyle(wb: Workbook) {
  return {
    alignCenter: wb.createStyle({
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
    }),
    alignTopLeft: wb.createStyle({
      alignment: {
        wrapText: true,
        vertical: "top",
        horizontal: "left",
      },
    }),
    border: wb.createStyle({
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      },
    }),
  };
}

export function createWorksheetLayout(wb: Workbook, title: string) {
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

  const { alignCenter, border } = createStyle(wb);

  ws.cell(1, 1, 17, 53, false).style({
    alignment: { vertical: "center" },
    ...border,
  });

  ws.cell(1, 1, 15, 14, true)
    .string([
      { bold: true, size: Math.min(Math.round((48 * 13) / title.length)) },
      title,
    ])
    .style(alignCenter);

  ws.cell(1, 15, 2, 15, true).string("ที่").style(alignCenter);
  ws.cell(1, 16, 2, 19, true).string("รหัสวิชา").style(alignCenter);
  ws.cell(1, 20, 2, 31, true).string("ชื่อวิชา").style(alignCenter);
  ws.cell(1, 32, 1, 34, true).string("หน่วยกิต").style(alignCenter);
  ws.cell(2, 32).string("ท").style(alignCenter);
  ws.cell(2, 33).string("ป").style(alignCenter);
  ws.cell(2, 34).string("ร").style(alignCenter);
  ws.cell(1, 35, 2, 43, true).string("กลุ่มเรียน").style(alignCenter);
  ws.cell(1, 44, 2, 45, true).string("ระดับ").style(alignCenter);
  ws.cell(1, 46, 2, 47, true).string("ภาค").style(alignCenter);
  ws.cell(1, 48, 1, 50, true).string("จำนวนชม.").style(alignCenter);
  ws.cell(2, 48).string("ท").style(alignCenter);
  ws.cell(2, 49).string("ป").style(alignCenter);
  ws.cell(2, 50).string("ร").style(alignCenter);
  ws.cell(1, 51, 2, 53, true).string("หมายเหตุ").style(alignCenter);
  for (let i = 3; i <= 14; i++) {
    ws.cell(i, 15)
      .style(alignCenter)
      .number(i - 2);
    ws.cell(i, 16, i, 19, true);
    ws.cell(i, 20, i, 31, true);
    ws.cell(i, 35, i, 43, true);
    ws.cell(i, 44, i, 45, true);
    ws.cell(i, 46, i, 47, true);
    ws.cell(i, 51, i, 53, true);
  }
  ws.cell(15, 15, 15, 31, true).string("รวม").style(alignCenter);
  ws.cell(15, 35, 15, 47, true).string("รวม").style(alignCenter);
  ws.cell(15, 51, 15, 53, true);
  ws.cell(16, 1, 16, 3, true)
    .string("เวลา")
    .style({ alignment: { horizontal: "right" } });
  ws.cell(17, 1, 17, 3, true)
    .string("คาบ")
    .style({ alignment: { horizontal: "left" } });

  let period = 1;
  for (let i = 4; i <= 53; i = i + 2) {
    ws.cell(16, i, 16, i + 1, true)
      .number(period)
      .style({ alignment: { horizontal: "center" } });
    ws.cell(17, i, 17, i + 1, true)
      .string(
        `${8 + Math.floor((period - 1) / 2)}:${
          (period - 1) % 2 === 0 ? "0" : "3"
        }0-${8 + Math.floor(period / 2)}:${period % 2 === 0 ? "0" : "3"}0`,
      )
      .style({
        alignment: { horizontal: "center" },
        font: { size: 9 },
      });
    period++;
  }

  return { ws, alignCenter, border };
}
