import type { PageLoad } from './$types';
import type { ResponseDataInfo, Plan, LogInfo, PlanDetail, Subject, Course } from '$lib/types';

import { paginationRequestParams } from '$lib/utils/search';
import apiRequest from '$lib/api';

import { redirect } from '@sveltejs/kit';

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:plan');

  if (!session) throw redirect(302, '/login?redirect=/plan');

  return {
    plan: await apiRequest('/api/plan', fetch).get<
      ResponseDataInfo<
        LogInfo<
          Plan & {
            detail: (PlanDetail & { subject: Subject })[];
            course: Course;
          }
        >
      >
    >(paginationRequestParams(url)),
  };
}) satisfies PageLoad;
