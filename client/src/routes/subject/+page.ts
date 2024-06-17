import type { PageLoad } from './$types';
import type { Subject, LogInfo, ResponseDataInfo } from '$lib/types';

import { paginationRequestParams } from '$lib/utils/search';
import apiRequest from '$lib/api';

import { redirect } from '@sveltejs/kit';

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:subject');

  if (!session) throw redirect(302, '/login?redirect=/subject');

  return {
    subject: await apiRequest('/api/subject', fetch).get<ResponseDataInfo<LogInfo<Subject>>>(
      paginationRequestParams(url),
    ),
  };
}) satisfies PageLoad;
