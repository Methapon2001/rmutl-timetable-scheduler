import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { PUBLIC_API_HOST } from '$env/static/public';

const apiCourse = new URL(`${PUBLIC_API_HOST}/api/course`);
const apiSubject = new URL(`${PUBLIC_API_HOST}/api/subject`);

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:course');

  if (!session) throw error(401, { message: 'Unauthorized' });

  const page = url.searchParams.get('page');
  const search = url.searchParams.get('search');

  if (search && search.length > 0) {
    apiCourse.searchParams.set('search', search);
  } else {
    apiCourse.searchParams.delete('search');
  }

  apiCourse.searchParams.set('limit', String(20));
  apiCourse.searchParams.set('offset', String((+(page ?? 1) - 1) * 20));

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

  const requestSubject = async () => {
    const res = await fetch(apiSubject);
    const body = await res.json();
    return body as {
      data: API.Subject[];
      limit: number;
      offset: number;
      total: number;
    };
  };

  return {
    course: requestCourse(),
    lazy: {
      subject: requestSubject(),
    },
  };
}) satisfies PageLoad;
