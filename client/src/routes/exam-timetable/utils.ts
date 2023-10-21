import type {
  Building,
  Exam,
  Group,
  Instructor,
  Room,
  Section,
  Subject,
  TimetableExam,
} from '$lib/types';

type TimetableData = TimetableExam & {
  exam: Exam & {
    section: (Section & {
      group: Group | null;
      subject: Subject;
    })[];
    instructor: Instructor[];
    room: (Room & { building: Building }) | null;
  };
};

export function checkOverlap(
  current: {
    exam: TimetableData['exam'] | null;
    weekday: TimetableData['weekday'];
    period: number;
    size: number;
  },
  schedule: TimetableData[] = [],
) {
  const sharedData = schedule.filter(
    (v) =>
      (v.exam.room && v.exam.room.id === current.exam?.room?.id) ||
      v.exam.instructor.findIndex(
        (a) => current.exam?.instructor.findIndex((b) => b.id === a.id) !== -1,
      ) !== -1 ||
      v.exam.section.findIndex(
        (a) => current.exam?.section.findIndex((b) => b.group && b.group.id === a.group?.id) !== -1,
      ) !== -1,
  );

  const overlap = sharedData.filter(
    (item) =>
      item.weekday == current.weekday &&
      item.end >= current.period &&
      item.start < current.period + current.size,
  );

  const overlapStatus = overlap.reduce<{
    overlapInstructor: TimetableData[];
    overlapRoom: TimetableData[];
    overlapGroup: TimetableData[];
    overlapSection: TimetableData[];
  }>(
    (a, c) => {
      if (
        c.exam.instructor.findIndex(
          (a) => current.exam?.instructor.findIndex((b) => b.id === a.id) !== -1,
        ) !== -1
      ) {
        a.overlapInstructor.push(c);
      }

      if (
        c.exam.section.findIndex(
          (a) => current.exam?.section.findIndex((b) => b.id === a.id) !== -1,
        ) !== -1
      ) {
        a.overlapSection.push(c);
      }

      if (c.exam.room && c.exam.room.id === current.exam?.room?.id) a.overlapRoom.push(c);
      if (
        c.exam.section.findIndex(
          (a) => current.exam?.section.findIndex((b) => b.group && b.group.id === a.group?.id),
        )
      )
        a.overlapGroup.push(c);

      return a;
    },
    {
      overlapInstructor: [],
      overlapRoom: [],
      overlapGroup: [],
      overlapSection: [],
    },
  );

  return { isOverlap: overlap.length > 0, ...overlapStatus };
}
