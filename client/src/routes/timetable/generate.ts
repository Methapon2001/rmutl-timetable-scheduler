import { createScheduler } from '$lib/api/scheduler';
import { checkOverlap } from './utils';

type WeekdayShort = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

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
    target?: 'compulsory' | 'elective' | '*';
  } = {},
) {
  option = {
    weekday: option.weekday ?? ['mon', 'tue', 'wed', 'thu', 'fri'],
    period: option.period ?? [1, 18],
    target: option.target ?? '*',
  };

  section = section
    .filter((sec) => {
      return schedule.findIndex((sched) => sched.section.id === sec.id) === -1;
    })
    .filter((sec) => {
      return option.target !== '*'
        ? sec.group?.course.detail.find((c) => c.subject.id === sec.subject.id)?.type ===
            option.target
        : true;
    });

  section.forEach((sec) => {
    const size = (sec.type === 'lecture' ? sec.subject.lecture : sec.subject.lab) * 2;

    for (const weekday of option.weekday!) {
      for (let i = option.period![0]; i < option.period![1] - size; i++) {
        const { isOverlap } = checkOverlap(
          {
            period: i,
            weekday: weekday,
            section: sec,
            size: size,
          },
          schedule,
        );

        if (isOverlap) continue;

        schedule = [
          ...schedule,
          {
            id: 'generated',
            section: sec,
            period: i,
            size: size,
            weekday: weekday as WeekdayShort,
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
