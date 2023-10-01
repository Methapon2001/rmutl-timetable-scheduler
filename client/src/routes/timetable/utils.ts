import type { Building, Group, Instructor, Room, Section, Subject, Timetable } from '$lib/types';

type TimetableData = Timetable & {
  section: Section & {
    group: Group | null;
    subject: Subject;
    instructor: Instructor[];
    room: (Room & { building: Building }) | null;
  };
};

export function checkOverlap(
  current: {
    section: TimetableData['section'] | null;
    weekday: TimetableData['weekday'];
    period: number;
    size: number;
  },
  schedule: TimetableData[] = [],
) {
  const sharedData = schedule.filter(
    (v) =>
      (v.section.room && v.section.room.id === current.section?.room?.id) ||
      (v.section.group && v.section.group.id === current.section?.group?.id) ||
      v.section.instructor.findIndex(
        (a) => current.section?.instructor.findIndex((b) => b.id === a.id) !== -1,
      ) !== -1,
  );

  const overlap = sharedData.filter(
    (item) =>
      item.weekday == current.weekday &&
      item.end >= current.period &&
      item.start < current.period + current.size,
  );

  const activityOverlap =
    current.weekday === 'wed' && 19 > current.period && 15 < current.period + current.size;

  const overlapStatus = overlap.reduce<{
    overlapInstructor: TimetableData[];
    overlapRoom: TimetableData[];
    overlapGroup: TimetableData[];
    overlapSubject: TimetableData[];
  }>(
    (a, c) => {
      if (
        c.section.instructor.findIndex(
          (inst) => current.section?.instructor.findIndex((ins) => ins.id === inst.id) !== -1,
        ) !== -1
      ) {
        a.overlapInstructor.push(c);
      }

      if (c.section.subject.id === current.section?.subject.id) a.overlapSubject.push(c);
      if (c.section.room && c.section.room?.id === current.section?.room?.id) a.overlapRoom.push(c);
      if (c.section.group && c.section.group.id === current.section?.group?.id)
        a.overlapGroup.push(c);

      return a;
    },
    {
      overlapInstructor: [],
      overlapRoom: [],
      overlapGroup: [],
      overlapSubject: [],
    },
  );

  return {
    isOverlap: overlap.length > 0 || activityOverlap,
    allowOverlap: !(
      overlapStatus.overlapRoom.length > 0 ||
      overlapStatus.overlapInstructor.length > 0 ||
      overlapStatus.overlapSubject.length > 0 ||
      activityOverlap
    ),
    ...overlapStatus,
  };
}

export function processOverlaps(arr: TimetableData[]) {
  const processed = arr.map((current) => {
    return {
      ...current,
      _overlap: arr.some(
        (item) =>
          item != current &&
          item.weekday == current.weekday &&
          item.end >= current.start &&
          item.start <= current.end,
      ),
      _offset: -1,
    };
  });

  for (let i = 0; i < processed.length; i++) {
    if (processed[i]._overlap == false || processed[i]._offset !== -1) continue;

    const offsetList: number[] = [];

    const mutualOverlap = processed.filter(
      (item) =>
        processed[i].id != item.id &&
        item.weekday == processed[i].weekday &&
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
      if (processed[i].weekday != processed[k].weekday || i == k) continue;

      if (processed[i].section.subject.id == processed[k].section.subject.id) {
        processed[k]._overlap = true;
        processed[k]._offset = j;
      }
    }
  }

  return processed;
}

export type ProcessedOverlapReturnType = ReturnType<typeof processOverlaps>;
