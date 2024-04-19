import type { PageLoad } from './$types';
import type { Instructor, LogInfo, ResponseDataInfo } from '$lib/types';

import { paginationRequestParams } from '$lib/utils/search';
import apiRequest from '$lib/api';

import { redirect } from '@sveltejs/kit';

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:instructor');

  if (!session) throw redirect(302, '/login?redirect=/instructor');

  const instructor = apiRequest('/api/instructor', fetch);

  return {
    instructor: instructor.get<ResponseDataInfo<LogInfo<Instructor>>>(paginationRequestParams(url)),
  };
}) satisfies PageLoad;
