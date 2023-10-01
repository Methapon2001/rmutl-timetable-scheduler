import type { PageLoad } from './$types';
import type {
  Section,
  Course,
  Group,
  Info,
  LogInfo,
  Plan,
  PlanDetail,
  ResponseDataInfo,
  Building,
  Room,
  Instructor,
  Subject,
  CourseDetail,
  Timetable,
} from '$lib/types';

import apiRequest from '$lib/api';

import { redirect } from '@sveltejs/kit';
import { info } from '$lib/stores';

let currentInfo: Info | undefined = undefined;
info.subscribe((v) => (currentInfo = v));

export const load = (async ({ fetch, parent, depends }) => {
  const { session } = await parent();

  depends('data:scheduler');

  if (!session) throw redirect(302, '/login?redirect=/timetable');

  const section = apiRequest('/api/section', fetch);
  const timetable = apiRequest('/api/scheduler', fetch);
  const room = apiRequest('/api/room', fetch);
  const param = new URLSearchParams({ limit: '9999' });

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
    section: section.get<
      ResponseDataInfo<
        LogInfo<
          Section & {
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
          }
        >
      >
    >(param),
    info: currentInfo,
    lazy: {
      room: room.get<ResponseDataInfo<LogInfo<Room & { building: Building }>>>({ limit: '9999' }),
    },
  };
}) satisfies PageLoad;
