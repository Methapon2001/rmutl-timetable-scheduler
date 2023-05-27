import { createScheduler } from '$lib/api/scheduler';
import { checkOverlap } from './utils';

type WeekdayShort = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

function isCurrentRegGood(
  current: API.Section,
  weekday: WeekdayShort,
  period: number,
  gap: number,
  schedule: {
    id: string;
    section: API.Scheduler['section'];
    weekday: WeekdayShort;
    period: number;
    size: number;
  }[],
) {
  const entries = schedule.filter(
    (sched) =>
      sched.weekday === weekday &&
      sched.period < period &&
      (sched.section.group?.id == current.group?.id ||
        sched.section.instructor.findIndex(
          (inst) => current.instructor.findIndex((ins) => ins.id === inst.id) !== -1,
        ) !== -1),
  );

  if (entries.length <= 1) return true;
  if (entries.length > 2) return false;

  for (let i = 0; i < entries.length; i++) {
    if (i === entries.length - 1) return true;

    const current = entries[i];
    const next = entries[i + 1];
    const last = entries[entries.length - 1];

    if (current.period + current.size - 1 + gap >= next.period) {
      if (last.period + last.size - 1 + gap >= period) return false;
    }
  }
}

export async function generate(
  section: API.Section[],
  schedule: {
    id: string;
    section: API.Scheduler['section'];
    weekday: WeekdayShort;
    period: number;
    size: number;
  }[] = [],
  option: {
    weekday?: WeekdayShort[];
    period?: number[];
    target?: {
      group?: API.Group;
      subjectType?: 'compulsory' | 'elective' | '*';
    };
  } = {},
) {
  const subjectTarget = option.target?.subjectType ?? '*';
  const weekday = option.weekday ?? ['mon', 'tue', 'wed', 'thu', 'fri'];
  const rangeStart = option.period && option.period.length === 2 ? option.period[0] : 1;
  const rangeEnd = option.period && option.period.length === 2 ? option.period[1] : 18;

  section = section
    .filter((sec) => {
      return (
        schedule.findIndex((sched) => sched.section.id === sec.id) === -1 &&
        (option.target?.group ? option.target.group.id === sec.group?.id : true)
      );
    })
    .filter((sec) => {
      return subjectTarget !== '*'
        ? sec.group?.course.detail.find((c) => c.subject.id === sec.subject.id)?.type ===
            subjectTarget
        : true;
    });

  section.forEach((sec) => {
    const size = (sec.type === 'lecture' ? sec.subject.lecture : sec.subject.lab) * 2;

    for (const day of weekday) {
      for (let i = rangeStart; i <= rangeEnd - size + 1; i++) {
        const { isOverlap } = checkOverlap(
          {
            period: i,
            weekday: day,
            section: sec,
            size: size,
          },
          schedule,
        );

        if (isOverlap) continue;

        if (!isCurrentRegGood(sec, day, i, 2, schedule)) continue;

        schedule = [
          ...schedule,
          {
            id: 'generated',
            section: sec,
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

    const ret = await createScheduler({
      sectionId: schedule[i].section.id,
      start: schedule[i].period,
      end: schedule[i].period + schedule[i].size - 1,
      weekday: schedule[i].weekday,
    });

    schedule[i].id = ret.id;
  }

  return schedule;
}
