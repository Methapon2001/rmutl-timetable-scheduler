import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { PUBLIC_API_HOST } from '$env/static/public';

const apiSection = new URL(`${PUBLIC_API_HOST}/api/section`);
const apiGroup = new URL(`${PUBLIC_API_HOST}/api/group`);
const apiRoom = new URL(`${PUBLIC_API_HOST}/api/room`);
const apiSubject = new URL(`${PUBLIC_API_HOST}/api/subject`);
const apiInstructor = new URL(`${PUBLIC_API_HOST}/api/instructor`);

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:section');

  if (!session) throw error(401, { message: 'Unauthorized' });

  const page = url.searchParams.get('page');
  const search = url.searchParams.get('search');

  if (search && search.length > 0) {
    apiSection.searchParams.set('search', search);
  } else {
    apiSection.searchParams.delete('search');
  }

  apiSection.searchParams.set('limit', String(20));
  apiSection.searchParams.set('offset', String((+(page ?? 1) - 1) * 20));

  const requestSection = async () => {
    const res = await fetch(apiSection);
    const body = await res.json();
    return body as {
      data: API.Section[];
      limit: number;
      offset: number;
      total: number;
    };
  };

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

  const requestInstructor = async () => {
    const res = await fetch(apiInstructor);
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
