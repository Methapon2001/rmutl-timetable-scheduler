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
} from '$lib/types';

import { paginationRequestParams } from '$lib/utils/search';
import apiRequest from '$lib/api';

import { redirect } from '@sveltejs/kit';
import { info } from '$lib/stores';

let currentInfo: Info | undefined = undefined;
info.subscribe((v) => (currentInfo = v));

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:section');

  if (!session) throw redirect(302, '/login?redirect=/section');

  const section = apiRequest('/api/section', fetch);
  const param = paginationRequestParams(url);

  if (currentInfo !== undefined) {
    param.set('semester', currentInfo.semester.toString());
    param.set('year', currentInfo.year.toString());
  }

  return {
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
                  plan: Plan & { detail: PlanDetail; course: Course & { detail: CourseDetail } };
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
  };
}) satisfies PageLoad;
