import type { PageLoad } from './$types';
import type {
  Course,
  CourseDetail,
  Group,
  Info,
  LogInfo,
  Plan,
  PlanDetail,
  ResponseDataInfo,
} from '$lib/types';

import { paginationRequestParams } from '$lib/utils/search';
import apiRequest from '$lib/api';

import { redirect } from '@sveltejs/kit';
import { info } from '$lib/stores';

let currentInfo: Info | undefined = undefined;
info.subscribe((v) => (currentInfo = v));

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:group');

  if (!session) throw redirect(302, '/login?redirect=/group');

  const param = paginationRequestParams(url);

  if (currentInfo !== undefined) {
    param.set('semester', currentInfo.semester.toString());
    param.set('year', currentInfo.year.toString());
  }

  return {
    group: await apiRequest('/api/group', fetch).get<
      ResponseDataInfo<
        LogInfo<
          Group & {
            plan: Plan & { detail: PlanDetail };
            course: Course & { detail: CourseDetail };
          }
        >
      >
    >(param),
    info: currentInfo,
  };
}) satisfies PageLoad;
