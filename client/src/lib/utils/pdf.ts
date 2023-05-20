import { jsPDF } from 'jspdf';
import THSarabun from '$lib/fonts/th-sarabun';

function vAlignTextCenter(height: number, doc: jsPDF) {
  return height * 0.5 + (doc.getLineHeight() / doc.internal.scaleFactor) * 0.275;
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
    x + schedule.colHeaderWidth + schedule.colWidth * 7 + schedule.colWidth / 2,
    y,
    x + schedule.colHeaderWidth + schedule.colWidth * 7 + schedule.colWidth / 2,
    y + h - rowHeight,
  );
  doc.text(
    'ที่',
    x + schedule.colHeaderWidth + schedule.colWidth * 7 + schedule.colWidth / 4,
    y + vAlignTextCenter(options.rowHeaderHeight, doc),
    {
      align: 'center',
    },
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 10,
    y,
    x + schedule.colHeaderWidth + schedule.colWidth * 10,
    y + h - rowHeight,
  );
  doc.text(
    'รหัสวิชา',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 7 +
      schedule.colWidth / 4 +
      (schedule.colWidth * 3) / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc),
    {
      align: 'center',
    },
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 16,
    y,
    x + schedule.colHeaderWidth + schedule.colWidth * 16,
    y + h,
  );
  doc.text(
    'ชื่อวิชา',
    x + schedule.colHeaderWidth + schedule.colWidth * 10 + (schedule.colWidth * 6) / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc),
    {
      align: 'center',
    },
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 18 + schedule.colWidth / 2,
    y,
    x + schedule.colHeaderWidth + schedule.colWidth * 18 + schedule.colWidth / 2,
    y + h,
  );
  doc.text(
    'สภาพวิชา',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 16 +
      (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc),
    {
      align: 'center',
    },
  );
  doc.text(
    'รวม',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 16 +
      (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
    y + vAlignTextCenter(rowHeight, doc) + rowHeight * 12 + options.rowHeaderHeight,
    {
      align: 'center',
    },
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 19 + schedule.colWidth / 2,
    y,
    x + schedule.colHeaderWidth + schedule.colWidth * 19 + schedule.colWidth / 2,
    y + h,
  );
  doc.text(
    'หน่วยกิต',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 18 +
      schedule.colWidth / 4 +
      (schedule.colWidth * 1 + schedule.colWidth / 2) / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc),
    {
      align: 'center',
    },
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 21,
    y,
    x + schedule.colHeaderWidth + schedule.colWidth * 21,
    y + h,
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 19 + schedule.colWidth / 2,
    y + rowHeight + 1,
    x + schedule.colHeaderWidth + schedule.colWidth * 25,
    y + rowHeight + 1,
  );
  doc.text(
    'เวลาเรียน',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 19 +
      (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) - rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 20,
    y + rowHeight + 1,
    x + schedule.colHeaderWidth + schedule.colWidth * 20,
    y + h,
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 20 + schedule.colWidth / 2,
    y + rowHeight + 1,
    x + schedule.colHeaderWidth + schedule.colWidth * 20 + schedule.colWidth / 2,
    y + h,
  );
  doc.text(
    'ท',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 18 +
      schedule.colWidth / 2 +
      (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) + rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.text(
    'ป',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 19 +
      (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) + rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.text(
    'ร',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 19 +
      schedule.colWidth / 2 +
      (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) + rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.text(
    'จำนวนชั่วโมง/สัปดาห์',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 20 +
      schedule.colWidth / 2 +
      schedule.colWidth / 4 +
      (schedule.colWidth * 4 + schedule.colWidth / 2) / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) - rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 23,
    y + rowHeight + 1,
    x + schedule.colHeaderWidth + schedule.colWidth * 23,
    y + h,
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 23 + schedule.colWidth / 2,
    y + rowHeight + 1,
    x + schedule.colHeaderWidth + schedule.colWidth * 23 + schedule.colWidth / 2,
    y + h,
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 24,
    y + rowHeight + 1,
    x + schedule.colHeaderWidth + schedule.colWidth * 24,
    y + h,
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 24 + schedule.colWidth / 2,
    y + rowHeight + 1,
    x + schedule.colHeaderWidth + schedule.colWidth * 24 + schedule.colWidth / 2,
    y + h,
  );
  doc.text(
    'กลุ่มเรียน',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 20 +
      schedule.colWidth / 2 +
      schedule.colWidth / 4 +
      (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) + rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.text(
    'เช้า',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 22 +
      (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) + rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.text(
    'บ่าย',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 22 +
      schedule.colWidth / 2 +
      (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) + rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.text(
    'สมทบ',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 23 +
      (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) + rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.text(
    'รวม',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 23 +
      schedule.colWidth / 2 +
      (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) + rowHeight / 2,
    {
      align: 'center',
    },
  );

  doc.setFontSize(sourceSetting.fontSize);
  doc.setLineWidth(sourceSetting.lineWidth);

  const listDetail: {
    code: string;
    name: string;
    credit: number;
    lecture: number;
    lab: number;
    learn: number;
    type: string;
    sec: number;
    alt?: string;
  }[] = [];

  return {
    addDetail: () => {
      listDetail.push(
        {
          code: 'ENGCE101',
          name: 'Computer Programming 1',
          credit: 3,
          lecture: 2,
          lab: 3,
          learn: 5,
          type: 'บังคับ',
          sec: 1,
          alt: '2, 3, 4',
        },
        {
          code: 'ENGCE102',
          name: 'Computer Programming 2',
          credit: 3,
          lecture: 2,
          lab: 3,
          learn: 5,
          type: 'บังคับ',
          sec: 1,
          alt: '2, 3, 4',
        },
      );
    },
    renderDetail: () => {
      doc.setFontSize(options.fontSize - 1);
      doc.setLineWidth(options.borderWidth);

      listDetail.forEach((detail, idx) => {
        doc.text(
          (idx + 1).toString(),
          x + schedule.colHeaderWidth + schedule.colWidth * 7 + schedule.colWidth / 4,
          y + options.rowHeaderHeight + rowHeight * idx + vAlignTextCenter(rowHeight, doc),
          {
            align: 'center',
          },
        );
        doc.text(
          detail.code,
          x +
            schedule.colHeaderWidth +
            schedule.colWidth * 7 +
            schedule.colWidth / 2 +
            schedule.colWidth / 10,
          y + options.rowHeaderHeight + rowHeight * idx + vAlignTextCenter(rowHeight, doc),
        );
        doc.text(
          detail.name,
          x + schedule.colHeaderWidth + schedule.colWidth * 10 + schedule.colWidth / 10,
          y + options.rowHeaderHeight + rowHeight * idx + vAlignTextCenter(rowHeight, doc),
        );
        doc.text(
          detail.type,
          x +
            schedule.colHeaderWidth +
            schedule.colWidth * 16 +
            (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
          y + options.rowHeaderHeight + rowHeight * idx + vAlignTextCenter(rowHeight, doc),
          {
            align: 'center',
          },
        );
        doc.text(
          detail.credit.toString(),
          x +
            schedule.colHeaderWidth +
            schedule.colWidth * 18 +
            schedule.colWidth / 4 +
            (schedule.colWidth * 1 + schedule.colWidth / 2) / 2,
          y + options.rowHeaderHeight + rowHeight * idx + vAlignTextCenter(rowHeight, doc),
          {
            align: 'center',
          },
        );
        doc.text(
          detail.lecture.toString(),
          x +
            schedule.colHeaderWidth +
            schedule.colWidth * 18 +
            schedule.colWidth / 2 +
            (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
          y + options.rowHeaderHeight + rowHeight * idx + vAlignTextCenter(rowHeight, doc),
          {
            align: 'center',
          },
        );
        doc.text(
          detail.lab.toString(),
          x +
            schedule.colHeaderWidth +
            schedule.colWidth * 19 +
            (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
          y + options.rowHeaderHeight + rowHeight * idx + vAlignTextCenter(rowHeight, doc),
          {
            align: 'center',
          },
        );
        doc.text(
          detail.learn.toString(),
          x +
            schedule.colHeaderWidth +
            schedule.colWidth * 19 +
            schedule.colWidth / 2 +
            (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
          y + options.rowHeaderHeight + rowHeight * idx + vAlignTextCenter(rowHeight, doc),
          {
            align: 'center',
          },
        );
      });

      const totalCredit = listDetail.reduce<number>((acc, detail) => (acc += detail.credit), 0);
      const totalLecture = listDetail.reduce<number>((acc, detail) => (acc += detail.lecture), 0);
      const totalLab = listDetail.reduce<number>((acc, detail) => (acc += detail.lab), 0);
      const totalLearn = listDetail.reduce<number>((acc, detail) => (acc += detail.learn), 0);

      doc.text(
        totalCredit.toString(),
        x +
          schedule.colHeaderWidth +
          schedule.colWidth * 18 +
          schedule.colWidth / 4 +
          (schedule.colWidth * 1 + schedule.colWidth / 2) / 2,
        y + vAlignTextCenter(rowHeight, doc) + rowHeight * 12 + options.rowHeaderHeight,
        {
          align: 'center',
        },
      );
      doc.text(
        totalLecture.toString(),
        x +
          schedule.colHeaderWidth +
          schedule.colWidth * 18 +
          schedule.colWidth / 2 +
          (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
        y + vAlignTextCenter(rowHeight, doc) + rowHeight * 12 + options.rowHeaderHeight,
        {
          align: 'center',
        },
      );
      doc.text(
        totalLab.toString(),
        x +
          schedule.colHeaderWidth +
          schedule.colWidth * 19 +
          (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
        y + vAlignTextCenter(rowHeight, doc) + rowHeight * 12 + options.rowHeaderHeight,
        {
          align: 'center',
        },
      );
      doc.text(
        totalLearn.toString(),
        x +
          schedule.colHeaderWidth +
          schedule.colWidth * 19 +
          schedule.colWidth / 2 +
          (schedule.colWidth * 2 + schedule.colWidth / 2) / 2,
        y + vAlignTextCenter(rowHeight, doc) + rowHeight * 12 + options.rowHeaderHeight,
        {
          align: 'center',
        },
      );

      doc.setFontSize(sourceSetting.fontSize);
      doc.setLineWidth(sourceSetting.lineWidth);
    },
  };
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
          alt?: string;
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
      rowHeaderHeight: 14,
    },
    {
      ...schedule,
    },
  );

  detail.addDetail();
  detail.renderDetail();

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
      rowHeaderHeight: 14,
    },
    {
      ...schedule,
    },
  );

  detail.addDetail();
  detail.renderDetail();

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
