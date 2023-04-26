import { createScheduler } from '$lib/api/scheduler';

type WeekdayShort = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export async function generate(
  section: API.Section[],
  scheduler: {
    id: string;
    section: API.Scheduler['section'];
    weekday: WeekdayShort;
    period: number;
    size: number;
  }[] = [],
  option: {
    weekday: WeekdayShort[];
    period: number[];
  } = {
    weekday: ['mon', 'tue', 'wed', 'thu', 'fri'],
    period: [1, 18],
  },
) {
  section = section.filter((sec) => {
    return scheduler.findIndex((sched) => sched.section.id === sec.id) === -1;
  });

  section.forEach((sec) => {
    const size = (sec.type === 'lecture' ? sec.subject.lecture : sec.subject.lab) * 2;

    for (const weekday of option.weekday) {
      for (let i = option.period[0]; i < option.period[1] - size; i++) {
        const sharedData = scheduler.filter((obj) => {
          return (
            obj.section.room?.id == sec.room?.id ||
            obj.section.group?.id == sec.group?.id ||
            obj.section.instructor.findIndex(
              (inst) => sec.instructor.findIndex((ins) => ins.id === inst.id) !== -1,
            ) !== -1
          );
        });

        const overlap = sharedData.some(
          (item) =>
            item.weekday == weekday && item.period + item.size > i && item.period < i + size,
        );

        if (overlap) continue;

        scheduler = [
          ...scheduler,
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

  for (let i = 0; i < scheduler.length; i++) {
    if (scheduler[i].id !== 'generated') continue;

    await createScheduler({
      sectionId: scheduler[i].section.id,
      start: scheduler[i].period,
      end: scheduler[i].period + scheduler[i].size - 1,
      weekday: scheduler[i].weekday,
    });
  }
}
