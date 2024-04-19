import type { PageLoad } from './$types';
import type { Building, LogInfo, ResponseDataInfo } from '$lib/types';

import { paginationRequestParams } from '$lib/utils/search';
import apiRequest from '$lib/api';

import { redirect } from '@sveltejs/kit';

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:building');

  if (!session) throw redirect(302, '/login?redirect=/building');

  const building = apiRequest('/api/building', fetch);

  return {
    building: building.get<ResponseDataInfo<LogInfo<Building>>>(paginationRequestParams(url)),
  };
}) satisfies PageLoad;
