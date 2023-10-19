import type { PageLoad } from './$types';
import type {
  ResponseDataInfo,
  LogInfo,
  Group,
  Plan,
  PlanDetail,
  Course,
  CourseDetail,
  Info,
  Subject,
} from '$lib/types';

import { paginationRequestParams } from '$lib/utils/search';
import apiRequest from '$lib/api';

import { redirect } from '@sveltejs/kit';
import { info } from '$lib/stores';

let currentInfo: Info | undefined = undefined;
info.subscribe((v) => (currentInfo = v));

export const load = (async ({ fetch, parent, url }) => {
  const { session } = await parent();

  if (!session) throw redirect(302, '/login?redirect=/section/gen');

  const group = apiRequest('/api/group', fetch);
  const param = paginationRequestParams(url);

  if (currentInfo !== undefined) {
    param.set('semester', currentInfo.semester.toString());
    param.set('year', currentInfo.year.toString());
  }

  return {
    group: group.get<
      ResponseDataInfo<
        LogInfo<
          Group & {
            plan: Plan & {
              detail: (PlanDetail & { subject: Subject })[];
              course: Course & { detail: (CourseDetail & { subject: Subject })[] };
            };
          }
        >
      >
    >(param),
    info: currentInfo,
  };
}) satisfies PageLoad;
