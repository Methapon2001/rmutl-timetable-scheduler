import type { PageLoad } from './$types';
import type { ResponseDataInfo, LogInfo, User } from '$lib/types';

import { paginationRequestParams } from '$lib/utils/search';
import apiRequest from '$lib/api';

import { redirect } from '@sveltejs/kit';

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:user');

  if (!session) throw redirect(302, '/login?redirect=/user');

  const user = apiRequest('/api/user', fetch);

  return {
    user: user.get<ResponseDataInfo<LogInfo<User>>>(paginationRequestParams(url)),
  };
}) satisfies PageLoad;
