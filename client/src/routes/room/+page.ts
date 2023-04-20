import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { PUBLIC_API_HOST } from '$env/static/public';

const apiRoom = new URL(`${PUBLIC_API_HOST}/api/room`);
const apiBuilding = new URL(`${PUBLIC_API_HOST}/api/building`);

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:room');

  if (!session) throw error(401, { message: 'Unauthorized' });

  const page = url.searchParams.get('page');
  const search = url.searchParams.get('search');

  if (search && search.length > 0) {
    apiRoom.searchParams.set('search', search);
  } else {
    apiRoom.searchParams.delete('search');
  }

  apiRoom.searchParams.set('limit', String(20));
  apiRoom.searchParams.set('offset', String((+(page ?? 1) - 1) * 20));

  const requestRoom = async () => {
    const res = await fetch(apiRoom);
    const body = await res.json();
    return body as {
      data: API.Room[];
      limit: number;
      offset: number;
      total: number;
    };
  };

  const requestBuilding = async () => {
    const res = await fetch(apiBuilding);
    const body = await res.json();
    return body as {
      data: API.Building[];
      limit: number;
      offset: number;
      total: number;
    };
  };

  return {
    room: requestRoom(),
    lazy: {
      building: requestBuilding(),
    },
  };
}) satisfies PageLoad;
