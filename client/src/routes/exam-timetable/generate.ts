import { createSchedulerExam } from '$lib/api/scheduler-exam';
import { checkOverlap } from './utils';

type WeekdayShort = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

function isCurrentRegGood(
  current: API.Exam,
  weekday: WeekdayShort,
  period: number,
  size: number,
  gap: number,
  schedule: {
    id: string;
    exam: API.SchedulerExam['exam'];
    weekday: WeekdayShort;
    period: number;
    size: number;
  }[],
  option: {
    maxPerDay?: number;
  },
) {
  const maxPerDay = option.maxPerDay ?? 2;

  const entries = schedule.filter(
    (sched) =>
      sched.weekday === weekday &&
      sched.period < period &&
      (sched.exam.section.findIndex(
        (sec) => current.section.findIndex((s) => sec.group?.id === s.group?.id) !== -1,
      ) !== -1 ||
        sched.exam.instructor.findIndex(
          (inst) => current.instructor.findIndex((ins) => ins.id === inst.id) !== -1,
        ) !== -1),
  );

  if (entries.length >= maxPerDay) return false;

  const currentExtendedStart = period - gap;
  const currentExtendedEnd = period + size + gap;

  if (
    schedule.some(
      (sched) =>
        sched.period <= currentExtendedEnd && sched.period + sched.size - 1 >= currentExtendedStart,
    )
  ) {
    return false;
  }

  return true;
}

export async function generate(
  exam: API.Exam[],
  schedule: {
    id: string;
    exam: API.SchedulerExam['exam'];
    weekday: WeekdayShort;
    period: number;
    size: number;
  }[] = [],
  option: {
    weekday?: WeekdayShort[];
    period?: number[];
    maxPerDay?: number;
  } = {},
) {
  const weekday = option.weekday ?? ['mon', 'tue', 'wed', 'thu', 'fri'];
  const rangeStart = option.period && option.period.length === 2 ? option.period[0] : 1;
  const rangeEnd = option.period && option.period.length === 2 ? option.period[1] : 18;

  exam = exam.filter((sec) => {
    return schedule.findIndex((sched) => sched.exam.id === sec.id) === -1;
  });

  exam.forEach((sec) => {
    const size = sec.section[0].subject.exam * 2;

    for (const day of weekday) {
      for (let i = rangeStart; i <= rangeEnd - size + 1; i++) {
        const { isOverlap } = checkOverlap(
          {
            period: i,
            weekday: day,
            exam: sec,
            size: size,
          },
          schedule,
        );

        if (isOverlap) continue;

        if (!isCurrentRegGood(sec, day, i, size, 2, schedule, { maxPerDay: option.maxPerDay }))
          continue;

        schedule = [
          ...schedule,
          {
            id: 'generated',
            exam: sec,
            period: i,
            size: size,
            weekday: day as WeekdayShort,
          },
        ];

        return;
      }
    }
  });

  for (let i = 0; i < schedule.length; i++) {
    if (schedule[i].id !== 'generated') continue;

    const ret = await createSchedulerExam({
      examId: schedule[i].exam.id,
      start: schedule[i].period,
      end: schedule[i].period + schedule[i].size - 1,
      weekday: schedule[i].weekday,
    });

    schedule[i].id = ret.id;
  }

  return schedule;
}
