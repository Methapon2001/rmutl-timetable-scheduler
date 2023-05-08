import { jsPDF } from 'jspdf';
import THSarabun from '$lib/fonts/th-sarabun';

function vAlignTextCenter(height: number, doc: jsPDF) {
  return height * 0.5 + (doc.getLineHeight() / doc.internal.scaleFactor) * 0.225;
}

export function drawDetailTable(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  options: {
    period: number;
    fontSize: number;
    borderWidth: number;
    rowHeaderHeight: number;
  },
  schedule: {
    rowHeaderHeight: number;
    rowHeight: number;
    colHeaderWidth: number;
    colWidth: number;
  },
) {
  const sourceSetting = {
    fontSize: doc.getFontSize(),
    lineWidth: doc.getLineWidth(),
  };

  doc.setFontSize(options.fontSize);
  doc.setLineWidth(options.borderWidth);

  doc.rect(x, y, w, h);
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 7,
    y + options.rowHeaderHeight,
    x + w,
    y + options.rowHeaderHeight,
  );

  const rowHeight = (h - options.rowHeaderHeight) / 13;

  for (let i = 1; i <= 13; i++) {
    doc.line(
      x + schedule.colHeaderWidth + schedule.colWidth * 7,
      y + i * rowHeight + options.rowHeaderHeight,
      x + w,
      y + i * rowHeight + options.rowHeaderHeight,
    );
  }

  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 7,
    y,
    x + schedule.colHeaderWidth + schedule.colWidth * 7,
    y + h,
  );

  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 16,
    y,
    x + schedule.colHeaderWidth + schedule.colWidth * 16,
    y + h,
  );

  doc.setFontSize(sourceSetting.fontSize);
  doc.setLineWidth(sourceSetting.lineWidth);
}

export function drawSchedule(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  options: {
    period: number;
    fontSize: number;
    borderWidth: number;
    rowHeaderHeight: number;
    colHeaderWidth: number;
  },
) {
  const sourceSetting = {
    fontSize: doc.getFontSize(),
    lineWidth: doc.getLineWidth(),
  };

  doc.setFontSize(options.fontSize);
  doc.setLineWidth(options.borderWidth);

  doc.rect(x, y, w, h);
  doc.line(x, y + options.rowHeaderHeight, x + w, y + options.rowHeaderHeight);
  doc.line(
    x + options.colHeaderWidth,
    y + options.rowHeaderHeight / 2,
    x + w,
    y + options.rowHeaderHeight / 2,
  );

  const weekday = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

  const rowHeight = (h - options.rowHeaderHeight) / 7;
  const colWidth = (w - options.colHeaderWidth) / options.period;

  for (let i = 1; i <= 7; i++) {
    doc.text(
      weekday[i - 1],
      x + options.colHeaderWidth / 2,
      y + options.rowHeaderHeight + (i - 1) * rowHeight + vAlignTextCenter(rowHeight, doc),
      {
        align: 'center',
      },
    );

    doc.line(
      x,
      y + i * rowHeight + options.rowHeaderHeight,
      x + w,
      y + i * rowHeight + options.rowHeaderHeight,
    );
  }

  doc.line(x + options.colHeaderWidth, y, x + options.colHeaderWidth, y + h);

  for (let i = 1; i <= options.period; i++) {
    doc.text(
      String(i),
      x + options.colHeaderWidth + colWidth * i - colWidth / 2,
      y + vAlignTextCenter(options.rowHeaderHeight / 2, doc),
      { align: 'center' },
    );
    doc.setFontSize(options.fontSize - 4);

    doc.text(
      String(
        `${8 + Math.floor(i / 2)}:${i % 2 === 0 ? '0' : '3'}0-${8 + Math.floor((i + 1) / 2)}:${
          (i + 1) % 2 === 0 ? '0' : '3'
        }0`,
      ),
      x + options.colHeaderWidth + colWidth * i - colWidth / 2,
      y + options.rowHeaderHeight / 2 + vAlignTextCenter(options.rowHeaderHeight / 2, doc),
      { align: 'center' },
    );

    doc.setFontSize(options.fontSize);

    doc.line(
      x + options.colHeaderWidth + colWidth * i,
      y,
      x + options.colHeaderWidth + colWidth * i,
      y + h,
    );
  }

  doc.setFontSize(sourceSetting.fontSize);
  doc.setLineWidth(sourceSetting.lineWidth);

  const scheduleAnchor = [x + options.colHeaderWidth, y + options.rowHeaderHeight];

  return {
    colHeaderWidth: options.colHeaderWidth,
    rowHeaderHeight: options.rowHeaderHeight,
    colWidth: colWidth,
    rowHeight: rowHeight,
    assignSchedule: (
      day: number,
      period: number[],
      subject: {
        code: string;
        name: string;
        section: {
          type: 'lecture' | 'lab';
          no: number;
          lab: number | null;
        };
      },
      overlap?: number,
      offset?: number,
    ) => {
      const sourceSetting = {
        fontSize: doc.getFontSize(),
        lineWidth: doc.getLineWidth(),
      };

      doc.setFontSize(options.fontSize - 2);
      doc.setLineWidth(options.borderWidth);

      doc.setFillColor(200, 200, 255);

      const cords = [
        scheduleAnchor[0] + colWidth * (period[0] - 1),
        scheduleAnchor[1] +
          rowHeight * (day - 1) +
          (overlap && offset ? (rowHeight * offset) / overlap : 0),
        (period[1] - period[0] + 1) * colWidth,
        (day * rowHeight) / (overlap ?? 1),
      ];

      doc.rect(cords[0], cords[1], cords[2], cords[3], 'F');
      doc.rect(cords[0], cords[1], cords[2], cords[3]);

      if (!overlap) {
        doc.text(
          `${subject.code}_SEC${subject.section.no}${
            subject.section.type === 'lab' ? '_L' + subject.section.lab : ''
          }`,
          cords[0] + cords[2] / 2,
          cords[1] + vAlignTextCenter(cords[3] / 2, doc) + cords[3] / 10,
          {
            align: 'center',
          },
        );
      }

      doc.text(
        subject.name,
        cords[0] + cords[2] / 2,
        cords[1] +
          (overlap ? 0 : cords[3] / 2) +
          vAlignTextCenter(overlap ? cords[3] : cords[3] / 2, doc) -
          (overlap ? 0 : cords[3] / 10),
        {
          align: 'center',
        },
      );

      doc.setFontSize(sourceSetting.fontSize);
      doc.setLineWidth(sourceSetting.lineWidth);
    },
  };
}

export function openTemplate() {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
  });

  doc.setProperties({
    title: 'Schedule',
    author: 'rmutl-timetable-scheduler',
  });

  doc.addFileToVFS('THSarabun.ttf', THSarabun);
  doc.addFont('THSarabun.ttf', 'THSarabun', 'normal');
  doc.setFont('THSarabun');

  const { width: pageWidth, height: pageHeight } = doc.internal.pageSize;

  const pageGap = 3;

  let schedule: ReturnType<typeof drawSchedule>;
  let detail: ReturnType<typeof drawDetailTable>;

  schedule = drawSchedule(doc, pageGap, 100, pageWidth - pageGap * 2, pageHeight - 100 - pageGap, {
    period: 25,
    fontSize: 12,
    borderWidth: 0.3,
    colHeaderWidth: 15,
    rowHeaderHeight: 12,
  });

  detail = drawDetailTable(
    doc,
    pageGap,
    pageGap,
    pageWidth - pageGap * 2,
    100 - pageGap,
    {
      period: 25,
      fontSize: 12,
      borderWidth: 0.3,
      rowHeaderHeight: 9.7,
    },
    {
      ...schedule,
    },
  );

  schedule.assignSchedule(
    1,
    [5, 8],
    {
      code: 'ENGCE101',
      name: 'Computer Programming',
      section: {
        type: 'lecture',
        no: 1,
        lab: null,
      },
    },
    2,
    0,
  );
  schedule.assignSchedule(
    1,
    [3, 6],
    {
      code: 'ENGCE101',
      name: 'Computer Programming',
      section: {
        type: 'lecture',
        no: 1,
        lab: null,
      },
    },
    2,
    1,
  );

  doc.addPage();

  schedule = drawSchedule(doc, pageGap, 100, pageWidth - pageGap * 2, pageHeight - 100 - pageGap, {
    period: 25,
    fontSize: 12,
    borderWidth: 0.3,
    colHeaderWidth: 15,
    rowHeaderHeight: 12,
  });

  detail = drawDetailTable(
    doc,
    pageGap,
    pageGap,
    pageWidth - pageGap * 2,
    100 - pageGap,
    {
      period: 25,
      fontSize: 12,
      borderWidth: 0.3,
      rowHeaderHeight: 9.7,
    },
    {
      ...schedule,
    },
  );

  schedule.assignSchedule(1, [1, 4], {
    code: 'ENGCE101',
    name: 'Computer Programming',
    section: {
      type: 'lecture',
      no: 1,
      lab: null,
    },
  });
  doc.output('dataurlnewwindow');
}
