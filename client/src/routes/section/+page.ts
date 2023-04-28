import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { PUBLIC_API_HOST } from '$env/static/public';

const api = new URL(`${PUBLIC_API_HOST}/api/section`);

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:section');

  if (!session) throw error(401, { message: 'Unauthorized' });

  const page = url.searchParams.get('page');
  const search = url.searchParams.get('search');

  if (search && search.length > 0) {
    api.searchParams.set('search', search);
  } else {
    api.searchParams.delete('search');
  }

  api.searchParams.set('limit', String(20));
  api.searchParams.set('offset', String((+(page ?? 1) - 1) * 20));

  const requestSection = async () => {
    const res = await fetch(api);
    const body = await res.json();
    return body as {
      data: API.Section[];
      limit: number;
      offset: number;
      total: number;
    };
  };

  const requestGroup = async () => {
    const res = await fetch(`${PUBLIC_API_HOST}/api/group?limit=9999&createdByUserId=${session.user.id}`);
    const body = await res.json();
    return body as {
      data: API.Group[];
      limit: number;
      offset: number;
      total: number;
    };
  };

  const requestRoom = async () => {
    const res = await fetch(`${PUBLIC_API_HOST}/api/room?limit=9999`);
    const body = await res.json();
    return body as {
      data: API.Room[];
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

  const requestInstructor = async () => {
    const res = await fetch(`${PUBLIC_API_HOST}/api/instructor?limit=9999`);
    const body = await res.json();
    return body as {
      data: API.Instructor[];
      limit: number;
      offset: number;
      total: number;
    };
  };

  return {
    section: requestSection(),
    lazy: {
      group: requestGroup(),
      room: requestRoom(),
      subject: requestSubject(),
      instructor: requestInstructor(),
    },
  };
}) satisfies PageLoad;
