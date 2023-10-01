import type { PageLoad } from './$types';
import type { Info, LogInfo, ResponseDataInfo } from '$lib/types';

import { paginationRequestParams } from '$lib/utils/search';
import apiRequest from '$lib/api';

import { redirect } from '@sveltejs/kit';

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:info');

  if (!session) throw redirect(302, '/login?redirect=/info');

  const info = apiRequest('/api/info', fetch);

  return {
    info: info.get<ResponseDataInfo<LogInfo<Info>>>(paginationRequestParams(url)),
  };
}) satisfies PageLoad;
