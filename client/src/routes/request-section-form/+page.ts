import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { PUBLIC_API_HOST } from '$env/static/public';

const api = new URL(`${PUBLIC_API_HOST}/api/request-section/check`);

export const load = (async ({ fetch, url }) => {
  const key = url.searchParams.get('key');

  if (key) {
    api.searchParams.set('key', key);
  } else {
    throw error(400, {
      message: 'Key is not provided.',
    });
  }

  const res = await fetch(api);
  const body = await res.json();

  if (body.data === null) {
    throw error(400, {
      message: 'No form found.',
    });
  }

  const instructor = async () => {
    const res = await fetch(`${PUBLIC_API_HOST}/api/instructor?limit=9999`);
    const body = await res.json();
    return body as {
      data: API.Instructor[];
      limit: number;
      offset: number;
      total: number;
    };
  };

  const subject = async () => {
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
    key: key,
    instructor: instructor(),
    subject: subject(),
  };
}) satisfies PageLoad;
