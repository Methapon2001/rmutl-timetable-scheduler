import { createScheduler } from '$lib/api/scheduler';
import { checkOverlap } from './utils';

type WeekdayShort = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

function isCurrentRegGood(
  current: API.Section,
  weekday: WeekdayShort,
  period: number,
  schedule: {
    id: string;
    section: API.Scheduler['section'];
    weekday: WeekdayShort;
    period: number;
    size: number;
  }[],
  option: {
    maxPerDay?: number;
    consecutiveGap?: number;
    restGap?: number;
  },
) {
  const maxPerDay = 3;
  const consecutiveGap = option.consecutiveGap ?? 2;
  const restGap = option.restGap ?? 2;

  const entries = schedule.filter(
    (sched) =>
      sched.weekday === weekday &&
      sched.period < period &&
      (sched.section.group?.id == current.group?.id ||
        sched.section.instructor.findIndex(
          (inst) => current.instructor.findIndex((ins) => ins.id === inst.id) !== -1,
        ) !== -1),
  );

  if (entries.length < 1) return true;
  if (entries.length >= maxPerDay) return false;

  entries.sort((a, b) => a.period - b.period);

  for (let i = 0; i < entries.length; i++) {
    const curr = entries[i];

    // if there is one entries that is longer than 5 hours (10 periods) then return false
    if (curr.size >= 10 && curr.period + curr.size - 1 + restGap >= period) return false;

    if (i === entries.length - 1) return true;

    const next = entries[i + 1];

    // if two entries is considered consecutive then check if current period
    // that will be registed is in range of gap after the later entries.
    //
    // note:
    //    this does not considered overlap situation as it should be checked before call this.
    //    this does not considered section that comes after current that will be registered.
    if (curr.period + curr.size - 1 + consecutiveGap >= next.period) {
      if (next.period + next.size - 1 + restGap >= period) return false;
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
      group?: Omit<API.Group, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;
      subjectType?: 'compulsory' | 'elective' | '*';
    };
    maxPerDay?: number;
    consecutiveGap?: number;
    restGap?: number;
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

        if (
          !isCurrentRegGood(sec, day, i, schedule, {
            maxPerDay: option.maxPerDay,
            consecutiveGap: option.consecutiveGap,
            restGap: option.restGap,
          })
        )
          continue;

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
