import type { PageLoad } from './$types';
import type {
  Section,
  Group,
  Info,
  LogInfo,
  ResponseDataInfo,
  Building,
  Room,
  Instructor,
  Subject,
  TimetableExam,
  Exam,
} from '$lib/types';

import apiRequest from '$lib/api';

import { redirect } from '@sveltejs/kit';
import { info } from '$lib/stores';

let currentInfo: Info | undefined = undefined;
info.subscribe((v) => (currentInfo = v));

export const load = (async ({ fetch, parent, depends }) => {
  const { session } = await parent();

  depends('data:scheduler-exam');

  if (!session) throw redirect(302, '/login?redirect=/exam-timetable');

  const room = apiRequest('/api/room', fetch);
  const instructor = apiRequest('/api/instructor', fetch);
  const param = new URLSearchParams({ limit: '9999' });

  if (currentInfo !== undefined) {
    param.set('semester', currentInfo.semester.toString());
    param.set('year', currentInfo.year.toString());
  }

  const [schedulerExam, exam] = await Promise.all([
    apiRequest('/api/scheduler-exam', fetch).get<
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
    apiRequest('/api/exam', fetch).get<
      ResponseDataInfo<
        LogInfo<
          Exam & {
            section: (Section & {
              group: Group | null;
              subject: Subject;
            })[];
            instructor: Instructor[];
            room: (Room & { building: Building }) | null;
          }
        >
      >
    >(param),
  ]);

  return {
    schedulerExam,
    exam,
    info: currentInfo,
    lazy: {
      room: room.get<ResponseDataInfo<LogInfo<Room & { building: Building }>>>({ limit: '9999' }),
      instructor: instructor.get<ResponseDataInfo<LogInfo<Instructor>>>({ limit: '9999' }),
    },
  };
}) satisfies PageLoad;
