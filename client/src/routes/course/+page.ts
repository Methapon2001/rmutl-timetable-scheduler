import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_HOST } from '$env/static/public';

const api = new URL(`${PUBLIC_API_HOST}/api/course`);

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:course');

  if (!session) throw redirect(302, '/login?redirect=/course');

  const page = url.searchParams.get('page');
  const search = url.searchParams.get('search');

  if (search && search.length > 0) {
    api.searchParams.set('search', search);
  } else {
    api.searchParams.delete('search');
  }

  api.searchParams.set('limit', String(20));
  api.searchParams.set('offset', String((+(page ?? 1) - 1) * 20));

  const requestCourse = async () => {
    const res = await fetch(api);
    const body = await res.json();
    return body as {
      data: API.Course[];
      limit: number;
      offset: number;
      total: number;
    };
  };

  const requestSubject = async () => {
    const res = await fetch(`${PUBLIC_API_HOST}/api/subject?limit=9999`);
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
