import type {
  Section,
  Group,
  Building,
  Room,
  Instructor,
  Subject,
  TimetableExam,
  Exam,
} from '$lib/types';
import { checkOverlap } from './utils';
import apiRequest from '$lib/api';

type WeekdayShort = TimetableExam['weekday'];

function isCurrentRegGood(
  current: Exam & {
    section: (Section & {
      group: Group | null;
      subject: Subject;
    })[];
    instructor: Instructor[];
    room: (Room & { building: Building }) | null;
  },
  weekday: WeekdayShort,
  period: number,
  size: number,
  schedule: (TimetableExam & {
    exam: Exam & {
      section: (Section & {
        group: Group | null;
        subject: Subject;
      })[];
      instructor: Instructor[];
      room: (Room & { building: Building }) | null;
    };
  })[],
  option: {
    maxPerDay?: number;
    restGap?: number;
  },
) {
  const maxPerDay = option.maxPerDay ?? 2;
  const restGap = option.restGap ?? 2;

  const entries = schedule.filter(
    (v) =>
      v.weekday === weekday &&
      v.start < period &&
      (v.exam.section.findIndex(
        (a) => current.section.findIndex((b) => a.group && a.group?.id === b.group?.id) !== -1,
      ) !== -1 ||
        v.exam.instructor.findIndex(
          (a) => current.instructor.findIndex((b) => b.id === a.id) !== -1,
        ) !== -1),
  );

  const roomEntries = schedule.filter(
    (sched) => sched.weekday === weekday && sched.exam.room?.id === current.room?.id,
  );

  if (entries.length >= maxPerDay) return false;

  const currExtendedStart = period - restGap;
  const currExtendedEnd = period + size + restGap;

  // check if some of group or instructor have too many load (2 by default) however room only check for overlap
  return !(
    entries.some((sched) => sched.start <= currExtendedEnd && sched.end >= currExtendedStart) ||
    roomEntries.some((sched) => sched.start <= period + size + 1 && sched.end >= period - 1)
  );
}

export async function generate(
  exam: Parameters<typeof isCurrentRegGood>[0][],
  schedule: Parameters<typeof isCurrentRegGood>[4] = [],
  option: {
    weekday?: WeekdayShort[];
    period?: number[];
    maxPerDay?: number;
    restGap?: number;
  } = {},
) {
  const weekday = option.weekday ?? ['mon', 'tue', 'wed', 'thu', 'fri'];
  const rangeStart = option.period && option.period.length === 2 ? option.period[0] : 1;
  const rangeEnd = option.period && option.period.length === 2 ? option.period[1] : 50;

  exam = exam.filter((a) => schedule.findIndex((b) => b.exam.id === a.id) === -1);

  exam.forEach((v) => {
    const size = v.section[0].subject.lecture * 4;

    for (const day of weekday) {
      for (let i = rangeStart; i <= rangeEnd - size + 1; i++) {
        const { isOverlap } = checkOverlap(
          {
            period: i,
            weekday: day,
            exam: v,
            size: size,
          },
          schedule,
        );

        if (isOverlap) continue;

        if (
          !isCurrentRegGood(v, day, i, size, schedule, {
            maxPerDay: option.maxPerDay,
            restGap: 12,
          })
        )
          continue;

        schedule = [
          ...schedule,
          {
            id: 'generated',
            exam: v,
            start: i,
            end: i + size - 1,
            weekday: day as WeekdayShort,
            publish: false,
          },
        ];

        return;
      }
    }
  });

  const promises: Promise<(typeof schedule)[number]>[] = [];

  for (let i = 0; i < schedule.length; i++) {
    if (schedule[i].id !== 'generated') continue;

    promises.push(
      apiRequest('/api/scheduler-exam').post<(typeof schedule)[number]>(
        {
          start: schedule[i].start,
          end: schedule[i].end,
          weekday: schedule[i].weekday,
          publish: schedule[i].publish,
          examId: schedule[i].exam.id,
        },
        {
          noUpdateSignal: 'true',
        },
      ),
    );
  }

  return await Promise.all(promises);
}
