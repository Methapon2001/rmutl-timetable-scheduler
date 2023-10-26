import apiRequest from '$lib/api';
import { checkOverlap } from './utils';
import type {
  Section,
  Course,
  Group,
  Plan,
  PlanDetail,
  Building,
  Room,
  Instructor,
  Subject,
  CourseDetail,
  Timetable,
} from '$lib/types';

type WeekdayShort = Timetable['weekday'];

function isCurrentRegGood(
  current: Section & {
    parent: Section | null;
    child: (Section & {
      room: (Room & { building: Building }) | null;
      instructor: Instructor[];
      subject: Subject;
      group: Group | null;
    })[];
    group:
      | (Group & {
          plan: Plan & { detail: (PlanDetail & { subject: Subject })[] };
          course: Course & { detail: (CourseDetail & { subject: Subject })[] };
        })
      | null;
    room: (Room & { building: Building }) | null;
    instructor: Instructor[];
    subject: Subject;
  },
  weekday: WeekdayShort,
  period: number,
  schedule: (Timetable & {
    section: Section & {
      group: Group | null;
      room: (Room & { building: Building }) | null;
      instructor: Instructor[];
      subject: Subject;
      parent: Section | null;
    };
  })[],
  option: {
    maxPerDay?: number;
    consecutiveGap?: number;
    restGap?: number;
  },
) {
  const maxPerDay = 3;
  const consecutiveGap = option.consecutiveGap ?? 2;
  const restGap = option.restGap ?? 2;

  const detail = current.group?.course.detail.find((a) => a.subject.id === current.subject.id);

  if (weekday === 'thu' && detail?.type === 'compulsory') return false;
  if (weekday !== 'thu' && detail?.type === 'elective') return false;

  const entries = schedule.filter(
    (v) =>
      v.weekday === weekday &&
      v.start < period &&
      ((v.section.group && v.section.group.id === current.group?.id) ||
        v.section.instructor.findIndex(
          (a) => current.instructor.findIndex((b) => b.id === a.id) !== -1,
        ) !== -1),
  );

  if (entries.length < 1) return true;
  if (entries.length >= maxPerDay) return false;

  entries.sort((a, b) => a.start - b.start);

  for (let i = 0; i < entries.length; i++) {
    const curr = entries[i];

    // if there is one entries that is longer than 5 hours (10 periods) then return false
    if (curr.end - curr.start + 1 >= 10 && curr.end + restGap >= period) return false;

    if (i === entries.length - 1) return true;

    const next = entries[i + 1];

    // if two entries is considered consecutive then check if current period
    // that will be registed is in range of gap after the later entries.
    //
    // note:
    //    this does not considered overlap situation as it should be checked before call this.
    //    this does not considered section that comes after current that will be registered.
    if (curr.end + consecutiveGap >= next.start) {
      if (next.end + restGap >= period) return false;
    }
  }
}

export async function generate(
  section: Parameters<typeof isCurrentRegGood>[0][],
  schedule: Parameters<typeof isCurrentRegGood>[3] = [],
  option: {
    weekday?: WeekdayShort[];
    period?: number[];
    target?: {
      group?: Parameters<typeof isCurrentRegGood>[0]['group'];
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
    .filter(
      (a) =>
        schedule.findIndex((b) => b.section.id === a.id) === -1 &&
        (option.target?.group ? option.target.group.id === a.group?.id : true),
    )
    .filter((v) =>
      subjectTarget !== '*'
        ? v.group?.course.detail.find((c) => c.subject.id === v.subject.id)?.type === subjectTarget
        : true,
    );

  section.forEach((v) => {
    const size = (v.type === 'lecture' ? v.subject.lecture : v.subject.lab) * 2;

    for (const day of weekday) {
      for (let i = rangeStart; i <= rangeEnd - size + 1; i++) {
        const { isOverlap } = checkOverlap(
          {
            period: i,
            weekday: day,
            section: v,
            size: size,
          },
          schedule,
        );

        if (isOverlap) continue;

        if (
          !isCurrentRegGood(v, day, i, schedule, {
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
            section: v,
            start: i,
            end: i + size - 1,
            publish: false,
            weekday: day as WeekdayShort,
          },
        ];

        return;
      }
    }
  });

  for (let i = 0; i < schedule.length; i++) {
    if (schedule[i].id !== 'generated') continue;

    const ret = await apiRequest('/api/scheduler').post<(typeof schedule)[number]>({
      start: schedule[i].start,
      end: schedule[i].end,
      weekday: schedule[i].weekday,
      publish: schedule[i].publish,
      sectionId: schedule[i].section.id,
    });

    schedule[i].id = ret.id;
  }

  return schedule;
}
