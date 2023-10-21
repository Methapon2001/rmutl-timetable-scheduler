import type { PageLoad } from './$types';
import type {
  Section,
  Group,
  LogInfo,
  ResponseDataInfo,
  Building,
  Room,
  Instructor,
  Subject,
  Timetable,
  TimetableExam,
  Exam,
  Info,
} from '$lib/types';

import apiRequest from '$lib/api';
import { info } from '$lib/stores';

let currentInfo: Info | undefined = undefined;
info.subscribe((v) => (currentInfo = v));

export const load = (async ({ fetch }) => {
  const timetable = apiRequest('/api/scheduler', fetch);
  const timetableExam = apiRequest('/api/scheduler-exam', fetch);
  const param = new URLSearchParams({ limit: '9999', publish: 'true' });

  if (currentInfo !== undefined) {
    param.set('semester', currentInfo.semester.toString());
    param.set('year', currentInfo.year.toString());
  }

  return {
    scheduler: timetable.get<
      ResponseDataInfo<
        LogInfo<
          Timetable & {
            section: Section & {
              group: Group | null;
              room: (Room & { building: Building }) | null;
              instructor: Instructor[];
              subject: Subject;
            };
          }
        >
      >
    >(param),
    schedulerExam: timetableExam.get<
      ResponseDataInfo<
        LogInfo<
          TimetableExam & {
            exam: Exam & {
              section: (Section & {
                group: Group | null;
                subject: Subject;
              })[];
              instructor: Instructor[];
              room: (Room & { building: Building }) | null;
            };
          }
        >
      >
    >(param),
  };
}) satisfies PageLoad;
