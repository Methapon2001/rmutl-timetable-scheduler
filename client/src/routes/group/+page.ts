import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { PUBLIC_API_HOST } from '$env/static/public';

const apiGroup = new URL(`${PUBLIC_API_HOST}/api/group`);
const apiCourse = new URL(`${PUBLIC_API_HOST}/api/course`);

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:group');

  if (!session) throw error(401, { message: 'Unauthorized' });

  const page = url.searchParams.get('page');
  const search = url.searchParams.get('search');

  if (search && search.length > 0) {
    apiGroup.searchParams.set('search', search);
  } else {
    apiGroup.searchParams.delete('search');
  }

  apiGroup.searchParams.set('limit', String(20));
  apiGroup.searchParams.set('offset', String((+(page ?? 1) - 1) * 20));

  const requestGroup = async () => {
    const res = await fetch(apiGroup);
    const body = await res.json();
    return body as {
      data: API.Group[];
      limit: number;
      offset: number;
      total: number;
    };
  };

  const requestCourse = async () => {
    const res = await fetch(apiCourse);
    const body = await res.json();
    return body as {
      data: API.Course[];
      limit: number;
      offset: number;
      total: number;
    };
  };

  return {
    group: requestGroup(),
    lazy: {
      course: requestCourse(),
    },
  };
}) satisfies PageLoad;
