import type { PageLoad } from './$types';
import type { Building, ResponseDataInfo, Room, LogInfo } from '$lib/types';

import { paginationRequestParams } from '$lib/utils/search';
import apiRequest from '$lib/api';

import { redirect } from '@sveltejs/kit';

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:room');

  if (!session) throw redirect(302, '/login?redirect=/room');

  const room = apiRequest('/api/room', fetch);

  return {
    room: room.get<ResponseDataInfo<LogInfo<Room & { building: Building }>>>(
      paginationRequestParams(url),
    ),
  };
}) satisfies PageLoad;
