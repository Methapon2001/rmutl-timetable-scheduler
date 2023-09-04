import type { PageLoad } from './$types';
import type { ResponseDataInfo, Course, LogInfo, CourseDetail, Subject } from '$lib/types';

import { paginationRequestParams } from '$lib/utils/search';
import apiRequest from '$lib/api';

import { redirect } from '@sveltejs/kit';

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:course');

  if (!session) throw redirect(302, '/login?redirect=/course');

  const course = apiRequest('/api/course', fetch);

  return {
    course: course.get<
      ResponseDataInfo<
        LogInfo<
          Course & {
            detail: (CourseDetail & { subject: Subject })[];
          }
        >
      >
    >(paginationRequestParams(url)),
  };
}) satisfies PageLoad;
