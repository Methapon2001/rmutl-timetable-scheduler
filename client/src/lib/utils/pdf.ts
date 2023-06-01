import { jsPDF } from 'jspdf';
import THSarabun from '$lib/fonts/th-sarabun';
import type { ProcessedOverlapReturnType } from './table';

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
    x + schedule.colHeaderWidth + schedule.colWidth * 5 + schedule.colWidth / 2,
    y + options.rowHeaderHeight,
    x + w,
    y + options.rowHeaderHeight,
  );

  const rowHeight = (h - options.rowHeaderHeight) / 13;

  for (let i = 1; i <= 13; i++) {
    doc.line(
      x + schedule.colHeaderWidth + schedule.colWidth * 5 + schedule.colWidth / 2,
      y + i * rowHeight + options.rowHeaderHeight,
      x + w,
      y + i * rowHeight + options.rowHeaderHeight,
    );
  }

  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 5 + schedule.colWidth / 2,
    y,
    x + schedule.colHeaderWidth + schedule.colWidth * 5 + schedule.colWidth / 2,
    y + h,
  );

  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 6,
    y,
    x + schedule.colHeaderWidth + schedule.colWidth * 6,
    y + h - rowHeight,
  );
  doc.text(
    'ที่',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 5 +
      schedule.colWidth / 2 +
      schedule.colWidth / 4,
    y + vAlignTextCenter(options.rowHeaderHeight, doc),
    {
      align: 'center',
    },
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 8,
    y,
    x + schedule.colHeaderWidth + schedule.colWidth * 8,
    y + h,
  );
  doc.text(
    'รหัสวิชา',
    x + schedule.colHeaderWidth + schedule.colWidth * 7,
    y + vAlignTextCenter(options.rowHeaderHeight, doc),
    {
      align: 'center',
    },
  );
  doc.text(
    'รวม',
    x + schedule.colHeaderWidth + schedule.colWidth * 8 + (schedule.colWidth * 6) / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) + rowHeight * 13 + rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 14,
    y,
    x + schedule.colHeaderWidth + schedule.colWidth * 14,
    y + h,
  );
  doc.text(
    'ชื่อวิชา',
    x + schedule.colHeaderWidth + schedule.colWidth * 8 + (schedule.colWidth * 6) / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc),
    {
      align: 'center',
    },
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 14,
    y + rowHeight + 1,
    x + schedule.colHeaderWidth + schedule.colWidth * 15 + schedule.colWidth / 2,
    y + rowHeight + 1,
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 14 + schedule.colWidth / 2,
    y + rowHeight + 1,
    x + schedule.colHeaderWidth + schedule.colWidth * 14 + schedule.colWidth / 2,
    y + h,
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 15,
    y + rowHeight + 1,
    x + schedule.colHeaderWidth + schedule.colWidth * 15,
    y + h,
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 15 + schedule.colWidth / 2,
    y,
    x + schedule.colHeaderWidth + schedule.colWidth * 15 + schedule.colWidth / 2,
    y + h,
  );
  doc.text(
    'หน่วยกิต',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 14 +
      schedule.colWidth / 2 +
      schedule.colWidth / 4,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) - rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.text(
    'ท',
    x + schedule.colHeaderWidth + schedule.colWidth * 14 + schedule.colWidth / 4,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) + rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.text(
    'ป',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 14 +
      schedule.colWidth / 2 +
      schedule.colWidth / 4,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) + rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.text(
    'ร',
    x + schedule.colHeaderWidth + schedule.colWidth * 15 + schedule.colWidth / 4,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) + rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 20,
    y,
    x + schedule.colHeaderWidth + schedule.colWidth * 20,
    y + h,
  );
  doc.text(
    'กลุ่มเรียน',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 17 +
      schedule.colWidth / 2 +
      schedule.colWidth / 4,
    y + vAlignTextCenter(options.rowHeaderHeight, doc),
    {
      align: 'center',
    },
  );
  doc.text(
    'รวม',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 15 +
      (schedule.colWidth * 5 + schedule.colWidth / 2) / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) + rowHeight * 13 + rowHeight / 2,
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
  doc.text(
    'ระดับ',
    x + schedule.colHeaderWidth + schedule.colWidth * 20 + schedule.colWidth / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc),
    {
      align: 'center',
    },
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 22,
    y,
    x + schedule.colHeaderWidth + schedule.colWidth * 22,
    y + h,
  );
  doc.text(
    'ภาค',
    x + schedule.colHeaderWidth + schedule.colWidth * 21 + schedule.colWidth / 2,
    y + vAlignTextCenter(options.rowHeaderHeight, doc),
    {
      align: 'center',
    },
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 22,
    y,
    x + schedule.colHeaderWidth + schedule.colWidth * 22,
    y + h,
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 22 + schedule.colWidth / 2,
    y + rowHeight + 1,
    x + schedule.colHeaderWidth + schedule.colWidth * 22 + schedule.colWidth / 2,
    y + h,
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 23,
    y + rowHeight + 1,
    x + schedule.colHeaderWidth + schedule.colWidth * 23,
    y + h,
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 23 + schedule.colWidth / 2,
    y,
    x + schedule.colHeaderWidth + schedule.colWidth * 23 + schedule.colWidth / 2,
    y + h,
  );
  doc.line(
    x + schedule.colHeaderWidth + schedule.colWidth * 22,
    y + rowHeight + 1,
    x + schedule.colHeaderWidth + schedule.colWidth * 23 + schedule.colWidth / 2,
    y + rowHeight + 1,
  );
  doc.text(
    'จำนวนชม.',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 22 +
      schedule.colWidth / 2 +
      schedule.colWidth / 4,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) - rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.text(
    'ท',
    x + schedule.colHeaderWidth + schedule.colWidth * 22 + schedule.colWidth / 4,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) + rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.text(
    'ป',
    x +
      schedule.colHeaderWidth +
      schedule.colWidth * 22 +
      schedule.colWidth / 2 +
      schedule.colWidth / 4,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) + rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.text(
    'ร',
    x + schedule.colHeaderWidth + schedule.colWidth * 23 + schedule.colWidth / 4,
    y + vAlignTextCenter(options.rowHeaderHeight, doc) + rowHeight / 2,
    {
      align: 'center',
    },
  );
  doc.text(
    'หมายเหตุ',
    x + schedule.colHeaderWidth + schedule.colWidth * 24 + schedule.colWidth / 4,
    y + vAlignTextCenter(options.rowHeaderHeight, doc),
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
    setHeader: (title: string) => {
      doc.text(
        title,
        x + (schedule.colHeaderWidth + schedule.colWidth * 5 + schedule.colWidth / 2) / 2,
        y + vAlignTextCenter(options.rowHeaderHeight + rowHeight * 13, doc),
        {
          align: 'center',
        },
      );
    },
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
          x +
            schedule.colHeaderWidth +
            schedule.colWidth * 5 +
            schedule.colWidth / 2 +
            schedule.colWidth / 4,
          y + options.rowHeaderHeight + rowHeight * idx + vAlignTextCenter(rowHeight, doc),
          {
            align: 'center',
          },
        );
        doc.text(
          detail.code,
          x + schedule.colHeaderWidth + schedule.colWidth * 6 + (schedule.colWidth * 2) / 2,
          y + options.rowHeaderHeight + rowHeight * idx + vAlignTextCenter(rowHeight, doc),
          {
            align: 'center',
          },
        );
        doc.text(
          detail.name,
          x + schedule.colHeaderWidth + schedule.colWidth * 8 + schedule.colWidth / 10,
          y + options.rowHeaderHeight + rowHeight * idx + vAlignTextCenter(rowHeight, doc),
        );
        // doc.text(
        //   detail.credit.toString(),
        //   x +
        //     schedule.colHeaderWidth +
        //     schedule.colWidth * 14 +
        //     schedule.colWidth / 4,
        //   y + options.rowHeaderHeight + rowHeight * idx + vAlignTextCenter(rowHeight, doc),
        //   {
        //     align: 'center',
        //   },
        // );
        doc.text(
          detail.lecture.toString(),
          x + schedule.colHeaderWidth + schedule.colWidth * 14 + schedule.colWidth * 0.25,
          y + options.rowHeaderHeight + rowHeight * idx + vAlignTextCenter(rowHeight, doc),
          {
            align: 'center',
          },
        );
        doc.text(
          detail.lab.toString(),
          x + schedule.colHeaderWidth + schedule.colWidth * 14 + schedule.colWidth * 0.75,
          y + options.rowHeaderHeight + rowHeight * idx + vAlignTextCenter(rowHeight, doc),
          {
            align: 'center',
          },
        );
        doc.text(
          detail.learn.toString(),
          x + schedule.colHeaderWidth + schedule.colWidth * 15 + schedule.colWidth * 0.25,
          y + options.rowHeaderHeight + rowHeight * idx + vAlignTextCenter(rowHeight, doc),
          {
            align: 'center',
          },
        );
        doc.text(
          `${detail.code}_SEC_${detail.sec.toString()}${detail.alt ? `, ${detail.alt}` : ''}`,
          x +
            schedule.colHeaderWidth +
            schedule.colWidth * 15 +
            schedule.colWidth / 2 +
            schedule.colWidth / 10,
          y + options.rowHeaderHeight + rowHeight * idx + vAlignTextCenter(rowHeight, doc),
        );
      });

      // const totalCredit = listDetail.reduce<number>((acc, detail) => (acc += detail.credit), 0);
      const totalLecture = listDetail.reduce<number>((acc, detail) => (acc += detail.lecture), 0);
      const totalLab = listDetail.reduce<number>((acc, detail) => (acc += detail.lab), 0);
      const totalLearn = listDetail.reduce<number>((acc, detail) => (acc += detail.learn), 0);

      // doc.text(
      //   totalCredit.toString(),
      //   x +
      //   schedule.colHeaderWidth +
      //   schedule.colWidth * 14 +
      //   schedule.colWidth / 4,
      //   y + vAlignTextCenter(rowHeight, doc) + rowHeight * 12 + options.rowHeaderHeight,
      //   {
      //     align: 'center',
      //   },
      // );
      doc.text(
        totalLecture.toString(),
        x + schedule.colHeaderWidth + schedule.colWidth * 14 + schedule.colWidth * 0.25,
        y + vAlignTextCenter(rowHeight, doc) + rowHeight * 12 + options.rowHeaderHeight,
        {
          align: 'center',
        },
      );
      doc.text(
        totalLab.toString(),
        x + schedule.colHeaderWidth + schedule.colWidth * 14 + schedule.colWidth * 0.75,
        y + vAlignTextCenter(rowHeight, doc) + rowHeight * 12 + options.rowHeaderHeight,
        {
          align: 'center',
        },
      );
      doc.text(
        totalLearn.toString(),
        x + schedule.colHeaderWidth + schedule.colWidth * 15 + schedule.colWidth * 0.25,
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
    assignSchedule: (data: ProcessedOverlapReturnType) => {
      const sourceSetting = {
        fontSize: doc.getFontSize(),
        lineWidth: doc.getLineWidth(),
      };

      doc.setFontSize(options.fontSize - 2);
      doc.setLineWidth(options.borderWidth);

      doc.setFillColor(200, 200, 255);

      const weekdayMap = {
        mon: 1,
        tue: 2,
        wed: 3,
        thu: 4,
        fri: 5,
        sat: 6,
        sun: 7,
      };

      data.forEach((v) => {
        doc.setFillColor(200, 200, 255);
        const maxOverlap =
          Math.max(...data.filter((obj) => obj.weekday === v.weekday).map((obj) => obj._offset)) +
          1;

        const cords = [
          scheduleAnchor[0] + colWidth * (v.period - 1),
          scheduleAnchor[1] +
            rowHeight * (weekdayMap[v.weekday] - 1) +
            (v._overlap ? (rowHeight * v._offset) / maxOverlap : 0),
          v.size * colWidth,
          v._overlap ? rowHeight / maxOverlap : rowHeight,
        ];
        doc.rect(cords[0], cords[1], cords[2], cords[3], 'F');
        doc.rect(cords[0], cords[1], cords[2], cords[3]);
        if (!v._overlap) {
          doc.text(
            `${v.section.subject.code}_SEC${v.section.no}${
              v.section.type === 'lab' ? '_L' + v.section.subject.lab : ''
            }`,
            cords[0] + cords[2] / 2,
            cords[1] + vAlignTextCenter(cords[3] / 2, doc) + cords[3] / 10,
            {
              align: 'center',
            },
          );
        }
        doc.text(
          v.section.subject.name,
          cords[0] + cords[2] / 2,
          cords[1] +
            (v._overlap ? 0 : cords[3] / 2) +
            vAlignTextCenter(v._overlap ? cords[3] : cords[3] / 2, doc) -
            (v._overlap ? 0 : cords[3] / 10),
          {
            align: 'center',
          },
        );
      });

      doc.setFontSize(sourceSetting.fontSize);
      doc.setLineWidth(sourceSetting.lineWidth);
    },
  };
}

export function createPDF() {
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

  return doc;
}
